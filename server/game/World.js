const { Player } = require('./Player');
const { Monster } = require('./Monster');
const { SKILLS } = require('./Skills');
const { ITEMS } = require('./Items');
const { NPCS } = require('./NPCSystem');
const { 
  RARITIES, 
  ITEM_TEMPLATES, 
  CONSUMABLE_ITEMS, 
  generateEquipment, 
  enhanceEquipment 
} = require('./ItemSystem');
const { generateCultivationGear, CULTIVATION_SETS } = require('./CultivationSystem');
const { db } = require('../database/db');

// Định nghĩa 6 Đại Bản Đồ Cửu Châu + 3 Đại Tiên Cảnh Tu Tiên + Phụ Bản
const MAPS = {
  lac_duong: {
    id: 'lac_duong',
    name: 'Lạc Dương Cổ Thành (Lv.1 - 10 | Đồ Cấp 1)',
    bg: 'world_map.jpg',
    width: 2800,
    height: 1800,
    tierLevel: 1,
    safeZone: { minX: 950, maxX: 1850, minY: 450, maxY: 1050 }, // VÙNG NỘI THÀNH AN TOÀN
    portals: [
      { toMap: 'dao_hoa_dao', x: 2650, y: 1550, targetX: 600, targetY: 650, name: 'Đến Đào Hoa Đảo (Lv.10)' },
      { toMap: 'con_lon', x: 2650, y: 350, targetX: 450, targetY: 900, name: 'Đến Côn Lôn Tuyết Sơn (Lv.30)' },
      { toMap: 'dungeon_abyss', x: 1400, y: 350, targetX: 1400, targetY: 1580, name: '🌀 Cổng Vào Phụ Bản Cửu U Ma Huyệt' },
      { toMap: 'map_bong_lai', x: 1400, y: 550, targetX: 1200, targetY: 900, name: '⚡ Cổng Tiên Đạo: Bồng Lai Tiên Đảo (Lv.30+)' }
    ]
  },
  dao_hoa_dao: {
    id: 'dao_hoa_dao',
    name: 'Đào Hoa Tiên Đảo (Lv.10 - 20 | Đồ Cấp 10)',
    bg: 'map_peach_island.jpg',
    width: 2800,
    height: 1800,
    tierLevel: 10,
    safeZone: { minX: 1200, maxX: 1600, minY: 600, maxY: 900 },
    portals: [
      { toMap: 'lac_duong', x: 250, y: 650, targetX: 2350, targetY: 1550, name: 'Về Lạc Dương' },
      { toMap: 'ma_son', x: 2600, y: 400, targetX: 700, targetY: 1500, name: 'Đến Vạn Kiếp Ma Sơn (Lv.20)' }
    ]
  },
  ma_son: {
    id: 'ma_son',
    name: 'Vạn Kiếp Ma Sơn (Lv.20 - 30 | Đồ Cấp 20)',
    bg: 'map_demon_volcano.jpg',
    width: 2800,
    height: 1800,
    tierLevel: 20,
    safeZone: { minX: 300, maxX: 650, minY: 1350, maxY: 1650 },
    portals: [
      { toMap: 'lac_duong', x: 350, y: 1550, targetX: 1400, targetY: 750, name: 'Về Lạc Dương' },
      { toMap: 'dao_hoa_dao', x: 2550, y: 1550, targetX: 2350, targetY: 450, name: 'Về Đào Hoa Đảo' },
      { toMap: 'con_lon', x: 2550, y: 350, targetX: 450, targetY: 900, name: 'Đến Côn Lôn Tuyết Sơn (Lv.30)' }
    ]
  },
  con_lon: {
    id: 'con_lon',
    name: 'Côn Lôn Tuyết Sơn (Lv.30 - 40 | Đồ Cấp 30)',
    bg: 'map_con_lon.jpg',
    width: 2800,
    height: 1800,
    tierLevel: 30,
    safeZone: { minX: 300, maxX: 600, minY: 750, maxY: 1050 },
    portals: [
      { toMap: 'lac_duong', x: 350, y: 900, targetX: 2500, targetY: 450, name: 'Về Lạc Dương' },
      { toMap: 'hoang_sa', x: 2650, y: 900, targetX: 450, targetY: 900, name: 'Đến Hoàng Sa Cổ Thành (Lv.40)' }
    ]
  },
  hoang_sa: {
    id: 'hoang_sa',
    name: 'Hoàng Sa Cổ Thành (Lv.40 - 50 | Đồ Cấp 40)',
    bg: 'map_hoang_sa.jpg',
    width: 2800,
    height: 1800,
    tierLevel: 40,
    safeZone: { minX: 300, maxX: 600, minY: 750, maxY: 1050 },
    portals: [
      { toMap: 'con_lon', x: 350, y: 900, targetX: 2500, targetY: 900, name: 'Về Côn Lôn Tuyết Sơn' },
      { toMap: 'than_dien', x: 2650, y: 900, targetX: 450, targetY: 900, name: 'Đến Thái Cổ Thần Điện (Lv.50)' }
    ]
  },
  than_dien: {
    id: 'than_dien',
    name: 'Thái Cổ Thần Điện (Lv.50+ | Đồ Cực Phẩm Lv.50)',
    bg: 'map_than_dien.jpg',
    width: 2800,
    height: 1800,
    tierLevel: 50,
    safeZone: { minX: 300, maxX: 600, minY: 750, maxY: 1050 },
    portals: [
      { toMap: 'hoang_sa', x: 350, y: 900, targetX: 2500, targetY: 900, name: 'Về Hoàng Sa Cổ Thành' }
    ]
  },
  dungeon_abyss: {
    id: 'dungeon_abyss',
    name: 'Cửu U Ma Huyệt (Phụ Bản Bí Cảnh Cực Hạn | Đồ Cực Phẩm Lv.60+)',
    bg: 'map_dungeon_abyss.jpg',
    width: 2800,
    height: 1800,
    tierLevel: 60,
    safeZone: { minX: 1200, maxX: 1600, minY: 1500, maxY: 1750 },
    portals: [
      { toMap: 'lac_duong', x: 1400, y: 1680, targetX: 1400, targetY: 650, name: '🌀 Rời Phụ Bản về Lạc Dương' }
    ]
  },
  // 3 ĐẠI BẢN ĐỒ DÀNH RIÊNG CHO NGƯỜI TU TIÊN
  map_bong_lai: {
    id: 'map_bong_lai',
    name: 'Bồng Lai Tiên Đảo (Tiên Cảnh Tu Tiên Lv.30 - 55 | Quái Tu Tiên x5 HP)',
    bg: 'map_bong_lai.jpg',
    width: 2800,
    height: 1800,
    tierLevel: 55,
    isCultivationMap: true,
    safeZone: { minX: 1050, maxX: 1350, minY: 750, maxY: 1050 },
    portals: [
      { toMap: 'lac_duong', x: 1200, y: 800, targetX: 1400, targetY: 650, name: 'Về Lạc Dương' },
      { toMap: 'map_dao_tri', x: 2600, y: 900, targetX: 400, targetY: 900, name: '⚡ Đến Côn Lôn Dao Trì (Lv.55+)' }
    ]
  },
  map_dao_tri: {
    id: 'map_dao_tri',
    name: 'Côn Lôn Dao Trì (Hàn Băng Tiên Trì Lv.55 - 75 | Quái Tu Tiên x5 HP)',
    bg: 'map_dao_tri.jpg',
    width: 2800,
    height: 1800,
    tierLevel: 75,
    isCultivationMap: true,
    safeZone: { minX: 300, maxX: 550, minY: 750, maxY: 1050 },
    portals: [
      { toMap: 'map_bong_lai', x: 350, y: 900, targetX: 2450, targetY: 900, name: 'Về Bồng Lai Đảo' },
      { toMap: 'map_thai_hu', x: 2650, y: 900, targetX: 400, targetY: 900, name: '⚡ Tiến Vào Thái Hư Huyễn Cảnh (Lv.75+)' }
    ]
  },
  map_thai_hu: {
    id: 'map_thai_hu',
    name: 'Thái Hư Huyễn Cảnh (Cực Hạn Tiên Giới Lv.75 - 100 | Thần Ma Tu Tiên)',
    bg: 'map_thai_hu.jpg',
    width: 2800,
    height: 1800,
    tierLevel: 95,
    isCultivationMap: true,
    safeZone: { minX: 300, maxX: 550, minY: 750, maxY: 1050 },
    portals: [
      { toMap: 'map_dao_tri', x: 350, y: 900, targetX: 2500, targetY: 900, name: 'Về Côn Lôn Dao Trì' },
      { toMap: 'lac_duong', x: 2650, y: 900, targetX: 1400, targetY: 700, name: 'Về Lạc Dương Cổ Thành' }
    ]
  }
};

class World {
  constructor(io) {
    this.io = io;
    this.maps = MAPS;
    this.npcs = NPCS;
    this.players = {};
    this.monsters = {};
    this.projectiles = [];
    this.aoeZones = [];
    this.droppedItems = [];
    this.nextEntityId = 1000;
    this.lastTickTime = Date.now();
    this.activeRevenantEvent = null; // Sự kiện Boss Nguyên Hồn Ác Hóa Tọa Hóa
    
    this.initAllMonsters();
  }
  
