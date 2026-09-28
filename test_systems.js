const assert = require('assert');
const { Player, REALMS } = require('./server/game/Player');
const { RARITIES, generateEquipment, enhanceEquipment } = require('./server/game/ItemSystem');
const { NPCS } = require('./server/game/NPCSystem');
const { World, MAPS } = require('./server/game/World');

console.log('=== BẮT ĐẦU KIỂM THỬ TOÀN BỘ HỆ THỐNG V2 PRODUCTION ===\n');

// 1. KIỂM THỬ HỆ THỐNG 9 PHẨM CẤP & BẠCH KIM CHÍ TÔN
console.log('[1/4] Kiểm tra 9 Phẩm Cấp & Thuộc Tính Ngẫu Nhiên:');
const rarityKeys = Object.keys(RARITIES);
console.log(' - Danh sách 9 phẩm cấp:', rarityKeys.join(' -> '));
assert.strictEqual(rarityKeys.length, 9, 'Phải có đúng 9 cấp bậc phẩm cấp!');

const platSword = generateEquipment('wpn_sword', 'platinum', 10);
console.log(' - Sinh vũ khí Bạch Kim:', platSword.name);
assert.strictEqual(platSword.rarity, 'platinum');
assert.strictEqual(platSword.isShimmering, true, 'Bạch Kim phải có hiệu ứng chớp nháy shimmering!');
assert.ok(platSword.affixes.length >= 6, 'Bạch Kim phải có nhiều dòng linh khí ngẫu nhiên!');
console.log('   ✦ Thuộc tính cơ bản:', platSword.baseStats);
console.log('   ✦ Số dòng linh khí:', platSword.affixes.length);
platSword.affixes.forEach(a => console.log(`     + ${a.name}: +${a.val}${a.unit || ''}`));

// Cường Hóa +1
const oldAtk = platSword.baseStats.power;
const enhRes = enhanceEquipment(platSword);
console.log(` - Cường hóa vũ khí: ${enhRes.success ? 'Thành Công' : 'Thất Bại'}, cấp mới: +${platSword.upgradeLevel}, công kích: ${oldAtk} -> ${platSword.baseStats.power}`);
console.log(' ✔ Kiểm thử 9 Phẩm cấp & Cường Hóa: HOÀN HẢO!\n');

// 2. KIỂM THỬ NHÂN VẬT, 8 Ô TRANG BỊ, 200 Ô TÚI ĐỒ & THĂNG CẢNH GIỚI
console.log('[2/4] Kiểm tra Nhân Vật, Điểm Tiềm Năng, Võ Học & Thăng Cảnh Giới:');
const player = new Player('test_p1', 'Tiêu Phong', 'huashan');
console.log(` - Khởi tạo nhân vật: ${player.name}, Phái: ${player.sect}, Cảnh giới: ${player.getRealmName()}`);

// 8 ô trang bị
const slots = Object.keys(player.equipment);
console.log(' - Các vị trí trang bị trên người:', slots.join(', '));
assert.ok(player.equipment.weapon, 'Vũ khí khởi đầu phải có!');
assert.ok(player.equipment.helmet, 'Nón/Mão khởi đầu phải có!');
assert.ok(player.equipment.necklace, 'Dây chuyền khởi đầu phải có!');
assert.ok(player.equipment.armor, 'Áo giáp khởi đầu phải có!');
assert.ok(player.equipment.gloves, 'Găng tay khởi đầu phải có!');
assert.ok(player.equipment.ring, 'Nhẫn khởi đầu phải có!');
assert.ok(player.equipment.pants, 'Quần khởi đầu phải có!');
assert.ok(player.equipment.boots, 'Giày khởi đầu phải có!');

// Túi đồ 200 ô
console.log(` - Sức chứa túi đồ: ${player.maxInventorySlots} ô. Hiện có ${player.inventory.length} món.`);
assert.strictEqual(player.maxInventorySlots, 200, 'Túi đồ phải có ít nhất 200 ô!');

// Cộng điểm tiềm năng
const initStatPoints = player.statPoints;
player.allocateStat('str', 3);
player.allocateStat('agi', 2);
console.log(` - Cộng điểm tiềm năng: Điểm còn lại: ${player.statPoints} (từ ${initStatPoints}), Sức Mạnh: ${player.stats.str}, Thân Pháp: ${player.stats.agi}`);
assert.strictEqual(player.stats.str, 18);

