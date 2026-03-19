import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import {
  fetchHotelsList,
  approveHotel,
  rejectHotel,
  offlineHotel,
  fetchDashboardStats,
  fetchAuditLogs,
  fetchTrendData,
  fetchHotelRoomTypes,
} from "@/actions/admin_service";

/**
 * ============================================================================
 * 类型定义区
 * ============================================================================
 */
interface SupabaseResponse {
  data: unknown;
  error: unknown;
  count?: number | null;
}

type OnFulfilled = (value: SupabaseResponse) => unknown;

/**
 * 显式定义 Mock 方法，支持 Supabase 链式调用
 */
interface MockChain {
  from: Mock;
  select: Mock;
  update: Mock;
  insert: Mock;
  eq: Mock;
  order: Mock;
  single: Mock;
  gte: Mock;
  in: Mock;
  then: (onFulfilled: OnFulfilled) => Promise<unknown>;
}

/**
 * ============================================================================
 * 变量提升区 (Hoisting)
 * 使用 vi.hoisted 确保 Mock 函数在所有 vi.mock 之前被初始化
 * ============================================================================
 */
const { mockSupabaseInstance } = vi.hoisted(() => {
  const createMockChain = (): MockChain => {
    const chain = {
      from: vi.fn(),
      select: vi.fn(),
      update: vi.fn(),
      insert: vi.fn(),
      eq: vi.fn(),
      order: vi.fn(),
      single: vi.fn(),
      gte: vi.fn(),
      in: vi.fn(),
    } as unknown as MockChain;

    // 为每个方法配置返回自身，从而支持无限链式调用
    const keys: Array<keyof Omit<MockChain, "then">> = [
      "from",
      "select",
      "update",
      "insert",
      "eq",
      "order",
      "single",
      "gte",
      "in",
    ];

    keys.forEach((key) => {
      chain[key].mockReturnValue(chain);
    });

    // 特殊处理：使 Mock 对象本身也是可等待的 (Thenable)
    chain.then = (onFulfilled: OnFulfilled) => {
      return Promise.resolve({ data: null, error: null } as SupabaseResponse).then(onFulfilled);
    };

    return chain;
  };

  const mockSupabaseInstance = createMockChain();
  return { mockSupabaseInstance };
});

/**
 * ============================================================================
 * 模块模拟区 (Mocks)
 * ============================================================================
 */

// 1. 模拟 Supabase 客户端管理端
vi.mock("@/lib/supabase_admin", () => ({
  supabase_admin: mockSupabaseInstance,
}));

