const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });

  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  console.log('1. Goto...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  console.log('2. Click Shaolin...');
  await page.evaluate(() => {
    document.querySelector('.sect-card[data-sect="shaolin"]').click();
  });
  console.log('3. Click Enter Game...');
  await page.evaluate(() => {
    document.getElementById('btn-enter-game').click();
  });
  console.log('4. Waiting 2s...');
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: 'test_game_entered.png' });
  console.log('5. test_game_entered.png saved!');

  const state = await page.evaluate(() => {
    return {
      myPlayerId: window.myPlayerId,
      player: window.myPlayerId && window.latestWorldState ? window.latestWorldState.players[window.myPlayerId] : null
    };
  });
  console.log('Player state after enter:', state);

  console.log('6. Click canvas at 700, 450...');
  await page.mouse.click(700, 450);
  console.log('Clicked mouse.');
  await new Promise(r => setTimeout(r, 1000));

  const stateAfterClick = await page.evaluate(() => {
    return {
      player: window.myPlayerId && window.latestWorldState ? window.latestWorldState.players[window.myPlayerId] : null
    };
  });
  console.log('Player state after click:', stateAfterClick);

  await browser.close();
  console.log('Done test_pup!');
})();
