import { create } from "zustand";

export type MessageType = "info" | "success" | "warning" | "error";

export interface MessageItem {
  id: string;
  type: MessageType;
  content: string;
  duration?: number;
}

interface MessageState {
  messages: MessageItem[];
  // 添加消息 Action
  showMessage: (type: MessageType, content: string, duration?: number) => void;
  // 移除消息 Action
  removeMessage: (id: string) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],

  showMessage: (type, content, duration = 3000) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const newMessage: MessageItem = { id, type, content, duration };

    // 添加新消息到队列
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));

    // 如果设置了持续时间，则自动移除
    if (duration > 0) {
      setTimeout(() => {
        // 使用 get().removeMessage 确保调用的是最新的移除逻辑
        get().removeMessage(id);
      }, duration);
    }
  },

  removeMessage: (id) => {
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== id),
    }));
  },
}));
