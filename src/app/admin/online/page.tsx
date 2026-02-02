"use client";

import OnlineTable from "@/components/admin/OnlineTable";
import { MOCK_HOTEL_DATA } from "@/lib/mockdata";
import { useMessageStore } from "@/store/useMessageStore";
import { HotelInformation } from "@/types/HotelInformation";
import { Button, Card, Input, Tabs } from "@arco-design/web-react";
import { IconRefresh, IconSearch } from "@arco-design/web-react/icon";
import { useMemo, useState } from "react";

export default function Home() {
  // 酒店数据
  const [data, setData] = useState<HotelInformation[]>(MOCK_HOTEL_DATA);
  // 当前标签页
  const [activeTab, setActiveTab] = useState("approved");
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 搜索关键词
  const [keyword, setKeyword] = useState("");

  const showMessage = useMessageStore((state) => state.showMessage);

  /**
   * 刷新数据逻辑
   */
  const handleRefresh = () => {
    // TODO: 调用 API
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
      const keywordMatch = item.name.includes(keyword) || item.id.includes(keyword);

      return statusMatch && keywordMatch;
    });
  }, [data, activeTab, keyword]);

  const handleToggleStatus = (record: HotelInformation) => {
    setLoading(true);

    // 模拟耗时请求
    // TODO: 添加实际逻辑
    setTimeout(() => {
      const newStatus = record.status === "approved" ? "offline" : "approved";
      const actionText = newStatus === "approved" ? "上线" : "下线";

      // 更新本地数据
      setData((prev) =>
        prev.map((item) => (item.id === record.id ? { ...item, status: newStatus } : item))
      );

      showMessage("success", `酒店${record.name}已经${actionText}成功`);
      setLoading(false);
    }, 1000);
  };

  return (
    <Card
      title="酒店上线管理"
      style={{ height: "100%" }}
      extra={
        <Button icon={<IconRefresh />} onClick={handleRefresh}>
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
