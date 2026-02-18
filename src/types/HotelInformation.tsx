/**
 * @description: 酒店信息
 * @interface HotelInformation
 * @property {string} id 酒店id
 * @property {string} nameZh 酒店中文名称
 * @property {string} nameEn 酒店英文名称
 * @property {string} address 酒店地址
 * @property {number} starRating 酒店星级
 * @property {string} openingDate 酒店开业时间
 * @property {string} contactPhone 酒店联系电话
 * @property {string} coverImage 酒店封面图片
 * @property {string} status 酒店审核状态
 * @property {string} merchantId 商户id
 * @property {string} updatedAt 酒店更新时间
 * @property {string} rejectedReason 拒绝理由
 * @property {string[]} images 酒店图片
 */
export interface HotelInformation {
  /**
   * @description: 酒店id
   * @type {string}
   */
  id: string;
  /**
   * @description: 酒店中文名称
   * @type {string}
   */
  nameZh: string;
  /**
   * @description: 酒店英文名称
   * @type {string}
   */
  nameEn: string;
  /**
   * @description: 酒店地址
   * @type {string}
   */
  address: string;
  /**
   * @description: 酒店星级
   * @type {number}
   */
  starRating: number;
  /**
   * @description: 酒店开业时间
   * @type {string}
   */
  openingDate: string;
  /**
   * @description: 酒店联系电话
   * @type {string}
   */
  contactPhone: string;
  /**
   * @description: 酒店封面图片
   * @type {string}
   */
  coverImage: string;
  /**
   * @description: 酒店审核状态
   * @type {"pending" | "approved" | "rejected" | "offline"}
   */
  status: "pending" | "approved" | "rejected" | "offline" | "draft"; // 审核状态
  /**
   * @description: 商户id
   * @type {string}
   */
  merchantId: string;
  /**
   * @description: 更新日期
   * @type {string}
   */
  updatedAt: string;
  /**
   * @description: 拒绝理由
   * @type {string}
   */
  rejectedReason?: string;
  /**
   * @description: 酒店图片
   * @type {string[]}
   */
  images?: string[];
  /**
   * @description: 关联的房型列表
   * @type {HotelRoomTypes[]}
   */
  roomTypes?: HotelRoomTypes[]; // 新增字段：房型列表
}

// 商户酒店数据
export interface MineHotelInformationType {
  id?: number; // id, 自动自增
  name_zh: string; // 酒店中文名
  name_en: string; // 酒店英文名
  region: string; // 酒店地址
  address: string; // 详细地址
  star_rating: number; // 酒店星级
  opening_date: string; // 酒店开业时间
  contact_phone: string; // 联系电话
  room_types?: HotelRoomTypes[]; // 房间类型
  image?: string; // 展示图片
  album?: string[]; // 酒店相册
  surroundings?: HotelSurroundingType; // 周边信息
  promotions?: PromotionType[]; // 优惠信息
  status: HotelStatus; // 状态
  updated_at: string; // 更新日期
  merchant_id?: string; // 商户id(暂定不需要)
  rejected_reason?: string;
}
// 1. 新增床型信息接口 (建议放在文件头部或 HotelRoomTypesForAdmin 附近)
/**
 * @description: 床型信息
 * @interface BedInfo
 * @property {string} type 床型名称，例如 "大床"
 * @property {number} count 数量
 * @property {string} size 尺寸描述 (可选)
 */
export interface BedInfo {
  type: string; // 床型名称，例如 "大床"
  count: number; // 数量
  size?: string; // 尺寸描述 (可选)
}
/**
 * @description: 酒店房型信息 (管理员端)
 * @interface HotelRoomTypesForAdmin
 * @property {string} id 房型id
 * @property {string} name 房型名称
 * @property {number} price 房型价格
 * @property {number} quantity 房间数量
 * @property {number} size 房间大小
 * @property {string} description 房型描述
 * @property {number} max_guests 最大 guests 数量 (可选)
 * @property {BedInfo[]} beds 床型信息 (可选)
 * @property {string[]} images 房型图片 (可选)
 * @property {string[]} facilities 房型设施 (可选)
 * @property {string} hotel_id 酒店id (外键)
 */
export interface HotelRoomTypesForAdmin {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: number;
  description: string;

  // 新增可选字段
  max_guests?: number; // 对应 max_guests
  beds?: BedInfo[]; // 对应 beds jsonb
  images?: string[]; // 对应 images jsonb
  facilities?: string[]; // 对应 facilities jsonb
  hotel_id?: string; // 外键
}

export interface HotelRoomTypes {
  id: string;
  name: string;
  price: number;
  quantity: number; // 房间数量
  size: number; // 房间大小
  description: string; // 房间描述
  images?: string[];
}

// export interface HotelImageType {
//   cover: string;  // 封面图，用于展示
//   gallery: string[];  // 相册图集，用于详情页轮播
// }

export interface HotelSurroundingType {
  // 周边信息
  attractions?: string[]; // 附近热门景点
  transportation?: string[]; // 交通信息
  shopping?: string[]; // 附近商场
}

export interface PromotionType {
  //优惠
  type: string; // 优惠类型
  description: string; // 描述
  discountRate?: number; // 优惠折扣
  discountAmount?: number; // 优惠金额
  giftDescription?: string;
  validFrom: string; // 开始日期
  validTo: string; // 截止日期
}

// 酒店状态
// draft：草稿，商户保存但未提交审核
// pending：待审核，已提交，等待管理员审核
// approved：已被管理员发布
// rejected：已被管理员拒绝
// offline：已被管理员下线
export type HotelStatus = "draft" | "pending" | "approved" | "rejected" | "offline";

export type AddressDataType = {
  [province: string]: {
    [city: string]: string[];
  };
};
