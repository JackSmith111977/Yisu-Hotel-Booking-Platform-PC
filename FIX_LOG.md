# 修复日志 (2026-03-19)

## 1. 审核页面 (Audit View) 状态与 URL 同步及统计修正
- **涉及文件**: `src/app/admin/audit/audit-view.tsx`
- **修复内容**:
  - **Tab 与 URL 双向绑定**: 引入了 `useRouter` 和 `usePathname`，并新增了 `handleTabChange` 方法。在切换 Tab 时，不仅更新了本地的 `activeTab` 状态，同时使用 `router.replace` 更新 URL 中的 `tab` 查询参数，实现无刷新且不增加历史堆栈的双向绑定。
  - **默认参数补全**: 在 `useEffect` 监听 `searchParams` 时，新增逻辑判断：若当前 URL 无 `tab` 参数，则自动补全为 `?tab=pending`，确保从导航栏直接点击进入时 URL 状态一致。
  - **Badge 数量统计修正**: 修改了 `stats` 变量中的计算逻辑，使“已处理”标签页的统计数量 (`processedCount`) 与实际表格过滤逻辑保持一致（排除了 `pending` 和 `draft` 状态的数据），解决了 Badge 数量与表格数据条数对不上的问题。

## 2. 导航栏 (Nav) 选中状态跟随路由高亮
- **涉及文件**: `src/components/admin/Nav.tsx`
- **修复内容**:
  - **路由高亮跟随**: 引入了 `usePathname`，通过 `useMemo` 根据当前路由动态计算 `selectedKeys`。
  - 将计算出的 `selectedKeys` 数组作为受控属性传递给 `<Menu>` 组件，彻底解决了在系统中通过代码（如 `router.push`）跳转路由时，左侧导航栏的选中项无法跟随更新的问题。

## 3. 上线管理页面 (Online View) 状态与 URL 同步
- **涉及文件**: `src/app/admin/online/online-view.tsx`
- **修复内容**:
  - **Tab 与 URL 双向绑定**: 与审核页面采用了一致的逻辑，引入了 `useRouter` 和 `usePathname`，并新增了 `handleTabChange` 方法。将 `<Tabs>` 组件的 `onChange` 事件替换为该方法，实现了 `activeTab` 状态与 URL 中 `tab` 参数的同步更新。
  - **默认参数补全**: 增加对空 `tab` 参数的处理，当没有提供 `tab` 时默认通过 `router.replace` 将 URL 补全为 `?tab=approved`。
