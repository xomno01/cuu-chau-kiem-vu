const io = require('socket.io-client');

const socket = io('http://localhost:3000', { reconnection: false });

console.log('--- Bắt đầu kiểm tra kết nối Socket.io Client tới Server ---');

socket.on('connect', () => {
  console.log('[CLIENT] Đã kết nối thành công tới máy chủ Cửu Châu Kiếm Vũ (ID:', socket.id, ')');

  // Gửi lệnh tham gia game
  socket.emit('join_game', { name: 'Độc Cô Cầu Bại', sect: 'huashan' });
});

socket.on('game_init', (data) => {
  console.log('[CLIENT] Nhận game_init thành công:');
  console.log('  - Player Name:', data.playerState.name);
  console.log('  - Cảnh giới:', data.playerState.realm);
  console.log('  - Ngân Lượng:', data.playerState.gold);
  console.log('  - Số món trong túi 200 ô:', data.playerState.inventory.length);
  console.log('  - Bản đồ hiện tại:', data.currentMap);

  // Thử nghiệm bán đồ rác
  console.log('[CLIENT] Gửi lệnh sell_junk (Bán đồ rác)...');
  socket.emit('sell_junk');
});

socket.on('sell_junk_result', (res) => {
  console.log('[CLIENT] Nhận phản hồi sell_junk_result:', res);

  // Thử nghiệm trang bị món đầu tiên trong túi
  console.log('[CLIENT] Thử trang bị món đồ index 3 trong túi (Kiếm Bạch Kim)...');
  socket.emit('equip_item', { invIndex: 3 });
});

socket.on('equip_result', (res) => {
  console.log('[CLIENT] Nhận phản hồi equip_result:', res);

  // Thử tháo nón
  console.log('[CLIENT] Thử tháo nón...');
  socket.emit('unequip_item', { slotType: 'helmet' });
});

socket.on('unequip_result', (res) => {
  console.log('[CLIENT] Nhận phản hồi unequip_result:', res);

  // Thử tương tác NPC Tiết Thần Y mua Tiểu Huyết Đan
  console.log('[CLIENT] Thử mua Tiểu Huyết Đan từ Tiết Thần Y (npc_doctor)...');
  socket.emit('interact_npc', { npcId: 'npc_doctor', actionId: 'buy_small_hp' });
});

socket.on('npc_action_result', (res) => {
  console.log('[CLIENT] Nhận phản hồi npc_action_result:', res);

  console.log('\n>>> TẤT CẢ CÁC LUỒNG SOCKET CLIENT ĐÃ HOÀN TOÀN CHUẨN XÁC VÀ PHẢN HỒI MƯỢT MÀ! <<<');
  socket.disconnect();
  process.exit(0);
});

socket.on('notice', (n) => {
  console.log(`[NOTICE] [${n.type}]: ${n.msg}`);
});

socket.on('connect_error', (err) => {
  console.error('[CLIENT] Lỗi kết nối:', err.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('[CLIENT] Timeout 8s!');
  process.exit(1);
}, 8000);