  // Khởi tạo quái vật, Quái Tinh Anh & Boss trên 6 Bản Đồ (MẬT ĐỘ GẤP 10 LẦN - BÃI QUÁI ĐÔNG ĐÚC)
  initAllMonsters() {
    let mobCounter = 1;

    // Helper tạo bãi quái cụm (camp)
    const spawnCamp = (mapId, type, baseName, level, centerX, centerY, count, eliteRatio = 0.2) => {
      for (let i = 0; i < count; i++) {
        const id = `mob_${mapId}_${mobCounter++}`;
        const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const dist = 30 + Math.random() * 120;
        const x = Math.round(centerX + Math.cos(angle) * dist);
        const y = Math.round(centerY + Math.sin(angle) * dist);
        const isElite = Math.random() < eliteRatio;
        const mobLvl = level + (isElite ? 2 : Math.floor(Math.random() * 2));
        const name = isElite ? `★ ${baseName} Tinh Anh ★` : baseName;
        this.monsters[id] = new Monster(id, mapId, type, name, mobLvl, x, y, false, isElite);
      }
    };

    // 1. Quái Lạc Dương Ngoại Thành (Lv.3 - 10, Đồ Cấp 1, Bãi Quái Dày Đặc Ngoài Thành)
    spawnCamp('lac_duong', 'bandit', 'Sơn Tặc Thám Tử', 3, 400, 400, 8, 0.25);
    spawnCamp('lac_duong', 'bandit', 'Sơn Tặc Tiên Phong', 4, 380, 800, 8, 0.25);
    spawnCamp('lac_duong', 'bandit', 'Hắc Phong Đao Thủ', 5, 450, 1300, 8, 0.25);
    spawnCamp('lac_duong', 'bandit', 'Sơn Trại Đầu Mục', 6, 850, 1450, 8, 0.3);
    spawnCamp('lac_duong', 'bandit', 'Hắc Y Sát Thủ', 7, 2100, 1300, 8, 0.3);
    spawnCamp('lac_duong', 'bandit', 'Sơn Tặc Đầu Lĩnh', 8, 2300, 500, 8, 0.35);
    // 2 Boss Lạc Dương: Phổ Thông (common) & Ưu Tú (uncommon)
    this.monsters['boss_bandit_lord'] = new Monster('boss_bandit_lord', 'lac_duong', 'bandit', 'Hắc Phong Trại Đại Đương Gia [Phổ Thông]', 10, 400, 1450, true, false, 'common');
    this.monsters['boss_mad_blade'] = new Monster('boss_mad_blade', 'lac_duong', 'bandit', 'Lạc Dương Cuồng Đao Ma [Ưu Tú]', 14, 2350, 1250, true, false, 'uncommon');

    // 2. Quái Đào Hoa Đảo (Lv.10 - 18, Đồ Cấp 10, Đào Hoa Linh Cảnh)
    spawnCamp('dao_hoa_dao', 'spirit_fox', 'Ấu Hồ Đào Hoa', 10, 600, 650, 8, 0.25);
    spawnCamp('dao_hoa_dao', 'spirit_fox', 'Ngọc Hồ Linh Thú', 11, 850, 950, 8, 0.25);
    spawnCamp('dao_hoa_dao', 'spirit_fox', 'Bạch Hồ Tiên Thú', 12, 1200, 1250, 8, 0.3);
    spawnCamp('dao_hoa_dao', 'spirit_fox', 'Huyễn Cảnh Linh Hồ', 13, 1850, 850, 8, 0.3);
    spawnCamp('dao_hoa_dao', 'spirit_fox', 'Cửu Vĩ Yêu Hồ', 14, 2150, 1200, 8, 0.35);
    // 2 Boss Đào Hoa Đảo: Hiếm (rare) & Sử Thi (epic)
    this.monsters['boss_peach_fox'] = new Monster('boss_peach_fox', 'dao_hoa_dao', 'spirit_fox', 'Cửu Vĩ Linh Hồ Vương [Hiếm]', 20, 2100, 1100, true, false, 'rare');
    this.monsters['boss_peach_lord'] = new Monster('boss_peach_lord', 'dao_hoa_dao', 'spirit_fox', 'Đào Hoa Tiên Quân [Sử Thi]', 24, 1400, 650, true, false, 'epic');

    // 3. Quái Vạn Kiếp Ma Sơn (Lv.16 - 28, Đồ Cấp 20, Dung Nham Rực Lửa)
    spawnCamp('ma_son', 'fire_demon', 'Dung Nham Quỷ Tốt', 16, 800, 700, 8, 0.25);
    spawnCamp('ma_son', 'fire_demon', 'Viêm Hỏa Ma Binh', 18, 1150, 650, 8, 0.25);
    spawnCamp('ma_son', 'fire_demon', 'Hắc Ám Chiến Ma', 20, 1400, 1000, 8, 0.3);
    spawnCamp('ma_son', 'fire_demon', 'Viêm Ma Thống Lĩnh', 22, 1750, 1150, 8, 0.35);
    spawnCamp('ma_son', 'fire_demon', 'Ma Vực Hộ Pháp', 24, 2050, 800, 8, 0.35);
    // 2 Boss Ma Sơn: Hoàng Kim (legendary) & Truyền Thuyết (mythic)
    this.monsters['boss_demon_lord'] = new Monster('boss_demon_lord', 'ma_son', 'boss_demon', 'Hắc Phong Ma Tôn [Hoàng Kim]', 30, 1750, 480, true, false, 'legendary');
    this.monsters['boss_flame_emperor'] = new Monster('boss_flame_emperor', 'ma_son', 'boss_demon', 'Cửu U Viêm Đế [Truyền Thuyết]', 35, 1250, 1200, true, false, 'mythic');

    // 4. Quái Côn Lôn Tuyết Sơn (Lv.30 - 38, Đồ Cấp 30, Bão Tuyết Cực Hàn)
    spawnCamp('con_lon', 'snow_beast', 'Băng Giác Tuyết Thú', 30, 800, 650, 8, 0.25);
    spawnCamp('con_lon', 'snow_beast', 'Hàn Băng Thao Thiết', 32, 1200, 550, 8, 0.3);
    spawnCamp('con_lon', 'snow_beast', 'Côn Lôn Băng Viên', 34, 1600, 900, 8, 0.3);
    spawnCamp('con_lon', 'snow_beast', 'Băng Hồn Ma Tướng', 36, 1950, 750, 8, 0.35);
    spawnCamp('con_lon', 'snow_beast', 'Cực Hàn Tuyết Yêu', 38, 2200, 1150, 8, 0.35);
    // 2 Boss Côn Lôn: Thần Thoại (celestial) & Truyền Thuyết (mythic)
    this.monsters['boss_ice_phoenix'] = new Monster('boss_ice_phoenix', 'con_lon', 'boss_demon', 'Tuyết Sơn Băng Phượng [Thần Thoại]', 45, 1400, 480, true, false, 'celestial');
    this.monsters['boss_frost_giant'] = new Monster('boss_frost_giant', 'con_lon', 'boss_demon', 'Vạn Niên Băng Ma Cự Nhân [Truyền Thuyết]', 48, 1850, 1200, true, false, 'mythic');

    // 5. Quái Hoàng Sa Cổ Thành (Lv.40 - 48, Đồ Cấp 40, Sa Mạc Vô Tận)
    spawnCamp('hoang_sa', 'desert_demon', 'Hoàng Sa Độc Bọ Cạp', 40, 850, 650, 8, 0.25);
    spawnCamp('hoang_sa', 'desert_demon', 'Sa Mạc Cương Thi', 42, 1250, 600, 8, 0.3);
    spawnCamp('hoang_sa', 'desert_demon', 'Cổ Thành Ma Thú', 44, 1600, 950, 8, 0.3);
    spawnCamp('hoang_sa', 'desert_demon', 'Sa Thần Hộ Vệ', 46, 1950, 750, 8, 0.35);
    spawnCamp('hoang_sa', 'desert_demon', 'Hoàng Sa Dạ Xoa', 48, 2300, 1100, 8, 0.35);
    // 2 Boss Sa Thành: Ma Thần (abyssal) & Thần Thoại (celestial)
    this.monsters['boss_desert_king'] = new Monster('boss_desert_king', 'hoang_sa', 'boss_demon', 'Sa Thần Cổ Hoàng [Ma Thần]', 55, 1450, 480, true, false, 'abyssal');
    this.monsters['boss_sand_serpent'] = new Monster('boss_sand_serpent', 'hoang_sa', 'boss_demon', 'Thái Cổ Sa Thần Cự Mãng [Thần Thoại]', 58, 1950, 1200, true, false, 'celestial');

    // 6. Quái Thái Cổ Thần Điện (Lv.50 - 58, Đồ Cấp 50, Cửu Trọng Thiên Giới)
    spawnCamp('than_dien', 'celestial_guard', 'Cửu Trọng Thiên Binh', 50, 850, 750, 8, 0.25);
    spawnCamp('than_dien', 'celestial_guard', 'Thần Vực Hộ Pháp', 52, 1250, 650, 8, 0.3);
    spawnCamp('than_dien', 'celestial_guard', 'Thái Cổ Kim Cang', 54, 1650, 1000, 8, 0.3);
    spawnCamp('than_dien', 'celestial_guard', 'Thần Điện Chân Quân', 56, 2050, 800, 8, 0.35);
    spawnCamp('than_dien', 'celestial_guard', 'Cửu Thiên Huyền Thú', 58, 2400, 1200, 8, 0.35);
    // 2 Boss Thần Điện: Ma Thần (abyssal) & Bạch Kim Chí Tôn (platinum)
    this.monsters['boss_divine_dragon'] = new Monster('boss_divine_dragon', 'than_dien', 'boss_demon', 'Thái Cổ Chân Long [Ma Thần]', 65, 1400, 480, true, false, 'abyssal');
    this.monsters['boss_celestial_overlord'] = new Monster('boss_celestial_overlord', 'than_dien', 'boss_demon', 'Cửu Thiên Thần Vương [Bạch Kim]', 70, 2000, 500, true, false, 'platinum');

    // 7. Quái Phụ Bản Cửu U Ma Huyệt (Lv.60 - 75, Đồ Cực Phẩm Lv.60, Tử Khí Ngập Trời)
    spawnCamp('dungeon_abyss', 'fire_demon', 'Cửu U Oán Linh', 60, 800, 700, 10, 0.35);
    spawnCamp('dungeon_abyss', 'desert_demon', 'Hắc Ám Độc Thú', 63, 1200, 600, 10, 0.35);
    spawnCamp('dungeon_abyss', 'snow_beast', 'Băng Phách Tu La', 66, 1600, 700, 10, 0.4);
    spawnCamp('dungeon_abyss', 'celestial_guard', 'Tử Vong Minh Vệ', 70, 2000, 700, 10, 0.45);
    // 2 Siêu Boss Phụ Bản Bí Cảnh: Ma Thần (abyssal) & Bạch Kim Chí Tôn (platinum)
    this.monsters['boss_abyss_dark_lord'] = new Monster('boss_abyss_dark_lord', 'dungeon_abyss', 'boss_demon', 'Cửu U Ma Thần U Hồn [Ma Thần]', 75, 1400, 600, true, false, 'abyssal');
    this.monsters['boss_abyss_plat_overlord'] = new Monster('boss_abyss_plat_overlord', 'dungeon_abyss', 'boss_demon', 'Cửu U Chí Tôn Ma Hoàng [Bạch Kim]', 85, 2050, 450, true, false, 'platinum');

    // 8. Quái Tiên Đạo Bồng Lai Đảo (Lv.40 - 55, Quái Tu Tiên Máu Gấp 20 Lần)
    spawnCamp('map_bong_lai', 'cultiv_fox', 'Bồng Lai Linh Hồ', 40, 750, 650, 10, 0.35);
    spawnCamp('map_bong_lai', 'cultiv_fox', 'Tiên Cảnh Thần Hạc', 45, 1650, 650, 10, 0.35);
    spawnCamp('map_bong_lai', 'cultiv_fox', 'Bạch Ngọc Linh Thú', 50, 2050, 1200, 10, 0.4);
    const bossBL = new Monster('boss_bl_emperor', 'map_bong_lai', 'boss_demon', 'Bồng Lai Đảo Chủ [Tu Tiên - Thần Thoại]', 65, 1400, 400, true, false, 'celestial');
    bossBL.isCultivBoss = true;
    bossBL.maxHp = 18000000;
    bossBL.hp = 18000000;
    bossBL.attack = 15000;
    bossBL.defense = 4500;
    bossBL.expReward = 850000;
    this.monsters['boss_bl_emperor'] = bossBL;

    // 9. Quái Tiên Đạo Côn Lôn Dao Trì (Lv.58 - 75, Quái Tu Tiên Máu Gấp 20 Lần)
    spawnCamp('map_dao_tri', 'cultiv_snow', 'Dao Trì Băng Tinh Thú', 58, 850, 700, 10, 0.35);
    spawnCamp('map_dao_tri', 'cultiv_snow', 'Hàn Ngọc Tiên Điêu', 65, 1500, 600, 10, 0.4);
    spawnCamp('map_dao_tri', 'cultiv_snow', 'Cực Bắc Kiếm Linh', 72, 2150, 1100, 10, 0.45);
    const bossDT = new Monster('boss_dt_queen', 'map_dao_tri', 'boss_demon', 'Dao Trì Thánh Mẫu [Tu Tiên - Ma Thần]', 80, 1400, 500, true, false, 'abyssal');
    bossDT.isCultivBoss = true;
    bossDT.maxHp = 38000000;
    bossDT.hp = 38000000;
    bossDT.attack = 28000;
    bossDT.defense = 7500;
    bossDT.expReward = 1600000;
    this.monsters['boss_dt_queen'] = bossDT;

    // 10. Quái Tiên Đạo Thái Hư Huyễn Cảnh (Lv.75 - 100, Thần Ma Hư Không Cực Hạn)
    spawnCamp('map_thai_hu', 'cultiv_demon', 'Thái Hư Huyễn Ma', 75, 800, 750, 10, 0.4);
    spawnCamp('map_thai_hu', 'cultiv_demon', 'Hư Không Dạ Xoa', 85, 1550, 650, 10, 0.45);
    spawnCamp('map_thai_hu', 'cultiv_demon', 'Thái Cổ Ma Thần Thú', 95, 2200, 1100, 10, 0.5);
    const bossTH = new Monster('boss_th_overlord', 'map_thai_hu', 'boss_demon', 'Thái Hư Ma Tôn [Tu Tiên - Bạch Kim Chí Tôn]', 100, 1400, 450, true, false, 'platinum');
    bossTH.isCultivBoss = true;
    bossTH.maxHp = 80000000;
    bossTH.hp = 80000000;
    bossTH.attack = 48000;
    bossTH.defense = 12000;
    bossTH.expReward = 3500000;
    this.monsters['boss_th_overlord'] = bossTH;

    // 11. BOSS TU TIÊN GIÁNG THẾ TUẦN TRA MAP BÌNH THƯỜNG (MÁU GẤP 10 LẦN, DAME GẤP 5 LẦN THEO YÊU CẦU)
    // Boss 1: Thái Cổ Ma Tu (Lv.45, 6.8M HP, Dame x5 giáng lâm tuần tra tại Lạc Dương Cổ Thành)
    const bInv1 = new Monster('boss_cultiv_invader_1', 'lac_duong', 'cultiv_demon', 'Thái Cổ Ma Tu [Tu Tiên - Ma Đạo]', 45, 1950, 450, true, false, 'platinum');
    bInv1.isCultivBoss = true;
    bInv1.maxHp = 6800000;  // 680,000 x 10 = 6,800,000 HP
    bInv1.hp = 6800000;
    bInv1.attack = 19000;   // Dame tăng gấp 5 lần
    bInv1.defense = 3500;
    bInv1.expReward = 950000;
    this.monsters['boss_cultiv_invader_1'] = bInv1;

    // Boss 2: Hư Không Thần Thú (Lv.60, 12M HP, Dame x5 giáng lâm tuần tra tại Vạn Kiếp Ma Sơn)
    const bInv2 = new Monster('boss_cultiv_invader_2', 'ma_son', 'cultiv_demon', 'Hư Không Thần Thú [Tu Tiên - Thần Thoại]', 60, 1850, 1150, true, false, 'celestial');
    bInv2.isCultivBoss = true;
    bInv2.maxHp = 12000000; // 1,200,000 x 10 = 12,000,000 HP
    bInv2.hp = 12000000;
    bInv2.attack = 32500;   // Dame tăng gấp 5 lần
    bInv2.defense = 6000;
    bInv2.expReward = 1800000;
    this.monsters['boss_cultiv_invader_2'] = bInv2;

    // Boss 3: Cửu Thiên Kiếm Ma (Lv.70, 22M HP, Dame x5 giáng lâm tuần tra tại Côn Lôn Tuyết Sơn)
    const bInv3 = new Monster('boss_cultiv_invader_3', 'con_lon', 'cultiv_demon', 'Cửu Thiên Kiếm Ma [Tu Tiên - Bạch Kim]', 70, 1550, 550, true, false, 'platinum');
    bInv3.isCultivBoss = true;
    bInv3.maxHp = 22000000; // 2,200,000 x 10 = 22,000,000 HP
    bInv3.hp = 22000000;
    bInv3.attack = 60000;   // Dame tăng gấp 5 lần
    bInv3.defense = 10000;
    bInv3.expReward = 2800000;
    this.monsters['boss_cultiv_invader_3'] = bInv3;
  }
  
