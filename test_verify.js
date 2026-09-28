const puppeteer = require('puppeteer');

const delay = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('=== TEST VERIFY BROWSER AUTOMATION ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => console.log('[PAGE]', msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]', err.toString()));

  console.log('1. Loading http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });

  console.log('2. Entering game with Shaolin sect...');
  await page.evaluate(() => {
    document.querySelector('.sect-card[data-sect="shaolin"]').click();
    document.getElementById('char-name-input').value = 'Huyền Trí Đại Sư';
    document.getElementById('btn-enter-game').click();
  });

  await delay(1500);

  const initialPlayer = await page.evaluate(() => {
    const id = window.myPlayerId;
    const p = id && window.latestWorldState ? window.latestWorldState.players[id] : null;
    return p ? { id: p.id, name: p.name, x: p.x, y: p.y, hp: p.hp, spins: p.luckySpins } : null;
  });
  console.log('Initial Player state:', initialPlayer);

  console.log('3. Clicking canvas to move to (800, 500)...');
  await page.mouse.click(800, 500);
  await delay(1500);

  const movedPlayer = await page.evaluate(() => {
    const id = window.myPlayerId;
    const p = id && window.latestWorldState ? window.latestWorldState.players[id] : null;
    return p ? { id: p.id, name: p.name, x: p.x, y: p.y, isMoving: p.isMoving } : null;
  });
  console.log('Player state after click move:', movedPlayer);

  console.log('4. Testing Keyboard Movement (KeyD / Right)...');
  await page.keyboard.down('KeyD');
  await delay(1200);
  await page.keyboard.up('KeyD');
  await delay(500);

  const keyMovedPlayer = await page.evaluate(() => {
    const id = window.myPlayerId;
    const p = id && window.latestWorldState ? window.latestWorldState.players[id] : null;
    return p ? { x: p.x, y: p.y } : null;
  });
  console.log('Player state after KeyD move:', keyMovedPlayer);

  console.log('5. Testing Lucky Wheel...');
  await page.evaluate(() => {
    document.getElementById('btn-dock-wheel').click();
  });
  await delay(800);

  const spinsBefore = await page.evaluate(() => {
    return {
      left: document.getElementById('wheel-spins-left')?.textContent,
      btn: document.getElementById('spin-btn-count')?.textContent,
      dock: document.getElementById('dock-badge-spins')?.textContent
    };
  });
  console.log('Spins before click:', spinsBefore);

  await page.evaluate(() => {
    document.getElementById('btn-spin-wheel').click();
  });
  await delay(1000);

  const spinsRightAfter = await page.evaluate(() => {
    return {
      left: document.getElementById('wheel-spins-left')?.textContent,
      btn: document.getElementById('spin-btn-count')?.textContent,
      dock: document.getElementById('dock-badge-spins')?.textContent
    };
  });
  console.log('Spins right after click (should be decremented!):', spinsRightAfter);

  console.log('Waiting 5.5s for wheel rotation to finish...');
  await delay(5500);

  const wheelResult = await page.evaluate(() => {
    return {
      winnerName: document.getElementById('winner-item-name')?.textContent,
      winnerDesc: document.getElementById('winner-item-desc')?.textContent,
      left: document.getElementById('wheel-spins-left')?.textContent
    };
  });
  console.log('Wheel Result:', wheelResult);

  // Chụp ảnh kết quả
  await page.screenshot({ path: 'verify_wheel_result.png' });
  console.log('Saved verify_wheel_result.png');

  // Đóng modal wheel
  await page.evaluate(() => {
    document.querySelectorAll('.btn-close-modal').forEach(b => b.click());
  });
  await delay(500);
  await page.screenshot({ path: 'verify_game_world.png' });
  console.log('Saved verify_game_world.png');

  await browser.close();
  console.log('=== TEST VERIFY COMPLETED ===');
})();
