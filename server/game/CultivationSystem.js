// HỆ THỐNG TU TIÊN TOÀN DIỆN: CẢNH GIỚI, THỌ NGUYÊN, 4 PHÁI TIÊN ĐẠO, TRANG BỊ VÀ SET TU TIÊN

const CULTIVATION_REALMS = [
  { name: 'Luyện Khí Tầng 1', reqTuvi: 100, maxLifespan: 100, hpBonus: 150, atkBonus: 35, cdrBonus: 0 },
  { name: 'Luyện Khí Tầng 2', reqTuvi: 250, maxLifespan: 100, hpBonus: 350, atkBonus: 75, cdrBonus: 0 },
  { name: 'Luyện Khí Tầng 3', reqTuvi: 500, maxLifespan: 100, hpBonus: 600, atkBonus: 130, cdrBonus: 0 },
  { name: 'Luyện Khí Tầng 4', reqTuvi: 900, maxLifespan: 100, hpBonus: 950, atkBonus: 200, cdrBonus: 0.02 },
  { name: 'Luyện Khí Tầng 5', reqTuvi: 1500, maxLifespan: 100, hpBonus: 1400, atkBonus: 290, cdrBonus: 0.04 },
  { name: 'Luyện Khí Tầng 6', reqTuvi: 2300, maxLifespan: 100, hpBonus: 2000, atkBonus: 400, cdrBonus: 0.06 },
  { name: 'Luyện Khí Tầng 7', reqTuvi: 3300, maxLifespan: 100, hpBonus: 2800, atkBonus: 540, cdrBonus: 0.08 },
  { name: 'Luyện Khí Tầng 8', reqTuvi: 4600, maxLifespan: 100, hpBonus: 3800, atkBonus: 700, cdrBonus: 0.10 },
  { name: 'Luyện Khí Tầng 9', reqTuvi: 6200, maxLifespan: 100, hpBonus: 5000, atkBonus: 900, cdrBonus: 0.12 },
  
  // Trúc Cơ Kỳ (Đại Đột Phá - Tăng Thọ Nguyên lên 250 năm)
  { name: 'Trúc Cơ Sơ Kỳ', reqTuvi: 9500, maxLifespan: 250, hpBonus: 9000, atkBonus: 1600, cdrBonus: 0.15, breakPill: true },
  { name: 'Trúc Cơ Trung Kỳ', reqTuvi: 15000, maxLifespan: 250, hpBonus: 14000, atkBonus: 2400, cdrBonus: 0.18 },
  { name: 'Trúc Cơ Hậu Kỳ', reqTuvi: 23000, maxLifespan: 250, hpBonus: 21000, atkBonus: 3400, cdrBonus: 0.20 },
  { name: 'Trúc Cơ Viên Mãn', reqTuvi: 34000, maxLifespan: 250, hpBonus: 30000, atkBonus: 4700, cdrBonus: 0.22 },

  // Kim Đan Kỳ (Tăng Thọ Nguyên lên 500 năm)
  { name: 'Kim Đan Sơ Kỳ', reqTuvi: 50000, maxLifespan: 500, hpBonus: 45000, atkBonus: 6800, cdrBonus: 0.25, breakPill: true },
  { name: 'Kim Đan Trung Kỳ', reqTuvi: 75000, maxLifespan: 500, hpBonus: 65000, atkBonus: 9500, cdrBonus: 0.27 },
  { name: 'Kim Đan Hậu Kỳ', reqTuvi: 110000, maxLifespan: 500, hpBonus: 90000, atkBonus: 13000, cdrBonus: 0.30 },
  { name: 'Kim Đan Viên Mãn', reqTuvi: 160000, maxLifespan: 500, hpBonus: 125000, atkBonus: 18000, cdrBonus: 0.32 },

  // Nguyên Anh Kỳ (Tăng Thọ Nguyên lên 1000 năm)
  { name: 'Nguyên Anh Sơ Kỳ', reqTuvi: 240000, maxLifespan: 1000, hpBonus: 180000, atkBonus: 25000, cdrBonus: 0.35, breakPill: true },
  { name: 'Nguyên Anh Trung Kỳ', reqTuvi: 360000, maxLifespan: 1000, hpBonus: 250000, atkBonus: 34000, cdrBonus: 0.37 },
  { name: 'Nguyên Anh Hậu Kỳ', reqTuvi: 520000, maxLifespan: 1000, hpBonus: 350000, atkBonus: 46000, cdrBonus: 0.40 },
  { name: 'Nguyên Anh Viên Mãn', reqTuvi: 750000, maxLifespan: 1000, hpBonus: 480000, atkBonus: 62000, cdrBonus: 0.42 },

  // Hóa Thần Kỳ (Tăng Thọ Nguyên lên 2500 năm)
  { name: 'Hóa Thần Tôn Giả', reqTuvi: 1100000, maxLifespan: 2500, hpBonus: 700000, atkBonus: 88000, cdrBonus: 0.45, breakPill: true },
  // Luyện Hư Kỳ (Tăng Thọ Nguyên lên 5000 năm)
  { name: 'Luyện Hư Chân Nhân', reqTuvi: 1800000, maxLifespan: 5000, hpBonus: 1100000, atkBonus: 135000, cdrBonus: 0.48, breakPill: true },
  // Hợp Thể Kỳ (Tăng Thọ Nguyên lên 10000 năm)
  { name: 'Hợp Thể Chí Tôn', reqTuvi: 3000000, maxLifespan: 10000, hpBonus: 1800000, atkBonus: 210000, cdrBonus: 0.50, breakPill: true },
  // Đại Thừa Kỳ (Tăng Thọ Nguyên lên 30000 năm)
  { name: 'Đại Thừa Tiên Quân', reqTuvi: 5500000, maxLifespan: 30000, hpBonus: 3000000, atkBonus: 340000, cdrBonus: 0.55, breakPill: true },
  // Độ Kiếp Kỳ (Bất Tử Vĩnh Hằng)
  { name: 'Độ Kiếp Kiếm Tiên', reqTuvi: 10000000, maxLifespan: 999999, hpBonus: 6000000, atkBonus: 650000, cdrBonus: 0.60, breakPill: true }
];

