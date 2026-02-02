// **待补充：表格吸顶
// **没有展示图片信息，是否需要添加详情按钮
// **排序
"use client";
import { Table, Button, Badge } from '@arco-design/web-react';
import { HOTEL_DATA } from '@/mocks/HotelData';
import { useState } from 'react';
import { HotelStatus } from '@/types/HotelInformation';
import useSWR from 'swr';
import { getHotels } from '@/actions/hotels';

const MineTable = () => {
  // 主表格 - 酒店列表
  const hotelColumns = [
    {
      title: '酒店名称',
      dataIndex: 'name_zh',
    },
    {
      title: '英文名称',
      dataIndex: 'name_en',
    },
    {
      title: '地址',
      dataIndex: 'address',
    },
    {
      title: '星级',
      dataIndex: 'star_rating',
    },
    {
      title: '联系电话',
      dataIndex: 'contact_phone',
    },
    {
      title: '开业时间',
      dataIndex: 'opening_date',
    },
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
    },
    {
      title: '操作',
      dataIndex: 'op',
      width: '20px',
      render: (_, record) => (
        <div>
          <Button type='primary' style={{marginBottom:'5px'}}>
            编辑
          </Button>
          <Button 
            // onClick={() => removeRow(record.id)} 
            type='primary' status='danger'>
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

  // 主表单提交状态映射
  const statusMap: Record<HotelStatus, { text: string; status: 'success' | 'warning' | 'error' | 'default' }> = {
    draft: { text: '草稿', status: 'default' },
    pending_review: { text: '待审核', status: 'warning' },
    published: { text: '已发布', status: 'success' },
    rejected: { text: '已拒绝', status: 'error' },
    offline: { text: '已下线', status: 'default' },
  };

  // const [data, setData] = useState(HOTEL_DATA)  // 表单展示的酒店信息  
  const { data = [] } = useSWR('hotels', getHotels);  //表单初始酒店信息渲染

  // function removeRow(key: string | number) {
  //   setData(data.filter((item) => item.id !== key));
  // }

  return (
    <Table 
      rowKey="id"
      indentSize={55}
      columns={hotelColumns} 
      data={data} 
      noDataElement={<div>No data available</div>}
      expandedRowRender={cur => (
        <Table rowKey="id" columns={roomColumns} data={cur.room_types} pagination={false} />
      )} 
    />
  );
};

export default MineTable;
