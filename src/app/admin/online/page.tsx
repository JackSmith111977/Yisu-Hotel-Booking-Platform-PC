import { Metadata } from "next";
import { Suspense } from "react";
import OnlineView from "./online-view";

/**
 * 酒店上线管理页面元数据
 */
export const metadata: Metadata = {
  title: "酒店上线管理 - 管理后台",
  description: "管理酒店的上线状态，支持下线违规酒店或重新上线审核通过的酒店",
};

/**
 * OnlinePage (Server Component)
 * 作为酒店上线管理页面的入口，渲染 OnlineView 客户端视图
 */
export default function OnlinePage() {
  return (
    /**
     * 渲染边界处理：
     * 由于 OnlineView 内部使用了 useSearchParams，在静态渲染时需要使用 Suspense 包裹。
     */
    <Suspense fallback={<div className="p-6">加载中...</div>}>
      <OnlineView />
    </Suspense>
  );
}
