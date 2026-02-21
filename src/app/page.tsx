import AuroraBackground from "@/components/home/AuroraBackground";
import HeroSection from "@/components/home/HeroSection";
import MouseParallax from "@/components/home/MouseParallax";
import Link from "next/link";

export default function Home() {
  return (
    <MouseParallax className="relative min-h-screen">
      {/* 
        背景层
        使用 fixed 定位确保滚动时背景也有微妙视差 (虽然目前页面不可滚动)
      */}
      <AuroraBackground />

      {/* 
        顶部导航栏 (简易版)
        实际项目中可以抽离为独立组件
      */}
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <Link href="/" className="group -m-1.5 flex items-center gap-2 p-1.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-lg font-bold text-white transition-colors group-hover:bg-indigo-600">
                H
              </div>
              <span className="text-lg font-semibold tracking-tight text-slate-900">易宿</span>
            </Link>
          </div>
          <div className="hidden gap-4 lg:flex lg:flex-1 lg:justify-end">
            <Link
              href="/login"
              className="text-sm leading-6 font-semibold text-slate-900 hover:text-indigo-600"
            >
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      {/* 主内容区 */}
      <main>
        <HeroSection />
      </main>
    </MouseParallax>
  );
}
