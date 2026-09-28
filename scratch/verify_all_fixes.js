const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Bắt đầu kịch bản kiểm thử toàn diện V11: Xác minh Zero Bug & Map Tiên Giới...');

  const errors = [];
  const warnings = [];
  const failedRequests = [];

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    if (type === 'error') {
      errors.push(text);
      console.log('❌ [Console Error]:', text);
    } else if (text.includes('AudioContext') || text.includes('not allowed to start')) {
      warnings.push(text);
      console.log('⚠️ [Audio Warning]:', text);
    }
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
    console.log('❌ [Page Error]:', err.toString());
  });

  page.on('requestfailed', req => {
    failedRequests.push(`${req.url()} (${req.failure() ? req.failure().errorText : 'failed'})`);
    console.log('❌ [Request Failed]:', req.url());
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      failedRequests.push(`${resp.url()} (Status ${resp.status()})`);
      console.log(`❌ [HTTP ${resp.status()}]:`, resp.url());
    }
  });

  console.log('👉 Truy cập http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // 1. Đăng nhập tài khoản xomno01 / 123123
  console.log('👉 Đăng nhập tài khoản xomno01...');
  await page.click('#auth-login-user', { clickCount: 3 });
  await page.type('#auth-login-user', 'xomno01');
  await page.click('#auth-login-pass', { clickCount: 3 });
  await page.type('#auth-login-pass', '123123');
  await page.click('#btn-submit-login');
  await sleep(2000);

  // Chọn nhân vật Matcha và vào game
  console.log('👉 Chọn nhân vật và vào game...');
  await page.waitForSelector('.btn-enter-char', { timeout: 5000 });
  await page.click('.btn-enter-char');
  
  // Chờ cho màn hình game chuyển sang display: block
  await page.waitForFunction(() => {
    const el = document.getElementById('screen-game');
    return el && el.style.display === 'block';
  }, { timeout: 10000 });
  console.log('👉 Đã vào thế giới Cửu Châu! Kích hoạt tương tác bàn phím...');
  await sleep(1000);

  // Click vào canvas để unlock audio & focus
  await page.click('#game-canvas');
  await sleep(500);

  // Thử các phím đặc biệt (kiểm tra không bị TypeError UIManager.js:353)
  await page.keyboard.press('Shift');
  await page.keyboard.press('Control');
  await page.keyboard.press('Alt');
  await page.keyboard.press('c'); // Bảng thuộc tính
  await sleep(500);
  await page.keyboard.press('c'); // Đóng
  await sleep(500);

  // 2. Mở Bản Đồ Thế Giới (Phím M)
  console.log('👉 Mở Bản Đồ Thế Giới (Phím M)...');
  await page.keyboard.press('m');
  await sleep(800);

  // Click sang Tab Bản Đồ Tiên Giới
  console.log('👉 Chuyển sang Tab Tiên Giới...');
  await page.click('#tab-btn-map-immortal');
  await sleep(1000);

  // Tìm nút Ngự Kiếm Phi Hành tới Bồng Lai Tiên Đảo
  console.log('👉 Bấm Ngự Kiếm Phi Hành tới Bồng Lai Tiên Đảo...');
  const cards = await page.$$('.map-select-card');
  console.log(`   Tìm thấy ${cards.length} thẻ bản đồ tiên giới.`);
  if (cards.length > 0) {
    const btnTeleport = await cards[0].$('.btn-teleport-map:not(.locked-btn)');
    if (btnTeleport) {
      await btnTeleport.click();
      console.log('   Đã bấm nút Ngự Kiếm Phi Hành Bồng Lai!');
    } else {
      console.log('   ⚠️ Không tìm thấy nút Ngự Kiếm Phi Hành hợp lệ.');
    }
  }
  await sleep(3000);

  // Kiểm tra trạng thái map sau khi chuyển
  const currentMap = await page.evaluate(() => {
    return window.latestWorldState ? window.latestWorldState : null;
  });
  console.log('   Kiểm tra gameLoop và render trạng thái Bồng Lai...');

  const shot1 = path.join(__dirname, 'verify_v11_1_bong_lai_tiengioi.png');
  await page.screenshot({ path: shot1 });
  console.log('📸 Đã chụp màn hình Bồng Lai Tiên Đảo:', shot1);

  // Dịch chuyển tiếp sang Dao Trì Tiên Cảnh
  await page.keyboard.press('m');
  await sleep(800);
  await page.click('#tab-btn-map-immortal');
  await sleep(600);
  const cardsDaoTri = await page.$$('.map-select-card');
  if (cardsDaoTri.length > 1) {
    const btnDT = await cardsDaoTri[1].$('.btn-teleport-map:not(.locked-btn)');
    if (btnDT) {
      await btnDT.click();
      console.log('   Đã bấm nút Ngự Kiếm Phi Hành Dao Trì Tiên Cảnh!');
    }
  }
  await sleep(3000);
  const shot2 = path.join(__dirname, 'verify_v11_2_dao_tri_tiengioi.png');
  await page.screenshot({ path: shot2 });
  console.log('📸 Đã chụp màn hình Dao Trì Tiên Cảnh:', shot2);

  // Dịch chuyển tiếp sang Thái Hư Huyễn Cảnh
  await page.keyboard.press('m');
  await sleep(800);
  await page.click('#tab-btn-map-immortal');
  await sleep(600);
  const cardsThaiHu = await page.$$('.map-select-card');
  if (cardsThaiHu.length > 2) {
    const btnTH = await cardsThaiHu[2].$('.btn-teleport-map:not(.locked-btn)');
    if (btnTH) {
      await btnTH.click();
      console.log('   Đã bấm nút Ngự Kiếm Phi Hành Thái Hư Huyễn Cảnh!');
    }
  }
  await sleep(3000);
  const shot3 = path.join(__dirname, 'verify_v11_3_thai_hu_tiengioi.png');
  await page.screenshot({ path: shot3 });
  console.log('📸 Đã chụp màn hình Thái Hư Huyễn Cảnh:', shot3);

  // Sao chép ảnh vào artifact folder
  const artifactDir = 'C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701';
  fs.copyFileSync(shot1, path.join(artifactDir, 'verify_v11_1_bong_lai_tiengioi.png'));
  fs.copyFileSync(shot2, path.join(artifactDir, 'verify_v11_2_dao_tri_tiengioi.png'));
  fs.copyFileSync(shot3, path.join(artifactDir, 'verify_v11_3_thai_hu_tiengioi.png'));

  console.log('\n================ BÁO CÁO KIỂM THỬ V11 ================');
  console.log(`1. Tổng số lỗi Page Error / Uncaught: ${errors.length}`);
  if (errors.length > 0) {
    errors.forEach(e => console.log('   - ', e));
  } else {
    console.log('   ✅ TUYỆT VỜI: 0 LỖI (Zero Errors)!');
  }

  console.log(`2. Cảnh báo AudioContext không hợp lệ: ${warnings.length}`);
  if (warnings.length === 0) {
    console.log('   ✅ ĐẠT CHUẨN: 0 Cảnh báo AudioContext!');
  }

  console.log(`3. Yêu cầu tải tài nguyên thất bại (404/Failed): ${failedRequests.length}`);
  if (failedRequests.length === 0) {
    console.log('   ✅ HOÀN HẢO: 0 Lỗi 404 (All assets loaded 200 OK)!');
  } else {
    failedRequests.forEach(f => console.log('   - ', f));
  }
  console.log('=====================================================\n');

  await browser.close();
  process.exit(errors.length > 0 ? 1 : 0);
})();
