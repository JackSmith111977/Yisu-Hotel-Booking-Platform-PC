"use client";
import { Card, Typography, Empty, Spin } from '@arco-design/web-react';
import { IconExclamationCircle } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';

interface RejectedHotel {
  id: number;
  name_zh: string;
  rejected_reason: string | null;
  updated_at: string;
}

interface RejectedListProps {
  data: RejectedHotel[];
  loading?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;  // 新增
}

export default function RejectedList({ data, loading, onEdit, onDelete }: RejectedListProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    );
  }

  if (data.length === 0) {
    return <Empty description="暂无被驳回的酒店" />;
  }

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: 16 
    }}>
      {data.map((hotel) => (
        <Card
          key={hotel.id}
          style={{ 
            backgroundColor: '#FEF0F0',
            border: 'none',
          }}
          bodyStyle={{ padding: '16px' }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <IconExclamationCircle style={{ color: '#C53030', fontSize: 16, marginTop: 2, flexShrink: 0 }} />
            <div style={{ flex: 1, minWidth: 0 }}>
                <Typography.Title heading={6} style={{ margin: 0, marginBottom: 8 }} ellipsis>
                    {hotel.name_zh}
                </Typography.Title>
              
                <Typography.Text 
                    style={{ color: '#666', display: 'block', marginBottom: 8, fontSize: 13}}
                    ellipsis={{ rows: 2 }}
                >
                    拒绝原因：{hotel.rejected_reason || '未填写'}
                </Typography.Text>
              
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(hotel.updated_at).format('YYYY-MM-DD HH:mm')}
                  </Typography.Text>
                  
                  <div style={{ display: 'flex', gap: 12 }}>
                      <Typography.Text
                          style={{ 
                              color: '#999', 
                              cursor: 'pointer',
                              fontSize: 13,
                          }}
                          onClick={() => onDelete?.(hotel.id)}
                      >
                          删除
                      </Typography.Text>
                      <Typography.Text
                          style={{ 
                              color: '#1890ff', 
                              cursor: 'pointer',
                              fontSize: 13,
                          }}
                          onClick={() => onEdit?.(hotel.id)}
                      >
                          去修改 →
                      </Typography.Text>
                  </div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}