  addPlayer(id, name, sect, savedCharData = null, username = null) {
    const spawnX = 1350 + (Math.random() - 0.5) * 150;
    const spawnY = 680 + (Math.random() - 0.5) * 150;
    const player = new Player(id, name, sect, spawnX, spawnY);
    player.username = username;

    if (savedCharData) {
      player.loadSavedState(savedCharData);
      player.charId = savedCharData.id;
    }

    this.players[id] = player;
    this.broadcastNotice(`Hiệp khách [${player.name}] đã bước chân vào Cửu Châu!`, 'system');
    return player;
  }

  savePlayer(id) {
    const p = this.players[id];
    if (p && p.username && p.charId) {
      db.saveCharacter(p.username, p.charId, p.serialize());
    }
  }

  saveAllPlayers() {
    for (const id of Object.keys(this.players)) {
      this.savePlayer(id);
    }
  }
  
  removePlayer(id) {
    this.savePlayer(id);
    delete this.players[id];
  }
  
  setPlayerTarget(id, targetX, targetY) {
    const p = this.players[id];
    if (!p || p.hp <= 0) return;
    if (p.isMeditating) p.isMeditating = false;
    
    // Kiểm tra bước qua Portal dịch chuyển
    const curMap = this.maps[p.currentMap] || this.maps.lac_duong;
    if (curMap.portals) {
      for (const portal of curMap.portals) {
        const d = Math.hypot(targetX - portal.x, targetY - portal.y);
        if (d <= 95) {
          const now = Date.now();
          if (!p.portalCooldown || now >= p.portalCooldown) {
            p.portalCooldown = now + 4000;
            const targetMapDef = this.maps[portal.toMap];
            if (targetMapDef && targetMapDef.isCultivationMap && p.level < 30) {
              this.io.to(p.id).emit('notice', {
                msg: '⚡ THIÊN KIẾP CẢNH BÁO! Cổng Tiên Giới có áp lực cực đại, tu sĩ dưới Cấp 30 bước vào sẽ hồn phi phách tán! Hãy đạt Cấp 30 rồi trở lại!',
                type: 'danger'
              });
              p.x = p.x + (portal.x > p.x ? -60 : 60);
              p.y = p.y + (portal.y > p.y ? -60 : 60);
              p.isMoving = false;
              return;
            }
            this.teleportPlayer(p.id, portal.toMap, portal.targetX, portal.targetY);
            return;
          }
        }
      }
    }
    
    p.targetX = targetX;
    p.targetY = targetY;
    p.isMoving = true;
    
    const dx = targetX - p.x;
    const dy = targetY - p.y;
    p.angle = Math.atan2(dy, dx);
  }
  
  teleportPlayer(id, targetMapId, spawnX = null, spawnY = null) {
    const p = this.players[id];
    if (!p || !this.maps[targetMapId]) return;

    // CHẶN TUYỆT ĐỐI NGƯỜI CHƠI DƯỚI CẤP 30 VÀO MAP TU TIÊN!
    if (this.maps[targetMapId].isCultivationMap && p.level < 30) {
      this.io.to(id).emit('notice', {
        msg: 'Bản đồ này thuộc Tiên Giới! Yêu cầu đạt Cấp 30 & Thoát Thai Hoán Cốt mới có thể phi thăng đến!',
        type: 'danger'
      });
      return;
    }
    
    let tx = spawnX !== null ? spawnX : 1400;
    let ty = spawnY !== null ? spawnY : 700;
    
    if (spawnX === null) {
      if (targetMapId === 'dao_hoa_dao') { tx = 1400; ty = 750; }
      else if (targetMapId === 'ma_son') { tx = 500; ty = 1450; }
      else if (targetMapId === 'con_lon') { tx = 450; ty = 900; }
      else if (targetMapId === 'hoang_sa') { tx = 450; ty = 900; }
      else if (targetMapId === 'than_dien') { tx = 450; ty = 900; }
      else if (targetMapId === 'map_bong_lai') { tx = 1200; ty = 900; }
      else if (targetMapId === 'map_dao_tri') { tx = 450; ty = 900; }
      else if (targetMapId === 'map_thai_hu') { tx = 450; ty = 900; }
    }
    
    p.changeMap(targetMapId, tx, ty);
    this.io.to(p.id).emit('map_changed', {
      mapId: targetMapId,
      x: tx,
      y: ty,
      mapInfo: this.maps[targetMapId]
    });
    this.broadcastNotice(`Hiệp khách [${p.name}] đã ngự kiếm phi hành tới [${this.maps[targetMapId].name}]!`, 'system');
  }
  
  executeDash(id, dirX, dirY) {
    const p = this.players[id];
    const now = Date.now();
    if (!p || p.hp <= 0 || now < p.dashCooldown) return;
    if (p.isMeditating) p.isMeditating = false;
    
    if (p.mp < 15) return;
    p.mp -= 15;
    
    let norm = Math.hypot(dirX, dirY);
    if (norm < 0.1) {
      dirX = Math.cos(p.angle);
      dirY = Math.sin(p.angle);
      norm = 1;
    }
    
    p.isDashing = true;
    p.dashDirX = dirX / norm;
    p.dashDirY = dirY / norm;
    p.dashEndTime = now + 350;
    p.dashCooldown = now + 2500;
    
    this.io.emit('skill_effect', {
      type: 'dash',
      mapId: p.currentMap,
      playerId: p.id,
      startX: p.x,
      startY: p.y,
      endX: p.x + p.dashDirX * 240,
      endY: p.y + p.dashDirY * 240
    });
  }
  
  castSkill(playerId, skillId, targetX, targetY) {
    const p = this.players[playerId];
    const now = Date.now();
    if (!p || p.hp <= 0) return;
    if (p.isMeditating) p.isMeditating = false;
    
    const skillDef = SKILLS[skillId];
    if (!skillDef) return;
    
    const skillLvl = p.skillLevels[skillId] || 1;
    const cooldown = Math.max(800, (skillDef.baseCooldown || 2000) - (skillLvl - 1) * (skillDef.cdReducePerLevel || 0));
    const mpCost = skillDef.baseMpCost || 20;
    const damageMul = (skillDef.baseDamageMul || 1.5) + (skillLvl - 1) * (skillDef.dmgPerLevel || 0.1);
    
    if (p.skillCooldowns[skillId] && now < p.skillCooldowns[skillId]) return;
    if (p.mp < mpCost) return;
    
    p.mp -= mpCost;
    p.skillCooldowns[skillId] = now + cooldown;
    
    const dx = targetX - p.x;
    const dy = targetY - p.y;
    const dist = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);
    p.angle = angle;
    
