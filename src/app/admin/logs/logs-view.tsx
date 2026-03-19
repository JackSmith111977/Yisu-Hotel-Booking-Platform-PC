"use client";

import { fetchAuditLogs } from "@/actions/admin_service";
import { LogsTable } from "@/components/admin/LogsTable";
import { useMessageStore } from "@/store/useMessageStore";
import { AuditLogs } from "@/types/AuditLogsType";
import { Card, Input } from "@arco-design/web-react";
import { useEffect, useState, useMemo } from "react";

/**
 * LogsView (Client Component)
 * 负责操作日志页面的交互逻辑和数据展示
 */
export default function LogsView() {
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 原始日志数据
  const [data, setData] = useState<AuditLogs[]>([]);
  // 搜索关键词
  const [keyword, setKeyword] = useState("");
  
  const showMessage = useMessageStore((state) => state.showMessage);

  /**
   * 获取操作日志列表
   */
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetchAuditLogs();
      if (res) {
        setData(res);
      }
    } catch (error: unknown) {
      console.error("获取日志数据失败", error);
      showMessage("error", error instanceof Error ? error.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 组件挂载时获取数据
   */
  useEffect(() => {
    fetchData();
  }, []);

  /**
   * 根据搜索关键词过滤数据
   * 依赖项 [data, keyword]: 仅在数据或关键词变化时重新计算
   */
  const filteredData = useMemo(() => {
    const keywordLower = keyword.toLowerCase();
    return data.filter((item) => {
      return (
        item.operator_name.toLowerCase().includes(keywordLower) ||
        item.action_type.toLowerCase().includes(keywordLower) ||
        item.target_name.toLowerCase().includes(keywordLower)
      );
    });
  }, [data, keyword]);

  return (
    <Card title="操作日志" style={{ height: "100%", minHeight: "calc(100vh - 120px)" }}>
      {/* 顶部工具栏：包含搜索框 */}
      <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
        <Input.Search
          placeholder="操作人/操作类型/操作对象"
          allowClear
          style={{ width: 250 }}
          onChange={setKeyword}
        />
      </div>
      
      {/* 日志表格组件 */}
      <LogsTable isLoading={loading} data={filteredData} />
    </Card>
  );
}
