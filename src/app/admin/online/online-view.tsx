"use client";

import { approveHotel, fetchHotelsList, offlineHotel } from "@/actions/admin_service";
import OnlineTable from "@/components/admin/OnlineTable";
import { useMessageStore } from "@/store/useMessageStore";
import { HotelInformation } from "@/types/HotelInformation";
import { Button, Card, Input, Tabs } from "@arco-design/web-react";
import { IconRefresh, IconSearch } from "@arco-design/web-react/icon";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

/**
 * OnlineView (Client Component)
 * 负责酒店上线管理的交互逻辑、状态管理和数据展示
 */
export default function OnlineView() {
  // 酒店数据源
  const [data, setData] = useState<HotelInformation[]>([]);
  // 当前激活的标签页：approved (已上线) / offline (已下线)
  const [activeTab, setActiveTab] = useState("approved");
  // 全局加载状态
  const [loading, setLoading] = useState(false);
  // 搜索关键词
  const [keyword, setKeyword] = useState("");

  const showMessage = useMessageStore((state) => state.showMessage);

  // 获取 URL 参数
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  /**
   * 处理标签页切换，实现 URL 与 Tab 的双向绑定
   */
  const handleTabChange = (key: string) => {
    setActiveTab(key);

    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", key);

    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  /**
   * 监听 URL 参数变化，同步 Tab 状态
   * 依赖项 [searchParams]: 当 URL 参数改变时执行
   */
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab === "approved" || tab === "offline") {
      setActiveTab(tab);
    } else if (!tab) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", "approved");
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }
  }, [searchParams, router, pathname]);

  /**
   * 加载酒店数据列表
   */
  const loadData = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const res = await fetchHotelsList();
      setData(res);
    } catch (error: unknown) {
      console.error("获取酒店列表失败", error);
      showMessage("error", error instanceof Error ? error.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 初次加载数据
   */
  useEffect(() => {
    loadData();
  }, []);

  /**
   * 手动刷新数据
   */
  const handleRefresh = async () => {
    await loadData();
    showMessage("success", "数据刷新成功");
  };

  /**
   * 根据当前 Tab 和搜索关键词过滤数据
   * 依赖项 [data, activeTab, keyword]: 任何过滤条件变化时重新计算
   */
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // 1. 状态匹配
      const statusMatch =
        activeTab === "approved" ? item.status === "approved" : item.status === "offline";

      // 2. 关键词匹配 (酒店名称或 ID)
      const keywordLower = keyword.toLowerCase();
      const keywordMatch =
        item.nameZh.toLowerCase().includes(keywordLower) ||
        item.id.toLowerCase().includes(keywordLower);

      return statusMatch && keywordMatch;
    });
  }, [data, activeTab, keyword]);

  /**
   * 处理酒店状态切换 (上线/下线)
   * @param record 当前操作的酒店记录
   */
  const handleToggleStatus = async (record: HotelInformation) => {
    setLoading(true);
    try {
      if (record.status === "approved") {
        // 执行下线操作
        await offlineHotel(record.id, record.nameZh);
        showMessage("success", `酒店 ${record.nameZh} 已成功下线`);
      } else {
        // 执行上线操作
        await approveHotel(record.id, record.nameZh, "online");
        showMessage("success", `酒店 ${record.nameZh} 已成功上线`);
      }
      // 操作成功后刷新列表
      await loadData();
    } catch (error: unknown) {
      console.error("酒店状态切换失败", error);
      showMessage("error", error instanceof Error ? error.message : "操作失败");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card
      title="酒店上线管理"
      style={{ minHeight: "100%" }}
      extra={
        <Button icon={<IconRefresh />} onClick={handleRefresh} loading={loading} disabled={loading}>
          刷新数据
        </Button>
      }
    >
      {/* 顶部工具栏：包含状态切换和搜索 */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Tabs activeTab={activeTab} onChange={handleTabChange} type="rounded">
          <Tabs.TabPane key="approved" title="已上线酒店" />
          <Tabs.TabPane key="offline" title="已下线酒店" />
        </Tabs>

        <Input.Search
          placeholder="搜索酒店名称/ID"
          allowClear
          style={{ width: 250 }}
          onSearch={setKeyword}
          prefix={<IconSearch />}
        />
      </div>

      {/* 酒店列表表格 */}
      <OnlineTable isLoading={loading} data={filteredData} onToggleStatus={handleToggleStatus} />
    </Card>
  );
}
