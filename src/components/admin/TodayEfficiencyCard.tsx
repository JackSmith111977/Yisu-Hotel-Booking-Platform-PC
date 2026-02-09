"use client";

import { Card, Progress, Skeleton, Space, Statistic, Typography } from "@arco-design/web-react";
import { IconCheckCircle, IconHistory } from "@arco-design/web-react/icon";
import { useState } from "react";

interface TodayEfficiencyCardProps {
  calculatePercent: number;
  todayProcessed: number;
  totalPending: number;
  loading?: boolean;
}

export default function TodayEfficiencyCard({
  calculatePercent,
  todayProcessed,
  totalPending,
  loading = false,
}: TodayEfficiencyCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      style={{
        height: "100%",
        borderRadius: "12px",
        display: "flex",
        flexDirection: "column",
        backgroundColor: isHovered ? "#f9f9f9" : "#ffffff",
        boxShadow: isHovered ? "0 12px 28px rgba(0, 0, 0, 0.15)" : "0 2px 8px rgba(0, 0, 0, 0.05)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      bodyStyle={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <Skeleton loading={loading} animation text={{ rows: 3 }} image={{ shape: "circle" }}>
        {/* 左侧：醒目的环形进度 */}
        <div
          style={{
            position: "relative",
            transition: "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
            transform: isHovered ? "scale(1.15)" : "scale(1)",
          }}
        >
          <Progress
            type="circle"
            percent={Math.round(calculatePercent)}
            size="large" // 加大尺寸
            width={160}
            strokeWidth={isHovered ? 16 : 12} // 加粗线条
            color={{ "0%": "#00b2ff", "100%": "#00e595" }}
            formatText={(p) => (
              <div style={{ textAlign: "center" }}>
                <Typography.Text style={{ fontSize: 28, fontWeight: "bold" }}>{p}%</Typography.Text>
                <br />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  今日处理率
                </Typography.Text>
              </div>
            )}
          />
        </div>

        {/* 右侧：精致的指标展示 */}
        <Space direction="vertical" size={40}>
          <Statistic
            title="今日已处理"
            value={todayProcessed}
            groupSeparator
            countUp
            suffix={<IconCheckCircle style={{ color: "#38b2ac" }} />}
          />
          <Statistic
            title="待审核积压"
            value={totalPending}
            groupSeparator
            countUp
            suffix={<IconHistory style={{ color: totalPending > 5 ? "#e53e3e" : "#ed8936" }} />}
          />
        </Space>
      </Skeleton>
    </Card>
  );
}
