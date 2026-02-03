"use server";

import { supabase_admin } from "@/lib/supabase_admin";
import { HotelInformation } from "@/types/HotelInformation";

/**
 * 数据库行结构
 */
interface HotelDBRow {
  id: number;
  name_zh: string;
  name_en: string;
  address: string;
  star_rating: number;
  opening_date: string;
  contact_phone: string;
  image: string | null;
  status: string;
  merchant_id: string;
  updated_at: string;
  rejected_reason: string | null;
  region: string;
  album: string[] | null;
}

export async function fetchHotelsList(): Promise<HotelInformation[]> {
  // 获取所有酒店信息，并捕获错误
  const { data, error } = await supabase_admin
    .from("hotels")
    .select("*")
    .order("updated_at", { ascending: false });

  // 错误处理
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }

  // 数据解析
  return (data as HotelDBRow[]).map((row) => {
    // 合并完整地址
    let fullAddress = row.address;
    try {
      // 解析 region 地区
      const region = JSON.parse(row.region);
      if (Array.isArray(region)) {
        // 合并地区和地址
        fullAddress = region.join("") + row.address;
      }
    } catch (error) {
      console.warn(`failed to parse region for hotel: ${row.id}`, error);
    }

    // 3. 映射字段
    return {
      id: row.id.toString(), // bigint 转 string
      nameZh: row.name_zh,
      nameEn: row.name_en,
      merchantId: row.merchant_id,
      updatedAt: row.updated_at, // 数据库自带 ISO 时间格式
      contactPhone: row.contact_phone || "暂无",
      starRating: row.star_rating || 0,
      openingDate: row.opening_date || "",
      rejectedReason: row.rejected_reason || undefined,

      // 映射封面图: image -> coverImage
      coverImage: row.image || "",

      status: row.status as HotelInformation["status"],
      address: fullAddress, // 使用拼接后的地址

      // 映射图集: album -> images
      // Postgres 的 text[] 会被 supabase-js 自动转换为 JS 数组
      // 如果 album 为 null，则给空数组
      images: row.album || [],

      // UI 补充字段 (数据库暂无)
      // description: "暂无详细描述",
      // amenities: [],
    };
  });
}
