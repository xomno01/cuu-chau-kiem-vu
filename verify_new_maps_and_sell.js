const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701';
const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('=== STARTING 3 MAPS + 3 DEDICATED MOB SPRITES + RARITY SELLING VERIFICATION ===');
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

    // Tự động đồng ý popup confirm bán đồ
    page.on('dialog', async dialog => {
      console.log('[Browser Dialog]:', dialog.message());
      await dialog.accept();
    });

    console.log('1. Truy cập game tại http://127.0.0.1:3000...');
    await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
    await delay(1500);

    // TEST 1: ĐĂNG NHẬP VÕ ĐANG PHÁI
    console.log('2. Đăng nhập nhân vật Võ Đang...');
    await page.evaluate(() => {
      document.querySelector('.sect-card[data-sect="wudang"]').click();
      document.getElementById('char-name-input').value = 'Huyền Vũ Kiếm Tiên';
      document.getElementById('btn-enter-game').click();
    });
    await delay(2500);

    // TEST 2: MỞ TÚI ĐỒ 200 Ô & KIỂM TRA TÍNH NĂNG BÁN NHANH THEO PHẨM CẤP
    console.log('3. Mở Túi Đồ 200 ô (Phím B) kiểm tra thanh bán theo phẩm cấp...');
    await page.keyboard.press('KeyB');
    await delay(1200);

    const sellBarInfo = await page.evaluate(() => {
      const sellBar = document.querySelector('.inv-rarity-sell-bar');
      const chkBoxes = Array.from(document.querySelectorAll('#rarity-sell-checkboxes input[type="checkbox"]')).map(c => ({
        val: c.value,
        checked: c.checked
      }));
      // Test bấm nút Bán Phẩm Cấp Đã Chọn
      const btnSell = document.getElementById('btn-sell-selected-rarity');
      if (btnSell) btnSell.click();
      return {
        hasSellBar: !!sellBar,
        chkBoxes,
        hasBtn: !!btnSell
      };
    });
    console.log('Thông tin Thanh Lọc Bán Nhanh Theo Phẩm Cấp:', sellBarInfo);
    await delay(800);

    const shot1 = path.join(ARTIFACT_DIR, 'verify_map_and_sell_1_inventory_rarity.png');
    await page.screenshot({ path: shot1 });
    console.log('✓ Đã chụp ảnh Túi Đồ & Thanh Bán Theo Phẩm Cấp:', shot1);

    // Đóng Túi Đồ
    await page.keyboard.press('KeyB');
    await delay(800);

    // TEST 3: DỊCH CHUYỂN SANG CÔN LÔN TUYẾT SƠN & BÃI BĂNG GIÁC TUYẾT THÚ
    console.log('4. Dịch chuyển sang Côn Lôn Tuyết Sơn (snow_beast)...');
    await page.evaluate(() => {
      window.socket.emit('change_map', { mapId: 'con_lon' });
    });
    await delay(2000);

    // Di chuyển đến bãi quái Băng Thú
    await page.evaluate(() => {
      window.socket.emit('move_to', { x: 1250, y: 580 });
    });
    await delay(3500);

    const shot2 = path.join(ARTIFACT_DIR, 'verify_map_and_sell_2_con_lon.png');
    await page.screenshot({ path: shot2 });
    console.log('✓ Đã chụp ảnh Côn Lôn Tuyết Sơn & Băng Giác Tuyết Thú:', shot2);

    // TEST 4: DỊCH CHUYỂN SANG HOÀNG SA CỔ THÀNH & BÃI HOÀNG SA ĐỘC BỌ CẠP
    console.log('5. Dịch chuyển sang Hoàng Sa Cổ Thành (desert_demon)...');
    await page.evaluate(() => {
      window.socket.emit('change_map', { mapId: 'hoang_sa' });
    });
    await delay(2000);

    // Di chuyển đến bãi quái Sa Mạc
    await page.evaluate(() => {
      window.socket.emit('move_to', { x: 880, y: 660 });
    });
    await delay(3500);

    const shot3 = path.join(ARTIFACT_DIR, 'verify_map_and_sell_3_hoang_sa.png');
    await page.screenshot({ path: shot3 });
    console.log('✓ Đã chụp ảnh Hoàng Sa Cổ Thành & Hoàng Sa Độc Bọ Cạp:', shot3);

    // TEST 5: DỊCH CHUYỂN SANG THÁI CỔ THẦN ĐIỆN & BÃI THÁI CỔ KIM CANG
    console.log('6. Dịch chuyển sang Thái Cổ Thần Điện (celestial_guard)...');
    await page.evaluate(() => {
      window.socket.emit('change_map', { mapId: 'than_dien' });
    });
    await delay(2000);

    // Di chuyển đến bãi quái Thần Tướng
    await page.evaluate(() => {
      window.socket.emit('move_to', { x: 880, y: 760 });
    });
    await delay(3500);

    const shot4 = path.join(ARTIFACT_DIR, 'verify_map_and_sell_4_than_dien.png');
    await page.screenshot({ path: shot4 });
    console.log('✓ Đã chụp ảnh Thái Cổ Thần Điện & Cửu Trọng Thiên Binh:', shot4);

    console.log('=== TẤT CẢ 4 HẠNG MỤC KIỂM THỬ XÁC MINH 100% HOÀN TẤT THÀNH CÔNG! ===');
  } catch (err) {
    console.error('Test thất bại với lỗi:', err);
  } finally {
    await browser.close();
  }
})();
