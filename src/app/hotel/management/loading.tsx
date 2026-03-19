"use client"
import { Card } from "@arco-design/web-react";

export default function ManagementLoading() {
  return (
    <Card style={{ height: "100%" }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 32, width: 200 }} />
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 32, width: 80, marginLeft: "auto" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 48 }} />
          {Array(6).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 dark:bg-gray-800 rounded" style={{ height: 56 }} />
          ))}
        </div>
      </div>
    </Card>
  );
}
