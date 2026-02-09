"use client";

import { TrendPoint } from "@/types/AuditLogsType";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TrendAreaChart({ data }: { data: TrendPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          {/* 定义颜色渐变 */}
          <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#52c41a" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#52c41a" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#f5222d" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#f5222d" stopOpacity={0} />
          </linearGradient>
        </defs>
        {/* 网格线 */}
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        {/* X 轴 */}
        <XAxis dataKey="date" />
        {/* Y 轴 */}
        <YAxis />
        {/* 数据点 */}
        <Tooltip />
        {/* 驳回数据面积 */}
        <Area
          isAnimationActive={false}
          type="monotone"
          stackId="1"
          dataKey="rejected"
          fill="url(#colorRejected)"
          stroke="#f5222d"
        />
        {/* 同意数据面积 */}
        <Area
          isAnimationActive={false}
          type="monotone"
          stackId="1"
          dataKey="approved"
          fill="url(#colorApproved)"
          stroke="#52c41a"
        />
        {/* 今日标注线 */}
        <ReferenceLine
          x={data[data.length - 1]?.date}
          stroke="blue"
          label={{
            value: "今日",
            position: "insideTopRight",
            fill: "#3381ff",
            fontSize: "12px",
            fontWeight: "bold",
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
