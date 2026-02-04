"use client"
import MineTable from "@/components/hotel/MineTable";
import HotelModal from "@/components/hotel/HotelModal";
import CreateButton from "@/components/hotel/CreateButton";
import { MineHotelInformationType } from "@/types/HotelInformation";
import { useState } from "react";

interface Props { statusFilter: boolean }

export default function HotelManagement({ statusFilter }: Props) {
  const [modalVisible, setModalVisible] = useState(false);
  const [currentHotel, setCurrentHotel] = useState<MineHotelInformationType | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const handleCreate = () => { setCurrentHotel(null); setModalVisible(true); };
  const handleEdit = (record: MineHotelInformationType) => { setCurrentHotel(record); setModalVisible(true); };

  return (
    <div style={{ background: "#272727", width: "100%", height: "100%" }}>
      <div style={{ padding: '10px 10px 0 10px' }}>
        <CreateButton handleCreate={handleCreate} />
      </div>
      <div style={{ padding: '10px' }}>
        <MineTable onEdit={handleEdit} refreshKey={reloadKey} statusFilter={statusFilter} />
      </div>
      <HotelModal modalVisible={modalVisible} setModalVisible={setModalVisible} initialData={currentHotel} onCreated={() => setReloadKey(k => k + 1)} />
    </div>
  );
}