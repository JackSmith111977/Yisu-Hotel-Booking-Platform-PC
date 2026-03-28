# CLAUDE.md - AI 开发上下文配置

**项目**: 酒店预订平台 (Hotel Booking Platform)
**分支**: `feat/doc-first-system`
**最后更新**: 2026-03-28

---

## 📋 快速开始

### 核心命令
```bash
npm run dev          # 启动开发服务器
npm run build        # 生产构建
npm run test         # 运行测试
npm run lint         # 代码检查
```

---

## 🏗 项目架构

### 技术栈
- **Next.js 16.1.6** (App Router) + **React 19.2.3**
- **TypeScript 5.x** (严格模式)
- **Tailwind CSS v4** + **Arco Design**
- **Supabase** (PostgreSQL + Auth + Storage)
- **Zustand** (状态管理) + **SWR** (数据获取)

### 模块分工 (团队配置)
| 成员 | 负责模块 | 文件路径 |
|------|----------|----------|
| Kei | Admin 后台 + 首页 | `src/app/admin/`, `src/app/page.tsx`, `src/components/admin/`, `src/components/home/` |
| 成员 A | 认证模块 | `src/app/login/`, `src/app/register/`, `src/components/auth/`, `src/actions/auth.ts` |
| 成员 B | 酒店商家模块 | `src/app/hotel/`, `src/components/hotel/`, `src/actions/hotels.ts` |

### 目录结构
```
src/
├── actions/          # Server Actions (服务端业务逻辑)
├── app/              # Next.js App Router 页面
├── components/       # React 组件 (按模块划分)
├── hooks/            # 自定义 Hooks
├── lib/              # 工具库与配置
├── store/            # Zustand 状态存储
├── types/            # TypeScript 类型定义
└── __tests__/        # 测试文件
```

---

## 📝 开发规范

### 代码风格
- 使用 **双引号** + **分号**
- 组件使用 **箭头函数** 定义
- 优先使用 **type** 而非 interface
- Server Actions 统一放在 `src/actions/`

### 组件规范
- 展示组件与容器组件分离
- 优先使用 Tailwind CSS 类名
- 复杂样式可抽取或使用 `@apply`

### Git 提交
- 遵循 **Conventional Commits** 规范
- 格式：`type(scope): description`
- 示例：`feat(admin): 添加酒店审核批量操作`

### 测试规范
- 测试框架：**Vitest**
- 测试文件命名：`*.test.ts` 或 `*.test.tsx`
- 放在 `src/__tests__/` 或同目录 `__tests__/`

---

## 🔧 常用操作

### 添加新页面
1. 在 `src/app/` 下创建路由目录
2. 创建 `page.tsx` (页面) 和 `layout.tsx` (布局)
3. 如需要 Server Actions，在 `src/actions/` 添加对应逻辑

### 添加新组件
1. 按模块放在 `src/components/{module}/`
2. 全局共享组件放在 `src/components/global/`
3. 导出统一在组件文件内完成

### 修改数据库 Schema
1. 在 Supabase Dashboard 修改
2. 更新 `src/types/` 下的类型定义
3. 通知团队成员同步变更

---

## ⚠️ 注意事项

### 敏感文件
- **禁止读取**: `.env*`, `*.key`, 凭证文件
- **禁止扫描**: `node_modules/`, `.next/`, `coverage/`

### 代码安全
- 优先使用 Supabase RLS 进行数据权限控制
- Server Actions 中必须进行权限验证
- 避免在客户端暴露敏感逻辑

### 性能考虑
- 大文件修改前先读取确认
- 批量操作分批次执行
- 使用浏览器自动化验证页面

---

## 📚 文档索引

| 文档 | 路径 | 用途 |
|------|------|------|
| PRD | `docs/main/PRD.md` | 产品需求文档 |
| 应用流程 | `docs/main/APP_FLOW.md` | 页面路由和业务流程 |
| 技术栈 | `docs/main/TECH_STACK.md` | 技术选型和配置详情 |
| 前端规范 | `docs/main/FRONTEND_GUIDELINES.md` | 前端开发规范 |
| 后端结构 | `docs/main/BACKEND_STRUCTURE.md` | 后端服务和 API 规范 |
| 现状分析 | `docs/migration/current-status.md` | 项目现状分析 |
| 迁移计划 | `docs/migration/migration-plan.md` | 迁移路线图 |
| 实现计划 | `docs/migration/IMPLEMENTATION_PLAN.md` | 具体实现计划 |

---

*本文档由 AI 自动生成，供团队成员和 AI 助手使用*
