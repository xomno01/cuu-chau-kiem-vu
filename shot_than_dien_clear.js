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
    document.getElementById('char-name-input').value = 'TháiCổTiênĐạo';
    document.getElementById('btn-enter-game').click();
  });
  await new Promise(r => setTimeout(r, 2000));

  await page.evaluate(() => {
    window.socket.emit('change_map', { mapId: 'than_dien' });
  });
  await new Promise(r => setTimeout(r, 2000));

  // Di chuyển nhẹ ra ngoài vùng an toàn và chụp ngay trước khi dính sát thương
  await page.evaluate(() => {
    window.socket.emit('move_to', { x: 750, y: 800 });
  });
  await new Promise(r => setTimeout(r, 1000));

  const shot = path.join(ARTIFACT_DIR, 'verify_map_and_sell_4_than_dien.png');
  await page.screenshot({ path: shot });
  console.log('Saved Than Dien full shot:', shot);
  await browser.close();
})();
