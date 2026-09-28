// Hệ Thống Trang Bị 9 Cấp Bậc, 10 Cấp Level Tiers, Giám Định, Cường Hóa +1..+15, Khảm Ngọc & 3 Bộ Set Bonus
// Cửu Châu Kiếm Vũ Online V3 - Chuẩn MMORPG Studio

const RARITIES = {
  common:    { id: 'common',    name: 'Phổ Thông',     color: '#e2e8f0', affixes: 0, statMul: 1.0,  dropWeight: 450 },
  uncommon:  { id: 'uncommon',  name: 'Ưu Tú',         color: '#22c55e', affixes: 1, statMul: 1.25, dropWeight: 280 },
  rare:      { id: 'rare',      name: 'Hiếm',          color: '#38bdf8', affixes: 2, statMul: 1.55, dropWeight: 140 },
  epic:      { id: 'epic',      name: 'Sử Thi',        color: '#a855f7', affixes: 3, statMul: 1.95, dropWeight: 75 },
  legendary: { id: 'legendary', name: 'Hoàng Kim',     color: '#eab308', affixes: 4, statMul: 2.45, dropWeight: 35 },
  mythic:    { id: 'mythic',    name: 'Truyền Thuyết', color: '#f97316', affixes: 5, statMul: 3.10, dropWeight: 15 },
  celestial: { id: 'celestial', name: 'Thần Thoại',    color: '#ef4444', affixes: 6, statMul: 4.00, dropWeight: 6 },
  abyssal:   { id: 'abyssal',   name: 'Ma Thần',       color: '#3f3f46', borderColor: '#7c3aed', affixes: 7, statMul: 5.20, dropWeight: 2 },
  platinum:  { id: 'platinum',  name: 'Bạch Kim Chí Tôn', color: '#ffffff', isShimmering: true, affixes: 8, statMul: 7.00, dropWeight: 1 }
};

// 3 BỘ TRANG BỊ KÍCH HOẠT BONUS (SET EQUIPMENT)
const SET_BONUSES = {
  set_than_long: {
    id: 'set_than_long',
    name: 'Cửu Châu Thần Long Trang',
    icon: 'set_than_long.png',
    color: '#ef4444',
    desc: 'Thần binh cổ đại đúc từ long lân, sát thương bạo liệt kinh thiên.',
    bonuses: {
      2: { desc: 'Ngoại Công +120, Bạo Kích +5%', stats: { power: 120, crit: 0.05 } },
      4: { desc: 'Ngoại Công +350, Sát Thương Bạo Kích +15%', stats: { power: 350, critDmg: 0.15 } },
      6: { desc: 'Ngoại Công +800, Tấn công có 15% kích hoạt Thần Long Xuất Hải', stats: { power: 800, crit: 0.08, lifeSteal: 0.05 } }
    }
  },
  set_bac_minh: {
    id: 'set_bac_minh',
    name: 'Bắc Minh Tiên Hộ Trang',
    icon: 'set_bac_minh.png',
    color: '#38bdf8',
    desc: 'Tiên giáp dệt từ tằm băng hải ngoại, hấp thu chân khí và sinh mệnh kẻ thù.',
    bonuses: {
      2: { desc: 'Khí Huyết +1,500, Chân Khí +350', stats: { hp: 1500, mp: 350 } },
      4: { desc: 'Hút Sinh Lực +8%, Ngoại Thủ +120', stats: { lifeSteal: 0.08, def: 120 } },
      6: { desc: 'Khí Huyết +3,500, Tự động kích hoạt Bắc Minh Hộ Thể hấp thu 2,000 sát thương', stats: { hp: 3500, def: 250, lifeSteal: 0.06 } }
    }
  },
  set_kim_cang: {
    id: 'set_kim_cang',
    name: 'Kim Cang Bất Hoại Trang',
    icon: 'set_kim_cang.png',
    color: '#eab308',
    desc: 'Bảo giáp Phật môn, phòng ngự vững như bàn thạch, phản đòn cực mạnh.',
    bonuses: {
      2: { desc: 'Ngoại Thủ +140, Khí Huyết +1,200', stats: { def: 140, hp: 1200 } },
      4: { desc: 'Ngoại Thủ +300, Phản Đòn +18% Sát Thương', stats: { def: 300, reflect: 0.18 } },
      6: { desc: 'Ngoại Thủ +700, Khí Huyết +4,500, Giảm 20% sát thương gánh chịu', stats: { def: 700, hp: 4500, reflect: 0.25 } }
    }
  }
};

