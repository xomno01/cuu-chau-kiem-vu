const { SKILLS } = require('./Skills');
const { TITLES } = require('./Titles');
const { 
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
} = require('./ItemSystem');

const {
  CULTIVATION_REALMS,
  CULTIVATION_SECTS,
  CULTIVATION_SETS,
  generateCultivationGear
} = require('./CultivationSystem');

const REALMS = CULTIVATION_REALMS.map(r => r.name);

class Player {
  constructor(id, name, sect = 'huashan', spawnX = 1400, spawnY = 700) {
    this.id = id;
    this.name = name || 'Vô Danh Hiệp Khách';
    this.sect = sect; // 'huashan' | 'xiaoyao' | 'shaolin' | 'wudang'
    this.currentMap = 'lac_duong';
    
    // Hệ thống Tài Khoản & Nhân Vật Lưu Trữ
    this.username = null;
    this.charId = null;

    // Tọa độ Trong Thành Lạc Dương
    this.x = spawnX;
    this.y = spawnY;
    this.targetX = spawnX;
    this.targetY = spawnY;
    this.angle = 0;
    this.speed = 280;
    this.isMoving = false;
    
    // Cấp độ & Cảnh giới Tu Tiên
    this.level = 1;
    this.exp = 0;
    this.expNext = 120;
    this.realmIdx = 0;
    this.tuvi = 0;

    // Hệ Thống Thọ Nguyên & Tuổi Thọ (Permadeath)
    this.age = 18;
    this.maxLifespan = 100;
    this.isDeadPerm = false;
    this.lastAgeTick = Date.now();

    // Môn Phái Tu Tiên Cấp 30 (Đạo Giáo, Phật Giáo, Ma Giáo, Yêu Tộc)
    this.cultivSect = null;
    this.cultivSkillLevels = {};

    
    // Điểm Tiềm Năng Tự Thân
    this.statPoints = 15; // Tặng 15 điểm khởi đầu
    this.stats = {
      str: 15, // Sức Mạnh
      vit: 15, // Thể Chất
      agi: 15, // Thân Pháp
      eng: 15  // Nội Lực
    };
    
    // Điểm Kỹ Năng & Cấp độ Võ Học theo 4 Môn Phái
    this.skillPoints = 5;
    if (sect === 'shaolin') {
      this.skillLevels = { sl_1: 1, sl_2: 1, sl_3: 1, sl_4: 1, sl_passive_1: 1 };
      this.baseMaxHp = 1600;
      this.baseMaxMp = 450;
      this.baseAttack = 95;
      this.baseDef = 68;
      this.baseCrit = 0.08;
      this.baseDodge = 0.05;
    } else if (sect === 'wudang') {
      this.skillLevels = { wd_1: 1, wd_2: 1, wd_3: 1, wd_4: 1, wd_passive_1: 1 };
      this.baseMaxHp = 1000;
      this.baseMaxMp = 880;
      this.baseAttack = 110;
      this.baseDef = 40;
      this.baseCrit = 0.12;
      this.baseDodge = 0.10;
    } else if (sect === 'xiaoyao') {
      this.skillLevels = { xy_1: 1, xy_2: 1, xy_3: 1, xy_4: 1, xy_passive_1: 1 };
      this.baseMaxHp = 1050;
      this.baseMaxMp = 750;
      this.baseAttack = 95;
      this.baseDef = 45;
      this.baseCrit = 0.10;
      this.baseDodge = 0.15;
    } else {
      // Hoa Sơn Kiếm Phái
      this.skillLevels = { hs_1: 1, hs_2: 1, hs_3: 1, hs_4: 1, hs_passive_1: 1 };
      this.baseMaxHp = 1200;
      this.baseMaxMp = 550;
      this.baseAttack = 105;
      this.baseDef = 45;
      this.baseCrit = 0.15;
      this.baseDodge = 0.08;
    }
      
    // Điểm Tu Vi Chân Khí & Kinh Mạch
    this.meridianPoints = 6;
    this.meridians = {
      docMach: 0,   // +Attack
      nhamMach: 0,  // +HP & Def
      xungMach: 0,  // +Crit
      doiMach: 0    // +Speed & Dodge
    };
    
    this.hp = this.baseMaxHp;
    this.mp = this.baseMaxMp;
    
    // 8 VỊ TRÍ TRANG BỊ TRÊN NGƯỜI
    this.equipment = {
      weapon: null,
      helmet: null,
      necklace: null,
      armor: null,
      gloves: null,
      ring: null,
      pants: null,
      boots: null,
      talisman: null
    };
    
    // TÚI ĐỒ 200 Ô HÀNH TRANG
    this.maxInventorySlots = 200;
    this.inventory = [];
    this.gold = 3500;
    
    // VÒNG QUAY MAY MẮN (10 LƯỢT MIỄN PHÍ MỖI LẦN ĐĂNG NHẬP)
    this.luckySpins = 10;
    this.totalSpins = 0;
    
    // HỆ THỐNG DANH HIỆU VÕ LÂM (12 ĐẠI DANH HIỆU TỪ THẤP ĐẾN CAO)
    this.activeTitle = 'title_1';
    this.unlockedTitles = ['title_1'];

    // BỘ LỌC TỰ NHẶT ĐỒ (LOOT FILTER THEO PHẨM CẤP & LOẠI VẬT PHẨM)
    this.lootFilter = {
      minRarity: 'common', // 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'celestial' | 'abyssal' | 'platinum'
      allowEquip: true,
      allowPotion: true,
      allowGemCharm: true
    };
    
    // Tặng Tân Thủ Set Đồ Khởi Đầu Đa Phẩm Cấp
    this.initStarterGear();
    this.checkTitleUnlocks();
    
    this.skillCooldowns = {};
    this.dashCooldown = 0;
    this.isDashing = false;
    this.dashEndTime = 0;
    this.dashSpeed = 750;
    this.dashDirX = 0;
    this.dashDirY = 0;
    this.isMeditating = false;
    this.shield = 0;
    this.shieldEndTime = 0;
    this.reflectActive = false;
    this.reflectEndTime = 0;
    this.lastAttackTime = 0;
  }
  
  // Khởi tạo đồ đạc tân thủ
  initStarterGear() {
    // Tạo vũ khí Hoàng Kim, giáp Sử Thi, nón Lam, giày Tinh Anh (đã giám định sẵn)
    const starterSword = generateEquipment('wpn_sword', 'legendary', 1, null, true);
    const starterHelm = generateEquipment('helm_crown', 'rare', 1, null, true);
    const starterArmor = generateEquipment('arm_robe', 'epic', 1, null, true);
    const starterGloves = generateEquipment('glv_bracers', 'rare', 1, null, true);
    const starterPants = generateEquipment('pnt_leggings', 'uncommon', 1, null, true);
    const starterBoots = generateEquipment('bts_shoes', 'rare', 1, null, true);
    const starterNeck = generateEquipment('neck_pendant', 'epic', 1, null, true);
    const starterRing = generateEquipment('rng_band', 'rare', 1, null, true);

    // Mặc trực tiếp vào người
    this.equipment.weapon = starterSword;
    this.equipment.helmet = starterHelm;
    this.equipment.armor = starterArmor;
    this.equipment.gloves = starterGloves;
    this.equipment.pants = starterPants;
    this.equipment.boots = starterBoots;
    this.equipment.necklace = starterNeck;
    this.equipment.ring = starterRing;

    // Cho thêm 50 Huyết Đan và 50 Khí Hoàn, 5 Bí Tịch vào túi đồ
    this.inventory.push({ itemId: 'item_5', count: 50, type: 'consumable' });
    this.inventory.push({ itemId: 'item_6', count: 50, type: 'consumable' });
    this.inventory.push({ itemId: 'item_7', count: 5, type: 'scripture' });

    // Tặng thêm các vật phẩm mới:
    // 10 Giám Định Phù, 20 Đá Cường Hóa, 5 Bùa Bảo Hộ, 5 Đá Đục Lỗ
    this.inventory.push({ itemId: 'item_appraisal', count: 10, type: 'appraisal_scroll', name: 'Thiên Nhãn Giám Định Phù', icon: 'item_appraisal.png' });
    this.inventory.push({ itemId: 'item_enhance_stone', count: 20, type: 'enhance_stone', name: 'Thiên Cương Cường Hóa Thạch', icon: 'item_enhance_stone.png' });
    this.inventory.push({ itemId: 'item_protection_charm', count: 5, type: 'protection_charm', name: 'Thiên Mệnh Hộ Thân Phù', icon: 'item_protection_charm.png' });
    this.inventory.push({ itemId: 'item_socket_drill', count: 5, type: 'socket_drill', name: 'Kim Cương Tạc Khảm Thạch', icon: 'item_socket_drill.png' });

    // Tặng 3 viên Hồng Ngọc Cấp 1 để thử nghiệm ghép ngọc
    this.inventory.push({ 
      itemId: 'gem_ruby_1', 
      gemKey: 'ruby', 
      gemLevel: 1, 
      count: 3, 
      type: 'gem', 
      name: 'Hồng Ngọc Cấp I', 
      icon: 'gem_ruby.png',
      statKey: 'power',
      statVal: 30,
      statDesc: 'Ngoại Công +30'
    });

    // Tặng 1 thanh kiếm BẠCH KIM CHÍ TÔN vào túi để người chơi chiêm ngưỡng!
    const platSword = generateEquipment('wpn_sword', 'platinum', 1, null, true);
    this.inventory.push(platSword);

    this.reindexInventory();
  }
  
