// 审核酒店信息所需数据
export interface HotelInformation {
  id: string; // 酒店id
  name: string; // 酒店名称
  merchant: string; // 商家id
  submitTime: string; // 提交时间
  status: "pending" | "approved" | "rejected"; // 审核状态
  address: string; // 酒店地址
  description: string; // 酒店描述
  images: string[]; // 酒店图片
  amenities: string[]; // 酒店设施
}
