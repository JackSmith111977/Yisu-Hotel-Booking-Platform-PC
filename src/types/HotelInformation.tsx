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
  status: "pending" | "approved" | "rejected" | "offline"; // 审核状态
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
}

// 商户酒店数据
export interface MineHotelInformationType {
  // id: string;                          // id, 自动自增
  name_zh: string; // 酒店中文名
  name_en: string; // 酒店英文名
  address: string; // 酒店地址
  star_rating: number; // 酒店星级
  opening_date: string; // 酒店开业时间
  contact_phone: string; // 联系电话
  // room_types: HotelRoomTypes[];           // 房间类型
  images?: HotelImageType; // 展示图片
  surroundings?: HotelSurroundingType; // 周边信息
  promotions?: PromotionType[]; // 优惠信息
  status: HotelStatus; // 状态
  // created_at: string;                     // 创建日期
  // updated_at: string;                     // 更新日期
  merchant_id?: string; // 商户id(暂定不需要)
}

export interface HotelRoomTypes {
  id: string;
  name: string;
  price: number;
  quantity: number; // 房间数量
  size: number; // 房间大小
  description: string; // 房间描述
}

export interface HotelImageType {
  cover: string; // 封面图，用于展示
  gallery: string[]; // 相册图集，用于详情页轮播
}

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
// pending_review：待审核，已提交，等待管理员审核
// published：已被管理员发布
// rejected：已被管理员拒绝
// offline：已被管理员下线
export type HotelStatus = "draft" | "pending_review" | "published" | "rejected" | "offline";
