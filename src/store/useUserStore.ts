import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/types/UserType";
import { getUserProfile, updateProfile, UpdateProfileParams } from "@/actions/user";

// ==========================================
// 1. 定义 State 接口
// ==========================================
interface UserState {
  // --- 服务端状态 (Server State) ---
  user: User | null;
  isLoading: boolean;

  // --- 客户端草稿状态 (Client Draft State) ---
  /**
   * 用户编辑中的草稿数据
   * 使用 Partial<User> 因为草稿可能只包含部分修改的字段
   */
  draftProfile: Partial<User> | null;

  /**
   * 是否有未保存的草稿
   */
  hasDraft: boolean;

  // --- Actions (操作方法) ---
  fetchUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;

  /**
   * 初始化草稿
   * 当用户点击“编辑”时调用，将当前 user 数据复制一份到 draftProfile
   */
  initDraft: () => void;

  /**
   * 更新草稿内容
   * @param patch 部分用户数据
   */
  setDraft: (patch: Partial<User>) => void;

  /**
   * 清空草稿
   * 保存成功或取消编辑时调用
   */
  clearDraft: () => void;
}

// ==========================================
// 2. 创建 Store (包含持久化中间件)
// ==========================================
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      // --- 初始状态 ---
      user: null,
      isLoading: false,
      draftProfile: null,
      hasDraft: false,

      // --- 业务逻辑 ---

      // 获取用户数据
      fetchUser: async () => {
        set({ isLoading: true });
        try {
          const result = await getUserProfile();
          if (result.success && result.data) {
            // 转换数据库字段到前端类型
            // 假设数据库返回的 avatar_url 对应前端的 avatar
            const backendUser = result.data;
            const user: User = {
              ...backendUser,
              avatar: backendUser.avatar_url || backendUser.avatar, // 兼容处理
            };
            set({ user, isLoading: false });
          } else {
            console.error("Failed to fetch user:", result.message);
            set({ user: null, isLoading: false });
          }
        } catch (error) {
          console.error("Fetch user exception:", error);
          set({ user: null, isLoading: false });
        }
      },

      // 更新用户数据
      updateUser: async (data: Partial<User>) => {
        set({ isLoading: true });
        try {
          // 构造更新参数
          // 转换前端字段 avatar -> 后端 avatar_url
          const updateParams: UpdateProfileParams = {
            nickname: data.nickname,
            phone: data.phone,
            bio: data.bio,
          };

          if (data.avatar) {
            updateParams.avatar_url = data.avatar;
          }

          const result = await updateProfile(updateParams);

          if (result.success && result.data) {
            // 乐观更新：直接修改 user，同时清空草稿
            // 或者使用后端返回的数据更新
            const backendUser = result.data;
            const updatedUser: User = {
              ...backendUser,
              avatar: backendUser.avatar_url || backendUser.avatar,
            };

            set({
              user: updatedUser,
              isLoading: false,
              draftProfile: null, // 更新成功后，草稿应当被清除
              hasDraft: false,
            });
            return { success: true };
          } else {
            set({ isLoading: false });
            return { success: false, message: result.message || "更新失败" };
          }
        } catch (error) {
          console.error("Update user exception:", error);
          set({ isLoading: false });
          return { success: false, message: "更新失败，请稍后重试" };
        }
      },

      // --- 草稿逻辑 ---

      initDraft: () => {
        const { user } = get();
        if (user) {
          set({
            draftProfile: { ...user },
            hasDraft: true,
          });
        }
      },

      setDraft: (patch) => {
        set((state) => {
          // 如果没有草稿，且新值与当前 user 值相同，则不创建草稿
          if (!state.hasDraft && state.user) {
            const isSame = Object.keys(patch).every((key) => {
              const k = key as keyof User;
              // 核心修复：将 null/undefined 归一化为空字符串进行比较
              // 解决后端返回 null 但表单使用 "" 导致的误判
              const userVal = state.user![k] ?? "";
              const patchVal = patch[k as keyof Partial<User>] ?? "";
              return String(userVal) === String(patchVal);
            });
            if (isSame) return state;
          }

          // 合并现有草稿和新修改
          // 关键修复：当 draftProfile 为 null 时（即首次修改），必须基于完整的 user 数据创建草稿
          // 否则 draftProfile 只包含当前修改的字段，导致 UI 渲染时其他字段丢失
          const newDraft = state.draftProfile
            ? { ...state.draftProfile, ...patch }
            : { ...state.user, ...patch };

          return {
            draftProfile: newDraft,
            hasDraft: true, // 只要有修改，就标记为有草稿
          };
        });
      },

      clearDraft: () => {
        set({
          draftProfile: null,
          hasDraft: false,
        });
      },
    }),
    {
      // --- 持久化配置 (Persist Configuration) ---

      name: "user-storage-v1", // LocalStorage 中的 Key

      storage: createJSONStorage(() => localStorage), // 指定使用 LocalStorage

      // **核心配置**：partialize (部分持久化)
      // 我们只持久化 draftProfile 和 hasDraft
      partialize: (state) => ({
        draftProfile: state.draftProfile,
        hasDraft: state.hasDraft,
      }),
    }
  )
);
