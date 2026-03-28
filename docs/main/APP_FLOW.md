# 应用流程图 (APP_FLOW)

**项目**: 酒店预订平台
**最后更新**: 2026-03-28

---

## 1. 路由结构

### 1.1 路由总览
```
/ (首页)
├── /login (登录)
├── /register (注册)
├── /admin/* (管理员后台 - 需要 admin 权限)
│   ├── /admin/dashboard (仪表盘)
│   ├── /admin/audit (审核管理)
│   ├── /admin/online (上线管理)
│   ├── /admin/logs (日志系统)
│   └── /admin/settings (系统设置)
└── /hotel/* (商户前台 - 需要 merchant 权限)
    ├── /hotel/dashboard (概览)
    ├── /hotel/management (酒店管理)
    ├── /hotel/todo (待办事项)
    └── /hotel/settings (设置)
```

### 1.2 页面文件映射
| 路由 | 文件路径 | 负责人 |
|------|----------|--------|
| `/` | `src/app/page.tsx` | Kei |
| `/login` | `src/app/login/page.tsx` | 成员 A |
| `/register` | `src/app/register/page.tsx` | 成员 A |
| `/admin` | `src/app/admin/page.tsx` | Kei |
| `/admin/dashboard` | `src/app/admin/dashboard/page.tsx` | Kei |
| `/admin/audit` | `src/app/admin/audit/page.tsx` | Kei |
| `/admin/online` | `src/app/admin/online/page.tsx` | Kei |
| `/admin/logs` | `src/app/admin/logs/page.tsx` | Kei |
| `/admin/settings` | `src/app/admin/settings/page.tsx` | Kei |
| `/hotel` | `src/app/hotel/page.tsx` | 成员 B |
| `/hotel/dashboard` | `src/app/hotel/dashboard/page.tsx` | 成员 B |
| `/hotel/management` | `src/app/hotel/management/page.tsx` | 成员 B |
| `/hotel/todo` | `src/app/hotel/todo/page.tsx` | 成员 B |
| `/hotel/settings` | `src/app/hotel/settings/page.tsx` | 成员 B |

---

## 2. 权限控制流程

### 2.1 Middleware 权限检查
```
用户请求
    ↓
Middleware (src/middleware.ts)
    ↓
检查 Session (Supabase Auth)
    ↓
┌───────────────┬───────────────┐
│   未登录       │    已登录      │
│   ↓           │    ↓          │
│  重定向到      │   检查角色     │
│  /login       │   ↓           │
│              │ ┌───┴───┐     │
│              │ │ admin │ merchant │
│              │ │  ↓    │   ↓   │
│              │ │/admin/*│/hotel/*│
│              │ └───────┴───────┘
```

### 2.2 路由保护规则
| 路由前缀 |  required 角色 | 未授权处理 |
|----------|--------------|------------|
| `/admin/*` | `admin` | 重定向到 `/login` |
| `/hotel/*` | `merchant` | 重定向到 `/login` |
| `/login` | 未登录 | 已登录重定向到对应首页 |
| `/register` | 未登录 | 已登录重定向到对应首页 |

---

## 3. 核心业务流程

### 3.1 登录流程
```
用户访问 /login
    ↓
输入邮箱 + 验证码
    ↓
调用 Server Action (auth.ts)
    ↓
验证验证码 (verify_codes 表)
    ↓
创建 Supabase Session
    ↓
查询 users 表获取角色
    ↓
┌───────────────┬───────────────┐
│    admin      │    merchant   │
│      ↓        │       ↓       │
│ 重定向到      │  重定向到      │
│ /admin        │ /hotel        │
```

**相关文件**:
- 页面：`src/app/login/page.tsx`
- 组件：`src/components/auth/LoginForm.tsx`
- Action: `src/actions/auth.ts`

---

### 3.2 注册流程
```
用户访问 /register
    ↓
输入邮箱
    ↓
发送验证码 (nodemailer)
    ↓
填写用户名 + 密码
    ↓
调用 Server Action (auth.ts)
    ↓
创建 Supabase Auth User
    ↓
创建 users 表记录 (role=merchant)
    ↓
自动登录并重定向到 /hotel
```

**相关文件**:
- 页面：`src/app/register/page.tsx`
- 组件：`src/components/auth/RegisterForm.tsx`
- Action: `src/actions/auth.ts`
- 工具：`src/lib/email.ts`

---

### 3.3 酒店入驻流程 (商户端)
```
商户访问 /hotel/management
    ↓
点击"创建酒店"
    ↓
填写酒店信息
├── 基本信息 (名称、地址、星级)
├── 上传图片 (封面图、相册)
├── 选择标签
└── 添加房型
    ↓
保存草稿 (status=draft)
    ↓
提交审核 (status=pending)
    ↓
调用 Server Action (hotels.ts)
    ↓
写入 hotels 表
```

