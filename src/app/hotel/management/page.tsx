"use client"
import MineTable from "@/components/hotel/MineTable";
import HotelModal from "@/components/hotel/HotelModal";
import CreateButton from "@/components/hotel/CreateButton";
import HotelDrawer from "@/components/hotel/HotelDrawer";
import { MineHotelInformationType } from "@/types/HotelInformation";
import { useState, useCallback, useMemo } from "react";
import { Input, Message, Card } from "@arco-design/web-react";
import { deleteHotel } from "@/actions/hotels";
import { useHotels, mutateHotels } from "@/hooks/useHotels";
import { toast } from "sonner";
import { useUserStore } from "@/store/useUserStore";

export default function ManagementPage() {
  const { hotels: allHotels, isLoading } = useHotels();
  const [modalVisible, setModalVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<MineHotelInformationType | null>(null);
  const [keyword, setKeyword] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [curRecord, setCurRecord] = useState<MineHotelInformationType | null>(null);
  const userId = useUserStore((state) => state.user?.id);

  const data = useMemo(() => {
    let filtered = allHotels.filter((item: MineHotelInformationType) => item.status !== 'draft' && item.status !== 'rejected');
    if (keyword && keyword.trim() !== '') {
      const k = keyword.trim().toLowerCase();
      filtered = filtered.filter(item =>
        (item.name_zh || '').toLowerCase().includes(k) ||
        (item.name_en || '').toLowerCase().includes(k) ||
        (item.address || '').toLowerCase().includes(k)
      );
    }
    return filtered;
  }, [allHotels, keyword]);

  const handleCreate = useCallback(() => {
    setCurrentHotel(null);
    setModalVisible(true);
  }, []);

  const handleEdit = useCallback((record: MineHotelInformationType) => {
    setCurrentHotel(record);
    setModalVisible(true);
  }, []);

  const handleOpenDrawer = useCallback((record: MineHotelInformationType) => {
    setCurRecord(record);
    setDrawerVisible(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    const ok = await deleteHotel(id);
    if (!ok) {
      toast.error('删除失败');
      return false;
    }
    await mutateHotels();
    toast.success('删除成功');
    return true;
  }, []);

  if (isLoading || !userId) return (
    <Card style={{ height: "100vh" }}>
      <div style={{ padding: '10px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 32, width: 120 }} />
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 32, width: 200 }} />
        </div>
        <div style={{ border: '1px solid #e5e6eb', borderRadius: 4 }}>
          <div style={{ display: 'flex', gap: 16, padding: '12px 16px', borderBottom: '1px solid #e5e6eb', background: '#f7f8fa' }}>
            {[160, 80, 220, 100, 100].map((w, i) => (
              <div key={i} className="animate-pulse bg-gray-300 dark:bg-gray-600 rounded" style={{ height: 16, width: w }} />
            ))}
          </div>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 16, padding: '16px', borderBottom: i < 4 ? '1px solid #e5e6eb' : 'none', alignItems: 'center' }}>
              {[160, 80, 220, 100, 100].map((w, j) => (
                <div key={j} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 16, width: w }} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  return (
    <Card style={{ height: "100vh" }}>
    <div style={{ width: "100%", height: "100%" }}>
      <div style={{ padding: '10px 10px 0 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CreateButton handleCreate={handleCreate} />
        </div>
        <Input.Search
          placeholder="搜索酒店名称/地址"
          allowClear
          style={{ width: 200 }}
          onSearch={setKeyword}
        />
      </div>
      <div style={{ padding: '10px' }}>
        <MineTable onEdit={handleEdit} onView={handleOpenDrawer} data={data} onDelete={handleDelete} />
      </div>

      <HotelDrawer
        visible={drawerVisible}
        data={curRecord}
        onClose={() => setDrawerVisible(false)}
      />

      <HotelModal modalVisible={modalVisible} setModalVisible={setModalVisible} initialData={currentHotel} onCreated={mutateHotels} />
    </div>
    </Card>
  );
}
