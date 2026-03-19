"use client";

import {
  approveHotel,
  fetchHotelRoomTypes,
  fetchHotelsList,
  rejectHotel,
} from "@/actions/admin_service";
import AuditDrawer from "@/components/admin/AuditDrawer";
import AuditTable from "@/components/admin/AuditTable";
import RejectModal from "@/components/admin/RejectModal";
import { useMessageStore } from "@/store/useMessageStore";
import { HotelInformation, HotelRoomTypesForAdmin } from "@/types/HotelInformation";
import { Badge, Button, Card, Tabs } from "@arco-design/web-react";
import { IconRefresh } from "@arco-design/web-react/icon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

// TODO 可能优化：批量操作支持
// TODO 可能优化：操作历史记录
// TODO 可能优化：创建统一的错误处理逻辑
// TODO 可能优化：添加快捷键支持

// TODO 使用动态路由，支持查看酒店详细页

/**
 * AuditView 组件 - 酒店审核页面的客户端逻辑视图
 * 负责处理酒店列表的获取、审核通过、审核驳回等交互
 */
export default function AuditView() {
  // 数据源：存储所有酒店信息
  const [data, setData] = useState<HotelInformation[]>([]);

  // 表格加载状态：用于列表刷新和初次加载时的 Loading
  const [loading, setLoading] = useState(false);

  // 抽屉可见性：控制详情抽屉的显示隐藏
  const [drawerVisible, setDrawerVisible] = useState(false);

  // 驳回对话框可见性：控制填写驳回理由弹窗的显示隐藏
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  // 提交状态：处理审核通过/驳回 API 调用时的加载状态
  const [submitting, setSubmitting] = useState(false);

  // 当前操作的记录：存储当前点击详情或进行审核操作的酒店对象
  const [curRecord, setCurRecord] = useState<HotelInformation | null>(null);

  // 获取全局消息订阅：从 zustand store 中获取 showMessage 方法
  const showMessage = useMessageStore((state) => state.showMessage);

  // tab 状态：控制“待审核”与“已处理”标签页的切换
  const [activeTab, setActiveTab] = useState("pending");

  // 房型数据状态：存储当前查看酒店的房型列表
  const [roomTypes, setRoomTypes] = useState<HotelRoomTypesForAdmin[]>([]);

  // 房型加载状态：获取房型信息时的 Loading
  const [roomTypesLoading, setRoomTypesLoading] = useState(false);

  // 获取 URL 参数：Next.js 客户端 Hook
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * 处理标签页切换
   * 1. 调用 setActiveTab 立即更新本地状态，保证 UI 切换无延迟
   * 2. 使用 URLSearchParams 获取当前的查询参数，设置 tab 参数为传入的 key
   * 3. 使用 router.replace 更新 URL 参数，实现双向绑定且不增加历史记录
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  /**
   * 监听 URL 中的 tab 参数
   * 依赖项 [searchParams]: 当 URL 参数变化时，同步更新 activeTab 状态
   */
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "pending" || tab === "processed") {
      setActiveTab(tab);
    } else if (!tab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "pending");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  /**
   * 统计待审核和已处理的数量
   * 依赖项 [data]: 仅在原始数据变化时重新计算，避免性能浪费
   */
  const stats = useMemo(() => {
    const pendingCount = data.filter((item) => item.status === "pending").length;
    const processedCount = data.filter(
      (item) => item.status !== "pending" && item.status !== "draft"
    ).length;
    return { pendingCount, processedCount };
  }, [data]);

  /**
   * 根据当前选中的 tab 过滤显示的数据
   * 依赖项 [data, activeTab]: 当原始数据或当前标签页切换时重新计算
   */
  const filteredData = useMemo(() => {
    if (activeTab === "pending") {
      return data.filter((item) => item.status === "pending");
    } else {
      return data.filter((item) => item.status !== "pending" && item.status !== "draft");
    }
  }, [data, activeTab]);

  /**
   * 获取酒店列表的核心逻辑
   */
  const loadData = async () => {
    if (loading) return; // 防抖：如果正在加载则不再请求

    setLoading(true);
    try {
      const res = await fetchHotelsList();
      setData(res);
    } catch (error: unknown) {
      console.error("获取酒店列表失败", error);
      showMessage("error", error instanceof Error ? error.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 页面首次渲染后加载数据
   * 依赖项 []: 仅在组件挂载时执行一次
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * 打开详情抽屉并加载该酒店的房型信息
   * @param record 当前选中的酒店记录
   */
  const handleOpenDrawer = async (record: HotelInformation) => {
    setCurRecord(record);
    setDrawerVisible(true);

    setRoomTypes([]);
    setRoomTypesLoading(true);

    try {
      const res = await fetchHotelRoomTypes(record.id);
      setRoomTypes(res);
    } catch (error: unknown) {
      console.error("获取房型失败", error);
      showMessage("error", error instanceof Error ? error.message : "数据加载失败");
    } finally {
      setRoomTypesLoading(false);
    }
  };

  /**
   * 刷新按钮逻辑
   */
  const handleRefresh = async () => {
    await loadData();
    showMessage("success", "刷新成功");
  };

  /**
   * 审核通过操作
   */
  const handleApprove = async () => {
    if (!curRecord) return;

    setSubmitting(true);
    try {
      // 1. 调用审核通过 API
      await approveHotel(curRecord.id, curRecord.nameZh, "approve");

      // 2. 乐观更新本地数据：直接将当前记录状态改为 approved，减少页面闪烁
      setData((prev) =>
        prev.map((item) => (item.id === curRecord.id ? { ...item, status: "approved" } : item))
      );

      showMessage("success", `酒店${curRecord.nameZh}审核通过`);
      setDrawerVisible(false); // 关闭详情页
    } catch (e: unknown) {
      console.error("审核通过失败：", e);
      showMessage("error", e instanceof Error ? e.message : "审核通过失败");
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * 点击驳回按钮，显示理由填写弹窗
   */
  const handleReject = () => {
    setRejectModalVisible(true);
  };

  /**
   * 提交驳回理由后的核心逻辑
   * @param reason 驳回原因
   */
  const handleRejectConfirm = async (reason: string) => {
    if (!curRecord) return;

    setSubmitting(true);
    try {
      // 1. 调用审核驳回 API
      await rejectHotel(curRecord.id, curRecord.nameZh, reason);

      // 2. 乐观更新本地数据
      setData((prev) =>
        prev.map((item) =>
          item.id === curRecord.id ? { ...item, status: "rejected", rejectedReason: reason } : item
        )
      );

      showMessage("success", `酒店${curRecord.nameZh}审核驳回`);
      setRejectModalVisible(false);
      setDrawerVisible(false);
    } catch (e: unknown) {
      console.error("审核驳回失败", e);
      showMessage("error", e instanceof Error ? e.message : "审核驳回失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="min-h-full">
      <div className="p-6">
        <Tabs
          activeTab={activeTab}
          onChange={handleTabChange}
          type="line"
          extra={
            <Button
              type="secondary"
              icon={<IconRefresh />}
              onClick={handleRefresh}
              loading={loading}
            >
              刷新
            </Button>
          }
        >
          <Tabs.TabPane
            key="pending"
            title={
              <>
                <span className="px-2">待审核</span>
                <Badge count={stats.pendingCount} maxCount={99} dotStyle={{ fontSize: 12 }} />
              </>
            }
          >
            <div className="py-5">
              <AuditTable data={filteredData} isLoading={loading} onView={handleOpenDrawer} />
            </div>
          </Tabs.TabPane>
          <Tabs.TabPane
            key="processed"
            title={
              <>
                <span className="px-2">已处理</span>
                <Badge count={stats.processedCount} maxCount={99} dotStyle={{ fontSize: 12 }} />
              </>
            }
          >
            <div className="py-5">
              <AuditTable data={filteredData} isLoading={loading} onView={handleOpenDrawer} />
            </div>
          </Tabs.TabPane>
        </Tabs>

        {/* 详情抽屉 */}
        <AuditDrawer
          visible={drawerVisible}
          data={curRecord}
          roomTypes={roomTypes}
          loadingRoomTypes={roomTypesLoading}
          onClose={() => setDrawerVisible(false)}
          onApprove={handleApprove}
          onReject={handleReject}
          loading={submitting}
        />

        {/* 驳回理由弹窗 */}
        <RejectModal
          visible={rejectModalVisible}
          onCancel={() => setRejectModalVisible(false)}
          onConfirm={handleRejectConfirm}
          loading={submitting}
        />
      </div>
    </Card>
  );
}