// 6 LOẠI NGỌC KHẢM (GEMS CẤP 1 ĐẾN 5)
const GEM_TYPES = {
  ruby: {
    name: 'Hồng Ngọc',
    icon: 'gem_ruby.png',
    color: '#ef4444',
    statName: 'Ngoại Công',
    statKey: 'power',
    values: [30, 75, 160, 320, 650]
  },
  sapphire: {
    name: 'Lam Ngọc',
    icon: 'gem_sapphire.png',
    color: '#3b82f6',
    statName: 'Chân Khí (MP)',
    statKey: 'mp',
    values: [80, 200, 420, 850, 1800]
  },
  topaz: {
    name: 'Hoàng Ngọc',
    icon: 'gem_topaz.png',
    color: '#eab308',
    statName: 'Khí Huyết (HP)',
    statKey: 'hp',
    values: [350, 850, 1800, 3800, 8500]
  },
  emerald: {
    name: 'Lục Bảo Ngọc',
    icon: 'gem_emerald.png',
    color: '#10b981',
    statName: 'Bạo Kích (%)',
    statKey: 'crit',
    values: [0.02, 0.04, 0.07, 0.11, 0.16]
  },
  amethyst: {
    name: 'Tử Ngọc',
    icon: 'gem_amethyst.png',
    color: '#a855f7',
    statName: 'Ngoại Thủ',
    statKey: 'def',
    values: [25, 60, 130, 280, 580]
  },
  amber: {
    name: 'Hổ Phách',
    icon: 'gem_amber.png',
    color: '#f97316',
    statName: 'Hút Sinh Lực (%)',
    statKey: 'lifeSteal',
    values: [0.02, 0.04, 0.07, 0.10, 0.15]
  }
};

// Mẫu trang bị cơ bản theo vị trí slot
const ITEM_TEMPLATES = {
  // 1. VŨ KHÍ (WEAPON)
  wpn_sword: {
    baseName: 'Cổ Kiếm',
    slot: 'weapon',
    icon: 'item_1.png',
    platIcon: 'equip_8.png',
    basePower: 95,
    baseCrit: 0.08,
    desc: 'Trường kiếm sắc bén ngưng tụ hàn quang, vũ khí ưa thích của kiếm khách giang hồ.'
  },
  wpn_saber: {
    baseName: 'Đại Đao',
    slot: 'weapon',
    icon: 'item_2.png',
    platIcon: 'item_2.png',
    basePower: 110,
    baseHp: 200,
    desc: 'Đại đao dũng mãnh, trảm thiết như bùn, thích hợp công phạt dũng mãnh.'
  },
  
  // 2. NÓN / MÃO (HELMET)
  helm_crown: {
    baseName: 'Chiến Mão',
    slot: 'helmet',
    icon: 'equip_1.png',
    platIcon: 'equip_1.png',
    baseDef: 40,
    baseHp: 250,
    desc: 'Mão hộ đầu chế tác tinh xảo, bảo vệ tâm trí và huyệt đạo đỉnh đầu.'
  },

  // 3. DÂY CHUYỀN (NECKLACE)
  neck_pendant: {
    baseName: 'Hạng Liên',
    slot: 'necklace',
    icon: 'equip_2.png',
    platIcon: 'equip_2.png',
    basePower: 40,
    baseDef: 30,
    baseMp: 160,
    desc: 'Dây chuyền chạm khắc ngọc long, lưu thông chân khí khắp kinh lạc.'
  },

  // 4. ÁO GIÁP (ARMOR)
  arm_robe: {
    baseName: 'Chiến Bào',
    slot: 'armor',
    icon: 'item_3.png',
    platIcon: 'equip_9.png',
    baseDef: 75,
    baseHp: 500,
    desc: 'Chiến giáp chế tạo từ thiên tằm kim ti, đao kiếm khó lòng xuyên thủng.'
  },

  // 5. GĂNG TAY (GLOVES)
  glv_bracers: {
    baseName: 'Hộ Oản',
    slot: 'gloves',
    icon: 'equip_4.png',
    platIcon: 'equip_4.png',
    basePower: 35,
    baseDef: 25,
    baseCrit: 0.05,
    desc: 'Găng tay bao bọc cổ tay và khớp ngón, tăng cường uy lực xuất kiếm và chưởng phong.'
  },

  // 6. NHẪN (RING)
  rng_band: {
    baseName: 'Giới Chỉ',
    slot: 'ring',
    icon: 'equip_3.png',
    platIcon: 'equip_3.png',
    basePower: 50,
    baseCrit: 0.07,
    desc: 'Nhẫn hộ thể đúc từ huyền thiết, gia trì chân kình ngoại công và bạo kích.'
  },

  // 7. QUẦN (PANTS)
  pnt_leggings: {
    baseName: 'Chiến Khố',
    slot: 'pants',
    icon: 'equip_5.png',
    platIcon: 'equip_5.png',
    baseDef: 50,
    baseHp: 350,
    desc: 'Quần hộ giáp vảy rồng, bảo vệ hạ bàn vững chắc như bàn thạch.'
  },

  // 8. GIÀY (BOOTS)
  bts_shoes: {
    baseName: 'Phi Hài',
    slot: 'boots',
    icon: 'item_4.png',
    platIcon: 'item_4.png',
    baseSpeed: 50,
    baseDodge: 0.08,
    desc: 'Giày khinh công nhẹ như lông hồng, đạp tuyết vô ngân lướt gió.'
  },

  // 9. LỆNH BÀI / PHI PHONG (TALISMAN / CAPE)
  tls_badge: {
    baseName: 'Tông Môn Lệnh Bài',
    slot: 'talisman',
    icon: 'equip_7.png',
    platIcon: 'equip_6.png',
    basePower: 35,
    baseDef: 35,
    baseHp: 280,
    desc: 'Tín vật minh chứng danh phận tông sư môn phái, nhận được sự gia trì của tổ sư.'
  }
};

