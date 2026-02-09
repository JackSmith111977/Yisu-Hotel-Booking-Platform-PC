"use client";

import { approveHotel, fetchHotelsList, offlineHotel } from "@/actions/admin_service";
import OnlineTable from "@/components/admin/OnlineTable";
import { useMessageStore } from "@/store/useMessageStore";
import { HotelInformation } from "@/types/HotelInformation";
import { Button, Card, Input, Tabs } from "@arco-design/web-react";
import { IconRefresh, IconSearch } from "@arco-design/web-react/icon";
import { useEffect, useMemo, useState } from "react";

export default function Home() {
  // 酒店数据
  const [data, setData] = useState<HotelInformation[]>([]);
  // 当前标签页
  const [activeTab, setActiveTab] = useState("approved");
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 搜索关键词
  const [keyword, setKeyword] = useState("");

  const showMessage = useMessageStore((state) => state.showMessage);

  /**
   * 加载数据逻辑
   */
  const loadData = async () => {
    // 防止重复请求
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetchHotelsList();
      setData(res);
    } catch (error: unknown) {
      console.log("获取酒店列表失败", error);
      showMessage("error", error instanceof Error ? error.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 页面加载时触发
   */
  useEffect(() => {
    loadData();
  }, []);
  /**
   * 刷新数据逻辑
   */
  const handleRefresh = async () => {
    // 调用已有的 loadData 方法
    await loadData();

    // 显示成功提示
    showMessage("success", "数据刷新成功");
  };

  /**
   * 标签页切换 & 搜索逻辑
   */
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 标签页匹配
      const statusMatch =
        activeTab === "approved" ? item.status === "approved" : item.status === "offline";

      // 搜索栏关键字匹配
      const keywordMatch = item.nameZh.includes(keyword) || item.id.includes(keyword);

      return statusMatch && keywordMatch;
    });
  }, [data, activeTab, keyword]);

  /**
   * 酒店上下线管理
   * @param record
   */
  const handleToggleStatus = async (record: HotelInformation) => {
    setLoading(true);

    try {
      if (record.status === "approved") {
        await offlineHotel(record.id, record.nameZh);
        showMessage("success", `酒店${record.nameZh}已下线`);
      } else {
        await approveHotel(record.id, record.nameZh, "online");
        showMessage("success", `酒店${record.nameZh}已上线`);
      }
    } catch (error: unknown) {
      console.log("酒店上下线失败", error);
      showMessage("error", error instanceof Error ? error.message : "操作失败");
    } finally {
      setLoading(false);
      await loadData();
    }
  };

  return (
    <Card
      title="酒店上线管理"
      style={{ height: "100%" }}
      extra={
        <Button icon={<IconRefresh />} onClick={handleRefresh} loading={loading} disabled={loading}>
          刷新数据
        </Button>
      }
    >
      {/* 顶部工具栏 */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between" }}>
        <Tabs activeTab={activeTab} onChange={setActiveTab} type="rounded">
          <Tabs.TabPane key="approved" title="已上线酒店" />
          <Tabs.TabPane key="offline" title="已下线酒店" />
        </Tabs>

        <Input.Search
          placeholder="搜索酒店名称/ID"
          allowClear
          style={{ width: 200 }}
          onSearch={setKeyword}
          prefix={<IconSearch />}
        />
      </div>

      <OnlineTable isLoading={loading} data={filteredData} onToggleStatus={handleToggleStatus} />
    </Card>
  );
}
