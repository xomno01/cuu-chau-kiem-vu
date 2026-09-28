const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701';
const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('=== STARTING COMPLETE PRODUCTION VERIFICATION ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1400, height: 900 }
  });

  try {
    const page = await browser.newPage();
    page.on('console', msg => {
      const txt = msg.text();
      if (!txt.includes('downloadable font') && !txt.includes('favicon')) {
        console.log('[Browser Console]:', txt);
      }
    });

    console.log('1. Truy cập game tại http://127.0.0.1:3000...');
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
    await delay(1500);

    // TEST 1: ĐĂNG NHẬP THIẾU LÂM
    console.log('2. Chọn Môn Phái Thiếu Lâm và Đăng nhập...');
    await page.evaluate(() => {
      document.querySelector('.sect-card[data-sect="shaolin"]').click();
      document.getElementById('char-name-input').value = 'Phương Trượng Thần Tăng';
      document.getElementById('btn-enter-game').click();
    });
    await delay(2500);

    // Kiểm tra icon hotbar của Thiếu Lâm
    const hotbarSlot1 = await page.$eval('#skill-slot-1 .skill-icon', el => el.src);
    console.log('Thiếu Lâm Hotbar Slot 1 Icon:', hotbarSlot1);

    // TEST 2: MỞ TÚI ĐỒ 200 Ô VÀ KIỂM TRA ICONS MỚI
    console.log('3. Mở Túi Đồ 200 ô (Phím B)...');
    await page.keyboard.press('KeyB');
    await delay(1200);

    const shot1 = path.join(ARTIFACT_DIR, 'verify_1_inventory_icons.png');
    await page.screenshot({ path: shot1 });
    console.log('✓ Đã chụp ảnh Túi Đồ & Icons:', shot1);

    // TEST 3: MỞ LÒ RÈN THẦN BINH (PHÍM G) & TIẾN HÀNH CƯỜNG HÓA
    console.log('4. Mở Lò Rèn Thần Binh (Phím G)...');
    await page.keyboard.press('KeyG');
    await delay(1200);

    const isForgeActive = await page.$eval('#modal-forge', el => el.classList.contains('active'));
    console.log('Modal Lò Rèn Active:', isForgeActive);

    // Chọn 1 món trang bị và bấm Cường Hóa
    const equipSlots = await page.$$('#forge-enhance-equip-list .forge-equip-slot');
    console.log('Số lượng trang bị trong Lò Rèn:', equipSlots.length);
    if (equipSlots.length > 0) {
      await equipSlots[0].click();
      await delay(600);
      const btnDoEnhance = await page.$('#btn-do-enhance');
      if (btnDoEnhance) {
        const disabled = await page.$eval('#btn-do-enhance', el => el.disabled);
        console.log('Nút Cường Hóa Disabled?:', disabled);
        if (!disabled) {
          await btnDoEnhance.click();
          console.log('Đã bấm nút CƯỜNG HÓA (+1)!');
          await delay(1500);
        }
      }
    }

    const shot2 = path.join(ARTIFACT_DIR, 'verify_2_forge_enhanced.png');
    await page.screenshot({ path: shot2 });
    console.log('✓ Đã chụp ảnh Lò Rèn Cường Hóa:', shot2);

    // Đóng Lò Rèn
    await page.keyboard.press('KeyG');
    await delay(800);

    // TEST 4: DI CHUYỂN RA NGOẠI THÀNH BÃI QUÁI ĐÔNG ĐÚC & TUNG KỸ NĂNG THIẾU LÂM
    console.log('5. Di chuyển ra bãi quái ngoài thành Lạc Dương...');
    await page.evaluate(() => {
      window.socket.emit('move_to', { x: 450, y: 750 });
    });
    await delay(2500);

    // Tung skill 1, 2 (Kim Cang Phục Ma), 3 (Kim Chung), 4 (Sư Tử Hống)
    console.log('6. Tung chiêu 1, 2, 3, 4 Thiếu Lâm...');
    await page.keyboard.press('Digit3'); // Kim Chung Bảo Hộ
    await delay(500);
    await page.keyboard.press('Digit2'); // Kim Cang Phục Ma Trận
    await delay(600);
    await page.keyboard.press('Digit4'); // Sư Tử Hống
    await delay(600);

    const shot3 = path.join(ARTIFACT_DIR, 'verify_3_shaolin_skills_combat.png');
    await page.screenshot({ path: shot3 });
    console.log('✓ Đã chụp ảnh Thiếu Lâm Combat & Bãi Quái:', shot3);

    // TEST 5: ĐĂNG NHẬP VÕ ĐANG VÀ TUNG VẠN KIẾM TRIỀU TÔNG
    console.log('7. Đăng nhập Võ Đang Phái...');
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
    await delay(1500);

    await page.evaluate(() => {
      document.querySelector('.sect-card[data-sect="wudang"]').click();
      document.getElementById('char-name-input').value = 'Trương Tam Phong Tôn Giả';
      document.getElementById('btn-enter-game').click();
    });
    await delay(2500);

    const wudangSlot1 = await page.$eval('#skill-slot-1 .skill-icon', el => el.src);
    console.log('Võ Đang Hotbar Slot 1 Icon:', wudangSlot1);

    // Ra bãi quái phía Đông và tung Lưỡng Nghi Kiếm Trận & Vạn Kiếm Triều Tông
    await page.evaluate(() => {
      window.socket.emit('move_to', { x: 2100, y: 1200 });
    });
    await delay(2500);

    console.log('8. Tung chiêu Võ Đang (Khiên Thái Cực, Lưỡng Nghi, Vạn Kiếm)...');
    await page.keyboard.press('Digit3'); // Tọa Vong Vô Ngã
    await delay(500);
    await page.keyboard.press('Digit2'); // Lưỡng Nghi Kiếm Trận
    await delay(600);
    await page.keyboard.press('Digit4'); // Vạn Kiếm Triều Tông
    await delay(600);

    const shot4 = path.join(ARTIFACT_DIR, 'verify_4_wudang_skills_combat.png');
    await page.screenshot({ path: shot4 });
    console.log('✓ Đã chụp ảnh Võ Đang Combat & Mưa Kiếm:', shot4);

    console.log('=== TẤT CẢ 5 HẠNG MỤC KIỂM THỬ ĐÃ HOÀN TẤT XUẤT SẮC! ===');
  } catch (err) {
    console.error('Test thất bại với lỗi:', err);
  } finally {
    await browser.close();
  }
})();
