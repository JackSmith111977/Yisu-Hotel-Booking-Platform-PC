// **待补充：表格吸顶
// **没有展示图片信息，是否需要添加详情按钮
// **排序
"use client";
import { Table, Button, Badge, Modal, Message } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { HotelStatus } from '@/types/HotelInformation';
import { deleteHotel, getHotels } from '@/actions/hotels';
import { MineHotelInformationType } from '@/types/HotelInformation';
import dayjs from 'dayjs'
import { Dispatch, SetStateAction } from 'react';

interface MineTableProps {
    onEdit: (record: MineHotelInformationType) => void;
    refreshKey?: number;
    statusFilter: boolean;
  }

const MineTable = ({ onEdit, refreshKey, statusFilter }: MineTableProps) => {
  const [data, setData] = useState<MineHotelInformationType[]>([])  // 表单展示的酒店信息
  const [confirmVisible, setConfirmVisible] = useState(false);    // 确认弹窗状态
  const [Id, setId] = useState<number | null>(null);  // 存储需删除的 id

  // 主表单提交状态映射
  const statusMap: Record<HotelStatus, { text: string; status: 'success' | 'warning' | 'error' | 'default' }> = {
    draft: { text: '草稿', status: 'default' },
    pending: { text: '待审核', status: 'warning' },
    approved: { text: '已发布', status: 'success' },
    rejected: { text: '已拒绝', status: 'error' },
    offline: { text: '已下线', status: 'default' },
  };

  // 请求数据并更新状态
  const fetchData = async () => {
    const allData = await getHotels();
    const data = allData?.filter(item => statusFilter  ? item.status !== 'draft' : item.status === 'draft')
    console.log("data", data);
    setData(data || []);
    return data;
  }

  // 点击删除按钮时，同时设置 id 和打开弹窗
  const handleDelete = (id?: number) => {
    if (!id) return;
    setId(id);
    setConfirmVisible(true);
  };

  // 确认删除列表某一项
  const handleConfirmDelete = async () => {
    if (!Id) return;
    const ok = await deleteHotel(Id as number);
    if (!ok) {
      Message.error('删除失败');
      return;
    }

    Message.success('删除成功');
    fetchData();  // 刷新列表
    setConfirmVisible(false);
  }

  // 主表格 - 酒店列表
  const hotelColumns = [
    {
      title: '酒店名称',
      dataIndex: 'name_zh',
    },
    // {
    //   title: '英文名称',
    //   dataIndex: 'name_en',
    // },
    {
      title: '地址',
      dataIndex: 'address',
      render: (_: unknown, record: MineHotelInformationType) => {
        return `${JSON.parse(record.region).filter((item: string) => item !== '市辖区').join('') || ''}${record.address || ''}`;
      },
    },
    {
      title: '星级',
      dataIndex: 'star_rating',
    },
    // {
    //   title: '联系电话',
    //   dataIndex: 'contact_phone',
    // },
    // {
    //   title: '开业时间',
    //   dataIndex: 'opening_date',
    // },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: HotelStatus) => {
        const curStatus = statusMap[status]?.text || status;
        return <Badge status={statusMap[status]?.status} text={curStatus} />
      },
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

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, [refreshKey])


  return (
    <>
      <Table 
        rowKey="id"
        indentSize={55}
        columns={hotelColumns} 
        data={data} 
        noDataElement={<div>loading...</div>}
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
};

export default MineTable;
