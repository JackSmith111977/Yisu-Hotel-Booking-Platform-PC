"use client";

import { formatDate } from "@/lib/formatDate";
import { AuditLogs } from "@/types/AuditLogsType";
import { Table, Tag } from "@arco-design/web-react";

interface LogsTableProps {
  isLoading: boolean;
  data: AuditLogs[];
}

export function LogsTable({ isLoading, data }: LogsTableProps) {
  // 定义表格字段
  const columns = [
    // 日志ID
    {
      title: "日志ID",
      dataIndex: "id",
    },
    // 操作者
    {
      title: "操作者",
      dataIndex: "operator_name",
    },
    // 操作
    {
      title: "操作",
      dataIndex: "action_type",
      render: (action: string) => {
        const actionMap: Record<string, { color: string; text: string }> = {
          approve: { color: "green", text: "通过" },
          reject: { color: "red", text: "拒绝" },
          offline: { color: "gray", text: "下线" },
          online: { color: "blue", text: "上线" },
        };
        const config = actionMap[action] || actionMap.approve;
        return (
          <Tag bordered color={config.color}>
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: "通过", value: "approve" },
        { text: "拒绝", value: "reject" },
        { text: "下线", value: "offline" },
        { text: "上线", value: "online" },
      ],
      onFilter: (value: string, record: AuditLogs) => record.action_type === value,
    },
    // 目标名称
    {
      title: "目标名称",
      dataIndex: "target_name",
    },
    // 操作时间
    {
      title: "操作时间",
      dataIndex: "created_at",
      // 新增：自定义时间格式化逻辑
      render: (text: string) => formatDate(text),
      sorter: (a: AuditLogs, b: AuditLogs) => a.created_at.localeCompare(b.created_at),
    },
    // 操作详情
    {
      title: "操作详情",
      dataIndex: "content",
      // 居中
      align: "center" as const,
      render: (text: string) => text || "-",
    },
  ];

  return (
    <Table
      columns={columns}
      rowKey="id"
      data={data}
      loading={isLoading}
      pagination={{
        // 分页
        showTotal: true,
        sizeCanChange: true,
        defaultPageSize: 10,
        total: data.length,
      }}
    />
  );
}
