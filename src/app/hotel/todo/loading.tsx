"use client"
import { Card } from "@arco-design/web-react";

export default function TodoLoading() {
  return (
    <Card style={{ height: "100%" }}>
      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 24, borderBottom: "1px solid #e5e6eb", paddingBottom: 12, marginBottom: 20 }}>
          {[60, 70].map((w, i) => (
            <div key={i} className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 20, width: w }} />
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {Array(4).fill(0).map((_, i) => (
            <div key={i} style={{ border: "1px solid #e5e6eb", borderRadius: 4, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 20, width: 180 }} />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 20, width: 60 }} />
              </div>
              <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 14, width: 240, marginBottom: 8 }} />
              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 28, width: 64 }} />
                <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded" style={{ height: 28, width: 64 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
