"use client";
import { HotelInformation } from "@/types/HotelInformation";
import { Badge, Button, Table } from "@arco-design/web-react";

interface AuditTableProps {
  isLoading?: boolean; // 加载中
  data: HotelInformation[]; // 数据
  onView: (record: HotelInformation) => void; // 审核逻辑
}

export default function AuditTable({ isLoading, data, onView }: AuditTableProps) {
  const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "酒店名称", dataIndex: "nameZh", width: 220 },
    { title: "提交商户", dataIndex: "merchantId" },
    {
      title: "提交时间",
      dataIndex: "updatedAt",
      sorter: (a: HotelInformation, b: HotelInformation) => a.updatedAt.localeCompare(b.updatedAt),
      // 新增：自定义时间格式化逻辑
      render: (text: string) => {
        if (!text) return "-";
        const date = new Date(text);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const day = date.getDate().toString().padStart(2, "0");
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const seconds = date.getSeconds().toString().padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      },
    },
    {
      title: "审核状态",
      dataIndex: "status",
      // 自定义显示状态
      render: (status: string) => {
        // 使用状态映射表，将酒店信息的状态映射为 Badge 组件字面量
        const statusMap: Record<
          string,
          { status: "processing" | "success" | "error" | "default"; text: string }
        > = {
          pending: { status: "processing", text: "待审核" },
          approved: { status: "success", text: "已通过" },
          rejected: { status: "error", text: "已驳回" },
          offline: { status: "default", text: "已下线" },
        };
        // 默认状态
        const config = statusMap[status] || statusMap.pending;
        return <Badge status={config.status} text={config.text} />;
      },
      // 自定义筛选项
      filters: [
        { text: "待审核", value: "pending" },
        { text: "已通过", value: "approved" },
        { text: "已驳回", value: "rejected" },
        { text: "已下线", value: "offline" },
      ],
      // 筛选函数
      onFilter: (value: string, record: HotelInformation) => record.status === value,
    },
    {
      title: "操作",
      render: (_: undefined, record: HotelInformation) => (
        <Button
          type={record.status === "pending" ? "primary" : "secondary"}
          size="small"
          onClick={() => onView(record)}
        >
          {record.status === "pending" ? "审核" : "查看"}
        </Button>
      ),
    },
  ];
  return (
    <Table
      columns={columns} // 列定义
      rowKey="id" // 唯一标识符
      loading={isLoading} // 加载中
      data={data} // 数据
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