// 2. 模拟 Next.js 缓存与导航原语
vi.mock("next/cache", () => ({
  unstable_cache: vi.fn((fn: (...args: unknown[]) => unknown) => fn),
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

// 3. 模拟 Next.js Headers
vi.mock("next/headers", () => ({
  cookies: vi.fn().mockResolvedValue({
    get: vi.fn().mockReturnValue({ value: "mock-token" }),
  }),
}));

// 4. 模拟 JWT 验证逻辑
vi.mock("@/lib/jwt", () => ({
  verifyJWT: vi.fn().mockResolvedValue({
    valid: true,
    user: { id: "user-123", username: "admin-user" },
  }),
}));

/**
 * ============================================================================
 * 测试套件 (Test Suite)
 * ============================================================================
 */
describe("admin_service - 业务逻辑与错误处理全覆盖测试", () => {
  // 类型安全的 Mock 引用
  const m = mockSupabaseInstance as MockChain;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2024-03-16T10:00:00Z"));

    // 重置 then 方法的默认行为，确保每个测试用例独立
    m.then = (onFulfilled: OnFulfilled) => {
      return Promise.resolve({ data: null, error: null } as SupabaseResponse).then(onFulfilled);
    };
  });

  /**
   * 辅助函数：快速配置链式调用的最终返回值
   */
  const mockResponse = (data: unknown, error: unknown = null) => {
    m.then = (onFulfilled: OnFulfilled) => {
      return Promise.resolve({ data, error } as SupabaseResponse).then(onFulfilled);
    };
  };

  /**
   * --------------------------------------------------------------------------
   * 测试模块 1: fetchHotelsList
   * --------------------------------------------------------------------------
   */
  describe("fetchHotelsList", () => {
    it("正常流: 应该正确转换字段并拼接 region 地址", async () => {
      mockResponse([
        {
          id: 101,
          name_zh: "云端酒店",
          address: "科技大道 88 号",
          region: JSON.stringify(["广东省", "深圳市"]),
          status: "approved",
          updated_at: "2024-03-16T12:00:00Z",
        },
      ]);

      const result = await fetchHotelsList();

      expect(m.from).toHaveBeenCalledWith("hotels");
      expect(result[0].address).toBe("广东省深圳市科技大道 88 号");
    });

    it("异常流: 当 Supabase 返回错误时应抛出 Error", async () => {
      mockResponse(null, { message: "Database connection failed" });
      await expect(fetchHotelsList()).rejects.toThrow("Database connection failed");
    });

    it("容错流: 当 region 解析失败时应降级使用原始 address", async () => {
      mockResponse([
        {
          id: 102,
          address: "原始街道",
          region: "invalid-json",
          updated_at: "2024-03-16T12:00:00Z",
        },
      ]);

      const result = await fetchHotelsList();
      expect(result[0].address).toBe("原始街道");
    });
  });

  /**
   * --------------------------------------------------------------------------
   * 测试模块 2: approveHotel
   * --------------------------------------------------------------------------
   */
  describe("approveHotel", () => {
    it("正常流: 应该成功更新状态并记录日志", async () => {
      mockResponse(null, null);
      await approveHotel("101", "云端酒店", "approve");
      expect(m.update).toHaveBeenCalledWith(expect.objectContaining({ status: "approved" }));
    });

    it("校验流: 酒店 ID 或名称缺失应抛出错误", async () => {
      await expect(approveHotel("", "酒店", "action")).rejects.toThrow("酒店 ID 不能为空");
      await expect(approveHotel("101", "", "action")).rejects.toThrow("酒店名称不能为空");
    });

    it("异常流: 更新数据库失败应抛出 Error", async () => {
      mockResponse(null, { message: "Update failed" });
      await expect(approveHotel("101", "酒店", "action")).rejects.toThrow(
        "审核通过失败: Update failed"
      );
    });
  });

  /**
   * --------------------------------------------------------------------------
   * 测试模块 3: rejectHotel
   * --------------------------------------------------------------------------
   */
  describe("rejectHotel", () => {
    it("校验流: 驳回理由缺失应抛出错误", async () => {
      await expect(rejectHotel("101", "酒店", "")).rejects.toThrow("拒绝理由不能为空");
    });

    it("逻辑流: 酒店不存在应抛出错误", async () => {
      mockResponse(null, null); // 模拟查询结果为空
      await expect(rejectHotel("101", "酒店", "理由")).rejects.toThrow("酒店不存在");
    });

    it("逻辑流: 酒店已审核应抛出错误", async () => {
      mockResponse({ status: "approved" }); // 模拟已通过状态
      await expect(rejectHotel("101", "酒店", "理由")).rejects.toThrow("酒店已审核");
    });

    it("异常流: 查询酒店状态失败应抛出 Error", async () => {
      mockResponse(null, { message: "Fetch failed" });
      await expect(rejectHotel("101", "酒店", "理由")).rejects.toThrow(
        "查询酒店状态失败: Fetch failed"
      );
    });
  });

  /**
   * --------------------------------------------------------------------------
   * 测试模块 4: offlineHotel
   * --------------------------------------------------------------------------
   */
  describe("offlineHotel", () => {
    it("逻辑流: 未通过审核的酒店不允许下线", async () => {
      mockResponse({ status: "pending" });
      await expect(offlineHotel("101", "酒店")).rejects.toThrow("酒店未通过审核");
    });

    it("异常流: 下线操作数据库失败应抛出 Error", async () => {
      mockResponse({ status: "approved" }); // 先通过状态校验
      // 模拟第二次调用（update）失败
      let callCount = 0;
      m.then = (onFulfilled: OnFulfilled) => {
        const results = [
          { data: { status: "approved" }, error: null },
          { data: null, error: { message: "Offline failed" } },
        ];
        return Promise.resolve(results[callCount++] as SupabaseResponse).then(onFulfilled);
      };
      await expect(offlineHotel("101", "酒店")).rejects.toThrow("下线酒店失败: Offline failed");
    });
  });

  /**
   * --------------------------------------------------------------------------
   * 测试模块 5: fetchDashboardStats
   * --------------------------------------------------------------------------
   */
  describe("fetchDashboardStats", () => {
    it("异常流: 部分统计数据获取失败应抛出 Error", async () => {
      let callCount = 0;
      m.then = (onFulfilled: OnFulfilled) => {
        // 模拟第三个查询失败
        const results = [
          { count: 1, error: null },
          { count: 1, error: null },
          { count: null, error: { message: "Count failed" } },
          { count: 1, error: null },
        ];
        return Promise.resolve(results[callCount++] as SupabaseResponse).then(onFulfilled);
      };
      await expect(fetchDashboardStats()).rejects.toThrow("部分统计数据获取失败");
    });
  });

  /**
   * --------------------------------------------------------------------------
   * 测试模块 6: fetchAuditLogs
   * --------------------------------------------------------------------------
   */
  describe("fetchAuditLogs", () => {
    it("正常流: 应该从 Supabase 获取原始日志并正确转换 ID 和字段", async () => {
      const mockRawLogs = [
        {
          id: 1001,
          operator_name: "管理员 A",
          action_type: "approve",
          target_name: "丽景酒店",
          created_at: "2024-03-16T10:00:00Z",
          content: "通过初审",
        },
        {
          id: 1002,
          operator_name: "管理员 B",
          action_type: "reject",
          target_name: "海滨旅馆",
          created_at: "2024-03-16T11:00:00Z",
          content: "证件模糊",
        },
      ];

      mockResponse(mockRawLogs);

      const logs = await fetchAuditLogs();

      expect(m.from).toHaveBeenCalledWith("audit_logs");
      expect(m.select).toHaveBeenCalledWith("*");
      expect(m.order).toHaveBeenCalledWith("created_at", { ascending: false });

      expect(logs).toHaveLength(2);
      // 验证转换逻辑：bigint/number 类型的 ID 应转换为 string
      expect(logs[0].id).toBe("1001");
      expect(logs[0].operator_name).toBe("管理员 A");
      expect(logs[1].id).toBe("1002");
    });

    it("异常流: 查询日志失败应抛出 Error", async () => {
      mockResponse(null, { message: "Fetch logs failed" });
      await expect(fetchAuditLogs()).rejects.toThrow("查询审计日志失败: Fetch logs failed");
    });
  });

  /**
   * --------------------------------------------------------------------------
   * 测试模块 7: fetchTrendData
   * --------------------------------------------------------------------------
   */
  describe("fetchTrendData", () => {
    it("正常流: 应该正确计算过去 7 天的日期并聚合 approve/reject 计数", async () => {
      // 模拟过去两天的操作数据
      const mockLogs = [
        { created_at: "2024-03-16T08:00:00Z", action_type: "approve" },
        { created_at: "2024-03-16T09:00:00Z", action_type: "approve" },
        { created_at: "2024-03-15T10:00:00Z", action_type: "reject" },
      ];

      mockResponse(mockLogs);

      const trend = await fetchTrendData();

      // 验证查询条件：gte 应包含 7 天前的起始时间
      expect(m.from).toHaveBeenCalledWith("audit_logs");
      expect(m.gte).toHaveBeenCalled();
      expect(m.in).toHaveBeenCalledWith("action_type", ["approve", "reject"]);

      // 验证返回结果结构 (7 天数据)
      expect(trend).toHaveLength(7);

      // 验证今天的聚合逻辑 (03-16)
      const todayData = trend.find((p) => p.date === "03-16");
      expect(todayData).toBeDefined();
      expect(todayData?.approved).toBe(2);
      expect(todayData?.rejected).toBe(0);
      expect(todayData?.total).toBe(2);

      // 验证昨天的聚合逻辑 (03-15)
      const yesterdayData = trend.find((p) => p.date === "03-15");
      expect(yesterdayData?.rejected).toBe(1);
      expect(yesterdayData?.total).toBe(1);

      // 验证排序：数组应按日期升序排列（七天前 -> 今天）
      // 源码中使用了 .reverse() 翻转 trendMap.values()
      expect(trend[6].date).toBe("03-16"); // 最后一个是今天
      expect(trend[5].date).toBe("03-15"); // 倒数第二个是昨天
    });

    it("异常流: 查询趋势数据失败应抛出 Error", async () => {
      mockResponse(null, { message: "Fetch trend failed" });
      await expect(fetchTrendData()).rejects.toThrow("查询操作趋势数据失败: Fetch trend failed");
    });
  });

  /**
   * --------------------------------------------------------------------------
   * 测试模块 8: fetchHotelRoomTypes
   * --------------------------------------------------------------------------
   */
  describe("fetchHotelRoomTypes", () => {
    it("正常流: 应该从 Supabase 获取房型信息并正确转换 ID", async () => {
      const mockRawRooms = [
        {
          id: 5001,
          name: "行政套房",
          price: 1200,
          quantity: 5,
          size: "45sqm",
          description: "含双早",
          max_guests: 2,
          beds: [{ type: "King", count: 1 }],
          images: ["room1.jpg"],
          facilities: ["Wifi", "TV"],
          hotel_id: 101,
        },
      ];

      mockResponse(mockRawRooms);

      const rooms = await fetchHotelRoomTypes("101");

      expect(m.from).toHaveBeenCalledWith("room_types");
      expect(m.eq).toHaveBeenCalledWith("hotel_id", 101);
      expect(rooms).toHaveLength(1);
      expect(rooms[0].id).toBe("5001"); // 验证 ID 转换
      expect(rooms[0].hotel_id).toBe("101");
      expect(rooms[0].beds).toEqual([{ type: "King", count: 1 }]);
    });

    it("边界流: 当 hotelId 为空时应返回空数组", async () => {
      const result = await fetchHotelRoomTypes("");
      expect(result).toEqual([]);
      expect(m.from).not.toHaveBeenCalled();
    });

    it("异常流: 查询失败应返回空数组并打印错误", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockResponse(null, { message: "Fetch rooms failed" });
      const result = await fetchHotelRoomTypes("101");
      expect(result).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });
});