  reindexInventory() {
    this.inventory.forEach((item, idx) => {
      item.invSlot = idx;
      // Khôi phục slot trang bị nếu vô tình bị biến thành số
      if (item.type === 'equipment' && (typeof item.slot === 'number' || !item.slot)) {
        const tmpl = ITEM_TEMPLATES[item.templateKey];
        if (tmpl && tmpl.slot) item.slot = tmpl.slot;
      }
    });
  }
  
  // TÍNH TOÁN THUỘC TÍNH TỔNG HỢP TỪ TRANG BỊ & KINH MẠCH & TIỀM NĂNG & KHẢM NGỌC & SET BONUS
  getEquipBonus() {
    const bonus = { power: 0, def: 0, hp: 0, mp: 0, crit: 0, dodge: 0, speed: 0, lifeSteal: 0, critDmg: 0, reflect: 0, tuviBoost: 0, cooldownReduction: 0 };
    for (const item of Object.values(this.equipment)) {
      if (!item) continue;
      // Cộng chỉ số cơ bản
      if (item.baseStats) {
        if (item.baseStats.power) bonus.power += item.baseStats.power;
        if (item.baseStats.def) bonus.def += item.baseStats.def;
        if (item.baseStats.hp) bonus.hp += item.baseStats.hp;
        if (item.baseStats.mp) bonus.mp += item.baseStats.mp;
        if (item.baseStats.crit) bonus.crit += item.baseStats.crit;
        if (item.baseStats.dodge) bonus.dodge += item.baseStats.dodge;
        if (item.baseStats.speed) bonus.speed += item.baseStats.speed;
      }
      // Cộng các dòng phụ ngẫu nhiên
      if (item.affixes) {
        for (const aff of item.affixes) {
          if (bonus[aff.key] !== undefined) {
            bonus[aff.key] += aff.val;
          }
        }
      }
      // Cộng chỉ số từ các lỗ ngọc khảm (Gem Sockets)
      if (item.sockets) {
        for (const sock of item.sockets) {
          if (sock.gem && sock.gem.statKey) {
            if (bonus[sock.gem.statKey] !== undefined) {
              bonus[sock.gem.statKey] += sock.gem.statVal;
            }
          }
        }
      }
    }

    // KÍCH HOẠT HIỆU ỨNG 3 BỘ TRANG BỊ VÕ LÂM & 4 ĐẠI BỘ TU TIÊN (SET EQUIPMENT BONUS: 2/4/6 món)
    const setCount = {};
    for (const item of Object.values(this.equipment)) {
      if (item) {
        const setId = item.setId || item.set;
        if (setId) {
          setCount[setId] = (setCount[setId] || 0) + 1;
        }
      }
    }
    // Set thường
    for (const [setId, cnt] of Object.entries(setCount)) {
      const setDef = SET_BONUSES[setId];
      if (setDef && setDef.bonuses) {
        for (const [reqThreshold, bDef] of Object.entries(setDef.bonuses)) {
          if (cnt >= Number(reqThreshold)) {
            for (const [k, v] of Object.entries(bDef.stats)) {
              if (bonus[k] !== undefined) {
                bonus[k] += v;
              }
            }
          }
        }
      }
      // Set Tu Tiên
      const cSetDef = CULTIVATION_SETS[setId];
      if (cSetDef) {
        if (cnt >= 2 && cSetDef.bonus2) {
          for (const [k, v] of Object.entries(cSetDef.bonus2)) {
            if (typeof v === 'number') bonus[k] = (bonus[k] || 0) + v;
          }
        }
        if (cnt >= 4 && cSetDef.bonus4) {
          for (const [k, v] of Object.entries(cSetDef.bonus4)) {
            if (typeof v === 'number') bonus[k] = (bonus[k] || 0) + v;
          }
        }
        if (cnt >= 6 && cSetDef.bonus6) {
          for (const [k, v] of Object.entries(cSetDef.bonus6)) {
            if (typeof v === 'number') bonus[k] = (bonus[k] || 0) + v;
          }
          bonus.immortalAura = true;
        }
      }
    }

    // CỘNG DỒN CHỈ SỐ CẢNH GIỚI TU TIÊN
    const realmDef = CULTIVATION_REALMS[this.realmIdx];
    if (realmDef) {
      bonus.hp += (realmDef.hpBonus || 0);
      bonus.power += (realmDef.atkBonus || 0);
      bonus.cooldownReduction = (bonus.cooldownReduction || 0) + (realmDef.cdrBonus || 0);
    }

    // CỘNG DỒN BỊ ĐỘNG MÔN PHÁI TU TIÊN
    if (this.cultivSect && CULTIVATION_SECTS[this.cultivSect]) {
      const cPassives = CULTIVATION_SECTS[this.cultivSect].passives || {};
      if (cPassives.cdr) bonus.cooldownReduction = (bonus.cooldownReduction || 0) + cPassives.cdr;
      if (cPassives.power) bonus.power += cPassives.power;
      if (cPassives.hp) bonus.hp += cPassives.hp;
      if (cPassives.reflect) bonus.reflect = (bonus.reflect || 0) + cPassives.reflect;
      if (cPassives.lifeSteal) bonus.lifeSteal = (bonus.lifeSteal || 0) + cPassives.lifeSteal;
      if (cPassives.crit) bonus.crit = (bonus.crit || 0) + cPassives.crit;
      if (cPassives.dodge) bonus.dodge = (bonus.dodge || 0) + cPassives.dodge;
      if (cPassives.speed) bonus.speed += cPassives.speed;
    }

    bonus.activeSets = setCount;
    return bonus;
  }
  
  // TÍNH TOÁN THUỘC TÍNH TỪ DANH HIỆU ĐANG KÍCH HOẠT
  getTitleBonus() {
    if (!this.activeTitle || !TITLES[this.activeTitle]) {
      return { power: 0, hp: 0, def: 0, crit: 0, speed: 0, dodge: 0, critDmg: 0, lifeSteal: 0, reflect: 0 };
    }
    const st = TITLES[this.activeTitle].stats || {};
    return {
      power: st.power || 0,
      hp: st.hp || 0,
      def: st.def || 0,
      crit: st.crit || 0,
      speed: st.speed || 0,
      dodge: st.dodge || 0,
      critDmg: st.critDmg || 0,
      lifeSteal: st.lifeSteal || 0,
      reflect: st.reflect || 0
    };
  }

  // KIỂM TRA MỞ KHÓA DANH HIỆU THEO CẤP ĐỘ (12 ĐẠI DANH HIỆU CẢNH GIỚI)
  checkTitleUnlocks() {
    let newlyUnlocked = [];
    if (!this.unlockedTitles) this.unlockedTitles = ['title_1'];
    for (const [tId, tDef] of Object.entries(TITLES)) {
      if (!tDef.isRankTitle && this.level >= (tDef.levelReq || 1) && !this.unlockedTitles.includes(tId)) {
        this.unlockedTitles.push(tId);
        newlyUnlocked.push(tDef);
      }
    }
    return newlyUnlocked;
  }

  // ĐỒNG BỘ DANH HIỆU BẢNG XẾP HẠNG TOÀN SERVER (TOP 1 - TOP 10)
  updateServerRank(rank) {
    this.serverRank = rank;
    if (!this.unlockedTitles) this.unlockedTitles = ['title_1'];

    // Dọn dẹp danh hiệu rank không còn phù hợp
    for (let r = 1; r <= 10; r++) {
      const rId = `title_rank_${r}`;
      if (r !== rank) {
        const idx = this.unlockedTitles.indexOf(rId);
        if (idx !== -1) this.unlockedTitles.splice(idx, 1);
        if (this.activeTitle === rId) {
          this.activeTitle = 'title_1';
        }
      }
    }

    // Nếu lọt vào Top 10, mở khóa danh hiệu rank tương ứng
    if (rank >= 1 && rank <= 10) {
      const targetRankTitle = `title_rank_${rank}`;
      if (!this.unlockedTitles.includes(targetRankTitle)) {
        this.unlockedTitles.unshift(targetRankTitle);
      }
      // Tự động trang bị nếu là Top 1 hoặc đang dùng danh hiệu sơ khởi/rank cũ
      if (rank === 1 || !this.activeTitle || this.activeTitle === 'title_1' || this.activeTitle.startsWith('title_rank_')) {
        this.activeTitle = targetRankTitle;
      }
    }
  }