const CULTIVATION_SECTS = {
  dao: {
    id: 'dao',
    name: 'Thái Thanh Tiên Tông',
    type: 'Đạo Giáo',
    icon: 'sect_cultiv_dao.png',
    desc: 'Ngự Kiếm Phi Hành, Thái Cực Linh Trận, Lôi Pháp Thiên Kiếp. Tăng mạnh sát thương diện rộng và giảm hồi chiêu vũ bão.',
    passives: { cdr: 0.20, aoeDmg: 0.25, power: 300 },
    skills: [
      { id: 'tt_1', name: 'Lôi Đình Kiếm Trảm', key: '1', level: 1, maxLevel: 10, cooldown: 3500, range: 450, aoeRadius: 160, costMp: 80, icon: 'skill_1.png', desc: 'Phóng ra 5 đạo kiếm khí lôi đình giáng xuống đầu địch (450% Công).' },
      { id: 'tt_2', name: 'Thái Cực Linh Trận', key: '2', level: 1, maxLevel: 10, cooldown: 8000, range: 400, aoeRadius: 220, costMp: 120, icon: 'skill_2.png', desc: 'Thi triển Thái Cực Bát Quái trận, khóa chân quái và tăng 35% sát thương chúng nhận phải (600% Công).' },
      { id: 'tt_3', name: 'Cửu Thiên Huyền Lôi', key: '3', level: 1, maxLevel: 10, cooldown: 14000, range: 500, aoeRadius: 300, costMp: 180, icon: 'skill_3.png', desc: 'Triệu hồi vạn đạo lôi điện cuồng phong giáng xuống toàn màn hình (950% Công).' },
      { id: 'tt_4', name: 'Vạn Kiếm Quy Tông', key: '4', level: 1, maxLevel: 10, cooldown: 22000, range: 550, aoeRadius: 380, costMp: 250, icon: 'skill_4.png', desc: 'Thần thông chí cao: triệu hồi 10,000 thanh kiếm linh diệt thế (1600% Công).' }
    ]
  },
  buddha: {
    id: 'buddha',
    name: 'Phạn Thiên Thiền Tự',
    type: 'Phật Giáo',
    icon: 'sect_cultiv_buddha.png',
    desc: 'Kim Cang Bất Hoại, Như Lai Thần Chưởng, Hộ Thể Kim Chung. Phản sát thương cực khủng, hồi phục vô tận.',
    passives: { defPct: 0.30, reflect: 0.25, hp: 5000 },
    skills: [
      { id: 'pt_1', name: 'Kim Cang Hàng Ma Quyền', key: '1', level: 1, maxLevel: 10, cooldown: 3500, range: 350, aoeRadius: 150, costMp: 70, icon: 'skill_sl_1.png', desc: 'Quyền kình Phật môn nghiền nát hộ giáp đối phương (400% Công, làm choáng 2s).' },
      { id: 'pt_2', name: 'Bồ Đề Thanh Tâm Chú', key: '2', level: 1, maxLevel: 10, cooldown: 12000, range: 0, aoeRadius: 300, costMp: 150, icon: 'skill_sl_2.png', desc: 'Hồi phục tức thì 35% HP tối đa và tạo khiên Kim Chung hộ thể chặn 25,000 sát thương trong 8s.' },
      { id: 'pt_3', name: 'Như Lai Thần Chưởng', key: '3', level: 1, maxLevel: 10, cooldown: 12000, range: 450, aoeRadius: 260, costMp: 180, icon: 'skill_sl_3.png', desc: 'Chưởng ấn hoàng kim từ chín tầng mây dội xuống đập tan kẻ thù (850% Công).' },
      { id: 'pt_4', name: 'Vạn Phật Triều Tông', key: '4', level: 1, maxLevel: 10, cooldown: 22000, range: 500, aoeRadius: 360, costMp: 260, icon: 'skill_sl_4.png', desc: 'Phật quang vạn trượng thanh tẩy tà ma diệt sát quần địch (1400% Công).' }
    ]
  },
  demon: {
    id: 'demon',
    name: 'U Minh Ma Tông',
    type: 'Ma Giáo',
    icon: 'sect_cultiv_demon.png',
    desc: 'Huyết Ma Thần Điển, U Minh Ma Hỏa, Thôn Phệ Tinh Huyết. Hút máu bá đạo, cuồng bạo chí mạng cực hạn.',
    passives: { lifeSteal: 0.22, crit: 0.25, critDmg: 0.60 },
    skills: [
      { id: 'um_1', name: 'Thiên Ma Xé Rách', key: '1', level: 1, maxLevel: 10, cooldown: 3500, range: 380, aoeRadius: 160, costMp: 80, icon: 'skill_5.png', desc: 'Nhát chém ma đao xé rách không gian gây chảy máu 10% HP kẻ thù (520% Công).' },
      { id: 'um_2', name: 'Huyết Ma Tế Đàn', key: '2', level: 1, maxLevel: 10, cooldown: 9000, range: 350, aoeRadius: 280, costMp: 140, icon: 'skill_6.png', desc: 'Thôn phệ tinh huyết của vạn quái xung quanh, hồi lại 60% sát thương thành máu cho mình (650% Công).' },
      { id: 'um_3', name: 'U Minh Quỷ Diễm', key: '3', level: 1, maxLevel: 10, cooldown: 13000, range: 450, aoeRadius: 280, costMp: 190, icon: 'skill_7.png', desc: 'Biển lửa địa ngục thiêu đốt vĩnh cửu linh hồn kẻ thù (880% Công).' },
      { id: 'um_4', name: 'Ma Hoàng Thần Biến', key: '4', level: 1, maxLevel: 10, cooldown: 26000, range: 0, aoeRadius: 350, costMp: 280, icon: 'skill_8.png', desc: 'Hóa thân Thượng Cổ Ma Hoàng: Tăng 100% Công kích, 50% Hút máu, 40 Tốc chạy trong 12s!' }
    ]
  },
  beast: {
    id: 'beast',
    name: 'Vạn Yêu Thánh Điện',
    type: 'Yêu Tộc',
    icon: 'sect_cultiv_beast.png',
    desc: 'Thái Cổ Long Hồn, Thiên Hồ Cửu Vĩ, Vạn Độc Xuyên Tâm. Tốc độ vũ bão, né tránh thần sầu, độc sát ăn mòn.',
    passives: { dodge: 0.25, speed: 50, poisonDmg: 0.30 },
    skills: [
      { id: 'vy_1', name: 'Thái Cổ Long Trảo', key: '1', level: 1, maxLevel: 10, cooldown: 3200, range: 380, aoeRadius: 150, costMp: 75, icon: 'skill_xy_1.png', desc: 'Móng vuốt rồng thiêng xé toang phòng ngự, giảm 50% giáp quái trong 5s (500% Công).' },
      { id: 'vy_2', name: 'Thiên Hồ Ảo Ảnh Trận', key: '2', level: 1, maxLevel: 10, cooldown: 7500, range: 420, aoeRadius: 240, costMp: 120, icon: 'skill_xy_2.png', desc: 'Triệu hồi 9 ảo ảnh cửu vĩ hồ tấn công chớp nhoáng (720% Công).' },
      { id: 'vy_3', name: 'Vạn Độc Hủ Cốt Yên', key: '3', level: 1, maxLevel: 10, cooldown: 11000, range: 460, aoeRadius: 280, costMp: 170, icon: 'skill_xy_3.png', desc: 'Phun làn sương độc yêu giới ăn mòn sinh lực quái liên tục trong 6s (850% Công).' },
      { id: 'vy_4', name: 'Yêu Hoàng Thức Tỉnh', key: '4', level: 1, maxLevel: 10, cooldown: 20000, range: 500, aoeRadius: 360, costMp: 250, icon: 'skill_xy_4.png', desc: 'Đánh thức sức mạnh Hồng Hoang Thần Thú: Sát thương bộc phá cực đại 1500% Công, 100% bạo kích!' }
    ]
  }
};

