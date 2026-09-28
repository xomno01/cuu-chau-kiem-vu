const puppeteer = require('puppeteer');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('=== STARTING COMPLETE BROWSER VERIFICATION SUITE ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => console.log('[BROWSER CONSOLE]', msg.text()));
  page.on('pageerror', err => console.error('[BROWSER ERROR]', err.toString()));

  // 1. Màn hình Login
  console.log('Step 1: Navigate to http://127.0.0.1:3000');
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
  await delay(1200);

  await page.screenshot({ path: 'suite_1_login_screen.png' });
  console.log('Saved suite_1_login_screen.png');

  // 2. Chọn Thiếu Lâm và Đăng nhập
  console.log('Step 2: Selecting Shaolin and Entering Game...');
  await page.evaluate(() => {
    document.querySelector('.sect-card[data-sect="shaolin"]').click();
    document.getElementById('char-name-input').value = 'Phương Trượng Thích Trí';
    document.getElementById('btn-enter-game').click();
  });

  await delay(2000);
  await page.screenshot({ path: 'suite_2_shaolin_in_game.png' });
  console.log('Saved suite_2_shaolin_in_game.png');

  // 3. Kiểm tra thông tin người chơi ban đầu
  const initialData = await page.evaluate(() => {
    const id = window.myPlayerId;
    const p = id && window.latestWorldState ? window.latestWorldState.players[id] : null;
    return p ? {
      name: p.name,
      sect: p.sect,
      x: Math.round(p.x),
      y: Math.round(p.y),
      hp: p.hp,
      maxHp: p.maxHp,
      luckySpins: p.luckySpins
    } : null;
  });
  console.log('Shaolin Initial Data:', initialData);

  // 4. Test Di Chuyển Chuột (Click-to-Move)
  console.log('Step 3: Click-to-Move (Clicking canvas at 780, 480)...');
  const startX = initialData.x;
  const startY = initialData.y;

  await page.evaluate(() => {
    const canvas = document.getElementById('game-canvas');
    canvas.dispatchEvent(new MouseEvent('mousedown', {
      clientX: 780,
      clientY: 480,
      button: 0,
      bubbles: true,
      cancelable: true
    }));
  });

  // Chờ 1.5s để nhân vật chạy
  await delay(1500);

  const movedData = await page.evaluate(() => {
    const id = window.myPlayerId;
    const p = id && window.latestWorldState ? window.latestWorldState.players[id] : null;
    return p ? { x: Math.round(p.x), y: Math.round(p.y), isMoving: p.isMoving } : null;
  });
  console.log('Shaolin after move:', movedData);
  console.log(`Displacement: dx=${movedData.x - startX}, dy=${movedData.y - startY}`);

  // Chụp ảnh khi nhân vật đang ở vị trí mới
  await page.screenshot({ path: 'suite_3_after_movement.png' });
  console.log('Saved suite_3_after_movement.png');

  // 5. Test Vòng Quay May Mắn (Thiên Mệnh Chi Luân)
  console.log('Step 4: Opening Lucky Wheel Modal...');
  await page.evaluate(() => {
    document.getElementById('btn-dock-wheel').click();
  });
  await delay(800);

  const wheelBefore = await page.evaluate(() => {
    return {
      modalCount: document.getElementById('wheel-spins-left')?.textContent,
      btnCount: document.getElementById('spin-btn-count')?.textContent,
      dockCount: document.getElementById('dock-badge-spins')?.textContent
    };
  });
  console.log('Wheel before spin:', wheelBefore);

  console.log('Clicking Spin Wheel button...');
  await page.evaluate(() => {
    document.getElementById('btn-spin-wheel').click();
  });
  await delay(800);

  const wheelSpinning = await page.evaluate(() => {
    return {
      modalCount: document.getElementById('wheel-spins-left')?.textContent,
      btnCount: document.getElementById('spin-btn-count')?.textContent,
      dockCount: document.getElementById('dock-badge-spins')?.textContent
    };
  });
  console.log('Wheel immediately during spin (should be 9):', wheelSpinning);

  console.log('Waiting 5.5s for wheel rotation animation to conclude...');
  await delay(5800);

  const wheelReward = await page.evaluate(() => {
    return {
      winnerName: document.getElementById('winner-item-name')?.textContent,
      winnerDesc: document.getElementById('winner-item-desc')?.textContent,
      left: document.getElementById('wheel-spins-left')?.textContent
    };
  });
  console.log('Wheel Reward Result:', wheelReward);
  await page.screenshot({ path: 'suite_4_wheel_reward.png' });
  console.log('Saved suite_4_wheel_reward.png');

  // Đóng modal wheel
  await page.evaluate(() => {
    document.querySelectorAll('.btn-close-modal').forEach(b => b.click());
  });
  await delay(500);

  // 6. Test Túi Đồ 200 Ô
  console.log('Step 5: Testing 200-Slot Inventory Modal (B)...');
  await page.evaluate(() => {
    document.getElementById('btn-dock-inv').click();
  });
  await delay(800);

  const invSlotsCount = await page.evaluate(() => {
    return document.querySelectorAll('.inv-slot').length;
  });
  console.log('Inventory Slots rendered count:', invSlotsCount);
  await page.screenshot({ path: 'suite_5_inventory_200.png' });
  console.log('Saved suite_5_inventory_200.png');

  await page.evaluate(() => {
    document.querySelectorAll('.btn-close-modal').forEach(b => b.click());
  });
  await delay(500);

  // 7. Test Mở Môn Phái Võ Đang
  console.log('Step 6: Creating a new session with Wudang sect...');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1280, height: 720 });
  await page2.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
  await delay(1000);

  await page2.evaluate(() => {
    document.querySelector('.sect-card[data-sect="wudang"]').click();
    document.getElementById('char-name-input').value = 'Trương Chân Nhân';
    document.getElementById('btn-enter-game').click();
  });
  await delay(2000);

  await page2.screenshot({ path: 'suite_6_wudang_in_game.png' });
  console.log('Saved suite_6_wudang_in_game.png');

  const wudangData = await page2.evaluate(() => {
    const id = window.myPlayerId;
    const p = id && window.latestWorldState ? window.latestWorldState.players[id] : null;
    return p ? { name: p.name, sect: p.sect, x: Math.round(p.x), y: Math.round(p.y), hp: p.hp } : null;
  });
  console.log('Wudang in-game data:', wudangData);

  await browser.close();
  console.log('=== COMPLETE SUITE FINISHED SUCCESSFULLY! ===');
})();
