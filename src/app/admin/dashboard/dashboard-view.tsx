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
 * 仪表盘统计数据接口定义
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

/**
 * DashboardView (Client Component)
 * 负责仪表盘页面的交互逻辑、状态管理和数据展示
 */
export default function DashboardView() {
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 统计卡片数据
  const [data, setData] = useState<DashboardStats>();
  // 趋势图表数据
  const [trendData, setTrendData] = useState<TrendPoint[]>([]);

  const showMessage = useMessageStore((state) => state.showMessage);
  const router = useRouter();

  /**
   * 获取统计数据和趋势数据
   * 采用并发请求优化性能
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [stats, trend] = await Promise.all([
        fetchDashboardStats(),
        fetchTrendData(),
      ]);
      setData(stats);
      setTrendData(trend);
    } catch (error: unknown) {
      console.error("获取数据失败", error);
      showMessage("error", error instanceof Error ? error.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 组件挂载时获取数据
   * 依赖项 []: 仅在初次渲染时执行
   */
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * 已处理审核数量统计
   * 依赖项 [data]: 仅在统计数据变化时重新计算
   */
  const processedCount = useMemo(() => {
    if (!data) return 0;
    return data.rejected + data.online + data.offline;
  }, [data]);

  /**
   * 业务效能看板相关数据计算
   * 依赖项 [data, trendData]: 当统计数据或趋势数据变化时重新计算
   */
  const todayCalc = useMemo(() => {
    // 今日完成审核数量（趋势数据的最后一个点）
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
   * 页面跳转逻辑
   */
  const jumpToAudit = (tab: string) => {
    router.push(`/admin/audit?tab=${tab}`);
  };

  const jumpToOnline = (tab: string) => {
    router.push(`/admin/online?tab=${tab}`);
  };

  return (
    <Card title="仪表盘" style={{ height: "100%", overflow: "auto" }}>
      {/* 第一行：数据全景 */}
      <Typography.Title heading={6}>统计数据</Typography.Title>
      <Grid.Row gutter={20} style={{ minHeight: 104 }}>
        <Grid.Col span={4}>
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
        <Grid.Col span={12}>
          <Card title="本周业务效能" loading={loading}>
            <TrendAreaChart data={trendData} />
          </Card>
        </Grid.Col>

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