// Aliases tương thích
ITEM_TEMPLATES.acc_ring = ITEM_TEMPLATES.rng_band;
ITEM_TEMPLATES.helm_iron = ITEM_TEMPLATES.helm_crown;
ITEM_TEMPLATES.arm_leather = ITEM_TEMPLATES.arm_robe;
ITEM_TEMPLATES.bts_leather = ITEM_TEMPLATES.bts_shoes;
ITEM_TEMPLATES.glv_leather = ITEM_TEMPLATES.glv_bracers;
ITEM_TEMPLATES.neck_jade = ITEM_TEMPLATES.neck_pendant;
ITEM_TEMPLATES.pnt_cloth = ITEM_TEMPLATES.pnt_leggings;
ITEM_TEMPLATES.tls_cape = ITEM_TEMPLATES.tls_badge;

// DANH MỤC VẬT PHẨM TIÊU HAO, PHÙ CHÚ & ĐÁ CƯỜNG HÓA
const CONSUMABLE_ITEMS = {
  item_5: {
    id: 'item_5',
    name: 'Cửu Chuyển Huyết Đan',
    type: 'consumable',
    rarity: 'common',
    icon: 'item_5.png',
    healHp: 350,
    stackable: true,
    desc: 'Hồi phục ngay 350 Khí Huyết (Phím [1] để dùng nhanh).'
  },
  item_6: {
    id: 'item_6',
    name: 'Quy Nguyên Khí Hoàn',
    type: 'consumable',
    rarity: 'common',
    icon: 'item_6.png',
    healMp: 200,
    stackable: true,
    desc: 'Hồi phục ngay 200 Chân Khí (Phím [2] để dùng nhanh).'
  },
  item_7: {
    id: 'item_7',
    name: 'Thái Huyền Bí Tịch',
    type: 'scripture',
    rarity: 'celestial',
    icon: 'item_7.png',
    realmPoints: 500,
    stackable: true,
    desc: 'Bí kíp võ công cổ đại, nhận +4 Điểm Tu Vi Chân Khí và +2 Điểm Võ Học!'
  },
  item_9: {
    id: 'item_9',
    name: 'Kim Đĩnh Hoàng Kim',
    type: 'currency',
    rarity: 'rare',
    icon: 'item_9.png',
    goldValue: 1000,
    desc: 'Ngân lượng vàng thỏi đổi lấy 1,000 Bạc.'
  },

  // 1. GIÁM ĐỊNH PHÙ
  item_appraisal: {
    id: 'item_appraisal',
    name: 'Thiên Nhãn Giám Định Phù',
    type: 'appraisal_scroll',
    rarity: 'rare',
    icon: 'item_appraisal.png',
    stackable: true,
    desc: 'Chuột phải vào trang bị chưa giám định để mở khóa toàn bộ dòng thuộc tính ẩn!'
  },

  // 2. ĐÁ CƯỜNG HÓA
  item_enhance_stone: {
    id: 'item_enhance_stone',
    name: 'Thiên Cương Cường Hóa Thạch',
    type: 'enhance_stone',
    rarity: 'epic',
    icon: 'item_enhance_stone.png',
    stackable: true,
    desc: 'Thiên thạch chứa năng lượng cương khí, dùng để cường hóa trang bị lên đến +15 tại Thợ Rèn!'
  },

  // 3. BÙA BẢO HỘ
  item_protection_charm: {
    id: 'item_protection_charm',
    name: 'Thiên Mệnh Hộ Thân Phù',
    type: 'protection_charm',
    rarity: 'legendary',
    icon: 'item_protection_charm.png',
    stackable: true,
    desc: 'Bảo bối thần kỳ: Khi cường hóa từ +7 trở lên nếu thất bại sẽ KHÔNG BỊ TỤT CẤP trang bị!'
  },

  // 4. ĐÁ ĐỤC LỖ
  item_socket_drill: {
    id: 'item_socket_drill',
    name: 'Kim Cương Tạc Khảm Thạch',
    type: 'socket_drill',
    rarity: 'epic',
    icon: 'item_socket_drill.png',
    stackable: true,
    desc: 'Mũi khoan kim cương thần bí, dùng để đục thêm lỗ khảm ngọc trên trang bị (tối đa 3 lỗ)!'
  },

  // 5. TIÊN ĐAN TU TIÊN (THỌ NGUYÊN, TU VI & ĐỘT PHÁ)
  item_lifespan_pill: {
    id: 'item_lifespan_pill',
    name: 'Trường Sinh Thọ Nguyên Đan',
    type: 'consumable',
    subType: 'lifespan',
    rarity: 'platinum',
    icon: 'item_lifespan_pill.png',
    stackable: true,
    lifespanGain: 5,
    desc: 'Luyện chế từ Bất Lão Tuyền và ngàn năm Tiên Chi, dùng lập tức tăng +5 năm thọ nguyên tối đa hoặc cải lão hoàn đồng!'
  },
  item_tuvi_pill: {
    id: 'item_tuvi_pill',
    name: 'Cửu U Tu Vi Đan',
    type: 'consumable',
    subType: 'tuvi',
    rarity: 'platinum',
    icon: 'item_tuvi_pill.png',
    stackable: true,
    tuviGain: 5000,
    desc: 'Ngưng tụ tinh hoa đại đạo cõi tiên ma, hấp thu lập tức nhận +5,000 Điểm Tu Vi Tiên Đạo!'
  },
  item_breakthrough_pill: {
    id: 'item_breakthrough_pill',
    name: 'Cửu Chuyển Đột Phá Đan',
    type: 'consumable',
    subType: 'breakthrough',
    rarity: 'platinum',
    icon: 'item_breakthrough_pill.png',
    stackable: true,
    desc: 'Tuyệt thế tiên đan: Tự động tiêu hao khi Huynh Đài đột phá cảnh giới để bảo đảm 100% tỷ lệ thành công!'
  },
  item_gold_ingot: {
    id: 'item_gold_ingot',
    name: 'Bọc Ngân Lượng Tiền Bối',
    type: 'currency',
    rarity: 'epic',
    icon: 'item_9.png',
    goldValue: 1500,
    stackable: true,
    desc: 'Kho báu ngân lượng rơi rớt từ các bậc tiền bối cường giả, nhận ngay 1,500 Bạc.'
  }
};