// 4 ĐẠI SET TRANG BỊ TU TIÊN BÁ ĐẠO (GẤP 5 LẦN ĐỒ THƯỜNG)
const CULTIVATION_SETS = {
  set_thai_thanh: {
    id: 'set_thai_thanh',
    name: 'Thái Thanh Cửu Thiên (Tiên Đạo)',
    sect: 'dao',
    rarity: 'platinum',
    orbitColor: '#00e5ff',
    bonus2: { power: 1500, hp: 15000, cdr: 0.15, desc: 'Tăng 1,500 Công, 15,000 HP, Giảm 15% hồi chiêu' },
    bonus4: { power: 4000, hp: 45000, cdr: 0.25, tuviBoost: 0.35, desc: 'Tăng 4,000 Công, 45,000 HP, Giảm 25% hồi chiêu, Tăng 35% Tu Vi nhận được' },
    bonus6: { power: 10000, hp: 120000, cdr: 0.35, tuviBoost: 0.70, immortalAura: true, desc: 'Kích hoạt Tiên Đạo Hào Quang: +10,000 Công, +120,000 HP, Giảm 35% hồi chiêu, +70% Tu Vi từ quái!' }
  },
  set_bo_de: {
    id: 'set_bo_de',
    name: 'Bồ Đề Kim Thân (Phật Môn)',
    sect: 'buddha',
    rarity: 'platinum',
    orbitColor: '#ffd700',
    bonus2: { def: 1200, hp: 25000, reflect: 0.15, desc: 'Tăng 1,200 Thủ, 25,000 HP, Phản đòn 15%' },
    bonus4: { def: 3500, hp: 80000, reflect: 0.30, bonusLifespan: 100, desc: 'Tăng 3,500 Thủ, 80,000 HP, Phản đòn 30%, Kéo dài +100 năm Thọ Nguyên' },
    bonus6: { def: 9000, hp: 200000, reflect: 0.50, immortalAura: true, desc: 'Kích hoạt Phật Quang Bất Diệt: +9,000 Thủ, +200,000 HP, Phản đòn 50%, Miễn tử 1 lần khi thọ thương chí mạng!' }
  },
  set_huyet_ma: {
    id: 'set_huyet_ma',
    name: 'Huyết Ma Diệt Thế (Ma Tông)',
    sect: 'demon',
    rarity: 'abyssal',
    orbitColor: '#ff1744',
    bonus2: { power: 2000, crit: 0.15, lifeSteal: 0.15, desc: 'Tăng 2,000 Công, 15% Bạo kích, 15% Hút máu' },
    bonus4: { power: 5500, crit: 0.30, lifeSteal: 0.30, critDmg: 0.80, desc: 'Tăng 5,500 Công, 30% Bạo kích, 30% Hút máu, 80% Sát thương bạo' },
    bonus6: { power: 14000, crit: 0.50, lifeSteal: 0.50, immortalAura: true, desc: 'Kích hoạt Huyết Ma Thần Uy: +14,000 Công, 50% Bạo kích, 50% Hút máu, Hóa điên tăng 50% tốc độ!' }
  },
  set_van_yeu: {
    id: 'set_van_yeu',
    name: 'Vạn Yêu Hồng Hoang (Yêu Tộc)',
    sect: 'beast',
    rarity: 'celestial',
    orbitColor: '#00e676',
    bonus2: { speed: 40, dodge: 0.15, power: 1800, desc: 'Tăng 40 Tốc độ, 15% Né tránh, 1,800 Công' },
    bonus4: { speed: 80, dodge: 0.30, power: 4800, poisonDmg: 0.40, desc: 'Tăng 80 Tốc độ, 30% Né tránh, 4,800 Công, 40% Độc sát' },
    bonus6: { speed: 120, dodge: 0.50, power: 12000, immortalAura: true, desc: 'Kích hoạt Yêu Thần Giáng Lâm: +120 Tốc chạy, 50% Né tránh, +12,000 Công, Tấn công 100% bỏ qua phòng ngự!' }
  }
};

