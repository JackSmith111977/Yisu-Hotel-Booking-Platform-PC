# 前端开发规范 (FRONTEND_GUIDELINES)

**项目**: 酒店预订平台
**最后更新**: 2026-03-28

---

## 1. 代码风格

### 1.1 基本规范
- 使用 **双引号** 字符串
- 语句末尾使用 **分号**
- 缩进：**2 个空格**
- 行尾换行

### 1.2 组件定义
```typescript
// ✅ 推荐：箭头函数
export const Button = ({ label }: ButtonProps) => {
  return <button>{label}</button>
}

// ❌ 不推荐：普通函数
export function Button({ label }: ButtonProps) {
  return <button>{label}</button>
}
```

### 1.3 类型定义
```typescript
// ✅ 推荐：优先使用 type
interface User {
  id: string
  name: string
}

// ✅ 也可使用 interface (需要继承时)
interface AdminUser extends User {
  role: 'admin'
}
```

---

## 2. 组件开发规范

### 2.1 组件分类
| 类型 | 描述 | 示例 |
|------|------|------|
| **展示组件** | 只负责 UI 渲染，接收 props 数据 | `StatCard`, `AuditTable` |
| **容器组件** | 负责数据获取和状态管理 | `AuditPage`, `DashboardView` |
| **布局组件** | 负责页面结构布局 | `AdminLayout`, `HotelLayout` |

### 2.2 组件命名
```typescript
// ✅ 推荐：PascalCase 文件名
// src/components/admin/AuditTable.tsx
export function AuditTable() {}

// ✅ 推荐：kebab-case 目录名
// src/components/admin/
```

### 2.3 Props 定义
```typescript
// ✅ 推荐：独立的类型定义
interface AuditTableProps {
  hotels: Hotel[]
  onApprove: (id: string) => void
  onReject: (id: string, reason: string) => void
}

export function AuditTable({ hotels, onApprove, onReject }: AuditTableProps) {
  // ...
}
```

---

## 3. 样式规范

### 3.1 Tailwind CSS 优先级
```typescript
// ✅ 推荐：优先使用 Tailwind 类名
<div className="flex items-center gap-4 p-4 bg-white rounded-lg">
  Content
</div>

// ✅ 复杂样式可使用 @apply (在 CSS 文件中)
.card {
  @apply p-4 bg-white rounded-lg shadow;
}

// ❌ 避免：内联样式
<div style={{ padding: '1rem', backgroundColor: 'white' }}>
```

### 3.2 响应式设计
```typescript
// ✅ 推荐：移动优先
<div className="w-full md:w-1/2 lg:w-1/3">
  Content
</div>
```

### 3.3 主题颜色
```typescript
// ✅ 推荐：使用语义化颜色
<div className="bg-primary text-primary-foreground">
// ✅ 状态颜色
<div className="text-success"> // 成功
<div className="text-warning"> // 警告
<div className="text-danger">  // 错误
```

---

## 4. 状态管理规范

### 4.1 Zustand 使用
```typescript
// ✅ 推荐：单一职责的 store
// src/store/useUserStore.ts
interface UserStore {
  user: User | null
  setUser: (user: User) => void
  clearUser: () => void
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}))
```

### 4.2 SWR 数据获取
```typescript
// ✅ 推荐：统一的 hooks 封装
// src/hooks/useHotels.ts
import useSWR from 'swr'

export function useHotels(status?: string) {
  const url = status
    ? `/api/hotels?status=${status}`
    : '/api/hotels'

  return useSWR(url, fetcher)
}
```

---

## 5. Server Actions 规范

### 5.1 文件组织
```
src/actions/
├── auth.ts          # 认证相关
├── hotels.ts        # 酒店相关
├── admin_service.ts # 管理员相关
└── user.ts          # 用户相关
```

### 5.2 Action 编写规范
```typescript
// ✅ 推荐：统一使用 'use server' 指令
'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function approveHotel(id: string) {
  try {
    const supabase = await createClient()

    const { error } = await supabase
      .from('hotels')
      .update({ status: 'approved' })
      .eq('id', id)

    if (error) throw error

    revalidatePath('/admin/audit')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 5.3 错误处理
```typescript
// ✅ 推荐：统一的错误处理
export async function someAction(data: SomeData) {
  try {
    // ... 业务逻辑
    return { success: true, data: result }
  } catch (error) {
    console.error('[someAction]', error)
    return { success: false, error: '操作失败' }
  }
}
```

---

## 6. 测试规范

### 6.1 测试文件位置
```
src/
├── __tests__/          # 全局测试文件
│   └── admin_service.test.ts
└── components/
    └── admin/
        └── __tests__/  # 组件测试
            └── AuditTable.test.tsx
```

### 6.2 测试命名
```typescript
// ✅ 推荐：描述性测试名
describe('AuditTable', () => {
  it('应该渲染待审核列表', () => {})
  it('应该处理审核通过操作', () => {})
  it('应该处理审核驳回操作', () => {})
})
```

### 6.3 测试用例模板
```typescript
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('ComponentName', () => {
  it('应该正确渲染', () => {
    render(<ComponentName />)
    expect(screen.getByText('Expected')).toBeInTheDocument()
  })
})
```

---

## 7. Git 提交规范

### 7.1 Commit 格式
```
<type>(<scope>): <description>
```

### 7.2 Type 类型
| 类型 | 描述 |
|------|------|
| `feat` | 新功能 |
| `fix` | Bug 修复 |
| `docs` | 文档更新 |
| `style` | 代码格式 (不影响代码运行) |
| `refactor` | 重构 (既不是新功能也不是修复) |
| `test` | 测试相关 |
| `chore` | 构建过程或辅助工具变动 |

### 7.3 Scope 范围
| 范围 | 描述 |
|------|------|
| `admin` | 管理员模块 |
| `hotel` | 商户模块 |
| `auth` | 认证模块 |
| `home` | 首页 |

### 7.4 提交示例
```bash
feat(admin): 添加酒店审核批量操作
fix(hotel): 修复房型图片上传失败问题
docs: 更新 README.md 技术栈说明
refactor(auth): 重构登录逻辑
```

---

## 8. 文件组织规范

### 8.1 组件文件结构
```typescript
// 1. 导入语句
import { useState } from 'react'
import { Card } from '@arco-design/web-react'

// 2. 类型定义
interface Props {
  title: string
}

// 3. 组件定义
export function Component({ title }: Props) {
  // 4. Hooks
  const [state, setState] = useState()

  // 5. 事件处理
  const handleClick = () => {}

  // 6. 渲染
  return <div>{title}</div>
}
```

### 8.2 导出规范
```typescript
// ✅ 推荐：单一导出
export function Component() {}

// ✅ 也可：默认导出 (页面组件)
export default function Page() {}
```

---

*本文档由 AI 生成，供团队开发和 AI 助手参考*
