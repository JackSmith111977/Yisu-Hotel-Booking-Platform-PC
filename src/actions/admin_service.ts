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

/**
 * 获取所有酒店信息
 * @returns {Promise<HotelInformation[]>} - 所有酒店信息
 */
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

/**
 * 审核通过酒店
 * @param {string} hotelId - 要审核酒店 ID
 * @returns {Promise<void>} - 无返回值
 */
export async function approveHotel(hotelId: string): Promise<void> {
  // 1. 验证输入参数
  if (!hotelId) {
    throw new Error("酒店 ID 不能为空");
  }

  // 2. 更新数据库
  const { error } = await supabase_admin
    .from("hotels")
    .update({
      status: "approved",
      updated_at: new Date().toISOString(),
      // 清空拒绝理由
      rejected_reason: null,
    })
    .eq("id", parseInt(hotelId));

  // 3. 错误处理
  if (error) {
    console.error("审核通过失败", error);
    throw new Error(`审核通过失败: ${error.message}`);
  }
}

export async function rejectHotel(hotelId: string, reason: string): Promise<void> {
  // 1. 验证输入参数
  if (!hotelId) {
    throw new Error("酒店 ID 不能为空");
  }
  if (!reason) {
    throw new Error("拒绝理由不能为空");
  }

  // 优化 1. 先查询当前状态
  const { data: hotel, error: fetchError } = await supabase_admin
    .from("hotels")
    .select("status")
    .eq("id", parseInt(hotelId))
    .single(); // 返回单条数据

  if (fetchError) throw new Error(`查询酒店状态失败: ${fetchError.message}`);
  if (!hotel) throw new Error("酒店不存在");
  if (hotel.status !== "pending") throw new Error("酒店已审核");

  // 2. 更新数据库
  const { error } = await supabase_admin
    .from("hotels")
    .update({ status: "rejected", updated_at: new Date().toISOString(), rejected_reason: reason })
    .eq("id", parseInt(hotelId));

  // 3. 错误处理
  if (error) {
    console.error("驳回酒店失败", error);
    throw new Error(`驳回酒店失败: ${error.message}`);
  }
}
