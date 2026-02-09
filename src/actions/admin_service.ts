"use server";

import { supabase_admin } from "@/lib/supabase_admin";
import { AuditLogs, TrendPoint } from "@/types/AuditLogsType";
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
export async function approveHotel(
  hotelId: string,
  hotelName: string,
  action: string
): Promise<void> {
  // 1. 验证输入参数
  if (!hotelId) {
    throw new Error("酒店 ID 不能为空");
  }
  if (!hotelName) {
    throw new Error("酒店名称不能为空");
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

  // 4. 记录日志
  await recordLog(hotelId, hotelName || "", action);
}

/**
 * 审核驳回酒店
 * @param {string} hotelId - 要驳回酒店 ID
 * @param {string} reason - 驳回理由
 * @returns {Promise<void>} - 无返回值
 */
export async function rejectHotel(
  hotelId: string,
  hotelName: string,
  reason: string
): Promise<void> {
  // 1. 验证输入参数
  if (!hotelId) {
    throw new Error("酒店 ID 不能为空");
  }
  if (!reason) {
    throw new Error("拒绝理由不能为空");
  }
  if (!hotelName) {
    throw new Error("酒店名称不能为空");
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

  // 4. 记录日志
  await recordLog(hotelId, hotelName || "", "reject", reason);
}

/**
 * 下线酒店
 * @param {string} hotelId - 要下线的酒店 ID
 * @returns {Promise<void>} - 无返回值
 */
export async function offlineHotel(hotelId: string, hotelName: string): Promise<void> {
  // 1. 验证输入参数
  if (!hotelId) {
    throw new Error("酒店 ID 不能为空");
  }
  if (!hotelName) {
    throw new Error("酒店名称不能为空");
  }

  // 2. 获取酒店信息
  const { data: hotel, error: fetchError } = await supabase_admin
    .from("hotels")
    .select("status")
    .eq("id", parseInt(hotelId))
    .single();
  if (fetchError) throw new Error(`查询酒店状态失败: ${fetchError.message}`);
  if (!hotel) throw new Error("酒店不存在");
  if (hotel.status !== "approved") throw new Error("酒店未通过审核");

  // 3. 下线酒店
  const { error } = await supabase_admin
    .from("hotels")
    .update({ status: "offline", updated_at: new Date().toISOString() })
    .eq("id", parseInt(hotelId));

  // 4. 错误处理
  if (error) {
    console.error("下线酒店失败", error);
    throw new Error(`下线酒店失败: ${error.message}`);
  }

  // 5. 记录日志
  await recordLog(hotelId, hotelName || "", "offline");
}

/**
 * 获取酒店状态统计
 * @returns {Promise<{ pending: number; online: number; rejected: number; offline: number; total: number }>} - 酒店状态统计
 */
export async function fetchDashboardStats() {
  // 1. 并行查询酒店状态统计
  const [pending, approved, rejected, offline] = await Promise.all([
    supabase_admin
      .from("hotels")
      // exact 模式确保返回准确的计数
      // head: true 只返回计数结果，不返回数据
      .select("*", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase_admin
      .from("hotels")
      .select("*", { count: "exact", head: true })
      .eq("status", "approved"),
    supabase_admin
      .from("hotels")
      .select("*", { count: "exact", head: true })
      .eq("status", "rejected"),
    supabase_admin
      .from("hotels")
      .select("*", { count: "exact", head: true })
      .eq("status", "offline"),
  ]);

  // 2. 错误处理
  if (pending.error || approved.error || rejected.error || offline.error) {
    console.error("查询统计数据失败：", {
      pending: pending.error,
      approved: approved.error,
      rejected: rejected.error,
      offline: offline.error,
    });

    throw new Error("部分统计数据获取失败");
  }

  // 3. 计算总统计
  return {
    pending: pending.count || 0,
    online: approved.count || 0,
    rejected: rejected.count || 0,
    offline: offline.count || 0,
    total:
      (pending.count || 0) + (approved.count || 0) + (rejected.count || 0) + (offline.count || 0),
  };
}

/**
 * 日志记录
 */
async function recordLog(hotelId: string, hotelName: string, action: string, reason?: string) {
  // 1. 验证输入参数
  if (!hotelId) {
    throw new Error("酒店 ID 不能为空");
  }
  if (!hotelName) {
    throw new Error("酒店名称不能为空");
  }
  if (!action) {
    throw new Error("操作不能为空");
  }

  // 2. 写入日志表
  const { error } = await supabase_admin.from("audit_logs").insert({
    target_id: parseInt(hotelId),
    target_name: hotelName,
    action_type: action,
    content: reason || "",
    operator_name: "开发者测试",
  });

  // 3. 错误处理
  if (error) {
    console.error("记录日志失败", error);
  }
}

/**
 * 获取审计日志
 * @returns {Promise<AuditLogs[]>} - 审计日志列表
 */
export async function fetchAuditLogs(): Promise<AuditLogs[]> {
  // 1. 查询审计日志表
  const { data, error } = await supabase_admin
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false });

  // 2. 错误处理
  if (error) {
    console.error("查询审计日志失败", error);
    throw new Error(`查询审计日志失败: ${error.message}`);
  }

  // 3. 返回结果
  return (data as AuditLogs[]).map((row) => ({
    id: row.id.toString(),
    operator_name: row.operator_name,
    action_type: row.action_type,
    target_name: row.target_name,
    created_at: row.created_at,
    content: row.content,
  }));
}

/**
 * 获取操作趋势数据
 * @returns {Promise<{ date: string; count: number }[]>} - 操作趋势数据
 */
export const fetchTrendData = async () => {
  // 获取当前日期，计算七天前的起始时间
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  // 获取七天内的操作时间和操作类型
  const { data, error } = await supabase_admin
    .from("audit_logs")
    .select("created_at, action_type")
    .gte("created_at", startDate.toISOString())
    .in("action_type", ["approve", "reject"]);

  // 错误处理
  if (error) {
    console.error("查询操作趋势数据失败", error);
    throw new Error(`查询操作趋势数据失败: ${error.message}`);
  }

  // 格式化字符串为 MM-DD
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${month}-${day}`;
  };

  // 初始化 7 天的空底表
  const trendMap = new Map<string, TrendPoint>();
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = formatDate(date.toISOString());
    trendMap.set(dateStr, {
      date: dateStr,
      approved: 0,
      rejected: 0,
      total: 0,
    });
  }

  // 归类聚合
  data.forEach((row) => {
    // 该行的日期键
    const dateKey = formatDate(row.created_at);
    // 该日期的趋势点
    const point = trendMap.get(dateKey);
    if (point) {
      if (row.action_type === "approve") {
        point.approved += 1;
      } else if (row.action_type === "reject") {
        point.rejected += 1;
      }
      // 无论 approve 或 reject，都增加 total
      point.total += 1;
    }
  });

  // 返回趋势点数组
  // 翻转数组【七天前，六天前，...，今天】
  return Array.from(trendMap.values()).reverse();
};
