"use client";

import Link from "next/link";

/**
 * HeroSection Component
 *
 * 首页的核心内容区域。
 * 包含主标语、副标语以及登录/注册的行动号召按钮 (CTA)。
 * 采用极简主义排版，配合背景的流动光效。
 */
export default function HeroSection() {
  return (
    <div className="relative isolate flex h-screen items-center justify-center px-6 pt-14 lg:px-8">
      <div className="mx-auto max-w-3xl py-32 text-center sm:py-48 lg:py-56">
        {/* 顶部标签 (Badge) */}
        <div className="animate-fade-in-up hidden sm:mb-8 sm:flex sm:justify-center">
          <div className="relative cursor-default rounded-full bg-white/40 px-3 py-1 text-sm leading-6 text-slate-600 ring-1 ring-slate-900/10 backdrop-blur-sm transition-all duration-300 hover:shadow-md hover:ring-slate-900/20">
            探索未来的住宿体验 <span className="ml-1 font-semibold text-indigo-600"></span>
          </div>
        </div>

        {/* 主标题 (Main Headline) */}
        <h1 className="mb-6 text-5xl font-bold tracking-tight text-slate-900 drop-shadow-sm sm:text-7xl">
          <span className="block bg-linear-to-r from-slate-900 to-slate-700 bg-clip-text pb-2 text-transparent">
            重新定义
          </span>
          <span className="block text-slate-900">您的旅程</span>
        </h1>

        {/* 副标题 (Subheadline) */}
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
          不仅仅是预订一家酒店，更是开启一段难忘的故事。
          我们在全球甄选独特的住所，只为满足挑剔的您。
        </p>

        {/* 行动号召按钮 (CTA Buttons) */}
        <div className="mt-10 flex items-center justify-center gap-x-6">
          {/* 登录按钮 - 幽灵风格 + 玻璃拟态 */}
          <Link
            href="/login"
            className="group flex items-center gap-2 rounded-full bg-white/60 px-8 py-3.5 text-sm font-semibold text-slate-900 shadow-sm ring-1 ring-slate-300 backdrop-blur-md transition duration-200 ease-in-out hover:scale-105 hover:!bg-black hover:text-white hover:ring-black active:scale-95"
          >
            登录
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>

          {/* 注册按钮 - 实色风格 + 强调 */}
          <Link
            href="/register"
            className="rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition duration-200 ease-in-out hover:scale-105 hover:!bg-black hover:shadow-indigo-500/30 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600 active:scale-95"
          >
            立即注册
          </Link>
        </div>
      </div>
    </div>
  );
}
