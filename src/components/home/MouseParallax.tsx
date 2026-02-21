"use client";

import React, { useEffect, useRef } from "react";

interface MouseParallaxProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * MouseParallax Component (Optimized)
 *
 * 一个高性能的鼠标视差容器组件。
 *
 * 优化点：
 * 1. 移除 requestAnimationFrame 逐帧更新。
 * 2. 改为基于 CSS Transition 的平滑过渡。
 * 3. 仅在鼠标移动时更新 CSS 变量，不再使用 Lerp 插值计算（交给 CSS 处理）。
 * 4. 增加节流 (Throttle) 机制，每 50ms 更新一次目标位置，减少重绘频率。
 */
export default function MouseParallax({ children, className = "" }: MouseParallaxProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const throttleTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 记录上次更新时间，用于节流
  const lastUpdateTime = useRef(0);

  useEffect(() => {
    // 1. 锁定视口 & 禁用滚动
    const originalOverflow = document.body.style.overflow;
    const originalHeight = document.body.style.height;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = "hidden";
    document.body.style.height = "100vh";
    document.body.style.touchAction = "none"; // 禁用触摸滚动

    // 更新 DOM 样式的函数
    const updateStyles = (x: number, y: number) => {
      if (containerRef.current) {
        containerRef.current.style.setProperty("--mouse-x", x.toFixed(4));
        containerRef.current.style.setProperty("--mouse-y", y.toFixed(4));
      }
    };

    // 移动处理逻辑
    const handleMove = (x: number, y: number) => {
      const now = Date.now();

      // 归一化坐标：从 -1 到 1
      const normalizedX = (x / window.innerWidth) * 2 - 1;
      const normalizedY = (y / window.innerHeight) * 2 - 1;

      // 节流控制：每 100ms 更新一次
      if (now - lastUpdateTime.current > 100) {
        updateStyles(normalizedX, normalizedY);
        lastUpdateTime.current = now;
      }

      // 重置静止检测定时器 (Debounce)
      // 当鼠标停止移动 500ms 后，自动归位
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        updateStyles(0, 0); // 归位
      }, 500);
    };

    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (e.touches[0]) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    // 绑定事件
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("touchmove", onTouchMove, { passive: false });

    return () => {
      // 清理
      document.body.style.overflow = originalOverflow;
      document.body.style.height = originalHeight;
      document.body.style.touchAction = originalTouchAction;

      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);

      if (timerRef.current) clearTimeout(timerRef.current);
      if (throttleTimerRef.current) clearTimeout(throttleTimerRef.current);
    };
  }, []);

  return (
    <div
      id="home-container"
      ref={containerRef}
      className={`relative h-screen w-screen overflow-hidden ${className}`}
      style={
        {
          // 默认值
          "--mouse-x": "0",
          "--mouse-y": "0",
          // 全局定义视差元素的过渡效果，子元素可以继承或覆盖
          // 使用 ease-out 让停止时的减速更自然
          "--parallax-transition": "transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)",
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
}
