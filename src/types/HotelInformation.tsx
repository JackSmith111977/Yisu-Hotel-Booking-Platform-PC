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

// 商户酒店数据
export interface MineHotelInformationType {
  // id: string;                          // id, 自动自增
  name_zh: string;                        // 酒店中文名
  name_en: string;                        // 酒店英文名
  address: string;                        // 酒店地址
  star_rating: number;                    // 酒店星级
  opening_date: string;                   // 酒店开业时间
  contact_phone: string;                  // 联系电话
  // room_types: HotelRoomTypes[];           // 房间类型
  images?: HotelImageType;                // 展示图片
  surroundings?: HotelSurroundingType;    // 周边信息
  promotions?: PromotionType[];           // 优惠信息
  status: HotelStatus;                    // 状态
  // created_at: string;                     // 创建日期
  // updated_at: string;                     // 更新日期
  merchant_id?: string;                   // 商户id(暂定不需要)
}

export interface HotelRoomTypes {
  id: string;
  name: string;
  price: number;
  quantity: number; // 房间数量
  size: number; // 房间大小
  description: string;  // 房间描述
}

export interface HotelImageType {
  cover: string;  // 封面图，用于展示
  gallery: string[];  // 相册图集，用于详情页轮播
}

export interface HotelSurroundingType { // 周边信息
  attractions?: string[];  // 附近热门景点
  transportation?: string[]; // 交通信息
  shopping?: string[]; // 附近商场
}

export interface PromotionType {  //优惠
  type: string; // 优惠类型
  description: string;  // 描述
  discountRate?: number;  // 优惠折扣
  discountAmount?: number;  // 优惠金额
  giftDescription?: string;
  validFrom: string;  // 开始日期
  validTo: string;  // 截止日期
}

// 酒店状态 
// draft：草稿，商户保存但未提交审核
// pending_review：待审核，已提交，等待管理员审核
// published：已被管理员发布
// rejected：已被管理员拒绝
// offline：已被管理员下线
export type HotelStatus = 'draft' | 'pending_review' | 'published' | 'rejected' | 'offline';



