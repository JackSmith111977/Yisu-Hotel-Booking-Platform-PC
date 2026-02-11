"use client";
import { MineHotelInformationType } from "@/types/HotelInformation";
import {
  Descriptions,
  Divider,
  Drawer,
  Image,
  Rate,
  Space,
  Tag,
  Typography,
} from "@arco-design/web-react";
import dayjs from 'dayjs';
import { memo } from "react";

interface HotelDrawerProps {
  visible: boolean;
  data: MineHotelInformationType | null;
  onClose: () => void;
  onApprove?: () => void;
  onReject?: () => void;
}



const HotelDrawer = memo(function HotelDrawer({ visible, data, onClose}: HotelDrawerProps) {
  if (!data) return null;

  // 处理 images 字段（可能是字符串或 JSON 字符串）
  const images: string[] = (() => {
    if (!data.images) return [];
    try {
      const parsed = JSON.parse(data.images as unknown as string);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch (e) {
      // not JSON
    }
    return [data.images as string];
  })();

  return (
    <Drawer
      title={
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>{data.name_zh}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {data.name_en}
          </Typography.Text>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      width={480}
    >
      <Space direction="vertical">
        {images && images.length > 0 ? (
          <div style={{ width: "100%", height: 200, overflow: "hidden", borderRadius: 4 }}>
            <Image
              src={images[0]}
              alt="Cover"
              width="100%"
              height={200}
              style={{ objectFit: "cover" }}
            />
          </div>
        ) : (
          <Typography.Text type="secondary">暂无封面图</Typography.Text>
        )}

        <Descriptions
          column={1}
          title="基本信息"
          data={[
            { label: "酒店ID", value: data.id },
            { label: "更新时间", value: data? dayjs(data.updated_at).format('YYYY-MM-DD HH:mm:ss') : '-'},
            {
              label: "当前状态",
              value: <Tag color={data.status === "approved" ? "green" : "red"}>{data.status}</Tag>,
            },
          ]}
        />

        <Divider style={{ margin: "12px 0" }} />

        <Descriptions
          column={1}
          title="酒店详情"
          labelStyle={{ width: 100, color: "var(--color-text-3)" }}
          data={[
            {
              label: "星级标准",
              value: <Rate readonly defaultValue={data.star_rating} style={{ fontSize: 14 }} />,
            },
            { label: "联系电话", value: data.contact_phone },
            { label: "开业日期", value: data.opening_date },
            { label: "详细地址", value: `${JSON.parse(data.region || '[]')?.filter((item: string) => item !== '市辖区').join('') || ''}${data.address || ''}` },
          ]}
        />

        <Divider style={{ margin: "12px 0" }} />

        <div>
          <Typography.Title heading={6} style={{ marginTop: 0 }}>
            图集预览
          </Typography.Title>
          <Image.PreviewGroup>
            <Space wrap>
              {images && images.length > 0 ? (
                images.map((img, idx) => (
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
})

export default HotelDrawer;