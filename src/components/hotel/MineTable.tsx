// **待补充：表格吸顶
// **没有展示图片信息，是否需要添加详情按钮
// **排序
"use client";
import { Table, Button, Badge } from '@arco-design/web-react';
import { HOTEL_DATA } from '@/mocks/HotelData';
import { useState } from 'react';
import { HotelStatus } from '@/types/HotelInformation';

const MineTable = () => {
  // 主表格 - 酒店列表
  const hotelColumns = [
    {
      title: '酒店名称',
      dataIndex: 'basicInfo.nameZh',
    },
    {
      title: '英文名称',
      dataIndex: 'basicInfo.nameEn',
    },
    {
      title: '地址',
      dataIndex: 'basicInfo.address',
    },
    {
      title: '星级',
      dataIndex: 'basicInfo.starRating',
    },
    {
      title: '联系电话',
      dataIndex: 'basicInfo.contactPhone',
    },
    {
      title: '开业时间',
      dataIndex: 'basicInfo.openingDate',
    },
    {
      title: '状态',
      dataIndex: 'status',
      render: (status: HotelStatus) => {
        const curStatus = statusMap[status].text || status;
        return <Badge status={statusMap[status].status} text={curStatus} />
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
    },
    {
      title: '操作',
      dataIndex: 'op',
      width: '20px',
      render: (_, record) => (
        <div>
          {/* **需添加按钮： 编辑 */}
          <Button type='primary' style={{marginBottom:'5px'}}>
            编辑
          </Button>
          <Button onClick={() => removeRow(record.id)} type='primary' status='danger'>
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

  const [data, setData] = useState(HOTEL_DATA)  // 表单展示的酒店信息  

  function removeRow(key: string | number) {
    setData(data.filter((item) => item.id !== key));
  }

  return (
    <Table 
      rowKey="id"
      indentSize={55}
      columns={hotelColumns} 
      data={data} 
      noDataElement={<div>No data available</div>}
      expandedRowRender={cur => (
        <Table rowKey="id" columns={roomColumns} data={cur.roomTypes} pagination={false} />
      )} 
    />
  );
};

export default MineTable;
