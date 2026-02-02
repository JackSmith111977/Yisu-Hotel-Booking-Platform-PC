/**
 * @description: 酒店信息
 * @interface HotelInformation
 * @property {string} id - 酒店id
 * @property {string} name - 酒店名称
 * @property {string} merchant - 商家id
 * @property {string} submitTime - 提交时间
 * @property {"pending" | "approved" | "rejected" | "offline"} status - 审核状态
 * @property {string} address - 酒店地址
 * @property {string} description - 酒店描述
 * @property {string[]} images - 酒店图片
 * @property {string[]} amenities - 酒店设施
 */

export interface HotelInformation {
  id: string; // 酒店id
  name: string; // 酒店名称
  merchant: string; // 商家id
  submitTime: string; // 提交时间
  status: "pending" | "approved" | "rejected" | "offline"; // 审核状态
  address: string; // 酒店地址
  description: string; // 酒店描述
  images: string[]; // 酒店图片
  amenities: string[]; // 酒店设施
}
