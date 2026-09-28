// Hệ Thống 12 Đại Danh Hiệu Võ Lâm - Cửu Châu Kiếm Vũ Online
// Mỗi danh hiệu có badge riêng, cộng dồn thuộc tính & kích hoạt hào quang đỉnh cao

const TITLES = {
  title_1: {
    id: 'title_1',
    name: 'Sơ Xuất Giang Hồ',
    badge: 'title_1.png',
    color: '#cbd5e1',
    levelReq: 1,
    stats: { power: 15, hp: 100 },
    desc: 'Hiệp khách mới bước chân vào chốn giang hồ hiểm ác.'
  },
  title_2: {
    id: 'title_2',
    name: 'Võ Lâm Tân Tú',
    badge: 'title_2.png',
    color: '#4ade80',
    levelReq: 10,
    stats: { power: 35, hp: 250, def: 15 },
    desc: 'Thiếu hiệp bộc lộ tài năng xuất chúng giữa quần hùng.'
  },
  title_3: {
    id: 'title_3',
    name: 'Hành Hiệp Trượng Nghĩa',
    badge: 'title_3.png',
    color: '#38bdf8',
    levelReq: 20,
    stats: { power: 65, hp: 500, def: 30, crit: 0.02 },
    desc: 'Trảm yêu trừ ma, trượng nghĩa cứu nhân thế.'
  },
  title_4: {
    id: 'title_4',
    name: 'Tiêu Dao Du Hiệp',
    badge: 'title_4.png',
    color: '#c084fc',
    levelReq: 30,
    stats: { power: 110, hp: 900, def: 50, speed: 20 },
    desc: 'Lấy kiếm làm bạn, một bầu rượu tiêu dao thiên địa.'
  },
  title_5: {
    id: 'title_5',
    name: 'Danh Chấn Bát Phương',
    badge: 'title_5.png',
    color: '#facc15',
    levelReq: 40,
    stats: { power: 180, hp: 1500, def: 80, crit: 0.04 },
    desc: 'Tung hoành nam bắc, giang hồ hào kiệt nghe danh nể phục.'
  },
  title_6: {
    id: 'title_6',
    name: 'Độc Bộ Thiên Hạ',
    badge: 'title_6.png',
    color: '#fb923c',
    levelReq: 50,
    stats: { power: 280, hp: 2200, def: 120, crit: 0.06 },
    desc: 'Đơn thương độc mã bước qua muôn trùng hiểm trận.'
  },
  title_7: {
    id: 'title_7',
    name: 'Huyết Ma Kiếm Thánh',
    badge: 'title_7.png',
    color: '#ef4444',
    levelReq: 60,
    stats: { power: 420, hp: 3200, def: 160, crit: 0.08, lifeSteal: 0.05 },
    desc: 'Kiếm xuất phong lôi, nhuốm máu vạn ma thần quy phục.'
  },
  title_8: {
    id: 'title_8',
    name: 'Bắc Đẩu Chân Quân',
    badge: 'title_8.png',
    color: '#a855f7',
    levelReq: 70,
    stats: { power: 580, hp: 4500, def: 220, mp: 800 },
    desc: 'Tinh thông bắc đẩu cửu tinh, điều khiển thiên địa chân khí.'
  },
  title_9: {
    id: 'title_9',
    name: 'Thái Cổ Kiếm Tôn',
    badge: 'title_9.png',
    color: '#f59e0b',
    levelReq: 80,
    stats: { power: 780, hp: 6000, def: 300, crit: 0.12 },
    desc: 'Nhập kiếm nhập thần, vạn kiếm triều bái uy chấn thái cổ.'
  },
  title_10: {
    id: 'title_10',
    name: 'Vạn Cổ Nhất Kiếm',
    badge: 'title_10.png',
    color: '#94a3b8',
    levelReq: 85,
    stats: { power: 1050, hp: 8000, def: 400, crit: 0.15 },
    desc: 'Ngàn năm cô độc, một kiếm phá vạn đạo thiên địa luân hồi.'
  },
  title_11: {
    id: 'title_11',
    name: 'Cửu Châu Thần Vương',
    badge: 'title_11.png',
    color: '#fde047',
    levelReq: 90,
    stats: { power: 1400, hp: 11000, def: 550, crit: 0.18, reflect: 0.15 },
    desc: 'Chúa tể cửu châu, phật quang vạn trượng bất diệt kim thân.'
  },
  title_12: {
    id: 'title_12',
    name: '★ BẠCH KIM CHÍ TÔN ĐẾ QUÂN ★',
    badge: 'title_12.png',
    color: '#38bdf8',
    levelReq: 95,
    stats: { power: 2000, hp: 16000, def: 750, crit: 0.22, lifeSteal: 0.12, reflect: 0.2 },
    isShimmering: true,
    desc: 'Tột đỉnh danh vọng võ lâm tam giới, hào quang cửu thiên chí tôn vĩnh hằng.'
  },

  // ========================================================
  // ĐẶC BIỆT: 10 ĐẠI DANH HIỆU BẢNG XẾP HẠNG TOÀN SERVER (TOP 1 - TOP 10)
  // Đẳng cấp Chí Tôn, thuộc tính kinh thiên động địa, cánh hào quang & vương miện tỏa sáng
  // ========================================================
  title_rank_1: {
    id: 'title_rank_1',
    name: '👑【THIÊN HẠ ĐỆ NHẤT CAO THỦ】👑',
    badge: 'title_rank_1.png',
    color: '#ffd700',
    isRankTitle: true,
    rank: 1,
    stats: { power: 8888, hp: 68888, def: 5888, crit: 0.15, lifeSteal: 0.10, reflect: 0.15 },
    isShimmering: true,
    desc: 'QUÁN QUÂN BẢNG XẾP HẠNG TOÀN SERVER. Đỉnh phong võ học, kiếm khí cửu thiên, vạn người quy phục!'
  },
  title_rank_2: {
    id: 'title_rank_2',
    name: '⚔【CỬU CHÂU CHÍ TÔN VÔ SONG】⚔',
    badge: 'title_rank_2.png',
    color: '#ff3366',
    isRankTitle: true,
    rank: 2,
    stats: { power: 6666, hp: 52000, def: 4500, crit: 0.12, lifeSteal: 0.08, reflect: 0.12 },
    isShimmering: true,
    desc: 'Á QUÂN BẢNG XẾP HẠNG TOÀN SERVER. Tuyệt đại giai thoại, thần kiếm xuất thế trấn áp bát phương!'
  },
  title_rank_3: {
    id: 'title_rank_3',
    name: '⚡【BẠCH KIM CHIẾN THẦN QUÂN】⚡',
    badge: 'title_rank_3.png',
    color: '#00f0ff',
    isRankTitle: true,
    rank: 3,
    stats: { power: 5200, hp: 42000, def: 3600, crit: 0.10, lifeSteal: 0.06, reflect: 0.10 },
    isShimmering: true,
    desc: 'QUÝ QUÂN BẢNG XẾP HẠNG TOÀN SERVER. Lôi đình vạn quân, uy chấn tam giới bách chiến bách thắng!'
  },
  title_rank_4: {
    id: 'title_rank_4',
    name: '🔥【BÁT HOANG TIÊN TÔN - TOP 4】🔥',
    badge: 'title_rank_4.png',
    color: '#f97316',
    isRankTitle: true,
    rank: 4,
    stats: { power: 4200, hp: 35000, def: 3000, crit: 0.09, lifeSteal: 0.05 },
    isShimmering: true,
    desc: 'HẠNG 4 TOÀN SERVER. Chưởng quản bát hoang lục hợp, liệt diễm cửu thiên thiêu rụi tà ma!'
  },
  title_rank_5: {
    id: 'title_rank_5',
    name: '🌟【THÁI HƯ ĐẠO QUÂN - TOP 5】🌟',
    badge: 'title_rank_5.png',
    color: '#eab308',
    isRankTitle: true,
    rank: 5,
    stats: { power: 3600, hp: 30000, def: 2500, crit: 0.08, lifeSteal: 0.05 },
    isShimmering: true,
    desc: 'HẠNG 5 TOÀN SERVER. Ngộ thấu hư vô đại đạo, thần thông quảng đại bước qua luân hồi!'
  },
  title_rank_6: {
    id: 'title_rank_6',
    name: '💠【CỬU TRÙNG THIÊN ĐẾ - TOP 6】💠',
    badge: 'title_rank_6.png',
    color: '#c084fc',
    isRankTitle: true,
    rank: 6,
    stats: { power: 3100, hp: 26000, def: 2200, crit: 0.07 },
    isShimmering: true,
    desc: 'HẠNG 6 TOÀN SERVER. Ngự trị cửu trùng thiên giới, vạn tiên triều kiến uy linh vô thượng!'
  },
  title_rank_7: {
    id: 'title_rank_7',
    name: '❄【VẠN CỔ KIẾM HOÀNG - TOP 7】❄',
    badge: 'title_rank_7.png',
    color: '#38bdf8',
    isRankTitle: true,
    rank: 7,
    stats: { power: 2700, hp: 22000, def: 1900, crit: 0.06 },
    isShimmering: true,
    desc: 'HẠNG 7 TOÀN SERVER. Nhất kiếm băng phong vạn lý, ngàn năm cô tịch một bóng hình!'
  },
  title_rank_8: {
    id: 'title_rank_8',
    name: '🌪【HỖN ĐỘN TÔNG SƯ - TOP 8】🌪',
    badge: 'title_rank_8.png',
    color: '#34d399',
    isRankTitle: true,
    rank: 8,
    stats: { power: 2400, hp: 19000, def: 1700, crit: 0.06 },
    isShimmering: true,
    desc: 'HẠNG 8 TOÀN SERVER. Chưởng khống hỗn độn phong lôi, một kích khai sơn phá thạch!'
  },
  title_rank_9: {
    id: 'title_rank_9',
    name: '✨【TIÊU DAO THẦN TƯỚNG - TOP 9】✨',
    badge: 'title_rank_9.png',
    color: '#f472b6',
    isRankTitle: true,
    rank: 9,
    stats: { power: 2100, hp: 17000, def: 1500, crit: 0.05 },
    isShimmering: true,
    desc: 'HẠNG 9 TOÀN SERVER. Tiên phong đạo cốt xuất trần, phiêu bạt giang hồ tự tại tiêu dao!'
  },
  title_rank_10: {
    id: 'title_rank_10',
    name: '🔷【TRẤN THẾ ANH HÙNG - TOP 10】🔷',
    badge: 'title_rank_10.png',
    color: '#60a5fa',
    isRankTitle: true,
    rank: 10,
    stats: { power: 1900, hp: 15000, def: 1300, crit: 0.05 },
    isShimmering: true,
    desc: 'HẠNG 10 TOÀN SERVER. Thiết huyết đan tâm, trấn giữ bờ cõi giang sơn xã tắc vĩnh an!'
  }
};

module.exports = { TITLES };
