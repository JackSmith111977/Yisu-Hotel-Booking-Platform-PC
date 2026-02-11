"use client";
import { Card, Typography, Empty, Spin, Tag, Button, Space } from '@arco-design/web-react';
import { IconEdit, IconDelete, IconLocation, IconHome } from '@arco-design/web-react/icon';
import dayjs from 'dayjs';

interface DraftHotel {
  id: number;
  name_zh: string;
  name_en?: string | null;
  region?: string | null;
  address?: string | null;
  star_rating?: number | null;
  total_rooms?: number | null;
  updated_at: string;
  cover_image_url?: string | null;
}

interface DraftListProps {
  data: DraftHotel[];
  loading?: boolean;
  onEdit?: (id: number) => void;
  onDelete?: (id: number) => void;
}

export default function DraftList({ data, loading, onEdit, onDelete }: DraftListProps) {
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Spin />
      </div>
    );
  }

  if (data.length === 0) {
    return <Empty description="暂无草稿" />;
  }

  const renderStars = (rating: number | null | undefined) => {
    if (!rating) return null;
    return (
      <Tag color="gold" size="small">
        {'★'.repeat(rating)}
      </Tag>
    );
  };

  return (
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
      gap: 16 
    }}>
      {data.map((hotel) => (
        <Card
          key={hotel.id}
          hoverable
          style={{ overflow: 'hidden' }}
          bodyStyle={{ padding: 0 }}
        >
          {/* 封面图 */}
          <div 
            style={{ 
              height: 140, 
              backgroundColor: '#f5f5f5',
              backgroundImage: hotel.cover_image_url ? `url(${hotel.cover_image_url})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {!hotel.cover_image_url && (
              <IconHome style={{ fontSize: 48, color: '#ccc' }} />
            )}
          </div>

          {/* 内容区 */}
          <div style={{ padding: 16 }}>
            {/* 标题行 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Typography.Title heading={6} style={{ margin: 0, flex: 1 }} ellipsis>
                {hotel.name_zh || '未命名酒店'}
              </Typography.Title>
              {renderStars(hotel.star_rating)}
            </div>

            {/* 英文名 */}
            {hotel.name_en && (
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }} ellipsis>
                {hotel.name_en}
              </Typography.Text>
            )}

            {/* 地址 */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 4, marginBottom: 8 }}>
              <IconLocation style={{ color: '#999', fontSize: 14, marginTop: 2, flexShrink: 0 }} />
              <Typography.Text 
                type="secondary" 
                style={{ fontSize: 13 }}
                ellipsis={{ rows: 2 }}
              >
                {`${JSON.parse(hotel.region || '[]')?.filter((item: string) => item !== '市辖区').join('') || ''}${hotel.address || ''}`}
              </Typography.Text>
            </div>

            {/* 房间数 */}
            {hotel.total_rooms && (
              <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
                共 {hotel.total_rooms} 间客房
              </Typography.Text>
            )}

            {/* 底部操作栏 */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              paddingTop: 12,
              borderTop: '1px solid #f0f0f0'
            }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {dayjs(hotel.updated_at).format('YYYY-MM-DD HH:mm')}
              </Typography.Text>
              
              <Space size="small">
                <Button 
                  type="primary" 
                  size="small"
                  icon={<IconEdit />}
                  onClick={() => onEdit?.(hotel.id)}
                >
                  编辑
                </Button>
                <Button 
                  status="danger" 
                  size="small"
                  icon={<IconDelete />}
                  onClick={() => onDelete?.(hotel.id)}
                >
                  删除
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}