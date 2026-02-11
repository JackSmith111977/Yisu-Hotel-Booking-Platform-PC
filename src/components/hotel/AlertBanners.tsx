import React from 'react';
import { Alert, Link, Space } from '@arco-design/web-react';
import { IconInfoCircle, IconCloseCircle } from '@arco-design/web-react/icon';


interface AlertBannersProps {
  draftCount?: number;
  rejectedRoomCount?: number;
}

const AlertBanners = ({ draftCount = 0, rejectedRoomCount = 0}: AlertBannersProps) => { 

  return (
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      {/* 草稿提示*/}
      {draftCount > 0 && (
        <Alert
            type="info"
            icon={<IconInfoCircle style={{ color: '#86909c' }} />}
            content={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <span>
                  您有 <strong>{draftCount}</strong> 个草稿未处理
                </span>
                <Link href="/hotel/todo?tab=draft" style={{color: '#86909c'}}>
                  前往草稿箱
                </Link>
            </div>
            }
            style={{
              backgroundColor: '#eee ',
              border: '1px solid #eee ',
            }}
        />
      )}

      {/* 房间下线警告*/}
      {rejectedRoomCount > 0 && (
        <Alert
          type="error"
          icon={<IconCloseCircle style={{ color: '#f53f3f' }} />}
          content={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
              <span>
                您有 <strong>{rejectedRoomCount}</strong> 个酒店申请被驳回，请及时处理
              </span>
              <Link href="/hotel/todo?tab=rejected" style={{ color: '#f53f3f', opacity: 0.6}}>
                查看详情
              </Link>
            </div>
          }
        />
      )}
    </Space>
  );
};

export default AlertBanners;