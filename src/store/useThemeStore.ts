import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ThemeState {
  theme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark") => void;
}

export const useThemeStore = create<ThemeState>()(
  // persist 中间件用于将状态持久化到 localStorage
  // 自动保存：当状态改变时，自动将状态保存到 localStorage
  // 自动恢复：在应用初始化时，从 localStorage 恢复状态
  persist(
    (set) => ({
      // 状态逻辑
      theme: "light",
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "app-theme-storage", // 存储在 localStorage 中的键名
    }
  )
);
