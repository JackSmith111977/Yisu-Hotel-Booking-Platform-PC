"use client";
import { MineHotelInformationType } from "@/types/HotelInformation";
import {
  Collapse,
  Descriptions,
  Divider,
  Drawer,
  Image,
  Rate,
  Space,
  Tag,
  Typography,
} from "@arco-design/web-react";
import dayjs from "dayjs";
import { memo } from "react";

interface HotelDrawerProps {
  visible: boolean;
  data: MineHotelInformationType | null;
  onClose: () => void;
}

const ImageErrorPlaceholder = ({ fontSize = 14 }: { fontSize?: number }) => (
  <div
    style={{
      width: "100%",
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "var(--color-fill-2)",
      color: "var(--color-text-3)",
      fontSize,
    }}
  >
    图片加载失败
  </div>
);

const HotelDrawer = memo(function HotelDrawer({
  visible,
  data,
  onClose,
}: HotelDrawerProps) {
  if (!data) return null;

  const coverImage = data.image;
  const images = data.album || [];
  const roomTypes = data.room_types || [];

  return (
    <Drawer
      title={
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Typography.Text style={{ fontSize: 16, fontWeight: 600 }}>
            {data.name_zh}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {data.name_en}
          </Typography.Text>
        </div>
      }
      visible={visible}
      onCancel={onClose}
      width={480}
      okButtonProps={{ style: { display: "none" } }}
    >
      <Space direction="vertical" style={{ width: "100%" }}>
        {/* 封面图 */}
        {coverImage ? (
          <div style={{ width: "100%", height: 200, overflow: "hidden", borderRadius: 4 }}>
            <Image
              src={coverImage}
              alt="Cover"
              width="100%"
              height={200}
              style={{ objectFit: "cover" }}
              error={<ImageErrorPlaceholder />}
            />
          </div>
        ) : (
          <Typography.Text type="secondary">暂无封面图</Typography.Text>
        )}

        {/* 基本信息 */}
        <Descriptions
          column={1}
          title="基本信息"
          data={[
            { label: "酒店ID", value: data.id },
            {
              label: "更新时间",
              value: dayjs(data.updated_at).format("YYYY-MM-DD HH:mm:ss"),
            },
            {
              label: "当前状态",
              value: (
                <Tag color={data.status === "approved" ? "green" : "red"}>
                  {data.status}
                </Tag>
              ),
            },
          ]}
        />

        <Divider style={{ margin: "12px 0" }} />

        {/* 酒店详情 */}
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
            {
              label: "详细地址",
              value: `${
                JSON.parse(data.region || "[]")
                  ?.filter((item: string) => item !== "市辖区")
                  .join("") || ""
              }${data.address || ""}`,
            },
          ]}
        />

        <Divider style={{ margin: "12px 0" }} />

        {/* 房型信息 */}
        <div>
          <Typography.Title heading={6} style={{ marginTop: 0, marginBottom: 12 }}>
            房型信息
          </Typography.Title>
          {roomTypes.length > 0 ? (
            <Collapse defaultActiveKey={["room_list"]} style={{ borderRadius: 4 }}>
              <Collapse.Item header={`房型列表(${roomTypes.length})`} name="room_list">
                <Collapse accordion>
                  {roomTypes.map((room) => (
                    <Collapse.Item
                      key={room.id}
                      name={room.id}
                      header={
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            paddingRight: 16,
                          }}
                        >
                          <span>{room.name}</span>
                          <span style={{ color: "var(--color-text-3)" }}>¥{room.price}</span>
                        </div>
                      }
                    >
                      <Descriptions
                        column={1}
                        labelStyle={{ width: 80 }}
                        data={[
                          { label: "价格", value: `¥${room.price}` },
                          { label: "面积", value: `${room.size} m²` },
                          {
                            label: "最大入住",
                            value: room.max_guests ? `${room.max_guests} 人` : "-",
                          },
                          {
                            label: "床型",
                            value: room.beds?.map((b) => `${b.type}*${b.count}`).join(", ") || "-",
                          },
                          { label: "描述", value: room.description || "暂无描述" },
                        ]}
                      />
                      {room.images && room.images.length > 0 && (
                        <div style={{ marginTop: 12 }}>
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: 12, marginBottom: 8, display: "block" }}
                          >
                            房型图集
                          </Typography.Text>
                          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                            <Image.PreviewGroup>
                              {room.images.map((img, index) => (
                                <Image
                                  key={index}
                                  src={img}
                                  width={80}
                                  height={60}
                                  alt={room.name}
                                  style={{ borderRadius: 4, objectFit: "cover" }}
                                  error={<ImageErrorPlaceholder fontSize={12} />}
                                />
                              ))}
                            </Image.PreviewGroup>
                          </div>
                        </div>
                      )}
                    </Collapse.Item>
                  ))}
                </Collapse>
              </Collapse.Item>
            </Collapse>
          ) : (
            <Typography.Text type="secondary">暂无房型信息</Typography.Text>
          )}
        </div>

        <Divider style={{ margin: "12px 0" }} />

        {/* 图集预览 */}
        <div>
          <Typography.Title heading={6} style={{ marginTop: 0 }}>
            图集预览
          </Typography.Title>
          <Image.PreviewGroup>
            <Space wrap>
              {images.length > 0 ? (
                images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    width={100}
                    height={80}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                    alt={`image-${idx}`}
                    error={<ImageErrorPlaceholder fontSize={12} />}
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
});

export default HotelDrawer;