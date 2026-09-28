const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Bắt đầu kịch bản kiểm thử Cửu Châu Kiếm Vũ - Săn Boss & EXP & Map Tiên Giới...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // 1. Đăng ký/Đăng nhập tài khoản test ngẫu nhiên
  const testUser = 'boss_test_' + Math.floor(Math.random() * 10000);
  console.log(`👉 Đăng ký tài khoản: ${testUser}...`);
  await page.click('#tab-btn-register');
  await sleep(300);
  await page.type('#auth-reg-user', testUser);
  await page.type('#auth-reg-pass', '123456');
  await page.type('#auth-reg-repass', '123456');
  await page.click('#btn-submit-register');
  await sleep(1800);

  console.log(`👉 Đăng nhập tài khoản: ${testUser}...`);
  await page.type('#auth-login-pass', '123456');
  await page.click('#btn-submit-login');
  await sleep(1500);

  console.log('👉 Tạo nhân vật mới...');
  await page.click('#btn-open-create-char');
  await sleep(600);
  await page.click('#char-name-input', { clickCount: 3 });
  await page.type('#char-name-input', 'ThầnLongHiệp');
  await page.click('#btn-submit-create-char');
  await sleep(2500);

  console.log('👉 Đã vào thế giới Cửu Châu!');

  // Focus vào canvas
  await page.click('#game-canvas');
  await sleep(800);

  // 2. Chụp ảnh Màn hình chính (Kiểm tra EXP HUD & Bottom EXP Bar)
  console.log('📸 1. Kiểm tra HUD EXP và Bottom EXP Bar...');
  const hudExp = await page.$eval('#player-exp-text', el => el.textContent);
  const bottomExp = await page.$eval('#bottom-exp-text', el => el.textContent);
  console.log('   HUD EXP Text:', hudExp);
  console.log('   Bottom EXP Bar Text:', bottomExp);

  const shot1 = path.join(__dirname, 'shot1_hud_and_bottom_exp.png');
  await page.screenshot({ path: shot1 });
  console.log('   Đã lưu ảnh:', shot1);

  // 3. Mở Bảng Săn Boss Thế Giới (Click nút dock Săn Boss)
  console.log('📸 2. Mở Bảng Săn Boss Thế Giới...');
  await page.click('#btn-dock-hunt-boss');
  await sleep(2000);

  const bossCardsCount = await page.$$eval('.boss-hunt-card', els => els.length);
  const bossNames = await page.$$eval('.boss-hunt-card h4', els => els.map(e => e.textContent.trim()));
  console.log(`   Tìm thấy ${bossCardsCount} Boss trong Bảng Săn Boss:`, bossNames.slice(0, 8));

  const shot2 = path.join(__dirname, 'shot2_world_boss_hunt_modal.png');
  await page.screenshot({ path: shot2 });
  console.log('   Đã lưu ảnh Săn Boss:', shot2);

  // 4. Thử Phi Thân Truy Sát một Boss Tu Tiên
  console.log('👉 Thử bấm [⚔ Phi Thân Truy Sát] tới Boss đầu tiên...');
  const teleportBtn = await page.$('.btn-hunt-teleport:not(.disabled)');
  if (teleportBtn) {
    await teleportBtn.click();
    await sleep(2500);
    console.log('   Đã bấm Phi Thân Truy Sát!');
    const shot3 = path.join(__dirname, 'shot3_teleported_to_boss.png');
    await page.screenshot({ path: shot3 });
    console.log('   Đã lưu ảnh Dịch Chuyển:', shot3);
  }

  // Đóng modal săn boss
  await page.evaluate(() => {
    window.uiManager?.closeAllModals();
  });
  await sleep(600);

  // 5. Mở Bản Đồ Thế Giới (Phím M) và kiểm tra 2 Tab Phàm Giới & Tiên Giới
  console.log('📸 3. Mở Bản Đồ Thế Giới...');
  await page.click('#btn-dock-map');
  await sleep(1200);
  const shot4 = path.join(__dirname, 'shot4_map_mortal_realm.png');
  await page.screenshot({ path: shot4 });
  console.log('   Đã lưu ảnh Phàm Giới:', shot4);

  // Chuyển sang Tab Tiên Giới
  console.log('👉 Chuyển sang Tab Tiên Giới Huyền Cảnh...');
  await page.click('#tab-btn-map-immortal');
  await sleep(1200);
  const immortalCards = await page.$$eval('.map-select-card h4', els => els.map(e => e.textContent.trim()));
  console.log('   Danh sách Map Tiên Giới:', immortalCards);
  const shot5 = path.join(__dirname, 'shot5_map_immortal_realm_locked.png');
  await page.screenshot({ path: shot5 });
  console.log('   Đã lưu ảnh Tiên Giới (kèm khóa):', shot5);

  // Đóng modal map
  await page.evaluate(() => {
    window.uiManager?.closeAllModals();
  });
  await sleep(600);

  // 6. Test Túi Đồ, Thọ Nguyên Đan, Tu Vi Đan
  console.log('👉 Thêm vật phẩm test vào túi: Thọ Nguyên Đan, Tu Vi Đan, Đột Phá Đan...');
  await page.evaluate(() => {
    window.gameEngine?.socket?.emit('chat', { message: '!additem item_lifespan_pill 5' });
    window.gameEngine?.socket?.emit('chat', { message: '!additem item_tuvi_pill 5' });
    window.gameEngine?.socket?.emit('chat', { message: '!additem item_breakthrough_pill 3' });
  });
  await sleep(1500);

  // Mở Túi Đồ
  await page.click('#btn-dock-inv');
  await sleep(1500);
  const shot6 = path.join(__dirname, 'shot6_inventory_with_pills.png');
  await page.screenshot({ path: shot6 });
  console.log('   Đã lưu ảnh Túi Đồ:', shot6);

  console.log('✅ Hoàn thành toàn bộ kiểm thử tự động!');
  await browser.close();
})();
