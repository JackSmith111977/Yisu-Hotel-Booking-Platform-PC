import { HotelInformation } from "@/types/HotelInformation";
import {
  Button,
  Descriptions,
  Divider,
  Drawer,
  Image,
  Rate,
  Space,
  Tag,
  Typography,
} from "@arco-design/web-react";
import { IconCheck, IconClose } from "@arco-design/web-react/icon";
/**
 * 审核抽屉
 * @param visible 抽屉是否可见
 * @param data 待审核酒店信息
 * @param onClose 抽屉关闭回调
 * @param onApprove 通过酒店信息
 * @param onReject 拒绝酒店信息
 */
interface AuditDrawerProps {
  visible: boolean;
  data: HotelInformation | null;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}
// TODO: 添加房型信息
// TODO: 添加驳回理由信息
export default function AuditDrawer({
  visible,
  data,
  onClose,
  onApprove,
  onReject,
}: AuditDrawerProps) {
  if (!data) return null;

  const isPending = data.status === "pending";
  const hasCoverImage = data.coverImage;

  // 定义底部按钮节点
  const footerNode = (
    <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
      <Button status="danger" onClick={onReject} icon={<IconClose />}>
        驳回申请
      </Button>
      <Button type="primary" status="success" onClick={onApprove} icon={<IconCheck />}>
        通过审核
      </Button>
    </div>
  );

  return (
    // 审核抽屉
    <Drawer
      title={
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>{data.nameZh}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {data.nameEn}
          </Typography.Text>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      footer={isPending ? footerNode : null}
      width={480}
    >
      <Space direction="vertical">
        {/* 新增：封面图展示 */}
        {hasCoverImage ? (
          <div style={{ width: "100%", height: 200, overflow: "hidden", borderRadius: 4 }}>
            <Image
              src={data.coverImage}
              alt="Cover"
              width="100%"
              height={200}
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : (
          <Typography.Text type="secondary">暂无封面图</Typography.Text>
        )}

        {/* 基础信息 */}
        <Descriptions
          column={1}
          title="注册信息"
          data={[
            { label: "酒店ID", value: data?.id },
            { label: "商户ID", value: data?.merchantId },
            { label: "更新时间", value: new Date(data.updatedAt).toLocaleString() },
            {
              label: "当前状态",
              value: <Tag color={data.status === "approved" ? "green" : "red"}>{data.status}</Tag>,
            },
          ]}
        />

        <Divider style={{ margin: "12px 0" }} />

        {/* 详细属性 (星级、电话、开业时间) */}
        <Descriptions
          column={1}
          title="酒店详情"
          labelStyle={{ width: 100, color: "var(--color-text-3)" }}
          data={[
            {
              label: "星级标准",
              value: <Rate readonly defaultValue={data.starRating} style={{ fontSize: 14 }} />,
            },
            { label: "联系电话", value: data.contactPhone },
            { label: "开业日期", value: data.openingDate },
            { label: "详细地址", value: data.address },
          ]}
        />

        <Divider style={{ margin: "12px 0" }} />

        {/* 图集预览 */}
        <div>
          <Typography.Title heading={6} style={{ marginTop: 0 }}>
            图集预览
          </Typography.Title>
          <Image.PreviewGroup>
            <Space wrap>
              {data.images && data.images.length > 0 ? (
                data.images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    width={100}
                    height={80}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                    alt={`image-${idx}`}
                  />
                ))
              ) : (
                <Typography.Text type="secondary">暂无更多图片</Typography.Text>
              )}
            </Space>
          </Image.PreviewGroup>
        </div>
      </Space>
    </Drawer>
  );
}
