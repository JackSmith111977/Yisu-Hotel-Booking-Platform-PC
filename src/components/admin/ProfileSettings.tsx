"use client";

import { uploadUserAvatar } from "@/actions/user";
import getCroppedImg from "@/lib/cropImage";
import { useMessageStore } from "@/store/useMessageStore";
import { useUserStore } from "@/store/useUserStore";
import {
  Avatar,
  Button,
  Card,
  Descriptions,
  Divider,
  Form,
  Grid,
  Input,
  Modal,
  Slider,
  Tag,
  Space,
  Skeleton, // 引入 Skeleton
} from "@arco-design/web-react";
import Upload from "@arco-design/web-react/es/Upload";
import { IconCamera, IconUser, IconUndo } from "@arco-design/web-react/icon";
import Image from "next/image";
import { useEffect, useState } from "react";
import Cropper, { Area, Point } from "react-easy-crop";

// 定义表单值的类型
interface ProfileFormValues {
  nickname: string;
  phone: string;
  bio: string;
}

export default function ProfileSettings() {
  const [form] = Form.useForm<ProfileFormValues>();

  // Zustand 状态管理
  const { user, draftProfile, hasDraft, isLoading, fetchUser, updateUser, setDraft, clearDraft } =
    useUserStore();

  const showMessage = useMessageStore((status) => status.showMessage);

  // 本地状态管理 (图片裁剪相关)
  const [imgSrc, setImgSrc] = useState<string>("");
  const [cropperModalVisible, setCropperModalVisible] = useState<boolean>(false);
  const [uploading, setUploading] = useState<boolean>(false);
  const [avatarTs, setAvatarTs] = useState<number>(Date.now()); // 头像时间戳，用于清除缓存
  const [tempAvatarFile, setTempAvatarFile] = useState<Blob | null>(null); // 临时头像文件
  const [previewAvatarUrl, setPreviewAvatarUrl] = useState<string>(""); // 临时头像预览地址

  // --- React Easy Crop 状态 ---
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [containerHeight, setContainerHeight] = useState<number>(350); // 动态容器高度

  // 1. 初始化：组件挂载时获取最新用户数据
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // 2. 数据绑定：优先显示草稿，没有草稿则显示服务端数据
  useEffect(() => {
    // 只有在没有草稿或者 user 数据刚加载时才重置表单
    // 避免每次 typing 都触发 useEffect 导致重置
    const dataToDisplay = hasDraft && draftProfile ? draftProfile : user;

    if (dataToDisplay) {
      const currentValues = form.getFieldsValue();
      const newValues = {
        nickname: dataToDisplay.nickname || "",
        phone: dataToDisplay.phone || "",
        bio: dataToDisplay.bio || "",
      };

      // 只有当服务端数据或草稿数据确实发生变化（比如页面刷新、草稿清除）时才更新表单
      // 如果仅仅是用户在输入，hasDraft 变了，但我们不需要在这里 setFieldsValue，因为 input 已经是受控的了
      // 关键修正：移除不必要的自动同步，或者更严格地判断同步时机

      // 我们只在以下情况同步：
      // 1. 初始化时 (user 刚加载)
      // 2. 放弃更改后 (hasDraft 变为 false)
      // 3. 有草稿且与当前表单不一致时 (外部更新草稿)

      // 简化逻辑：直接对比所有字段，如果完全一致则不设置
      const isSame =
        currentValues.nickname === newValues.nickname &&
        currentValues.phone === newValues.phone &&
        currentValues.bio === newValues.bio;

      if (!isSame) {
        form.setFieldsValue(newValues);
      }
    }
  }, [user, hasDraft, draftProfile, form]); // 依赖项保持不变，靠内部逻辑判断

  // 3. 监听表单变更，实时更新草稿
  const handleValuesChange = (changedValues: Partial<ProfileFormValues>) => {
    // 只有当表单确实被用户修改时，才更新草稿
    // 避免因为 useEffect 初始化设置表单值而触发草稿更新
    setDraft(changedValues);
  };

  // 拦截文件上传
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      showMessage("error", "请上传图片文件");
      return false;
    }

    const isLt2mb = file.size / 1024 / 1024 < 2;
    if (!isLt2mb) {
      showMessage("error", "图片大小不能超过2MB");
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string") {
        const imageUrl = e.target.result;
        setImgSrc(imageUrl);
        setCropperModalVisible(true);
        setCrop({ x: 0, y: 0 });
        setZoom(1);

        // 动态计算容器高度
        const img = new window.Image();
        img.src = imageUrl;
        img.onload = () => {
          // 假设 Modal 内容区域宽度约为 550px (Modal 600px - padding)
          const contentWidth = 550;
          const aspectRatio = img.width / img.height;

          // 基础计算高度
          let height = contentWidth / aspectRatio;

          // 限制高度范围，防止太高(超过屏幕)或太矮(操作不便)
          // 最小高度 300px，最大高度 500px
          height = Math.max(300, Math.min(height, 500));

          setContainerHeight(height);
        };
      }
    };
    reader.onerror = () => {
      showMessage("error", "读取文件失败，请重试");
    };

    reader.readAsDataURL(file);
    return false;
  };

  const onCropComplete = (croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // 处理确认裁剪（改为暂存到本地状态，不直接上传）
  const handleConfirmCrop = async () => {
    if (!imgSrc || !croppedAreaPixels) return;

    try {
      const blob = await getCroppedImg(imgSrc, croppedAreaPixels);
      if (!blob) throw new Error("裁剪失败");

      // 生成预览 URL
      const previewUrl = URL.createObjectURL(blob);
      setPreviewAvatarUrl(previewUrl);
      setTempAvatarFile(blob);

      // 触发草稿状态更新
      // 这里我们需要一个特殊的标记来告诉 Store "头像变了"，但头像文件还没上传
      // 我们可以暂存一个临时标记在 draftProfile 里，或者仅仅触发 hasDraft
      // 为了简单起见，我们直接调用 setDraft 传入当前的表单值（实际上没有变），
      // 但我们需要一种方式让 UI 知道"有未保存的修改"
      // 更好的方式是：在 setDraft 里支持 avatar 字段（虽然它是 url string）
      // 这里我们先模拟一个 update，让 hasDraft 变 true
      setDraft({ ...form.getFieldsValue(), avatar: "pending_upload" });
      // 注意：avatar: "pending_upload" 只是一个占位符，用来触发 hasDraft
      // 真正的显示逻辑会优先使用 previewAvatarUrl

      showMessage("success", "头像已裁剪，请点击保存更改以生效");
      setCropperModalVisible(false);
      setImgSrc("");
    } catch (error: unknown) {
      console.error("头像处理失败:", error);
      showMessage("error", error instanceof Error ? error.message : "头像处理失败");
    }
  };

  // 提交表单
  const handleSave = async (values: ProfileFormValues) => {
    setUploading(true);
    try {
      // 1. 如果有新头像，先上传头像
      if (tempAvatarFile) {
        const formData = new FormData();
        formData.append("file", tempAvatarFile, "avatar.jpg");
        const uploadResult = await uploadUserAvatar(formData);

        if (!uploadResult.success || !uploadResult.avatarUrl) {
          throw new Error(uploadResult.message || "头像上传失败");
        }
      }

      // 2. 更新其他用户信息
      const result = await updateUser(values);

      if (result.success) {
        showMessage("success", "个人信息更新成功");

        // 清理临时状态
        setTempAvatarFile(null);
        if (previewAvatarUrl) {
          URL.revokeObjectURL(previewAvatarUrl);
          setPreviewAvatarUrl("");
        }

        // 刷新用户数据
        await fetchUser();
        setAvatarTs(Date.now());

        clearDraft();
      } else {
        showMessage("error", result.message || "个人信息更新失败");
      }
    } catch (error: unknown) {
      console.error("保存失败:", error);
      showMessage("error", error instanceof Error ? error.message : "保存失败");
    } finally {
      setUploading(false);
    }
  };

  // 状态管理：确认框可见性
  const [confirmVisible, setConfirmVisible] = useState(false);

  // 放弃修改
  const handleCancel = () => {
    setConfirmVisible(true);
  };

  const onConfirmCancel = () => {
    setConfirmVisible(false);
    clearDraft();

    // 清理临时头像
    setTempAvatarFile(null);
    if (previewAvatarUrl) {
      URL.revokeObjectURL(previewAvatarUrl);
      setPreviewAvatarUrl("");
    }

    if (user) {
      form.setFieldsValue({
        nickname: user.nickname,
        phone: user.phone || "",
        bio: user.bio || "",
      });
    }
    showMessage("info", "已恢复为最新保存的数据");
  };

  // 当前显示的数据对象（用于头像和状态展示）
  // 优先显示临时预览头像，其次是草稿/用户头像
  const displayUser = hasDraft && draftProfile ? { ...user, ...draftProfile } : user;
  const avatarSrc =
    previewAvatarUrl || (displayUser?.avatar ? `${displayUser.avatar}?t=${avatarTs}` : "");

  // 骨架屏加载状态
  if (!user && isLoading) {
    return (
      <div className="w-full">
        <Grid.Row gutter={24}>
          <Grid.Col span={16}>
            <Card title="基本资料" bordered={false} className="h-full">
              <Skeleton loading animation>
                <div className="flex flex-col gap-6 p-4">
                  <div>
                    <div className="mb-2 h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-9 w-full rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div>
                    <div className="mb-2 h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-9 w-full rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div>
                    <div className="mb-2 h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-32 w-full rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div className="mt-4 flex gap-4">
                    <div className="h-9 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>
              </Skeleton>
            </Card>
          </Grid.Col>
          <Grid.Col span={8}>
            <Card title="头像与状态" bordered={false} className="h-full">
              <Skeleton loading animation>
                <div className="flex flex-col items-center py-6">
                  <div className="mb-4 h-25 w-25 rounded-full bg-gray-200 dark:bg-gray-700" />
                  <div className="mb-2 h-6 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-4 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
                <Divider />
                <div className="space-y-4 px-4">
                  <div className="flex justify-between">
                    <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-5 w-32 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-5 w-12 rounded bg-green-100 dark:bg-green-900" />
                  </div>
                  <div className="flex justify-between">
                    <div className="h-5 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-5 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                  </div>
                </div>
              </Skeleton>
            </Card>
          </Grid.Col>
        </Grid.Row>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Grid.Row gutter={24}>
        {/* 左侧：表单区域 */}
        <Grid.Col span={16}>
          <Card
            title={
              <div className="flex items-center justify-between">
                <span>基本资料</span>
                {hasDraft && (
                  <Tag color="orange" bordered>
                    有未保存的修改
                  </Tag>
                )}
              </div>
            }
            bordered={false}
            className="h-full"
          >
            <Form<ProfileFormValues>
              form={form}
              onSubmit={handleSave}
              onValuesChange={handleValuesChange}
              layout="vertical"
              className="max-w-lg"
            >
              <Form.Item
                label="昵称"
                field="nickname"
                rules={[
                  { required: true, message: "请输入昵称" },
                  { min: 2, max: 20, message: "昵称长度需在 2 到 20 个字符之间" },
                  {
                    match: /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
                    message: "昵称只能包含中文、英文、数字和下划线",
                  },
                ]}
              >
                <Input placeholder="请输入昵称" maxLength={20} showWordLimit />
              </Form.Item>
              <Form.Item
                label="手机号"
                field="phone"
                rules={[{ match: /^1[3-9]\d{9}$/, message: "请输入有效的手机号码" }]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>
              <Form.Item
                label="个人简介"
                field="bio"
                rules={[{ maxLength: 200, message: "个人简介不能超过 200 个字符" }]}
              >
                <Input.TextArea
                  placeholder="介绍一下你自己..."
                  rows={4}
                  maxLength={200}
                  showWordLimit
                />
              </Form.Item>
              <Form.Item className="pt-4">
                <Space>
                  <Button type="primary" htmlType="submit" loading={isLoading}>
                    保存更改
                  </Button>
                  {hasDraft && (
                    <Button onClick={handleCancel} icon={<IconUndo />}>
                      放弃修改
                    </Button>
                  )}
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Grid.Col>

        {/* 右侧：头像与账户信息 */}
        <Grid.Col span={8}>
          <Card title="头像与状态" bordered={false} className="h-full">
            <div className="flex flex-col items-center py-6">
              {/* Upload 组件可能会生成额外的包裹层，需要确保它不破坏布局 */}
              <Upload
                showUploadList={false}
                beforeUpload={beforeUpload}
                accept="image/*"
                // 关键修改：让 Upload 组件渲染为一个简单的 div，不带额外样式干扰
                // 或者确保它的 children 能正确撑开
              >
                {/* 
                  头像容器：
                  - group: 用于 hover 效果
                  - relative: 用于定位遮罩层
                  - w-[100px] h-[100px]: 强制固定尺寸
                  - shrink-0: 防止被父容器压缩
                  - rounded-full: 圆形
                  - overflow-hidden: 裁剪溢出内容
                  - z-0: 确保层级正确
                */}
                <div
                  className="group relative cursor-pointer overflow-hidden rounded-full border border-gray-200 shadow-sm"
                  style={{ width: 100, height: 100, position: "relative", borderRadius: "50%" }} // 强制 borderRadius
                >
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt="avatar"
                      fill
                      sizes="100px"
                      className="object-cover"
                      unoptimized
                      style={{ objectFit: "cover" }} // 双重保险：强制 object-cover
                    />
                  ) : (
                    <Avatar size={100} className="bg-blue-500">
                      <IconUser style={{ fontSize: 40 }} />
                    </Avatar>
                  )}

                  {/* 悬停遮罩层 */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconCamera className="text-2xl text-white" />
                  </div>
                </div>
              </Upload>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {displayUser?.nickname || displayUser?.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {displayUser?.role === "admin" ? "系统管理员" : "普通用户"}
                </p>
              </div>
            </div>
            <Divider />
            <Descriptions
              column={1}
              data={[
                {
                  label: "用户ID",
                  value: <span className="text-gray-500">{displayUser?.id}</span>,
                },
                { label: "账号状态", value: <Tag color="green">正常</Tag> },
                {
                  label: "手机号",
                  value: displayUser?.phone || <span className="text-gray-400">未填写</span>,
                },
                {
                  label: "个人简介",
                  value: (
                    <span
                      className="text-gray-600 dark:text-gray-300"
                      title={displayUser?.bio}
                      style={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {displayUser?.bio || "暂无简介"}
                    </span>
                  ),
                },
                { label: "注册时间", value: "2024-01-01" },
              ]}
              labelStyle={{ width: 80 }}
            />
          </Card>
        </Grid.Col>
      </Grid.Row>

      {/* 裁剪弹窗 */}
      <Modal
        title="裁剪头像"
        visible={cropperModalVisible}
        onOk={handleConfirmCrop}
        onCancel={() => {
          setCropperModalVisible(false);
          setImgSrc("");
        }}
        okText="确认并上传"
        cancelText="取消"
        confirmLoading={uploading}
        unmountOnExit
        style={{ width: 600 }}
      >
        <div className="flex flex-col gap-6">
          {/* 动态高度容器 */}
          <div
            className="relative w-full overflow-hidden rounded-md bg-black"
            style={{ height: containerHeight }}
          >
            {imgSrc && (
              <Cropper
                image={imgSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                objectFit="horizontal-cover"
                // 核心修改：将 restrictPosition 改回 true
                // true = 强制图片必须填满裁剪框（不能出现黑边）
                // false = 允许图片任意拖动（可能出现黑边）
                restrictPosition={true}
                // 核心修改：设置裁剪框大小
                // 通过 cropSize 可以直接指定裁剪框的宽高
                // 我们根据 containerHeight 动态计算，使其占据高度的 75%
                cropSize={{ width: containerHeight * 0.75, height: containerHeight * 0.75 }}
              />
            )}
          </div>

          <div className="flex items-center gap-4 px-4 pb-2">
            <span className="text-sm whitespace-nowrap text-gray-500">缩放</span>
            <Slider
              value={zoom}
              min={1}
              max={3}
              step={0.1}
              onChange={(val: number | number[]) => setZoom(val as number)}
              style={{ flex: 1 }}
            />
          </div>
        </div>
      </Modal>
      {/* 放弃修改确认框 */}
      <Modal
        title="确认放弃修改？"
        visible={confirmVisible}
        onOk={onConfirmCancel}
        onCancel={() => setConfirmVisible(false)}
        okText="确认"
        cancelText="取消"
      >
        <p>当前未保存的内容将丢失，是否继续？</p>
      </Modal>
    </div>
  );
}
