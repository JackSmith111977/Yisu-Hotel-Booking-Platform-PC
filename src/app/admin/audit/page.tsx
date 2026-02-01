"use client";
import AuditDrawer from "@/components/admin/AuditDrawer";
import AuditTable from "@/components/admin/AuditTable";
import RejectModal from "@/components/admin/RejectModal";
import { useMessageStore } from "@/store/useMessageStore";
import { HotelInformation } from "@/types/HotelInformation";
import { Button, Card, Message } from "@arco-design/web-react";
import { IconRefresh } from "@arco-design/web-react/icon";
import { useState } from "react";

// 模拟数据源 (实际开发中替换为 API 调用)
const MOCK_DATA: HotelInformation[] = [
  {
    id: "1001",
    name: "上海半岛酒店",
    merchant: "Peninsula Group",
    submitTime: "2024-05-20 10:30",
    status: "pending",
    address: "上海市黄浦区中山东一路32号",
    description: "位于外滩...",
    images: [
      "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp",
    ],
    amenities: ["免费WiFi", "游泳池"],
  },
  {
    id: "1002",
    name: "北京王府井希尔顿",
    merchant: "Hilton Inc.",
    submitTime: "2024-05-19 14:20",
    status: "approved",
    address: "北京市东城区...",
    description: "繁华商圈...",
    images: [],
    amenities: ["停车场"],
  },
];

/**
 *
 * @returns 酒店审核页面
 */
export default function Home() {
  // 数据源
  const [data, setData] = useState<HotelInformation[]>(MOCK_DATA);

  // 抽屉可见性
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 驳回对话框可见性
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  // 驳回对话框加载状态
  const [submitting, setSubmitting] = useState(false);

  // 当前记录行
  const [curRecord, setCurRecord] = useState<HotelInformation | null>(null);

  // 获取全局消息订阅
  const showMessage = useMessageStore((state) => state.showMessage);

  /**
   * 打开抽屉逻辑
   * @param record 点击按钮所在的记录行
   */
  const handleOpenDrawer = (record: HotelInformation) => {
    setCurRecord(record);
    setDrawerVisible(true);
    // TODO: 调用 API
  };

  /**
   * 审核通过逻辑
   */
  const handleApprove = () => {
    showMessage("success", "审核通过");
    setDrawerVisible(false);
    // 更新本地数据
    setData((prev) =>
      prev.map((item) => (item.id === curRecord?.id ? { ...item, status: "approved" } : item))
    );
    // TODO: 调用 API
  };

  /**
   * 驳回逻辑
   */
  const handleReject = () => {
    setRejectModalVisible(true);
  };

  /**
   * 驳回确认逻辑
   */
  const handleRejectConfirm = (reason: string) => {
    setSubmitting(true);

    // 模拟耗时请求
    setTimeout(() => {
      console.log(`驳回${curRecord?.name}的请求，原因是：${reason}`);
      // 更新本地数据
      setData((prev) =>
        prev.map((item) => (item.id === curRecord?.id ? { ...item, status: "rejected" } : item))
      );
      showMessage("success", "驳回成功");

      // 关闭所有弹窗
      setSubmitting(false);
      setRejectModalVisible(false);
      setDrawerVisible(false);
    }, 1000);
  };

  return (
    <Card
      title="信息审核"
      style={{
        height: "100%",
        // borderRadius: 8,
      }}
      extra={<Button icon={<IconRefresh />}>刷新列表</Button>}
    >
      {/* 酒店信息展示表格 */}
      <AuditTable data={data} onView={handleOpenDrawer} />

      {/* 酒店详细审核页 */}
      <AuditDrawer
        visible={drawerVisible}
        data={curRecord}
        onClose={() => setDrawerVisible(false)}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* 驳回确认对话框 */}
      <RejectModal
        visible={rejectModalVisible}
        loading={submitting}
        onCancel={() => setRejectModalVisible(false)}
        onConfirm={handleRejectConfirm}
      />
    </Card>
  );
}
