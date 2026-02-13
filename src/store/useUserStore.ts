// src/store/useUserStore.ts
import { create } from "zustand";
import { User } from "@/types/UserType";

interface UserState {
  user: User | null;
  isLoading: boolean;

  // Actions
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: false,

  // 模拟获取用户数据 (GET /api/user/profile)
  fetchUser: async () => {
    set({ isLoading: true });

    // 模拟网络延迟 1秒
    await new Promise((resolve) => setTimeout(resolve, 1000));

    set({
      user: {
        id: "admin-001",
        email: "admin@hotel.com",
        username: "admin_master",
        role: "admin",
        nickname: "超级管理员",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin", // 随机头像服务
        phone: "13800138000",
        bio: "负责全平台酒店审核与管理",
        createdAt: new Date("2024-01-01").toISOString(),
        lastLoginAt: new Date().toISOString(),
      },
      isLoading: false,
    });
  },

  // 模拟更新用户数据 (PUT /api/user/profile)
  updateUser: async (data) => {
    set({ isLoading: true });

    // 模拟网络延迟 800毫秒
    await new Promise((resolve) => setTimeout(resolve, 800));

    // 乐观更新：假设后端更新成功，直接修改本地状态
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
      isLoading: false,
    }));
  },
}));
