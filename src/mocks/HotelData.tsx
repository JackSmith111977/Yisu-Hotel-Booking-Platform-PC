import { MineHotelInformationType } from "@/types/HotelInformation";

export const HOTEL_DATA: MineHotelInformationType[] = [
  {
    "id": "hotel_002",
    "basicInfo": {
      "nameZh": "杭州西湖国宾馆",
      "nameEn": "Westlake State Guest House Hangzhou",
      "address": "浙江省杭州市西湖区杨公堤18号",
      "starRating": 5,
      "openingDate": "1958-07-01",
      "contactPhone": "0571-87979889"
    },
    "roomTypes": [
      {
        "id": "room_002_01",
        "name": "园景标准间",
        "price": 1580,
        "quantity": 60,
        "size": 42,
        "description": "园林景观，中式装修风格，含中西式早餐"
      },
      {
        "id": "room_002_02",
        "name": "湖景豪华套房",
        "price": 3880,
        "quantity": 15,
        "size": 120,
        "description": "独享西湖美景，配备独立茶室，含私人导游服务"
      }
    ],
    "images": {
      "cover": "https://example.com/westlake/cover.jpg",
      "gallery": [
        "https://example.com/westlake/garden.jpg",
        "https://example.com/westlake/lake-view.jpg",
        "https://example.com/westlake/tea-room.jpg"
      ]
    },
    "surroundings": {
      "attractions": ["西湖", "雷峰塔", "灵隐寺", "苏堤"],
      "transportation": ["地铁1号线龙翔桥站打车10分钟", "萧山机场35公里"],
      "shopping": ["湖滨银泰", "武林广场商圈"]
    },
    "promotions": [
      {
        "type": "会员优惠",
        "description": "会员预订享9折优惠",
        "discountRate": 0.9,
        "validFrom": "2026-01-01",
        "validTo": "2026-12-31"
      }
    ],
    "status": "published",
    "createdAt": "2025-03-20T09:15:00Z",
    "updatedAt": "2026-01-18T11:45:00Z",
    "merchantId": "merchant_002"
  },
  {
    "id": "hotel_001",
    "basicInfo": {
      "nameZh": "上海外滩华尔道夫酒店",
      "nameEn": "Waldorf Astoria Shanghai on the Bund",
      "address": "上海市黄浦区中山东一路2号",
      "starRating": 5,
      "openingDate": "2011-04-18",
      "contactPhone": "021-63229988"
    },
    "roomTypes": [
      {
        "id": "room_001_01",
        "name": "豪华江景大床房",
        "price": 2880,
        "quantity": 45,
        "size": 55,
        "description": "配备特大号床，可欣赏外滩及黄浦江美景，含早餐"
      },
      {
        "id": "room_001_02",
        "name": "外滩景观套房",
        "price": 4580,
        "quantity": 20,
        "size": 85,
        "description": "独立客厅，270度外滩全景视野，含双人早餐及下午茶"
      },
      {
        "id": "room_001_03",
        "name": "总统套房",
        "price": 18888,
        "quantity": 2,
        "size": 280,
        "description": "复式结构，私人管家服务，配备独立书房、餐厅及会客厅"
      },
      {
        "id": "room_001_04",
        "name": "经典双床房",
        "price": 2280,
        "quantity": 30,
        "size": 48,
        "description": "两张单人床，城市景观，适合商务出行"
      },
      {
        "id": "room_001_05",
        "name": "行政商务房",
        "price": 1980,
        "quantity": 60,
        "size": 42,
        "description": "高速Wi-Fi，独立办公区域，含商务中心使用权"
      },
      {
        "id": "room_001_06",
        "name": "亲子主题房",
        "price": 2680,
        "quantity": 15,
        "size": 65,
        "description": "配备儿童床及玩具区，含双大小早餐及儿童乐园门票"
      },
      {
        "id": "room_001_07",
        "name": "蜜月浪漫套房",
        "price": 3880,
        "quantity": 8,
        "size": 75,
        "description": "圆形大床，浴缸带江景，含香槟及玫瑰花瓣布置"
      },
      {
        "id": "room_001_08",
        "name": "无障碍客房",
        "price": 1880,
        "quantity": 10,
        "size": 50,
        "description": "宽敞通道设计，配备无障碍卫浴设施，紧急呼叫系统"
      },
      {
        "id": "room_001_09",
        "name": "复古怀旧房",
        "price": 2180,
        "quantity": 12,
        "size": 45,
        "description": "老上海风情装潢，留声机及古典家具，含旗袍体验"
      },
      {
        "id": "room_001_10",
        "name": "空中花园房",
        "price": 5280,
        "quantity": 6,
        "size": 120,
        "description": "私人露台花园，户外按摩浴缸，360度城市天际线景观"
      },
      {
        "id": "room_001_11",
        "name": "电竞主题房",
        "price": 1680,
        "quantity": 20,
        "size": 38,
        "description": "配备高端游戏电脑及电竞椅，144Hz曲面屏，千兆网络"
      },
      {
        "id": "room_001_12",
        "name": "日式榻榻米房",
        "price": 2080,
        "quantity": 8,
        "size": 52,
        "description": "传统榻榻米设计，茶道体验区，含日式早餐及浴衣"
      },
      {
        "id": "room_001_13",
        "name": "健身达人房",
        "price": 2380,
        "quantity": 10,
        "size": 58,
        "description": "房内配备跑步机及哑铃组，蛋白质早餐套餐，免费健身房"
      },
      {
        "id": "room_001_14",
        "name": "星空观景房",
        "price": 3280,
        "quantity": 5,
        "size": 68,
        "description": "天窗设计可观星，配备天文望远镜，智能灯光模拟星空"
      },
      {
        "id": "room_001_15",
        "name": "长住公寓房",
        "price": 1280,
        "quantity": 25,
        "size": 55,
        "description": "配备厨房及洗衣机，适合长期入住，周租月租享优惠"
      }
    ],
    "images": {
      "cover": "https://example.com/waldorf/cover.jpg",
      "gallery": [
        "https://example.com/waldorf/lobby.jpg",
        "https://example.com/waldorf/pool.jpg",
        "https://example.com/waldorf/restaurant.jpg",
        "https://example.com/waldorf/exterior.jpg"
      ]
    },
    "surroundings": {
      "attractions": ["外滩", "南京路步行街", "豫园", "东方明珠"],
      "transportation": ["地铁2号线南京东路站步行5分钟", "浦东机场45公里"],
      "shopping": ["外滩源", "和平饭店商场", "南京路商圈"]
    },
    "promotions": [
      {
        "type": "节日优惠",
        "description": "春节期间连住3晚享8折",
        "discountRate": 0.8,
        "validFrom": "2026-01-25",
        "validTo": "2026-02-10"
      },
      {
        "type": "套餐优惠",
        "description": "机票+酒店套餐立减500元",
        "discountAmount": 500,
        "validFrom": "2026-01-01",
        "validTo": "2026-03-31"
      }
    ],
    "status": "published",
    "createdAt": "2025-06-15T10:30:00Z",
    "updatedAt": "2026-01-20T14:22:00Z",
    "merchantId": "merchant_001"
  },
      
  {
    "id": "hotel_003",
    "basicInfo": {
      "nameZh": "成都博舍酒店",
      "nameEn": "The Temple House Chengdu",
      "address": "四川省成都市锦江区笔帖式街81号",
      "starRating": 5,
      "openingDate": "2015-08-08",
      "contactPhone": "028-62979999"
    },
    "roomTypes": [
      {
        "id": "room_003_01",
        "name": "庭院客房",
        "price": 1280,
        "quantity": 50,
        "size": 45,
        "description": "可观庭院景色，融合川西建筑元素，含早餐"
      },
      {
        "id": "room_003_02",
        "name": "阁楼套房",
        "price": 2680,
        "quantity": 18,
        "size": 75,
        "description": "挑高设计，复古与现代结合，配备浴缸"
      },
      {
        "id": "room_003_03",
        "name": "别院套房",
        "price": 5880,
        "quantity": 6,
        "size": 150,
        "description": "独立四合院结构，私人庭院，专属管家服务"
      },
      {
        "id": "room_003_04",
        "name": "经典双床房",
        "price": 1180,
        "quantity": 35,
        "size": 42,
        "description": "两张单人床，简约设计，适合亲子出行"
      },
      {
        "id": "room_003_05",
        "name": "行政大床房",
        "price": 1680,
        "quantity": 25,
        "size": 52,
        "description": "行政楼层，含行政酒廊使用权及商务服务"
      }
    ],
    "images": {
      "cover": "https://example.com/templehouse/cover.jpg",
      "gallery": [
        "https://example.com/templehouse/courtyard.jpg",
        "https://example.com/templehouse/pool.jpg",
        "https://example.com/templehouse/restaurant.jpg",
        "https://example.com/templehouse/spa.jpg",
        "https://example.com/templehouse/lobby.jpg"
      ]
    },
    "surroundings": {
      "attractions": ["太古里", "大慈寺", "春熙路", "宽窄巷子"],
      "transportation": ["地铁2/3号线春熙路站步行8分钟", "双流机场20公里"],
      "shopping": ["太古里", "IFS国际金融中心", "春熙路商圈"]
    },
    "promotions": [
      {
        "type": "早鸟优惠",
        "description": "提前30天预订享85折",
        "discountRate": 0.85,
        "validFrom": "2026-01-01",
        "validTo": "2026-06-30"
      },
      {
        "type": "套餐优惠",
        "description": "SPA+住宿套餐立减300元",
        "discountAmount": 300,
        "validFrom": "2026-02-01",
        "validTo": "2026-04-30"
      },
      {
        "type": "节日优惠",
        "description": "情人节双人浪漫套餐赠送晚餐",
        "giftDescription": "米其林餐厅双人晚餐一份",
        "validFrom": "2026-02-13",
        "validTo": "2026-02-15"
      }
    ],
    "status": "pending_review",
    "createdAt": "2025-08-10T16:00:00Z",
    "updatedAt": "2026-01-28T09:30:00Z",
    "merchantId": "merchant_003"
  }
]