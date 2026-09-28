// Hệ Thống NPC Trong Thành Lạc Dương - Cửu Châu Kiếm Vũ V3
// Bổ sung Thợ Rèn Thiết Ngưu chuyên Cường Hóa, Đục Lỗ, Khảm Ngọc và Xa Phu 6 Map

const NPCS = {
  npc_blacksmith: {
    id: 'npc_blacksmith',
    name: 'Thiết Ngưu · Thần Đúc Thợ Rèn',
    title: 'Đệ Nhất Thợ Rèn Cửu Châu',
    mapId: 'lac_duong',
    x: 1150,
    y: 620,
    avatar: 'avatar_huashan.png',
    role: 'blacksmith',
    dialogue: 'Lão phu Thiết Ngưu đây! Cả đời rèn kiếm, chuyên Cường Hóa +1..+15, Đục Lỗ và Khảm Ngọc bảo thạch! Ngươi muốn nâng cấp thần binh nào?',
    actions: [
      { id: 'open_forge', name: '⚒ Mở Lò Rèn (Cường Hóa +1..+15 & Khảm Ngọc)', cost: 0, currency: 'Miễn Phí' },
      { id: 'buy_enhance_stone', name: '💎 Mua 5 Thiên Cương Cường Hóa Thạch', cost: 1500, currency: 'Bạc' },
      { id: 'buy_protection_charm', name: '🛡 Mua 1 Thiên Mệnh Hộ Thân Phù (Chống Tụt Cấp)', cost: 1200, currency: 'Bạc' },
      { id: 'buy_socket_drill', name: '🔩 Mua 1 Kim Cương Tạc (Đá Đục Lỗ)', cost: 800, currency: 'Bạc' },
      { id: 'buy_appraisal', name: '📜 Mua 5 Thiên Nhãn Giám Định Phù', cost: 800, currency: 'Bạc' }
    ]
  },
  npc_doctor: {
    id: 'npc_doctor',
    name: 'Tiết Mộ Hoa · Thần Y Dược Sư',
    title: 'Diêm Vương Địch',
    mapId: 'lac_duong',
    x: 1350,
    y: 560,
    avatar: 'avatar_xiaoyao.png',
    role: 'doctor',
    dialogue: 'Khí huyết là cội nguồn của võ học! Tại hạ có đan dược cứu thế giá bình dân, cần bốc bao nhiêu vị thuốc?',
    actions: [
      { id: 'buy_small_hp', name: '🌿 Mua 10 Tiểu Huyết Đan (Hồi 350 HP)', cost: 50, currency: 'Bạc' },
      { id: 'buy_small_mp', name: '💧 Mua 10 Tiểu Khí Hoàn (Hồi 200 MP)', cost: 50, currency: 'Bạc' },
      { id: 'buy_hp', name: '🌿 Mua 20 Cửu Chuyển Huyết Đan (Hồi 1,500 HP)', cost: 180, currency: 'Bạc' },
      { id: 'buy_mp', name: '💧 Mua 20 Ngưng Thần Khí Hoàn (Hồi 800 MP)', cost: 180, currency: 'Bạc' },
      { id: 'full_heal', name: '✨ Châm Cứu Trị Thương Đầy Máu Tức Thì', cost: 30, currency: 'Bạc' }
    ]
  },
  npc_master: {
    id: 'npc_master',
    name: 'Độc Cô Tiên Tôn · Chưởng Môn',
    title: 'Kiếm Đạo Tông Sư',
    mapId: 'lac_duong',
    x: 1550,
    y: 580,
    avatar: 'avatar_huashan.png',
    role: 'master',
    dialogue: 'Cửu Châu loạn lạc, ma đạo hoành hành dã ngoại ngoài thành. Thiếu hiệp hãy chăm chỉ luyện công, đả thông kinh mạch để cứu giúp bá tánh!',
    actions: [
      { id: 'claim_gift', name: '📜 Nhận Quà Tân Thủ (+8 Điểm Tu Vi, +5 Điểm Võ Học, +1000 Bạc)', cost: 0, currency: 'Miễn Phí' },
      { id: 'breakthrough', name: '⚡ Cầu Xin Chỉ Điểm Đột Phá Cảnh Giới (+300 Exp Tu Vi)', cost: 0, currency: 'Miễn Phí' }
    ]
  },
  npc_scripture: {
    id: 'npc_scripture',
    name: 'Vô Nhai Trưởng Lão · Tàng Kinh Các',
    title: 'Thông Hiểu Bách Gia Võ Học',
    mapId: 'lac_duong',
    x: 1720,
    y: 650,
    avatar: 'avatar_xiaoyao.png',
    role: 'scripture',
    dialogue: 'Thiên hạ võ công vô cùng vô tận, chỉ có tâm pháp thâm sâu mới có thể chạm tới Thiên Ngoại Kiếm Tiên.',
    actions: [
      { id: 'buy_scripture', name: '📖 Mua 2 Quyển Thái Huyền Bí Tịch (+500 Exp Tu Vi)', cost: 1200, currency: 'Bạc' },
      { id: 'gain_skill_point', name: '🔮 Đổi 800 Bạc lấy +2 Điểm Võ Học', cost: 800, currency: 'Bạc' }
    ]
  },
  npc_driver: {
    id: 'npc_driver',
    name: 'Lý Xa Phu · Xa Phu Giang Hồ',
    title: 'Thần Hành Bách Biến',
    mapId: 'lac_duong',
    x: 1400,
    y: 880,
    avatar: 'avatar_huashan.png',
    role: 'teleporter',
    dialogue: 'Ngựa tốt xe êm, đi khắp Cửu Châu trong chớp mắt! Thiếu hiệp muốn đi đâu?',
    actions: [
      { id: 'tp_outside', name: '🐎 Ra Ngoài Thành Lạc Dương (Bãi Quái Sơn Tặc Lv.3-8)', cost: 0, currency: 'Miễn Phí' },
      { id: 'tp_peach', name: '🌸 Đến Đào Hoa Tiên Đảo (Quái Lv.10-14, Rớt Đồ Lv.10)', cost: 150, currency: 'Bạc' },
      { id: 'tp_volcano', name: '🔥 Đến Vạn Kiếp Ma Sơn (Quái Lv.16-19, Boss Ma Tôn Lv.25, Rớt Đồ Lv.20)', cost: 350, currency: 'Bạc' },
      { id: 'tp_conlon', name: '❄ Đến Côn Lôn Tuyết Sơn (Quái Lv.30-35, Boss Băng Phượng Lv.45, Rớt Đồ Lv.30)', cost: 600, currency: 'Bạc' },
      { id: 'tp_hoangsa', name: '🏜 Đến Hoàng Sa Cổ Thành (Quái Lv.40-45, Boss Sa Hoàng Lv.55, Rớt Đồ Lv.40)', cost: 1000, currency: 'Bạc' },
      { id: 'tp_thandien', name: '⚡ Đến Thái Cổ Thần Điện (Quái Lv.50-55, Boss Chân Long Lv.65, Rớt Đồ Lv.50)', cost: 2000, currency: 'Bạc' },
      { id: 'tp_dungeon', name: '🌀 Đến Phụ Bản Cửu U Ma Huyệt (Quái Lv.60-70, Boss Ma Hoàng Lv.85, Rớt Đồ Lv.60+)', cost: 3000, currency: 'Bạc' }
    ]
  }
};

module.exports = { NPCS };
