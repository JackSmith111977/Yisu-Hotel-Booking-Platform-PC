"use client";
import { Table, Button, Badge, Modal, Message } from '@arco-design/web-react';
import { useState, memo } from 'react';
import { MineHotelInformationType } from '@/types/HotelInformation';
import dayjs from 'dayjs'

interface MineTableProps {
    onEdit: (record: MineHotelInformationType) => void;
    onView?: (record: MineHotelInformationType) => void;
    onDelete?: (id: number) => Promise<boolean>;
    refreshKey?: number;
    statusFilter: boolean;
    keyword?: string;
    data: MineHotelInformationType[];
  }

const MineTable = memo(function MineTable({ onEdit, data, onDelete, statusFilter, onView }: MineTableProps) {  
  const [confirmVisible, setConfirmVisible] = useState(false);    // 确认弹窗状态
  const [Id, setId] = useState<number | null>(null);  // 存储需删除的 id

  // 点击删除按钮时，同时设置 id 和打开弹窗
  const handleDelete = (id?: number) => {
    if (!id) return;
    setId(id);
    setConfirmVisible(true);
  };

  // 确认删除列表某一项 - 委托给父组件处理删除并刷新
  const handleConfirmDelete = async () => {
    if (!Id) return;
    if (onDelete) {
      const ok = await onDelete(Id as number);
      if (!ok) {
        Message.error('删除失败');
        return;
      }
      setConfirmVisible(false);
      return;
    }

    Message.error('删除失败');
  }

  // 主表格 - 酒店列表
  const hotelColumns = [
    {
      title: '酒店名称',
      dataIndex: 'name_zh',
      render: (_: unknown, record: MineHotelInformationType) => {
        return (
          <>
            <span>{record.name_zh}</span>
            <span 
              style={{fontSize:11, marginLeft:5, color:'blue', cursor: 'pointer'}}
              onClick={() => onView?.(record)}
            >详情</span>
          </>
        )
      }
    },
    {
      title: '地址',
      dataIndex: 'address',
      render: (_: unknown, record: MineHotelInformationType) => {
        return `${JSON.parse(record.region)?.filter((item: string) => item !== '市辖区').join('') || ''}${record.address || ''}`;
      },
    },
    {
      title: "审核状态",
      dataIndex: "status",
      render: (status: string) => {
        const statusMap: Record<string, { status: "processing" | "success" | "error" | "default"; text: string }> = {
          draft: { status: "default", text: "草稿" },
          pending: { status: "processing", text: "待审核" },
          approved: { status: "success", text: "已发布" },
          // rejected: { status: "error", text: "已拒绝" },
          offline: { status: "error", text: "已下线" },
        };
        const config = statusMap[status] || statusMap.pending;
        return <Badge status={config.status} text={config.text} />;
      },
      filters: statusFilter ?
        [
          { text: "待审核", value: "pending" },
          { text: "已发布", value: "approved" },
          { text: "已下线", value: "offline" },
        ] : undefined,
      onFilter: (value: string, record: MineHotelInformationType) => record.status === value,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm')
    },
    {
      title: '',
      dataIndex: 'op',
      render: (_: unknown, record: MineHotelInformationType) => (
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button 
            type='primary' size="small"
            onClick={() => onEdit(record)}            
          >
            编辑
          </Button>
          <Button 
            type='primary' status='danger' size="small"
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  // 子表格 - 房型列表
  const roomColumns = [
    {
      title: '房型名称',
      dataIndex: 'name',
    },
    {
      title: '价格（元/晚）',
      dataIndex: 'price',
    },
    {
      title: '房间数量',
      dataIndex: 'quantity',
    },
    {
      title: '面积（㎡）',
      dataIndex: 'size',
    },
    {
      title: '描述',
      dataIndex: 'description',
    },
  ];

  return (
    <>
      <Table 
        rowKey="id"
        indentSize={55}
        columns={hotelColumns} 
        data={data} 
        expandedRowRender={cur => (
          <Table rowKey="id" columns={roomColumns} data={cur.room_types} pagination={false} style={{ backgroundColor: '#fff' }}/>
        )} 
      />
      {/* 确认删除弹窗 */}
      <Modal
        visible={confirmVisible}
        title="确认删除"
        onCancel={() => setConfirmVisible(false)}
        onOk={handleConfirmDelete}
        okText="删除"
        cancelText="取消"
        okButtonProps={{ status: 'danger' }}
        simple
      >
        <p style={{ margin: 0 }}>确定要删除这个酒店吗？此操作不可恢复。</p>
      </Modal>
    </>
    
  );
});

export default MineTable;
