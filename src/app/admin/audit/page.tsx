"use client";
import { fetchHotelsList } from "@/actions/admin_service";
import AuditDrawer from "@/components/admin/AuditDrawer";
import AuditTable from "@/components/admin/AuditTable";
import RejectModal from "@/components/admin/RejectModal";
import { useMessageStore } from "@/store/useMessageStore";
import { HotelInformation } from "@/types/HotelInformation";
import { Button, Card } from "@arco-design/web-react";
import { IconRefresh } from "@arco-design/web-react/icon";
import { useEffect, useState } from "react";

/**
 *
 * @returns 酒店审核页面
 */
export default function Home() {
  // 数据源
  const [data, setData] = useState<HotelInformation[]>([]);

  // 表格加载状态
  const [loading, setLoading] = useState(false);

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
   * 获取酒店列表逻辑
   */
  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchHotelsList();
      setData(res);
    } catch (error: unknown) {
      console.log("获取酒店列表失败", error);
      showMessage("error", error instanceof Error ? error.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 页面加载时获取数据
   */
  useEffect(() => {
    loadData();
  }, []);

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
   * 刷新逻辑
   */
  const handleRefresh = () => {
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
      console.log(`驳回${curRecord?.nameZh}的请求，原因是：${reason}`);
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
        overflow: "auto",
        // borderRadius: 8,
      }}
      extra={
        <Button icon={<IconRefresh />} onClick={handleRefresh}>
          刷新列表
        </Button>
      }
    >
      {/* 酒店信息展示表格 */}
      <AuditTable data={data} onView={handleOpenDrawer} isLoading={loading} />

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