// TẠO TRANG BỊ TU TIÊN BẬC THẦN THOẠI (CHỈ SỐ BÁ ĐẠO VƯỢT TRỘI PHÀM GIỚI BẠCH KIM)
function generateCultivationGear(slot, setId, rarity = 'platinum', levelReq = 50) {
  const setDef = CULTIVATION_SETS[setId] || CULTIVATION_SETS.set_thai_thanh;
  const slotNames = {
    weapon: 'Tiên Kiếm',
    helmet: 'Tiên Quán',
    armor: 'Tiên Giáp',
    gloves: 'Tiên Uyển',
    pants: 'Tiên Khố',
    boots: 'Tiên Ngoa',
    necklace: 'Tiên Bội',
    ring: 'Tiên Giới',
    talisman: 'Tiên Phù'
  };

  const slotIcons = {
    weapon: 'wpn_sword.png',
    armor: 'arm_robe.png',
    helmet: 'equip_1.png',
    necklace: 'equip_2.png',
    ring: 'equip_3.png',
    gloves: 'equip_4.png',
    pants: 'equip_5.png',
    boots: 'equip_cloud_boots.png',
    talisman: 'equip_7.png'
  };

  const id = 'cultiv_' + slot + '_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
  const name = `${setDef.name.split(' ')[0]} ${slotNames[slot] || 'Bảo Vật'}`;

  // CHỈ SỐ GẤP 3-5 LẦN TRANG BỊ BẠCH KIM PHÀM GIỚI
  const slotBaseConfig = {
    weapon: {
      power: Math.floor(22000 + levelReq * 140),
      def: Math.floor(4800 + levelReq * 35),
      hp: Math.floor(75000 + levelReq * 600),
      mp: Math.floor(24000 + levelReq * 200),
      crit: 0.28,
      critDmg: 0.45
    },
    armor: {
      power: Math.floor(6000 + levelReq * 50),
      def: Math.floor(18000 + levelReq * 135),
      hp: Math.floor(160000 + levelReq * 1300),
      mp: Math.floor(30000 + levelReq * 250),
      dodge: 0.14
    },
    helmet: {
      power: Math.floor(7500 + levelReq * 60),
      def: Math.floor(13500 + levelReq * 90),
      hp: Math.floor(110000 + levelReq * 900),
      mp: Math.floor(25000 + levelReq * 220),
      crit: 0.12
    },
    necklace: {
      power: Math.floor(11000 + levelReq * 85),
      def: Math.floor(10500 + levelReq * 80),
      hp: Math.floor(95000 + levelReq * 750),
      mp: Math.floor(45000 + levelReq * 380),
      dodge: 0.18,
      crit: 0.14
    },
    ring: {
      power: Math.floor(16000 + levelReq * 125),
      def: Math.floor(7500 + levelReq * 60),
      hp: Math.floor(88000 + levelReq * 700),
      crit: 0.25,
      critDmg: 0.40,
      lifeSteal: 0.08
    },
    gloves: {
      power: Math.floor(12500 + levelReq * 95),
      def: Math.floor(10500 + levelReq * 85),
      hp: Math.floor(95000 + levelReq * 750),
      crit: 0.16,
      speed: 35
    },
    pants: {
      power: Math.floor(7000 + levelReq * 55),
      def: Math.floor(15500 + levelReq * 115),
      hp: Math.floor(140000 + levelReq * 1150),
      mp: Math.floor(24000 + levelReq * 200)
    },
    boots: {
      power: Math.floor(6500 + levelReq * 50),
      def: Math.floor(11000 + levelReq * 85),
      hp: Math.floor(85000 + levelReq * 650),
      speed: 95,
      dodge: 0.28
    },
    talisman: {
      power: Math.floor(13000 + levelReq * 95),
      def: Math.floor(13000 + levelReq * 95),
      hp: Math.floor(120000 + levelReq * 950),
      mp: Math.floor(38000 + levelReq * 300),
      crit: 0.16,
      dodge: 0.16
    }
  };

  const baseStats = Object.assign(
    { power: 5000, def: 5000, hp: 60000, mp: 15000, crit: 0.08, dodge: 0.08, speed: 0 },
    slotBaseConfig[slot] || slotBaseConfig.weapon
  );

  // 9 DÒNG PHỤ TIÊN ĐẠO ĐỈNH CAO
  const CULTIV_AFFIX_POOL = [
    { key: 'cooldownReduction', name: 'Thuấn Tức Vạn Biến', val: 0.15, isPct: true, desc: 'Giảm 15% Thời Gian Hồi Chiêu' },
    { key: 'tuviBoost', name: 'Đại Đạo Linh Khí', val: 0.30, isPct: true, desc: 'Tăng 30% Điểm Tu Vi Nhận Được' },
    { key: 'power', name: 'Tiên Kình Ngoại Công', val: 5500, desc: '+5,500 Ngoại Công Tiên Đạo' },
    { key: 'def', name: 'Tiên Khí Hộ Thể', val: 4200, desc: '+4,200 Ngoại Thủ Tiên Đạo' },
    { key: 'hp', name: 'Tiên Cốt Chân Thân', val: 65000, desc: '+65,000 Khí Huyết Chân Thân' },
    { key: 'crit', name: 'Thiên Mệnh Bạo Sát', val: 0.12, isPct: true, desc: '+12% Bạo Kích' },
    { key: 'critDmg', name: 'Phá Diệt Bạo Kích', val: 0.45, isPct: true, desc: '+45% Sát Thương Bạo Kích' },
    { key: 'lifeSteal', name: 'Thôn Phệ Tinh Hoa', val: 0.08, isPct: true, desc: '+8% Hút Sinh Lực Tiên Đạo' },
    { key: 'dodge', name: 'Hư Không Bộ Pháp', val: 0.10, isPct: true, desc: '+10% Né Tránh' }
  ];

  // Random 4 đến 6 affixes không trùng lặp
  const numAffixes = Math.floor(Math.random() * 3) + 4; // 4, 5, hoặc 6 affixes
  const shuffled = [...CULTIV_AFFIX_POOL].sort(() => 0.5 - Math.random());
  const affixes = shuffled.slice(0, numAffixes);

  const initUpgrade = Math.floor(Math.random() * 4) + 6; // Cường hóa mặc định +6 đến +9
  const icon = slotIcons[slot] || 'wpn_sword.png';

  return {
    id,
    templateKey: 'cultiv_' + slot,
    name,
    slot,
    type: 'equipment',
    rarity,
    isCultivGear: true,
    setId,
    orbitColor: setDef.orbitColor,
    isAppraised: true,
    unidentified: false,
    upgradeLevel: initUpgrade,
    enhanceLevel: initUpgrade,
    maxSockets: 4,
    sockets: [
      { socketIdx: 0, gem: null },
      { socketIdx: 1, gem: null }
    ],
    levelReq,
    baseStats,
    affixes,
    icon,
    value: 160000
  };
}

module.exports = {
  CULTIVATION_REALMS,
  CULTIVATION_SECTS,
  CULTIVATION_SETS,
  generateCultivationGear
};
