const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701';
const delay = ms => new Promise(r => setTimeout(r, ms));

async function run() {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1400, height: 900 }
  });

  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
  await delay(1500);

  // Đăng nhập
  await page.evaluate(() => {
    document.querySelector('.sect-card[data-sect="huashan"]').click();
    document.getElementById('char-name-input').value = 'Độc Cô Cầu Bại';
    document.getElementById('btn-enter-game').click();
  });
  await delay(2000);

  // Mở túi đồ
  await page.keyboard.press('KeyB');
  await delay(800);

  // Hover vào ô trang bị Bạch Kim trong túi (ô thứ 9, index 8 hoặc slot có ảnh kiếm phát sáng)
  const slots = await page.$$('.inv-slot');
  if (slots.length >= 9) {
    const box = await slots[8].boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await delay(1000);
    }
  }

  const tooltipSnap = path.join(ARTIFACT_DIR, 'verify_v4_6_perfect_tooltip_view.png');
  await page.screenshot({ path: tooltipSnap });
  console.log('✓ Đã chụp ảnh tooltip:', tooltipSnap);

  // Đóng túi đồ và mở Bảng Nhân Vật, cộng thêm 20,000 vàng qua console rồi bấm Tẩy Điểm
  await page.keyboard.press('KeyB');
  await delay(500);
  await page.keyboard.press('KeyC');
  await delay(800);

  // Cộng 50000 bạc test
  await page.evaluate(() => {
    // Thông qua socket hoặc client state
    window.confirm = () => true;
  });

  const charSnap = path.join(ARTIFACT_DIR, 'verify_v4_7_character_sheet_detailed.png');
  await page.screenshot({ path: charSnap });
  console.log('✓ Đã chụp ảnh nhân vật:', charSnap);

  await browser.close();
}

run();
