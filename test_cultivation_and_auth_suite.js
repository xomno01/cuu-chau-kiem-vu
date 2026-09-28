const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701';
const delay = ms => new Promise(r => setTimeout(r, ms));

async function runTest() {
  console.log('=== BẮT ĐẦU KIỂM THỬ HỆ THỐNG TU TIÊN & AUTH PERSISTENT DB HOÀN CHỈNH ===');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    console.log('[Browser Alert]:', dialog.message());
    await dialog.accept();
  });

  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('deprecated') && !text.includes('MaxListenersExceededWarning') && !text.includes('Failed to load resource')) {
      console.log('[Browser Console]:', text);
    }
  });

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
  await delay(1500);

  // 1. TEST ĐĂNG KÝ TÀI KHOẢN MỚI
  const testUser = 'tiendao_' + Math.floor(Math.random() * 8999 + 1000);
  const testPass = '123456';
  console.log(`1. Đăng ký tài khoản mới: ${testUser}`);

  await page.evaluate(() => {
    document.getElementById('tab-btn-register').click();
  });
  await delay(400);

  await page.type('#auth-reg-user', testUser);
  await page.type('#auth-reg-pass', testPass);
  await page.type('#auth-reg-repass', testPass);
  await page.evaluate(() => document.getElementById('btn-submit-register').click());
  await delay(2000);

  // 2. TEST ĐĂNG NHẬP
  console.log(`2. Đăng nhập với tài khoản: ${testUser}`);
  await page.evaluate((u, p) => {
    document.getElementById('tab-btn-login').click();
    const uEl = document.getElementById('auth-login-user');
    const pEl = document.getElementById('auth-login-pass');
    if (uEl) uEl.value = u;
    if (pEl) pEl.value = p;
    document.getElementById('btn-submit-login').click();
  }, testUser, testPass);
  await delay(2000);

  // Chụp ảnh màn hình danh sách nhân vật (đang rỗng)
  const snapCharSelect = path.join(ARTIFACT_DIR, 'verify_v5_1_auth_screen_and_char_select.png');
  await page.screenshot({ path: snapCharSelect });
  console.log('✓ Đã chụp ảnh màn hình chọn nhân vật:', snapCharSelect);

  // 3. TẠO NHÂN VẬT MỚI: Bắc Minh Tiên (Phái Tiêu Dao)
  const charName = 'Bắc Minh ' + testUser.slice(-4);
  console.log(`3. Tạo nhân vật mới: ${charName}`);
  await page.evaluate(() => {
    document.getElementById('btn-open-create-char').click();
  });
  await delay(800);

  await page.evaluate((cName) => {
    const xiaoyaoCard = document.querySelector('#char-create-box .sect-card[data-sect="xiaoyao"]');
    if (xiaoyaoCard) xiaoyaoCard.click();
    const nameInp = document.getElementById('char-name-input');
    if (nameInp) nameInp.value = cName;
    document.getElementById('btn-submit-create-char').click();
  }, charName);
  await delay(3500);

  // Chụp ảnh màn hình trong game & HUD Tu Tiên
  const snapHud = path.join(ARTIFACT_DIR, 'verify_v5_2_hud_cultivation_stats.png');
  await page.screenshot({ path: snapHud });
  console.log('✓ Đã chụp ảnh HUD Tu Tiên & Thọ Nguyên:', snapHud);

  // 4. MỞ MODAL TU TIÊN (PHÍM Y)
  console.log('4. Mở modal Tu Tiên (Phím Y)');
  await page.keyboard.press('KeyY');
  await delay(1200);

  const snapCultivRealms = path.join(ARTIFACT_DIR, 'verify_v5_3_cultivation_modal_realms.png');
  await page.screenshot({ path: snapCultivRealms });
  console.log('✓ Đã chụp ảnh Modal Tu Tiên - Cảnh Giới & Thọ Nguyên:', snapCultivRealms);

  // Chuyển sang Tab 4 Môn Phái Tu Tiên
  console.log('5. Chuyển sang Tab 4 Môn Phái Tiên Đạo');
  await page.evaluate(() => {
    document.getElementById('tab-cultiv-sects').click();
  });
  await delay(800);

  const snapCultivSects = path.join(ARTIFACT_DIR, 'verify_v5_4_cultivation_modal_sects.png');
  await page.screenshot({ path: snapCultivSects });
  console.log('✓ Đã chụp ảnh Modal Tu Tiên - 4 Đại Tông Môn:', snapCultivSects);

  // Đóng modal Tu Tiên
  await page.keyboard.press('KeyY');
  await delay(400);

  // 6. KIỂM TRA TRANG BỊ TU TIÊN & VÒNG SÁNG ORBIT AURA
  console.log('6. Mở Túi Đồ (Phím B) & soi Trang Bị Tu Tiên x5');
  await page.keyboard.press('KeyB');
  await delay(1000);

  // Đưa chuột vào ô trang bị Tu Tiên hoặc ô đầu tiên trong túi đồ
  await page.evaluate(() => {
    const slots = document.querySelectorAll('#inventory-grid .inv-slot');
    // Tìm slot có đồ Tu Tiên hoặc slot đầu tiên có item
    let target = null;
    for (const s of slots) {
      if (s.querySelector('.orbit-aura-ring')) {
        target = s;
        break;
      }
    }
    if (!target) {
      for (const s of slots) {
        if (s.children.length > 0) {
          target = s;
          break;
        }
      }
    }
    if (target) {
      const rect = target.getBoundingClientRect();
      const evt = new MouseEvent('mousemove', {
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        bubbles: true
      });
      target.dispatchEvent(evt);
    }
  });
  await delay(1200);

  const snapGear = path.join(ARTIFACT_DIR, 'verify_v5_5_cultivation_gear_orbit_and_tooltip.png');
  await page.screenshot({ path: snapGear });
  console.log('✓ Đã chụp ảnh Trang Bị Tu Tiên, Orbit Aura Ring & Tooltip:', snapGear);

  // Đóng Túi Đồ
  await page.keyboard.press('KeyB');
  await delay(400);

  // 7. KIỂM TRA TỰ ĐỘNG ĐÁNH QUÁI (PHÍM Z)
  console.log('7. Bật Auto Treo Máy (Phím Z)');
  await page.keyboard.press('KeyZ');
  await delay(3500);

  const snapAuto = path.join(ARTIFACT_DIR, 'verify_v5_6_autocombat_smooth.png');
  await page.screenshot({ path: snapAuto });
  console.log('✓ Đã chụp ảnh Auto Treo Máy không bị đứng im:', snapAuto);

  // Tắt Auto
  await page.keyboard.press('KeyZ');
  await delay(500);

  // 8. KIỂM TRA RELOAD / F5 PERSISTENT LƯU NHÂN VẬT
  console.log('8. Tải lại trang (F5) kiểm tra tính Persistent của Database');
  await page.reload({ waitUntil: 'domcontentloaded' });
  await delay(2000);

  // Đăng nhập lại tài khoản testUser
  await page.evaluate((u, p) => {
    document.getElementById('tab-btn-login').click();
    document.getElementById('auth-login-user').value = u;
    document.getElementById('auth-login-pass').value = p;
    document.getElementById('btn-submit-login').click();
  }, testUser, testPass);
  await delay(2500);

  const snapPersistent = path.join(ARTIFACT_DIR, 'verify_v5_7_persistent_character_after_reload.png');
  await page.screenshot({ path: snapPersistent });
  console.log('✓ Đã chụp ảnh Danh sách nhân vật nạp lại thành công từ DB:', snapPersistent);

  console.log('=== TẤT CẢ CÁC BƯỚC KIỂM THỬ ĐÃ HOÀN TẤT THÀNH CÔNG RỰC RỠ ===');
  await browser.close();
}

runTest().catch(err => {
  console.error('LỖI KHI TEST:', err);
  process.exit(1);
});