// Đăng ký 6 loại ngọc x 5 cấp vào CONSUMABLE_ITEMS
for (const [gemKey, def] of Object.entries(GEM_TYPES)) {
  for (let lvl = 1; lvl <= 5; lvl++) {
    const gemId = `gem_${gemKey}_${lvl}`;
    const roman = ['I', 'II', 'III', 'IV', 'V'][lvl - 1];
    const val = def.values[lvl - 1];
    const valText = typeof val === 'number' && val < 1 ? `+${Math.round(val * 100)}%` : `+${val}`;

    CONSUMABLE_ITEMS[gemId] = {
      id: gemId,
      gemKey,
      gemLevel: lvl,
      name: `${def.name} Cấp ${roman}`,
      type: 'gem',
      rarity: lvl === 1 ? 'uncommon' : (lvl === 2 ? 'rare' : (lvl === 3 ? 'epic' : (lvl === 4 ? 'legendary' : 'mythic'))),
      icon: def.icon,
      statKey: def.statKey,
      statVal: val,
      statDesc: `${def.statName} ${valText}`,
      stackable: true,
      desc: `Ngọc quý dùng để khảm vào lỗ trang bị. Gia tăng ${def.statName} ${valText}. Có thể ghép 3 viên lên cấp cao hơn!`
    };
  }
}

