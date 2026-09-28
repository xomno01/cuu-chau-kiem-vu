const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../server/data/game_db.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

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

const slotBaseConfig = {
  weapon: {
    power: 29000,
    def: 6550,
    hp: 105000,
    mp: 34000,
    crit: 0.28,
    critDmg: 0.45
  },
  armor: {
    power: 8500,
    def: 24750,
    hp: 225000,
    mp: 42500,
    dodge: 0.14
  },
  helmet: {
    power: 10500,
    def: 18000,
    hp: 155000,
    mp: 36000,
    crit: 0.12
  },
  necklace: {
    power: 15250,
    def: 14500,
    hp: 132500,
    mp: 64000,
    dodge: 0.18,
    crit: 0.14
  },
  ring: {
    power: 22250,
    def: 10500,
    hp: 123000,
    crit: 0.25,
    critDmg: 0.40,
    lifeSteal: 0.08
  },
  gloves: {
    power: 17250,
    def: 14750,
    hp: 132500,
    crit: 0.16,
    speed: 35
  },
  pants: {
    power: 9750,
    def: 21250,
    hp: 197500,
    mp: 34000
  },
  boots: {
    power: 9000,
    def: 15250,
    hp: 117500,
    speed: 95,
    dodge: 0.28
  },
  talisman: {
    power: 17750,
    def: 17750,
    hp: 167500,
    mp: 53000,
    crit: 0.16,
    dodge: 0.16
  }
};

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

function updateCultivItem(item) {
  if (!item || !item.isCultivGear) return;
  const slot = item.slot;
  if (slot && slotIcons[slot]) {
    item.icon = slotIcons[slot];
  }
  const cfg = slotBaseConfig[slot] || slotBaseConfig.weapon;
  item.baseStats = Object.assign(
    { power: 5000, def: 5000, hp: 60000, mp: 15000, crit: 0.08, dodge: 0.08, speed: 0 },
    cfg
  );
  if (!item.affixes || item.affixes.length < 4) {
    const shuffled = [...CULTIV_AFFIX_POOL].sort(() => 0.5 - Math.random());
    item.affixes = shuffled.slice(0, 5);
  }
  if (!item.upgradeLevel || item.upgradeLevel < 7) {
    item.upgradeLevel = 8;
    item.enhanceLevel = 8;
  }
  item.maxSockets = 4;
  if (!item.sockets || item.sockets.length < 2) {
    item.sockets = [
      { socketIdx: 0, gem: null },
      { socketIdx: 1, gem: null }
    ];
  }
}

let updatedCount = 0;
for (const user of Object.values(db.users || {})) {
  for (const char of Object.values(user.characters || {})) {
    // Check equipment
    for (const [slot, eq] of Object.entries(char.equipment || {})) {
      if (eq && eq.isCultivGear) {
        updateCultivItem(eq);
        updatedCount++;
      }
    }
    // Check inventory
    if (char.inventory && Array.isArray(char.inventory)) {
      char.inventory.forEach(item => {
        if (item && item.isCultivGear) {
          updateCultivItem(item);
          updatedCount++;
        }
        if (item && item.itemId === 'item_tuvi_pill') {
          item.icon = 'item_tuvi_pill.png';
        }
        if (item && item.itemId === 'item_lifespan_pill') {
          item.icon = 'item_lifespan_pill.png';
        }
        if (item && item.itemId === 'item_breakthrough_pill') {
          item.icon = 'item_breakthrough_pill.png';
        }
      });
    }
  }
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
console.log(`Successfully migrated ${updatedCount} cultivation items and all pills in game_db.json!`);
