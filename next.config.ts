import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    // 允许从 dicebear.com 加载头像图片
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.dicebear.com",
      },
      {
        protocol: "https",
        hostname: "varicsxgcaruuwucywxe.supabase.co",
      },
    ],
  },
  reactStrictMode: false,  // 打包后可以注释
};

export default nextConfig;