const AFFIX_POOLS = [
  { key: 'power', name: 'Ngoại Công', min: 20, max: 60, unit: '' },
  { key: 'def', name: 'Ngoại Thủ', min: 15, max: 45, unit: '' },
  { key: 'hp', name: 'Khí Huyết', min: 150, max: 600, unit: '' },
  { key: 'mp', name: 'Chân Khí', min: 80, max: 280, unit: '' },
  { key: 'crit', name: 'Bạo Kích', min: 0.03, max: 0.07, unit: '%', isPct: true },
  { key: 'dodge', name: 'Né Tránh', min: 0.02, max: 0.06, unit: '%', isPct: true },
  { key: 'critDmg', name: 'Sát Thương Bạo', min: 0.18, max: 0.45, unit: '%', isPct: true },
  { key: 'speed', name: 'Thân Pháp Tốc Độ', min: 12, max: 35, unit: 'px/s' },
  { key: 'lifeSteal', name: 'Hút Sinh Lực', min: 0.03, max: 0.06, unit: '%', isPct: true }
];

const PREFIXES = [
  'Cuồng Phong', 'Liệt Hỏa', 'Hàn Băng', 'Lôi Đình', 'Tử Hà',
  'Thái Cực', 'Bắc Minh', 'Chân Vũ', 'Thiên Cương', 'Cửu U'
];

// Danh xưng theo cấp bậc 10 cấp (Tier Level)
const TIER_NAMES = {
  1: 'Tân Thủ',
  10: 'Tiên Phong',
  20: 'Trảm Ma',
  30: 'Côn Lôn',
  40: 'Hoàng Sa',
  50: 'Thái Cổ'
};

let globalItemCounter = 6000;

