const puppeteer = require('puppeteer');
const path = require('path');
const ARTIFACT_DIR = 'C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701';

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1400, height: 900 }
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    document.querySelector('.sect-card[data-sect="wudang"]').click();
    document.getElementById('char-name-input').value = 'BắcĐẩuChânQuân';
    document.getElementById('btn-enter-game').click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    window.socket.emit('change_map', { mapId: 'than_dien' });
  });
  await new Promise(r => setTimeout(r, 1500));

  await page.evaluate(() => {
    window.socket.emit('move_to', { x: 880, y: 750 });
  });
  await new Promise(r => setTimeout(r, 1600));

  const shot = path.join(ARTIFACT_DIR, 'verify_map_and_sell_4_than_dien_mob_close.png');
  await page.screenshot({ path: shot });
  console.log('Saved close shot:', shot);
  await browser.close();
})();
