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
  await delay(1200);

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

  // Di chuyển chuột đến ô trang bị trên người (ví dụ ô vũ khí kiếm hoặc áo giáp để xem kích hoạt đồ bộ)
  const equipSlotWeapon = await page.$('.slot-equip[data-slot="weapon"]');
  if (equipSlotWeapon) {
    const box = await equipSlotWeapon.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await delay(800);
    }
  }

  const tooltipSnap = path.join(ARTIFACT_DIR, 'verify_v4_8_tooltip_equipped_weapon.png');
  await page.screenshot({ path: tooltipSnap });
  console.log('✓ Đã chụp ảnh tooltip vũ khí:', tooltipSnap);

  // Di chuyển chuột đến ô áo giáp để xem kích hoạt set bonus
  const equipSlotArmor = await page.$('.slot-equip[data-slot="armor"]');
  if (equipSlotArmor) {
    const box = await equipSlotArmor.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await delay(800);
    }
  }

  const tooltipArmorSnap = path.join(ARTIFACT_DIR, 'verify_v4_9_tooltip_setbonus_armor.png');
  await page.screenshot({ path: tooltipArmorSnap });
  console.log('✓ Đã chụp ảnh tooltip áo giáp:', tooltipArmorSnap);

  await browser.close();
}

run();
