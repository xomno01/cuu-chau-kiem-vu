const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = path.resolve('C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701');
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  console.log('[TEST] Khoi dong Puppeteer kiem thu V10...');
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

  // Chon nhan vat Matcha vao game
  await page.click('.btn-enter-char');
  await sleep(2500);

  // 1. Kiem tra Bang San Boss: 3 Boss Giang The Mau x10
  console.log('[TEST] Mo Bang San Boss The Gioi...');
  await page.keyboard.press('KeyX');
  await sleep(1500);

  const shotBossStats = path.join(ARTIFACT_DIR, 'verify_v10_1_boss_stats_x10.png');
  await page.screenshot({ path: shotBossStats });
  console.log('[TEST] Da chup Bang San Boss:', shotBossStats);

  // Dong modal Boss
  await page.keyboard.press('Escape');
  await sleep(500);

  // 2. Kiem tra Kenh Chat The Gioi: Gui tin nhan
  console.log('[TEST] Gui tin nhan Kenh The Gioi...');
  await page.focus('#chat-input-box');
  await page.type('#chat-input-box', 'Chuc mung cac dong dao! Boss Tu Tien da tang mau gap 10 lan!');
  await page.click('#btn-send-chat');
  await sleep(1000);

  // Gui them 1 tin nhan nua
  await page.focus('#chat-input-box');
  await page.type('#chat-input-box', 'Ty le do Bach Kim da duoc dieu chinh cuc ky quy hiem!');
  await page.keyboard.press('Enter');
  await sleep(1000);

  const shotChatWorld = path.join(ARTIFACT_DIR, 'verify_v10_2_chat_world_and_system.png');
  await page.screenshot({ path: shotChatWorld });
  console.log('[TEST] Da chup Kenh Chat The Gioi & He Thong:', shotChatWorld);

  // 3. Kiem tra bo loc tab Kenh The Gioi
  console.log('[TEST] Click Tab [The Gioi]...');
  await page.click('.chat-tab-btn[data-channel="world"]');
  await sleep(600);

  const shotChatTabWorld = path.join(ARTIFACT_DIR, 'verify_v10_3_chat_tab_world.png');
  await page.screenshot({ path: shotChatTabWorld });
  console.log('[TEST] Da chup Tab The Gioi:', shotChatTabWorld);

  // 4. Kiem tra bo loc tab Kenh He Thong
  console.log('[TEST] Click Tab [He Thong]...');
  await page.click('.chat-tab-btn[data-channel="system"]');
  await sleep(600);

  const shotChatTabSystem = path.join(ARTIFACT_DIR, 'verify_v10_4_chat_tab_system.png');
  await page.screenshot({ path: shotChatTabSystem });
  console.log('[TEST] Da chup Tab He Thong:', shotChatTabSystem);

  await browser.close();
  console.log('[TEST] Hoan tat tat ca kiem thu V10!');
})();
