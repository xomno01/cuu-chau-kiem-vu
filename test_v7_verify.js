const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/phamn/.gemini/antigravity/brain/d3c374a5-59b6-40b1-b4b4-b6e30734a701';
const delay = ms => new Promise(r => setTimeout(r, ms));

async function runTest() {
  console.log('=== BẮT ĐẦU KIỂM THỬ TOÀN DIỆN V7: FIX UNDEFINED, DOCK ICONS & SĂN BOSS ===');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();
  page.on('dialog', async dialog => {
    console.log('[Browser Alert]:', dialog.message());
    await dialog.accept();
  });

  const capturedChatMessages = [];

  page.on('console', msg => {
    const text = msg.text();
    if (!text.includes('deprecated') && !text.includes('MaxListenersExceededWarning') && !text.includes('Failed to load resource')) {
      console.log('[Browser Console]:', text);
    }
  });

  await page.goto('http://127.0.0.1:3000', { waitUntil: 'domcontentloaded' });
  await delay(1500);

  // 1. ĐĂNG KÝ TÀI KHOẢN MỚI
  const testUser = 'boss_slayer_' + Math.floor(Math.random() * 8999 + 1000);
  const testPass = '123456';
  console.log(`1. Đăng ký tài khoản: ${testUser}`);

  await page.evaluate(() => {
    const regTab = document.getElementById('tab-btn-register');
    if (regTab) regTab.click();
  });
  await delay(400);

  await page.type('#auth-reg-user', testUser);
  await page.type('#auth-reg-pass', testPass);
  await page.type('#auth-reg-repass', testPass);
  await page.evaluate(() => document.getElementById('btn-submit-register').click());
  await delay(1800);

  // 2. ĐĂNG NHẬP
  console.log(`2. Đăng nhập: ${testUser}`);
  await page.evaluate((u, p) => {
    document.getElementById('tab-btn-login').click();
    const uEl = document.getElementById('auth-login-user');
    const pEl = document.getElementById('auth-login-pass');
    if (uEl) uEl.value = u;
    if (pEl) pEl.value = p;
    document.getElementById('btn-submit-login').click();
  }, testUser, testPass);
  await delay(1800);

  // 3. TẠO NHÂN VẬT: Hoa Sơn Kiếm Hiệp
  const charName = 'Kiếm Thánh ' + testUser.slice(-4);
  console.log(`3. Tạo nhân vật: ${charName}`);
  await page.evaluate(() => {
    document.getElementById('btn-open-create-char').click();
  });
  await delay(600);

  await page.evaluate((cName) => {
    const huashanCard = document.querySelector('#char-create-box .sect-card[data-sect="huashan"]');
    if (huashanCard) huashanCard.click();
    const nameInp = document.getElementById('char-name-input');
    if (nameInp) nameInp.value = cName;
    document.getElementById('btn-submit-create-char').click();
  }, charName);
  await delay(3000);

  // 4. KIỂM TRA BỘ ICON DOCK MENU BÊN PHẢI (RIGHT DOCK MENU)
  console.log('4. Kiểm tra các icon hình ảnh nghệ thuật trên thanh dock bên phải...');
  const dockIconsReport = await page.evaluate(() => {
    const dockButtons = document.querySelectorAll('.right-dock-menu .btn-dock-icon');
    const results = [];
    dockButtons.forEach(btn => {
      const img = btn.querySelector('.dock-icon-img');
      results.push({
        id: btn.id,
        title: btn.title,
        hasImg: !!img,
        src: img ? img.src : null,
        naturalWidth: img ? img.naturalWidth : 0,
        naturalHeight: img ? img.naturalHeight : 0,
        displayed: window.getComputedStyle(btn).display !== 'none'
      });
    });
    return results;
  });

  console.log(`✓ Đã tìm thấy ${dockIconsReport.length} nút trên Dock Menu.`);
  let allIconsLoaded = true;
  for (const ic of dockIconsReport) {
    if (ic.displayed) {
      const ok = ic.hasImg && ic.naturalWidth > 0;
      if (!ok) allIconsLoaded = false;
      console.log(`  - [${ic.id}]: img=${ic.hasImg}, naturalSize=${ic.naturalWidth}x${ic.naturalHeight}, title="${ic.title}" => ${ok ? 'OK' : 'FAIL'}`);
    }
  }

  // 5. TEST TỰ ĐỘNG BẬT VÀ KIỂM TRA CHAT LOG XEM CÓ CHỮ UNDEFINED KHÔNG
  console.log('5. Theo dõi chat log trong 6 giây kiểm tra lỗi undefined...');
  await page.evaluate(() => {
    // Bật tắt tự động để sinh ra log
    const btnAuto = document.getElementById('btn-auto-combat');
    if (btnAuto) {
      btnAuto.click(); // Bật
      setTimeout(() => btnAuto.click(), 1500); // Tắt
      setTimeout(() => btnAuto.click(), 3000); // Bật lại
    }
  });

  await delay(5000);

  const chatMessages = await page.evaluate(() => {
    const msgs = [];
    document.querySelectorAll('#chat-messages .chat-msg').forEach(el => {
      msgs.push(el.textContent.trim());
    });
    return msgs;
  });

  console.log(`✓ Thu thập được ${chatMessages.length} dòng chat.`);
  const hasUndefined = chatMessages.some(m => m.includes('undefined'));
  console.log('  Các dòng chat mẫu:', chatMessages.slice(-8));
  if (hasUndefined) {
    console.error('❌ PHÁT HIỆN LỖI: Vẫn còn dòng chat chứa undefined!');
  } else {
    console.log('✅ XÁC NHẬN: Chat log hoàn toàn sạch sẽ, KHÔNG CÓ BẤT KỲ DÒNG NÀO CHỨA undefined!');
  }

  // 6. KIỂM TRA TÍNH NĂNG SĂN BOSS & ĐÁNH BOSS (PHÍM X & NÚT SĂN BOSS)
  console.log('6. Kích hoạt tính năng SĂN BOSS (Phím X / Nút Săn Boss)...');
  await page.evaluate(() => {
    // Kích hoạt Săn Boss
    if (typeof window.triggerHuntBoss === 'function') {
      window.triggerHuntBoss();
    } else {
      document.getElementById('btn-hunt-boss').click();
    }
  });

  // Chờ nhân vật phi thân tới chỗ Boss (Boss Lạc Dương ở x: 400, y: 1450)
  console.log('  Đang di chuyển tới vị trí Boss và giao chiến...');
  await delay(7000);

  // Kiểm tra trạng thái Boss Bar và trận chiến
  const bossCombatState = await page.evaluate(() => {
    const bossBar = document.getElementById('boss-top-bar');
    const bossName = document.getElementById('boss-bar-name');
    const bossHp = document.getElementById('boss-bar-hp-text');
    const distBadge = document.getElementById('boss-distance-badge');
    const myPlayer = window.latestWorldState ? window.latestWorldState.players[window.myPlayerId] : null;
    const currentBoss = window.currentMapBoss;

    return {
      bossBarVisible: bossBar && window.getComputedStyle(bossBar).display !== 'none',
      bossNameText: bossName ? bossName.textContent : '',
      bossHpText: bossHp ? bossHp.textContent : '',
      distanceText: distBadge ? distBadge.textContent : '',
      playerPos: myPlayer ? { x: Math.round(myPlayer.x), y: Math.round(myPlayer.y), hp: myPlayer.hp } : null,
      bossPos: currentBoss ? { x: currentBoss.x, y: currentBoss.y, hp: currentBoss.hp, maxHp: currentBoss.maxHp } : null
    };
  });

  console.log('✓ Trạng thái Boss Bar và Chiến đấu:', JSON.stringify(bossCombatState, null, 2));

  // Chụp ảnh màn hình trận chiến Boss và thanh Dock icons tuyệt đẹp
  const snap1 = path.join(ARTIFACT_DIR, 'verify_v7_1_dock_icons_and_boss_combat.png');
  await page.screenshot({ path: snap1 });
  console.log('✓ Đã chụp ảnh màn hình 1:', snap1);

  // Đánh thêm 5 giây để quan sát máu Boss giảm
  await delay(5000);
  const snap2 = path.join(ARTIFACT_DIR, 'verify_v7_2_boss_in_action_and_clean_chat.png');
  await page.screenshot({ path: snap2 });
  console.log('✓ Đã chụp ảnh màn hình 2:', snap2);

  console.log('=== HOÀN TẤT KIỂM THỬ V7! ===');
  await browser.close();
}

runTest().catch(err => {
  console.error('LỖI TEST V7:', err);
  process.exit(1);
});
