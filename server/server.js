const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const { Server } = require('socket.io');

const { World, MAPS } = require('./game/World');
const { SKILLS } = require('./game/Skills');
const { ITEMS } = require('./game/Items');
const { generateCultivationGear, CULTIVATION_SETS } = require('./game/CultivationSystem');

const app = express();
app.use(cors());

const PUBLIC_DIR = path.join(__dirname, '..', 'public');
app.use(express.static(PUBLIC_DIR));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const world = new World(io);

const { db } = require('./database/db');

// TỰ ĐỘNG ĐỒNG BỘ 10 ĐẠI DANH HIỆU BẢNG XẾP HẠNG TOÀN SERVER (TOP 1 - TOP 10)
function syncLeaderboardRankTitles() {
  try {
    const list = db.getLeaderboard(world.players);
    list.forEach((entry, idx) => {
      const rank = idx + 1;
      for (const p of Object.values(world.players)) {
        if (p && p.name && p.name.toLowerCase() === entry.name.toLowerCase()) {
          p.updateServerRank(rank);
        }
      }
    });
    return list;
  } catch (err) {
    console.error('Lỗi đồng bộ rank titles:', err);
    return [];
  }
}

// Chu kỳ quét cập nhật bảng xếp hạng và trao danh hiệu Top 1-10
setInterval(() => {
  syncLeaderboardRankTitles();
}, 15000);

