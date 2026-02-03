import { HotelInformation } from "@/types/HotelInformation";

const CITIES = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "西安"];
const BRANDS_ZH = ["希尔顿", "万豪", "香格里拉", "威斯汀", "凯悦", "洲际"];
const BRANDS_EN = ["Hilton", "Marriott", "Shangri-La", "Westin", "Hyatt", "InterContinental"];

const getRandomPhone = () => {
  return `1${Math.floor(Math.random() * 9 + 1)}${Math.floor(Math.random() * 1000000000)
    .toString()
    .padStart(9, "0")}`;
};

export const MOCK_HOTEL_DATA: HotelInformation[] = Array.from({ length: 50 }).map((_, index) => {
  const cityIdx = index % CITIES.length;
  const brandIdx = index % BRANDS_ZH.length;
  const isApproved = index % 3 === 0;

  return {
    id: (10001 + index).toString(),
    // 适配新字段
    nameZh: `${CITIES[cityIdx]}${BRANDS_ZH[brandIdx]}酒店`,
    nameEn: `${BRANDS_EN[brandIdx]} Hotel ${CITIES[cityIdx]}`,
    address: `${CITIES[cityIdx]}市中心路${100 + index}号`,
    starRating: Math.floor(Math.random() * 2) + 4, // 4-5星
    openingDate: `20${15 + (index % 10)}-0${(index % 9) + 1}-15`,
    contactPhone: getRandomPhone(),
    coverImage:
      "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp",
    status: index < 10 ? "pending" : isApproved ? "approved" : "rejected",
    merchantId: `M-${202400 + index}`,
    updatedAt: new Date().toISOString(),
    // 保留字段
    description: "这是一家拥有极致景观和奢华服务的五星级酒店，地处城市核心地带，交通便利...",
    amenities: ["免费WiFi", "游泳池", "健身房", "SPA", "行政酒廊"],
    images: [
      "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp",
      "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp",
    ],
  };
});
