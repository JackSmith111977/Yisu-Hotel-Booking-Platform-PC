import { HotelInformation, HotelRoomTypesForAdmin } from "@/types/HotelInformation";
import {
  Alert,
  Button,
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
  roomTypes?: HotelRoomTypesForAdmin[];
  loadingRoomTypes?: boolean;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export default function AuditDrawer({
  visible,
  data,
  roomTypes = [],
  loadingRoomTypes = false,
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
        {/* 新增：驳回理由展示 - 放在最顶部 */}
        {data.rejectedReason && (
          <Alert
            type="warning"
            title="上一次驳回原因"
            content={data.rejectedReason}
            style={{ marginBottom: 12 }}
          />
        )}
        {/* 新增：封面图展示 */}
        {hasCoverImage ? (
          <div style={{ width: "100%", height: 300, overflow: "hidden", borderRadius: 4 }}>
            <Image
              src={data.coverImage}
              alt="Cover"
              width={400}
              height={300}
              style={{ objectFit: "cover" }}
              error={
                <div
                  style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "var(--color-fill-2)",
                    color: "var(--color-text-3)",
                  }}
                >
                  图片加载失败
                </div>
              }
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

        {/* 房型信息 */}
        <div>
          <Typography.Title heading={6} style={{ marginTop: 0, marginBottom: 12 }}>
            房型信息
          </Typography.Title>

          {loadingRoomTypes ? (
            <Typography.Text type="secondary">加载中...</Typography.Text>
          ) : roomTypes && roomTypes.length > 0 ? (
            // 折叠
            <Collapse defaultActiveKey={["room_list"]} style={{ borderRadius: 4 }}>
              {/* 外层折叠 */}
              <Collapse.Item header={`房型列表(${roomTypes.length})`} name="room_list">
                {/* 内层折叠 */}
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
                          { label: "数量", value: room.quantity },
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
                                  error={
                                    <div
                                      style={{
                                        width: "100%",
                                        height: "100%",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "var(--color-fill-2)",
                                        color: "var(--color-text-3)",
                                        fontSize: 12,
                                      }}
                                    >
                                      失效
                                    </div>
                                  }
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
              {data.images && data.images.length > 0 ? (
                data.images.map((img, idx) => (
                  <Image
                    key={idx}
                    src={img}
                    width={100}
                    height={75}
                    style={{ objectFit: "cover", borderRadius: 4 }}
                    alt={`image-${idx}`}
                    error={
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          backgroundColor: "var(--color-fill-2)",
                          color: "var(--color-text-3)",
                          fontSize: 12,
                        }}
                      >
                        失效
                      </div>
                    }
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
