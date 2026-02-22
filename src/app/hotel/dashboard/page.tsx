"use client"
import AlertBanners from "@/components/hotel/AlertBanners"
import StatusEChart from "@/components/hotel/StatusEChart";
import { useState, useEffect, useMemo } from "react";
import { getHotels } from "@/actions/hotels";
import { MineHotelInformationType } from "@/types/HotelInformation";
import { Spin, Card } from "@arco-design/web-react";

export default function DashboardPage() {
  const [allData, setAllData] = useState<MineHotelInformationType[]>([]);
  const [loading, setLoading] = useState(true); // 保证 EChart 数据只渲染一次

  useEffect(() => {
    const fetchData = async () => {
      console.log('fetch start');
      const data = await getHotels() || [];
      console.log('fetch done', data.length);
      setAllData(data);
      setLoading(false);
    };
    fetchData();
  }, []);

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

  if (loading) return (
    <Card style={{ height: "100vh" }}>
      <Spin />
    </Card>
  );

  return (
    <Card style={{ height: "100vh" }}>
    <div >
      <AlertBanners draftCount={draftCount} rejectedRoomCount={rejectedRoomCount} />
      <div style={{ display: 'flex', gap: '24px', marginTop: '24px', justifyContent: 'center' }}>      
        <StatusEChart data={auditData} statusColorMap={auditColorMap} title="审核状态分布"/>
        <StatusEChart data={onlineData} statusColorMap={onlineColorMap} title="上线状态分布"/>
      </div>
    </div>
    </Card>
  )
}