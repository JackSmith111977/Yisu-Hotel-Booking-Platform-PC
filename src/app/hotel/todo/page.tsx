"use client";
import { Tabs, Badge, Modal, Card } from "@arco-design/web-react";
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import { getHotels, deleteHotel } from "@/actions/hotels";
import { MineHotelInformationType } from "@/types/HotelInformation";
import RejectedList from "@/components/hotel/RejectedList";
import DraftList from "@/components/hotel/DraftList";
import HotelModal from "@/components/hotel/HotelModal";
import { useSearchParams } from "next/navigation";
import { DraftHotel } from "@/components/hotel/DraftList";

const TabPane = Tabs.TabPane;

function TodoPageContent() {
  const [allData, setAllData] = useState<MineHotelInformationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState<MineHotelInformationType | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false); // 确认弹窗状态
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    return tab === "draft" || tab === "rejected" ? tab : "draft";
  }); // 记录 tab 状态

  const fetchHotelsData = useCallback(async () => {
    try {
      const data = (await getHotels()) || [];
      setAllData(data);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    setLoading(true);
    await fetchHotelsData();
  }, [fetchHotelsData]);

  useEffect(() => {
    fetchHotelsData();
  }, [fetchHotelsData]);

  const draftData: Partial<MineHotelInformationType>[] = useMemo(
    () => allData.filter((item) => item.status === "draft"),
    [allData]
  );

  const rejectedData = useMemo(
    () => allData.filter((item) => item.status === "rejected"),
    [allData]
  );

  const handleEdit = (id: number) => {
    const hotel = allData.find((item) => item.id === id);
    if (hotel) {
      setEditingHotel(hotel);
      setModalVisible(true);
    }
  };

  // 点击删除按钮时，先保存 id 并打开确认弹窗
  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setConfirmVisible(true);
  };

  // 确认删除
  const handleConfirmDelete = async () => {
    if (deletingId !== null) {
      const result = await deleteHotel(deletingId);
      if (result) {
        refreshData();
      }
    }
    setConfirmVisible(false);
    setDeletingId(null);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingHotel(null);
  };

  const handleCreated = () => {
    handleModalClose();
    refreshData();
  };

  return (
    <Card style={{ height: "100%" }}>
      <div style={{ padding: 24 }}>
        <Tabs defaultActiveTab="draft" activeTab={activeTab} onChange={setActiveTab} type="line">
          <TabPane
            key="draft"
            title={
              <>
                <span style={{ padding: "0 8px" }}>草稿</span>
                <Badge count={draftData.length} maxCount={99} dotStyle={{ fontSize: 12 }} />
              </>
            }
          >
            <div style={{ padding: "20px 0" }}>
              <DraftList
                data={draftData as DraftHotel[]}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            </div>
          </TabPane>

          <TabPane
            key="rejected"
            title={
              <>
                <span style={{ padding: "0 8px" }}>被驳回</span>
                <Badge count={rejectedData.length} maxCount={99} dotStyle={{ fontSize: 12 }} />
              </>
            }
          >
            <div style={{ padding: "20px 0" }}>
              <RejectedList
                data={rejectedData.map((item) => ({
                  ...item,
                  rejected_reason: item.rejected_reason ?? null,
                }))}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            </div>
          </TabPane>
        </Tabs>

        <HotelModal
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          initialData={editingHotel}
          onCreated={handleCreated}
        />

        {/* 确认删除弹窗 */}
        <Modal
          visible={confirmVisible}
          title="确认删除"
          onCancel={() => setConfirmVisible(false)}
          onOk={handleConfirmDelete}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ status: "danger" }}
          simple
        >
          <p style={{ margin: 0 }}>确定要删除这个酒店吗？此操作不可恢复。</p>
        </Modal>
      </div>
    </Card>
  );
}

export default function TodoPage() {
  return (
    <Suspense fallback={<Card>Loading...</Card>}>
      <TodoPageContent />
    </Suspense>
  );
}
