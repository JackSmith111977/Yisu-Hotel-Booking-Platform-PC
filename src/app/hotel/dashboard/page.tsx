"use client"
import AlertBanners from "@/components/hotel/AlertBanners"
import StatusEChart from "@/components/hotel/StatusEChart";
import { useMemo } from "react";
import { useHotels } from "@/hooks/useHotels";
import { Card } from "@arco-design/web-react";
import { useUserStore } from "@/store/useUserStore";

export default function DashboardPage() {
  const { hotels: allData, isLoading } = useHotels();
  const userId = useUserStore((state) => state.user?.id);

  // 审核状态
  const auditData = useMemo(() => [
    { status: '待审核', count: allData.filter(h => h.status === 'pending').length },
    { status: '已拒绝', count: allData.filter(h => h.status === 'rejected').length },
    { status: '草稿', count: allData.filter(h => h.status === 'draft').length },
  ], [allData]);  
  const auditColorMap: Record<string, string> = {
    '待审核': '#165DFF',
    '已拒绝': '#F53F3F',
    '草稿': '#BFBFBF',
  };

  // 上线状态
  const onlineData = useMemo(() => [
    { status: '营业中', count: allData.filter(h => h.status === 'approved').length },
    { status: '已下线', count: allData.filter(h => h.status === 'offline').length },
  ], [allData]);  
  const onlineColorMap: Record<string, string> = {
    '营业中': '#00B42A',
    '已下线': '#BFBFBF',
  };

  const draftCount = useMemo(() => 
    allData.filter(h => h.status === 'draft').length, 
    [allData]
  );

  const rejectedRoomCount = useMemo(() => 
    allData.filter(h => h.status === 'rejected').length, 
    [allData]
  );

  if (isLoading || !userId) return (
    // 骨架屏
    <Card style={{ height: "100vh" }}>
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 40, marginBottom: 24 }} />
      <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 24 }}>
        {[0, 1].map(i => (
          <div key={i} style={{ width: '100%', maxWidth: 500, border: '1px solid #e5e6eb', borderRadius: 4 }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #e5e6eb' }}>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 20, width: 100 }} />
            </div>
            <div style={{ padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-full" style={{ width: 200, height: 200 }} />
              <div style={{ display: 'flex', gap: 16 }}>
                {[80, 60, 80].map((w, j) => (
                  <div key={j} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 14, width: w }} />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <Card style={{ height: "100vh" }}>
    <div >
      {/* 警示条部分 */}
      <AlertBanners draftCount={draftCount} rejectedRoomCount={rejectedRoomCount} />
      {/* Echart图表部分 */}
      <div style={{ display: 'flex', gap: '24px', marginTop: '24px', justifyContent: 'center' }}>      
        <StatusEChart data={auditData} statusColorMap={auditColorMap} title="审核状态分布"/>
        <StatusEChart data={onlineData} statusColorMap={onlineColorMap} title="上线状态分布"/>
      </div>
    </div>
    </Card>
  )
}