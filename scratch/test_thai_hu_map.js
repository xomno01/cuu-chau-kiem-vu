const puppeteer = require('puppeteer');
const path = require('path');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Bắt đầu kiểm tra hình ảnh bản đồ Thái Hư Huyễn Cảnh...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ [Console Error]:', msg.text());
    }
  });

  page.on('response', resp => {
    if (resp.status() >= 400) {
      console.log(`❌ [HTTP ${resp.status()}]:`, resp.url());
    }
  });

  console.log('👉 1. Truy cập http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // Đăng nhập tài khoản xomno01
  console.log('👉 2. Đăng nhập tài khoản xomno01...');
  await page.click('#auth-login-user', { clickCount: 3 });
  await page.type('#auth-login-user', 'xomno01');
  await page.click('#auth-login-pass', { clickCount: 3 });
  await page.type('#auth-login-pass', '123123');
  await page.click('#btn-submit-login');
  await sleep(2000);

  // Vào game với Matcha
  console.log('👉 3. Vào game với nhân vật Matcha...');
  await page.waitForSelector('.btn-enter-char', { timeout: 5000 });
  await page.click('.btn-enter-char');

  await page.waitForFunction(() => {
    const el = document.getElementById('screen-game');
    return el && el.style.display === 'block';
  }, { timeout: 10000 });
  console.log('✅ Đã vào game thành công!');
  await sleep(1500);

  // Mở Bản Đồ Thế Giới (Phím M)
  console.log('👉 4. Mở Bản Đồ Thế Giới (Phím M)...');
  await page.keyboard.press('m');
  await sleep(800);

  // Chuyển sang Tab Tiên Giới
  console.log('👉 5. Chuyển sang Tab Tiên Giới...');
  await page.click('#tab-btn-map-immortal');
  await sleep(1000);

  // Chụp ảnh thẻ Bản Đồ Tiên Giới (xác minh thumbnail Thái Hư Huyễn Cảnh)
  const shotCard = path.join('C:\\Users\\phamn\\.gemini\\antigravity\\brain\\d3c374a5-59b6-40b1-b4b4-b6e30734a701', 'verify_v13_thai_hu_map_card.png');
  await page.screenshot({ path: shotCard });
  console.log('📸 Đã chụp màn hình Thẻ Bản Đồ Tiên Giới:', shotCard);

  // Tìm nút Ngự Kiếm Phi Hành sang Thái Hư Huyễn Cảnh
  console.log('👉 6. Ngự Kiếm Phi Hành tới Thái Hư Huyễn Cảnh...');
  const teleportClicked = await page.evaluate(() => {
    const cards = document.querySelectorAll('.map-select-card');
    for (let card of cards) {
      const h4 = card.querySelector('h4');
      if (h4 && h4.innerText.includes('Thái Hư Huyễn Cảnh')) {
        const btn = card.querySelector('.btn-teleport-map:not(.locked-btn)');
        if (btn) {
          btn.click();
          return true;
        }
      }
    }
    return false;
  });
  console.log('👉 Bấm dịch chuyển:', teleportClicked);

  await sleep(3500);

  // Đóng modal bản đồ nếu còn mở
  await page.evaluate(() => {
    if (window.uiManager) window.uiManager.closeAllModals();
  });
  await sleep(1000);

  // Chụp ảnh ingame của Thái Hư Huyễn Cảnh
  const shotGameplay = path.join('C:\\Users\\phamn\\.gemini\\antigravity\\brain\\d3c374a5-59b6-40b1-b4b4-b6e30734a701', 'verify_v13_thai_hu_gameplay.png');
  await page.screenshot({ path: shotGameplay });
  console.log('📸 Đã chụp màn hình Ingame Thái Hư Huyễn Cảnh:', shotGameplay);

  await browser.close();
  console.log('🎉 Hoàn tất kiểm tra Thái Hư Huyễn Cảnh!');
})();
