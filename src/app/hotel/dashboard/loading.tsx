"use client"
import { Card } from "@arco-design/web-react";

export default function DashboardLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Card>
        <div style={{ display: "flex", gap: 16 }}>
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 80, flex: 1 }} />
          ))}
        </div>
      </Card>
      <div style={{ display: "flex", gap: 16 }}>
        {Array(2).fill(0).map((_, i) => (
          <Card key={i} style={{ flex: 1 }}>
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 200 }} />
          </Card>
        ))}
      </div>
    </div>
  );
}
