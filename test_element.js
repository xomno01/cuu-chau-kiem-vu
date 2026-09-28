const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });

  await page.evaluate(() => {
    document.querySelector('.sect-card[data-sect="shaolin"]').click();
    document.getElementById('btn-enter-game').click();
  });

  await new Promise(r => setTimeout(r, 1200));

  const el = await page.evaluate(() => {
    const target = document.elementFromPoint(800, 500);
    return { tag: target?.tagName, id: target?.id, class: target?.className };
  });
  console.log('Element at (800, 500):', el);

  const initialPos = await page.evaluate(() => {
    const id = window.myPlayerId;
    const p = id && window.latestWorldState ? window.latestWorldState.players[id] : null;
    return p ? { x: p.x, y: p.y } : null;
  });
  console.log('Initial pos:', initialPos);

  // Dispatch mousedown
  const clickResult = await page.evaluate(() => {
    const canvas = document.getElementById('game-canvas');
    const evt = new MouseEvent('mousedown', {
      clientX: 800,
      clientY: 500,
      button: 0,
      bubbles: true,
      cancelable: true
    });
    canvas.dispatchEvent(evt);
    return true;
  });
  console.log('Dispatched mousedown:', clickResult);

  await new Promise(r => setTimeout(r, 1200));

  const posAfter = await page.evaluate(() => {
    const id = window.myPlayerId;
    const p = id && window.latestWorldState ? window.latestWorldState.players[id] : null;
    return p ? { x: p.x, y: p.y, targetX: p.targetX, targetY: p.targetY, isMoving: p.isMoving } : null;
  });
  console.log('Position after direct mousedown:', posAfter);

  await browser.close();
})();
