const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = path.resolve('C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Dang nhap xomno01
  await page.type('#auth-login-user', 'xomno01');
  await page.type('#auth-login-pass', '123456');
  await page.click('#btn-submit-login');
  await sleep(1500);

  // Vao giang ho
  await page.click('.btn-enter-char');
  await sleep(3500);

  // Dong tat ca cac modal popup
  await page.evaluate(() => {
    if (window.game && window.game.ui) {
      window.game.ui.closeAllModals();
    }
    const luckyWheel = document.getElementById('modal-lucky-wheel');
    if (luckyWheel) luckyWheel.classList.remove('active');
  });
  await sleep(1000);

  // Chup anh nhan vat ngoai sanh voi danh hieu moi
  const shotInGame = path.join(ARTIFACT_DIR, 'verify_v9_2_hud_and_title.png');
  await page.screenshot({ path: shotInGame });
  console.log('[PERFECT] Chup nhan vat & danh hieu:', shotInGame);

  // Mo bang xep hang dong bo server
  await page.evaluate(() => {
    if (window.game && window.game.ui) {
      window.game.ui.toggleModal('ranking');
    }
  });
  await sleep(1500);
  const shotRanking = path.join(ARTIFACT_DIR, 'verify_v9_3_server_leaderboard.png');
  await page.screenshot({ path: shotRanking });
  console.log('[PERFECT] Chup bang xep hang server:', shotRanking);

  // Chuyen vao map Bong Lai va chup toan canh khong bi modal che
  await page.evaluate(() => {
    if (window.game && window.game.ui) {
      window.game.ui.closeAllModals();
    }
    if (window.socket) {
      window.socket.emit('change_map', { mapId: 'map_bong_lai' });
    }
  });
  await sleep(3500);
  const shotBongLai = path.join(ARTIFACT_DIR, 'verify_v9_4_bong_lai_map.png');
  await page.screenshot({ path: shotBongLai });
  console.log('[PERFECT] Chup Bong Lai Tien Dao:', shotBongLai);

  // Chuyen vao map Con Lon Dao Tri
  await page.evaluate(() => {
    if (window.socket) {
      window.socket.emit('change_map', { mapId: 'map_dao_tri' });
    }
  });
  await sleep(3500);
  const shotDaoTri = path.join(ARTIFACT_DIR, 'verify_v9_5_dao_tri_map.png');
  await page.screenshot({ path: shotDaoTri });
  console.log('[PERFECT] Chup Con Lon Dao Tri:', shotDaoTri);

  // Chuyen vao map Thai Hu
  await page.evaluate(() => {
    if (window.socket) {
      window.socket.emit('change_map', { mapId: 'map_thai_hu' });
    }
  });
  await sleep(3500);
  const shotThaiHu = path.join(ARTIFACT_DIR, 'verify_v9_6_thai_hu_map.png');
  await page.screenshot({ path: shotThaiHu });
  console.log('[PERFECT] Chup Thai Hu Huyen Canh:', shotThaiHu);

  await browser.close();
  console.log('[PERFECT] Hoan tat tat ca screenshots!');
})();
