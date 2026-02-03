"use client";

import { HotelInformation } from "@/types/HotelInformation";
import { Badge, Button, Popconfirm, Table } from "@arco-design/web-react";
import { IconCommon, IconPoweroff } from "@arco-design/web-react/icon";

interface OnlineTableProps {
  isLoading: boolean;
  data: HotelInformation[];
  onToggleStatus: (record: HotelInformation) => void;
}
export default function OnlineTable({ isLoading, data, onToggleStatus }: OnlineTableProps) {
  const columns = [
    { title: "ID", dataIndex: "id", width: 80 },
    { title: "酒店名称", dataIndex: "nameZh", width: 220 },
    { title: "提交商户", dataIndex: "merchantId" },
    {
      title: "更新时间",
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
      title: "当前状态",
      dataIndex: "status",
      render: (status: string) => {
        if (status === "approved") {
          return <Badge status="success" text="营业中" />;
        }
        if (status === "offline") {
          return <Badge status="default" text="已下线" />;
        }
        return <Badge status="warning" text={status} />;
      },
    },
    {
      title: "操作",
      width: 150,
      render: (_: undefined, record: HotelInformation) => {
        const isOnline = record.status === "approved";
        return (
          <Popconfirm
            focusLock
            title={isOnline ? "确定下线该酒店？" : "确定再次上线该酒店？"}
            content={isOnline ? "下线后，用户将无法检索到该酒店" : "上线后，酒店重新对用户可见"}
            onOk={() => onToggleStatus(record)}
            okText={isOnline ? "确定下线" : "确定上线"}
            okButtonProps={{ status: isOnline ? "danger" : "warning", disabled: isLoading }}
            cancelButtonProps={{ disabled: isLoading }}
          >
            <Button
              type={isOnline ? "secondary" : "primary"}
              status={isOnline ? "danger" : "warning"}
              size="small"
              icon={isOnline ? <IconPoweroff /> : <IconCommon />}
            >
              {isOnline ? "强制下线" : "恢复上线"}
            </Button>
          </Popconfirm>
        );
      },
    },
  ];

  return (
    <Table
      rowKey="id"
      columns={columns}
      loading={isLoading}
      data={data}
      pagination={{
        showTotal: true,
        sizeCanChange: true,
        defaultPageSize: 10,
        total: data.length,
      }}
      border={false}
    />
  );
}
