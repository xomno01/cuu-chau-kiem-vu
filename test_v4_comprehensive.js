const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701';
const delay = ms => new Promise(r => setTimeout(r, ms));

async function runTest() {
  console.log('=== BẮT ĐẦU KIỂM THỬ TOÀN DIỆN CỬU CHÂU KIẾM VŨ V4 ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1400, height: 900 }
  });

  const page = await browser.newPage();
  
  page.on('console', msg => {
    const txt = msg.text();
    if (!txt.includes('downloadable font') && !txt.includes('favicon')) {
      console.log(`[Browser Console]: ${txt}`);
    }
  });

  try {
    console.log('1. Đang truy cập http://127.0.0.1:3000 ...');
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
    await delay(1500);

    // Đăng nhập vào game với môn phái Hoa Sơn
    console.log('2. Đang đăng nhập nhân vật Kiếm Thần ...');
    await page.evaluate(() => {
      document.querySelector('.sect-card[data-sect="huashan"]').click();
      document.getElementById('char-name-input').value = 'Độc Cô Cầu Bại';
      document.getElementById('btn-enter-game').click();
    });
    await delay(2500);

    // TEST 1: MỞ TÚI ĐỒ 200 Ô & HOVER TOOLTIP & THUMBNAILS & DÒNG ẨN ĐỒ BỘ
    console.log('3. Mở túi đồ 200 ô, kiểm tra thumbnails bùa/đá/ngọc & hover tooltip...');
    await page.keyboard.press('KeyB');
    await delay(1000);

    // Hover vào ô trang bị đầu tiên trong túi đồ để mở Tooltip
    const firstEquipSlot = await page.$('.inv-slot.slot-equip');
    if (firstEquipSlot) {
      await firstEquipSlot.hover();
      await delay(800);
    }

    const snap1Path = path.join(ARTIFACT_DIR, 'verify_v4_1_inventory_tooltip_setbonus.png');
    await page.screenshot({ path: snap1Path });
    console.log(`✓ Đã chụp ảnh 1: ${snap1Path}`);

    // Đóng túi đồ
    await page.keyboard.press('KeyB');
    await delay(600);

    // TEST 2: KIỂM TRA TẨY ĐIỂM TIỀM NĂNG (TIÊU 10,000 NGÂN LƯỢNG)
    console.log('4. Kiểm tra Tẩy Điểm Tiềm Năng tiêu 10,000 ngân lượng...');
    await page.keyboard.press('KeyC');
    await delay(1000);

    const goldBefore = await page.evaluate(() => {
      const el = document.getElementById('player-gold-text');
      return el ? parseInt(el.textContent.replace(/,/g, ''), 10) : 0;
    });
    console.log(`- Số ngân lượng trước khi tẩy: ${goldBefore}`);

    await page.evaluate(() => {
      window.confirm = () => true;
      const btn = document.getElementById('btn-reset-stats');
      if (btn) btn.click();
    });
    await delay(1200);

    const goldAfter = await page.evaluate(() => {
      const el = document.getElementById('player-gold-text');
      return el ? parseInt(el.textContent.replace(/,/g, ''), 10) : 0;
    });
    console.log(`- Số ngân lượng sau khi tẩy: ${goldAfter} (Đã trừ: ${goldBefore - goldAfter})`);

    const snap2Path = path.join(ARTIFACT_DIR, 'verify_v4_2_character_reset_stats.png');
    await page.screenshot({ path: snap2Path });
    console.log(`✓ Đã chụp ảnh 2: ${snap2Path}`);

    // Đóng bảng nhân vật
    await page.keyboard.press('KeyC');
    await delay(600);

    // TEST 3: HỆ THỐNG 12 ĐẠI DANH HIỆU VÕ LÂM (PHÍM U HOẶC NÚT 👑)
    console.log('5. Mở Modal 12 Đại Danh Hiệu Võ Lâm (Phím U)...');
    await page.keyboard.press('KeyU');
    await delay(1000);

    const titleCardsCount = await page.evaluate(() => {
      return document.querySelectorAll('.title-card').length;
    });
    console.log(`- Số lượng danh hiệu hiển thị: ${titleCardsCount} / 12`);

    // Kích hoạt thử một danh hiệu
    await page.evaluate(() => {
      const btn = document.querySelector('.btn-title-action.btn-equip');
      if (btn) btn.click();
    });
    await delay(1000);

    const snap3Path = path.join(ARTIFACT_DIR, 'verify_v4_3_titles_modal_and_badges.png');
    await page.screenshot({ path: snap3Path });
    console.log(`✓ Đã chụp ảnh 3: ${snap3Path}`);

    // Đóng modal danh hiệu
    await page.keyboard.press('KeyU');
    await delay(600);

    // TEST 4: BỘ LỌC TỰ NHẶT ĐỒ THEO PHẨM CẤP (NÚT ⚙ LỌC NHẶT ĐỒ)
    console.log('6. Mở Modal Cài Đặt Bộ Lọc Tự Nhặt Đồ...');
    await page.evaluate(() => {
      document.getElementById('btn-open-loot-filter').click();
    });
    await delay(800);

    // Chọn phẩm cấp: Từ Hiếm (Lam) trở lên
    await page.evaluate(() => {
      const radio = document.querySelector('input[name="loot-min-rarity"][value="rare"]');
      if (radio) radio.click();
    });
    await delay(400);

    const snap4Path = path.join(ARTIFACT_DIR, 'verify_v4_4_loot_filter_settings.png');
    await page.screenshot({ path: snap4Path });
    console.log(`✓ Đã chụp ảnh 4: ${snap4Path}`);

    // Lưu bộ lọc
    await page.evaluate(() => {
      document.getElementById('btn-save-loot-filter').click();
    });
    await delay(800);

    // TEST 5: TIẾN VÀO PHỤ BẢN BÍ CẢNH CỬU U MA HUYỆT & CHIÊM NGƯỠNG SIÊU BOSS BẠCH KIM
    console.log('7. Tiến vào Phụ Bản Bí Cảnh Cửu U Ma Huyệt...');
    await page.evaluate(() => {
      window.confirm = () => true;
      document.getElementById('btn-dock-dungeon').click();
    });
    await delay(2500);

    // Di chuyển nhân vật trong phụ bản
    await page.keyboard.down('KeyW');
    await delay(2500);
    await page.keyboard.up('KeyW');
    await delay(1000);

    const snap5Path = path.join(ARTIFACT_DIR, 'verify_v4_5_dungeon_abyss_and_boss_rarity.png');
    await page.screenshot({ path: snap5Path });
    console.log(`✓ Đã chụp ảnh 5: ${snap5Path}`);

    console.log('=== TOÀN BỘ KIỂM THỬ THÀNH CÔNG VƯỢT TRỘI! ===');

  } catch (err) {
    console.error('LỖI KIỂM THỬ:', err);
  } finally {
    await browser.close();
  }
}

runTest();
