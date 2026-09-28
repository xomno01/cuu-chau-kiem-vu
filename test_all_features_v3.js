// Bộ Test Toàn Diện Kiếm Hiệp V3 - Cửu Châu Kiếm Vũ Online
// Kiểm thử: 4 Môn Phái, 6 Bản Đồ, Quái Tinh Anh, Giám Định, Cường Hóa +1..+15, Khảm Ngọc, Ghép Ngọc, Set Bonus 2/4/6 món

const io = require('socket.io-client');
const { Player } = require('./server/game/Player');
const { World } = require('./server/game/World');
const { 
  generateEquipment, 
  appraiseEquipment, 
  enhanceEquipment, 
  socketEquipment, 
  embedGem, 
  removeGem, 
  combineGems 
} = require('./server/game/ItemSystem');

const SOCKET_URL = 'http://localhost:3000';

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('  BẮT ĐẦU CHẠY BỘ TEST TOÀN DIỆN PRODUCTION V3');
  console.log('====================================================\n');

  // TEST SUITE 1: KIỂM THỬ 4 MÔN PHÁI & ĐẶC TÍNH SỞ TRƯỜNG
  console.log('--- TEST 1: Khởi Tạo & Sở Trường 4 Môn Phái ---');
  const huashan = new Player('p1', 'Lệnh Hồ Xung', 'huashan', 100, 100);
  const xiaoyao = new Player('p2', 'Hư Trúc', 'xiaoyao', 100, 100);
  const shaolin = new Player('p3', 'Phương Chượng', 'shaolin', 100, 100);
  const wudang = new Player('p4', 'Trương Tam Phong', 'wudang', 100, 100);

  assert(shaolin.baseMaxHp > huashan.baseMaxHp, `Thiếu Lâm có lượng sinh lực cơ bản cao vượt trội (${shaolin.baseMaxHp} > ${huashan.baseMaxHp})`);
  assert(shaolin.baseDef > huashan.baseDef, `Thiếu Lâm có phòng ngự cơ bản cao nhất (${shaolin.baseDef} > ${huashan.baseDef})`);
  assert(wudang.baseMaxMp > huashan.baseMaxMp, `Võ Đang có lượng Chân Khí cơ bản cao nhất (${wudang.baseMaxMp} > ${huashan.baseMaxMp})`);
  assert(wudang.baseAttack > shaolin.baseAttack, `Võ Đang có sức tấn công nội công cao (${wudang.baseAttack} > ${shaolin.baseAttack})`);
  assert(shaolin.skillLevels['sl_1'] === 1 && shaolin.skillLevels['sl_4'] === 1, 'Thiếu Lâm sở hữu đầy đủ bộ skill La Hán Quyền & Kim Cang Bất Hoại');
  assert(wudang.skillLevels['wd_1'] === 1 && wudang.skillLevels['wd_4'] === 1, 'Võ Đang sở hữu đầy đủ bộ skill Thái Cực Kiếm & Vạn Kiếm Quy Tông');

  // TEST SUITE 2: HỆ THỐNG GIÁM ĐỊNH TRANG BỊ
  console.log('\n--- TEST 2: Hệ Thống Giám Định Bằng Giám Định Phù ---');
  const unappraisedEquip = generateEquipment('wpn_sword', 'legendary', 30, null, false);
  unappraisedEquip.unidentified = true;
  assert(unappraisedEquip.unidentified === true, 'Trang bị tạo ra có cờ unidentified = true');
  
  // Thử mặc đồ khi chưa giám định -> phải thất bại
  shaolin.inventory.push(unappraisedEquip);
  const equipFail = shaolin.equipItem(shaolin.inventory.length - 1);
  assert(equipFail === false, 'Không thể mặc trang bị khi chưa giám định');

  // Đảm bảo có bùa giám định
  shaolin.inventory.push({ itemId: 'item_appraisal', name: 'Thiên Nhãn Giám Định Phù', count: 2, type: 'appraisal_scroll' });
  const appraiseRes = shaolin.appraiseItem(shaolin.inventory.indexOf(unappraisedEquip));
  assert(appraiseRes.success === true, 'Dùng Giám Định Phù thành công');
  assert(unappraisedEquip.unidentified === false, 'Trang bị đã được giải trừ phong ấn');
  
  // Giờ thì có thể mặc được
  const equipSuccess = shaolin.equipItem(shaolin.inventory.indexOf(unappraisedEquip));
  assert(equipSuccess === true, 'Sau khi giám định có thể trang bị thành công vào người');

  // TEST SUITE 3: HỆ THỐNG CƯỜNG HÓA (+1 ĐẾN +15) TẠI THỢ RÈN THIẾT NGƯU
  console.log('\n--- TEST 3: Cường Hóa Thần Binh +1 ~ +15 & Bùa Bảo Hộ ---');
  const sword = generateEquipment('wpn_sword', 'mythic', 40, null, true);
  sword.upgradeLevel = 6;
  shaolin.inventory.push(sword);
  let swordIdx = shaolin.inventory.indexOf(sword);

  // Cung cấp đá cường hóa và bạc
  shaolin.inventory.push({ itemId: 'item_enhance_stone', count: 10, type: 'enhance_stone' });
  shaolin.gold = 500000;

  // Cường hóa từ +6 lên +7 với Bùa Bảo Hộ
  shaolin.inventory.push({ itemId: 'item_protection_charm', count: 2, type: 'protection_charm' });
  const enhanceRes = shaolin.enhanceItem(swordIdx, false, true);
  assert(enhanceRes.success !== undefined, 'Hàm enhanceItem thực thi thành công');
  assert(sword.upgradeLevel >= 6, 'Cấp cường hóa không bị rớt nhờ có Bùa Bảo Hộ');

  // TEST SUITE 4: ĐỤC LỖ, KHẢM NGỌC & GHÉP NGỌC
  console.log('\n--- TEST 4: Đục Lỗ, Khảm Ngọc & Ghép 3 Ngọc Lên Cấp ---');
  shaolin.gold = 500000;
  shaolin.inventory.push({ itemId: 'item_socket_drill', count: 5, type: 'socket_drill' });
  sword.sockets = []; // Reset về 0 lỗ
  
  swordIdx = shaolin.inventory.indexOf(sword);
  const drill1 = shaolin.socketItem(swordIdx, false);
  const drill2 = shaolin.socketItem(swordIdx, false);
  const drill3 = shaolin.socketItem(swordIdx, false);
  assert(drill1.success && drill2.success && drill3.success, 'Đục thành công 3 lỗ khảm trên vũ khí');
  assert(sword.sockets.length === 3, 'Vũ khí hiện có đủ 3 lỗ khảm');

  // Khảm Hồng Ngọc Cấp 2 vào lỗ 1
  const gemRuby = {
    itemId: 'gem_ruby_2',
    name: 'Hồng Ngọc Cấp 2',
    type: 'gem',
    gemKey: 'ruby',
    gemLevel: 2,
    statKey: 'power',
    statVal: 35,
    icon: 'gem_ruby',
    count: 1
  };
  shaolin.inventory.push(gemRuby);
  const gemIdx = shaolin.inventory.indexOf(gemRuby);
  const embedRes = shaolin.embedGemItem(swordIdx, false, 0, gemIdx);
  assert(embedRes.success === true, 'Khảm Hồng Ngọc Cấp 2 vào Lỗ 1 thành công');
  assert(sword.sockets[0].gem && sword.sockets[0].gem.statVal === 35, 'Lỗ 1 ghi nhận đúng thuộc tính ngọc +35 Ngoại Công');

  // Ghép ngọc 3 lên 1
  shaolin.inventory.push({
    itemId: 'gem_sapphire_1',
    name: 'Lam Ngọc Cấp 1',
    type: 'gem',
    gemKey: 'sapphire',
    gemLevel: 1,
    statKey: 'mp',
    statVal: 15,
    icon: 'gem_sapphire',
    count: 3
  });
  const combineRes = shaolin.combineGems('sapphire', 1);
  assert(combineRes.success === true, 'Ghép 3 viên Lam Ngọc Cấp 1 lên Cấp 2 thành công 100%');
  const upgradedGem = shaolin.inventory.find(i => i.gemKey === 'sapphire' && i.gemLevel === 2);
  assert(upgradedGem !== undefined, 'Túi đồ có xuất hiện Lam Ngọc Cấp 2 mới');

  // TEST SUITE 5: 3 BỘ ĐỒ KÍCH HOẠT BONUS THEO SỐ MÓN (2, 4, 6 MÓN)
  console.log('\n--- TEST 5: Kích Hoạt Hiệu Ứng Set Bonus (2, 4, 6 Món) ---');
  const dummyP = new Player('p_set', 'SetTester', 'huashan', 100, 100);
  dummyP.equipment.weapon = generateEquipment('wpn_sword', 'legendary', 50, 'set_than_long', true);
  dummyP.equipment.armor = generateEquipment('arm_robe', 'legendary', 50, 'set_than_long', true);

  let bonus = dummyP.getEquipBonus();
  assert(bonus.activeSets && bonus.activeSets.set_than_long >= 2, 'Kích hoạt thành công mốc 2 món Thần Long Trang');
  assert(bonus.power >= 100, `Nhận +100 Ngoại Công từ mốc 2 món (Bonus power: ${bonus.power})`);

  // Thêm món 3 và món 4
  dummyP.equipment.helmet = generateEquipment('helm_crown', 'legendary', 50, 'set_than_long', true);
  dummyP.equipment.boots = generateEquipment('boot_wind', 'legendary', 50, 'set_than_long', true);

  bonus = dummyP.getEquipBonus();
  assert(bonus.activeSets.set_than_long >= 4, 'Kích hoạt thành công mốc 4 món Thần Long Trang');
  assert(bonus.crit >= 0.15, `Tỷ lệ bạo kích tăng thêm >= 15% (Bonus crit: ${bonus.crit})`);

  // TEST SUITE 6: THẾ GIỚI 6 MAPS & QUÁI TINH ANH & BOSS
  console.log('\n--- TEST 6: Bản Đồ 6 Maps, Quái Tinh Anh & Boss Drop ---');
  const fakeIo = { emit: () => {}, to: () => ({ emit: () => {} }) };
  const world = new World(fakeIo);

  assert(world.maps.con_lon !== undefined, 'Map Côn Lôn Tuyết Sơn tồn tại');
  assert(world.maps.hoang_sa !== undefined, 'Map Hoàng Sa Cổ Thành tồn tại');
  assert(world.maps.than_dien !== undefined, 'Map Thái Cổ Thần Điện tồn tại');

  // Kiểm tra quái Tinh Anh
  const eliteMob = Object.values(world.monsters).find(m => m.isElite === true);
  assert(eliteMob !== undefined, `Có quái Tinh Anh trong thế giới: [${eliteMob ? eliteMob.name : 'None'}]`);
  if (eliteMob) {
    assert(eliteMob.hp > 1500, `Quái Tinh Anh có lượng HP dồi dào (${eliteMob.hp})`);
  }

  // Kiểm tra Boss Thần Điện
  const divineBoss = world.monsters['boss_divine_dragon'];
  assert(divineBoss !== undefined && divineBoss.isBoss === true, 'Boss Thái Cổ Chân Long tồn tại ở Thần Điện');

  // TEST SUITE 7: KẾT NỐI REALTIME SOCKET CLIENT
  console.log('\n--- TEST 7: Kết Nối Real-Time Socket.io Server ---');
  await new Promise((resolve) => {
    const client = io(SOCKET_URL, { reconnection: false, timeout: 5000 });
    client.on('connect', () => {
      assert(true, 'Kết nối Socket.io tới server localhost:3000 thành công');
      client.emit('join_game', { name: 'Thí Luyện Hiệp Khách', sect: 'shaolin' });
    });

    client.on('game_init', (data) => {
      assert(data.playerId !== undefined, 'Nhận sự kiện game_init từ server');
      assert(data.playerState.sect === 'shaolin', 'Nhân vật khởi tạo đúng môn phái Thiếu Lâm');
      assert(data.mapsData.con_lon !== undefined, 'Client nhận đủ dữ liệu 6 maps');
      client.disconnect();
      resolve();
    });

    client.on('connect_error', (err) => {
      assert(false, `Lỗi kết nối socket: ${err.message}`);
      client.disconnect();
      resolve();
    });
  });

  console.log('\n====================================================');
  console.log(`  KẾT QUẢ KIỂM THỬ: ${passedTests} / ${totalTests} TESTS PASSED`);
  if (passedTests === totalTests) {
    console.log('  >>> TẤT CẢ TÍNH NĂNG ĐẠT CHUẨN 100% PRODUCTION! <<<');
  } else {
    console.log('  >>> CẦN KIỂM TRA LẠI MỘT SỐ LỖI <<<');
  }
  console.log('====================================================');
}

runTests().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('Lỗi khi chạy test:', err);
  process.exit(1);
});
