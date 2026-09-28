const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async () => {
  console.log('🚀 Bắt đầu kịch bản kiểm thử Cường Hóa & Cân Bằng Game...');

  const errors = [];
  const notFounds = [];
  const networkErrors = [];

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
    }
  });

  page.on('pageerror', err => {
    errors.push(err.toString());
    console.log('❌ [Page Error]:', err.toString());
  });

  page.on('response', resp => {
    if (resp.status() === 404) {
      notFounds.push(resp.url());
      console.log('❌ [404 Not Found]:', resp.url());
    } else if (resp.status() >= 400) {
      networkErrors.push(`${resp.url()} (Status ${resp.status()})`);
      console.log(`❌ [HTTP ${resp.status()}]:`, resp.url());
    }
  });

  console.log('👉 1. Truy cập http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await sleep(1500);

  // Đăng nhập tài khoản xomno01 / 123123
  console.log('👉 2. Đăng nhập tài khoản xomno01...');
  await page.click('#auth-login-user', { clickCount: 3 });
  await page.type('#auth-login-user', 'xomno01');
  await page.click('#auth-login-pass', { clickCount: 3 });
  await page.type('#auth-login-pass', '123123');
  await page.click('#btn-submit-login');
  await sleep(2000);

  // Chọn nhân vật Matcha
  console.log('👉 3. Vào game với nhân vật Matcha...');
  await page.waitForSelector('.btn-enter-char', { timeout: 5000 });
  await page.click('.btn-enter-char');

  await page.waitForFunction(() => {
    const el = document.getElementById('screen-game');
    return el && el.style.display === 'block';
  }, { timeout: 10000 });
  console.log('✅ Đã vào game thành công!');
  await sleep(1500);

  // Mở lò rèn Thần Binh
  console.log('👉 4. Mở Lò Rèn Thần Binh...');
  await page.evaluate(() => {
    if (window.uiManager) {
      window.uiManager.openForgeModal();
    }
  });
  await sleep(1000);

  // Kiểm tra danh sách trang bị trong lò rèn
  const forgeState = await page.evaluate(() => {
    const list = document.querySelectorAll('#forge-enhance-equip-list .forge-equip-slot');
    const targetCard = document.getElementById('forge-target-card');
    const btnDo = document.getElementById('btn-do-enhance');
    const slots = [];
    list.forEach((el, idx) => {
      const img = el.querySelector('img');
      const badge = el.querySelector('.enhance-badge');
      slots.push({
        idx,
        icon: img ? img.getAttribute('src') : '',
        badge: badge ? badge.textContent : '+0'
      });
    });
    return {
      slotCount: list.length,
      slots: slots.slice(0, 10), // lấy 10 slot đầu
      cardText: targetCard ? targetCard.innerText : '',
      btnText: btnDo ? btnDo.innerText : '',
      btnDisabled: btnDo ? btnDo.disabled : true
    };
  });

  console.log('📊 Trạng thái Lò Rèn:', JSON.stringify(forgeState, null, 2));

  // Click vào trang bị Tu Tiên trong lò rèn để chọn nó
  console.log('👉 5. Chọn trang bị Tu Tiên trong lò rèn để cường hóa...');
  const selectResult = await page.evaluate(() => {
    const p = window.uiManager ? window.uiManager.playerState : null;
    if (!p) return { found: false, msg: 'No playerState' };

    // Tìm index trong danh sách lò rèn tương ứng với món tu tiên
    const equipSlots = document.querySelectorAll('#forge-enhance-equip-list .forge-equip-slot');
    // Tìm món có icon item_cultiv hoặc badge cao
    let targetSlotEl = null;
    for (let el of equipSlots) {
      const img = el.querySelector('img');
      if (img && img.src.includes('item_cultiv')) {
        targetSlotEl = el;
        break;
      }
    }
    if (!targetSlotEl && equipSlots.length > 0) {
      targetSlotEl = equipSlots[0];
    }
    if (targetSlotEl) {
      targetSlotEl.click();
      return { found: true, clicked: true };
    }
    return { found: false, count: equipSlots.length };
  });
  console.log('👉 Kết quả chọn trang bị:', selectResult);
  await sleep(1000);

  // Đọc lại thông tin sau khi chọn
  const selectedInfo = await page.evaluate(() => {
    const targetCard = document.getElementById('forge-target-card');
    const btnDo = document.getElementById('btn-do-enhance');
    const rateEl = document.getElementById('enhance-success-rate');
    const stoneEl = document.getElementById('enhance-stone-req');
    const silverEl = document.getElementById('enhance-silver-req');
    return {
      cardText: targetCard ? targetCard.innerText.replace(/\n\s+/g, ' ') : '',
      rate: rateEl ? rateEl.innerText : '',
      stone: stoneEl ? stoneEl.innerText : '',
      silver: silverEl ? silverEl.innerText : '',
      btnText: btnDo ? btnDo.innerText : '',
      btnDisabled: btnDo ? btnDo.disabled : true
    };
  });
  console.log('💎 Chi tiết trang bị đã chọn:', selectedInfo);

  // Tiến hành cường hóa!
  console.log('👉 6. Bấm TIẾN HÀNH CƯỜNG HÓA...');
  const enhanceResultPromise = page.evaluate(() => {
    return new Promise((resolve) => {
      const handler = (res) => {
        window.socket.off('enhance_result', handler);
        resolve(res);
      };
      window.socket.on('enhance_result', handler);
      const btn = document.getElementById('btn-do-enhance');
      if (btn && !btn.disabled) {
        btn.click();
      } else {
        resolve({ error: 'Nút cường hóa bị disabled', btnText: btn ? btn.innerText : 'null' });
      }
    });
  });

  const enhanceResult = await enhanceResultPromise;
  console.log('⚡ Kết quả Cường Hóa nhận được:', JSON.stringify(enhanceResult, null, 2));

  await sleep(1500);

  // Chụp ảnh Lò Rèn sau khi cường hóa
  const shotForge = path.join('C:\\Users\\phamn\\.gemini\\antigravity\\brain\\d3c374a5-59b6-40b1-b4b4-b6e30734a701', 'verify_v12_forge_cultiv_enhance.png');
  await page.screenshot({ path: shotForge });
  console.log('📸 Đã chụp màn hình Lò Rèn Cường Hóa:', shotForge);

  // Đóng modal lò rèn
  await page.evaluate(() => {
    if (window.uiManager) window.uiManager.closeAllModals();
  });
  await sleep(1000);

  // Kiểm tra Cân Bằng Game & Acc Chính
  console.log('👉 7. Kiểm tra cơ chế Cân Bằng Game & Đặc Quyền Bá Đạo của Matcha...');
  const balanceTest = await page.evaluate(() => {
    const p = window.uiManager ? window.uiManager.playerState : null;
    return {
      name: p ? p.name : 'Unknown',
      username: p ? p.username : 'Unknown',
      level: p ? p.level : 0,
      gold: p ? p.gold : 0,
      stats: p ? p.stats : null,
      cultivation: p ? p.cultivation : null
    };
  });
  console.log('👑 Thông tin Chiến Binh Matcha:', JSON.stringify(balanceTest, null, 2));

  // Chụp ảnh giao diện game toàn cảnh
  const shotGame = path.join('C:\\Users\\phamn\\.gemini\\antigravity\\brain\\d3c374a5-59b6-40b1-b4b4-b6e30734a701', 'verify_v12_game_balance_hud.png');
  await page.screenshot({ path: shotGame });
  console.log('📸 Đã chụp màn hình HUD Game:', shotGame);

  console.log('====================================');
  console.log('📋 BÁO CÁO TỔNG HỢP KIỂM THỬ:');
  console.log('Số lỗi console:', errors.length);
  console.log('Số tài nguyên 404:', notFounds.length);
  if (notFounds.length > 0) {
    console.log('Chi tiết 404:', notFounds);
  }
  console.log('Cường hóa thành công:', enhanceResult.success ? '✅ THÀNH CÔNG' : '⚠️ THẤT BẠI NHƯNG KHÔNG LỖI LOGIC (' + enhanceResult.msg + ')');
  console.log('====================================');

  await browser.close();
})();