// HÀM TẠO TRANG BỊ MỚI (CÓ CẤP LEVEL, GIÁM ĐỊNH, LỖ NGỌC & SET BONUS)
function generateEquipment(templateKey, forceRarity = null, level = 1, forceSet = null, forceIdentified = false) {
  const tmpl = ITEM_TEMPLATES[templateKey] || ITEM_TEMPLATES.wpn_sword;
  
  // Xác định phẩm cấp nếu không ép buộc
  let rarityKey = forceRarity;
  if (!rarityKey) {
    const totalWeight = Object.values(RARITIES).reduce((sum, r) => sum + r.dropWeight, 0);
    let rand = Math.random() * totalWeight;
    for (const [k, r] of Object.entries(RARITIES)) {
      if (rand <= r.dropWeight) {
        rarityKey = k;
        break;
      }
      rand -= r.dropWeight;
    }
  }
  
  const rarity = RARITIES[rarityKey] || RARITIES.common;
  
  // Phân chia cấp độ theo mốc 10 cấp: 1, 10, 20, 30, 40, 50
  const tierLevel = level >= 50 ? 50 : (level >= 40 ? 40 : (level >= 30 ? 30 : (level >= 20 ? 20 : (level >= 10 ? 10 : 1))));
  const tierMultiplier = 1 + (tierLevel - 1) * 0.16;
  const statMul = rarity.statMul * tierMultiplier;
  
  // Chỉ số cơ bản dao động ngẫu nhiên +/- 15%
  const roll = () => 0.85 + Math.random() * 0.3;
  const baseStats = {};
  if (tmpl.basePower) baseStats.power = Math.round(tmpl.basePower * statMul * roll());
  if (tmpl.baseDef) baseStats.def = Math.round(tmpl.baseDef * statMul * roll());
  if (tmpl.baseHp) baseStats.hp = Math.round(tmpl.baseHp * statMul * roll());
  if (tmpl.baseMp) baseStats.mp = Math.round(tmpl.baseMp * statMul * roll());
  if (tmpl.baseCrit) baseStats.crit = Number((tmpl.baseCrit * (1 + rarity.affixes * 0.12)).toFixed(3));
  if (tmpl.baseDodge) baseStats.dodge = Number((tmpl.baseDodge * (1 + rarity.affixes * 0.10)).toFixed(3));
  if (tmpl.baseSpeed) baseStats.speed = Math.round(tmpl.baseSpeed * (1 + rarity.affixes * 0.08));

  // Tạo dòng phụ ngẫu nhiên (Affixes)
  const affixes = [];
  const chosenKeys = new Set();
  for (let i = 0; i < rarity.affixes; i++) {
    const pool = AFFIX_POOLS.filter(a => !chosenKeys.has(a.key));
    if (pool.length === 0) break;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    chosenKeys.add(picked.key);
    
    let val;
    if (picked.isPct) {
      val = Number((picked.min + Math.random() * (picked.max - picked.min)).toFixed(3));
    } else {
      val = Math.round((picked.min + Math.random() * (picked.max - picked.min)) * tierMultiplier);
    }
    affixes.push({
      key: picked.key,
      name: picked.name,
      val: val,
      unit: picked.unit,
      isPct: picked.isPct
    });
  }

  // Tên trang bị
  const tierLabel = TIER_NAMES[tierLevel] || 'Cổ';
  const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
  let fullName = `${tierLabel} · ${prefix} ${tmpl.baseName}`;
  
  if (rarityKey === 'platinum') fullName = `★ BẠCH KIM CHÍ TÔN · ${tmpl.baseName.toUpperCase()} (Lv.${tierLevel}) ★`;
  else if (rarityKey === 'celestial') fullName = `【Thần Thoại】 ${tierLabel} ${tmpl.baseName}`;
  else if (rarityKey === 'abyssal') fullName = `【Ma Thần】 ${tierLabel} ${tmpl.baseName}`;

  // Kiểm tra Set Trang Bị
  let setId = forceSet;
  if (!setId && (rarityKey === 'legendary' || rarityKey === 'mythic' || rarityKey === 'celestial' || rarityKey === 'platinum')) {
    // 25% tỷ lệ ra đồ Set
    if (Math.random() < 0.35) {
      const setKeys = Object.keys(SET_BONUSES);
      setId = setKeys[Math.floor(Math.random() * setKeys.length)];
    }
  }

  if (setId && SET_BONUSES[setId]) {
    fullName = `【${SET_BONUSES[setId].name.split(' ')[0]}】 ` + fullName;
  }

  const icon = (rarityKey === 'platinum' && tmpl.platIcon) ? tmpl.platIcon : tmpl.icon;

  // Cơ chế Giám Định: Đồ từ cấp Rare trở lên khi rơi ra sẽ ở trạng thái Chưa Giám Định
  let isUnidentified = false;
  if (!forceIdentified && ['rare', 'epic', 'legendary', 'mythic', 'celestial', 'abyssal', 'platinum'].includes(rarityKey)) {
    isUnidentified = true;
  }

  // Cơ chế Lỗ Khảm Ngọc (0 đến 3 lỗ)
  let maxSockets = 3;
  let currentSocketsCount = (rarityKey === 'platinum' || rarityKey === 'celestial') ? 2 : (rarityKey === 'legendary' || rarityKey === 'mythic' ? 1 : 0);
  const sockets = [];
  for (let s = 0; s < currentSocketsCount; s++) {
    sockets.push({ socketIdx: s, gem: null });
  }

  const itemId = `item_${globalItemCounter++}`;
  const itemInstance = {
    id: itemId,
    uid: itemId,
    templateKey,
    name: fullName,
    type: 'equipment',
    slot: tmpl.slot,
    rarity: rarityKey,
    rarityName: rarity.name,
    rarityColor: rarity.color,
    isShimmering: !!rarity.isShimmering,
    icon: icon,
    levelReq: tierLevel,
    tierLevel: tierLevel,
    upgradeLevel: 0, // Cường hóa +0
    unidentified: isUnidentified, // Giám định
    setId: setId || null, // Set đồ
    sockets: sockets, // Các lỗ ngọc
    maxSockets: maxSockets,
    baseStats,
    affixes,
    desc: tmpl.desc
  };

  return itemInstance;
}

