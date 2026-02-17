"use client";

import { useThemeStore } from "@/store/useThemeStore";
import { useEffect } from "react";

export default function ThemeInit() {
  const theme = useThemeStore((state) => state.theme);

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;

    const applyTheme = (currentTheme: "light" | "dark") => {
      if (currentTheme === "dark") {
        // 激活 Arco Design 深色模式
        body.setAttribute("arco-theme", "dark");
        // 激活 Tailwind 深色模式
        html.classList.add("dark");
      } else {
        // 卸载深色模式
        body.removeAttribute("arco-theme");
        html.classList.remove("dark");
      }
    };

    applyTheme(theme);

    return () => {
      applyTheme("light");
    };
  }, [theme]);

  return null;
}
