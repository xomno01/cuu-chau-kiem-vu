const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = path.resolve('C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('[TEST] Khoi dong trinh duyet Puppeteer...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Kiem tra man hinh Dang Nhap / Chon Nhan Vat
  console.log('[TEST] Mo trang game http://localhost:3000');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await sleep(1000);

  // Dang nhap tai khoan xomno01 co nhan vat Matcha
  console.log('[TEST] Dang nhap tai khoan xomno01...');
  await page.type('#auth-login-user', 'xomno01');
  await page.type('#auth-login-pass', '123456');
  await page.click('#btn-submit-login');
  await sleep(1500);

  // Chup anh man hinh chon nhan vat de xac nhan Canh Gioi
  const shotCharSelect = path.join(ARTIFACT_DIR, 'verify_v9_1_char_select_realm.png');
  await page.screenshot({ path: shotCharSelect });
  console.log('[TEST] Da chup anh Chon Nhan Vat:', shotCharSelect);

  // 2. Chon nhan vat Matcha vao game
  console.log('[TEST] Click nut Vao Giang Ho...');
  await page.click('.btn-enter-char');
  await sleep(3500);

  // Dong modal Thien Menh Chi Luan neu dang mo
  await page.evaluate(() => {
    const wheelModal = document.getElementById('wheel-modal');
    if (wheelModal) wheelModal.classList.add('hidden');
    const introModal = document.getElementById('intro-modal');
    if (introModal) introModal.classList.add('hidden');
  });
  await sleep(1000);

  // Chup anh HUD, Danh Hieu moi va Ban Do hien tai
  const shotInGame = path.join(ARTIFACT_DIR, 'verify_v9_2_hud_and_title.png');
  await page.screenshot({ path: shotInGame });
  console.log('[TEST] Da chup anh Trong Game voi Danh Hieu moi:', shotInGame);

  // 3. Kiem tra Mo Bang Xep Hang Dong Bo Server
  console.log('[TEST] Mo Bang Xep Hang Dong Bo Server...');
  await page.keyboard.press('KeyR');
  await sleep(1500);
  const shotRanking = path.join(ARTIFACT_DIR, 'verify_v9_3_server_leaderboard.png');
  await page.screenshot({ path: shotRanking });
  console.log('[TEST] Da chup anh Bang Xep Hang:', shotRanking);
  await page.keyboard.press('Escape');
  await sleep(500);

  // 4. Kiem tra Chuyen sang Map Tu Tien: Bong Lai Tien Dao
  console.log('[TEST] Chuyen map sang Bong Lai Tien Dao...');
  await page.evaluate(() => {
    if (window.socket) {
      window.socket.emit('change_map', { mapId: 'map_bong_lai' });
    }
  });
  await sleep(3500);

  const shotBongLai = path.join(ARTIFACT_DIR, 'verify_v9_4_bong_lai_map.png');
  await page.screenshot({ path: shotBongLai });
  console.log('[TEST] Da chup anh Bong Lai Tien Dao:', shotBongLai);

  // 5. Chuyen tiep sang Map Tu Tien: Con Lon Dao Tri
  console.log('[TEST] Chuyen map sang Con Lon Dao Tri...');
  await page.evaluate(() => {
    if (window.socket) {
      window.socket.emit('change_map', { mapId: 'map_dao_tri' });
    }
  });
  await sleep(3500);

  const shotDaoTri = path.join(ARTIFACT_DIR, 'verify_v9_5_dao_tri_map.png');
  await page.screenshot({ path: shotDaoTri });
  console.log('[TEST] Da chup anh Con Lon Dao Tri:', shotDaoTri);

  // 6. Chuyen tiep sang Map Tu Tien: Thai Hu Huyen Canh
  console.log('[TEST] Chuyen map sang Thai Hu Huyen Canh...');
  await page.evaluate(() => {
    if (window.socket) {
      window.socket.emit('change_map', { mapId: 'map_thai_hu' });
    }
  });
  await sleep(3500);

  const shotThaiHu = path.join(ARTIFACT_DIR, 'verify_v9_6_thai_hu_map.png');
  await page.screenshot({ path: shotThaiHu });
  console.log('[TEST] Da chup anh Thai Hu Huyen Canh:', shotThaiHu);

  // 7. Kiem tra chan nhan vat Lv < 30 khong vao duoc Map Tu Tien
  console.log('[TEST] Tao client thu hai voi nhan vat Lv.1 de kiem tra chan Map Tu Tien...');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1440, height: 900 });
  await page2.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await sleep(1000);

  const testUser = 'novice_' + Date.now().toString().slice(-4);
  await page2.evaluate((u) => {
    if (window.socket) {
      window.socket.emit('account_register', { username: u, password: '123' });
    }
  }, testUser);
  await sleep(1000);

  await page2.evaluate((u) => {
    if (window.socket) {
      window.socket.emit('account_login', { username: u, password: '123' });
    }
  }, testUser);
  await sleep(1000);

  await page2.evaluate((u) => {
    if (window.socket) {
      window.socket.emit('create_character', { username: u, name: 'Phàm Nhân ' + u.slice(-3), sect: 'huashan' });
    }
  }, testUser);
  await sleep(2500);

  // Thu chuyen vao Map Tu Tien khi chua du Lv 30
  console.log('[TEST] Nhan vat Lv.1 thu teleport vao map Tu Tien...');
  await page2.evaluate(() => {
    if (window.socket) {
      window.socket.emit('change_map', { mapId: 'map_bong_lai' });
    }
  });
  await sleep(1500);

  const shotLevelBlock = path.join(ARTIFACT_DIR, 'verify_v9_7_level_under_30_blocked.png');
  await page2.screenshot({ path: shotLevelBlock });
  console.log('[TEST] Da chup anh Chan Nhan Vat Lv < 30:', shotLevelBlock);

  await browser.close();
  console.log('[TEST] Hoan tat tat ca cac bai kiem thu!');
})();
