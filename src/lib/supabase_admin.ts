import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!url || !key) {
  throw new Error("Missing Supabase URL or Key");
}

/**
 * Supabase 管理端
 */
export const supabase_admin = createClient(url, key, {
  auth: {
    // 不持久化会话，保持无状态
    autoRefreshToken: false,
    // 不自动刷新 Token，关闭后台自动刷新的计时器
    persistSession: false,
  },
});
