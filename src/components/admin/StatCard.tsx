"use client";
import { Card, Statistic } from "@arco-design/web-react";
import { ReactNode, useState } from "react";

/**
 * @description: 统计卡片属性
 * @param {string} title 标题
 * @param {number} value 值
 * @param {ReactNode} icon 图标
 * @param {string} color 颜色
 * @param {boolean} loading 是否加载中
 * @param {() => void} onClick 点击事件
 */
interface StatCardProps {
  title: string;
  value: number;
  icon: ReactNode;
  color: string;
  loading?: boolean;
  onClick?: () => void;
}

/**
 * @description: 统计卡片
 * @param {StatCardProps} props
 * @return {*}
 */
export default function StatCard({ title, value, icon, color, loading, onClick }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      hoverable
      loading={loading}
      onClick={onClick}
      // 3. 动态背景色与过渡动画
      style={{
        backgroundColor: isHovered ? color : "white",
        transition: "all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)",
        borderRadius: "8px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`cursor-pointer ${onClick ? "" : "cursor-default"}`}
    >
      <Statistic
        // 4. 动态标题颜色（使用 rgba 让白色标题带一点透明，更精致）
        title={
          <span
            style={{
              color: isHovered ? "rgba(255, 255, 255, 0.85)" : "var(--color-text-2)",
              transition: "color 0.3s",
            }}
          >
            {title}
          </span>
        }
        value={value}
        groupSeparator
        prefix={
          <span
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{
              // 5. 动态图标背景：悬浮时变为白色半透明
              backgroundColor: isHovered ? "rgba(255, 255, 255, 0.25)" : `${color}15`,
              color: isHovered ? "white" : color,
              transition: "all 0.3s",
            }}
          >
            {icon}
          </span>
        }
        // 6. 动态数值颜色
        styleValue={{
          color: isHovered ? "white" : color,
          fontWeight: 700,
          transition: "color 0.3s",
        }}
      />
    </Card>
  );
}
