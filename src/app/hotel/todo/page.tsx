"use client";
import { Tabs, Badge, Modal } from '@arco-design/web-react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { getHotels, deleteHotel } from '@/actions/hotels';
import { MineHotelInformationType } from '@/types/HotelInformation';
import RejectedList from '@/components/hotel/RejectedList';
import DraftList from '@/components/hotel/DraftList';
import HotelModal from '@/components/hotel/HotelModal';
import { useSearchParams } from "next/navigation";

const TabPane = Tabs.TabPane;

export default function TodoPage() {
  const [allData, setAllData] = useState<MineHotelInformationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState<MineHotelInformationType | null>(null);
  const [confirmVisible, setConfirmVisible] = useState(false);    // 确认弹窗状态
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("draft");  // 记录 tab 状态

  const searchParams = useSearchParams();

  // 读取 URL 中的 tab 参数
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "draft" || tab === "rejected") {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const data = await getHotels() || [];
    setAllData(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const draftData: Partial<MineHotelInformationType>[] = useMemo(() => 
    allData.filter(item => item.status === 'draft'),
    [allData]
  );

  const rejectedData = useMemo(() => 
    allData.filter(item => item.status === 'rejected'),
    [allData]
  );

  const handleEdit = (id: number) => {
    const hotel = allData.find(item => item.id === id);
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
        fetchData();
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
    fetchData();
  };

  return (
    <div style={{ padding: 24 }}>
      <Tabs defaultActiveTab='draft' activeTab={activeTab} onChange={setActiveTab} type="line" >
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
              data={draftData} 
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
                <span style={{ padding: '0 8px' }}>被驳回</span>
                <Badge count={rejectedData.length} maxCount={99} dotStyle={{ fontSize: 12 }} />
                
            </>
          }
        >
          <div style={{ padding: '20px 0' }}>
            <RejectedList 
              data={rejectedData} 
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
        okButtonProps={{ status: 'danger' }}
        simple
      >
        <p style={{ margin: 0 }}>确定要删除这个酒店吗？此操作不可恢复。</p>
      </Modal>
    </div>
    
  );
}