// 1. GIÁM ĐỊNH TRANG BỊ
function appraiseEquipment(item) {
  if (!item || item.type !== 'equipment') return { success: false, msg: 'Chỉ có thể giám định trang bị!' };
  if (!item.unidentified) return { success: false, msg: 'Trang bị này đã được giám định rồi!' };

  item.unidentified = false;
  return {
    success: true,
    item,
    msg: `Giám định thành công [${item.name}]! Khám phá được toàn bộ thần uy ẩn giấu!`
  };
}

// 2. CƯỜNG HÓA TRANG BỊ (+1 ĐẾN +15) - HỖ TRỢ ĐẮC LỰC CẢ TRANG BỊ TU TIÊN
function enhanceEquipment(item, useProtectionCharm = false) {
  if (!item || (item.type !== 'equipment' && !item.isCultivGear)) {
    return { success: false, msg: 'Chỉ có thể cường hóa trang bị hoặc pháp bảo tu tiên!' };
  }
  if (item.unidentified) return { success: false, msg: 'Trang bị chưa giám định, không thể cường hóa!' };
  
  // Đồng bộ hai biến upgradeLevel và enhanceLevel
  if (item.upgradeLevel === undefined && item.enhanceLevel !== undefined) {
    item.upgradeLevel = Number(item.enhanceLevel);
  }
  item.upgradeLevel = Number(item.upgradeLevel) || 0;
  item.enhanceLevel = item.upgradeLevel;

  if (item.upgradeLevel >= 15) return { success: false, msg: 'Trang bị đã đạt cấp cường hóa cực hạn (+15)!' };

  // Bảng tỷ lệ thành công theo mốc:
  const rates = [1.0, 1.0, 1.0, 0.75, 0.70, 0.65, 0.45, 0.40, 0.35, 0.25, 0.22, 0.18, 0.12, 0.09, 0.06];
  const rate = rates[item.upgradeLevel] || 0.08;
  const isSuccess = Math.random() < rate;

  if (isSuccess) {
    item.upgradeLevel++;
    item.enhanceLevel = item.upgradeLevel;
    // Trang bị Tu Tiên tăng 15% chỉ số mỗi cấp, đồ thường tăng 12%
    const statMult = item.isCultivGear ? 1.15 : 1.12;
    if (item.baseStats) {
      for (const [k, v] of Object.entries(item.baseStats)) {
        if (typeof v === 'number') {
          item.baseStats[k] = Math.round(v * statMult);
        }
      }
    }
    return {
      success: true,
      newLevel: item.upgradeLevel,
      item,
      msg: `Chúc mừng! Cường hóa ${item.isCultivGear ? 'Pháp Bảo Tu Tiên' : 'Thần Binh'} thành công lên +${item.upgradeLevel}!`
    };
  } else {
    // Thất bại
    let levelDropped = false;
    if (item.upgradeLevel >= 7) {
      if (useProtectionCharm) {
        levelDropped = false;
      } else {
        item.upgradeLevel = Math.max(0, item.upgradeLevel - 1);
        item.enhanceLevel = item.upgradeLevel;
        levelDropped = true;
      }
    }

    return {
      success: false,
      failed: true,
      levelDropped,
      newLevel: item.upgradeLevel,
      item,
      msg: levelDropped 
        ? `Cường hóa thất bại! Do không có Thiên Mệnh Hộ Thân Phù, trang bị đã bị tụt xuống +${item.upgradeLevel}!`
        : (useProtectionCharm 
          ? `Cường hóa thất bại! Nhờ có Thiên Mệnh Hộ Thân Phù bảo vệ, trang bị vẫn giữ nguyên cấp +${item.upgradeLevel}!`
          : `Cường hóa thất bại, linh khí chưa ngưng tụ thành công!`)
    };
  }
}

