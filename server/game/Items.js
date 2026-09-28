// Hệ thống Thần Binh, Bảo Giáp, Dược Phẩm, Bí Tịch - Cửu Châu Kiếm Vũ

const ITEMS = {
  item_1: {
    id: 'item_1',
    name: 'Ỷ Thiên Thần Kiếm',
    type: 'weapon',
    rarity: 'celestial', // common, rare, epic, celestial
    icon: 'item_1.png',
    powerBonus: 120,
    critBonus: 0.15,
    desc: 'Thần kiếm thượng cổ ngưng tụ thiên địa kiếm khí, tăng 120 Công lực và 15% Tỷ lệ Bạo kích.'
  },
  item_2: {
    id: 'item_2',
    name: 'Đồ Long Bảo Đao',
    type: 'weapon',
    rarity: 'celestial',
    icon: 'item_2.png',
    powerBonus: 135,
    hpBonus: 300,
    desc: 'Bảo đao chí tôn hiệu lệnh thiên hạ, chém sắt như chém bùn, tăng 135 Công lực và 300 Khí Huyết.'
  },
  item_3: {
    id: 'item_3',
    name: 'Thiên Long Bảo Giáp',
    type: 'armor',
    rarity: 'epic',
    icon: 'item_3.png',
    defBonus: 75,
    hpBonus: 500,
    desc: 'Chế tạo từ vảy kim long, đao thương bất nhập, tăng 75 Phòng ngự và 500 Khí Huyết.'
  },
  item_4: {
    id: 'item_4',
    name: 'Lăng Ba Phi Hài',
    type: 'boots',
    rarity: 'rare',
    icon: 'item_4.png',
    speedBonus: 50,
    dodgeBonus: 0.12,
    desc: 'Gia trì khinh công đạp tuyết vô ngân, tăng 50 Tốc độ di chuyển và 12% Né tránh.'
  },
  item_5: {
    id: 'item_5',
    name: 'Cửu Chuyển Huyết Đan',
    type: 'consumable',
    rarity: 'common',
    icon: 'item_5.png',
    healHp: 350,
    stackable: true,
    desc: 'Luyện chế từ ngàn năm huyết sâm, lập tức hồi phục 350 điểm Khí Huyết.'
  },
  item_6: {
    id: 'item_6',
    name: 'Quy Nguyên Khí Hoàn',
    type: 'consumable',
    rarity: 'common',
    icon: 'item_6.png',
    healMp: 200,
    stackable: true,
    desc: 'Ngưng tụ thiên địa linh khí, lập tức hồi phục 200 điểm Chân Khí Nội Lực.'
  },
  item_7: {
    id: 'item_7',
    name: 'Thái Huyền Bí Tịch',
    type: 'scripture',
    rarity: 'celestial',
    icon: 'item_7.png',
    realmPoints: 500,
    desc: 'Bí kíp võ học tuyệt thế khắc trên vách đá đảo Hiệp Khách, sử dụng nhận 500 điểm Đột phá Cảnh giới.'
  },
  item_8: {
    id: 'item_8',
    name: 'Cửu Châu Ngọc Bội',
    type: 'pendant',
    rarity: 'epic',
    icon: 'item_8.png',
    powerBonus: 45,
    defBonus: 40,
    hpBonus: 250,
    desc: 'Ngọc bội truyền thừa tổ sư, bảo hộ tâm mạch, tăng toàn diện các thuộc tính công thủ.'
  },
  item_9: {
    id: 'item_9',
    name: 'Kim Đĩnh Ngân Lượng',
    type: 'currency',
    rarity: 'rare',
    icon: 'item_9.png',
    goldValue: 1000,
    desc: 'Ngân lượng vàng nén giang hồ dùng để mua sắm, cường hóa thần binh bảo khí.'
  },
  item_lifespan_pill: {
    id: 'item_lifespan_pill',
    name: 'Trường Sinh Thọ Nguyên Đan',
    type: 'consumable',
    subType: 'lifespan',
    rarity: 'platinum',
    icon: 'item_lifespan_pill.png',
    stackable: true,
    lifespanGain: 5,
    desc: 'Luyện chế từ Bất Lão Tuyền, dùng lập tức tăng +5 năm thọ nguyên tối đa hoặc cải lão hoàn đồng!'
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
    desc: 'Hấp thu đan dược lập tức nhận +5,000 Điểm Tu Vi Tiên Đạo!'
  },
  item_breakthrough_pill: {
    id: 'item_breakthrough_pill',
    name: 'Cửu Chuyển Đột Phá Đan',
    type: 'consumable',
    subType: 'breakthrough',
    rarity: 'platinum',
    icon: 'item_breakthrough_pill.png',
    stackable: true,
    desc: 'Bảo đảm 100% tỷ lệ đột phá cảnh giới tu tiên kế tiếp!'
  },
  item_gold_ingot: {
    id: 'item_gold_ingot',
    name: 'Bọc Ngân Lượng Tiền Bối',
    type: 'currency',
    rarity: 'epic',
    icon: 'item_9.png',
    goldValue: 1500,
    stackable: true,
    desc: 'Kho báu ngân lượng rơi rớt từ tiền bối cường giả, nhận ngay 1,500 Bạc.'
  }
};

module.exports = { ITEMS };
