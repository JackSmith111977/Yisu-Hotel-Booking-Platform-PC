"use client";

import { fetchAuditLogs } from "@/actions/admin_service";
import { LogsTable } from "@/components/admin/LogsTable";
import { useMessageStore } from "@/store/useMessageStore";
import { AuditLogs } from "@/types/AuditLogsType";
import { Card, Input } from "@arco-design/web-react";
import { IconSearch } from "@arco-design/web-react/icon";
import { useEffect, useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AuditLogs[]>([]);
  const [keyword, setKeyword] = useState("");
  const showMessage = useMessageStore((state) => state.showMessage);

  // 获取日志
  const fetchData = async () => {
    // 1. 显示加载状态
    setLoading(true);

    // 2. 发起请求
    try {
      const res = await fetchAuditLogs();
      if (res) {
        setData(res);
      }
    } catch (error: unknown) {
      // 3. 处理错误
      console.log("获取日志数据失败", error);
      showMessage("error", error instanceof Error ? error.message : "数据加载失败");
    } finally {
      setLoading(false);
    }
  };

  // 挂载时
  useEffect(() => {
    // 1. 初始化时获取数据
    fetchData();
  }, []);

  // 根据搜索关键词过滤数据
  const filteredData = data.filter((item) => {
    const keywordLower = keyword.toLowerCase();
    return (
      item.operator_name.toLowerCase().includes(keywordLower) ||
      item.action_type.toLowerCase().includes(keywordLower) ||
      item.target_name.toLowerCase().includes(keywordLower)
    );
  });

  return (
    <div>
      <Card title="操作日志" style={{ height: "100vh" }}>
        {/* 顶部搜索栏 */}
        <div style={{ marginBottom: 16, display: "flex", justifyContent: "flex-end" }}>
          <Input.Search
            placeholder="操作人/操作类型/操作对象"
            allowClear
            style={{ width: 250 }}
            // 实时搜索
            onChange={setKeyword}
          />
        </div>
        <LogsTable isLoading={loading} data={filteredData} />
      </Card>
    </div>
  );
}