**相关文件**:
- 页面：`src/app/hotel/management/page.tsx`
- 组件：`src/components/hotel/HotelModal.tsx`
- 组件：`src/components/hotel/ImageUploader.tsx`
- Action: `src/actions/hotels.ts`

---

### 3.4 酒店审核流程 (管理员端)
```
管理员访问 /admin/audit
    ↓
查看待审核列表 (status=pending)
    ↓
点击酒店查看详情
    ↓
选择审核结果
├── 通过 → status=approved
└── 驳回 → status=rejected + rejected_reason
    ↓
调用 Server Action (admin_service.ts)
    ↓
记录 audit_logs
    ↓
通知商户 (可选)
```

**相关文件**:
- 页面：`src/app/admin/audit/page.tsx`
- 组件：`src/components/admin/AuditTable.tsx`
- 组件：`src/components/admin/RejectModal.tsx`
- Action: `src/actions/admin_service.ts`

---

## 4. 数据流图

### 4.1 Server Actions 架构
```
┌─────────────────────────────────────────┐
│           Client Components             │
│  (src/components/*, src/app/*/page.tsx) │
└───────────────────┬─────────────────────┘
                    │ Server Actions
                    ↓
┌─────────────────────────────────────────┐
│           Server Actions                │
│  (src/actions/*.ts)                     │
│  ├── auth.ts         (认证相关)          │
│  ├── hotels.ts       (酒店相关)          │
│  ├── admin_service.ts(管理员相关)        │
│  └── user.ts         (用户相关)          │
└───────────────────┬─────────────────────┘
                    │
                    ↓
┌─────────────────────────────────────────┐
│              Supabase                   │
│  (PostgreSQL + Auth + Storage)          │
│  ├── hotels        (酒店表)             │
│  ├── room_types    (房型表)             │
│  ├── users         (用户表)             │
│  ├── audit_logs    (日志表)             │
│  ├── tags          (标签表)             │
│  └── verify_codes  (验证码表)           │
└─────────────────────────────────────────┘
```

### 4.2 状态管理架构
```
┌─────────────────────────────────────────┐
│            Zustand Stores               │
│  (src/store/*.ts)                       │
│  ├── useUserStore    (用户信息)          │
│  ├── useThemeStore   (主题设置)          │
│  └── useMessageStore (消息提示)          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         SWR (数据获取与缓存)             │
│  (src/hooks/*.ts)                       │
│  └── useHotels       (酒店数据)          │
└─────────────────────────────────────────┘
```

---

## 5. 组件层级关系

### 5.1 Admin 端组件树
```
src/app/admin/layout.tsx
├── Nav (侧边导航)
├── page.tsx
│   └── dashboard-view.tsx
│       ├── StatCard (统计卡片)
│       ├── TodayEfficiencyCard (效率卡片)
│       └── TrendAreaChart (趋势图)
├── audit/page.tsx
│   └── AuditTable (审核表格)
│       └── AuditDrawer (详情抽屉)
├── online/page.tsx
│   └── OnlineTable (上线表格)
├── logs/page.tsx
│   └── LogsTable (日志表格)
└── settings/page.tsx
    ├── ProfileSettings (个人资料)
    └── AppearanceSettings (外观设置)
```

### 5.2 Hotel 端组件树
```
src/app/hotel/layout.tsx
├── Nav (侧边导航)
├── dashboard/page.tsx
│   └── StatusEChart (状态图表)
├── management/page.tsx
│   ├── CreateButton (创建按钮)
│   ├── MineTable (酒店列表)
│   └── HotelModal (酒店编辑弹窗)
│       ├── ImageUploader (图片上传)
│       ├── HotelTagSelector (酒店标签)
│       └── RoomTagSelector (房型标签)
├── todo/page.tsx
└── settings/page.tsx
```

---

## 6. API/Action 调用关系

### 6.1 Server Actions 清单
| Action 文件 | 导出函数 | 调用方 |
|------------|---------|--------|
| `auth.ts` | `login()` | LoginForm |
| `auth.ts` | `register()` | RegisterForm |
| `auth.ts` | `logout()` | Nav |
| `auth.ts` | `sendVerifyCode()` | RegisterForm |
| `hotels.ts` | `createHotel()` | HotelModal |
| `hotels.ts` | `updateHotel()` | HotelModal |
| `hotels.ts` | `submitForAudit()` | HotelModal |
| `hotels.ts` | `getHotelsByMerchant()` | MineTable |
| `admin_service.ts` | `approveHotel()` | AuditTable |
| `admin_service.ts` | `rejectHotel()` | RejectModal |
| `admin_service.ts` | `getPendingHotels()` | AuditTable |
| `user.ts` | `getUserProfile()` | ProfileSettings |
| `user.ts` | `updateUserProfile()` | ProfileSettings |

---

*本文档由 AI 生成，供团队开发和 AI 助手参考*