  // THAY ĐỔI DANH HIỆU ĐANG ĐEO
  setActiveTitle(titleId) {
    this.checkTitleUnlocks();
    if (!TITLES[titleId]) return { success: false, msg: 'Danh hiệu không tồn tại trong Cửu Châu!' };
    if (!this.unlockedTitles.includes(titleId)) {
      const tDef = TITLES[titleId];
      if (tDef.isRankTitle) {
        return { success: false, msg: `Cần đạt Top ${tDef.rank} Bảng Xếp Hạng Lực Chiến Toàn Server để kích hoạt danh hiệu này!` };
      }
      return { success: false, msg: `Chưa mở khóa danh hiệu [${TITLES[titleId].name}]! Cần đạt cấp độ ${TITLES[titleId].levelReq}.` };
    }
    this.activeTitle = titleId;
    this.hp = Math.min(this.hp, this.getMaxHp());
    this.mp = Math.min(this.mp, this.getMaxMp());
    return { 
      success: true, 
      activeTitle: this.activeTitle, 
      titleDef: TITLES[titleId],
      combatPower: this.getCombatPower()
    };
  }

  // CÀI ĐẶT BỘ LỌC TỰ NHẶT ĐỒ
  setLootFilter(config) {
    if (!this.lootFilter) {
      this.lootFilter = { minRarity: 'common', allowEquip: true, allowPotion: true, allowGemCharm: true };
    }
    if (config) {
      if (config.minRarity !== undefined) this.lootFilter.minRarity = config.minRarity;
      if (config.allowEquip !== undefined) this.lootFilter.allowEquip = !!config.allowEquip;
      if (config.allowPotion !== undefined) this.lootFilter.allowPotion = !!config.allowPotion;
      if (config.allowGemCharm !== undefined) this.lootFilter.allowGemCharm = !!config.allowGemCharm;
    }
    return { success: true, lootFilter: this.lootFilter };
  }

  // KIỂM TRA VẬT PHẨM RƠI CÓ THỎA MÃN BỘ LỌC NHẶT ĐỒ
  canLootItem(drop) {
    if (!drop) return false;
    if (!this.lootFilter) return true;
    
    const rOrder = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6, celestial: 7, abyssal: 8, platinum: 9 };
    
