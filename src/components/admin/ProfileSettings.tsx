"use client";

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
  Tag,
} from "@arco-design/web-react";
import Upload, { RequestOptions } from "@arco-design/web-react/es/Upload";
import { IconCamera, IconUser } from "@arco-design/web-react/icon";
import Image from "next/image";
import { useEffect } from "react";

// 定义表单值的类型
interface ProfileFormValues {
  nickname: string;
  phone: string;
  bio: string;
}

interface UploadResponse {
  url: string;
  status: number;
}

export default function ProfileSettings() {
  const [form] = Form.useForm<ProfileFormValues>();
  const user = useUserStore((status) => status.user);
  const isLoading = useUserStore((status) => status.isLoading);
  const updateUser = useUserStore((status) => status.updateUser);
  const showMessage = useMessageStore((status) => status.showMessage);

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        nickname: user.nickname,
        phone: user.phone,
        bio: user.bio,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: ProfileFormValues) => {
    try {
      await updateUser(values);
      showMessage("success", "个人信息更新成功");
    } catch (error: unknown) {
      console.error("更新个人信息失败:", error);
      showMessage("error", "更新个人信息失败");
    }
  };

  // Mock 上传逻辑
  const customRequest = (option: RequestOptions) => {
    const { onProgress, onError, onSuccess } = option;

    // 模拟上传进度
    let percent = 0;
    const interval = setInterval(() => {
      percent += 20;
      if (percent > 100) {
        clearInterval(interval);
        // 模拟成功返回
        const mockUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;
        if (onSuccess) {
          onSuccess({
            url: mockUrl,
            status: 200,
            statusText: "OK",
          });
        }
        if (onError) {
          onError(new Error("上传失败"));
        }
      } else {
        if (onProgress) {
          onProgress(percent, new ProgressEvent("progress"));
        }
      }
    }, 200);

    // 返回一个清理函数（虽然在这个简单Mock中用处不大，但符合类型定义）
    return {
      abort: () => {
        clearInterval(interval);
      },
    };
  };

  return (
    <div className="w-full">
      <Grid.Row gutter={24}>
        {/* 左侧：表单区域 */}
        <Grid.Col span={16}>
          <Card title="基本资料" bordered={false} className="h-full">
            <Form<ProfileFormValues>
              form={form}
              onSubmit={handleSubmit}
              layout="vertical"
              className="max-w-lg" // 限制表单最大宽度，防止拉太长
            >
              <Form.Item
                label="昵称"
                field="nickname"
                rules={[{ required: true, message: "请输入昵称" }]}
              >
                <Input placeholder="请输入昵称" maxLength={20} showWordLimit />
              </Form.Item>

              <Form.Item label="手机号" field="phone">
                <Input placeholder="请输入手机号" />
              </Form.Item>

              <Form.Item label="个人简介" field="bio">
                <Input.TextArea
                  placeholder="介绍一下你自己..."
                  rows={4}
                  maxLength={200}
                  showWordLimit
                />
              </Form.Item>

              <Form.Item className="pt-4">
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  保存更改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Grid.Col>

        {/* 右侧：头像与账户信息 */}
        <Grid.Col span={8}>
          <Card title="头像与状态" bordered={false} className="h-full">
            <div className="flex flex-col items-center py-6">
              <Upload
                showUploadList={false}
                customRequest={customRequest}
                onChange={(fileList, file) => {
                  if (file.status === "done" && file.response) {
                    const response = file.response as UploadResponse;
                    updateUser({ avatar: response.url });
                    showMessage("success", "头像更新成功");
                  }
                }}
              >
                <div className="group relative cursor-pointer">
                  <Avatar size={100} className="bg-blue-500">
                    {user?.avatar ? (
                      <Image
                        src={user.avatar}
                        alt="avatar"
                        width={100}
                        height={100}
                        className="object-cover"
                      />
                    ) : (
                      <IconUser style={{ fontSize: 40 }} />
                    )}
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                    <IconCamera className="text-2xl text-white" />
                  </div>
                </div>
              </Upload>

              <div className="mt-4 text-center">
                <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                  {user?.nickname || user?.username}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role === "admin" ? "系统管理员" : "普通用户"}
                </p>
              </div>
            </div>

            <Divider />

            <Descriptions
              column={1}
              data={[
                {
                  label: "用户ID",
                  value: <span className="text-gray-500">{user?.id}</span>,
                },
                {
                  label: "账号状态",
                  value: <Tag color="green">正常</Tag>,
                },
                {
                  label: "注册时间",
                  value: "2024-01-01", // 这里可以用 user.createdAt
                },
              ]}
              labelStyle={{ width: 80 }}
            />
          </Card>
        </Grid.Col>
      </Grid.Row>
    </div>
  );
}
