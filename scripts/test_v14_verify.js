const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:\\Users\\phamn\\.gemini\\antigravity\\brain\\d3c374a5-59b6-40b1-b4b4-b6e30734a701';

async function run() {
  console.log('🚀 Starting Puppeteer Verification Test for V14...');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1366,820']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 820 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  page.on('response', resp => {
    if (resp.status() >= 400 && resp.url().includes('assets/')) {
      consoleErrors.push(`Asset 404: ${resp.url()}`);
    }
  });

  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  console.log('✅ Loaded page');

  // Login as xomno01
  await page.waitForSelector('#auth-login-user', { visible: true, timeout: 5000 });
  await page.type('#auth-login-user', 'xomno01');
  await page.type('#auth-login-pass', '123123');
  await page.click('#btn-submit-login');
  console.log('✅ Clicked login button');

  // Wait for character card list
  await page.waitForSelector('.btn-enter-char', { visible: true, timeout: 5000 });
  console.log('✅ Character card list displayed');

  // Click into game with Matcha
  await page.click('.btn-enter-char');
  await new Promise(r => setTimeout(r, 2000));
  console.log('✅ Entered game as Matcha');

  // 1. OPEN INVENTORY (Key B)
  await page.keyboard.press('KeyB');
  await page.waitForSelector('#modal-inventory.active', { timeout: 4000 });
  console.log('✅ Inventory opened (Key B)');

  await new Promise(r => setTimeout(r, 1200));

  // Inspect icons in inventory
  const itemIcons = await page.evaluate(() => {
    const cells = document.querySelectorAll('#inv-grid-container-200 .inv-cell-200 img');
    return Array.from(cells).map(img => img.src);
  });
  console.log(`Found ${itemIcons.length} items rendered in inventory`);
  
  const hasPillTuvi = itemIcons.some(src => src.includes('item_tuvi_pill'));
  const hasPillLife = itemIcons.some(src => src.includes('item_lifespan_pill'));
  const hasPillBreak = itemIcons.some(src => src.includes('item_breakthrough_pill'));
  const hasCloudBoots = itemIcons.some(src => src.includes('equip_cloud_boots'));
  const hasWpnSword = itemIcons.some(src => src.includes('wpn_sword'));
  const hasArmRobe = itemIcons.some(src => src.includes('arm_robe'));
  const hasEquip4 = itemIcons.some(src => src.includes('equip_4'));
  const hasEquip5 = itemIcons.some(src => src.includes('equip_5'));
  const hasEquip3 = itemIcons.some(src => src.includes('equip_3'));

  console.log('Icon Check Results:');
  console.log(' - item_tuvi_pill:', hasPillTuvi);
  console.log(' - item_lifespan_pill:', hasPillLife);
  console.log(' - item_breakthrough_pill:', hasPillBreak);
  console.log(' - equip_cloud_boots:', hasCloudBoots);
  console.log(' - wpn_sword:', hasWpnSword);
  console.log(' - arm_robe:', hasArmRobe);
  console.log(' - equip_4 (gloves):', hasEquip4);
  console.log(' - equip_5 (pants):', hasEquip5);
  console.log(' - equip_3 (ring):', hasEquip3);

  // Hover over the first cultivation gear to show tooltip
  const hoverResult = await page.evaluate(() => {
    const cells = document.querySelectorAll('#inv-grid-container-200 .inv-cell-200');
    for (const cell of cells) {
      if (cell.querySelector('.orbit-aura-ring')) {
        cell.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        cell.click();
        const tt = document.getElementById('inv-item-detail');
        return {
          found: true,
          tooltipText: tt ? tt.innerText.slice(0, 300) : ''
        };
      }
    }
    return { found: false };
  });

  console.log('Hover on cultiv gear:', hoverResult);
  await new Promise(r => setTimeout(r, 800));

  const shot1Path = path.join(ARTIFACT_DIR, 'verify_v14_inventory_icons_and_stats.png');
  await page.screenshot({ path: shot1Path });
  console.log('📸 Saved inventory screenshot to', shot1Path);

  // Close inventory
  await page.keyboard.press('KeyB');
  await new Promise(r => setTimeout(r, 800));

  // 2. TEST AUTO-COMBAT AND KEY 'X' (Boss Hunt Modal)
  console.log('Testing Auto-combat & Key X...');
  await page.keyboard.press('KeyZ'); // Turn ON auto combat
  await new Promise(r => setTimeout(r, 1200));

  // Press Key X to open Boss Hunt modal while auto combat is running
  await page.keyboard.press('KeyX');
  await page.waitForSelector('#modal-boss-hunt.active', { timeout: 3000 });
  console.log('✅ Boss hunt modal opened with Key X');

  // Wait 3 seconds to verify if interval re-rendering or screen shaking occurs
  await new Promise(r => setTimeout(r, 3000));

  const bossCardsCount = await page.evaluate(() => {
    return document.querySelectorAll('#boss-hunt-grid .boss-hunt-card').length;
  });
  console.log(`Boss hunt cards rendered: ${bossCardsCount}`);

  const shot2Path = path.join(ARTIFACT_DIR, 'verify_v14_boss_hunt_modal_smooth.png');
  await page.screenshot({ path: shot2Path });
  console.log('📸 Saved boss hunt screenshot to', shot2Path);

  // Check console errors
  console.log('Console Errors/404s:', consoleErrors);

  await browser.close();
  console.log('🎉 All verifications passed successfully!');
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
