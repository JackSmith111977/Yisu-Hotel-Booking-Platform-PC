"use client";
import { Tabs, Badge, Modal, Card } from '@arco-design/web-react';
import { useState, useMemo, Suspense } from 'react';
import { deleteHotelWithCleanup } from '@/actions/hotels';
import { MineHotelInformationType } from '@/types/HotelInformation';
import RejectedList from '@/components/hotel/RejectedList';
import DraftList from '@/components/hotel/DraftList';
import HotelModal from '@/components/hotel/HotelModal';
import { useSearchParams } from "next/navigation";
import { DraftHotel } from '@/components/hotel/DraftList';
import { useHotels, mutateHotels } from '@/hooks/useHotels';
import { useUserStore } from '@/store/useUserStore';

const TabPane = Tabs.TabPane;

function TodoPageContent() {
  const { hotels: allData, isLoading } = useHotels();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState<MineHotelInformationType | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() => {
    const tab = searchParams.get("tab");
    return tab === "draft" || tab === "rejected" ? tab : "draft";
  });
  const userId = useUserStore((state) => state.user?.id);

  const draftData: Partial<MineHotelInformationType>[] = useMemo(() =>
    allData.filter(item => item.status === 'draft'),
    [allData]
  );

  const rejectedData = useMemo(() =>
    allData.filter(item => item.status === 'rejected'),
    [allData]
  );

  const handleEdit = (id: number) => {
    const hotel = allData.find((item) => item.id === id);
    if (hotel) {
      setEditingHotel(hotel);
      setModalVisible(true);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeletingId(id);
    setConfirmVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (deletingId !== null) {
      try {
        await deleteHotelWithCleanup(deletingId);
        mutateHotels();
      } catch (e) {
        console.error('删除失败:', e);
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
    mutateHotels();
  };

  if (isLoading || !userId) return (
    <Card style={{ height: "100%" }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: 'flex', gap: 24, borderBottom: '1px solid #e5e6eb', paddingBottom: 12, marginBottom: 20 }}>
          {[60, 70].map((w, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 20, width: w }} />
          ))}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ border: '1px solid #e5e6eb', borderRadius: 4, padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 20, width: 180 }} />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 20, width: 60 }} />
              </div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 14, width: 240, marginBottom: 8 }} />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 28, width: 64 }} />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 28, width: 64 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );

  return (
    <Card style={{ height: "100%" }}>
      <div style={{ padding: 24 }}>
        <Tabs defaultActiveTab="draft" activeTab={activeTab} onChange={setActiveTab} type="line">
          <TabPane
            key="draft"
            title={
              <>
                <span style={{ padding: '0 8px' }}>草稿</span>
                <Badge count={draftData.length} maxCount={99} dotStyle={{ fontSize: 12 }} />
              </>
            }
          >
            <div style={{ padding: '20px 0' }}>
              <DraftList
                data={draftData as DraftHotel[]}
                loading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            </div>
          </TabPane>

          <TabPane
            key="rejected"
            title={
              <>
                <span style={{ padding: '0 8px' }}>被驳回</span>
                <Badge count={rejectedData.length} maxCount={99} dotStyle={{ fontSize: 12 }} />
              </>
            }
          >
            <div style={{ padding: '20px 0' }}>
              <RejectedList
                data={rejectedData.map(item => ({
                  ...item,
                  rejected_reason: item.rejected_reason ?? null
                }))}
                loading={isLoading}
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

        <Modal
          visible={confirmVisible}
          title="确认删除"
          onCancel={() => setConfirmVisible(false)}
          onOk={handleConfirmDelete}
          okText="删除"
          cancelText="取消"
          okButtonProps={{ status: 'danger' }}
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