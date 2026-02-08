"use client";
import { Card, Statistic } from "@arco-design/web-react";
import { ReactNode } from "react";

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
  return (
    <Card
      hoverable
      loading={loading}
      onClick={onClick}
      className={`cursor-pointer ${onClick ? "" : "cursor-default"}`}
    >
      <Statistic
        title={title}
        value={value}
        groupSeparator
        prefix={
          <span
            className="bg-opacity-10 flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: `${color}20` }}
            color={color}
          >
            {icon}
          </span>
        }
        styleValue={{ color: color, fontWeight: 600 }}
      />
    </Card>
  );
}
