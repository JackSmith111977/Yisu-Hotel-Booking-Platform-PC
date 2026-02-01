import { HotelInformation } from "@/types/HotelInformation";
import {
  Button,
  Descriptions,
  Divider,
  Drawer,
  Image,
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

export default function AuditDrawer({
  visible,
  data,
  onClose,
  onApprove,
  onReject,
}: AuditDrawerProps) {
  if (!data) return null;

  const isPending = data.status === "pending";
  return (
    // 审核抽屉
    <Drawer title={data?.name} visible={visible} onCancel={onClose} footer={null}>
      <Space direction="vertical">
        {/* 基础信息 */}
        <Descriptions
          column={1}
          title="基础信息"
          data={[
            { label: "提交商户", value: data?.merchant },
            { label: "酒店名称", value: data?.name },
            { label: "提交时间", value: data?.submitTime },
          ]}
        />

        <Divider style={{ margin: "12px 0" }} />

        {/* 图片预览 */}
        <div>
          <Typography.Title heading={6}>图片预览</Typography.Title>
          <Image.PreviewGroup>
            <Space wrap>
              {data && data.images.length > 0 ? (
                data?.images.map((image, index) => (
                  <Image
                    key={index}
                    src={image}
                    width={100}
                    height={100}
                    style={{ objectFit: "cover" }}
                    alt={`hotel_image-${index}`}
                  />
                ))
              ) : (
                <span style={{ color: "#999", padding: 10 }}>暂无图片</span>
              )}
            </Space>
          </Image.PreviewGroup>
        </div>

        <Divider style={{ margin: "12px 0" }} />

        {/* 设施信息 */}
        <div>
          <Typography.Title heading={6}>设施信息</Typography.Title>
          <Space wrap>
            {data &&
              data.amenities.length > 0 &&
              data.amenities.map((amenity, index) => <Tag key={index}>{amenity}</Tag>)}
          </Space>
        </div>

        {/* 操作按钮 */}
        {isPending && (
          <Space
            wrap
            style={{
              position: "absolute",
              bottom: 0,
            }}
          >
            <Button status="danger" onClick={onReject} icon={<IconClose />}>
              驳回申请
            </Button>
            <Button type="primary" status="success" onClick={onApprove} icon={<IconCheck />}>
              通过审核
            </Button>
          </Space>
        )}
      </Space>
    </Drawer>
  );
}
