# 迁移计划 (MIGRATION_PLAN)

**项目**: 酒店预订平台
**分支**: `feat/doc-first-system`
**最后更新**: 2026-03-28

---

## 1. 现状分析

### 1.1 已完成
- ✅ 项目现状分析 (`docs/migration/current-status.md`)
- ✅ AI 开发基础配置 (`.claude/settings.json`)
- ✅ 核心开发文档 (`CLAUDE.md`)
- ✅ 产品需求文档 (`docs/main/PRD.md`)
- ✅ 应用流程文档 (`docs/main/APP_FLOW.md`)
- ✅ 技术栈文档 (`docs/main/TECH_STACK.md`)
- ✅ 前端开发规范 (`docs/main/FRONTEND_GUIDELINES.md`)
- ✅ 后端服务结构 (`docs/main/BACKEND_STRUCTURE.md`)

### 1.2 待完成
- [ ] 技术债务优化
- [ ] 模块边界文档
- [ ] 接口契约文档
- [ ] 实现计划文档

---

## 2. 技术债务清单

### 2.1 需优化的问题
| 优先级 | 问题描述 | 影响模块 | 建议方案 |
|--------|----------|----------|----------|
| 高 | Server Actions 错误处理不统一 | 全部 | 统一返回格式 `ActionResult<T>` |
| 中 | 部分组件类型定义不完整 | Admin/Hotel | 补充完整的 TypeScript 类型 |
| 中 | 测试覆盖率不足 | 全部 | 增加关键业务的单元测试 |
| 低 | 代码注释不足 | 全部 | 添加 JSDoc 注释 |

### 2.2 优化计划
```
阶段 1 (本周): 统一 Server Actions 错误处理
阶段 2 (下周): 补充类型定义
阶段 3 (下周): 增加测试覆盖
阶段 4 (后续): 完善代码注释
```

---

## 3. 模块边界定义

### 3.1 Admin 模块 (负责人：Kei)
**负责范围**:
- `src/app/admin/` - 管理员所有页面
- `src/app/page.tsx` - 首页
- `src/components/admin/` - 管理员组件
- `src/components/home/` - 首页组件
- `src/actions/admin_service.ts` - 管理员服务

**依赖接口**:
- 无外部依赖，独立完整

---

### 3.2 认证模块 (负责人：成员 A)
**负责范围**:
- `src/app/login/` - 登录页
- `src/app/register/` - 注册页
- `src/components/auth/` - 认证组件
- `src/actions/auth.ts` - 认证服务
- `src/lib/email.ts` - 邮件发送
- `src/lib/jwt.ts` - JWT 工具

**依赖接口**:
- `users` 表 - 用户数据

---

### 3.3 酒店商家模块 (负责人：成员 B)
**负责范围**:
- `src/app/hotel/` - 商户所有页面
- `src/components/hotel/` - 商户组件
- `src/actions/hotels.ts` - 酒店服务
- `src/hooks/useHotels.ts` - 酒店数据 hooks

**依赖接口**:
- `hotels` 表 - 酒店数据
- `room_types` 表 - 房型数据
- `tags` 表 - 标签数据

---

## 4. 模块间接口契约

### 4.1 认证模块 → 其他模块
```typescript
// 认证成功后提供的用户信息
interface User {
  id: string
  email: string
  role: 'admin' | 'merchant'
  avatar?: string
  nickname?: string
}

// 其他模块通过 useUserStore 获取
import { useUserStore } from '@/store/useUserStore'
const { user } = useUserStore()
```

### 4.2 酒店模块 → Admin 模块
```typescript
// 酒店数据结构 (双方共享)
interface Hotel {
  id: string
  nameZh: string
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'offline'
  // ... 其他字段
}

// Admin 模块调用酒店服务进行审核
import { approveHotel, rejectHotel } from '@/actions/hotels'
```

---

## 5. 协作流程

### 5.1 代码审查流程
```
开发者提交代码
    ↓
创建 Pull Request
    ↓
团队成员审查 (至少 1 人)
    ↓
审查通过 → 合并到 main 分支
    ↓
审查不通过 → 返回修改
```

### 5.2 接口变更流程
```
发现需要变更接口
    ↓
更新类型定义 (src/types/)
    ↓
通知相关模块负责人
    ↓
同步更新实现代码
    ↓
更新本文档
```

### 5.3 数据库变更流程
```
在 Supabase Dashboard 修改 Schema
    ↓
更新类型定义 (src/types/)
    ↓
通知所有团队成员
    ↓
更新相关 Server Actions
    ↓
测试验证
```

---

## 6. 里程碑计划

### 阶段 1: 文档体系建设 (当前阶段)
- [x] 创建 `.claude/` 配置目录
- [x] 生成 `CLAUDE.md` 核心文档
- [x] 生成产品需求文档
- [x] 生成技术栈文档
- [x] 生成前端开发规范
- [x] 生成后端服务结构
- [ ] 生成本迁移计划
- [ ] 生成实现计划

### 阶段 2: 技术债务优化
- [ ] 统一 Server Actions 错误处理
- [ ] 补充类型定义
- [ ] 增加测试覆盖

### 阶段 3: 功能迭代
- [ ] 按 PRD 逐步实现新功能
- [ ] 持续优化代码质量

---

## 7. 风险管理

| 风险 | 概率 | 影响 | 缓解措施 |
|------|------|------|----------|
| 模块接口不一致 | 中 | 高 | 建立接口契约文档，变更时同步通知 |
| 数据库 Schema 冲突 | 中 | 高 | 变更前提前沟通，统一执行顺序 |
| 代码风格不统一 | 高 | 中 | ESLint 配置统一，PR 审查把关 |
| 文档更新滞后 | 高 | 低 | 将文档更新纳入 PR 检查清单 |

---

*本文档由 AI 生成，供团队开发和 AI 助手参考*