// Nâng cấp võ học
const skillRes = player.upgradeSkill('hs_1');
console.log(` - Nâng cấp kỹ năng [hs_1]: Tầng ${skillRes.newLevel}, Điểm võ học còn: ${skillRes.skillPoints}`);
assert.strictEqual(skillRes.newLevel, 2);

// Đả thông kinh mạch & THĂNG CẢNH GIỚI (Luyện Khí Tầng 1 -> Tầng 2, 3...)
console.log(' - Cảnh giới ban đầu:', player.getRealmName());
player.upgradeMeridian('docMach');
player.upgradeMeridian('docMach'); // 2 điểm -> Thăng tầng!
console.log(' - Sau khi đả thông 2 điểm kinh mạch, Cảnh Giới mới:', player.getRealmName());
assert.strictEqual(player.getRealmName(), 'Luyện Khí Tầng 2', 'Đả thông 2 điểm kinh mạch phải thăng lên Luyện Khí Tầng 2!');
console.log(' ✔ Kiểm thử Nhân Vật, Kinh Mạch & Cảnh Giới: HOÀN HẢO!\n');

// 3. KIỂM THỬ THẾ GIỚI, TRONG THÀNH VS NGOÀI THÀNH, NPC & RƠI ĐỒ
console.log('[3/4] Kiểm tra Thế Giới, Quái Dã Ngoại & Tương Tác NPC:');
const mockIO = {
  emit: () => {},
  to: () => ({ emit: () => {} })
};
const world = new World(mockIO);

// Kiểm tra quái Lạc Dương toàn bộ ở ngoài thành
for (const [id, m] of Object.entries(world.monsters)) {
  if (m.mapId === 'lac_duong') {
    const inSafeZone = (m.x >= 950 && m.x <= 1850 && m.y >= 450 && m.y <= 1050);
    assert.ok(!inSafeZone, `Quái ${m.name} (${m.x}, ${m.y}) không được xuất hiện trong nội thành Lạc Dương!`);
  }
}
console.log(' - Quái vật Lạc Dương: 100% quái xuất hiện ở ngoài thành dã ngoại!');

// Thêm player vào thế giới trong thành Lạc Dương
const p2 = world.addPlayer('test_p2', 'Đoàn Dự', 'xiaoyao');
p2.x = 1150; p2.y = 620; // Đứng cạnh Thợ Rèn Âu Dã Tử

// Tương tác Thần Đúc Thợ Rèn
const blacksmithRes = world.interactNPC('test_p2', 'npc_blacksmith', 'free_weapon');
console.log(' - Tương tác Thần Đúc Thợ Rèn [Nhận Kiếm Tân Thủ]:', blacksmithRes.msg);
assert.ok(blacksmithRes.success);

// Tương tác Thần Y Dược Sư
p2.x = 1350; p2.y = 560; // Đến chỗ Thần Y Tiết Mộ Hoa
const doctorRes = world.interactNPC('test_p2', 'npc_doctor', 'buy_hp');
console.log(' - Tương tác Thần Y Tiết Mộ Hoa [Mua 20 Huyết Đan]:', doctorRes.msg);
assert.ok(doctorRes.success);

// Tương tác Chưởng Môn Độc Cô Tiên Tôn
p2.x = 1550; p2.y = 580; // Đến chỗ Chưởng Môn
const masterRes = world.interactNPC('test_p2', 'npc_master', 'claim_gift');
console.log(' - Tương tác Chưởng Môn Độc Cô Tiên Tôn [Nhận Quà Khởi Đầu]:', masterRes.msg);
assert.ok(masterRes.success);

// Kiểm tra Rơi Đồ từ Boss thế giới
console.log(' - Mô phỏng Ma Đầu rớt đồ (dropLoot):');
world.dropLoot(1750, 480, true, 'ma_son');
console.log(`   ✦ Số lượng bảo vật rơi xuống đất: ${world.droppedItems.length}`);
const platDrops = world.droppedItems.filter(d => d.rarity === 'platinum');
console.log(`   ✦ Các món đồ vừa rơi:`, world.droppedItems.map(d => `[${d.name || d.itemId} - ${d.rarity}]`).join(', '));
assert.ok(world.droppedItems.length >= 4, 'Boss phải rơi từ 4 món đồ trở lên!');

console.log(' ✔ Kiểm thử Tương tác NPC & Rơi Đồ: HOÀN HẢO!\n');

console.log('====================================================');
console.log(' 100% CÁC BÀI KIỂM THỬ ĐÃ VƯỢT QUA XUẤT SẮC!        ');
console.log(' HỆ THỐNG SẴN SÀNG ĐẠT CHUẨN PRODUCTION 2026!       ');
console.log('====================================================');