// 3. ĐỤC LỖ TRANG BỊ
function socketEquipment(item) {
  if (!item || item.type !== 'equipment') return { success: false, msg: 'Chỉ có thể đục lỗ trang bị!' };
  if (!item.sockets) item.sockets = [];
  if (item.sockets.length >= (item.maxSockets || 3)) {
    return { success: false, msg: `Trang bị này đã đạt tối đa ${item.maxSockets || 3} lỗ khảm ngọc!` };
  }

  const newIdx = item.sockets.length;
  item.sockets.push({ socketIdx: newIdx, gem: null });
  return {
    success: true,
    socketCount: item.sockets.length,
    item,
    msg: `Đục lỗ thành công! Trang bị hiện có ${item.sockets.length} lỗ khảm ngọc!`
  };
}

// 4. KHẢM NGỌC VÀO LỖ
function embedGem(item, socketIdx, gemItem) {
  if (!item || item.type !== 'equipment') return { success: false, msg: 'Chỉ có thể khảm ngọc vào trang bị!' };
  if (!item.sockets || !item.sockets[socketIdx]) return { success: false, msg: 'Lỗ khảm không hợp lệ!' };
  if (!gemItem || (gemItem.type !== 'gem' && (!gemItem.itemId || !gemItem.itemId.startsWith('gem_')))) {
    return { success: false, msg: 'Vật phẩm không phải là Ngọc Khảm!' };
  }

  const targetSocket = item.sockets[socketIdx];
  const existingGem = targetSocket.gem || (targetSocket.name ? targetSocket : null);
  if (existingGem && existingGem.name) return { success: false, msg: 'Lỗ này đã có khảm ngọc rồi! Hãy tháo ngọc cũ trước!' };

  targetSocket.gem = {
    gemId: gemItem.itemId || gemItem.id,
    gemKey: gemItem.gemKey,
    gemLevel: gemItem.gemLevel || 1,
    name: gemItem.name,
    icon: gemItem.icon,
    statKey: gemItem.statKey,
    statVal: gemItem.statVal,
    statDesc: gemItem.statDesc
  };

  return {
    success: true,
    item,
    msg: `Khảm ngọc [${gemItem.name}] vào trang bị thành công!`
  };
}

// 5. THÁO NGỌC KHỎI LỖ
function removeGem(item, socketIdx) {
  if (!item || item.type !== 'equipment') return { success: false, msg: 'Vật phẩm không hợp lệ!' };
  if (!item.sockets || !item.sockets[socketIdx]) return { success: false, msg: 'Lỗ khảm không hợp lệ!' };

  const targetSocket = item.sockets[socketIdx];
  const gemObj = targetSocket.gem || (targetSocket.name ? targetSocket : null);
  if (!gemObj || !gemObj.name) return { success: false, msg: 'Lỗ này chưa có ngọc khảm!' };

  const removedGem = { ...gemObj };
  targetSocket.gem = null;
  delete targetSocket.name;
  delete targetSocket.gemId;
  delete targetSocket.gemKey;
  delete targetSocket.gemLevel;
  delete targetSocket.statKey;
  delete targetSocket.statVal;
  delete targetSocket.statDesc;
  delete targetSocket.icon;

  return {
    success: true,
    removedGem,
    item,
    msg: `Tháo ngọc [${removedGem.name}] thành công!`
  };
}

// 6. GHÉP 3 VIÊN NGỌC LÊN CẤP CAO HƠN
function combineGems(gemType, gemLevel, gemCount) {
  if (gemLevel >= 5) return { success: false, msg: 'Ngọc đã đạt cấp tối đa (Cấp V), không thể ghép thêm!' };
  if (gemCount < 3) return { success: false, msg: 'Cần ít nhất 3 viên ngọc cùng loại cùng cấp để ghép!' };

  const nextLevel = gemLevel + 1;
  const newGemId = `gem_${gemType}_${nextLevel}`;
  const newGemDef = CONSUMABLE_ITEMS[newGemId];

  return {
    success: true,
    consumed: 3,
    newGem: newGemDef,
    msg: `Hợp thành thành công 3 viên Cấp ${gemLevel} thành 1 viên [${newGemDef.name}] Cực Phẩm!`
  };
}

module.exports = {
  RARITIES,
  SET_BONUSES,
  GEM_TYPES,
  ITEM_TEMPLATES,
  CONSUMABLE_ITEMS,
  generateEquipment,
  appraiseEquipment,
  enhanceEquipment,
  socketEquipment,
  embedGem,
  removeGem,
  combineGems
};
