"use client";

import { fetchDashboardStats, fetchTrendData } from "@/actions/admin_service";
import StatCard from "@/components/admin/StatCard";
import TodayEfficiencyCard from "@/components/admin/TodayEfficiencyCard";
import { TrendAreaChart } from "@/components/admin/TrendAreaChart";
import { useMessageStore } from "@/store/useMessageStore";
import { TrendPoint } from "@/types/AuditLogsType";
import { Card, Divider, Grid, Typography } from "@arco-design/web-react";
import { IconUser } from "@arco-design/web-react/icon";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/**
 * @description: 仪表盘统计数据
 * @interface DashboardStats
 * @property {number} pending 待处理审核
 * @property {number} online 已上线酒店数量
 * @property {number} rejected 已驳回审核数量
 * @property {number} offline 已下线酒店数量
 * @property {number} total 总酒店数量
 */
interface DashboardStats {
  pending: number;
  online: number;
  rejected: number;
  offline: number;
  total: number;
}

const statColors = {
  pending: "orange",
  already: "green",
  online: "blue",
  offline: "gray",
  total: "purple",
};
export default function Home() {
  const [loading, setLoading] = useState(false);
  // 统计卡片数据
  const [data, setData] = useState<DashboardStats>();
  // 趋势图表数据
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);

  const showMessage = useMessageStore((state) => state.showMessage);
  const router = useRouter();

  // 获取数据
  const fetchData = async () => {
    // 1. 设置加载中状态
    setLoading(true);

    // 2. 发起请求
    try {
      // 并发请求
      const [stats, trend] = await Promise.all([
        // 1. 获取统计数据
        fetchDashboardStats(),
        // 2. 获取趋势数据
        fetchTrendData(),
      ]);
      setData(stats);
      setTrendData(trend);
    } catch (error: unknown) {
      // 3. 处理错误
      console.log("获取数据失败", error);
      showMessage("error", error instanceof Error ? error.message : "数据加载失败");
    } finally {
      // 4. 加载完成
      setLoading(false);
    }
  };

  // 挂载时获取数据
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * 已处理审核数量
   */
  const processedCount = useMemo(() => {
    if (!data) return 0;
    return data.rejected + data.online + data.offline;
  }, [data]);

  /**
   * 艺术化看板相关数据
   */
  const todayCalc = useMemo(() => {
    // 今日完成审核数量
    const todayProcessed = trendData[trendData.length - 1]?.total || 0;
    // 待审核数量
    const totalPending = data?.pending || 0;
    // 计算今日审核完成百分比
    const calculatePercent = (todayProcessed: number, totalPending: number) => {
      if (totalPending === 0) return 0;
      return (todayProcessed / totalPending) * 100;
    };
    const todayPercent = calculatePercent(todayProcessed, totalPending + todayProcessed);
    return {
      todayProcessed,
      totalPending,
      todayPercent,
    };
  }, [data, trendData]);

  /**
   * 跳转到审核页面
   * @param tab 审核类型
   */
  const jumpToAudit = (tab: string) => {
    router.push(`/admin/audit?tab=${tab}`);
  };

  /**
   * 跳转到已上线酒店页面
   * @param tab 酒店状态
   */
  const jumpToOnline = (tab: string) => {
    router.push(`/admin/online?tab=${tab}`);
  };

  return (
    <Card title="仪表盘" style={{ height: "100%", overflow: "auto" }}>
      {/* 第一行：数据全景 */}
      <Typography.Title heading={6}>统计数据</Typography.Title>
      <Grid.Row gutter={20} style={{ minHeight: 104 }}>
        <Grid.Col span={4}>
          {/* 未处理审核 */}
          <StatCard
            title="待处理审核"
            value={data?.pending || 0}
            icon={<IconUser />}
            color={statColors.pending}
            loading={loading}
            onClick={() => jumpToAudit("pending")}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          {/* 已处理审核 */}
          <StatCard
            title="已处理审核"
            value={processedCount}
            icon={<IconUser />}
            color={statColors.already}
            loading={loading}
            onClick={() => jumpToAudit("processed")}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          {/* 已上线酒店 */}
          <StatCard
            title="已上线酒店"
            value={data?.online || 0}
            icon={<IconUser />}
            color={statColors.online}
            loading={loading}
            onClick={() => jumpToOnline("online")}
          />
        </Grid.Col>
        <Grid.Col span={4}>
          {/* 已下线酒店 */}
          <StatCard
            title="已下线酒店"
            value={data?.offline || 0}
            icon={<IconUser />}
            color={statColors.offline}
            loading={loading}
            onClick={() => jumpToOnline("offline")}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          {/* 总酒店数量 */}
          <StatCard
            title="总酒店数量"
            value={data?.total || 0}
            icon={<IconUser />}
            color={statColors.total}
            loading={loading}
          />
        </Grid.Col>
      </Grid.Row>

      <Divider style={{ margin: "32px 0" }} />

      {/* 第二行：趋势分析 */}
      <Typography.Title heading={6} style={{ marginBottom: 20 }}>
        业务效能
      </Typography.Title>
      <Grid.Row
        gutter={20}
        style={{
          display: "flex",
          alignItems: "stretch",
          minHeight: 340,
        }}
      >
        {/* 趋势图 */}
        <Grid.Col span={12}>
          <Card title="本周业务效能" loading={loading}>
            <TrendAreaChart data={trendData} />
          </Card>
        </Grid.Col>

        {/* 艺术化看板 */}
        <Grid.Col span={12}>
          <TodayEfficiencyCard
            todayProcessed={todayCalc.todayProcessed}
            totalPending={todayCalc.totalPending}
            calculatePercent={todayCalc.todayPercent}
            loading={loading}
          />
        </Grid.Col>
      </Grid.Row>
    </Card>
  );
}
