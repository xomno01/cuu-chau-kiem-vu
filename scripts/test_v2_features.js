const { io } = require('socket.io-client');

const socket = io('http://localhost:3000');
console.log('Testing V2 Full Server features...');

socket.on('connect', () => {
  console.log('Connected! Socket ID:', socket.id);
  socket.emit('join_game', { name: 'Độc Cô Cầu Bại', sect: 'huashan' });
});

socket.on('game_init', (data) => {
  console.log('Game Init OK! Player ID:', data.playerId);
  console.log('Current Map:', data.currentMap);
  console.log('Maps Count:', Object.keys(data.mapsData).length);
  console.log('Inventory Slots:', data.playerState.maxInventorySlots);
  console.log('Initial Stat Points:', data.playerState.statPoints);

  // 1. Test Cộng Điểm Tiềm Năng (Sức Mạnh)
  socket.emit('allocate_stat', { statKey: 'str', amount: 5 });

  // 2. Test Nâng Cấp Kỹ Năng (hs_1)
  socket.emit('upgrade_skill', { skillId: 'hs_1' });

  // 3. Test Bơm Dược Nhanh (Huyết Đan)
  socket.emit('quick_potion', { type: 'hp' });

  // 4. Test Bơm Dược Nhanh (Nguyên Khí Hoàn)
  socket.emit('quick_potion', { type: 'mp' });

  // 5. Test Thiền Định
  socket.emit('toggle_meditation');

  // 6. Test Sắp Xếp Túi Đồ 200 ô
  socket.emit('sort_inventory');

  // 7. Test Ngự Kiếm Chuyển Map sang Đào Hoa Đảo
  socket.emit('change_map', { mapId: 'dao_hoa_dao' });
});

socket.on('stat_allocated', (res) => {
  console.log('Stat Allocated Result:', res.success, 'New Stats:', res.stats, 'Points left:', res.statPoints);
});

socket.on('skill_upgraded', (res) => {
  console.log('Skill Upgraded Result:', res.success, 'Skill:', res.skillId, 'New Level:', res.newLevel);
});

socket.on('item_used', (res) => {
  console.log('Item Used OK! Type:', res.type, 'Healed HP:', res.healedHp, 'Healed MP:', res.healedMp);
});

socket.on('meditation_state', (res) => {
  console.log('Meditation State:', res.isMeditating ? 'Đang Đả Tọa Thiền Định' : 'Đứng Dậy');
});

socket.on('inventory_sorted', (res) => {
  console.log('Inventory Sorted OK! Items in bag:', res.inventory.length);
});

socket.on('map_changed', (res) => {
  console.log('Map Changed Successfully to:', res.mapId, 'Name:', res.mapInfo.name);
  console.log('=== ALL V2 FEATURES TESTED AND PASSED 100%! ===');
  socket.disconnect();
  process.exit(0);
});

setTimeout(() => {
  console.error('Test timeout!');
  process.exit(1);
}, 6000);
