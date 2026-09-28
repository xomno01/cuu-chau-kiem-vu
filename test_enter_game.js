const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701';
const delay = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  console.log('=== TEST VÀO GIANG HỒ VỚI TÀI KHOẢN ĐÃ CÓ NHÂN VẬT ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  page.on('console', msg => console.log('[Browser Console]:', msg.text()));

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
  await delay(1500);

  // Đăng nhập với tài khoản tiendao_3399 (đã có nhân vật Bắc Minh 3399)
  console.log('1. Đăng nhập tài khoản tiendao_3399');
  await page.evaluate(() => {
    document.getElementById('auth-login-user').value = 'tiendao_3399';
    document.getElementById('auth-login-pass').value = '123456';
    document.getElementById('btn-submit-login').click();
  });
  await delay(2000);

  // Bấm nút "⚔ VÀO GIANG HỒ" trên thẻ nhân vật
  console.log('2. Bấm nút ⚔ VÀO GIANG HỒ');
  const entered = await page.evaluate(() => {
    const btn = document.querySelector('.char-select-card .btn-enter-char');
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Nút Vào Giang Hồ đã bấm:', entered);
  await delay(3000);

  // Kiểm tra trạng thái display của screen-login và screen-game
  const screenStates = await page.evaluate(() => {
    const l = document.getElementById('screen-login');
    const g = document.getElementById('screen-game');
    return {
      loginDisplay: l ? l.style.display : null,
      gameDisplay: g ? g.style.display : null,
      isGameStarted: window.isGameStarted,
      myPlayerId: window.myPlayerId
    };
  });
  console.log('Screen States sau khi bấm Vào Giang Hồ:', screenStates);

  // Chụp ảnh màn hình trong game
  const inGameSnap = path.join(ARTIFACT_DIR, 'verify_v5_2_hud_cultivation_stats.png');
  await page.screenshot({ path: inGameSnap });
  console.log('✓ Đã chụp ảnh màn hình trong game:', inGameSnap);

  // Mở modal Tu Tiên (Phím Y)
  console.log('3. Mở Modal Tu Tiên (Phím Y)');
  await page.keyboard.press('KeyY');
  await delay(1200);

  const snapCultivRealms = path.join(ARTIFACT_DIR, 'verify_v5_3_cultivation_modal_realms.png');
  await page.screenshot({ path: snapCultivRealms });
  console.log('✓ Đã chụp ảnh Modal Tu Tiên - Cảnh Giới & Thọ Nguyên:', snapCultivRealms);

  // Tab 4 Môn Phái
  console.log('4. Chuyển sang Tab 4 Môn Phái Tiên Đạo');
  await page.evaluate(() => {
    document.getElementById('tab-cultiv-sects').click();
  });
  await delay(1000);

  const snapCultivSects = path.join(ARTIFACT_DIR, 'verify_v5_4_cultivation_modal_sects.png');
  await page.screenshot({ path: snapCultivSects });
  console.log('✓ Đã chụp ảnh Modal Tu Tiên - 4 Đại Môn Phái Tiên Đạo:', snapCultivSects);

  await page.keyboard.press('KeyY');
  await delay(500);

  // 5. Tặng đồ Tu Tiên x5 vào túi đồ
  console.log('5. Tặng đồ Tu Tiên x5 có Orbit Ring');
  await page.evaluate(() => {
    window.socket.emit('test_grant_tuvi', { tuvi: 50000 });
    window.socket.emit('test_grant_cultiv_gear', {
      slot: 'weapon',
      setId: 'set_thai_thanh',
      rarity: 'platinum'
    });
    window.socket.emit('test_grant_cultiv_gear', {
      slot: 'armor',
      setId: 'set_thai_thanh',
      rarity: 'platinum'
    });
  });
  await delay(1500);

  // Mở túi đồ (phím B)
  console.log('6. Mở túi đồ (Phím B)');
  await page.keyboard.press('KeyB');
  await delay(1200);

  // Hover chuột vào ô trang bị đầu tiên trong túi đồ
  const firstInvCell = await page.$('.inv-cell-200 img');
  if (firstInvCell) {
    const box = await firstInvCell.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await delay(1200);
    }
  }

  const snapGearTooltip = path.join(ARTIFACT_DIR, 'verify_v5_5_cultivation_gear_orbit_and_tooltip.png');
  await page.screenshot({ path: snapGearTooltip });
  console.log('✓ Đã chụp ảnh Túi đồ - Vòng xoay Orbit Ring & Tooltip Tu Tiên:', snapGearTooltip);

  await page.keyboard.press('KeyB');
  await delay(500);

  // 7. Bật Auto Treo Máy (Phím Z)
  console.log('7. Bật Auto Treo Máy (Phím Z)');
  await page.keyboard.press('KeyZ');
  await delay(3000);

  const snapAuto = path.join(ARTIFACT_DIR, 'verify_v5_6_autocombat_smooth.png');
  await page.screenshot({ path: snapAuto });
  console.log('✓ Đã chụp ảnh Auto Treo Máy:', snapAuto);

  await browser.close();
  console.log('=== HOÀN TẤT KIỂM THỬ THỰC TẾ ===');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