// Lắng nghe kết nối Socket
io.on('connection', (socket) => {
  console.log(`[Giang Hồ] Hiệp khách kết nối: ${socket.id}`);

  // 1. ĐĂNG KÝ TÀI KHOẢN
  socket.on('account_register', (data) => {
    const { username, password } = data || {};
    const res = db.register(username, password);
    socket.emit('account_register_result', res);
  });

  // 2. ĐĂNG NHẬP TÀI KHOẢN
  socket.on('account_login', (data) => {
    const { username, password } = data || {};
    const res = db.login(username, password);
    socket.emit('account_login_result', res);
  });

  // 3. TẠO NHÂN VẬT MỚI GẮN VỚI TÀI KHOẢN
  socket.on('create_character', (data) => {
    const { username, name, sect } = data || {};
    const res = db.createCharacter(username, name, sect);
    socket.emit('create_character_result', res);
  });

  // 4. VÀO GAME VỚI NHÂN VẬT ĐÃ CHỌN (NẠP ĐẦY ĐỦ THUỘC TÍNH VÀ TÚI ĐỒ ĐÃ LƯU)
  socket.on('select_character', (data) => {
    console.log('[SERVER] select_character received:', data);
    const { username, charId } = data || {};
    const savedChar = db.getCharacter(username, charId);
    if (!savedChar) {
      console.log('[SERVER] Character NOT found in DB for:', username, charId);
      return socket.emit('notice', { msg: 'Không tìm thấy dữ liệu nhân vật!', type: 'danger' });
    }

    if (savedChar.isDeadPerm) {
      return socket.emit('notice', { 
        msg: '【THỌ CHUNG CHÍNH TẨM】 Nhân vật này đã tận số thọ nguyên hóa đạo quy khư, không thể nhập thế được nữa! Hãy tạo nhân vật mới!', 
        type: 'danger' 
      });
    }

    const player = world.addPlayer(socket.id, savedChar.name, savedChar.sect, savedChar, username);
    syncLeaderboardRankTitles();

    socket.emit('game_init', {
      playerId: player.id,
      mapsData: MAPS,
      npcsData: world.npcs,
      currentMap: player.currentMap,
      worldWidth: MAPS[player.currentMap].width,
      worldHeight: MAPS[player.currentMap].height,
      safeZone: MAPS[player.currentMap].safeZone,
      skillsData: SKILLS,
      itemsData: ITEMS,
      playerState: player.toClientState(),
      activeRevenantEvent: world.activeRevenantEvent
    });
  });
  
  socket.on('join_game', (data) => {
    const { name, sect } = data || {};
    const player = world.addPlayer(socket.id, name, sect);
    syncLeaderboardRankTitles();
    
    socket.emit('game_init', {
      playerId: player.id,
      mapsData: MAPS,
      npcsData: world.npcs,
      currentMap: player.currentMap,
      worldWidth: MAPS[player.currentMap].width,
      worldHeight: MAPS[player.currentMap].height,
      safeZone: MAPS[player.currentMap].safeZone,
      skillsData: SKILLS,
      itemsData: ITEMS,
      playerState: player.toClientState(),
      activeRevenantEvent: world.activeRevenantEvent
    });
  });

  // 5. ĐỘT PHÁ CẢNH GIỚI TU TIÊN
  socket.on('cultivation_breakthrough', () => {
    const p = world.players[socket.id];
    if (!p) return;
    const res = p.breakthrough();
    socket.emit('breakthrough_result', res);
    if (res && res.success) {
      world.savePlayer(socket.id);
      world.broadcastNotice(`THIÊN KIẾP ĐỘT PHÁ! Hiệp khách [${p.name}] đã đột phá lên Cảnh giới 【${res.newRealm}】! Thọ nguyên kéo dài ${res.maxLifespan} năm!`, 'boss_kill');
    }
  });

  // 6. ĐỔI MÔN PHÁI TU TIÊN (CẤP 30+)
  socket.on('change_cultiv_sect', (data) => {
    const p = world.players[socket.id];
    if (!p || !data || !data.sectKey) return;
    const res = p.changeCultivSect(data.sectKey);
    socket.emit('change_cultiv_sect_result', res);
    if (res && res.success) {
      world.savePlayer(socket.id);
      world.broadcastNotice(`TIÊN MÔN KẾT DUYÊN! Hiệp khách [${p.name}] đã quy y môn hạ 【${res.sectName}】!`, 'boss_kill');
    }
  });

  // 7. TRUYỀN TỐNG THAM GIA TRỪ MA VỆ ĐẠO (NGUYÊN HỒN ÁC HÓA)
  socket.on('teleport_to_revenant_event', (data) => {
    const p = world.players[socket.id];
    if (!p || p.hp <= 0) return;
    const bossId = (data && data.bossId) || (world.activeRevenantEvent && world.activeRevenantEvent.bossId);
    const boss = world.monsters[bossId];
    if (!boss || boss.hp <= 0 || boss.state === 'dead') {
      return socket.emit('notice', { msg: 'Nguyên Hồn Ác Hóa đã bị tiêu diệt hoặc đã tiêu tán!', type: 'danger' });
    }

    const targetMap = world.maps[boss.mapId] || world.maps.dao_hoa_dao;
    p.currentMap = boss.mapId;
    p.x = Math.max(80, Math.min(targetMap.width - 80, Math.round(boss.x + (Math.random() - 0.5) * 260)));
    p.y = Math.max(80, Math.min(targetMap.height - 80, Math.round(boss.y + 180)));
    p.targetX = p.x;
    p.targetY = p.y;
    p.isMoving = false;

    socket.emit('map_changed', {
      mapId: p.currentMap,
      mapInfo: targetMap,
      x: p.x,
      y: p.y
    });
    socket.emit('notice', { msg: `Đã truyền tống tới [${targetMap.name}] tham gia trừ ma vệ đạo!`, type: 'success' });
  });

  // 8. TEST LẬP TỨC SỰ KIỆN NGUYÊN HỒN ÁC HÓA (DÀNH CHO TEST & GM)
  socket.on('trigger_test_revenant', () => {
    const p = world.players[socket.id];
    if (!p) return;
    world.spawnRevenantBossFromPlayer(p);
  });

  // 9. DEV HELPER: LÊN CẤP 10 TỨC THÌ
  socket.on('dev_levelup', (data) => {
    const p = world.players[socket.id];
    if (!p) return;
    const targetLvl = (data && data.level) || 10;
    while (p.level < targetLvl) {
      p.addExp(p.expNext);
    }
    world.io.emit('player_levelup', {
      playerId: p.id,
      level: p.level,
      realm: p.getRealmName ? p.getRealmName() : 'Luyện Khí'
    });
    world.broadcastNotice(`Hiệp khách [${p.name}] đã đột phá thăng tiến lên Cấp ${p.level}!`, 'system');
  });

  // 10. DEV HELPER: KÍCH HOẠT HẾT THỌ NGUYÊN VÀ TỌA HÓA (PERMADEATH)
  socket.on('dev_trigger_permadeath', () => {
    const p = world.players[socket.id];
    if (!p || p.isDeadPerm) return;
    p.age = p.maxLifespan;
    const lifeRes = p.tickLifespan();
    if (lifeRes && lifeRes.isDeadPerm) {
      socket.emit('player_permadeath', {
        msg: lifeRes.msg,
        age: p.age,
        maxLifespan: p.maxLifespan
      });
      world.broadcastNotice(lifeRes.msg, 'boss_kill');
      if (!p.hasSpawnedRevenant) {
        p.hasSpawnedRevenant = true;
        world.spawnRevenantBossFromPlayer(p);
      }
    }
  });

  // 11. BẢNG SĂN BOSS THẾ GIỚI & PHI THÂN TRUY SÁT
  socket.on('get_boss_hunt_list', () => {
    socket.emit('boss_hunt_list', world.getWorldBossStatus());
  });

  socket.on('hunt_boss_teleport', (data) => {
    if (data && data.bossId) {
      const res = world.teleportToBoss(socket.id, data.bossId);
      if (res && res.msg) {
        socket.emit('notice', { msg: res.msg, type: res.success ? 'success' : 'warning' });
      }
      if (res && res.success) {
        socket.emit('boss_hunt_list', world.getWorldBossStatus());
      }
    }
  });
  
  socket.on('move_to', (data) => {
    if (data && typeof data.x === 'number' && typeof data.y === 'number') {
      world.setPlayerTarget(socket.id, data.x, data.y);
    }
  });
  
  socket.on('dash', (data) => {
    const dirX = data ? data.dirX : 0;
    const dirY = data ? data.dirY : 0;
    world.executeDash(socket.id, dirX, dirY);
  });
  
  socket.on('normal_attack', (data) => {
    if (data && typeof data.x === 'number' && typeof data.y === 'number') {
      world.castNormalAttack(socket.id, data.x, data.y);
    }
  });
  
  socket.on('cast_skill', (data) => {
    if (data && data.skillId && typeof data.x === 'number' && typeof data.y === 'number') {
      world.castSkill(socket.id, data.skillId, data.x, data.y);
    }
  });
  
  socket.on('pickup_item', (data) => {
    if (data && data.dropId) {
      world.pickupItem(socket.id, data.dropId);
    }
  });
  
  // DÙNG NHANH BÌNH DƯỢC (Bơm Máu / Bơm Mana)
  socket.on('quick_potion', (data) => {
    const p = world.players[socket.id];
    if (!p) return;
    const potionType = data ? data.type : 'hp'; // 'hp' | 'mp'
    const targetItemId = potionType === 'hp' ? 'item_5' : 'item_6';
    
    const invIdx = p.inventory.findIndex(i => i.itemId === targetItemId && i.count > 0);
    if (invIdx !== -1) {
      const res = p.useItem(invIdx);
      socket.emit('item_used', res);
    } else {
      socket.emit('notice', { msg: `Đã hết ${potionType === 'hp' ? 'Huyết Đan' : 'Nguyên Khí Hoàn'} trong túi!` });
    }
  });
  
  // SỬ DỤNG VẬT PHẨM TRỰC TIẾP TỪ Ô TÚI ĐỒ
  socket.on('use_item', (data) => {
    const p = world.players[socket.id];
    if (p && typeof data.invIndex === 'number') {
      const res = p.useItem(data.invIndex);
      socket.emit('item_used', res);
    }
  });
  
  // TRANG BỊ
  socket.on('equip_item', (data) => {
    const p = world.players[socket.id];
    if (p && typeof data.invIndex === 'number') {
      const success = p.equipItem(data.invIndex);
      socket.emit('equip_result', { success });
      if (success) {
        socket.emit('notice', { msg: 'Đã trang bị thành công vào người!', type: 'success' });
      } else {
        socket.emit('notice', { msg: 'Không thể trang bị món này!', type: 'warning' });
      }
    }
  });
  
  // THÁO TRANG BỊ
  socket.on('unequip_item', (data) => {
    const p = world.players[socket.id];
    if (p && data.slotType) {
      const success = p.unequipItem(data.slotType);
      socket.emit('unequip_result', { success });
      if (success) {
        socket.emit('notice', { msg: 'Đã tháo trang bị trở về hành trang!', type: 'success' });
      } else {
        socket.emit('notice', { msg: 'Hành trang đã đầy, không thể tháo!', type: 'warning' });
      }
    }
  });

  // BÁN 1 MÓN ĐỒ
  socket.on('sell_item', (data) => {
    const p = world.players[socket.id];
    if (p && typeof data.invIndex === 'number') {
      const res = p.sellItem(data.invIndex);
      socket.emit('sell_result', res);
      if (res.success) {
        socket.emit('notice', { msg: `Đã bán [${res.itemName}], thu về +${res.price.toLocaleString()} Ngân Lượng!`, type: 'success' });
      } else {
        socket.emit('notice', { msg: res.msg || 'Không thể bán món đồ này!', type: 'warning' });
      }
    }
  });

  // TỰ ĐỘNG BÁN TẤT CẢ ĐỒ RÁC (TRẮNG VÀ LỤC)
  socket.on('sell_junk', () => {
    const p = world.players[socket.id];
    if (p) {
      const res = p.sellJunkItems();
      socket.emit('sell_junk_result', res);
      if (res.success) {
        socket.emit('notice', { msg: `Đã dọn dẹp bán ${res.soldCount} món đồ rác, thu về +${res.totalSilver.toLocaleString()} Ngân Lượng!`, type: 'success' });
      } else {
        socket.emit('notice', { msg: res.msg || 'Không có đồ rác Trắng/Lục nào để bán!', type: 'info' });
      }
    }
  });

  // BÁN ĐỒ THEO TÙY CHỌN PHẨM CẤP
  socket.on('sell_by_rarity', (data) => {
    const p = world.players[socket.id];
    if (p && data && Array.isArray(data.rarities)) {
      const res = p.sellByRarity(data.rarities);
      socket.emit('sell_by_rarity_result', res);
      if (res.success) {
        socket.emit('notice', { msg: `Đã thanh lý ${res.soldCount} món trang bị theo phẩm cấp, thu về +${res.totalSilver.toLocaleString()} Ngân Lượng!`, type: 'success' });
      } else {
        socket.emit('notice', { msg: res.msg || 'Không có trang bị nào khớp phẩm cấp để bán!', type: 'info' });
      }
    }
  });

  // VÒNG QUAY MAY MẮN (THIÊN MỆNH CHI LUÂN - 10 LƯỢT MIỄN PHÍ)
  socket.on('spin_wheel', () => {
    const p = world.players[socket.id];
    if (p) {
      const res = p.spinWheel();
      socket.emit('spin_wheel_result', res);
      if (res.success) {
        if (res.reward.rarity === 'platinum') {
          world.broadcastNotice(`★ THIÊN MỆNH CHI LUÂN! Chúc mừng Hiệp khách [${p.name}] quay trúng Thần Binh [${res.reward.name}] (Bạch Kim Chí Tôn)! ★`, 'boss_kill');
        } else if (res.reward.rarity === 'legendary') {
          world.broadcastNotice(`Thiên Mệnh Chi Luân: Hiệp khách [${p.name}] quay trúng Bảo Vật Hoàng Kim [${res.reward.name}]!`, 'system');
        }
      } else {
        socket.emit('notice', { msg: res.msg || 'Không thể quay!', type: 'warning' });
      }
    }
  });
  
  // CỘNG ĐIỂM TIỀM NĂNG TỰ THÂN (Sức Mạnh, Thể Chất, Thân Pháp, Nội Lực)
  socket.on('allocate_stat', (data) => {
    const p = world.players[socket.id];
    if (p && data && data.statKey) {
      const res = p.allocateStat(data.statKey, data.amount || 1);
      socket.emit('stat_allocated', res);
    }
  });
  
  // TẨY ĐIỂM TIỀM NĂNG (TIÊU HAO 10,000 NGÂN LƯỢNG)
  socket.on('reset_stats', () => {
    const p = world.players[socket.id];
    if (p) {
      const res = p.resetStats();
      socket.emit('stats_reset', res);
      if (res.success) {
        socket.emit('notice', { msg: res.msg, type: 'success' });
        world.broadcastNotice(`Hiệp khách [${p.name}] đã tiêu hao 10,000 Ngân Lượng tẩy tủy dịch cân, tái lập điểm tiềm năng!`, 'system');
      } else {
        socket.emit('notice', { msg: res.msg || 'Không thể tẩy điểm!', type: 'warning' });
      }
    }
  });
  
  // NÂNG CẤP KỸ NĂNG VÕ HỌC
  socket.on('upgrade_skill', (data) => {
    const p = world.players[socket.id];
    if (p && data && data.skillId) {
      const res = p.upgradeSkill(data.skillId);
      socket.emit('skill_upgraded', res);
    }
  });
  
  // SẮP XẾP TÚI ĐỒ 200 Ô
  socket.on('sort_inventory', () => {
    const p = world.players[socket.id];
    if (p) {
      p.sortInventory();
      socket.emit('inventory_sorted', { inventory: p.inventory });
    }
  });
  
  // THIỀN ĐỊNH ĐẢ TỌA
  socket.on('toggle_meditation', () => {
    const p = world.players[socket.id];
    if (p && p.hp > 0) {
      const isMeditating = p.toggleMeditation();
      socket.emit('meditation_state', { isMeditating });
    }
  });
  
  // CHUYỂN BẢN ĐỒ (Ngự Kiếm Phi Hành)
  socket.on('change_map', (data) => {
    if (data && data.mapId) {
      world.teleportPlayer(socket.id, data.mapId);
    }
  });

  // BẢNG XẾP HẠNG LIÊN THÔNG TOÀN SERVER (REAL-TIME ONLINE DATABASE)
  socket.on('get_leaderboard', () => {
    const list = syncLeaderboardRankTitles();
    socket.emit('leaderboard_data', list);
  });

  // TIẾN VÀO PHỤ BẢN BÍ CẢNH (CỬU U MA HUYỆT)
  socket.on('enter_dungeon', () => {
    const p = world.players[socket.id];
    if (p && p.hp > 0) {
      world.teleportPlayer(socket.id, 'dungeon_abyss', 1400, 1600);
      socket.emit('notice', { msg: 'ĐÃ BƯỚC VÀO PHỤ BẢN CỬU U MA HUYỆT! Cẩn trọng Ma Thần tử khí!', type: 'danger' });
      world.broadcastNotice(`Hiệp khách [${p.name}] đã dũng cảm tiến vào Phụ Bản [Cửu U Ma Huyệt]!`, 'boss_kill');
    }
  });

  // HỆ THỐNG DANH HIỆU: KÍCH HOẠT DANH HIỆU
  socket.on('set_active_title', (data) => {
    const p = world.players[socket.id];
    if (p && data && data.titleId) {
      const res = p.setActiveTitle(data.titleId);
      socket.emit('active_title_result', res);
      if (res.success) {
        socket.emit('notice', { msg: `Đã kích hoạt danh hiệu [${res.titleDef.name}]! Lực chiến tăng vọt!`, type: 'success' });
        world.broadcastNotice(`Hiệp khách [${p.name}] đã khoác lên danh hiệu [${res.titleDef.name}] uy chấn giang hồ!`, 'system');
      } else {
        socket.emit('notice', { msg: res.msg || 'Không thể đổi danh hiệu!', type: 'warning' });
      }
    }
  });

  // BỘ LỌC TỰ NHẶT ĐỒ: CẬP NHẬT CẤU HÌNH
  socket.on('set_loot_filter', (data) => {
    const p = world.players[socket.id];
    if (p && data) {
      const res = p.setLootFilter(data);
      socket.emit('loot_filter_result', res);
      socket.emit('notice', { msg: 'Đã lưu cấu hình Bộ Lọc Tự Nhặt Đồ thành công!', type: 'success' });
    }
  });
  
  // ĐẢ THÔNG KINH MẠCH
  socket.on('upgrade_meridian', (data) => {
    const p = world.players[socket.id];
    if (p && data.meridianKey) {
      const res = p.upgradeMeridian(data.meridianKey);
      socket.emit('meridian_result', res);
      if (res.realmUp) {
        world.broadcastNotice(`Hiệp khách [${p.name}] đã đột phá lên [${res.realmName}]!`, 'system');
      }
    }
  });

  // TƯƠNG TÁC NPC (Thần Đúc Thợ Rèn, Thần Y, Chưởng Môn, Tàng Kinh Các, Xa Phu)
  socket.on('interact_npc', (data) => {
    if (data && data.npcId && data.actionId) {
      const res = world.interactNPC(socket.id, data.npcId, data.actionId, data.extra || {});
      socket.emit('npc_action_result', res);
      if (res && res.msg) {
        socket.emit('notice', { msg: res.msg, type: res.success ? 'success' : 'warning' });
      }
    }
  });

  // GIÁM ĐỊNH TRANG BỊ
  socket.on('appraise_item', (data) => {
    const p = world.players[socket.id];
    if (p && typeof data.invIndex === 'number') {
      const res = p.appraiseItem(data.invIndex);
      socket.emit('appraise_result', res);
      if (res && res.msg) {
        socket.emit('notice', { msg: res.msg, type: res.success ? 'success' : 'warning' });
      }
    }
  });

  // Helper chuẩn hóa mục tiêu trang bị trong Lò Rèn
  function resolveForgeTarget(data) {
    if (!data) return { targetKey: 0, isEquipped: false };
    const isEquipped = data.isEquipped === true || data.target === 'equipped' || (typeof data.slot === 'string' && data.target !== 'inventory');
    let targetKey;
    if (isEquipped) {
      targetKey = data.slot || data.targetSlot || data.target;
    } else {
      targetKey = (data.invIndex !== undefined && data.invIndex !== null) ? data.invIndex : (typeof data.target === 'number' ? data.target : parseInt(data.target, 10));
      if (isNaN(targetKey)) targetKey = 0;
    }
    return { targetKey, isEquipped };
  }

  // CƯỜNG HÓA TRANG BỊ (+1 ĐẾN +15)
  socket.on('enhance_item', (data) => {
    const p = world.players[socket.id];
    if (p && data) {
      const { targetKey, isEquipped } = resolveForgeTarget(data);
      const res = p.enhanceItem(targetKey, isEquipped, !!data.useProtectionCharm);
      socket.emit('enhance_result', res);
      if (res && res.msg) {
        socket.emit('notice', { msg: res.msg, type: res.success ? 'success' : (res.levelDropped ? 'danger' : 'warning') });
      }
      if (res && res.success && res.newLevel >= 7) {
        world.broadcastNotice(`THẦN KHÍ TÁI SINH! Hiệp khách [${p.name}] đã cường hóa [${res.item ? res.item.name : 'Thần Binh'}] lên +${res.newLevel}!`, 'system');
      }
    }
  });

  // ĐỤC LỖ TRANG BỊ
  socket.on('socket_item', (data) => {
    const p = world.players[socket.id];
    if (p && data) {
      const { targetKey, isEquipped } = resolveForgeTarget(data);
      const res = p.socketItem(targetKey, isEquipped);
      socket.emit('socket_result', res);
      if (res && res.msg) {
        socket.emit('notice', { msg: res.msg, type: res.success ? 'success' : 'warning' });
      }
    }
  });

  // KHẢM NGỌC
  socket.on('embed_gem', (data) => {
    const p = world.players[socket.id];
    if (p && data && typeof data.socketIdx === 'number') {
      const { targetKey, isEquipped } = resolveForgeTarget(data);
      const gemInvIdx = (data.gemInvIndex !== undefined && data.gemInvIndex !== null) ? data.gemInvIndex : (data.gemInvIdx !== undefined ? data.gemInvIdx : data.gemIndex);
      const res = p.embedGemItem(targetKey, isEquipped, data.socketIdx, gemInvIdx);
      socket.emit('embed_gem_result', res);
      if (res && res.msg) {
        socket.emit('notice', { msg: res.msg, type: res.success ? 'success' : 'warning' });
      }
    }
  });

  // THÁO NGỌC
  socket.on('remove_gem', (data) => {
    const p = world.players[socket.id];
    if (p && data && typeof data.socketIdx === 'number') {
      const { targetKey, isEquipped } = resolveForgeTarget(data);
      const res = p.removeGemItem(targetKey, isEquipped, data.socketIdx);
      socket.emit('remove_gem_result', res);
      if (res && res.msg) {
        socket.emit('notice', { msg: res.msg, type: res.success ? 'success' : 'warning' });
      }
    }
  });

  // GHÉP 3 VIÊN NGỌC
  socket.on('combine_gems', (data) => {
    const p = world.players[socket.id];
    if (p && data && data.gemType && typeof data.gemLevel === 'number') {
      const res = p.combineGems(data.gemType, data.gemLevel);
      socket.emit('combine_gems_result', res);
      if (res && res.msg) {
        socket.emit('notice', { msg: res.msg, type: res.success ? 'success' : 'warning' });
      }
    }
  });
  
  // HỒI SINH
  socket.on('respawn', () => {
    const p = world.players[socket.id];
    if (p && p.hp <= 0) {
      p.respawn(1400, 700);
      socket.emit('respawned', p.toClientState());
      socket.emit('notice', { msg: 'Huynh đài đã hồi sinh tại Lạc Dương Thành! Khí huyết và nội lực đã hồi phục.', type: 'success' });
    }
  });
  
  // CHAT GIANG HỒ
  socket.on('chat', (data) => {
    if (data && data.message) {
      world.handleChat(socket.id, data.message, data.channel || 'world');
    }
  });
  
  // TEST & DEBUG HELPERS
  socket.on('test_grant_tuvi', (data) => {
    const p = world.players[socket.id];
    if (p) {
      p.tuvi += (data && data.tuvi) ? data.tuvi : 10000;
      world.savePlayer(socket.id);
      socket.emit('notice', { msg: `Đã cộng thêm ${(data.tuvi || 10000).toLocaleString()} Tu Vi thử nghiệm!`, type: 'info' });
    }
  });

  socket.on('test_grant_cultiv_gear', (data) => {
    const p = world.players[socket.id];
    if (p) {
      const { slot, setId, rarity } = data || {};
      const gear = generateCultivationGear(slot || 'weapon', setId || 'set_thai_thanh', rarity || 'platinum', Math.max(30, p.level));
      p.inventory.push(gear);
      p.reindexInventory();
      world.savePlayer(socket.id);
      socket.emit('notice', { msg: `Đã tặng [${gear.name}] vào túi đồ!`, type: 'info' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`[Giang Hồ] Hiệp khách rời mạng: ${socket.id}`);
    world.removePlayer(socket.id);
  });
});

// Production Guard
process.on('uncaughtException', (err) => {
  console.error('[PRODUCTION GUARD] Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('[PRODUCTION GUARD] Unhandled Rejection at:', promise, 'reason:', reason);
});

const TICK_RATE = 30;
setInterval(() => {
  if (typeof world.tick === 'function') world.tick();
  else if (typeof world.update === 'function') world.update();
}, 1000 / TICK_RATE);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  CỬU CHÂU KIẾM VŨ ONLINE - V2 FULL UPGRADED!      `);
  console.log(`  Truy cập trải nghiệm tại: http://localhost:${PORT} `);
  console.log(`====================================================`);
});
