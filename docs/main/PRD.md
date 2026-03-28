# 产品需求文档 (PRD)

**项目名称**: 酒店预订平台 (Hotel Booking Platform)
**版本**: 0.1.0
**最后更新**: 2026-03-28

---

## 1. 产品概述

### 1.1 产品定位
一个基于 Next.js 16 的现代化酒店预订管理平台，集成**管理员后台审核**与**商户前台管理**功能，采用 B/S 架构，通过 Web 浏览器访问。

### 1.2 目标用户
| 用户角色 | 描述 | 核心需求 |
|----------|------|----------|
| **平台管理员** | 平台运营人员 | 酒店入驻审核、上线管理、系统监控 |
| **商户** | 酒店商家 | 酒店信息管理、房型管理、订单处理 |
| **C 端用户** | 预订客户 | 酒店搜索、房型查看、在线预订 |

### 1.3 核心价值
- **对管理员**: 高效的酒店审核流程，规范的平台管理
- **对商户**: 便捷的酒店信息维护，实时的订单管理
- **对游客**: 丰富的酒店选择，透明的价格信息

---

## 2. 功能需求

### 2.1 管理员端 (Admin Portal)

#### 2.1.1 仪表盘 (Dashboard)
- **功能描述**: 查看平台整体数据概览
- **核心指标**:
  - 待审核酒店数量
  - 今日新增酒店
  - 已上线酒店总数
  - 用户增长趋势
- **文件位置**: `src/app/admin/dashboard/page.tsx`

#### 2.1.2 审核管理 (Audit)
- **功能描述**: 酒店入驻审核
- **核心操作**:
  - 查看待审核酒店列表
  - 审核通过/驳回
  - 填写驳回原因
- **文件位置**: `src/app/admin/audit/page.tsx`

#### 2.1.3 上线管理 (Online)
- **功能描述**: 管理已上线酒店的状态
- **核心操作**:
  - 查看已上线酒店
  - 下线操作
  - 搜索与筛选
- **文件位置**: `src/app/admin/online/page.tsx`

#### 2.1.4 日志系统 (Logs)
- **功能描述**: 查看系统操作日志
- **核心功能**:
  - 操作记录查询
  - 按时间/操作人筛选
- **文件位置**: `src/app/admin/logs/page.tsx`

#### 2.1.5 系统设置 (Settings)
- **功能描述**: 平台基础设置
- **核心功能**:
  - 个人资料修改
  - 外观设置
  - 标签管理
- **文件位置**: `src/app/admin/settings/page.tsx`

---

### 2.2 商户端 (Merchant Portal)

#### 2.2.1 概览 (Dashboard)
- **功能描述**: 查看酒店经营数据
- **核心指标**:
  - 酒店状态
  - 待办事项
  - 经营数据趋势
- **文件位置**: `src/app/hotel/dashboard/page.tsx`

#### 2.2.2 酒店管理 (Management)
- **功能描述**: 创建和编辑酒店信息
- **核心功能**:
  - 基本信息编辑
  - 图片上传与裁剪
  - 房型管理
  - 草稿保存
- **文件位置**: `src/app/hotel/management/page.tsx`

#### 2.2.3 草稿箱 (Draft)
- **功能描述**: 保存未提交的酒店信息草稿
- **核心功能**:
  - 查看草稿列表
  - 继续编辑
  - 提交审核
- **文件位置**: `src/app/hotel/management/` (草稿列表组件)

#### 2.2.4 待办事项 (Todo)
- **功能描述**: 商户待处理任务
- **核心功能**:
  - 任务列表
  - 任务状态更新
- **文件位置**: `src/app/hotel/todo/page.tsx`

#### 2.2.5 设置 (Settings)
- **功能描述**: 商户个人及账户设置
- **核心功能**:
  - 个人资料
  - 账户安全
- **文件位置**: `src/app/hotel/settings/page.tsx`

---

### 2.3 认证系统

#### 2.3.1 登录 (Login)
- **功能描述**: 统一登录入口
- **核心功能**:
  - 邮箱 + 验证码登录
  - 角色自动识别 (Admin/Merchant)
- **文件位置**: `src/app/login/page.tsx`

#### 2.3.2 注册 (Register)
- **功能描述**: 商户注册入口
- **核心功能**:
  - 邮箱验证
  - 商户信息填写
- **文件位置**: `src/app/register/page.tsx`

---

## 3. 业务流程

### 3.1 酒店入驻流程
```
商户注册 → 创建酒店 → 保存草稿 → 提交审核 → 管理员审核 → (通过) 上线展示
                                              ↓
                                         (驳回) 商户修改重新提交
```

### 3.2 酒店状态流转
```
Draft (草稿) → Pending (待审核) → Approved (已通过) → Online (已上线)
                                   ↓
                            Rejected (已驳回)
                                   ↓
                            Offline (已下线)
```

---

## 4. 数据模型

### 4.1 核心实体

#### Hotel (酒店)
- `id`: 酒店 ID
- `nameZh`: 中文名称
- `nameEn`: 英文名称
- `address`: 详细地址
- `starRating`: 星级 (1-5)
- `status`: 状态 (draft/pending/approved/rejected/offline)
- `merchantId`: 所属商户 ID
- `region`: 省市区 JSON
- `album`: 酒店相册
- `tags`: 标签列表

#### RoomType (房型)
- `id`: 房型 ID
- `hotelId`: 所属酒店 ID
- `name`: 房型名称
- `price`: 价格
- `size`: 面积
- `quantity`: 房间数量
- `maxGuests`: 最大入住人数
- `beds`: 床型配置 JSON
- `facilities`: 设施标签 JSON
- `images`: 图片列表 JSON

#### User (用户)
- `id`: 用户 ID (Supabase Auth)
- `email`: 邮箱
- `username`: 用户名
- `role`: 角色 (admin/merchant)
- `avatar`: 头像 URL
- `nickname`: 昵称

#### AuditLog (审计日志)
- `id`: 日志 ID
- `operatorName`: 操作人姓名
- `actionType`: 动作类型
- `targetName`: 操作对象名称
- `content`: 操作详情
- `createdAt`: 记录时间

---

## 5. 非功能性需求

### 5.1 性能要求
- 首页加载时间 < 3s
- 列表页面响应时间 < 1s
- 图片上传支持断点续传

### 5.2 安全要求
- 所有 API 请求必须经过身份验证
- 敏感操作需要权限校验
- 使用 Supabase RLS 实现行级安全

### 5.3 可用性要求
- 支持 99.9% 可用性
- 关键操作有确认提示
- 错误操作可回退

---

## 6. 技术约束

### 6.1 技术栈
- Next.js 16.1.6 (App Router)
- React 19.2.3
- TypeScript 5.x
- Supabase (PostgreSQL)

### 6.2 浏览器兼容性
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

*本文档由 AI 生成，供团队开发和 AI 助手参考*
