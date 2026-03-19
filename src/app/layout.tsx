import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@arco-design/web-react/dist/css/arco.css";
import "@arco-design/web-react/es/_util/react-19-adapter";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

/**
 * metadata 动态标题配置
 * @param title 页面标题
 * @returns 动态标题
 */
export const metadata: Metadata = {
  title: "易宿管理后台",
  description: "易宿 - 专业酒店管理平台",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
