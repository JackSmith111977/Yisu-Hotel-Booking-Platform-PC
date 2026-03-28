# 技术栈文档 (TECH_STACK)

**项目**: 酒店预订平台
**最后更新**: 2026-03-28

---

## 1. 核心技术栈

### 1.1 框架与语言
| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.1.6 | React 全栈框架 (App Router) |
| React | 19.2.3 | UI 库 |
| TypeScript | 5.x | 类型系统 |

### 1.2 UI 与样式
| 技术 | 版本 | 用途 |
|------|------|------|
| Arco Design | 2.66.10 | 字节跳动 UI 组件库 |
| Tailwind CSS | 4.x | 原子化 CSS 框架 |
| styled-components | latest | CSS-in-JS (部分组件) |

### 1.3 状态管理与数据
| 技术 | 版本 | 用途 |
|------|------|------|
| Zustand | 5.0.11 | 全局状态管理 |
| SWR | 2.4.0 | 数据获取与缓存 |
| Redux Toolkit | 2.11.2 | 依赖中存在 (备用) |

### 1.4 后端服务
| 技术 | 版本 | 用途 |
|------|------|------|
| Supabase | 2.93.3 | BaaS (PostgreSQL + Auth + Storage) |
| nodemailer | 8.0.1 | 邮件发送 |

### 1.5 图表可视化
| 技术 | 版本 | 用途 |
|------|------|------|
| Recharts | 3.7.0 | React 图表库 |
| ECharts | 6.0.0 | 百度图表库 |
| @ant-design/charts | 2.6.7 | 蚂蚁图表库 |

### 1.6 开发工具
| 技术 | 版本 | 用途 |
|------|------|------|
| Vitest | 4.1.0 | 测试框架 |
| ESLint | 9.x | 代码检查 |
| Prettier | 3.8.1 | 代码格式化 |
| @testing-library/react | 16.3.2 | 组件测试 |

---

## 2. 开发环境配置

### 2.1 Node.js 版本
推荐：`v18+`

### 2.2 环境变量
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2.3 开发命令
```bash
npm run dev          # 启动开发服务器 (localhost:3000)
npm run build        # 生产构建
npm run start        # 启动生产服务器
npm run lint         # 代码检查
npm run test         # 运行测试
```

---

## 3. 关键配置

### 3.1 Next.js 配置
文件：`next.config.ts`
- 使用 App Router
- 支持 Server Actions

### 3.2 TypeScript 配置
文件：`tsconfig.json`
- 严格模式启用
- JSX: react-jsx

### 3.3 ESLint 配置
文件：`eslint.config.mjs`
- 继承 next/core-web-vitals
- 集成 prettier

### 3.4 测试配置
文件：`vitest.config.ts`
- 测试框架：Vitest
- 断言库：@testing-library/jest-dom
- 环境：jsdom

---

## 4. 代码示例

### 4.1 Server Action 示例
```typescript
// src/actions/hotels.ts
'use server'

import { createClient } from '@/lib/supabase'
import { revalidatePath } from 'next/cache'

export async function createHotel(data: HotelData) {
  const supabase = await createClient()
  const { data: hotel, error } = await supabase
    .from('hotels')
    .insert(data)
    .select()
    .single()

  if (error) throw error
  revalidatePath('/admin/audit')
  return hotel
}
```

### 4.2 组件示例
```typescript
// src/components/admin/StatCard.tsx
import { Card, Text } from '@arco-design/web-react'

interface StatCardProps {
  title: string
  value: number
  trend?: number
}

export function StatCard({ title, value, trend }: StatCardProps) {
  return (
    <Card>
      <Text type="secondary">{title}</Text>
      <Text bold>{value}</Text>
      {trend && <Text type={trend > 0 ? 'success' : 'danger'}>{trend}%</Text>}
    </Card>
  )
}
```

### 4.3 Zustand Store 示例
```typescript
// src/store/useUserStore.ts
import { create } from 'zustand'

interface User {
  id: string
  email: string
  role: 'admin' | 'merchant'
}

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

---

## 5. 依赖管理

### 5.1 添加依赖
```bash
npm install <package-name>
```

### 5.2 添加开发依赖
```bash
npm install -D <package-name>
```

### 5.3 更新依赖
```bash
npm update
npm outdated  # 检查可更新的包
```

---

*本文档由 AI 生成，供团队开发和 AI 助手参考*
