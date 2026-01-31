"use client";
import AuditTable from "@/components/admin/AuditTable";
import { HotelInformation } from "@/types/HotelInformation";

// 模拟数据源 (实际开发中替换为 API 调用)
const MOCK_DATA: HotelInformation[] = [
  {
    id: "1001",
    name: "上海半岛酒店",
    merchant: "Peninsula Group",
    submitTime: "2024-05-20 10:30",
    status: "pending",
    address: "上海市黄浦区中山东一路32号",
    description: "位于外滩...",
    images: [
      "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp",
    ],
    amenities: ["免费WiFi", "游泳池"],
  },
  {
    id: "1002",
    name: "北京王府井希尔顿",
    merchant: "Hilton Inc.",
    submitTime: "2024-05-19 14:20",
    status: "approved",
    address: "北京市东城区...",
    description: "繁华商圈...",
    images: [],
    amenities: ["停车场"],
  },
];
export default function Home() {
  return <AuditTable data={MOCK_DATA} onView={() => null} />;
}
