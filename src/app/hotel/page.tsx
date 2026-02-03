'use client'
import MineTable from "@/components/hotel/MineTable";
import HotelModal from "@/components/hotel/HotelModal";
import CreateButton from "@/components/hotel/CreateButton";
import { MineHotelInformationType } from "@/types/HotelInformation";
import { useState } from "react";

export default function Home() {
  const [modalVisible, setModalVisible] = useState(false);  // 显示 Modal
  const [currentHotel, setCurrentHotel] = useState<MineHotelInformationType  | null>(null); // 当前选择的 Hotel 数据
  const [reloadKey, setReloadKey] = useState(0);  // 触发子组件刷新

  // 新建 Modal
  const handleCreate = () => {
    setCurrentHotel(null);  // 选择酒店数据为空
    setModalVisible(true);
  };

  // 编辑 Modal
  const handleEdit = (record: MineHotelInformationType) => {
    setCurrentHotel(record);
    setModalVisible(true);
  };

  return (
    <div
      style={{
        background: "#272727",
        width: "100%",
        height: "100%",
      }}
    >
      <div style={{padding:'10px 10px 0 10px'}}>
        <CreateButton handleCreate={handleCreate}/>
      </div>
      <div style={{padding:'10px'}}>
        <MineTable setModalVisible={setModalVisible} onEdit={handleEdit} refreshKey={reloadKey} />
      </div>
      <HotelModal modalVisible={modalVisible} setModalVisible={setModalVisible} initialData={currentHotel} onCreated={() => setReloadKey(k => k + 1)} />
    </div>
  );
}