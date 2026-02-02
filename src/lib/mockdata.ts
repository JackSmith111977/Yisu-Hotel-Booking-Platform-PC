import { HotelInformation } from "@/types/HotelInformation";

// 预设数据池
const CITIES = ["北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "西安", "南京", "重庆"];
const DISTRICTS = [
  "朝阳区",
  "浦东新区",
  "天河区",
  "南山区",
  "西湖区",
  "锦江区",
  "武昌区",
  "雁塔区",
  "鼓楼区",
  "渝中区",
];
const BRANDS = [
  "希尔顿酒店",
  "万豪酒店",
  "全季酒店",
  "亚朵酒店",
  "香格里拉大酒店",
  "喜来登酒店",
  "凯悦酒店",
  "洲际酒店",
  "橘子水晶酒店",
  "丽思卡尔顿",
];
const MERCHANTS = [
  "希尔顿酒店集团",
  "万豪国际集团",
  "华住酒店集团",
  "首旅如家",
  "锦江国际",
  "亚朵集团",
  "洲际酒店集团",
  "独立商户张先生",
  "凯悦酒店集团",
  "香格里拉集团",
];
const AMENITIES_POOL = [
  "免费WiFi",
  "室内游泳池",
  "24小时健身房",
  "免费停车场",
  "行政酒廊",
  "SPA水疗中心",
  "机场接送",
  "全日制餐厅",
  "会议室",
  "儿童乐园",
  "屋顶酒吧",
  "商务中心",
];
const STATUS_POOL: HotelInformation["status"][] = ["pending", "approved", "rejected", "offline"];

// 辅助函数：生成随机时间
const getRandomDate = (start: Date, end: Date) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

// 辅助函数：随机获取数组中的几个元素
const getRandomSubarray = (arr: string[], min: number, max: number) => {
  const shuffled = arr.slice(0);
  let i = arr.length;
  const temp = shuffled[0]; // simple shuffle
  while (i--) {
    const index = Math.floor((i + 1) * Math.random());
    const temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, Math.floor(Math.random() * (max - min + 1)) + min);
};

// 生成 50 条数据
export const MOCK_HOTEL_DATA: HotelInformation[] = Array.from({ length: 50 }).map((_, index) => {
  const cityIndex = index % CITIES.length;
  const brandIndex = index % BRANDS.length;
  const merchantIndex = index % MERCHANTS.length;

  // 模拟不同状态的分布：更多的是 pending 和 approved
  let status: HotelInformation["status"];
  if (index < 15)
    status = "pending"; // 前15条待审核
  else if (index < 35)
    status = "approved"; // 中间20条已通过
  else if (index < 45)
    status = "rejected"; // 接下10条已驳回
  else status = "offline"; // 最后5条已下线

  // 生成 ID，从 1001 开始
  const id = (1001 + index).toString();

  return {
    id,
    name: `${CITIES[cityIndex]}${BRANDS[brandIndex]} (${DISTRICTS[cityIndex]}店)`,
    merchant: MERCHANTS[merchantIndex],
    submitTime: getRandomDate(new Date(2024, 0, 1), new Date()),
    status,
    address: `${CITIES[cityIndex]}${DISTRICTS[cityIndex]}某某路${Math.floor(Math.random() * 800) + 1}号`,
    description: `这是位于${CITIES[cityIndex]}${DISTRICTS[cityIndex]}核心地带的一家高端酒店，拥有绝佳的城市景观和便利的交通。酒店设计融合了现代美学与当地文化，致力于为宾客提供宾至如归的住宿体验。周边购物中心、餐饮娱乐设施一应俱全。`,
    images: [
      // 使用 Arco Design 文档中的示例图片作为占位
      "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/cd7a1aaea8e1c5e3d26fe2591e561798.png~tplv-uwbnlip3yd-webp.webp",
      "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/6480dbc69be1b5de95010289787d64f1.png~tplv-uwbnlip3yd-webp.webp",
      "https://p1-arco.byteimg.com/tos-cn-i-uwbnlip3yd/0265a04fddbd77a19602a15d9d55d797.png~tplv-uwbnlip3yd-webp.webp",
    ].slice(0, Math.floor(Math.random() * 3) + 1), // 随机 1-3 张图片
    amenities: getRandomSubarray(AMENITIES_POOL, 3, 8), // 随机 3-8 个设施
  };
});
