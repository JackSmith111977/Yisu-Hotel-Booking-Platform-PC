"use client"
import MineTable from "@/components/hotel/MineTable";
import HotelModal from "@/components/hotel/HotelModal";
import CreateButton from "@/components/hotel/CreateButton";
import HotelDrawer from "@/components/hotel/HotelDrawer";
import { MineHotelInformationType } from "@/types/HotelInformation";
import { useState, useCallback, useEffect, useMemo } from "react";
import { Input, Message } from "@arco-design/web-react";
import { getHotels, deleteHotel } from "@/actions/hotels";


interface Props { statusFilter: boolean }

export default function HotelManagement({ statusFilter }: Props) {
  const [data, setData] = useState<MineHotelInformationType[]>([])  // 表单展示的酒店信息
  // const [allData, setAllData] = useState<MineHotelInformationType[]>([]) // 所有酒店数据
  const [modalVisible, setModalVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<MineHotelInformationType | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [curRecord, setCurRecord] = useState<MineHotelInformationType | null>(null);

  // const draftCount = useMemo(() => 
  //   allData.filter(item => item.status === 'draft').length,
  //   [allData]
  // );

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

  // 请求数据并更新状态
  const fetchData = useCallback(async () => {
    const fetchedAll = await getHotels() || [];
    // setAllData(fetchedAll);
    let filtered = fetchedAll.filter(item => (statusFilter ? item.status !== 'draft' && item.status !== 'rejected' : item.status === 'draft' && item.status === 'rejected'));
    if (keyword && keyword.trim() !== '') {
      const k = keyword.trim().toLowerCase();
      filtered = filtered.filter(item =>
        (item.name_zh || '').includes(keyword) ||
        (item.name_en || '').toLowerCase().includes(k) ||
        (item.address || '').includes(keyword)
      );
    }
    setData(filtered);
    return filtered;
  }, [statusFilter, keyword]);

  const handleDelete = useCallback(async (id: number) => {
    const ok = await deleteHotel(id);
    if (!ok) {
      Message.error('删除失败');
      return false;
    }
    await fetchData();
    Message.success('删除成功');
    return true;
  }, [fetchData]);

  useEffect(() => {
    const loadData = async () => {
      await fetchData();
    };
    loadData();
  }, [fetchData, reloadKey])

  return (
    <div style={{ background: "#272727", width: "100%", height: "100%" }}>
      <div style={{ padding: '10px 10px 0 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <CreateButton handleCreate={handleCreate} />
          {/* <div style={{ color: '#fff', fontSize: 14 }}>
            您还有{draftCount}个草稿未处理。
          </div> */}
        </div>
        <Input.Search
          placeholder="搜索酒店名称/地址"
          allowClear
          style={{ width: 200 }}
          onSearch={setKeyword}
        />
      </div>
      <div style={{ padding: '10px' }}>
        <MineTable onEdit={handleEdit} onView={handleOpenDrawer} refreshKey={reloadKey} statusFilter={statusFilter} keyword={keyword} data={data} onDelete={handleDelete} />
      </div>

      <HotelDrawer
        visible={drawerVisible}
        data={curRecord}
        onClose={() => setDrawerVisible(false)}
        onApprove={() => {}}
        onReject={() => {}}
      />

      <HotelModal modalVisible={modalVisible} setModalVisible={setModalVisible} initialData={currentHotel} onCreated={() => setReloadKey(k => k + 1)} />
    </div>
  );
}