    if (drop.isEquipment) {
      if (!this.lootFilter.allowEquip) return false;
      const dropVal = rOrder[drop.rarity] || 1;
      const filterVal = rOrder[this.lootFilter.minRarity] || 1;
      return dropVal >= filterVal;
    } else {
      const isPotion = drop.itemId === 'item_5' || drop.itemId === 'item_6';
      if (isPotion) return !!this.lootFilter.allowPotion;
      return !!this.lootFilter.allowGemCharm;
    }
  }
  
  getMaxHp() {
    const eq = this.getEquipBonus();
    const tb = this.getTitleBonus();
    const vitBonus = this.stats.vit * 32;
    const meridianBonus = this.meridians.nhamMach * 180;
    let passiveHp = 0;
    if (this.sect === 'shaolin' && this.skillLevels.sl_passive_1) {
      passiveHp = this.skillLevels.sl_passive_1 * SKILLS.sl_passive_1.hpBonusPerLevel;
    }
    return Math.floor(this.baseMaxHp + (this.level - 1) * 80 + vitBonus + meridianBonus + eq.hp + tb.hp + passiveHp);
  }
  
  getMaxMp() {
    const eq = this.getEquipBonus();
    const engBonus = this.stats.eng * 25;
    let passiveMp = 0;
    if (this.sect === 'wudang' && this.skillLevels.wd_passive_1) {
      passiveMp = this.skillLevels.wd_passive_1 * SKILLS.wd_passive_1.mpBonusPerLevel;
    }
    return Math.floor(this.baseMaxMp + (this.level - 1) * 50 + engBonus + eq.mp + passiveMp);
  }
  
  getAttack() {
    const eq = this.getEquipBonus();
    const tb = this.getTitleBonus();
    let passiveBonus = 0;
    if (this.sect === 'huashan' && this.skillLevels.hs_passive_1) {
      passiveBonus = this.skillLevels.hs_passive_1 * SKILLS.hs_passive_1.atkBonusPerLevel;
    } else if (this.sect === 'wudang' && this.skillLevels.wd_passive_1) {
      passiveBonus = this.skillLevels.wd_passive_1 * SKILLS.wd_passive_1.atkBonusPerLevel;
    }
    const strBonus = this.stats.str * 2.5;
    const meridianBonus = this.meridians.docMach * 24;
    return Math.floor(this.baseAttack + (this.level - 1) * 16 + strBonus + meridianBonus + passiveBonus + eq.power + tb.power);
  }
  
  getDefense() {
    const eq = this.getEquipBonus();
    const tb = this.getTitleBonus();
    let passiveDef = 0;
    if (this.sect === 'shaolin' && this.skillLevels.sl_passive_1) {
      passiveDef = this.skillLevels.sl_passive_1 * SKILLS.sl_passive_1.defBonusPerLevel;
    }
    const vitDef = this.stats.vit * 1.6;
    const engDef = this.stats.eng * 1.0;
    const meridianDef = this.meridians.nhamMach * 12;
    return Math.floor(this.baseDef + (this.level - 1) * 9 + vitDef + engDef + meridianDef + eq.def + tb.def + passiveDef);
  }
  
  getCritRate() {
    const eq = this.getEquipBonus();
    const tb = this.getTitleBonus();
    let passiveCrit = 0;
    if (this.sect === 'huashan' && this.skillLevels.hs_passive_1) {
      passiveCrit = this.skillLevels.hs_passive_1 * SKILLS.hs_passive_1.critBonusPerLevel;
    }
    const agiCrit = this.stats.agi * 0.0035;
    const meridianCrit = this.meridians.xungMach * 0.03;
    return Math.min(0.95, this.baseCrit + agiCrit + meridianCrit + passiveCrit + eq.crit + tb.crit);
  }
  
  getDodgeRate() {
    const eq = this.getEquipBonus();
    const tb = this.getTitleBonus();
    let passiveDodge = 0;
    if (this.sect === 'xiaoyao' && this.skillLevels.xy_passive_1) {
      passiveDodge = this.skillLevels.xy_passive_1 * SKILLS.xy_passive_1.dodgeBonusPerLevel;
    }
    const agiDodge = this.stats.agi * 0.0025;
    const meridianDodge = this.meridians.doiMach * 0.02;
    return Math.min(0.75, this.baseDodge + agiDodge + meridianDodge + passiveDodge + eq.dodge + tb.dodge);
  }
  
  getMoveSpeed() {
    if (this.isDashing) return this.dashSpeed;
    if (this.isMeditating) return 0;
    const eq = this.getEquipBonus();
    const tb = this.getTitleBonus();
    let passiveSpeed = 0;
    if (this.sect === 'xiaoyao' && this.skillLevels.xy_passive_1) {
      passiveSpeed = this.skillLevels.xy_passive_1 * SKILLS.xy_passive_1.speedBonusPerLevel;
    }
    const agiSpeed = this.stats.agi * 1.5;
    const meridianSpeed = this.meridians.doiMach * 20;
    return Math.floor(this.speed + agiSpeed + meridianSpeed + passiveSpeed + eq.speed + tb.speed);
  }
  
  getCombatPower() {
    return Math.floor(
      this.getAttack() * 4.5 +
      this.getDefense() * 3.5 +
      this.getMaxHp() * 0.8 +
      this.getCritRate() * 2500 +
      this.getDodgeRate() * 1800 +
      (this.stats.str + this.stats.vit + this.stats.agi + this.stats.eng) * 18 +
      this.level * 180
    );
  }
  
  get realm() {
    return this.getRealmName();
  }

  getRealmName() {
    return REALMS[Math.min(this.realmIdx, REALMS.length - 1)];
  }

  // THÊM ĐIỂM TU VI (CÓ HƯỞNG BUFF TỪ TRANG BỊ VÀ SET TU TIÊN)
  addTuvi(amount) {
    if (this.isDeadPerm) return 0;
    const bonus = this.getEquipBonus();
    const rate = 1 + (bonus.tuviBoost || 0);
    const gained = Math.round(amount * rate);
    this.tuvi += gained;
    return gained;
  }

  // CƠ CHẾ THỌ NGUYÊN (MỖI 60 GIÂY = 1 NĂM TUỔI THỌ)
  tickLifespan() {
    if (this.isDeadPerm) return { isDeadPerm: true, alreadyReported: true };
    const now = Date.now();
    if (now - this.lastAgeTick >= 60000) {
      this.lastAgeTick = now;
      this.age += 1;
      
      // KIỂM TRA HẾT THỌ NGUYÊN -> HÓA ĐẠO QUY KHƯ (PERMADEATH)
      if (this.age >= this.maxLifespan) {
        this.isDeadPerm = true;
        this.hp = 0;
        return { 
          isDeadPerm: true, 
          alreadyReported: false,
          msg: `【THỌ CHUNG CHÍNH TẨM】 Huynh đài đã tận số thọ nguyên (${this.maxLifespan} năm) mà chưa kịp Đột Phá cảnh giới cao hơn! Thân tiêu đạo vẫn, hóa thành tro bụi cõi hồng hoang!` 
        };
      }
    }
    return { isDeadPerm: false, alreadyReported: false, age: this.age, maxLifespan: this.maxLifespan };
  }

  // ĐỘT PHÁ CẢNH GIỚI TU TIÊN
  breakthrough() {
    if (this.isDeadPerm) {
      return { success: false, msg: 'Ngươi đã tận số thọ nguyên hóa đạo, không thể tu hành nữa!' };
    }
    const curIdx = this.realmIdx;
    if (curIdx >= CULTIVATION_REALMS.length - 1) {
      return { success: false, msg: 'Đã đắc đạo phi thăng cảnh giới tối cao: Độ Kiếp Kiếm Tiên!' };
    }
    const nextRealm = CULTIVATION_REALMS[curIdx + 1];
    if (this.tuvi < nextRealm.reqTuvi) {
      return { 
        success: false, 
        msg: `Tu vi chưa đủ! Cần tích lũy ${nextRealm.reqTuvi.toLocaleString()} Tu Vi (Hiện có: ${this.tuvi.toLocaleString()})!` 
      };
    }

    // Đột phá cảnh giới lớn có cần Đan Dược
    let successRate = 1.0;
    let usedPill = false;
    if (nextRealm.breakPill) {
      const pillIdx = this.inventory.findIndex(i => i.itemId === 'item_breakthrough_pill' && i.count > 0);
      if (pillIdx !== -1) {
        this.inventory[pillIdx].count--;
        if (this.inventory[pillIdx].count <= 0) this.inventory.splice(pillIdx, 1);
        this.reindexInventory();
        usedPill = true;
        successRate = 1.0;
      } else {
        successRate = 0.65; // Không có đan thì 65% thành công
      }
    }

    const roll = Math.random();
    if (roll > successRate) {
      const lostTuvi = Math.floor(nextRealm.reqTuvi * 0.25);
      this.tuvi = Math.max(0, this.tuvi - lostTuvi);
      return { 
        success: false, 
        msg: `Đột phá gặp tâm ma phản phệ thất bại! Tiêu hao ${lostTuvi.toLocaleString()} Tu Vi dưỡng thương. Khuyên huynh đài nên tìm Cửu Chuyển Đột Phá Đan để hộ mạch!` 
      };
    }

    // ĐỘT PHÁ THÀNH CÔNG!
    this.tuvi -= nextRealm.reqTuvi;
    this.realmIdx += 1;
    if (this.level >= 30) {
      this.maxLifespan = Math.max(this.maxLifespan, nextRealm.maxLifespan || 100);
    } else {
      this.maxLifespan = 100; // Trước Lv.30 vẫn là phàm nhân thân cốt, thọ mệnh cố định 100 năm!
    }
    this.hp = this.getMaxHp();
    this.mp = this.getMaxMp();

    const lifeNotice = this.level >= 30 
      ? ` Thọ nguyên tăng lên ${this.maxLifespan} năm,` 
      : ' (Đạt Cấp 30 sẽ mở khóa thọ mệnh trường sinh theo cảnh giới),';

    return {
      success: true,
      newRealm: nextRealm.name,
      realmIdx: this.realmIdx,
      maxLifespan: this.maxLifespan,
      usedPill,
      msg: `Chúc mừng huynh đài đã đốn ngộ lôi kiếp, thành công đột phá lên 【${nextRealm.name}】!${lifeNotice} chiến lực vọt tiến phi thường!`
    };
  }

  // ĐỔI MÔN PHÁI TU TIÊN (CẤP 30 TRỞ LÊN)
  changeCultivSect(sectKey) {
    if (this.level < 30) {
      return { success: false, msg: 'Cần đạt Cấp 30 trở lên mới có thể lĩnh ngộ Tiên Đạo chuyển phái Tu Tiên!' };
    }
    const def = CULTIVATION_SECTS[sectKey];
    if (!def) return { success: false, msg: 'Môn phái Tu Tiên không tồn tại!' };

    this.cultivSect = sectKey;
    this.cultivSkillLevels = {};
    for (const sk of def.skills) {
      this.cultivSkillLevels[sk.id] = 1;
    }

    return {
      success: true,
      cultivSect: sectKey,
      sectName: def.name,
      skills: def.skills,
      msg: `Huynh đài đã gia nhập môn hạ 【${def.name}】 (${def.type})! Lĩnh ngộ 4 đại tuyệt kỹ thần thông tiên đạo!`
    };
  }

  // LƯU TRỮ VÀ NẠP DỮ LIỆU NHÂN VẬT (PERSISTENT DB)
  serialize() {
    return {
      id: this.charId || this.id,
      name: this.name,
      sect: this.sect,
      cultivSect: this.cultivSect,
      cultivSkillLevels: this.cultivSkillLevels,
      currentMap: this.currentMap,
      x: Math.round(this.x),
      y: Math.round(this.y),
      level: this.level,
      exp: this.exp,
      expNext: this.expNext,
      realm: this.getRealmName(),
      realmIdx: this.realmIdx,
      combatPower: this.getCombatPower(),
      tuvi: this.tuvi,
      age: this.age,
      maxLifespan: this.maxLifespan,
      isDeadPerm: this.isDeadPerm,
      statPoints: this.statPoints,
      stats: this.stats,
      skillPoints: this.skillPoints,
      skillLevels: this.skillLevels,
      meridianPoints: this.meridianPoints,
      meridians: this.meridians,
      gold: this.gold,
      equipment: this.equipment,
      inventory: this.inventory,
      luckySpins: this.luckySpins,
      activeTitle: this.activeTitle,
      unlockedTitles: this.unlockedTitles,
      lootFilter: this.lootFilter
    };
  }

  loadSavedState(data) {
    if (!data) return;
    if (data.id) this.charId = data.id;
    if (data.name) this.name = data.name;
    if (data.sect) this.sect = data.sect;
    if (data.cultivSect) this.cultivSect = data.cultivSect;
    if (data.cultivSkillLevels) this.cultivSkillLevels = data.cultivSkillLevels;
    if (data.currentMap) this.currentMap = data.currentMap;
    if (data.x) { this.x = data.x; this.targetX = data.x; }
    if (data.y) { this.y = data.y; this.targetY = data.y; }
    if (data.level) this.level = data.level;
    if (data.exp) this.exp = data.exp;
    if (data.expNext) this.expNext = data.expNext;
    if (data.realmIdx !== undefined) this.realmIdx = data.realmIdx;
    if (data.tuvi !== undefined) this.tuvi = data.tuvi;
    if (data.age !== undefined) this.age = data.age;
    
    // QUY TẮC THỌ NGUYÊN: DƯỚI CẤP 30 LÀ PHÀM NHÂN, THỌ MỆNH CỐ ĐỊNH 100 NĂM! CHỈ TỪ LV 30 MỚI ĐƯỢC TĂNG TUỔI THỌ!
    if (this.level >= 30) {
      const curRealm = CULTIVATION_REALMS[this.realmIdx];
      const baseRealmLife = curRealm ? curRealm.maxLifespan : 100;
      this.maxLifespan = Math.max(baseRealmLife, data.maxLifespan || 100);
    } else {
      this.maxLifespan = 100;
    }

    if (data.isDeadPerm !== undefined) this.isDeadPerm = data.isDeadPerm;
    if (data.statPoints !== undefined) this.statPoints = data.statPoints;
    if (data.stats) this.stats = data.stats;
    if (data.skillPoints !== undefined) this.skillPoints = data.skillPoints;
    if (data.skillLevels) this.skillLevels = data.skillLevels;
    if (data.meridianPoints !== undefined) this.meridianPoints = data.meridianPoints;
    if (data.meridians) this.meridians = data.meridians;
    if (data.gold != null) this.gold = Number(data.gold);
    else if (this.gold == null) this.gold = 5000;
    if (data.equipment) this.equipment = data.equipment;
    if (data.inventory) { this.inventory = data.inventory; this.reindexInventory(); }
    if (data.luckySpins !== undefined) this.luckySpins = data.luckySpins;
    if (data.activeTitle) this.activeTitle = data.activeTitle;
    if (data.unlockedTitles) this.unlockedTitles = data.unlockedTitles;
    if (data.lootFilter) this.lootFilter = data.lootFilter;

    this.hp = this.getMaxHp();
    this.mp = this.getMaxMp();
  }
  
  // CỘNG ĐIỂM TIỀM NĂNG
  allocateStat(statKey, amount = 1) {
    if (this.statPoints < amount) return { success: false, msg: 'Điểm tiềm năng không đủ!' };
    if (!['str', 'vit', 'agi', 'eng'].includes(statKey)) return { success: false, msg: 'Thuộc tính không hợp lệ!' };
    
    this.stats[statKey] += amount;
    this.statPoints -= amount;
    return { success: true, stats: this.stats, statPoints: this.statPoints };
  }
  
  resetStats() {
    const totalSpent = (this.stats.str - 15) + (this.stats.vit - 15) + (this.stats.agi - 15) + (this.stats.eng - 15);
    if (totalSpent <= 0) return { success: false, msg: 'Chưa có điểm tiềm năng nào được cộng để tẩy!' };
    if (this.gold < 10000) return { success: false, msg: 'Không đủ Ngân Lượng! Cần ít nhất 10,000 Bạc để tẩy tủy tái lập điểm tiềm năng!' };
    
    this.gold -= 10000;
    this.statPoints += totalSpent;
    this.stats = { str: 15, vit: 15, agi: 15, eng: 15 };
    return { 
      success: true, 
      msg: 'Đã tẩy tủy dịch cân thành công (tiêu hao 10,000 Ngân Lượng)!', 
      stats: this.stats, 
      statPoints: this.statPoints, 
      newGold: this.gold 
    };
  }
  
  // NÂNG CẤP KỸ NĂNG VÕ HỌC
  upgradeSkill(skillId) {
    if (this.skillPoints <= 0) return { success: false, msg: 'Điểm võ học không đủ, hãy luyện cấp để nhận thêm điểm!' };
    const curLvl = this.skillLevels[skillId] || 1;
    const def = SKILLS[skillId];
    if (!def) return { success: false, msg: 'Kỹ năng không tồn tại!' };
    if (curLvl >= def.maxLevel) return { success: false, msg: 'Kỹ năng đã đạt cấp tối đa!' };
    
    this.skillLevels[skillId] = curLvl + 1;
    this.skillPoints--;
    return { success: true, skillId, newLevel: this.skillLevels[skillId], skillPoints: this.skillPoints };
  }
  
  // ĐẢ THÔNG KINH MẠCH & ĐỘT PHÁ CẢNH GIỚI
  upgradeMeridian(meridianKey) {
    if (this.meridianPoints <= 0) return { success: false, msg: 'Điểm chân khí tu vi không đủ! Hãy dùng Thái Huyền Bí Tịch hoặc thiền định.' };
    if (this.meridians[meridianKey] === undefined) return { success: false, msg: 'Kinh mạch không tồn tại!' };
    if (this.meridians[meridianKey] >= 10) return { success: false, msg: 'Kinh mạch này đã đả thông đại viên mãn (Tầng 10)!' };
    
    this.meridians[meridianKey]++;
    this.meridianPoints--;
    
    // Kiểm tra Đột Phá Cảnh Giới: Cứ mỗi 2 điểm kinh mạch đả thông được thì đột phá 1 tầng cảnh giới!
    const totalPoints = Object.values(this.meridians).reduce((a, b) => a + b, 0);
    const expectedRealm = Math.min(REALMS.length - 1, Math.floor(totalPoints / 2));
    let realmUp = false;
    if (expectedRealm > this.realmIdx) {
      this.realmIdx = expectedRealm;
      realmUp = true;
    }
    
    return {
      success: true,
      meridians: this.meridians,
      meridianPoints: this.meridianPoints,
      realmUp,
      realmName: this.getRealmName()
    };
  }
  
  // TRANG BỊ
  equipItem(invIndex) {
    const item = this.inventory[invIndex];
    if (!item || item.type !== 'equipment') return false;
    if (item.unidentified) return false; // Không thể trang bị đồ chưa giám định
    
    let slot = item.slot;
    if (!slot || typeof slot === 'number') {
      const tmpl = ITEM_TEMPLATES[item.templateKey];
      slot = (tmpl && tmpl.slot) ? tmpl.slot : 'weapon';
      item.slot = slot;
    }

    const oldEquip = this.equipment[slot];
    this.equipment[slot] = item;
    
    if (oldEquip) {
      this.inventory[invIndex] = oldEquip;
    } else {
      this.inventory.splice(invIndex, 1);
    }
    this.reindexInventory();
    return true;
  }
  
  // THÁO TRANG BỊ
  unequipItem(slotType) {
    const item = this.equipment[slotType];
    if (!item) return false;
    if (this.inventory.length >= this.maxInventorySlots) return false;
    
    this.equipment[slotType] = null;
    this.inventory.push(item);
    this.reindexInventory();
    return true;
  }

  // TÍNH GIÁ BÁN TRANG BỊ & VẬT PHẨM RA NGÂN LƯỢNG (BẠC)
  getItemSellPrice(item) {
    if (!item) return 0;
    if (item.type === 'equipment') {
      const rarityPrices = {
        common: 120,
        uncommon: 280,
        rare: 650,
        epic: 1500,
        legendary: 3500,
        mythic: 8000,
        celestial: 18000,
        abyssal: 35000,
        platinum: 100000
      };
      const base = rarityPrices[item.rarity] || 120;
      const upgradeBonus = (item.upgradeLevel || 0) * 150;
      return base + upgradeBonus;
    }
    if (item.itemId === 'item_5' || item.itemId === 'item_6') return 10 * (item.count || 1);
    if (item.itemId === 'item_7') return 300 * (item.count || 1);
    if (item.itemId === 'item_appraisal') return 200 * (item.count || 1);
    if (item.itemId === 'item_enhance_stone') return 350 * (item.count || 1);
    if (item.itemId === 'item_protection_charm') return 1000 * (item.count || 1);
    if (item.type === 'gem') return 250 * (item.gemLevel || 1) * (item.count || 1);
    return 50;
  }

  // BÁN 1 MÓN ĐỒ TRONG TÚI
  sellItem(invIndex) {
    const item = this.inventory[invIndex];
    if (!item) return { success: false, msg: 'Vật phẩm không tồn tại!' };
    
    const price = this.getItemSellPrice(item);
    const itemName = item.name || (CONSUMABLE_ITEMS[item.itemId]?.name || 'Vật phẩm');
    this.gold += price;
    this.inventory.splice(invIndex, 1);
    this.reindexInventory();

    return { success: true, price, itemName, newGold: this.gold };
  }

  // BÁN TẤT CẢ ĐỒ RÁC (PHẨM CẤP TRẮNG VÀ LỤC)
  sellJunkItems() {
    let soldCount = 0;
    let totalSilver = 0;

    for (let i = this.inventory.length - 1; i >= 0; i--) {
      const it = this.inventory[i];
      if (it.type === 'equipment' && (it.rarity === 'common' || it.rarity === 'uncommon')) {
        const price = this.getItemSellPrice(it);
        totalSilver += price;
        soldCount++;
        this.inventory.splice(i, 1);
      }
    }

    if (soldCount === 0) {
      return { success: false, msg: 'Không có trang bị rác (Trắng / Lục) nào trong túi!' };
    }

    this.gold += totalSilver;
    this.reindexInventory();
    return { success: true, soldCount, totalSilver, newGold: this.gold };
  }

  // BÁN ĐỒ THEO TÙY CHỌN PHẨM CẤP (NGƯỜI CHƠI CHỦ ĐỘNG CHỌN DANH SÁCH PHẨM CẤP CẦN BÁN)
  sellByRarity(selectedRarities = ['common', 'uncommon']) {
    if (!Array.isArray(selectedRarities) || selectedRarities.length === 0) {
      return { success: false, msg: 'Chưa chọn phẩm cấp trang bị cần bán!' };
    }

    let soldCount = 0;
    let totalSilver = 0;

    for (let i = this.inventory.length - 1; i >= 0; i--) {
      const it = this.inventory[i];
      // Chỉ bán trang bị thuộc danh sách phẩm cấp đã chọn (không bán bùa, ngọc, đan dược)
      if (it && it.type === 'equipment' && selectedRarities.includes(it.rarity)) {
        const price = this.getItemSellPrice(it);
        totalSilver += price;
        soldCount++;
        this.inventory.splice(i, 1);
      }
    }

    if (soldCount === 0) {
      return { success: false, msg: 'Không tìm thấy trang bị nào thuộc các phẩm cấp đã chọn!' };
    }

    this.gold += totalSilver;
    this.reindexInventory();
    return { success: true, soldCount, totalSilver, newGold: this.gold };
  }
  
  // DÙNG VẬT PHẨM TIÊU HAO
  useItem(invIndex) {
    const item = this.inventory[invIndex];
    if (!item) return { success: false, msg: 'Vật phẩm không tồn tại!' };
    
    // Nếu là trang bị thì mặc vào người
    if (item.type === 'equipment') {
      if (item.unidentified) {
        return { success: false, msg: 'Trang bị này chưa được Giám Định! Hãy dùng Giám Định Phù trước khi mặc!' };
      }
      const ok = this.equipItem(invIndex);
      return { success: ok, type: 'equip' };
    }

    // Nếu bấm dùng trực tiếp Giám Định Phù
    if (item.itemId === 'item_appraisal' || item.type === 'appraisal_scroll') {
      const unidentIdx = this.inventory.findIndex(i => i.type === 'equipment' && i.unidentified);
      if (unidentIdx === -1) {
        return { success: false, msg: 'Không tìm thấy trang bị nào chưa giám định trong túi đồ!' };
      }
      return this.appraiseItem(unidentIdx);
    }
    
    // DÙNG CÁC LOẠI TIÊN ĐAN TU TIÊN
    if (item.itemId === 'item_tuvi_pill') {
      const added = this.addTuvi(5000);
      item.count--;
      if (item.count <= 0) this.inventory.splice(invIndex, 1);
      this.reindexInventory();
      return { 
        success: true, 
        type: 'tuvi', 
        added, 
        newTuvi: this.tuvi, 
        msg: `Dùng Cửu U Tu Vi Đan: Hấp thu ${added.toLocaleString()} Điểm Tu Vi Tiên Đạo!` 
      };
    }

    if (item.itemId === 'item_lifespan_pill') {
      if (this.level < 30) {
        return { 
          success: false, 
          msg: 'Huynh đài còn ở phàm thể (dưới Cấp 30), phàm nhân thân cốt chưa khai mở tiên căn, không thể nạp tiên đan diên thọ! Hãy đạt Cấp 30 phi thăng mới có thể dùng!' 
        };
      }
      this.maxLifespan += 5;
      this.age = Math.max(18, this.age - 3);
      item.count--;
      if (item.count <= 0) this.inventory.splice(invIndex, 1);
      this.reindexInventory();
      return { 
        success: true, 
        type: 'lifespan', 
        maxLifespan: this.maxLifespan, 
        age: this.age,
        msg: `Dùng Trường Sinh Thọ Nguyên Đan: Kéo dài thêm +5 năm thọ mệnh tiên lộ (Tối đa: ${this.maxLifespan} năm), cải lão hoàn đồng giảm 3 tuổi!` 
      };
    }

    if (item.itemId === 'item_breakthrough_pill') {
      return { 
        success: false, 
        msg: 'Cửu Chuyển Đột Phá Đan được tự động kích hoạt khi Huynh Đài tiến hành Đột Phá Cảnh Giới (phím Y) để hộ mạch 100% thành công!' 
      };
    }

    if (item.itemId === 'item_gold_ingot') {
      const gVal = (item.goldValue || 1500) * (item.count || 1);
      this.gold += gVal;
      this.inventory.splice(invIndex, 1);
      this.reindexInventory();
      return { 
        success: true, 
        type: 'gold', 
        newGold: this.gold, 
        msg: `Mở Bọc Ngân Lượng Tiền Bối: Thu được +${gVal.toLocaleString()} Bạc!` 
      };
    }

    const def = CONSUMABLE_ITEMS[item.itemId];
    if (!def) return { success: false, msg: 'Không thể sử dụng vật phẩm này!' };
    
    if (def.type === 'consumable') {
      let healedHp = 0, healedMp = 0;
      if (def.healHp) {
        const oldHp = this.hp;
        this.hp = Math.min(this.getMaxHp(), this.hp + def.healHp);
        healedHp = Math.round(this.hp - oldHp);
      }
      if (def.healMp) {
        const oldMp = this.mp;
        this.mp = Math.min(this.getMaxMp(), this.mp + def.healMp);
        healedMp = Math.round(this.mp - oldMp);
      }
      item.count--;
      if (item.count <= 0) this.inventory.splice(invIndex, 1);
      this.reindexInventory();
      return { success: true, type: 'heal', healedHp, healedMp, hp: this.hp, mp: this.mp };
    }
    
    if (def.type === 'scripture') {
      this.meridianPoints += 4;
      this.skillPoints += 2;
      this.addExp(def.realmPoints);
      item.count--;
      if (item.count <= 0) this.inventory.splice(invIndex, 1);
      this.reindexInventory();
      return { success: true, type: 'realm', meridianPoints: this.meridianPoints, skillPoints: this.skillPoints };
    }
    
    return { success: false };
  }

  // 1. GIÁM ĐỊNH TRANG BỊ
  appraiseItem(invIndex) {
    const item = this.inventory[invIndex];
    if (!item || item.type !== 'equipment') return { success: false, msg: 'Vật phẩm không phải trang bị!' };
    if (!item.unidentified) return { success: false, msg: 'Trang bị này đã được giám định rồi!' };

    // Tìm Giám Định Phù trong túi
    const scrollIdx = this.inventory.findIndex(i => i.itemId === 'item_appraisal' || i.type === 'appraisal_scroll');
    if (scrollIdx === -1) {
      return { success: false, msg: 'Hành trang không có Thiên Nhãn Giám Định Phù!' };
    }

    // Trừ 1 bùa giám định
    this.inventory[scrollIdx].count--;
    if (this.inventory[scrollIdx].count <= 0) {
      this.inventory.splice(scrollIdx, 1);
    }

    const res = appraiseEquipment(item);
    this.reindexInventory();
    return res;
  }

  // 2. CƯỜNG HÓA TRANG BỊ (+1 ĐẾN +15) - HỖ TRỢ TRANG BỊ TU TIÊN
  enhanceItem(targetSlotOrInvIdx, isEquipped = false, useProtectionCharm = false) {
    let item = isEquipped ? this.equipment[targetSlotOrInvIdx] : this.inventory[targetSlotOrInvIdx];
    if (!item || (item.type !== 'equipment' && !item.isCultivGear)) {
      return { success: false, msg: 'Chỉ có thể cường hóa trang bị hoặc pháp bảo tu tiên!' };
    }
    if (item.unidentified) return { success: false, msg: 'Trang bị chưa giám định, không thể cường hóa!' };

    // Đồng bộ cấp độ cường hóa
    if (item.upgradeLevel === undefined && item.enhanceLevel !== undefined) {
      item.upgradeLevel = Number(item.enhanceLevel);
    }
    item.upgradeLevel = Number(item.upgradeLevel) || 0;
    item.enhanceLevel = item.upgradeLevel;

    if (item.upgradeLevel >= 15) return { success: false, msg: 'Trang bị đã đạt cấp cường hóa cực hạn (+15)!' };

    // Chi phí Bạc
    const cost = 500 * (item.upgradeLevel + 1);
    if (this.gold < cost) {
      return { success: false, msg: `Không đủ Ngân Lượng! Cần ít nhất ${cost} Bạc để cường hóa!` };
    }

    // Tìm Đá Cường Hóa
    const stoneIdx = this.inventory.findIndex(i => i.itemId === 'item_enhance_stone' || i.type === 'enhance_stone');
    if (stoneIdx === -1) {
      return { success: false, msg: 'Cần có Thiên Cương Cường Hóa Thạch để cường hóa!' };
    }

    // Kiểm tra Bùa Bảo Hộ nếu có dùng
    let charmIdx = -1;
    if (useProtectionCharm) {
      charmIdx = this.inventory.findIndex(i => i.itemId === 'item_protection_charm' || i.type === 'protection_charm');
      if (charmIdx === -1) {
        return { success: false, msg: 'Bạn không có Thiên Mệnh Hộ Thân Phù trong túi đồ!' };
      }
    }

    // Trừ Bạc & Đá Cường Hóa
    this.gold -= cost;
    this.inventory[stoneIdx].count--;
    if (this.inventory[stoneIdx].count <= 0) {
      this.inventory.splice(stoneIdx, 1);
    }

    // Trừ Bùa Bảo Hộ nếu dùng
    if (useProtectionCharm && charmIdx !== -1) {
      const cIdx = this.inventory.findIndex(i => i.itemId === 'item_protection_charm' || i.type === 'protection_charm');
      if (cIdx !== -1) {
        this.inventory[cIdx].count--;
        if (this.inventory[cIdx].count <= 0) {
          this.inventory.splice(cIdx, 1);
        }
      }
    }

    this.reindexInventory();
    const res = enhanceEquipment(item, useProtectionCharm);
    res.newGold = this.gold;
    return res;
  }

  // 3. ĐỤC LỖ TRANG BỊ
  socketItem(targetSlotOrInvIdx, isEquipped = false) {
    let item = isEquipped ? this.equipment[targetSlotOrInvIdx] : this.inventory[targetSlotOrInvIdx];
    if (!item || item.type !== 'equipment') return { success: false, msg: 'Vật phẩm không hợp lệ!' };

    if (item.sockets && item.sockets.length >= (item.maxSockets || 3)) {
      return { success: false, msg: `Trang bị này đã có tối đa ${item.maxSockets || 3} lỗ!` };
    }

    if (this.gold < 1000) {
      return { success: false, msg: 'Cần ít nhất 1,000 Ngân Lượng Bạc để thợ rèn đục lỗ!' };
    }

    const drillIdx = this.inventory.findIndex(i => i.itemId === 'item_socket_drill' || i.type === 'socket_drill');
    if (drillIdx === -1) {
      return { success: false, msg: 'Cần có Kim Cương Tạc Khảm Thạch để đục thêm lỗ ngọc!' };
    }

    this.gold -= 1000;
    this.inventory[drillIdx].count--;
    if (this.inventory[drillIdx].count <= 0) {
      this.inventory.splice(drillIdx, 1);
    }
    this.reindexInventory();

    const res = socketEquipment(item);
    res.newGold = this.gold;
    return res;
  }

  // 4. KHẢM NGỌC
  embedGemItem(targetSlotOrInvIdx, isEquipped, socketIdx, gemInvIdx) {
    let item = isEquipped ? this.equipment[targetSlotOrInvIdx] : this.inventory[targetSlotOrInvIdx];
    if (!item || item.type !== 'equipment') return { success: false, msg: 'Vật phẩm không hợp lệ!' };

    const gemItem = this.inventory[gemInvIdx];
    if (!gemItem || (gemItem.type !== 'gem' && (!gemItem.itemId || !gemItem.itemId.startsWith('gem_')))) {
      return { success: false, msg: 'Hãy chọn một viên Ngọc Khảm hợp lệ!' };
    }

    const res = embedGem(item, socketIdx, gemItem);
    if (res.success) {
      gemItem.count--;
      if (gemItem.count <= 0) {
        this.inventory.splice(gemInvIdx, 1);
      }
      this.reindexInventory();
      res.item = item;
    }
    return res;
  }

  // 5. THÁO NGỌC
  removeGemItem(targetSlotOrInvIdx, isEquipped, socketIdx) {
    let item = isEquipped ? this.equipment[targetSlotOrInvIdx] : this.inventory[targetSlotOrInvIdx];
    if (!item || item.type !== 'equipment') return { success: false, msg: 'Vật phẩm không hợp lệ!' };

    if (this.gold < 200) {
      return { success: false, msg: 'Cần ít nhất 200 Ngân Lượng Bạc để thợ rèn tháo ngọc!' };
    }

    if (this.inventory.length >= this.maxInventorySlots) {
      return { success: false, msg: 'Hành trang 200 ô đã đầy! Không thể tháo ngọc!' };
    }

    const res = removeGem(item, socketIdx);
    if (res.success && res.removedGem) {
      this.gold -= 200;
      res.newGold = this.gold;
      res.item = item;

      const g = res.removedGem;
      const targetGemId = g.gemId || (g.gemKey && g.gemLevel ? `gem_${g.gemKey}_${g.gemLevel}` : 'gem_ruby_1');
      const ex = this.inventory.find(i => (g.gemId && i.itemId === g.gemId) || (g.gemKey && i.gemKey === g.gemKey && i.gemLevel === g.gemLevel) || i.itemId === targetGemId);
      if (ex) {
        ex.count = (ex.count || 1) + 1;
      } else {
        this.inventory.push({
          itemId: targetGemId,
          gemKey: g.gemKey,
          gemLevel: g.gemLevel || 1,
          name: g.name,
          icon: g.icon,
          type: 'gem',
          count: 1,
          statKey: g.statKey,
          statVal: g.statVal,
          statDesc: g.statDesc
        });
      }
      this.reindexInventory();
    }
    return res;
  }

  // 6. GHÉP 3 VIÊN NGỌC LÊN CẤP CAO HƠN
  combineGems(gemType, gemLevel) {
    const gemId = `gem_${gemType}_${gemLevel}`;
    const gem = this.inventory.find(i => i.itemId === gemId);
    if (!gem || gem.count < 3) {
      return { success: false, msg: `Cần ít nhất 3 viên ngọc cùng loại để tiến hành ghép!` };
    }

    const res = combineGems(gemType, gemLevel, gem.count);
    if (res.success && res.newGem) {
      gem.count -= 3;
      if (gem.count <= 0) {
        const idx = this.inventory.findIndex(i => i.itemId === gemId);
        if (idx !== -1) this.inventory.splice(idx, 1);
      }

      const nextGemId = res.newGem.id;
      const ex = this.inventory.find(i => i.itemId === nextGemId);
      if (ex) {
        ex.count++;
      } else {
        this.inventory.push({
          itemId: nextGemId,
          gemKey: res.newGem.gemKey,
          gemLevel: res.newGem.gemLevel,
          name: res.newGem.name,
          icon: res.newGem.icon,
          type: 'gem',
          count: 1,
          statKey: res.newGem.statKey,
          statVal: res.newGem.statVal,
          statDesc: res.newGem.statDesc
        });
      }
      this.reindexInventory();
    }
    return res;
  }
  
  // SẮP XẾP TÚI ĐỒ 200 Ô
  sortInventory() {
    const equips = [];
    const consumables = {};
    const others = [];
    
    for (const it of this.inventory) {
      if (it.type === 'equipment') {
        equips.push(it);
      } else if (it.type === 'consumable' || it.type === 'scripture' || it.type === 'gem' || it.type === 'enhance_stone' || it.type === 'appraisal_scroll' || it.type === 'protection_charm' || it.type === 'socket_drill') {
        consumables[it.itemId] = {
          count: (consumables[it.itemId]?.count || 0) + (it.count || 1),
          item: it
        };
      } else {
        others.push(it);
      }
    }
    
    // Xếp trang bị theo thứ tự phẩm cấp: Bạch Kim -> Ma Thần -> Thần Thoại -> Truyền Thuyết -> Hoàng Kim -> Sử Thi -> Lam -> Lục -> Trắng
    const rVal = { platinum: 9, abyssal: 8, celestial: 7, mythic: 6, legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
    equips.sort((a, b) => (rVal[b.rarity] || 0) - (rVal[a.rarity] || 0));
    
    const newInv = [...equips];
    for (const data of Object.values(consumables)) {
      const it = data.item;
      it.count = data.count;
      newInv.push(it);
    }
    others.forEach(o => newInv.push(o));
    
    this.inventory = newInv;
    this.reindexInventory();
    return this.inventory;
  }
  
  // LÊN CẤP
  addExp(amount) {
    this.exp += amount;
    let leveledUp = false;
    while (this.exp >= this.expNext) {
      this.exp -= this.expNext;
      this.level++;
      this.statPoints += 5;     // +5 điểm tiềm năng
      this.skillPoints += 2;    // +2 điểm võ học
      this.meridianPoints += 2; // +2 điểm chân khí
      this.expNext = Math.floor(this.expNext * 1.55);
      this.hp = this.getMaxHp();
      this.mp = this.getMaxMp();
      leveledUp = true;
    }
    if (leveledUp) {
      // QUY TẮC THỌ NGUYÊN: ĐẠT MỐC CẤP 30 MỚI THOÁT THAI HOÁN CỐT MỞ KHÓA THỌ NGUYÊN THEO CẢNH GIỚI!
      if (this.level >= 30) {
        const curRealmDef = CULTIVATION_REALMS[this.realmIdx];
        if (curRealmDef && curRealmDef.maxLifespan > this.maxLifespan) {
          this.maxLifespan = curRealmDef.maxLifespan;
        }
      } else {
        this.maxLifespan = 100;
      }
      this.checkTitleUnlocks();
    }
    return leveledUp;
  }
  
  toggleMeditation() {
    this.isMeditating = !this.isMeditating;
    if (this.isMeditating) {
      this.isMoving = false;
    }
    return this.isMeditating;
  }
  
  takeDamage(amount, isCrit = false) {
    if (this.isMeditating) this.isMeditating = false;
    
    if (Math.random() < this.getDodgeRate()) {
      return { damage: 0, dodged: true, isCrit: false, dead: false };
    }
    
    const def = this.getDefense();
    const reduction = def / (def + 350);
    let realDamage = Math.max(1, Math.floor(amount * (1 - reduction)));
    
    // Xử lý khiên hộ thể
    const now = Date.now();
    if (this.shield > 0 && now < this.shieldEndTime) {
      if (this.shield >= realDamage) {
        this.shield -= realDamage;
        realDamage = 0;
      } else {
        realDamage -= this.shield;
        this.shield = 0;
      }
    }

    // Xử lý Tọa Vong Vô Ngã (Võ Đang: dùng MP đỡ đòn)
    if (this.sect === 'wudang' && this.hasManaShield && this.mp > 0 && realDamage > 0) {
      const absorbed = Math.min(this.mp, Math.floor(realDamage * 0.7));
      this.mp -= absorbed;
      realDamage -= absorbed;
    }
    
    this.hp = Math.max(0, this.hp - realDamage);
    const dead = this.hp <= 0;
    return { damage: realDamage, dodged: false, isCrit, dead };
  }
  
  changeMap(newMapId, spawnX, spawnY) {
    this.currentMap = newMapId;
    this.x = spawnX;
    this.y = spawnY;
    this.targetX = spawnX;
    this.targetY = spawnY;
    this.isMoving = false;
    this.isDashing = false;
    this.isMeditating = false;
  }

  respawn(spawnX = 1400, spawnY = 700) {
    this.currentMap = 'lac_duong';
    this.x = spawnX;
    this.y = spawnY;
    this.targetX = spawnX;
    this.targetY = spawnY;
    this.hp = this.getMaxHp();
    this.mp = this.getMaxMp();
    this.isMoving = false;
    this.isMeditating = false;
    // Nếu hồi sinh sau khi permadeath (Trùng Sinh Tân Đời), hồi sinh lại thanh xuân
    if (this.isDeadPerm) {
      this.isDeadPerm = false;
      this.age = 18;
      this.lastAgeTick = Date.now();
      this.hasSpawnedRevenant = false;
    }
  }
  
  // 10 PHẦN THƯỞNG VÒNG QUAY BÁT QUÁI CỬU CHÂU (TƯƠNG ỨNG 10 Ô GÓC 36 ĐỘ)
  spinWheel() {
    if (this.luckySpins <= 0 && this.gold < 500) {
      return { success: false, msg: 'Đã hết lượt quay miễn phí và không đủ 500 Ngân Lượng để quay thêm!' };
    }

    let isFree = this.luckySpins > 0;
    if (isFree) {
      this.luckySpins--;
    } else {
      this.gold -= 500;
    }
    this.totalSpins++;

    const weights = [
      { slot: 0, weight: 12 },
      { slot: 1, weight: 14 },
      { slot: 2, weight: 16 },
      { slot: 3, weight: 15 },
      { slot: 4, weight: 10 },
      { slot: 5, weight: 16 },
      { slot: 6, weight: 6  },
      { slot: 7, weight: 6  },
      { slot: 8, weight: 3  },
      { slot: 9, weight: 2  }
    ];

    const totalWeight = weights.reduce((s, w) => s + w.weight, 0);
    let rand = Math.random() * totalWeight;
    let chosenSlot = 2;
    for (const w of weights) {
      if (rand <= w.weight) {
        chosenSlot = w.slot;
        break;
      }
      rand -= w.weight;
    }

    let reward = {};
    if (chosenSlot === 0) {
      const ring = generateEquipment('acc_ring', 'legendary', Math.max(5, this.level), null, true);
      this.inventory.push(ring);
      reward = { type: 'equip', name: ring.name, rarity: ring.rarity, desc: 'Trang bị Hoàng Kim Cực Phẩm!', item: ring };
    } else if (chosenSlot === 1) {
      const ex = this.inventory.find(i => i.itemId === 'item_7');
      if (ex) ex.count += 3;
      else this.inventory.push({ itemId: 'item_7', count: 3, type: 'scripture' });
      reward = { type: 'item', name: 'Thái Huyền Bí Tịch x3', desc: 'Bí kíp võ học ngàn năm!' };
    } else if (chosenSlot === 2) {
      const ex = this.inventory.find(i => i.itemId === 'item_5');
      if (ex) ex.count += 30;
      else this.inventory.push({ itemId: 'item_5', count: 30, type: 'consumable' });
      reward = { type: 'item', name: 'Cửu Chuyển Huyết Đan x30', desc: 'Hồi phục sinh lực lập tức!' };
    } else if (chosenSlot === 3) {
      this.gold += 5000;
      reward = { type: 'gold', name: '+5,000 Ngân Lượng Bạc', desc: 'Tài nguyên tu luyện dồi dào!' };
    } else if (chosenSlot === 4) {
      this.meridianPoints += 10;
      reward = { type: 'meridian', name: '+10 Điểm Chân Khí', desc: 'Đả thông kinh mạch, đột phá cảnh giới!' };
    } else if (chosenSlot === 5) {
      const ex = this.inventory.find(i => i.itemId === 'item_6');
      if (ex) ex.count += 30;
      else this.inventory.push({ itemId: 'item_6', count: 30, type: 'consumable' });
      reward = { type: 'item', name: 'Quy Nguyên Khí Hoàn x30', desc: 'Hồi phục chân khí dồi dào!' };
    } else if (chosenSlot === 6) {
      this.skillPoints += 5;
      reward = { type: 'skill', name: '+5 Điểm Võ Học', desc: 'Thăng cấp tuyệt kỹ môn phái!' };
    } else if (chosenSlot === 7) {
      this.statPoints += 8;
      reward = { type: 'stat', name: '+8 Điểm Tiềm Năng', desc: 'Gia tăng vĩnh viễn thuộc tính tự thân!' };
    } else if (chosenSlot === 8) {
      this.gold += 10000;
      reward = { type: 'gold', name: '+10,000 Ngân Lượng Bạc', desc: 'Đại tài phú giang hồ!' };
    } else if (chosenSlot === 9) {
      const platWpn = generateEquipment('wpn_sword', 'platinum', Math.max(10, this.level), null, true);
      this.inventory.push(platWpn);
      reward = { type: 'equip', name: platWpn.name, rarity: 'platinum', desc: '★ THẦN BINH BẠCH KIM CHÍ TÔN SIÊU PHẨM ★', item: platWpn };
    }

    this.reindexInventory();

    return {
      success: true,
      slot: chosenSlot,
      reward,
      luckySpins: this.luckySpins,
      gold: this.gold,
      isFree
    };
  }

  toClientState() {
    return {
      id: this.id,
      name: this.name,
      sect: this.sect,
      currentMap: this.currentMap,
      x: Math.round(this.x),
      y: Math.round(this.y),
      angle: Number(this.angle.toFixed(2)),
      level: this.level,
      exp: this.exp,
      expNext: this.expNext,
      hp: Math.round(this.hp),
      maxHp: this.getMaxHp(),
      mp: Math.round(this.mp),
      maxMp: this.getMaxMp(),
      realm: this.getRealmName(),
      realmIdx: this.realmIdx,
      combatPower: this.getCombatPower(),
      
      stats: this.stats,
      statPoints: this.statPoints,
      skillPoints: this.skillPoints,
      skillLevels: this.skillLevels,
      
      attack: this.getAttack(),
      defense: this.getDefense(),
      critRate: Math.round(this.getCritRate() * 100),
      dodgeRate: Math.round(this.getDodgeRate() * 100),
      speed: this.getMoveSpeed(),
      gold: this.gold,
      
      luckySpins: this.luckySpins,
      meridianPoints: this.meridianPoints,
      meridians: this.meridians,
      equipment: this.equipment,
      inventory: this.inventory,
      maxInventorySlots: this.maxInventorySlots,
      
      isDashing: this.isDashing,
      isMeditating: this.isMeditating,
      isMoving: this.isMoving,
      hasShield: this.shield > 0 && Date.now() < this.shieldEndTime,
      hasReflect: this.reflectActive && Date.now() < this.reflectEndTime,

      // Danh hiệu võ lâm & Bộ lọc nhặt đồ
      activeTitle: this.activeTitle,
      activeTitleInfo: TITLES[this.activeTitle] || null,
      unlockedTitles: this.unlockedTitles,
      allTitles: TITLES,
      lootFilter: this.lootFilter,

      // HỆ THỐNG TU TIÊN & THỌ NGUYÊN (PERMADEATH)
      charId: this.charId,
      username: this.username,
      tuvi: this.tuvi,
      reqTuvi: CULTIVATION_REALMS[this.realmIdx + 1] ? CULTIVATION_REALMS[this.realmIdx + 1].reqTuvi : 0,
      age: this.age,
      maxLifespan: this.maxLifespan,
      isDeadPerm: this.isDeadPerm,
      cultivSect: this.cultivSect,
      cultivSectData: this.cultivSect ? CULTIVATION_SECTS[this.cultivSect] : null,
      cultivSkillLevels: this.cultivSkillLevels,
      cooldownReduction: Number(((this.getEquipBonus().cooldownReduction || 0) * 100).toFixed(1)),
      tuviBoost: Number(((this.getEquipBonus().tuviBoost || 0) * 100).toFixed(1)),
      allCultivRealms: CULTIVATION_REALMS,
      allCultivSects: CULTIVATION_SECTS,
      allCultivSets: CULTIVATION_SETS
    };
  }
}

module.exports = { Player, REALMS };
