const puppeteer = require('puppeteer');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('--- Khởi động Puppeteer Browser Testing ---');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  console.log('--- 1. Đi đến http://localhost:3000 ---');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  // Chụp ảnh màn hình login
  await page.screenshot({ path: 'test_login_screen.png' });
  console.log('Saved test_login_screen.png');

  // Chọn môn phái Thiếu Lâm
  console.log('--- 2. Chọn môn phái Thiếu Lâm và Đăng nhập ---');
  await page.click('.sect-card[data-sect="shaolin"]');
  await page.type('#char-name-input', 'TestMaster');
  await page.click('#btn-enter-game');

  await delay(2000);
  await page.screenshot({ path: 'test_in_game_screen.png' });
  console.log('Saved test_in_game_screen.png');

  // Lấy vị trí nhân vật trước khi click
  const beforePos = await page.evaluate(() => {
    const p = window.myPlayerId ? window.latestWorldState?.players[window.myPlayerId] : null;
    return p ? { id: p.id, x: p.x, y: p.y, speed: p.speed, isMoving: p.isMoving } : null;
  });
  console.log('Vị trí ban đầu:', beforePos);

  // Click vào canvas để di chuyển
  console.log('--- 3. Click chuột vào canvas để di chuyển (tọa độ màn hình 750, 450) ---');
  await page.mouse.click(750, 450);
  await delay(1000);

  // Lấy vị trí nhân vật sau khi click
  const afterClickPos = await page.evaluate(() => {
    const p = window.myPlayerId ? window.latestWorldState?.players[window.myPlayerId] : null;
    return p ? { id: p.id, x: p.x, y: p.y, speed: p.speed, isMoving: p.isMoving, targetX: p.targetX, targetY: p.targetY } : null;
  });
  console.log('Vị trí sau khi click chuột:', afterClickPos);

  // Thử bấm phím D di chuyển
  console.log('--- 4. Bấm phím D di chuyển sang phải trong 1.5s ---');
  await page.keyboard.down('KeyD');
  await delay(1500);
  await page.keyboard.up('KeyD');
  await delay(500);

  const afterKeyPos = await page.evaluate(() => {
    const p = window.myPlayerId ? window.latestWorldState?.players[window.myPlayerId] : null;
    return p ? { id: p.id, x: p.x, y: p.y, isMoving: p.isMoving } : null;
  });
  console.log('Vị trí sau khi bấm phím D:', afterKeyPos);

  // Mở Vòng Quay May Mắn
  console.log('--- 5. Mở Vòng Quay May Mắn & Quay Thử ---');
  await page.click('#btn-dock-wheel');
  await delay(1000);
  await page.screenshot({ path: 'test_wheel_modal.png' });
  console.log('Saved test_wheel_modal.png');

  const spinsBefore = await page.evaluate(() => {
    return {
      modalSpins: document.getElementById('wheel-spins-left')?.textContent,
      btnSpins: document.getElementById('spin-btn-count')?.textContent,
      dockSpins: document.getElementById('dock-badge-spins')?.textContent
    };
  });
  console.log('Lượt quay trước khi bấm:', spinsBefore);

  await page.click('#btn-spin-wheel');
  console.log('Đã click Khai Luân, chờ 6 giây...');
  await delay(6500);

  const spinsAfter = await page.evaluate(() => {
    return {
      modalSpins: document.getElementById('wheel-spins-left')?.textContent,
      btnSpins: document.getElementById('spin-btn-count')?.textContent,
      dockSpins: document.getElementById('dock-badge-spins')?.textContent,
      winnerName: document.getElementById('winner-item-name')?.textContent
    };
  });
  console.log('Lượt quay & Quà sau khi quay:', spinsAfter);

  await page.screenshot({ path: 'test_wheel_result.png' });
  console.log('Saved test_wheel_result.png');

  // Kiểm tra Minimap
  console.log('--- 6. Kiểm tra Minimap Canvas ---');
  const minimapInfo = await page.evaluate(() => {
    const mm = document.getElementById('minimap-canvas');
    if (!mm) return { exists: false };
    const ctx = mm.getContext('2d');
    const imgData = ctx.getImageData(0, 0, mm.width, mm.height);
    // Tính tổng giá trị pixel khác màu nền đen
    let nonBlackCount = 0;
    for (let i = 0; i < imgData.data.length; i += 4) {
      const r = imgData.data[i];
      const g = imgData.data[i + 1];
      const b = imgData.data[i + 2];
      if (r > 30 || g > 30 || b > 30) nonBlackCount++;
    }
    return {
      exists: true,
      width: mm.width,
      height: mm.height,
      totalPixels: mm.width * mm.height,
      nonBlackCount
    };
  });
  console.log('Minimap Canvas info:', minimapInfo);

  await browser.close();
  console.log('--- Hoàn tất chẩn đoán trình duyệt ---');
})();
