"use client";

import React from "react";

/**
 * AuroraBackground Component (Performance Optimized)
 *
 * 优化点：
 * 1. 移除 filter: blur(100px) —— 这是性能杀手。
 * 2. 使用径向渐变 (Radial Gradients) 模拟光斑，本身就有模糊边缘。
 * 3. 移除 mix-blend-multiply，改为简单的透明度叠加。
 * 4. 添加 will-change: transform 提示浏览器开启 GPU 加速。
 */
export default function AuroraBackground() {
  // 视差强度 - 像素值
  const PARALLAX_INTENSITY_1 = 60;
  const PARALLAX_INTENSITY_2 = -80;
  const PARALLAX_INTENSITY_3 = 40;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      {/* 光斑容器 - 移除全局 filter blur */}
      <div className="absolute inset-0 opacity-80">
        {/* 光斑 1: 蓝紫色 (Top Left) */}
        <div
          className="absolute top-[-10%] left-[-10%] h-[70vw] w-[70vw] rounded-full"
          style={{
            // 使用径向渐变代替纯色 + 模糊
            background:
              "radial-gradient(circle, rgba(165, 180, 252, 0.8) 0%, rgba(165, 180, 252, 0) 70%)",
            transform: `translate(
              calc(var(--mouse-x, 0) * ${PARALLAX_INTENSITY_1}px), 
              calc(var(--mouse-y, 0) * ${PARALLAX_INTENSITY_1}px)
            )`,
            transition: "transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)",
            willChange: "transform", // 关键：GPU 加速
          }}
        />

        {/* 光斑 2: 暖粉色 (Top Right) */}
        <div
          className="absolute top-[-10%] right-[-10%] h-[80vw] w-[80vw] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(254, 205, 211, 0.8) 0%, rgba(254, 205, 211, 0) 70%)",
            transform: `translate(
              calc(var(--mouse-x, 0) * ${PARALLAX_INTENSITY_2}px), 
              calc(var(--mouse-y, 0) * ${PARALLAX_INTENSITY_2}px)
            )`,
            transition: "transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)",
            animationDelay: "2s",
            willChange: "transform",
          }}
        />

        {/* 光斑 3: 清新绿/青色 (Bottom Center) */}
        <div
          className="absolute bottom-[-20%] left-[20%] h-[80vw] w-[80vw] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(153, 246, 228, 0.8) 0%, rgba(153, 246, 228, 0) 70%)",
            transform: `translate(
              calc(var(--mouse-x, 0) * ${PARALLAX_INTENSITY_3}px), 
              calc(var(--mouse-y, 0) * ${PARALLAX_INTENSITY_3}px)
            )`,
            transition: "transform 1s cubic-bezier(0.2, 0.8, 0.2, 1)",
            animationDelay: "4s",
            willChange: "transform",
          }}
        />
      </div>

      {/* 
        噪点纹理层 (Noise Texture)
        保留这一层，因为它是静态的，开销很小，且能有效防止色带
      */}
      <div className="pointer-events-none absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
    </div>
  );
}
