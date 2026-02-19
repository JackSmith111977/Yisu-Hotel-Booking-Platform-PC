import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!url || !key) {
  throw new Error("Missing Supabase URL or Anon Key");
}

/**
 * Supabase 商户端
 * 携带用户 token，受 RLS 限制，只能访问自己的数据
 */
export async function createMerchantClient() {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    return createClient(url, key, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
    });
  }