    if (skillDef.type === 'projectile') {
      this.projectiles.push({
        id: `proj_${this.nextEntityId++}`,
        mapId: p.currentMap,
        ownerId: p.id,
        skillId: skillDef.id,
        x: p.x,
        y: p.y,
        vx: (dx / dist) * 700,
        vy: (dy / dist) * 700,
        angle: angle,
        rangeLeft: 480,
        damage: Math.floor(p.getAttack() * damageMul),
        critRate: p.getCritRate(),
        color: skillDef.color,
        hitEntities: new Set()
      });
      
      this.io.emit('skill_cast', {
        type: 'projectile',
        mapId: p.currentMap,
        playerId: p.id,
        skillId: skillDef.id,
        x: p.x,
        y: p.y,
        angle
      });
    } else if (skillDef.type === 'aoe_storm' || skillDef.type === 'vortex' || skillDef.type === 'aoe_stomp') {
      const aoeX = p.x + (dx / dist) * Math.min(dist, 280);
      const aoeY = p.y + (dy / dist) * Math.min(dist, 280);
      
      this.aoeZones.push({
        id: `aoe_${this.nextEntityId++}`,
        mapId: p.currentMap,
        ownerId: p.id,
        skillId: skillDef.id,
        type: skillDef.type,
        x: aoeX,
        y: aoeY,
        radius: skillDef.radius || 200,
        damagePerSec: Math.floor(p.getAttack() * damageMul),
        critRate: p.getCritRate(),
        color: skillDef.color,
        startTime: now,
        endTime: now + (skillDef.duration || 2000),
        lastTick: now,
        siphonRate: skillDef.siphonRate || 0
      });
      
      this.io.emit('skill_cast', {
        type: 'aoe',
        mapId: p.currentMap,
        playerId: p.id,
        skillId: skillDef.id,
        x: aoeX,
        y: aoeY,
        radius: skillDef.radius || 200,
        duration: skillDef.duration,
        color: skillDef.color
      });
    } else if (skillDef.type === 'buff_shield') {
      const shieldRatio = (skillDef.baseShieldMul || 0.35) + (skillLvl - 1) * (skillDef.shieldPerLevel || 0.05);
      p.shield = Math.floor(p.getMaxHp() * shieldRatio);
      p.shieldEndTime = now + skillDef.duration;
      if (skillDef.reflectMul) {
        p.reflectActive = true;
        p.reflectEndTime = now + skillDef.duration;
      }
      if (p.sect === 'wudang') {
        p.hasManaShield = true;
      }
      
      this.io.emit('skill_cast', {
        type: 'buff',
        mapId: p.currentMap,
        playerId: p.id,
        skillId: skillDef.id,
        duration: skillDef.duration,
        color: skillDef.color
      });
    } else if (skillDef.type === 'buff_formation') {
      p.reflectActive = true;
      p.reflectEndTime = now + skillDef.duration;
      
      this.io.emit('skill_cast', {
        type: 'buff',
        mapId: p.currentMap,
        playerId: p.id,
        skillId: skillDef.id,
        duration: skillDef.duration,
        color: skillDef.color
      });
    } else if (skillDef.type === 'ultimate_roar' || skillDef.type === 'ultimate_swords') {
      // Tuyệt kỹ chấn động diện rộng (Sư Tử Hống / Vạn Kiếm Triều Tông)
      const rad = skillDef.radius || 320;
      const dmg = Math.floor(p.getAttack() * damageMul * 2.5);
      for (const m of Object.values(this.monsters)) {
        if (m.state === 'dead' || m.mapId !== p.currentMap) continue;
        if (Math.hypot(m.x - p.x, m.y - p.y) <= rad) {
          this.applyDamageToMonster(m, dmg, true, p);
        }
      }
      this.io.emit('skill_cast', {
        type: 'ultimate',
        mapId: p.currentMap,
        playerId: p.id,
        skillId: skillDef.id,
        startX: p.x,
        startY: p.y,
        color: skillDef.color
      });
    } else if (skillDef.type === 'dash_slash' || skillDef.type === 'phantom_burst') {
      const targetDist = Math.min(dist, 400);
      const endX = p.x + (dx / dist) * targetDist;
      const endY = p.y + (dy / dist) * targetDist;
      
      p.x = endX;
      p.y = endY;
      p.targetX = endX;
      p.targetY = endY;
      
      const baseDmg = Math.floor(p.getAttack() * damageMul);
      const isCrit = Math.random() < (p.getCritRate() + (skillDef.critBonus || 0));
      const totalDmg = isCrit ? Math.floor(baseDmg * 2.3) : baseDmg;
      
      for (const m of Object.values(this.monsters)) {
        if (m.state === 'dead' || m.mapId !== p.currentMap) continue;
        if (Math.hypot(m.x - p.x, m.y - p.y) <= 240) {
          this.applyDamageToMonster(m, totalDmg, isCrit, p);
        }
      }
      
      this.io.emit('skill_cast', {
        type: 'ultimate',
        mapId: p.currentMap,
        playerId: p.id,
        skillId: skillDef.id,
        startX: p.x,
        startY: p.y,
        endX,
        endY,
        color: skillDef.color
      });
    }
  }
  
  castNormalAttack(playerId, targetX, targetY) {
    const p = this.players[playerId];
    const now = Date.now();
    if (!p || p.hp <= 0 || now - p.lastAttackTime < 400) return;
    if (p.isMeditating) p.isMeditating = false;
    
    p.lastAttackTime = now;
    const dx = targetX - p.x;
    const dy = targetY - p.y;
    const angle = Math.atan2(dy, dx);
    p.angle = angle;
    
    const attackRange = 135;
    const isCrit = Math.random() < p.getCritRate();
    const rawDmg = Math.floor(p.getAttack() * (isCrit ? 1.85 : 1.0));
    
    let hitCount = 0;
    for (const m of Object.values(this.monsters)) {
      if (m.state === 'dead' || m.mapId !== p.currentMap) continue;
      const mdx = m.x - p.x;
      const mdy = m.y - p.y;
      const dist = Math.hypot(mdx, mdy);
      
      if (dist <= attackRange) {
        const mAngle = Math.atan2(mdy, mdx);
        let diff = Math.abs(angle - mAngle);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;
        
        if (diff < Math.PI / 2.3) {
          this.applyDamageToMonster(m, rawDmg, isCrit, p);
          hitCount++;
        }
      }
    }
    
    this.io.emit('normal_attack', {
      mapId: p.currentMap,
      playerId: p.id,
      x: p.x,
      y: p.y,
      angle,
      hit: hitCount > 0
    });
  }
  
  applyDamageToMonster(monster, damage, isCrit, player) {
    const result = monster.takeDamage(damage, player);
    
    this.io.emit('damage_popup', {
      mapId: monster.mapId,
      targetId: monster.id,
      x: monster.x,
      y: monster.y - 30,
      damage: result.damage,
      isCrit: isCrit,
      isPlayer: false
    });
    
    if (result.dead) {
      if (player) {
        if (typeof player.addExp === 'function') {
          const leveledUp = player.addExp(monster.expReward);
          if (leveledUp) {
            this.io.emit('player_levelup', {
              playerId: player.id,
              level: player.level,
              realm: player.getRealmName()
            });
            this.broadcastNotice(`Hiệp khách [${player.name}] đã đột phá lên Cảnh giới [${player.getRealmName()}]! Nhận +5 Điểm Tiềm Năng & +1 Điểm Võ Học!`, 'system');
          }
        }
        // CỘNG ĐIỂM TU VI TIÊN ĐẠO
        if (typeof player.addTuvi === 'function') {
          const tuviBase = monster.isBoss ? (monster.expReward * 6) : (monster.isElite ? monster.expReward * 3 : monster.expReward * 1.5);
          const gainedTuvi = player.addTuvi(tuviBase);
          this.io.to(player.id).emit('tuvi_gain', {
            tuviGained: gainedTuvi,
            totalTuvi: player.tuvi
          });
        }
      }
      
      if (monster.isRevenantBoss) {
        this.dropRevenantLoot(monster, player);
      } else {
        this.dropLoot(monster.x, monster.y, monster.isBoss, monster.mapId, monster.isElite, monster.bossRarity, monster);
        
        if (monster.isBoss) {
          const killerName = (player && player.name) ? player.name : 'Vô Danh Cao Thủ';
          const rName = monster.bossRarity ? ` [Phẩm Cấp: ${monster.bossRarity.toUpperCase()}]` : '';
          this.broadcastNotice(`SẤM SÉT VANG RỜI! Đại Boss [${monster.name}]${rName} đã bị [${killerName}] chém hạ! Rơi rớt toàn bộ Thần Trang tương ứng!`, 'boss_kill');
        } else if (monster.isElite) {
          this.broadcastNotice(`Hiệp khách [${player ? player.name : 'Đại Hiệp'}] đã tiêu diệt Quái Tinh Anh [${monster.name}]! Thu hoạch bảo vật quý hiếm!`, 'system');
        }
      }
    }
  }

  // ============================================================
  // HỆ THỐNG CƯỜNG GIẢ TỌA HÓA - NGUYÊN HỒN ÁC HÓA GIÁNG THẾ (WORLD EVENT)
  // ============================================================
  spawnRevenantBossFromPlayer(player) {
    if (!player) return null;

    // 1. Thu thập toàn bộ trang bị, túi đồ và ngân lượng của người chơi tọa hóa
    const equips = Object.values(player.equipment || {}).filter(Boolean);
    const invItems = (player.inventory || []).filter(Boolean);
    const gold = Number(player.gold) || 5000;

    // 2. Chọn ngẫu nhiên 1 map giang hồ / tiên giới (loại trừ Lạc Dương an toàn)
    const candidateMaps = [
      'dao_hoa_dao', 'ma_son', 'con_lon', 'hoang_sa', 'than_dien', 
      'map_bong_lai', 'map_dao_tri', 'map_thai_hu'
    ];
    let targetMapId = candidateMaps[Math.floor(Math.random() * candidateMaps.length)];
    if (player.level >= 30 && Math.random() < 0.6) {
      const cultivMaps = ['map_bong_lai', 'map_dao_tri', 'map_thai_hu'];
      targetMapId = cultivMaps[Math.floor(Math.random() * cultivMaps.length)];
    }
    const mapInfo = this.maps[targetMapId] || this.maps.dao_hoa_dao;

    // 3. Tọa độ xuất hiện ngẫu nhiên
    const spawnX = Math.round(500 + Math.random() * (mapInfo.width - 1000));
    const spawnY = Math.round(400 + Math.random() * (mapInfo.height - 800));

    // 4. Tạo Boss Nguyên Hồn Ác Hóa
    const bossId = `boss_revenant_${player.id}_${Date.now()}`;
    const bossName = `Nguyên Hồn Ác Hóa - ${player.name}`;
    const pRealm = typeof player.getRealmName === 'function' ? player.getRealmName() : 'Luyện Khí Tầng 1';

    const revenantData = {
      ownerName: player.name,
      ownerSect: player.sect,
      ownerCultivSect: player.cultivSect,
      ownerRealm: pRealm,
      loot: {
        equipment: equips,
        inventory: invItems,
        gold: gold
      }
    };

    const boss = new Monster(
      bossId,
      targetMapId,
      'revenant_boss',
      bossName,
      Math.max(10, player.level || 1),
      spawnX,
      spawnY,
      true,  // isBoss
      false, // isElite
      'platinum', // bossRarity
      revenantData
    );

    // MÁU VÀ CÔNG KÍCH GẤP 10 LẦN THEO YÊU CẦU CỦA USER
    const playerBaseHp = typeof player.getMaxHp === 'function' ? player.getMaxHp() : 25000;
    const playerBaseAtk = typeof player.getAttack === 'function' ? player.getAttack() : 450;

    boss.maxHp = Math.max(800000, playerBaseHp * 10);
    boss.hp = boss.maxHp;
    boss.attack = Math.max(1600, playerBaseAtk * 5); // Sát thương cực lớn
    boss.defense = Math.max(450, (player.getDefense ? player.getDefense() : 120) * 3);
    boss.speed = 215;
    boss.size = 155;
    boss.aggroRange = 750;
    boss.attackRange = 125;
    boss.expReward = 250000;

    this.monsters[bossId] = boss;

    this.activeRevenantEvent = {
      bossId: boss.id,
      ownerName: player.name,
      ownerSect: player.sect,
      ownerCultivSect: player.cultivSect,
      ownerRealm: pRealm,
      ownerLevel: player.level || 1,
      mapId: targetMapId,
      mapName: mapInfo.name,
      x: spawnX,
      y: spawnY,
      maxHp: boss.maxHp,
      totalDropsCount: equips.length + invItems.length,
      totalGold: gold,
      spawnTime: Date.now()
    };

    // 5. Thông báo chạy toàn server theo chuẩn yêu cầu
    const announceMsg = `Cường giả [${player.name}] đã tọa hóa tại [${mapInfo.name}], hồn thể ác hóa gây hại nhân gian mời chư vị đến trừ ma vệ đạo, phần thưởng trang bị người đó sẽ rớt ra sau khi nguyên hồn ác hóa bị đánh lui`;
    this.broadcastNotice(announceMsg, 'boss_kill');

    // 6. Phát sự kiện nổi bật toàn màn hình cho tất cả người chơi
    if (this.io) {
      this.io.emit('revenant_boss_spawned', {
        bossId: boss.id,
        ownerName: player.name,
        ownerSect: player.sect,
        ownerCultivSect: player.cultivSect,
        ownerRealm: pRealm,
        ownerLevel: player.level || 1,
        mapId: targetMapId,
        mapName: mapInfo.name,
        x: spawnX,
        y: spawnY,
        maxHp: boss.maxHp,
        totalDropsCount: equips.length + invItems.length,
        totalGold: gold,
        msg: announceMsg
      });
    }

    console.log(`[REVENANT EVENT] Đã giáng lâm Nguyên Hồn Ác Hóa [${player.name}] tại ${mapInfo.name} (${spawnX}, ${spawnY}) với HP: ${boss.maxHp}`);
    return boss;
  }

  dropRevenantLoot(monster, killer) {
    if (!monster || !monster.revenantLoot) return;

    const loot = monster.revenantLoot;
    const killerName = (killer && killer.name) ? killer.name : 'Chư vị Hiệp Khách';
    const centerX = monster.x;
    const centerY = monster.y;
    const mapId = monster.mapId;
    const mapInfo = this.maps[mapId] || this.maps.lac_duong;

    console.log(`[REVENANT EVENT] Boss [${monster.name}] bị tiêu diệt bởi [${killerName}]! Rơi rớt toàn bộ kho báu...`);

    // 1. RƠI TOÀN BỘ TRANG BỊ NGƯỜI CHẾT ĐANG MẶC (BẢO LƯU Y NGUYÊN CHỈ SỐ, PHẨM CẤP, SET VÀ ORBIT AURA)
    const equips = loot.equipment || [];
    for (const eq of equips) {
      const dropId = `drop_${this.nextEntityId++}`;
      const offsetX = (Math.random() - 0.5) * 200;
      const offsetY = (Math.random() - 0.5) * 200;
      const drop = {
        id: dropId,
        mapId: mapId,
        isEquipment: true,
        itemInstance: eq,
        itemId: eq.templateKey || eq.id || 'revenant_gear',
        name: eq.name,
        icon: eq.icon,
        rarity: eq.rarity || 'platinum',
        rarityName: eq.rarityName || 'Trang Bị Cường Giả',
        rarityColor: eq.rarityColor || '#ffd700',
        isShimmering: true,
        isCultivGear: !!eq.isCultivGear,
        orbitColor: eq.orbitColor || '#e11d48',
        x: Math.round(centerX + offsetX),
        y: Math.round(centerY + offsetY),
        createdAt: Date.now(),
        expireTime: Date.now() + 180000 // Tồn tại 3 phút để người chơi nhặt
      };
      this.droppedItems.push(drop);
      this.io.emit('item_dropped', drop);
    }

    // 2. RƠI CÁC VẬT PHẨM TRONG HÀNH TRANG (ĐÁ CƯỜNG HÓA, PHÙ, NGỌC KHẢM, ĐAN DƯỢC)
    const invItems = loot.inventory || [];
    for (const it of invItems.slice(0, 16)) {
      const dropId = `drop_${this.nextEntityId++}`;
      const offsetX = (Math.random() - 0.5) * 240;
      const offsetY = (Math.random() - 0.5) * 240;
      const drop = {
        id: dropId,
        mapId: mapId,
        isEquipment: false,
        itemId: it.id || it.itemId || 'item_gold_ingot',
        name: it.name || 'Bảo Vật Tiền Bối',
        icon: it.icon || '🎁',
        rarity: it.rarity || 'epic',
        rarityColor: it.rarityColor || '#c084fc',
        x: Math.round(centerX + offsetX),
        y: Math.round(centerY + offsetY),
        createdAt: Date.now(),
        expireTime: Date.now() + 180000
      };
      this.droppedItems.push(drop);
      this.io.emit('item_dropped', drop);
    }

    // 3. RƠI TOÀN BỘ NGÂN LƯỢNG THÀNH 5 ĐỐNG VÀNG LỚN XUNG QUANH
    const totalGold = loot.gold || 5000;
    const goldPiles = 5;
    const goldPerPile = Math.max(800, Math.round(totalGold / goldPiles));
    for (let i = 0; i < goldPiles; i++) {
      const dropId = `drop_${this.nextEntityId++}`;
      const offsetX = (Math.random() - 0.5) * 260;
      const offsetY = (Math.random() - 0.5) * 260;
      const drop = {
        id: dropId,
        mapId: mapId,
        isEquipment: false,
        itemId: 'item_gold_ingot',
        name: `Bọc Ngân Lượng Tiền Bối (+${goldPerPile.toLocaleString()} Vàng)`,
        icon: '💰',
        rarity: 'epic',
        rarityColor: '#fbbf24',
        goldValue: goldPerPile,
        x: Math.round(centerX + offsetX),
        y: Math.round(centerY + offsetY),
        createdAt: Date.now(),
        expireTime: Date.now() + 180000
      };
      this.droppedItems.push(drop);
      this.io.emit('item_dropped', drop);
    }

    // 4. RƠI THÊM CÁC TIÊN ĐAN THƯỢNG HẠNG (TU VI ĐAN, THỌ NGUYÊN ĐAN, ĐỘT PHÁ ĐAN)
    const bonusPills = [
      { id: 'item_tuvi_pill', name: 'Cửu U Tu Vi Đan (+5000 Tu Vi)', icon: '🔮' },
      { id: 'item_lifespan_pill', name: 'Trường Sinh Thọ Nguyên Đan (+5 Năm Thọ)', icon: '🧪' },
      { id: 'item_breakthrough_pill', name: 'Cửu Chuyển Đột Phá Đan (100% Đột Phá)', icon: '⚡' }
    ];
    for (const pill of bonusPills) {
      const dropId = `drop_${this.nextEntityId++}`;
      const offsetX = (Math.random() - 0.5) * 220;
      const offsetY = (Math.random() - 0.5) * 220;
      const drop = {
        id: dropId,
        mapId: mapId,
        isEquipment: false,
        itemId: pill.id,
        name: pill.name,
        icon: pill.icon,
        rarity: 'platinum',
        rarityColor: '#ffd700',
        x: Math.round(centerX + offsetX),
        y: Math.round(centerY + offsetY),
        createdAt: Date.now(),
        expireTime: Date.now() + 180000
      };
      this.droppedItems.push(drop);
      this.io.emit('item_dropped', drop);
    }

    // 5. THÔNG BÁO TOÀN THẾ GIỚI
    const winMsg = `MA KHÍ TIÊU TAN! Nguyên Hồn Ác Hóa của tiền bối [${loot.ownerName || monster.revenantOwnerName}] đã bị [${killerName}] cùng chư vị hiệp khách đánh lui! Toàn bộ thần binh trang bị và ngân lượng tiền bối đã rơi vãi khắp chiến trường!`;
    this.broadcastNotice(winMsg, 'boss_kill');

    // 6. PHÁT SỰ KIỆN KẾT THÚC CHO TOÀN BỘ CLIENT
    if (this.io) {
      this.io.emit('revenant_boss_defeated', {
        bossId: monster.id,
        killerName: killerName,
        ownerName: loot.ownerName || monster.revenantOwnerName,
        mapName: mapInfo.name,
        msg: winMsg
      });
    }

    // Xóa boss khỏi danh sách quái
    delete this.monsters[monster.id];
    this.activeRevenantEvent = null;
  }
  
  // RƠI ĐỒ THEO CẤP ĐỘ MAP & QUÁI TINH ANH & BOSS - GIẢM TỶ LỆ THEO PHẨM CẤP (ĐỒ CÀNG XỊN TỶ LỆ CÀNG ÍT)
  dropLoot(x, y, isBoss, mapId, isElite = false, bossRarity = null, monsterRef = null) {
    const templates = Object.keys(ITEM_TEMPLATES);
    const mapInfo = this.maps[mapId] || this.maps.lac_duong;
    const tierLevel = mapInfo.tierLevel || 1;

    // Số lượng món rơi: Boss rớt 4-7 món, Elite rớt 2-3 món, Quái thường 1 món (xác suất 25%)
    let dropCount = 0;
    if (isBoss) {
      dropCount = 4 + Math.floor(Math.random() * 3);
    } else if (isElite) {
      dropCount = 2 + (Math.random() < 0.4 ? 1 : 0);
    } else {
      dropCount = Math.random() < 0.25 ? 1 : 0;
    }

    if (dropCount === 0) return;

    for (let i = 0; i < dropCount; i++) {
      const offsetX = (Math.random() - 0.5) * 120;
      const offsetY = (Math.random() - 0.5) * 120;
      const dropX = Math.round(x + offsetX);
      const dropY = Math.round(y + offsetY);
      const dropId = `drop_${this.nextEntityId++}`;

      // 1. NẾU LÀ MAP TU TIÊN HOẶC BOSS TU TIÊN GIÁNG THẾ:
      // Tỷ lệ rơi trang bị Tu Tiên Bạch Kim cực hiếm: Boss 3.5%, Elite 0.5%, Quái thường 0.05%
      const isCultivSource = (mapInfo && mapInfo.isCultivationMap) || (monsterRef && monsterRef.isCultivBoss);
      if (isCultivSource) {
        const cultivDropRate = isBoss ? 0.035 : (isElite ? 0.005 : 0.0005);
        if (Math.random() < cultivDropRate) {
          const cultivSlots = ['weapon', 'helmet', 'armor', 'gloves', 'pants', 'boots', 'necklace', 'ring'];
          const randSlot = cultivSlots[Math.floor(Math.random() * cultivSlots.length)];
          const setKeys = Object.keys(CULTIVATION_SETS);
          const randSetKey = setKeys[Math.floor(Math.random() * setKeys.length)];
          const cGear = generateCultivationGear(randSlot, randSetKey, 'platinum', Math.max(tierLevel, 45));

          const drop = {
            id: dropId,
            mapId: mapId,
            isEquipment: true,
            itemInstance: cGear,
            itemId: cGear.templateKey,
            name: cGear.name,
            icon: cGear.icon,
            rarity: cGear.rarity,
            rarityName: 'Bạch Kim (Tu Tiên)',
            rarityColor: '#ffd700',
            isShimmering: true,
            isCultivGear: true,
            orbitColor: cGear.orbitColor,
            x: dropX,
            y: dropY,
            createdAt: Date.now(),
            expireTime: Date.now() + 120000
          };
          this.droppedItems.push(drop);
          this.io.emit('item_dropped', drop);
          this.broadcastNotice(`TIÊN KHÍ NGUYÊN BẠO! Trang bị Tu Tiên 【${cGear.name}】 cực phẩm vừa xuất thế tại [${mapInfo.name}]!`, 'boss_kill');
          continue;
        }

        // Rơi Tiên Đan (Tu Vi Đan, Thọ Nguyên Đan, Đột Phá Đan): Boss 25%, Elite 8%, Quái thường 1%
        const pillDropRate = isBoss ? 0.25 : (isElite ? 0.08 : 0.01);
        if (Math.random() < pillDropRate) {
          const pillPool = ['item_tuvi_pill', 'item_lifespan_pill', 'item_breakthrough_pill'];
          const randPill = pillPool[Math.floor(Math.random() * pillPool.length)];
          const pillNames = {
            item_tuvi_pill: 'Cửu U Tu Vi Đan (+5000 Tu Vi)',
            item_lifespan_pill: 'Trường Sinh Thọ Nguyên Đan (+5 Năm Thọ)',
            item_breakthrough_pill: 'Cửu Chuyển Đột Phá Đan (100% Đột Phá)'
          };
          const drop = {
            id: dropId,
            mapId: mapId,
            isEquipment: false,
            itemId: randPill,
            name: pillNames[randPill] || 'Tiên Đan Tu Tiên',
            icon: randPill + '.png',
            rarity: 'platinum',
            rarityName: 'Tiên Phẩm',
            rarityColor: '#00e5ff',
            isShimmering: true,
            x: dropX,
            y: dropY,
            createdAt: Date.now(),
            expireTime: Date.now() + 120000
          };
          this.droppedItems.push(drop);
          this.io.emit('item_dropped', drop);
          continue;
        }
      }

      // 2. TỶ LỆ RƠI TRANG BỊ THƯỜNG:
      // Boss: 35% mỗi slot rơi trang bị, Elite: 20%, Quái thường: 8% (còn lại rơi nguyên liệu/tiêu hao)
      const isEquip = isBoss ? (i === 0 || Math.random() < 0.35) : (isElite ? (i === 0 || Math.random() < 0.20) : (Math.random() < 0.08));

      if (isEquip) {
        const tmplKey = templates[Math.floor(Math.random() * templates.length)];
        let forcedRarity = 'common';

        // PHÂN BỔ TỶ LỆ PHẨM CẤP CHẶT CHẼ THEO ĐÚNG NGUYÊN TẮC: CÀNG HIẾM TỶ LỆ CÀNG NHỎ
        const rRoll = Math.random();
        if (isBoss) {
          // Boss: Bạch Kim 2%, Ma Thần 4%, Thần Thoại 8%, Truyền Thuyết 16%, Hoàng Kim 30%, Sử Thi 25%, Hiếm 15%
          if (rRoll < 0.02) forcedRarity = 'platinum';
          else if (rRoll < 0.06) forcedRarity = 'abyssal';
          else if (rRoll < 0.14) forcedRarity = 'celestial';
          else if (rRoll < 0.30) forcedRarity = 'mythic';
          else if (rRoll < 0.60) forcedRarity = 'legendary';
          else if (rRoll < 0.85) forcedRarity = 'epic';
          else forcedRarity = 'rare';
        } else if (isElite) {
          // Quái Tinh Anh: Bạch Kim 0.1%, Ma Thần 0.4%, Thần Thoại 1%, Truyền Thuyết 3.5%, Hoàng Kim 10%, Sử Thi 25%, Hiếm 35%, Ưu Tú 25%
          if (rRoll < 0.001) forcedRarity = 'platinum';
          else if (rRoll < 0.005) forcedRarity = 'abyssal';
          else if (rRoll < 0.015) forcedRarity = 'celestial';
          else if (rRoll < 0.05) forcedRarity = 'mythic';
          else if (rRoll < 0.15) forcedRarity = 'legendary';
          else if (rRoll < 0.40) forcedRarity = 'epic';
          else if (rRoll < 0.75) forcedRarity = 'rare';
          else forcedRarity = 'uncommon';
        } else {
          // Quái thường: Bạch Kim 0.01%, Thần Thoại 0.04%, Truyền Thuyết 0.15%, Hoàng Kim 1.2%, Sử Thi 5%, Hiếm 18%, Ưu Tú 35%, Phổ Thông 40.6%
          if (rRoll < 0.0001) forcedRarity = 'platinum';
          else if (rRoll < 0.0005) forcedRarity = 'celestial';
          else if (rRoll < 0.002) forcedRarity = 'mythic';
          else if (rRoll < 0.014) forcedRarity = 'legendary';
          else if (rRoll < 0.064) forcedRarity = 'epic';
          else if (rRoll < 0.244) forcedRarity = 'rare';
          else if (rRoll < 0.594) forcedRarity = 'uncommon';
          else forcedRarity = 'common';
        }

        // Tạo trang bị theo đúng CẤP BẬC MAP (Lv.1, Lv.10, Lv.20, Lv.30, Lv.40, Lv.50)
        // và ở trạng thái CHƯA GIÁM ĐỊNH (nếu từ cấp Rare trở lên)
        const equip = generateEquipment(tmplKey, forcedRarity, tierLevel);
        const drop = {
          id: dropId,
          mapId: mapId,
          isEquipment: true,
          itemInstance: equip,
          itemId: equip.templateKey,
          name: equip.name,
          icon: equip.icon,
          rarity: equip.rarity,
          rarityName: equip.rarityName,
          rarityColor: equip.rarityColor,
          isShimmering: equip.isShimmering,
          x: dropX,
          y: dropY,
          createdAt: Date.now(),
          expireTime: Date.now() + 90000
        };
        this.droppedItems.push(drop);
        this.io.emit('item_dropped', drop);

        if (equip.rarity === 'platinum') {
          this.broadcastNotice(`HÀO QUANG THIÊN ĐỊA! Thần Binh [${equip.name}] vừa rơi xuống đất tại [${this.maps[mapId].name}]!`, 'boss_kill');
        }
      } else {
        // Rơi Đá Cường Hóa, Giám Định Phù, Ngọc Khảm, Đan Dược
        let dropPool = ['item_5', 'item_6', 'item_appraisal', 'item_enhance_stone'];
        if (isBoss || isElite) {
          dropPool.push('item_socket_drill', 'item_protection_charm', 'gem_ruby_1', 'gem_topaz_1', 'gem_sapphire_1', 'gem_emerald_1', 'gem_amethyst_1', 'gem_amber_1');
        }

        const randItemId = dropPool[Math.floor(Math.random() * dropPool.length)];
        const itemDef = CONSUMABLE_ITEMS[randItemId] || ITEMS[randItemId];

        const drop = {
          id: dropId,
          mapId: mapId,
          isEquipment: false,
          itemId: randItemId,
          name: itemDef ? itemDef.name : 'Vật Phẩm',
          icon: itemDef ? itemDef.icon : 'item_5.png',
          rarity: (itemDef && itemDef.rarity) ? itemDef.rarity : 'common',
          rarityColor: '#e2e8f0',
          x: dropX,
          y: dropY,
          createdAt: Date.now(),
          expireTime: Date.now() + 60000
        };
        this.droppedItems.push(drop);
        this.io.emit('item_dropped', drop);
      }
    }
  }
  
  pickupItem(playerId, dropId) {
    const p = this.players[playerId];
    if (!p || p.hp <= 0) return;
    
    const dropIndex = this.droppedItems.findIndex(d => d.id === dropId);
    if (dropIndex === -1) return;
    
    const drop = this.droppedItems[dropIndex];
    if (drop.mapId !== p.currentMap) return;
    
    const dist = Math.hypot(drop.x - p.x, drop.y - p.y);
    if (dist > 180) return;

    // Kiểm tra Bộ Lọc Tự Nhặt Đồ (Loot Filter)
    if (typeof p.canLootItem === 'function' && !p.canLootItem(drop)) {
      this.io.to(p.id).emit('notice', { msg: `Vật phẩm này bị loại bởi [Bộ Lọc Tự Nhặt Đồ]!`, type: 'info' });
      return;
    }
    
    // 1. Nhặt Trang Bị (Có chỉ số ngẫu nhiên & Chưa Giám Định)
    if (drop.isEquipment && drop.itemInstance) {
      if (p.inventory.length >= p.maxInventorySlots) {
        this.io.to(p.id).emit('notice', { msg: 'Hành trang 200 ô đã đầy! Hãy dọn dẹp túi đồ!', type: 'warning' });
        return;
      }
      
      const equip = drop.itemInstance;
      p.inventory.push(equip);
      p.reindexInventory();
      this.droppedItems.splice(dropIndex, 1);
      
      this.io.emit('item_picked', { dropId, playerId: p.id, item: equip });
      const statusText = equip.unidentified ? '【Chưa Giám Định】' : '';
      this.io.to(p.id).emit('notice', { msg: `Đã nhặt: [${equip.name}] ${statusText} (${equip.rarityName})`, type: 'success' });
      
      if (['platinum', 'abyssal', 'celestial', 'mythic'].includes(equip.rarity)) {
        this.broadcastNotice(`Hiệp khách [${p.name}] may mắn nhặt được Thần Binh [${equip.name}] phẩm cấp [${equip.rarityName}]!`, 'system');
      }
      return;
    }
    
    // 2. Nhặt Vật Phẩm Tiêu Hao / Đá / Bùa / Ngọc Khảm
    const itemDef = CONSUMABLE_ITEMS[drop.itemId] || ITEMS[drop.itemId];
    if (!itemDef) return;
    
    if (itemDef.type === 'currency') {
      p.gold += (itemDef.goldValue || 100);
      this.droppedItems.splice(dropIndex, 1);
      this.io.emit('item_picked', { dropId, playerId: p.id, item: itemDef });
      this.io.to(p.id).emit('notice', { msg: `Nhặt được +${itemDef.goldValue || 100} Ngân Lượng!`, type: 'info' });
      return;
    }
    
    const existing = p.inventory.find(i => i.itemId === drop.itemId && (itemDef.stackable !== false));
    if (existing) {
      existing.count += (itemDef.type === 'consumable' ? 10 : 1);
    } else {
      if (p.inventory.length >= p.maxInventorySlots) {
        this.io.to(p.id).emit('notice', { msg: 'Hành trang 200 ô đã đầy!', type: 'warning' });
        return;
      }
      p.inventory.push({
        slot: p.inventory.length,
        itemId: drop.itemId,
        name: itemDef.name,
        type: itemDef.type || 'consumable',
        icon: itemDef.icon,
        gemKey: itemDef.gemKey,
        gemLevel: itemDef.gemLevel,
        statKey: itemDef.statKey,
        statVal: itemDef.statVal,
        statDesc: itemDef.statDesc,
        count: itemDef.type === 'consumable' ? 10 : 1
      });
    }
    
    this.droppedItems.splice(dropIndex, 1);
    this.io.emit('item_picked', { dropId, playerId: p.id, item: itemDef });
    this.io.to(p.id).emit('notice', { msg: `Đã nhặt: [${itemDef.name}]`, type: 'success' });
  }

  // TƯƠNG TÁC NPC
  interactNPC(playerId, npcId, actionId, data = {}) {
    const p = this.players[playerId];
    if (!p || p.hp <= 0) return { success: false, msg: 'Người chơi không khả dụng!' };
    
    const npc = this.npcs[npcId];
    if (!npc) return { success: false, msg: 'NPC không tồn tại!' };
    if (p.currentMap !== npc.mapId) return { success: false, msg: 'NPC không ở bản đồ hiện tại!' };
    
    const dist = Math.hypot(p.x - npc.x, p.y - npc.y);
    if (dist > 250) return { success: false, msg: 'Hãy tiến lại gần NPC để trò chuyện!' };
    
    // 1. Thợ Rèn Thiết Ngưu
    if (npcId === 'npc_blacksmith') {
      if (actionId === 'open_forge') {
        return { success: true, type: 'open_forge', msg: 'Thợ rèn Thiết Ngưu đã sẵn sàng nâng cấp thần binh cho bạn!' };
      } else if (actionId === 'buy_enhance_stone') {
        if (p.gold < 1500) return { success: false, msg: 'Không đủ ngân lượng (Cần 1,500 Bạc)!' };
        p.gold -= 1500;
        const ex = p.inventory.find(i => i.itemId === 'item_enhance_stone');
        if (ex) ex.count += 5;
        else p.inventory.push({ itemId: 'item_enhance_stone', name: 'Thiên Cương Cường Hóa Thạch', count: 5, type: 'enhance_stone', icon: 'item_enhance_stone.png' });
        p.reindexInventory();
        return { success: true, msg: 'Đã mua thành công 5 Thiên Cương Cường Hóa Thạch!' };
      } else if (actionId === 'buy_protection_charm') {
        if (p.gold < 1200) return { success: false, msg: 'Không đủ ngân lượng (Cần 1,200 Bạc)!' };
        p.gold -= 1200;
        const ex = p.inventory.find(i => i.itemId === 'item_protection_charm');
        if (ex) ex.count += 1;
        else p.inventory.push({ itemId: 'item_protection_charm', name: 'Thiên Mệnh Hộ Thân Phù', count: 1, type: 'protection_charm', icon: 'item_protection_charm.png' });
        p.reindexInventory();
        return { success: true, msg: 'Đã mua thành công 1 Thiên Mệnh Hộ Thân Phù!' };
      } else if (actionId === 'buy_socket_drill') {
        if (p.gold < 800) return { success: false, msg: 'Không đủ ngân lượng (Cần 800 Bạc)!' };
        p.gold -= 800;
        const ex = p.inventory.find(i => i.itemId === 'item_socket_drill');
        if (ex) ex.count += 1;
        else p.inventory.push({ itemId: 'item_socket_drill', name: 'Kim Cương Tạc Khảm Thạch', count: 1, type: 'socket_drill', icon: 'item_socket_drill.png' });
        p.reindexInventory();
        return { success: true, msg: 'Đã mua thành công 1 Kim Cương Tạc Khảm Thạch!' };
      } else if (actionId === 'buy_appraisal') {
        if (p.gold < 800) return { success: false, msg: 'Không đủ ngân lượng (Cần 800 Bạc)!' };
        p.gold -= 800;
        const ex = p.inventory.find(i => i.itemId === 'item_appraisal');
        if (ex) ex.count += 5;
        else p.inventory.push({ itemId: 'item_appraisal', name: 'Thiên Nhãn Giám Định Phù', count: 5, type: 'appraisal_scroll', icon: 'item_appraisal.png' });
        p.reindexInventory();
        return { success: true, msg: 'Đã mua thành công 5 Thiên Nhãn Giám Định Phù!' };
      }
    }
    
    // 2. Thần Y Dược Sư
    if (npcId === 'npc_doctor') {
      if (actionId === 'buy_small_hp') {
        if (p.gold < 50) return { success: false, msg: 'Không đủ ngân lượng (Cần 50 Bạc)!' };
        p.gold -= 50;
        const ex = p.inventory.find(i => i.itemId === 'item_5');
        if (ex) ex.count += 10;
        else p.inventory.push({ itemId: 'item_5', name: 'Tiểu Huyết Đan', count: 10, type: 'consumable', icon: 'item_5.png' });
        p.reindexInventory();
        return { success: true, msg: 'Đã mua thành công 10 Tiểu Huyết Đan!' };
      } else if (actionId === 'buy_small_mp') {
        if (p.gold < 50) return { success: false, msg: 'Không đủ ngân lượng (Cần 50 Bạc)!' };
        p.gold -= 50;
        const ex = p.inventory.find(i => i.itemId === 'item_6');
        if (ex) ex.count += 10;
        else p.inventory.push({ itemId: 'item_6', name: 'Tiểu Khí Hoàn', count: 10, type: 'consumable', icon: 'item_6.png' });
        p.reindexInventory();
        return { success: true, msg: 'Đã mua thành công 10 Tiểu Khí Hoàn!' };
      } else if (actionId === 'buy_hp') {
        if (p.gold < 180) return { success: false, msg: 'Không đủ ngân lượng (Cần 180 Bạc)!' };
        p.gold -= 180;
        const ex = p.inventory.find(i => i.itemId === 'item_5');
        if (ex) ex.count += 20;
        else p.inventory.push({ itemId: 'item_5', name: 'Cửu Chuyển Huyết Đan', count: 20, type: 'consumable', icon: 'item_5.png' });
        p.reindexInventory();
        return { success: true, msg: 'Đã mua thành công 20 Cửu Chuyển Huyết Đan!' };
      } else if (actionId === 'buy_mp') {
        if (p.gold < 180) return { success: false, msg: 'Không đủ ngân lượng (Cần 180 Bạc)!' };
        p.gold -= 180;
        const ex = p.inventory.find(i => i.itemId === 'item_6');
        if (ex) ex.count += 20;
        else p.inventory.push({ itemId: 'item_6', name: 'Ngưng Thần Khí Hoàn', count: 20, type: 'consumable', icon: 'item_6.png' });
        p.reindexInventory();
        return { success: true, msg: 'Đã mua thành công 20 Ngưng Thần Khí Hoàn!' };
      } else if (actionId === 'full_heal') {
        if (p.gold < 30) return { success: false, msg: 'Cần 30 Ngân lượng Bạc!' };
        p.gold -= 30;
        p.hp = p.getMaxHp();
        p.mp = p.getMaxMp();
        return { success: true, msg: 'Tiết Thần Y đã châm cứu, Khí Huyết & Chân Khí phục hồi 100%!' };
      }
    }
    
    // 3. Chưởng Môn Độc Cô Tiên Tôn
    if (npcId === 'npc_master') {
      if (actionId === 'claim_gift') {
        if (p.hasClaimedMasterGift) return { success: false, msg: 'Ngươi đã nhận phần quà chỉ điểm này rồi!' };
        p.hasClaimedMasterGift = true;
        p.meridianPoints += 8;
        p.skillPoints += 5;
        p.gold += 1000;
        return { success: true, msg: 'Chưởng môn ban thưởng: +8 Điểm Chân Khí, +5 Điểm Võ Học, +1000 Ngân Lượng Bạc!' };
      } else if (actionId === 'breakthrough') {
        p.meridianPoints += 2;
        p.addExp(300);
        return { success: true, msg: 'Được Chưởng Môn truyền thụ: Nhận +300 Tu Vi Exp và +2 Điểm Chân Khí!' };
      }
    }
    
    // 4. Vô Nhai Trưởng Lão - Tàng Kinh Các
    if (npcId === 'npc_scripture') {
      if (actionId === 'buy_scripture') {
        if (p.gold < 1200) return { success: false, msg: 'Không đủ ngân lượng (Cần 1200 Bạc)!' };
        p.gold -= 1200;
        const ex = p.inventory.find(i => i.itemId === 'item_7');
        if (ex) ex.count += 2;
        else p.inventory.push({ itemId: 'item_7', name: 'Thái Huyền Bí Tịch', count: 2, type: 'scripture', icon: 'item_7.png' });
        p.reindexInventory();
        return { success: true, msg: 'Đã mua thành công 2 quyển Thái Huyền Bí Tịch!' };
      } else if (actionId === 'gain_skill_point') {
        if (p.gold < 800) return { success: false, msg: 'Cần 800 Ngân lượng Bạc!' };
        p.gold -= 800;
        p.skillPoints += 2;
        return { success: true, msg: 'Đổi thành công: Nhận +2 Điểm Võ Học!' };
      }
    }
    
    // 5. Xa Phu Giang Hồ
    if (npcId === 'npc_driver') {
      if (actionId === 'tp_outside') {
        p.x = 650; p.y = 750; p.targetX = 650; p.targetY = 750;
        return { success: true, msg: 'Đã đưa bạn ra ngoại thành Lạc Dương!' };
      } else if (actionId === 'tp_peach') {
        if (p.gold < 150) return { success: false, msg: 'Cần 150 Ngân lượng Bạc để thuê thuyền ra Đào Hoa Đảo!' };
        p.gold -= 150;
        this.teleportPlayer(p.id, 'dao_hoa_dao');
        return { success: true, msg: 'Thuyền đã cập bến Đào Hoa Tiên Đảo!' };
      } else if (actionId === 'tp_volcano') {
        if (p.gold < 350) return { success: false, msg: 'Cần 350 Ngân lượng Bạc để vượt đèo sang Vạn Kiếp Ma Sơn!' };
        p.gold -= 350;
        this.teleportPlayer(p.id, 'ma_son');
        return { success: true, msg: 'Ngựa đã đến Vạn Kiếp Ma Sơn!' };
      } else if (actionId === 'tp_conlon') {
        if (p.gold < 600) return { success: false, msg: 'Cần 600 Ngân lượng Bạc để lên Côn Lôn Tuyết Sơn!' };
        p.gold -= 600;
        this.teleportPlayer(p.id, 'con_lon');
        return { success: true, msg: 'Đã đến đỉnh Côn Lôn Tuyết Sơn!' };
      } else if (actionId === 'tp_hoangsa') {
        if (p.gold < 1000) return { success: false, msg: 'Cần 1,000 Ngân lượng Bạc để vượt bão cát sang Hoàng Sa Cổ Thành!' };
        p.gold -= 1000;
        this.teleportPlayer(p.id, 'hoang_sa');
        return { success: true, msg: 'Đã đến phế tích Hoàng Sa Cổ Thành!' };
      } else if (actionId === 'tp_thandien') {
        if (p.gold < 2000) return { success: false, msg: 'Cần 2,000 Ngân lượng Bạc để ngự phong phi thăng Thái Cổ Thần Điện!' };
        p.gold -= 2000;
        this.teleportPlayer(p.id, 'than_dien');
        return { success: true, msg: 'Đã ngự mây đến Thái Cổ Thần Điện!' };
      } else if (actionId === 'tp_dungeon') {
        if (p.gold < 3000) return { success: false, msg: 'Cần 3,000 Ngân lượng Bạc để tiến vào Cửu U Ma Huyệt!' };
        p.gold -= 3000;
        this.teleportPlayer(p.id, 'dungeon_abyss', 1400, 1600);
        return { success: true, msg: 'Đã tiến vào Phụ Bản Cửu U Ma Huyệt! Chú ý an toàn!' };
      }
    }
    
    return { success: false, msg: 'Hành động không hợp lệ!' };
  }
  
  handleChat(playerId, message, channel = 'world') {
    const p = this.players[playerId];
    if (!p || !message || typeof message !== 'string') return;
    const cleanMsg = message.trim().slice(0, 120);
    if (!cleanMsg) return;

    const realmName = typeof p.getRealmName === 'function' ? p.getRealmName() : 'Luyện Khí Tầng 1';
    const sectName = {
      huashan: 'Hoa Sơn',
      xiaoyao: 'Tiêu Dao',
      shaolin: 'Thiếu Lâm',
      wudang: 'Võ Đang'
    }[p.sect] || 'Giang Hồ';

    const chatData = {
      sender: p.name,
      senderLevel: p.level,
      senderRealm: realmName,
      senderSect: sectName,
      message: cleanMsg,
      channel: channel || 'world',
      time: Date.now()
    };

    this.io.emit('chat_message', chatData);
  }

  broadcastNotice(msg, type = 'info') {
    if (!msg || typeof msg !== 'string' || msg === 'undefined') return;
    this.io.emit('notice', { msg, type });
    this.io.emit('chat_message', {
      sender: 'Hệ Thống',
      message: msg,
      channel: 'system',
      type: type,
      time: Date.now()
    });
  }
  
  // Game Loop Server 30 FPS
  tick() {
    this.update();
  }

  update() {
    const now = Date.now();
    const dt = Math.min(0.1, (now - this.lastTickTime) / 1000);
    this.lastTickTime = now;

    // Tự động lưu nhân vật vào CSDL mỗi 15 giây
    if (!this.lastAutoSaveTime || now - this.lastAutoSaveTime >= 15000) {
      this.lastAutoSaveTime = now;
      this.saveAllPlayers();
    }
    
    // 1. Cập nhật Người chơi & Tuổi Thọ Thọ Nguyên (Lifespan Permadeath)
    for (const p of Object.values(this.players)) {
      if (p.isDeadPerm) continue;

      // Tính tuổi thọ thọ nguyên
      if (typeof p.tickLifespan === 'function') {
        const lifeRes = p.tickLifespan();
        if (lifeRes && lifeRes.isDeadPerm) {
          if (!lifeRes.alreadyReported && lifeRes.msg) {
            this.io.to(p.id).emit('player_permadeath', {
              msg: lifeRes.msg,
              age: p.age,
              maxLifespan: p.maxLifespan
            });
            this.broadcastNotice(lifeRes.msg, 'boss_kill');

            // KÍCH HOẠT SỰ KIỆN: CƯỜNG GIẢ TỌA HÓA - NGUYÊN HỒN ÁC HÓA GIÁNG THẾ!
            if (!p.hasSpawnedRevenant) {
              p.hasSpawnedRevenant = true;
              this.spawnRevenantBossFromPlayer(p);
            }
          }
          continue;
        }
      }

      if (p.hp <= 0) continue;
      const curMap = this.maps[p.currentMap] || this.maps.lac_duong;
      
      // Hồi phục khi Thiền Định
      if (p.isMeditating) {
        p.hp = Math.min(p.getMaxHp(), p.hp + p.getMaxHp() * 0.08 * dt);
        p.mp = Math.min(p.getMaxMp(), p.mp + p.getMaxMp() * 0.12 * dt);
      } else {
        p.hp = Math.min(p.getMaxHp(), p.hp + 4 * dt);
        p.mp = Math.min(p.getMaxMp(), p.mp + 8 * dt);
      }
      
      if (p.isDashing) {
        if (now > p.dashEndTime) {
          p.isDashing = false;
        } else {
          p.x += p.dashDirX * p.dashSpeed * dt;
          p.y += p.dashDirY * p.dashSpeed * dt;
          p.x = Math.max(40, Math.min(curMap.width - 40, p.x));
          p.y = Math.max(40, Math.min(curMap.height - 40, p.y));
        }
      } else if (p.isMoving) {
        const dx = p.targetX - p.x;
        const dy = p.targetY - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 5) {
          const moveStep = p.getMoveSpeed() * dt;
          if (dist <= moveStep) {
            p.x = p.targetX;
            p.y = p.targetY;
            p.isMoving = false;
          } else {
            p.x += (dx / dist) * moveStep;
            p.y += (dy / dist) * moveStep;
            p.angle = Math.atan2(dy, dx);
          }
        } else {
          p.isMoving = false;
        }
      }
    }
    
    // 2. Cập nhật Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      const stepX = proj.vx * dt;
      const stepY = proj.vy * dt;
      proj.x += stepX;
      proj.y += stepY;
      proj.rangeLeft -= Math.hypot(stepX, stepY);
      
      for (const m of Object.values(this.monsters)) {
        if (m.state === 'dead' || m.mapId !== proj.mapId || proj.hitEntities.has(m.id)) continue;
        if (Math.hypot(m.x - proj.x, m.y - proj.y) <= m.size / 2 + 25) {
          proj.hitEntities.add(m.id);
          const owner = this.players[proj.ownerId];
          const isCrit = Math.random() < proj.critRate;
          const dmg = isCrit ? Math.floor(proj.damage * 1.8) : proj.damage;
          this.applyDamageToMonster(m, dmg, isCrit, owner);
        }
      }
      
      if (proj.rangeLeft <= 0 || proj.hitEntities.size >= 4) {
        this.projectiles.splice(i, 1);
      }
    }
    
    // 3. Cập nhật AoE
    for (let i = this.aoeZones.length - 1; i >= 0; i--) {
      const aoe = this.aoeZones[i];
      if (now >= aoe.endTime) {
        this.aoeZones.splice(i, 1);
        continue;
      }
      
      if (now - aoe.lastTick >= 450) {
        aoe.lastTick = now;
        const owner = this.players[aoe.ownerId];
        
        for (const m of Object.values(this.monsters)) {
          if (m.state === 'dead' || m.mapId !== aoe.mapId) continue;
          if (Math.hypot(m.x - aoe.x, m.y - aoe.y) <= aoe.radius) {
            if (aoe.type === 'vortex') {
              const pullX = aoe.x - m.x;
              const pullY = aoe.y - m.y;
              const pDist = Math.hypot(pullX, pullY) || 1;
              m.x += (pullX / pDist) * 35;
              m.y += (pullY / pDist) * 35;
            }
            
            const isCrit = Math.random() < aoe.critRate;
            const dmg = isCrit ? Math.floor(aoe.damagePerSec * 1.6) : aoe.damagePerSec;
            this.applyDamageToMonster(m, dmg, isCrit, owner);
            
            if (aoe.siphonRate && owner && owner.hp > 0) {
              const heal = Math.floor(dmg * aoe.siphonRate);
              owner.hp = Math.min(owner.getMaxHp(), owner.hp + heal);
              owner.mp = Math.min(owner.getMaxMp(), owner.mp + heal / 2);
            }
          }
        }
      }
    }
    
    // 4. Cập nhật Quái vật AI
    for (const m of Object.values(this.monsters)) {
      m.update(dt, this.players, this);
    }
    
    // 5. Dọn dẹp đồ rơi quá hạn
    for (let i = this.droppedItems.length - 1; i >= 0; i--) {
      if (now >= this.droppedItems[i].expireTime) {
        this.droppedItems.splice(i, 1);
      }
    }

    // 6. Phát sóng trạng thái thế giới (World State Broadcast) tới toàn bộ client
    if (this.io) {
      this.io.emit('world_state', this.getWorldState());
    }
  }
  
  getWorldState() {
    const playersState = {};
    for (const [id, p] of Object.entries(this.players)) {
      playersState[id] = p.toClientState();
    }
    
    const monstersState = {};
    for (const [id, m] of Object.entries(this.monsters)) {
      monstersState[id] = m.toClientState();
    }
    
    return {
      players: playersState,
      monsters: monstersState,
      projectiles: this.projectiles.map(p => ({
        id: p.id,
        mapId: p.mapId,
        x: Math.round(p.x),
        y: Math.round(p.y),
        angle: Number(p.angle.toFixed(2)),
        color: p.color
      })),
      droppedItems: this.droppedItems.map(d => ({
        id: d.id,
        mapId: d.mapId,
        x: d.x,
        y: d.y,
        isEquipment: d.isEquipment,
        itemId: d.itemId,
        name: d.name,
        icon: d.icon,
        rarity: d.rarity,
        rarityColor: d.rarityColor,
        isShimmering: d.isShimmering,
        itemInstance: d.itemInstance
      })),
      npcs: this.npcs
    };
  }

  // LẤY DANH SÁCH & TRẠNG THÁI TOÀN BỘ BOSS THẾ GIỚI
  getWorldBossStatus() {
    const list = [];
    const now = Date.now();
    for (const m of Object.values(this.monsters)) {
      if (!m.isBoss && !m.isRevenantBoss) continue;
      const isDead = m.state === 'dead';
      const remainingRespawnMs = isDead ? Math.max(0, (m.respawnDelay || 45000) - (now - (m.deathTime || 0))) : 0;
      const mapInfo = this.maps[m.mapId] || { name: m.mapId, isCultivationMap: false };

      list.push({
        id: m.id,
        name: m.name,
        level: m.level,
        mapId: m.mapId,
        mapName: mapInfo.name,
        isCultivationMap: !!mapInfo.isCultivationMap,
        x: Math.round(m.x),
        y: Math.round(m.y),
        hp: Math.max(0, Math.round(m.hp)),
        maxHp: m.maxHp,
        hpPercent: Math.max(0, Math.min(100, Math.round((m.hp / m.maxHp) * 100))),
        isAlive: !isDead,
        isRevenantBoss: !!m.isRevenantBoss,
        isCultivBoss: !!m.isCultivBoss,
        bossRarity: m.bossRarity || 'legendary',
        respawnRemainingSec: Math.ceil(remainingRespawnMs / 1000)
      });
    }
    // Sắp xếp theo cấp độ
    list.sort((a, b) => a.level - b.level);
    return list;
  }

  // NGỰ KIẾM PHI THÂN TRUY SÁT TỚI VỊ TRÍ BOSS
  teleportToBoss(playerId, bossId) {
    const p = this.players[playerId];
    if (!p || p.hp <= 0) return { success: false, msg: 'Nhân vật không khả dụng!' };
    
    const boss = this.monsters[bossId];
    if (!boss) return { success: false, msg: 'Không tìm thấy Boss này trong Cửu Châu!' };
    if (boss.state === 'dead') {
      const remainingSec = Math.ceil(Math.max(0, (boss.respawnDelay || 45000) - (Date.now() - (boss.deathTime || 0))) / 1000);
      return { success: false, msg: `Boss [${boss.name}] đã bị tiêu diệt, đang chờ hồi sinh sau ${remainingSec} giây!` };
    }

    const mapInfo = this.maps[boss.mapId];
    if (mapInfo && mapInfo.isCultivationMap && p.level < 30) {
      return { success: false, msg: 'Bản đồ này thuộc Tiên Giới! Yêu cầu đạt Cấp 30 & Đột Phá Tiên Đạo mới có thể phi thăng đến!' };
    }

    // Dịch chuyển đến trước mặt Boss
    const spawnX = Math.round(boss.x + (Math.random() > 0.5 ? 90 : -90));
    const spawnY = Math.round(boss.y + (Math.random() > 0.5 ? 70 : -70));
    this.teleportPlayer(p.id, boss.mapId, spawnX, spawnY);
    this.broadcastNotice(`Hiệp khách [${p.name}] đã Ngự Kiếm Phi Thân tới khiêu chiến Đại Boss [${boss.name}] tại [${mapInfo ? mapInfo.name : boss.mapId}]!`, 'boss_kill');
    
    return {
      success: true,
      bossId: boss.id,
      bossName: boss.name,
      mapId: boss.mapId,
      mapName: mapInfo ? mapInfo.name : boss.mapId,
      x: spawnX,
      y: spawnY,
      msg: `⚔ Đã ngự kiếm phi thân tới trước mặt Boss [${boss.name}]!`
    };
  }
}

module.exports = { World, MAPS };
