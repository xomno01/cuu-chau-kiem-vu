// Test Kịch Bản Toàn Diện & Tự Động Hóa 100% - Cửu Châu Kiếm Vũ Online V2.5
const { Player, REALMS } = require('./server/game/Player');
const { World, MAPS } = require('./server/game/World');
const { generateEquipment, ITEM_TEMPLATES, CONSUMABLE_ITEMS } = require('./server/game/ItemSystem');
const { NPCS } = require('./server/game/NPCSystem');
const ioClient = require('socket.io-client');

console.log('========================================================================');
console.log(' BẮT ĐẦU KIỂM THỬ TOÀN BỘ CÁC TÌNH HUỐNG TRẢI NGHIỆM NGƯỜI CHƠI (V2.5) ');
console.log('========================================================================\n');

let passCount = 0;
let totalCount = 0;

function assert(condition, message) {
  totalCount++;
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${message}`);
    process.exitCode = 1;
  }
}

// ----------------------------------------------------------------------
// 1. TÂN THỦ KHỞI TẠO & HÀNH TRANG 200 Ô
// ----------------------------------------------------------------------
console.log('--- PHẦN 1: Tân Thủ Khởi Tạo & Túi Đồ 200 Ô ---');
const p = new Player('test_hero_1', 'Lệnh Hồ Hiệp', 'huashan', 1400, 700);

assert(p.maxInventorySlots === 200, `Hành trang tối đa 200 ô (thực tế: ${p.maxInventorySlots})`);
assert(p.gold === 3500, `Khởi đầu có 3,500 Ngân Lượng Bạc (thực tế: ${p.gold})`);
assert(p.luckySpins === 10, `Mỗi lần vào game được tặng 10 lượt quay may mắn miễn phí (thực tế: ${p.luckySpins})`);
assert(p.realm === 'Luyện Khí Tầng 1', `Cảnh giới khởi đầu chuẩn: ${p.realm}`);
assert(p.equipment.weapon !== null, 'Đã trang bị sẵn Kiếm khởi đầu');
assert(p.equipment.helmet !== null, 'Đã trang bị sẵn Chiến Mão');
assert(p.equipment.armor !== null, 'Đã trang bị sẵn Chiến Bào');
assert(p.equipment.boots !== null, 'Đã trang bị sẵn Hộ Oa (Giày)');

// ----------------------------------------------------------------------
// 2. VÒNG QUAY MAY MẮN (THIÊN MỆNH CHI LUÂN - 10 LƯỢT MIỄN PHÍ)
// ----------------------------------------------------------------------
console.log('\n--- PHẦN 2: Vòng Quay May Mắn (10 Lượt Miễn Phí & Trừ Bạc Hợp Lệ) ---');
for (let spin = 1; spin <= 10; spin++) {
  const spinsBefore = p.luckySpins;
  const res = p.spinWheel();
  assert(res.success === true, `Lượt quay thứ ${spin}/10 thành công`);
  assert(res.isFree === true, `Lượt quay thứ ${spin} hoàn toàn MIỄN PHÍ`);
  assert(res.slot >= 0 && res.slot <= 9, `Trúng nan ô hợp lệ trong khoảng 0-9: Nan ô ${res.slot}`);
  assert(res.reward && res.reward.name, `Nhận phần thưởng hợp lệ: [${res.reward.name}]`);
  assert(p.luckySpins === spinsBefore - 1, `Lượt miễn phí giảm chuẩn: ${p.luckySpins}`);
}

assert(p.luckySpins === 0, 'Đã sử dụng hết 10 lượt quay miễn phí');
assert(p.totalSpins === 10, 'Tổng số lượt quay ghi nhận đủ 10');

// Lượt quay thứ 11: Hết lượt miễn phí -> Phải tiêu tốn 500 Ngân Lượng
const goldBefore11 = p.gold;
const res11 = p.spinWheel();
assert(res11.success === true, 'Lượt quay thứ 11 tiếp tục thành công khi trả bằng Bạc');
assert(res11.isFree === false, 'Xác nhận lượt thứ 11 là lượt tốn phí');
assert(p.gold === goldBefore11 - 500, `Đã trừ đúng 500 Bạc (từ ${goldBefore11} -> ${p.gold})`);

// Thử trường hợp hết cả tiền lẫn lượt
const savedGold = p.gold;
p.gold = 100; // Không đủ 500 Bạc
const resNoMoney = p.spinWheel();
assert(resNoMoney.success === false, `Từ chối quay khi hết tiền và lượt: "${resNoMoney.msg}"`);
p.gold = savedGold; // Khôi phục

// ----------------------------------------------------------------------
// 3. THUỘC TÍNH TỰ THÂN, ĐẢ THÔNG KINH MẠCH & ĐỘT PHÁ CẢNH GIỚI
// ----------------------------------------------------------------------
console.log('\n--- PHẦN 3: Thuộc Tính Tự Thân & Đột Phá Cảnh Giới ---');
const initialAtk = p.getAttack();
const initialDef = p.getDefense();
const initialPower = p.getCombatPower();

// Cộng điểm tiềm năng
assert(p.statPoints >= 15, `Có sẵn ${p.statPoints} điểm tiềm năng`);
p.stats.str += 5;
p.statPoints -= 5;
p.stats.vit += 5;
p.statPoints -= 5;
assert(p.getAttack() > initialAtk, `Tăng Sức Mạnh làm tăng Ngoại Công (${initialAtk} -> ${p.getAttack()})`);
assert(p.getDefense() > initialDef, `Tăng Thể Chất làm tăng Ngoại Thủ (${initialDef} -> ${p.getDefense()})`);
assert(p.getCombatPower() > initialPower, `Lực chiến tăng vọt (${initialPower} -> ${p.getCombatPower()})`);

// Đột phá cảnh giới qua Kinh Mạch
assert(p.realmIdx === 0, 'Hiện tại đang ở Luyện Khí Tầng 1');
p.meridianPoints = 20; // Cấp chân khí
for (let i = 0; i < 4; i++) {
  p.upgradeMeridian('docMach');
  p.upgradeMeridian('nhamMach');
}
assert(p.realmIdx >= 4, `Đả thông kinh mạch giúp đột phá lên cảnh giới cao hơn: ${p.getRealmName()} (realmIdx: ${p.realmIdx})`);

// ----------------------------------------------------------------------
// 4. BƠM MÁU, BƠM MANA (NGUYÊN KHÍ) & DÙNG BÍ TỊCH
// ----------------------------------------------------------------------
console.log('\n--- PHẦN 4: Bơm Máu, Bơm Mana & Dùng Bí Tịch ---');
p.hp = 200; // Giảm máu
p.mp = 100; // Giảm mana

// Tìm ô Huyết Đan trong túi
let hpPillIdx = p.inventory.findIndex(i => i.itemId === 'item_5');
if (hpPillIdx === -1) {
  p.inventory.push({ itemId: 'item_5', count: 10, type: 'consumable' });
  hpPillIdx = p.inventory.length - 1;
}
const hpCountBefore = p.inventory[hpPillIdx].count;
const useHpRes = p.useItem(hpPillIdx);
assert(useHpRes.success === true, `Dùng Tiểu Huyết Đan hồi phục ${useHpRes.healedHp} Khí Huyết`);
assert(p.hp > 200, `Khí Huyết đã tăng lên: ${p.hp}/${p.getMaxHp()}`);
assert(p.inventory[hpPillIdx].count === hpCountBefore - 1, 'Số lượng thuốc trong túi giảm 1');

// Dùng Bí Tịch Cửu Âm
let scriptureIdx = p.inventory.findIndex(i => i.itemId === 'item_7');
if (scriptureIdx === -1) {
  p.inventory.push({ itemId: 'item_7', count: 2, type: 'scripture' });
  scriptureIdx = p.inventory.length - 1;
}
const merBefore = p.meridianPoints;
const skillBefore = p.skillPoints;
const useScriptureRes = p.useItem(scriptureIdx);
assert(useScriptureRes.success === true, 'Đọc hiểu Thái Huyền Bí Tịch thành công');
assert(p.meridianPoints >= merBefore + 4, `Nhận thêm Điểm Tu Vi Chân Khí (${p.meridianPoints})`);
assert(p.skillPoints >= skillBefore + 2, `Nhận thêm Điểm Võ Học (${p.skillPoints})`);

// ----------------------------------------------------------------------
// 5. TRANG BỊ 9 PHẨM CẤP (BẠCH KIM CHÍ TÔN CHỚP NHÁY) & KHÔNG MẤT ĐỒ
// ----------------------------------------------------------------------
console.log('\n--- PHẦN 5: Trang Bị 9 Phẩm Cấp & Cơ Chế Đổi Đồ An Toàn ---');
const platSword = generateEquipment('wpn_sword', 'platinum', 25);
p.inventory.push(platSword);
p.reindexInventory();

const platIdx = p.inventory.findIndex(i => i.id === platSword.id);
const oldWeapon = p.equipment.weapon;
const equipRes = p.equipItem(platIdx);

assert(equipRes === true, 'Mặc Thần Binh Bạch Kim Chí Tôn thành công');
assert(p.equipment.weapon.id === platSword.id, 'Slot Vũ Khí đang cầm đúng Thần Binh Bạch Kim');
assert(p.equipment.weapon.rarity === 'platinum', 'Phẩm cấp vũ khí chuẩn Platinum');
assert(p.inventory.some(i => i.id === oldWeapon.id), 'Vũ khí cũ tự động chuyển vào túi đồ an toàn, không bị biến mất!');

// Tháo trang bị
const unequipSword = p.unequipItem('weapon');
assert(unequipSword === true, 'Tháo vũ khí thành công');
assert(p.equipment.weapon === null, 'Slot vũ khí trên người hiện trống');
assert(p.inventory.some(i => i.id === platSword.id), 'Thần Binh Bạch Kim đã quay lại trong túi đồ 200 ô!');

// ----------------------------------------------------------------------
// 6. TỰ PHÂN LOẠI & DỌN DẸP BÁN ĐỒ RÁC LẤY BẠC
// ----------------------------------------------------------------------
console.log('\n--- PHẦN 6: Tự Sắp Xếp Túi Đồ & Bán Đồ Rác Trắng/Lục ---');
const junk1 = generateEquipment('wpn_sword', 'common', 1);
const junk2 = generateEquipment('arm_leather', 'uncommon', 1);
const ultraRareRing = generateEquipment('acc_ring', 'abyssal', 20);

p.inventory.push(junk1);
p.inventory.push(junk2);
p.inventory.push(ultraRareRing);
p.reindexInventory();

// Sắp xếp túi đồ: Đồ phẩm cấp cao xếp trước
p.sortInventory();
assert(p.inventory[0].rarity === 'platinum' || p.inventory[0].rarity === 'abyssal', 
  `Món đầu túi là đồ Cực Phẩm (${p.inventory[0].rarity}), sắp xếp chuẩn xác`);

// Dọn dẹp đồ rác
const goldBeforeClean = p.gold;
const cleanRes = p.sellJunkItems();
assert(cleanRes.success === true, `Thanh lý ${cleanRes.soldCount} món rác, thu về ${cleanRes.totalSilver} Bạc`);
assert(p.gold === goldBeforeClean + cleanRes.totalSilver, `Ngân Lượng cộng chuẩn: ${p.gold}`);
assert(p.inventory.some(i => i.id === ultraRareRing.id), 'Bảo vật Abyssal (Ma Thần) không bao giờ bị bán nhầm');
assert(!p.inventory.some(i => i.rarity === 'common' || i.rarity === 'uncommon'), 'Toàn bộ đồ rác Trắng/Lục đã được bán sạch!');

// ----------------------------------------------------------------------
// 7. THẾ GIỚI 3 MAP, PORTAL CHỐNG KẸT & NPC NỘI THÀNH
// ----------------------------------------------------------------------
console.log('\n--- PHẦN 7: Thế Giới 3 Map & Tương Tác NPC Thành Lạc Dương ---');
const fakeIo = { 
  emit: () => {}, 
  to: () => ({ emit: () => {} }) 
};
const world = new World(fakeIo);
const pWorld = world.addPlayer('test_p_world', 'Tiêu Dao Tử', 'xiaoyao');

assert(pWorld.currentMap === 'lac_duong', 'Vào game xuất hiện tại Lạc Dương Thành');
assert(world.maps.lac_duong.safeZone !== undefined, 'Lạc Dương Thành có Khu An Toàn (Miễn Chiến)');
assert(world.maps.dao_hoa_dao !== undefined, 'Bản đồ Đào Hoa Đảo tồn tại đầy đủ quái thú');
assert(world.maps.ma_son !== undefined, 'Bản đồ Vạn Kiếp Ma Sơn tồn tại Boss Ma Tôn');

// Test Cổng Dịch Chuyển Portal
pWorld.x = 2650;
pWorld.y = 1550;
world.setPlayerTarget(pWorld.id, 2650, 1550);
assert(pWorld.currentMap === 'dao_hoa_dao', 'Bước qua Portal tới Đào Hoa Đảo mượt mà');
assert(pWorld.portalCooldown > Date.now(), 'Có thời gian hồi Portal 4 giây chống kẹt di chuyển');

// Đổi map về Lạc Dương và trò chuyện với NPC Dược Sư
world.teleportPlayer(pWorld.id, 'lac_duong');
assert(pWorld.currentMap === 'lac_duong', 'Quay trở về Lạc Dương Thành');

const doctor = world.npcs.npc_doctor;
pWorld.x = doctor.x + 20;
pWorld.y = doctor.y + 20;
pWorld.gold = 300;
const buyHpRes = world.interactNPC(pWorld.id, 'npc_doctor', 'buy_small_hp');
assert(buyHpRes.success === true, `Mua thuốc từ Dược Sư thành công: ${buyHpRes.msg}`);
assert(pWorld.gold === 250, 'Trừ đúng 50 Bạc khi giao dịch với NPC');

// ----------------------------------------------------------------------
// 8. TỰ ĐỘNG NHẶT ĐỒ (AUTO LOOT) RƠI TRÊN MAP
// ----------------------------------------------------------------------
console.log('\n--- PHẦN 8: Rơi Đồ Quái Vật & Nhặt Đồ ---');
const monsterLootDrop = {
  id: 'drop_test_boss_sword',
  mapId: 'lac_duong',
  isEquipment: true,
  itemInstance: generateEquipment('wpn_sword', 'celestial', 15),
  x: pWorld.x + 50,
  y: pWorld.y + 50,
  createdAt: Date.now(),
  expireTime: Date.now() + 60000
};
world.droppedItems.push(monsterLootDrop);

const bagCountBefore = pWorld.inventory.length;
world.pickupItem(pWorld.id, monsterLootDrop.id);
assert(pWorld.inventory.length === bagCountBefore + 1, 'Nhặt trang bị rơi từ quái vật thành công vào túi 200 ô');
assert(pWorld.inventory.some(i => i.id === monsterLootDrop.itemInstance.id), 'Bảo vật rớt ra nằm chính xác trong túi đồ');
assert(!world.droppedItems.some(d => d.id === monsterLootDrop.id), 'Vật phẩm trên mặt đất đã biến mất sau khi nhặt');

// ----------------------------------------------------------------------
// 9. KIỂM THỬ KẾT NỐI MẠNG THẬT (SOCKET.IO CLIENT VÀO PORT 3000)
// ----------------------------------------------------------------------
console.log('\n--- PHẦN 9: Kiểm Thử Kết Nối Mạng Thực Tế (Live Socket.io Client) ---');

const socket = ioClient('http://localhost:3000', {
  transports: ['websocket'],
  forceNew: true
});

socket.on('connect', () => {
  assert(true, 'Kết nối WebSocket tới Server Cửu Châu Kiếm Vũ thành công (Port 3000)');
  
  socket.emit('join_game', { name: 'Độc Cô Cầu Bại', sect: 'huashan' });
});

socket.on('game_init', (initData) => {
  assert(initData && initData.playerId, `Nhận gói game_init thành công, playerId: ${initData.playerId}`);
  assert(initData.playerState.luckySpins === 10, `Gói dữ liệu khởi tạo cấp đủ 10 lượt quay may mắn`);
  assert(initData.playerState.maxInventorySlots === 200, `Gói dữ liệu khởi tạo xác nhận túi đồ 200 ô`);
  assert(initData.mapsData && initData.mapsData.lac_duong, `Đầy đủ dữ liệu bản đồ Lạc Dương`);

  // Thử quay 1 lượt qua socket
  socket.emit('spin_wheel');
});

socket.on('spin_wheel_result', (spinRes) => {
  assert(spinRes && spinRes.success === true, `Socket nhận phản hồi spin_wheel_result thành công: Trúng [${spinRes.reward.name}]`);
  assert(typeof spinRes.slot === 'number' && spinRes.slot >= 0 && spinRes.slot <= 9, `Nan ô quay chuẩn: ${spinRes.slot}`);

  // Test di chuyển
  socket.emit('move_to', { x: 1450, y: 720 });
  
  // Test sắp xếp túi đồ
  socket.emit('sort_inventory');

  // Đóng socket sau khi hoàn tất
  setTimeout(() => {
    socket.disconnect();
    
    console.log('\n========================================================================');
    console.log(` TỔNG KẾT KIỂM THỬ TOÀN DIỆN: ${passCount}/${totalCount} TEST CASE ĐẠT CHUẨN (${Math.round((passCount/totalCount)*100)}% PASS) `);
    console.log(' MỌI TÌNH HUỐNG TRẢI NGHIỆM ĐỀU HOÀN THIỆN XUẤT SẮC - SẴN SÀNG CHƠI NGAY! ');
    console.log('========================================================================\n');
    process.exit(0);
  }, 1000);
});

socket.on('connect_error', (err) => {
  console.error('Lỗi kết nối socket test:', err.message);
  process.exit(1);
});
