"use client";
import { useMessageStore } from "@/store/useMessageStore";
import { Alert } from "@arco-design/web-react";

export default function GlobalMessage() {
  const { messages, removeMessage } = useMessageStore();

  return (
    <div
      style={{
        position: "fixed",
        top: 24,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999, // 确保在最顶层，超过 Modal 和 Drawer
        display: "flex",
        flexDirection: "column",
        gap: 12,
        pointerEvents: "none", // 让鼠标事件穿透空白区域
        alignItems: "center",
      }}
    >
      {/* 遍历渲染消息队列 */}
      {messages.map((msg) => (
        <div
          key={msg.id}
          style={{
            pointerEvents: "auto", // 恢复 Alert 的鼠标交互（如点击关闭）
            minWidth: 300,
            maxWidth: 600,
            animation: "fadeIn 0.3s ease-out", // 简单的淡入动画
          }}
        >
          {/* 这里我们复用 Arco 的 Alert 组件，也可以自己写样式 */}
          <Alert
            type={msg.type}
            content={msg.content}
            closable
            onClose={() => removeMessage(msg.id)}
            style={{
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)", // 增加阴影，更有悬浮感
              border: "none",
              background: "var(--color-bg-2)", // 适配深色模式
            }}
          />
        </div>
      ))}

      {/* 简单的 CSS 动画定义 */}
      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
