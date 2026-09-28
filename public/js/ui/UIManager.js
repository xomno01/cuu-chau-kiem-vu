// Quản Lý Giao Diện HUD, Bảng Thuộc Tính Tự Thân, Túi 200 Ô, Bảng Kỹ Năng & Hover Tooltip

class UIManager {
  constructor(socket, audioEngine) {
    this.socket = socket;
    this.audioEngine = audioEngine;
    
    this.playerState = null;
    this.skillsData = {};
    this.itemsData = {};
    this.mapsData = {};
    
    this.activeModal = null;
    this.invFilter = 'all'; // 'all', 'equipment', 'consumable', 'scripture'
    this.autoPotionEnabled = true;
    this.lastAutoPotionTime = 0;
    
    this.initDOMElements();
    this.bindEvents();
    this.initHoverTooltip();
    this.initAuthUI();
    this.initCultivationUI();
  }

  initDOMElements() {
    // HUD Player
    this.avatarImg = document.getElementById('player-avatar-img');
    this.playerNameEl = document.getElementById('player-name-text');
    this.playerSectEl = document.getElementById('player-sect-badge');
    this.playerRealmEl = document.getElementById('player-realm-badge');
    this.playerLevelEl = document.getElementById('player-level-num');
    this.hpBarFill = document.getElementById('player-hp-fill');
    this.hpText = document.getElementById('player-hp-text');
    this.mpBarFill = document.getElementById('player-mp-fill');
    this.mpText = document.getElementById('player-mp-text');
    this.expBarFill = document.getElementById('player-exp-fill');
    this.goldText = document.getElementById('player-gold-text');
    this.powerText = document.getElementById('player-power-text');

    // Quick Potions HUD
    this.hpCountText = document.getElementById('quick-hp-count');
    this.mpCountText = document.getElementById('quick-mp-count');
    this.btnQuickHp = document.getElementById('quick-hp-slot');
    this.btnQuickMp = document.getElementById('quick-mp-slot');
    this.btnMeditation = document.getElementById('quick-meditate-slot');

    // Boss Top Bar
    this.bossBarContainer = document.getElementById('boss-top-bar');
    this.bossNameText = document.getElementById('boss-bar-name');
    this.bossHpFill = document.getElementById('boss-bar-hp-fill');
    this.bossHpText = document.getElementById('boss-bar-hp-text');

    // Modals
    this.inventoryModal = document.getElementById('modal-inventory');
    this.characterModal = document.getElementById('modal-character');
    this.skillTreeModal = document.getElementById('modal-skill-tree');
    this.meridiansModal = document.getElementById('modal-meridians');
    this.worldMapModal = document.getElementById('modal-world-map');
    this.rankingModal = document.getElementById('modal-ranking');
    this.questModal = document.getElementById('modal-quest');
    this.npcModal = document.getElementById('modal-npc-dialogue');
    this.forgeModal = document.getElementById('modal-forge');
    this.luckyWheelModal = document.getElementById('modal-lucky-wheel');
    this.titlesModal = document.getElementById('modal-titles');
    this.lootFilterModal = document.getElementById('modal-loot-filter');
    this.cultivationModal = document.getElementById('modal-cultivation');
    this.permadeathModal = document.getElementById('modal-permadeath');
    this.bossHuntModal = document.getElementById('modal-boss-hunt');
    this.bossHuntList = [];
    this.currentBossFilter = 'all';
    this.currentMapTab = 'mortal';
    this.currentWheelRotation = 0;
    this.isSpinning = false;
    this.selectedForgeEquip = null;
    this.selectedSocketEquip = null;
    this.selectedSocketIdx = null;

    // Chat
    this.chatLog = document.getElementById('chat-messages');
    this.chatInput = document.getElementById('chat-input-box');
    this.currentChatFilter = 'all';
  }

  // Khởi tạo Floating Tooltip bám theo con trỏ chuột
  initHoverTooltip() {
    this.tooltipEl = document.createElement('div');
    this.tooltipEl.id = 'floating-item-tooltip';
    this.tooltipEl.className = 'wuxia-floating-tooltip';
    document.body.appendChild(this.tooltipEl);

    this.lastMouseX = 500;
    this.lastMouseY = 300;

    window.addEventListener('mousemove', (e) => {
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      this.updateTooltipPos(e.clientX, e.clientY);
    });
  }

  updateTooltipPos(mouseX, mouseY) {
    if (!this.tooltipEl || this.tooltipEl.style.display !== 'block') return;
    const tw = this.tooltipEl.offsetWidth || 300;
    const th = this.tooltipEl.offsetHeight || 280;
    const pad = 12;

    let left = mouseX + 18;
    let top = mouseY + 18;

    if (left + tw > window.innerWidth - pad) {
      left = mouseX - tw - 18;
    }

    if (top + th > window.innerHeight - pad) {
      top = mouseY - th - 18;
    }

    if (top < pad) top = pad;
    if (left < pad) left = pad;
    if (top + th > window.innerHeight) {
      top = Math.max(pad, window.innerHeight - th - pad);
    }

    this.tooltipEl.style.left = `${left}px`;
    this.tooltipEl.style.top = `${top}px`;
  }

  // HOVER TOOLTIP HIỂN THỊ CHUẨN 9 CẤP BẬC PHẨM CẤP & BẠCH KIM CHÍ TÔN
  showTooltip(itemDef, itemData = null) {
    if (!itemDef) return;
    
    // Nếu itemDef là trang bị dạng object hoàn chỉnh
    const isEquip = itemDef.type === 'equipment' || !!itemDef.baseStats || !!itemDef.affixes;
    const rarity = itemDef.rarity || 'common';
    const isPlatinum = rarity === 'platinum' || itemDef.isShimmering;

    const rarityNames = {
      common: 'PHỔ THÔNG (BẠCH SẮC)',
      uncommon: 'ƯU TÚ (LỤC QUANG)',
      rare: 'HIẾM (LAM SẮC)',
      epic: 'SỬ THI (TỬ DIỆU)',
      legendary: 'HOÀNG KIM (KIM QUANG)',
      mythic: 'TRUYỀN THUYẾT (XÍ HỎA)',
      celestial: 'THẦN THOẠI (HUYẾT HOÀNG)',
      abyssal: 'MA THẦN (ÁM DẠ ÁM QUANG)',
      platinum: '★ BẠCH KIM CHÍ TÔN (CỬU THIÊN THẦN VẬT) ★'
    };

    const slotNames = {
      weapon: 'Vũ Khí',
      helmet: 'Chiến Mão / Nón',
      necklace: 'Hạng Liên / Dây Chuyền',
      armor: 'Chiến Bào / Áo Giáp',
      gloves: 'Hộ Oản / Cổ Tay',
      ring: 'Giới Chỉ / Nhẫn',
      pants: 'Chiến Khố / Quần',
      boots: 'Phi Hài / Giày',
      talisman: 'Phi Phong / Lệnh Bài'
    };

    let titleText = itemDef.name || 'Vật Phẩm';
    if (isEquip && typeof itemDef.upgradeLevel === 'number') {
      titleText = `${itemDef.name} ${itemDef.upgradeLevel > 0 ? `+${itemDef.upgradeLevel}` : ''}`;
    }

    const iconSrc = itemDef.icon 
      ? `assets/icons/${itemDef.icon.replace('.png','')}.png` 
      : 'assets/icons/item_1.png';

    let statsHtml = '';

    if (isEquip) {
      if (itemDef.slot) {
        statsHtml += `<div class="tt-stat" style="color:#fde047; font-weight:bold;">Vị Trí: ${slotNames[itemDef.slot] || itemDef.slot}</div>`;
      }
      if (itemDef.levelReq) {
        statsHtml += `<div class="tt-stat" style="color:#94a3b8;">Yêu Cầu: Lv.${itemDef.levelReq}</div>`;
      }
      if (itemDef.isCultivGear) {
        statsHtml += `<div class="tt-cultiv-banner" style="background: linear-gradient(90deg, rgba(234,179,8,0.25), rgba(168,85,247,0.25)); border: 1px solid #ffd700; color: #ffd700; padding: 3px 6px; border-radius: 4px; font-weight: bold; font-size: 11px; margin-bottom: 4px; text-align: center; text-shadow: 0 0 8px rgba(255,215,0,0.6);">⚡ BẢO VẬT TU TIÊN (CHỈ SỐ x5 BÁ ĐẠO)</div>`;
      }

      if (itemDef.unidentified) {
        statsHtml += `
          <div class="tt-unidentified-banner">⚠ CHƯA GIÁM ĐỊNH (CHUỘT PHẢI DÙNG GIÁM ĐỊNH PHÙ)</div>
          <div class="tt-stat" style="color:#f87171; font-style:italic;">✦ Thuộc tính cơ bản: [Bị Phong Ấn ???]</div>
          <div class="tt-stat" style="color:#f87171; font-style:italic;">✦ Linh khí khai quang: [Chưa Rõ ???]</div>
        `;
      } else {
        // Chỉ số cơ bản
        if (itemDef.baseStats) {
          statsHtml += `<div style="margin-top:4px; font-weight:bold; color:#e2e8f0; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:2px;">Thuộc Tính Cơ Bản:</div>`;
          if (itemDef.baseStats.power) statsHtml += `<div class="tt-stat">⚔ Ngoại Công: +${itemDef.baseStats.power}</div>`;
          if (itemDef.baseStats.def) statsHtml += `<div class="tt-stat">🛡 Phòng Ngự: +${itemDef.baseStats.def}</div>`;
          if (itemDef.baseStats.hp) statsHtml += `<div class="tt-stat">❤ Khí Huyết: +${itemDef.baseStats.hp}</div>`;
          if (itemDef.baseStats.mp) statsHtml += `<div class="tt-stat">💧 Chân Khí: +${itemDef.baseStats.mp}</div>`;
          if (itemDef.baseStats.crit) statsHtml += `<div class="tt-stat">⚡ Bạo Kích: +${Math.round(itemDef.baseStats.crit * 100)}%</div>`;
          if (itemDef.baseStats.dodge) statsHtml += `<div class="tt-stat">💨 Né Tránh: +${Math.round(itemDef.baseStats.dodge * 100)}%</div>`;
          if (itemDef.baseStats.speed) statsHtml += `<div class="tt-stat">🏃 Thân Pháp: +${itemDef.baseStats.speed} px/s</div>`;
        }

        // Các dòng thuộc tính ngẫu nhiên (Affixes)
        if (itemDef.affixes && itemDef.affixes.length > 0) {
          statsHtml += `<div style="margin-top:6px; font-weight:bold; color:#4ade80; border-bottom:1px solid rgba(74,222,128,0.2); padding-bottom:2px;">Linh Khí Khai Quang (${itemDef.affixes.length} dòng):</div>`;
          itemDef.affixes.forEach(aff => {
            const valDisplay = (aff.key === 'cooldownReduction' || aff.key === 'tuviBoost') ? `${Math.round(aff.val * 100)}%` : `${aff.val}${aff.unit || ''}`;
            statsHtml += `<div class="tt-affix-stat">✦ ${aff.name}: +${valDisplay}</div>`;
          });
        }

        // Các lỗ khảm ngọc (Sockets)
        if (itemDef.sockets && itemDef.sockets.length > 0) {
          statsHtml += `<div class="tt-sockets-box"><div style="color:#38bdf8; font-weight:bold; margin-bottom:4px;">💎 Lỗ Khảm Ngọc (${itemDef.sockets.length}/3 Lỗ):</div>`;
          itemDef.sockets.forEach((s, idx) => {
            const gem = s ? (s.gem || (s.name ? s : null)) : null;
            if (gem) {
              const statName = gem.statDesc || (gem.statKey === 'power' ? 'Ngoại Công' : (gem.statKey === 'def' ? 'Phòng Ngự' : (gem.statKey === 'hp' ? 'Khí Huyết' : (gem.statKey === 'crit' ? '% Bạo Kích' : (gem.statKey === 'dodge' ? '% Né Tránh' : 'Chân Khí')))));
              statsHtml += `<div class="tt-socket-item gemmed">✦ Lỗ ${idx + 1}: [${gem.name || 'Hồng Ngọc'}] +${gem.statVal || 0} ${statName}</div>`;
            } else {
              statsHtml += `<div class="tt-socket-item">○ Lỗ ${idx + 1}: [Đã Đục Lỗ - Chưa Khảm Ngọc]</div>`;
            }
          });
          statsHtml += `</div>`;
        }

        // Kích hoạt Bộ Set (Set Bonuses)
        const setDefs = {
          set_than_long: {
            name: 'Thần Long Chí Tôn Bộ',
            bonuses: {
              2: '+120 Ngoại Công, +5% Bạo Kích',
              4: '+350 Ngoại Công, +15% Sát Thương Bạo Kích',
              6: '+600 Ngoại Công, +20% Hút Máu, 10% Tỷ Lệ Đòn Đánh Kích Hoạt Long Hống'
            }
          },
          set_bac_minh: {
            name: 'Bắc Minh Tiên Hộ Bộ',
            bonuses: {
              2: '+1,500 Khí Huyết, +350 Chân Khí',
              4: '+8% Hút Sinh Lực, +120 Ngoại Thủ',
              6: '+3,500 Khí Huyết, Băng Phách Hộ Thể (Hồi 5% Chân Khí mỗi đòn)'
            }
          },
          set_kim_cang: {
            name: 'Kim Cang Bất Hoại Bộ',
            bonuses: {
              2: '+140 Ngoại Thủ, +1,200 Khí Huyết',
              4: '+300 Ngoại Thủ, Phản Chấn +18% Sát Thương',
              6: '+650 Ngoại Thủ, Kim Cang Bất Hoại Thân (Miễn nhiễm 25% sát thương)'
            }
          },
          // 4 ĐẠI SET TRANG BỊ TU TIÊN SIÊU CẤP
          set_thai_thanh: {
            name: 'Thái Thanh Cửu Thiên (Tiên Đạo)',
            bonuses: {
              2: '+1,500 Ngoại Công, +15,000 Khí Huyết, Giảm 15% Hồi Chiêu',
              4: '+4,000 Ngoại Công, +45,000 Khí Huyết, Giảm 25% Hồi Chiêu, +35% Tốc Độ Tu Vi',
              6: 'Tiên Đạo Hào Quang: +10,000 Công, +120,000 HP, Giảm 35% Hồi Chiêu, +70% Tu Vi'
            }
          },
          set_bo_de: {
            name: 'Bồ Đề Kim Thân (Phật Môn)',
            bonuses: {
              2: '+1,200 Phòng Ngự, +25,000 Khí Huyết, Phản Đòn 15%',
              4: '+3,500 Phòng Ngự, +80,000 Khí Huyết, Phản Đòn 30%, Kéo Dài +100 Năm Thọ Mệnh',
              6: 'Phật Quang Bất Diệt: +9,000 Thủ, +200,000 HP, Phản Đòn 50%, Miễn Tử Khi Trọng Thương'
            }
          },
          set_huyet_ma: {
            name: 'Huyết Ma Diệt Thế (Ma Tông)',
            bonuses: {
              2: '+2,000 Ngoại Công, +15% Bạo Kích, +15% Hút Máu',
              4: '+5,500 Ngoại Công, +30% Bạo Kích, +30% Hút Máu, +80% Sát Thương Bạo Kích',
              6: 'Huyết Ma Thần Uy: +14,000 Công, +50% Bạo Kích, +50% Hút Máu, Tăng 50% Tốc Độ Vũ Bão'
            }
          },
          set_van_yeu: {
            name: 'Vạn Yêu Hồng Hoang (Yêu Tộc)',
            bonuses: {
              2: '+40 Thân Pháp, +15% Né Tránh, +1,800 Ngoại Công',
              4: '+80 Thân Pháp, +30% Né Tránh, +4,800 Ngoại Công, +40% Sát Thương Độc Tố',
              6: 'Yêu Thần Giáng Lâm: +120 Thân Pháp, +50% Né Tránh, +12,000 Công, Đòn Đánh Bỏ Qua Phòng Ngự'
            }
          }
        };

        const currentSetId = itemDef.setId || itemDef.set;
        if (currentSetId && setDefs[currentSetId]) {
          const sDef = setDefs[currentSetId];
          let activeCount = 0;
          if (this.playerState && this.playerState.equipment) {
            Object.values(this.playerState.equipment).forEach(eq => {
              if (eq && (eq.setId === currentSetId || eq.set === currentSetId)) activeCount++;
            });
          }
          statsHtml += `<div class="tt-set-box"><div class="tt-set-title">❖ ${sDef.name} (${activeCount}/6 món đang mặc) ❖</div>`;
          for (const [reqCount, desc] of Object.entries(sDef.bonuses)) {
            const isActive = activeCount >= parseInt(reqCount);
            statsHtml += `<div class="tt-set-line ${isActive ? 'active' : ''}">(${reqCount} món): ${desc} ${isActive ? '⚡ [ĐÃ KÍCH HOẠT]' : '○ [Chưa kích hoạt]'}</div>`;
          }
          statsHtml += `</div>`;
        }
      }
    } else {
      // Tiêu hao phẩm
      if (itemDef.healHp) statsHtml += `<div class="tt-stat heal-stat">🌿 Hồi Phục: +${itemDef.healHp} Khí Huyết</div>`;
      if (itemDef.healMp) statsHtml += `<div class="tt-stat mana-stat">💧 Hồi Phục: +${itemDef.healMp} Chân Khí (Mana)</div>`;
      if (itemDef.realmPoints) statsHtml += `<div class="tt-stat realm-stat">📖 Đột Phá: +${itemDef.realmPoints} Tu Vi Chân Khí</div>`;
      if (itemDef.tuviBonus) statsHtml += `<div class="tt-stat realm-stat" style="color:#38bdf8;">✨ Linh Khí: +${itemDef.tuviBonus} Điểm Tu Vi</div>`;
      if (itemDef.lifespanBonus) statsHtml += `<div class="tt-stat realm-stat" style="color:#4ade80;">⏳ Diên Thọ: +${itemDef.lifespanBonus} Năm Thọ Mệnh</div>`;
      if (itemDef.goldValue) statsHtml += `<div class="tt-stat realm-stat">💰 Ngân Lượng: +${itemDef.goldValue} Vàng</div>`;
    }

    const countText = (itemData && itemData.count > 1) ? ` (x${itemData.count})` : '';

    this.tooltipEl.innerHTML = `
      <div class="tt-header rarity-${rarity} ${isPlatinum ? 'rarity-platinum' : ''}">
        <img src="${iconSrc}" class="tt-icon" />
        <div>
          <div class="tt-name ${isPlatinum ? 'is-platinum' : ''}">${titleText}${countText}</div>
          <div class="tt-rarity" style="color: ${itemDef.rarityColor || '#cbd5e1'};">${rarityNames[rarity] || 'VẬT PHẨM GIANG HỒ'}</div>
        </div>
      </div>
      <div class="tt-stats-box">${statsHtml || '<div class="tt-stat">Vật phẩm thông dụng</div>'}</div>
      <div class="tt-desc">${itemDef.desc || 'Bảo vật do tiền bối giang hồ lưu lại.'}</div>
      <div class="tt-instruction">
        ${itemDef.unidentified 
          ? '<span style="color:#f87171; font-weight:bold;">[Chuột Phải]: Dùng Giám Định Phù Mở Khóa Thuộc Tính</span>' 
          : `[Chuột Trái]: Xem Chi Tiết · [Chuột Phải]: ${isEquip ? 'Trang Bị / Tháo' : 'Sử Dụng Nhanh'}`}
      </div>
    `;
    this.tooltipEl.style.display = 'block';
    this.updateTooltipPos(this.lastMouseX || 500, this.lastMouseY || 300);
  }

  hideTooltip() {
    this.tooltipEl.style.display = 'none';
  }

  bindEvents() {
    // Phím tắt
    window.addEventListener('keydown', (e) => {
      // Bỏ qua toàn bộ phím tắt nếu người dùng đang nhập liệu trong ô input/textarea
      if (document.activeElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable)) {
        if (document.activeElement === this.chatInput && e.key === 'Enter') {
          this.sendChat();
        }
        return;
      }

      if (e.key === 'Enter') {
        if (this.chatInput) this.chatInput.focus();
        e.preventDefault();
        return;
      }

      if (!e || typeof e.key !== 'string') return;

      switch (e.key.toLowerCase()) {
        case 'c': // Bảng thuộc tính tự thân
          this.toggleModal('character');
          break;
        case 'b': // Túi đồ 200 ô
          this.toggleModal('inventory');
          break;
        case 'v': // Bảng kỹ năng võ học
          this.toggleModal('skill_tree');
          break;
        case 'k': // Kinh mạch
          this.toggleModal('meridians');
          break;
        case 'm': // Bản đồ thế giới
          this.toggleModal('world_map');
          break;
        case 'l': // Xếp hạng
          this.toggleModal('ranking');
          break;
        case 'u': // 12 Đại Danh Hiệu Võ Lâm
          this.toggleModal('titles');
          break;
        case 'y': // Tu Tiên Hóa Cảnh & Thọ Nguyên
          this.toggleModal('cultivation');
          break;
        case 'o': // Vòng quay may mắn Thiên Mệnh Chi Luân
          this.toggleModal('lucky_wheel');
          break;
        case 'g': // Lò Rèn Thần Binh & Cường Hóa
          this.toggleModal('forge');
          break;
        case 'x': // Bảng Săn Boss Thế Giới
          this.toggleModal('boss_hunt');
          break;
        case 'q': // Bơm máu nhanh (hoặc mở quest nếu phím riêng)
          this.socket.emit('quick_potion', { type: 'hp' });
          this.audioEngine.playLoot();
          break;
        case 'e': // Bơm mana nhanh
          this.socket.emit('quick_potion', { type: 'mp' });
          this.audioEngine.playLoot();
          break;
        case 't': // Thiền định đả tọa
          this.socket.emit('toggle_meditation');
          this.audioEngine.playSwordDraw();
          break;
      }
    });

    // Nút Bơm Máu / Bơm Mana trên HUD
    if (this.btnQuickHp) {
      const useHp = (e) => {
        if (e && e.type === 'touchstart') e.preventDefault();
        this.socket.emit('quick_potion', { type: 'hp' });
        this.audioEngine.playLoot();
      };
      this.btnQuickHp.onclick = useHp;
      this.btnQuickHp.addEventListener('touchstart', useHp, { passive: false });
    }
    if (this.btnQuickMp) {
      const useMp = (e) => {
        if (e && e.type === 'touchstart') e.preventDefault();
        this.socket.emit('quick_potion', { type: 'mp' });
        this.audioEngine.playLoot();
      };
      this.btnQuickMp.onclick = useMp;
      this.btnQuickMp.addEventListener('touchstart', useMp, { passive: false });
    }
    if (this.btnMeditation) {
      const useMed = (e) => {
        if (e && e.type === 'touchstart') e.preventDefault();
        this.socket.emit('toggle_meditation');
        this.audioEngine.playSwordDraw();
      };
      this.btnMeditation.onclick = useMed;
      this.btnMeditation.addEventListener('touchstart', useMed, { passive: false });
    }

    // Nút đóng Modals
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', () => this.closeAllModals());
    });

    // Nút dock bên phải
    const btnCultiv = document.getElementById('btn-dock-cultiv');
    if (btnCultiv) btnCultiv.addEventListener('click', () => this.toggleModal('cultivation'));
    const btnWheel = document.getElementById('btn-dock-wheel');
    if (btnWheel) btnWheel.addEventListener('click', () => this.toggleModal('lucky_wheel'));
    const btnTitle = document.getElementById('btn-dock-title');
    if (btnTitle) btnTitle.addEventListener('click', () => this.toggleModal('titles'));
    document.getElementById('btn-dock-char').addEventListener('click', () => this.toggleModal('character'));
    document.getElementById('btn-dock-inv').addEventListener('click', () => this.toggleModal('inventory'));
    const btnForge = document.getElementById('btn-dock-forge');
    if (btnForge) btnForge.addEventListener('click', () => this.toggleModal('forge'));
    document.getElementById('btn-dock-skill').addEventListener('click', () => this.toggleModal('skill_tree'));
    document.getElementById('btn-dock-meridian').addEventListener('click', () => this.toggleModal('meridians'));
    const btnDungeon = document.getElementById('btn-dock-dungeon');
    if (btnDungeon) {
      btnDungeon.addEventListener('click', () => {
        if (confirm('Bạn có muốn tiến vào Phụ Bản Bí Cảnh [Cửu U Ma Huyệt]? (Yêu ma tử khí cực mạnh!)')) {
          this.socket.emit('enter_dungeon');
        }
      });
    }
    document.getElementById('btn-dock-map').addEventListener('click', () => this.toggleModal('world_map'));
    document.getElementById('btn-dock-rank').addEventListener('click', () => this.toggleModal('ranking'));
    document.getElementById('btn-dock-sound').addEventListener('click', () => this.toggleAudio());

    // Nút Bảng Săn Boss Thế Giới (Dock & Bottom & Boss Top Bar)
    const btnDockHunt = document.getElementById('btn-dock-hunt-boss');
    if (btnDockHunt) btnDockHunt.addEventListener('click', () => this.toggleModal('boss_hunt'));
    const btnBottomHunt = document.getElementById('btn-hunt-boss');
    if (btnBottomHunt) btnBottomHunt.addEventListener('click', () => this.toggleModal('boss_hunt'));
    const btnTopGotoBoss = document.getElementById('btn-goto-boss');
    if (btnTopGotoBoss) btnTopGotoBoss.addEventListener('click', () => this.toggleModal('boss_hunt'));

    // Nút mở Bộ Lọc Tự Nhặt Đồ & Nút Lưu
    const btnOpenLootFilter = document.getElementById('btn-open-loot-filter');
    if (btnOpenLootFilter) btnOpenLootFilter.addEventListener('click', () => this.toggleModal('loot_filter'));
    const btnSaveLootFilter = document.getElementById('btn-save-loot-filter');
    if (btnSaveLootFilter) {
      btnSaveLootFilter.addEventListener('click', () => {
        const selectedRarity = document.querySelector('input[name="loot-min-rarity"]:checked')?.value || 'common';
        const allowEquip = document.getElementById('chk-loot-equip')?.checked ?? true;
        const allowPotion = document.getElementById('chk-loot-potion')?.checked ?? true;
        const allowGemCharm = document.getElementById('chk-loot-gem-charm')?.checked ?? true;
        this.socket.emit('set_loot_filter', {
          minRarity: selectedRarity,
          allowEquip,
          allowPotion,
          allowGemCharm
        });
        this.closeAllModals();
      });
    }

    // Lắng nghe cập nhật danh hiệu & bộ lọc từ server
    this.socket.on('active_title_result', (res) => {
      if (res && res.success && this.playerState) {
        this.playerState.activeTitle = res.activeTitle;
        if (this.activeModal === 'titles') this.renderTitlesModal();
      }
    });

    this.socket.on('loot_filter_result', (res) => {
      if (res && res.success && this.playerState) {
        this.playerState.lootFilter = res.lootFilter;
      }
    });

    // Nút Quay Vòng Quay May Mắn (Khai Luân)
    const btnSpin = document.getElementById('btn-spin-wheel');
    if (btnSpin) {
      btnSpin.addEventListener('click', () => this.handleSpinWheel());
    }

    // Lắng nghe kết quả quay vòng quay từ Server
    this.socket.on('spin_wheel_result', (res) => {
      this.handleSpinResult(res);
    });

    // Nút gửi chat & Tabs Kênh Chat (Thế Giới / Hệ Thống / Tất Cả)
    const btnSendChat = document.getElementById('btn-send-chat');
    if (btnSendChat) btnSendChat.addEventListener('click', () => this.sendChat());

    // MOBILE RESPONSIVE UI BINDINGS
    // 1. Thu nhỏ / Mở rộng Minimap
    const btnToggleMinimap = document.getElementById('btn-toggle-minimap');
    const minimapFrame = document.getElementById('minimap-frame');
    if (btnToggleMinimap && minimapFrame) {
      btnToggleMinimap.onclick = (e) => {
        e.stopPropagation();
        minimapFrame.classList.toggle('collapsed');
      };
    }

    // 2. Mở / Đóng Menu Chức Năng trên Mobile
    const btnToggleMenu = document.getElementById('btn-toggle-menu-mobile');
    const rightDock = document.getElementById('right-dock-menu');
    if (btnToggleMenu && rightDock) {
      btnToggleMenu.onclick = (e) => {
        e.stopPropagation();
        rightDock.classList.toggle('show-mobile');
      };
      document.addEventListener('click', (e) => {
        if (!rightDock.contains(e.target) && e.target !== btnToggleMenu) {
          rightDock.classList.remove('show-mobile');
        }
      });
    }

    // 3. Mobile Chat Ticker & Nút Đóng Chat
    const chatTicker = document.getElementById('mobile-chat-ticker');
    const chatDock = document.getElementById('chat-dock');
    const btnCloseChat = document.getElementById('btn-close-chat-mobile');
    if (chatTicker && chatDock) {
      chatTicker.onclick = () => {
        chatDock.classList.add('active-mobile');
        const input = document.getElementById('chat-input-box');
        if (input) input.focus();
      };
    }
    if (btnCloseChat && chatDock) {
      btnCloseChat.onclick = (e) => {
        e.stopPropagation();
        chatDock.classList.remove('active-mobile');
      };
    }

    const chatTabs = document.querySelectorAll('#chat-channel-tabs .chat-tab-btn');
    chatTabs.forEach(btn => {
      btn.addEventListener('click', () => {
        chatTabs.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filterChat(btn.dataset.channel || 'all');
      });
    });

    // Tabs trong Túi Đồ
    document.querySelectorAll('.inv-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.inv-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.invFilter = btn.dataset.filter;
        this.renderInventory();
      });
    });

    // Nút Sắp Xếp Túi Đồ
    const btnSort = document.getElementById('btn-sort-inventory');
    if (btnSort) {
      btnSort.onclick = () => {
        this.socket.emit('sort_inventory');
        this.audioEngine.playLoot();
      };
    }

    // Nút Bán Đồ Rác (Trắng & Lục)
    const btnSellJunk = document.getElementById('btn-sell-junk');
    if (btnSellJunk) {
      btnSellJunk.onclick = () => {
        if (confirm('Bán TẤT CẢ trang bị phẩm cấp Phổ Thông (Trắng) và Ưu Tú (Lục) trong túi lấy Ngân Lượng?')) {
          this.socket.emit('sell_junk');
          this.audioEngine.playLoot();
        }
      };
    }

    // Nút Bán Nhanh Theo Phẩm Cấp Đã Chọn (Tùy Chọn Phẩm Cấp)
    const btnSellRarity = document.getElementById('btn-sell-selected-rarity');
    if (btnSellRarity) {
      btnSellRarity.onclick = () => {
        const chkBoxContainer = document.getElementById('rarity-sell-checkboxes');
        if (!chkBoxContainer) return;
        const checkedBoxes = chkBoxContainer.querySelectorAll('input[type="checkbox"]:checked');
        const selectedRarities = Array.from(checkedBoxes).map(cb => cb.value);

        if (selectedRarities.length === 0) {
          this.showNotice('Vui lòng tích chọn ít nhất một phẩm cấp cần bán!', 'warning');
          return;
        }

        const rarityNamesMap = {
          common: 'Trắng',
          uncommon: 'Lục',
          rare: 'Lam',
          epic: 'Tím',
          legendary: 'Vàng',
          mythic: 'Cam',
          celestial: 'Đỏ',
          abyssal: 'Đen',
          platinum: 'Bạch Kim'
        };
        const selectedNames = selectedRarities.map(r => rarityNamesMap[r] || r).join(', ');

        if (confirm(`Bạn có chắc chắn muốn bán TẤT CẢ trang bị phẩm cấp [${selectedNames}] trong túi đồ?`)) {
          this.socket.emit('sell_by_rarity', { rarities: selectedRarities });
          this.audioEngine.playLoot();
        }
      };
    }

    // Lắng nghe các phản hồi cập nhật túi đồ & trang bị
    this.socket.on('sell_junk_result', () => {
      this.lastInvHash = null;
      if (this.activeModal === 'inventory') this.renderInventory();
    });

    this.socket.on('sell_by_rarity_result', () => {
      this.lastInvHash = null;
      if (this.activeModal === 'inventory') this.renderInventory();
    });

    this.socket.on('sell_result', () => {
      this.lastInvHash = null;
      if (this.activeModal === 'inventory') {
        this.renderInventory();
        const detailBox = document.getElementById('inv-item-detail');
        if (detailBox) {
          detailBox.innerHTML = '<p style="color:#22c55e; font-size:12px; text-align:center;">✓ Đã bán món đồ thành công!</p>';
        }
      }
    });

    this.socket.on('equip_result', () => {
      this.lastInvHash = null;
      if (this.activeModal === 'inventory') this.renderInventory();
      if (this.activeModal === 'forge') this.renderForgeEnhanceTab();
    });

    this.socket.on('unequip_result', () => {
      this.lastInvHash = null;
      if (this.activeModal === 'inventory') this.renderInventory();
      if (this.activeModal === 'forge') this.renderForgeEnhanceTab();
    });

    this.socket.on('inventory_sorted', () => {
      this.lastInvHash = null;
      if (this.activeModal === 'inventory') this.renderInventory();
    });

    // Phản hồi từ Lò Rèn Thần Binh
    this.socket.on('enhance_result', (res) => {
      this.lastInvHash = null;
      if (this.activeModal === 'forge') {
        if (res && res.success && res.item && this.selectedForgeEquip) {
          this.selectedForgeEquip.upgradeLevel = res.newLevel;
          this.selectedForgeEquip.baseStats = res.item.baseStats;
        }
        this.renderForgeEnhanceTab();
      }
      if (this.activeModal === 'inventory') this.renderInventory();
    });

    this.socket.on('socket_result', (res) => {
      this.lastInvHash = null;
      if (this.activeModal === 'forge') {
        if (res && res.success && res.item && this.selectedSocketEquip) {
          this.selectedSocketEquip.sockets = res.item.sockets;
        }
        this.renderForgeSocketTab();
      }
    });

    this.socket.on('embed_gem_result', (res) => {
      this.lastInvHash = null;
      if (this.activeModal === 'forge') {
        if (res && res.success && res.item && this.selectedSocketEquip) {
          this.selectedSocketEquip.sockets = res.item.sockets;
        }
        this.renderForgeSocketTab();
      }
    });

    this.socket.on('remove_gem_result', (res) => {
      this.lastInvHash = null;
      if (this.activeModal === 'forge') {
        if (res && res.success && res.item && this.selectedSocketEquip) {
          this.selectedSocketEquip.sockets = res.item.sockets;
        }
        this.renderForgeSocketTab();
      }
    });

    this.socket.on('combine_gems_result', () => {
      this.lastInvHash = null;
      if (this.activeModal === 'forge') {
        this.renderForgeCombineTab();
      }
    });

    // Tabs Phàm Giới / Tiên Giới trong Modal Bản Đồ Thế Giới
    const tabMortal = document.getElementById('tab-btn-map-mortal');
    const tabImmortal = document.getElementById('tab-btn-map-immortal');
    if (tabMortal && tabImmortal) {
      tabMortal.addEventListener('click', () => {
        this.currentMapTab = 'mortal';
        tabMortal.classList.add('active');
        tabImmortal.classList.remove('active');
        this.renderWorldMapSelector();
      });
      tabImmortal.addEventListener('click', () => {
        this.currentMapTab = 'immortal';
        tabImmortal.classList.add('active');
        tabMortal.classList.remove('active');
        this.renderWorldMapSelector();
      });
    }

    // Các bộ lọc Săn Boss Thế Giới
    document.querySelectorAll('.boss-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.boss-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentBossFilter = btn.dataset.filter || 'all';
        this.renderBossHuntList();
      });
    });

    // Lắng nghe danh sách Boss cập nhật từ Server
    this.socket.on('boss_hunt_list', (list) => {
      this.bossHuntList = Array.isArray(list) ? list : [];
      if (this.activeModal === 'boss_hunt') {
        this.renderBossHuntList();
      }
    });

    this.socket.on('hunt_boss_teleport_result', (res) => {
      if (res && res.success) {
        this.showNotice(res.msg || 'Đã phi thân truy sát tới tọa độ Boss!', 'boss_kill');
        this.closeAllModals();
      } else {
        this.showNotice(res ? res.msg : 'Không thể truyền tống tới Boss!', 'warning');
      }
    });
  }

  toggleAudio() {
    const isMuted = this.audioEngine.toggleMute();
    const btn = document.getElementById('btn-dock-sound');
    btn.innerHTML = isMuted ? '🔇' : '🎵';
    this.addChatMessage('Hệ Thống', isMuted ? 'Đã tắt âm thanh nhạc nền.' : 'Đã bật nhạc nền Đàn Tranh Cổ Phong.', 'system');
  }

  setInitData(skillsData, itemsData, mapsData) {
    this.skillsData = skillsData;
    this.itemsData = itemsData;
    this.mapsData = mapsData || {};
  }

  // Cập nhật Player HUD & Kiểm tra Tự động Bơm Dược
  updatePlayerHUD(player) {
    if (!player) return;
    this.playerState = player;

    const avatarMap = {
      huashan: 'assets/images/avatar_huashan.png',
      xiaoyao: 'assets/images/avatar_xiaoyao.png',
      shaolin: 'assets/images/avatar_shaolin.png',
      wudang: 'assets/images/avatar_wudang.png'
    };
    const sectTitleMap = {
      huashan: 'Hoa Sơn Phái',
      xiaoyao: 'Tiêu Dao Tông',
      shaolin: 'Thiếu Lâm Tung Sơn',
      wudang: 'Võ Đang Thái Cực'
    };

    const avatarSrc = avatarMap[player.sect] || 'assets/images/avatar_huashan.png';
    if (this.avatarImg.src !== avatarSrc) {
      this.avatarImg.src = avatarSrc;
    }

    this.playerNameEl.textContent = player.name;
    this.playerSectEl.textContent = sectTitleMap[player.sect] || 'Hiệp Khách';
    this.playerSectEl.className = `badge-sect sect-${player.sect}`;
    this.playerRealmEl.textContent = player.realm;
    this.playerLevelEl.textContent = `Lv.${player.level}`;

    const hpPct = Math.max(0, Math.min(100, (player.hp / player.maxHp) * 100));
    this.hpBarFill.style.width = `${hpPct}%`;
    this.hpText.textContent = `${Math.ceil(player.hp)} / ${player.maxHp}`;

    const mpPct = Math.max(0, Math.min(100, (player.mp / player.maxMp) * 100));
    this.mpBarFill.style.width = `${mpPct}%`;
    this.mpText.textContent = `${Math.ceil(player.mp)} / ${player.maxMp}`;

    const expPct = Math.max(0, Math.min(100, (player.exp / player.expNext) * 100));
    this.expBarFill.style.width = `${expPct}%`;
    const expText = `EXP: ${(player.exp || 0).toLocaleString()} / ${(player.expNext || 100).toLocaleString()} (${expPct.toFixed(1)}%)`;
    const hudExpTextEl = document.getElementById('player-exp-text');
    if (hudExpTextEl) hudExpTextEl.textContent = expText;
    const bottomExpFill = document.getElementById('bottom-exp-fill');
    if (bottomExpFill) bottomExpFill.style.width = `${expPct}%`;
    const bottomExpText = document.getElementById('bottom-exp-text');
    if (bottomExpText) bottomExpText.textContent = expText;

    this.goldText.textContent = (player.gold != null ? player.gold : 0).toLocaleString();
    this.powerText.textContent = (player.combatPower != null ? player.combatPower : 0).toLocaleString();

    // Cập nhật Tu Vi & Thọ Nguyên Tu Tiên trên HUD
    const tuviEl = document.getElementById('player-tuvi-text');
    if (tuviEl) tuviEl.textContent = (player.tuvi || 0).toLocaleString();
    const ageEl = document.getElementById('lbl-player-age');
    if (ageEl) ageEl.textContent = player.age || 18;
    const maxLifespanEl = document.getElementById('lbl-player-max-lifespan');
    if (maxLifespanEl) maxLifespanEl.textContent = player.maxLifespan || 100;

    // Cập nhật số lượng bình máu/mana trên Quick Bar
    const hpItem = player.inventory.find(i => i.itemId === 'item_5');
    const mpItem = player.inventory.find(i => i.itemId === 'item_6');
    this.hpCountText.textContent = hpItem ? hpItem.count : 0;
    this.mpCountText.textContent = mpItem ? mpItem.count : 0;

    // TỰ ĐỘNG BƠM DƯỢC KHI MÁU DƯỚI 40% HOẶC CHÂN KHÍ DƯỚI 25%
    const now = Date.now();
    if (this.autoPotionEnabled && now - this.lastAutoPotionTime > 2000) {
      if (hpPct < 40 && hpItem && hpItem.count > 0) {
        this.socket.emit('quick_potion', { type: 'hp' });
        this.lastAutoPotionTime = now;
      } else if (mpPct < 25 && mpItem && mpItem.count > 0) {
        this.socket.emit('quick_potion', { type: 'mp' });
        this.lastAutoPotionTime = now;
      }
    }

    // Cập nhật số lượt quay Thiên Mệnh Chi Luân
    const spins = typeof player.luckySpins === 'number' ? player.luckySpins : 10;
    const badgeSpins = document.getElementById('dock-badge-spins');
    if (badgeSpins) badgeSpins.textContent = spins;
    const spinsLeftEl = document.getElementById('wheel-spins-left');
    if (spinsLeftEl) spinsLeftEl.textContent = spins;
    const spinBtnSub = document.getElementById('spin-btn-count');
    if (spinBtnSub) spinBtnSub.textContent = spins > 0 ? `FREE ${spins}` : '500 BẠC';

    if (this.activeModal === 'cultivation') {
      this.renderCultivationModal();
    }

    // Refresh modals đang mở VỚI DIRTY-CHECKING (Tránh giật lag và giữ focus/hover)
    if (this.activeModal === 'character') {
      const charHash = `${player.statPoints}_${player.stats.str}_${player.stats.vit}_${player.stats.agi}_${player.stats.eng}_${player.attack}_${player.defense}_${player.hp}_${player.mp}`;
      if (this.lastCharHash !== charHash) {
        this.lastCharHash = charHash;
        this.renderCharacterSheet();
      }
    }
    if (this.activeModal === 'inventory') {
      const invHash = `${player.inventory.length}_${player.gold}_${JSON.stringify(player.equipment)}`;
      if (this.lastInvHash !== invHash) {
        this.lastInvHash = invHash;
        this.renderInventory();
      }
    }
    if (this.activeModal === 'skill_tree') {
      const skillHash = `${player.skillPoints}_${JSON.stringify(player.skillLevels)}`;
      if (this.lastSkillHash !== skillHash) {
        this.lastSkillHash = skillHash;
        this.renderSkillTree();
      }
    }
    if (this.activeModal === 'meridians') {
      const meridianHash = `${player.meridianPoints}_${player.realm}_${JSON.stringify(player.meridians)}`;
      if (this.lastMeridianHash !== meridianHash) {
        this.lastMeridianHash = meridianHash;
        this.renderMeridians();
      }
    }
    if (this.activeModal === 'lucky_wheel') {
      this.updateWheelUI();
    }
  }

  toggleModal(modalName) {
    if (this.activeModal === modalName) {
      this.closeAllModals();
      return;
    }
    this.closeAllModals();
    this.activeModal = modalName;
    this.audioEngine.playSwordDraw();

    switch (modalName) {
      case 'character':
        this.characterModal.classList.add('active');
        this.renderCharacterSheet();
        break;
      case 'inventory':
        this.inventoryModal.classList.add('active');
        this.renderInventory();
        break;
      case 'skill_tree':
        this.skillTreeModal.classList.add('active');
        this.renderSkillTree();
        break;
      case 'meridians':
        this.meridiansModal.classList.add('active');
        this.renderMeridians();
        break;
      case 'world_map':
        this.worldMapModal.classList.add('active');
        this.renderWorldMapSelector();
        break;
      case 'ranking':
        this.rankingModal.classList.add('active');
        this.renderRanking();
        break;
      case 'forge':
        if (this.forgeModal) {
          this.openForgeModal();
        }
        break;
      case 'lucky_wheel':
        if (this.luckyWheelModal) {
          this.luckyWheelModal.classList.add('active');
          this.updateWheelUI();
        }
        break;
      case 'titles':
        if (this.titlesModal) {
          this.titlesModal.classList.add('active');
          this.renderTitlesModal();
        }
        break;
      case 'loot_filter':
        if (this.lootFilterModal) {
          this.lootFilterModal.classList.add('active');
          this.renderLootFilterModal();
        }
        break;
      case 'cultivation':
        if (this.cultivationModal) {
          this.cultivationModal.classList.add('active');
          this.renderCultivationModal();
        }
        break;
      case 'boss_hunt':
        if (this.bossHuntModal) {
          this.bossHuntModal.classList.add('active');
          this.openBossHuntModal();
        }
        break;
    }
  }

  closeAllModals() {
    this.activeModal = null;
    if (this.characterModal) this.characterModal.classList.remove('active');
    if (this.inventoryModal) this.inventoryModal.classList.remove('active');
    if (this.skillTreeModal) this.skillTreeModal.classList.remove('active');
    if (this.meridiansModal) this.meridiansModal.classList.remove('active');
    if (this.worldMapModal) this.worldMapModal.classList.remove('active');
    if (this.rankingModal) this.rankingModal.classList.remove('active');
    if (this.npcModal) this.npcModal.classList.remove('active');
    if (this.forgeModal) this.forgeModal.classList.remove('active');
    if (this.enhanceModal) this.enhanceModal.classList.remove('active');
    if (this.luckyWheelModal) this.luckyWheelModal.classList.remove('active');
    if (this.titlesModal) this.titlesModal.classList.remove('active');
    if (this.lootFilterModal) this.lootFilterModal.classList.remove('active');
    if (this.cultivationModal) this.cultivationModal.classList.remove('active');
    if (this.bossHuntModal) this.bossHuntModal.classList.remove('active');
    if (this.bossHuntTimer) {
      clearInterval(this.bossHuntTimer);
      this.bossHuntTimer = null;
    }
    this.hideTooltip();
  }

  updateWheelUI() {
    if (!this.playerState) return;
    const spins = typeof this.playerState.luckySpins === 'number' ? this.playerState.luckySpins : 10;
    const spinsLeftEl = document.getElementById('wheel-spins-left');
    if (spinsLeftEl) spinsLeftEl.textContent = spins;
    const spinBtnSub = document.getElementById('spin-btn-count');
    if (spinBtnSub) spinBtnSub.textContent = spins > 0 ? `FREE ${spins}` : '500 BẠC';
    const btnSpin = document.getElementById('btn-spin-wheel');
    if (btnSpin) btnSpin.disabled = this.isSpinning;
  }

  handleSpinWheel() {
    if (this.isSpinning) return;
    const spins = typeof this.playerState?.luckySpins === 'number' ? this.playerState.luckySpins : 10;
    if (spins <= 0 && (!this.playerState || this.playerState.gold < 500)) {
      alert('Đã hết lượt quay miễn phí! Bạn cần ít nhất 500 Ngân Lượng để quay tiếp.');
      return;
    }

    this.isSpinning = true;
    const btnSpin = document.getElementById('btn-spin-wheel');
    if (btnSpin) btnSpin.disabled = true;

    // Ẩn thông báo thắng cũ
    const winnerBox = document.getElementById('wheel-winner-box');
    if (winnerBox) winnerBox.style.display = 'none';

    // Kim rung lắc liên hồi
    const pointer = document.getElementById('wheel-pointer');
    if (pointer) pointer.classList.add('pointer-flutter');

    this.socket.emit('spin_wheel');
    this.audioEngine.playSwordAura();
  }

  handleSpinResult(res) {
    if (!res || !res.success) {
      this.isSpinning = false;
      const btnSpin = document.getElementById('btn-spin-wheel');
      if (btnSpin) btnSpin.disabled = false;
      const pointer = document.getElementById('wheel-pointer');
      if (pointer) pointer.classList.remove('pointer-flutter');
      return;
    }

    if (this.playerState) {
      if (typeof res.luckySpins === 'number') this.playerState.luckySpins = res.luckySpins;
      if (typeof res.gold === 'number') this.playerState.gold = res.gold;
    }
    this.updateWheelUI();

    const disc = document.getElementById('wheel-disc');
    const slot = res.slot || 0;
    
    // Mỗi nan ô chiếm 36 độ (10 ô = 360 độ)
    const baseExtraRounds = 360 * 6; // Xoay 6 vòng đầy đủ
    const targetSectorOffset = 360 - (slot * 36) - 18; // Dừng chính xác giữa nan ô
    const totalRotation = this.currentWheelRotation + baseExtraRounds + targetSectorOffset;
    this.currentWheelRotation = totalRotation;

    if (disc) {
      disc.style.transform = `rotate(${totalRotation}deg)`;
    }

    // Thời gian transition là 5.5 giây
    setTimeout(() => {
      this.isSpinning = false;
      const btnSpin = document.getElementById('btn-spin-wheel');
      if (btnSpin) btnSpin.disabled = false;

      const pointer = document.getElementById('wheel-pointer');
      if (pointer) pointer.classList.remove('pointer-flutter');

      // Âm thanh chiến thắng
      this.audioEngine.playLevelUp();

      // Hiển thị khung chúc mừng trúng thưởng
      const winnerBox = document.getElementById('wheel-winner-box');
      const winnerName = document.getElementById('winner-item-name');
      const winnerDesc = document.getElementById('winner-item-desc');
      if (winnerBox && winnerName && winnerDesc) {
        winnerName.textContent = res.reward.name;
        winnerName.className = `winner-item-name ${res.reward.rarity === 'platinum' ? 'text-platinum' : ''}`;
        winnerDesc.textContent = res.reward.desc;
        winnerBox.style.display = 'block';
      }

      this.updateWheelUI();
    }, 5500);
  }

  // 1. RENDER BẢNG THUỘC TÍNH TỰ THÂN (CHARACTER SHEET - PHÍM C)
  renderCharacterSheet() {
    if (!this.playerState) return;
    const p = this.playerState;

    document.getElementById('char-stat-points-val').textContent = p.statPoints;
    document.getElementById('char-str-val').textContent = p.stats.str;
    document.getElementById('char-vit-val').textContent = p.stats.vit;
    document.getElementById('char-agi-val').textContent = p.stats.agi;
    document.getElementById('char-eng-val').textContent = p.stats.eng;

    // Chi tiết chiến đấu
    document.getElementById('char-detail-atk').textContent = (p.attack || 0).toLocaleString();
    document.getElementById('char-detail-def').textContent = (p.defense || 0).toLocaleString();
    document.getElementById('char-detail-hp').textContent = `${p.hp} / ${p.maxHp}`;
    document.getElementById('char-detail-mp').textContent = `${p.mp} / ${p.maxMp}`;
    document.getElementById('char-detail-crit').textContent = `${p.critRate}%`;
    document.getElementById('char-detail-dodge').textContent = `${p.dodgeRate}%`;
    document.getElementById('char-detail-speed').textContent = `${p.speed} px/s`;
    document.getElementById('char-detail-power').textContent = (p.combatPower || 0).toLocaleString();

    // Nút cộng điểm tiềm năng
    const statKeys = ['str', 'vit', 'agi', 'eng'];
    statKeys.forEach(k => {
      const btnAdd = document.getElementById(`btn-add-${k}`);
      if (btnAdd) {
        btnAdd.disabled = p.statPoints <= 0;
        btnAdd.onclick = () => {
          this.socket.emit('allocate_stat', { statKey: k, amount: 1 });
          this.audioEngine.playLevelUp();
        };
      }
    });

    const btnResetStats = document.getElementById('btn-reset-stats');
    if (btnResetStats) {
      btnResetStats.onclick = () => {
        if (confirm('Bạn có chắc muốn tẩy tủy toàn bộ điểm tiềm năng để phân phối lại?')) {
          this.socket.emit('reset_stats');
          this.audioEngine.playLevelUp();
        }
      };
    }
  }

  // 2. RENDER TÚI ĐỒ 200 Ô HÀNH TRANG & 8 Ô TRANG BỊ (INVENTORY - PHÍM B)
  renderInventory() {
    if (!this.playerState) return;
    const p = this.playerState;

    // 9 Ô Trang bị đang mặc trên người
    const equipSlots = ['weapon', 'helmet', 'necklace', 'armor', 'gloves', 'ring', 'pants', 'boots', 'talisman'];
    equipSlots.forEach(type => {
      const slotEl = document.getElementById(`equip-${type}`);
      if (!slotEl) return;
      const item = p.equipment[type];
      slotEl.innerHTML = '';
      slotEl.className = 'inv-cell-200 slot-equip';

      if (item) {
        const iconKey = item.icon ? item.icon.replace('.png','') : 'item_1';
        const img = document.createElement('img');
        img.src = `assets/icons/${iconKey}.png`;
        img.className = `item-icon-img rarity-border-${item.rarity || 'common'} ${item.rarity === 'platinum' ? 'rarity-platinum' : ''}`;
        slotEl.appendChild(img);

        // Vòng hào quang xoay chớp tắt rực rỡ cho Trang Bị Tu Tiên
        if (item.isCultivGear) {
          const orbitRing = document.createElement('div');
          orbitRing.className = 'orbit-aura-ring';
          orbitRing.style.color = item.orbitColor || '#ffd700';
          slotEl.appendChild(orbitRing);
        }

        // Hiển thị cấp cường hóa +X
        if (item.upgradeLevel && item.upgradeLevel > 0) {
          const badge = document.createElement('span');
          badge.className = 'item-count-badge';
          badge.style.background = '#eab308';
          badge.style.color = '#000';
          badge.style.fontWeight = 'bold';
          badge.textContent = `+${item.upgradeLevel}`;
          slotEl.appendChild(badge);
        }

        // Hover Tooltip
        slotEl.onmouseenter = (e) => {
          if (e) {
            this.lastMouseX = e.clientX;
            this.lastMouseY = e.clientY;
          }
          this.showTooltip(item);
        };
        slotEl.onmouseleave = () => this.hideTooltip();

        slotEl.onclick = () => {
          this.socket.emit('unequip_item', { slotType: type });
          this.audioEngine.playSwordDraw();
          this.hideTooltip();
        };
      } else {
        slotEl.onmouseenter = null;
        slotEl.onmouseleave = null;
        slotEl.onclick = null;
      }
    });

    // Lọc theo tabs: All, Equipment, Consumable, Scripture
    const gridEl = document.getElementById('inv-grid-container-200');
    gridEl.innerHTML = '';

    const totalSlots = p.maxInventorySlots || 200;
    document.getElementById('inv-capacity-text').textContent = `${p.inventory.length}/${totalSlots}`;

    for (let i = 0; i < totalSlots; i++) {
      const cell = document.createElement('div');
      cell.className = 'inv-cell-200';
      const item = p.inventory[i];

      if (item) {
        const isEquip = item.type === 'equipment' || !!item.baseStats;
        let visible = true;
        if (this.invFilter === 'equipment' && !isEquip) visible = false;
        if (this.invFilter === 'consumable' && (isEquip || item.type === 'scripture')) visible = false;
        if (this.invFilter === 'scripture' && item.type !== 'scripture' && item.itemId !== 'item_7') visible = false;

        if (visible) {
          let iconKey = 'item_5';
          let rarity = item.rarity || 'common';
          let isPlat = false;
          let count = item.count || 1;

          if (isEquip) {
            iconKey = item.icon ? item.icon.replace('.png','') : 'item_1';
            rarity = item.rarity || 'common';
            isPlat = rarity === 'platinum' || item.isShimmering;
          } else {
            // Xác định icon độc bản chuẩn xác 100% cho bùa, ngọc, đá cường hóa
            if (item.icon) {
              iconKey = item.icon.replace('.png','');
            } else if (item.itemId) {
              const specialMap = {
                item_appraisal: 'item_appraisal',
                item_enhance_stone: 'item_enhance_stone',
                item_protection_charm: 'item_protection_charm',
                item_socket_drill: 'item_socket_drill',
                item_reforge: 'item_reforge',
                item_amber_core: 'item_amber_core',
                item_5: 'item_5',
                item_6: 'item_6',
                item_7: 'item_7',
                item_tuvi_pill: 'item_tuvi_pill',
                item_lifespan_pill: 'item_lifespan_pill',
                item_breakthrough_pill: 'item_breakthrough_pill',
                wpn_sword: 'wpn_sword',
                arm_robe: 'arm_robe',
                item_cultiv: 'item_cultiv',
                gem_ruby: 'gem_ruby',
                gem_sapphire: 'gem_sapphire',
                gem_topaz: 'gem_topaz',
                gem_emerald: 'gem_emerald',
                gem_amethyst: 'gem_amethyst',
                gem_amber: 'gem_amber'
              };
              if (specialMap[item.itemId]) {
                iconKey = specialMap[item.itemId];
              } else if (item.itemId.startsWith('gem_')) {
                const parts = item.itemId.split('_');
                iconKey = `gem_${parts[1] || 'ruby'}`;
              } else if (item.gemKey) {
                iconKey = `gem_${item.gemKey}`;
              } else {
                const def = this.itemsData ? this.itemsData[item.itemId] : null;
                if (def && def.icon) {
                  iconKey = def.icon.replace('.png','');
                } else {
                  iconKey = item.itemId;
                }
              }
            }
          }

          const img = document.createElement('img');
          img.src = `assets/icons/${iconKey}.png`;
          img.className = `item-icon-img rarity-border-${rarity} ${isPlat ? 'rarity-platinum' : ''}`;
          cell.appendChild(img);

          // Vòng hào quang xoay chớp tắt rực rỡ cho Trang Bị Tu Tiên
          if (item.isCultivGear) {
            const orbitRing = document.createElement('div');
            orbitRing.className = 'orbit-aura-ring';
            orbitRing.style.color = item.orbitColor || '#ffd700';
            cell.appendChild(orbitRing);
          }

          // Badge số lượng hoặc cấp cường hóa
          if (isEquip && item.upgradeLevel && item.upgradeLevel > 0) {
            const badge = document.createElement('span');
            badge.className = 'item-count-badge';
            badge.style.background = '#eab308';
            badge.style.color = '#000';
            badge.style.fontWeight = 'bold';
            badge.textContent = `+${item.upgradeLevel}`;
            cell.appendChild(badge);
          } else if (count > 1) {
            const badge = document.createElement('span');
            badge.className = 'item-count-badge';
            badge.textContent = count;
            cell.appendChild(badge);
          }

          // HOVER TOOLTIP CHUYÊN NGHIỆP TRỎ CHUỘT LÀ HIỆN
          const defObj = isEquip ? item : (this.itemsData[item.itemId] || item);
          cell.onmouseenter = () => this.showTooltip(defObj, item);
          cell.onmouseleave = () => this.hideTooltip();

          // Chuột Trái: Xem chi tiết
          cell.onclick = () => {
            this.showItemDetails(defObj, item, i);
          };

          // Chuột Phải: Giám định nhanh hoặc Dùng nhanh hoặc Trang bị nhanh
          cell.oncontextmenu = (e) => {
            e.preventDefault();
            if (isEquip) {
              if (item.unidentified) {
                this.socket.emit('appraise_item', { invIndex: i });
                this.audioEngine.playMetalClash();
              } else {
                this.socket.emit('equip_item', { invIndex: i });
                this.audioEngine.playSwordDraw();
              }
            } else {
              this.socket.emit('use_item', { invIndex: i });
              this.audioEngine.playLoot();
            }
            this.hideTooltip();
          };
        }
      }

      gridEl.appendChild(cell);
    }
  }

  showItemDetails(def, itemData, invIndex) {
    const detailBox = document.getElementById('inv-item-detail');
    const isEquip = def.type === 'equipment' || !!def.baseStats;
    const isPlat = def.rarity === 'platinum' || def.isShimmering;
    const iconSrc = def.icon ? `assets/icons/${def.icon.replace('.png','')}.png` : 'assets/icons/item_1.png';
    // Tính giá bán dự kiến ra Ngân Lượng
    let sellPrice = 60;
    if (isEquip) {
      const rarityPrices = {
        common: 120, uncommon: 280, rare: 650, epic: 1500,
        legendary: 3500, mythic: 8000, celestial: 18000, abyssal: 35000, platinum: 100000
      };
      sellPrice = (rarityPrices[def.rarity] || 120) + ((def.upgradeLevel || 0) * 150);
    } else if (itemData) {
      if (itemData.itemId === 'item_5' || itemData.itemId === 'item_6') sellPrice = 10 * (itemData.count || 1);
      else if (itemData.itemId === 'item_7') sellPrice = 300 * (itemData.count || 1);
      else sellPrice = 50 * (itemData.count || 1);
    }

    detailBox.innerHTML = `
      <div class="item-detail-header rarity-${def.rarity || 'common'} ${isPlat ? 'rarity-platinum' : ''}">
        <img src="${iconSrc}" class="detail-icon" />
        <div>
          <h4 class="${isPlat ? 'text-platinum' : ''}">${def.name} ${def.upgradeLevel ? `+${def.upgradeLevel}` : ''}</h4>
          <span class="rarity-badge" style="color:${def.rarityColor || '#facc15'};">${(def.rarityName || def.rarity || 'VẬT PHẨM').toUpperCase()}</span>
        </div>
      </div>
      <p class="item-desc">${def.desc || 'Vật phẩm thần bí chốn giang hồ.'}</p>
      <div class="item-action-btns">
        ${isEquip
          ? (def.unidentified
              ? `<button class="btn-action-wuxia" id="btn-appraise-item" style="background:linear-gradient(135deg, #dc2626, #991b1b); color:#fff; border-color:#f87171;">📜 Dùng Giám Định Phù</button>`
              : `<button class="btn-action-wuxia btn-equip" id="btn-equip-item">⚔ Trang Bị Vào Người</button>`)
          : `<button class="btn-action-wuxia btn-use" id="btn-use-item">🌿 Sử Dụng (${itemData ? itemData.count : 1})</button>`
        }
        <button class="btn-action-wuxia btn-sell" id="btn-sell-item">💰 Bán Lấy +${sellPrice.toLocaleString()} Ngân Lượng</button>
      </div>
    `;

    const btnAppraise = document.getElementById('btn-appraise-item');
    if (btnAppraise) {
      btnAppraise.onclick = () => {
        this.socket.emit('appraise_item', { invIndex });
        this.audioEngine.playMetalClash();
        this.hideTooltip();
      };
    }

    const btnUse = document.getElementById('btn-use-item');
    if (btnUse) {
      btnUse.onclick = () => {
        this.socket.emit('use_item', { invIndex });
        this.audioEngine.playLoot();
        this.hideTooltip();
      };
    }

    const btnEquip = document.getElementById('btn-equip-item');
    if (btnEquip) {
      btnEquip.onclick = () => {
        this.socket.emit('equip_item', { invIndex });
        this.audioEngine.playSwordDraw();
        this.hideTooltip();
      };
    }

    const btnSell = document.getElementById('btn-sell-item');
    if (btnSell) {
      btnSell.onclick = () => {
        this.socket.emit('sell_item', { invIndex });
        this.audioEngine.playLoot();
        this.hideTooltip();
      };
    }
  }

  // 7. MỞ MODAL HỘI THOẠI NPC TRONG THÀNH LẠC DƯƠNG
  openNPCDialogue(npc) {
    if (!npc) return;
    this.closeAllModals();
    this.activeModal = 'npc_dialogue';
    this.npcModal.classList.add('active');
    this.audioEngine.playSwordDraw();

    document.getElementById('npc-modal-title').textContent = `❖ ${npc.name.toUpperCase()} ❖`;
    document.getElementById('npc-name-text').textContent = npc.name;
    document.getElementById('npc-title-text').textContent = npc.title || 'Đại Sư';
    document.getElementById('npc-dialogue-text').textContent = `"${npc.dialogue}"`;

    const avatarEl = document.getElementById('npc-avatar-img');
    avatarEl.src = (npc.role === 'doctor' || npc.role === 'scripture') 
      ? 'assets/images/avatar_xiaoyao.png' 
      : 'assets/images/avatar_huashan.png';

    const actionsContainer = document.getElementById('npc-actions-list');
    actionsContainer.innerHTML = '';

    if (npc.actions && npc.actions.length > 0) {
      npc.actions.forEach(act => {
        const btn = document.createElement('button');
        btn.className = 'btn-npc-action';
        btn.innerHTML = `
          <span>${act.name}</span>
          <span class="action-cost">${act.cost > 0 ? `💰 ${act.cost} Vàng` : 'Miễn Phí'}</span>
        `;

        btn.onclick = () => {
          if (act.id === 'enhance' || act.id === 'forge') {
            this.openForgeModal();
            return;
          }
          this.socket.emit('interact_npc', { npcId: npc.id, actionId: act.id });
          this.audioEngine.playLoot();
          this.closeAllModals();
        };

        actionsContainer.appendChild(btn);
      });
    }
  }

  // 8. MỞ MODAL LÒ RÈN THIẾT NGƯU (CƯỜNG HÓA, ĐỤC LỖ & KHẢM NGỌC, GHÉP NGỌC)
  openForgeModal() {
    this.closeAllModals();
    this.activeModal = 'forge';
    this.forgeModal.classList.add('active');
    this.audioEngine.playSwordDraw();

    // Khởi tạo chuyển tabs
    const tabBtns = this.forgeModal.querySelectorAll('.forge-tab-btn');
    tabBtns.forEach(btn => {
      btn.onclick = () => {
        this.switchForgeTab(btn.dataset.tab);
      };
    });

    this.switchForgeTab('enhance');
  }

  switchForgeTab(tab) {
    if (!this.forgeModal) return;
    const tabBtns = this.forgeModal.querySelectorAll('.forge-tab-btn');
    tabBtns.forEach(b => {
      if (b.dataset.tab === tab) b.classList.add('active');
      else b.classList.remove('active');
    });
    const enhanceEl = document.getElementById('tab-forge-enhance');
    const socketEl = document.getElementById('tab-forge-socket');
    const combineEl = document.getElementById('tab-forge-combine');
    if (enhanceEl) enhanceEl.style.display = tab === 'enhance' ? 'block' : 'none';
    if (socketEl) socketEl.style.display = tab === 'socket' ? 'block' : 'none';
    if (combineEl) combineEl.style.display = tab === 'combine' ? 'block' : 'none';

    if (tab === 'enhance') this.renderForgeEnhanceTab();
    else if (tab === 'socket') this.renderForgeSocketTab();
    else if (tab === 'combine') this.renderForgeCombineTab();
  }

  // TAB 1: CƯỜNG HÓA
  renderForgeEnhanceTab() {
    const p = this.playerState;
    if (!p) return;

    const listEl = document.getElementById('forge-enhance-equip-list');
    listEl.innerHTML = '';

    // Thu thập toàn bộ trang bị (đang mặc + trong túi)
    const equips = [];
    if (p.equipment) {
      Object.entries(p.equipment).forEach(([slot, item]) => {
        if (item) equips.push({ ...item, source: 'equipped', slotKey: slot });
      });
    }
    p.inventory.forEach((item, idx) => {
      if (item && (item.type === 'equipment' || item.baseStats || item.isCultivGear)) {
        equips.push({ ...item, source: 'inventory', invIndex: idx });
      }
    });

    if (equips.length === 0) {
      listEl.innerHTML = '<div style="color:#94a3b8; font-size:11px; grid-column:span 4;">Không có trang bị nào</div>';
      return;
    }

    if (this.selectedForgeEquip && equips.length > 0) {
      const updated = equips.find(eq => 
        (this.selectedForgeEquip.source === 'equipped' && eq.source === 'equipped' && this.selectedForgeEquip.slotKey === eq.slotKey) ||
        (this.selectedForgeEquip.source === 'inventory' && eq.source === 'inventory' && this.selectedForgeEquip.invIndex === eq.invIndex)
      );
      this.selectedForgeEquip = updated || equips[0];
    } else if (equips.length > 0) {
      this.selectedForgeEquip = equips[0];
    }

    equips.forEach(eq => {
      const slotDiv = document.createElement('div');
      const isSel = this.selectedForgeEquip && (
        (this.selectedForgeEquip.source === 'equipped' && eq.source === 'equipped' && this.selectedForgeEquip.slotKey === eq.slotKey) ||
        (this.selectedForgeEquip.source === 'inventory' && eq.source === 'inventory' && this.selectedForgeEquip.invIndex === eq.invIndex)
      );

      slotDiv.className = `forge-equip-slot ${isSel ? 'selected' : ''} rarity-border-${eq.rarity || 'common'}`;
      const iconKey = eq.icon ? eq.icon.replace('.png','') : 'item_1';
      const upLvl = eq.upgradeLevel !== undefined ? eq.upgradeLevel : (eq.enhanceLevel || 0);
      slotDiv.innerHTML = `
        <img src="assets/icons/${iconKey}.png" />
        ${upLvl > 0 ? `<span class="enhance-badge">+${upLvl}</span>` : ''}
      `;

      slotDiv.onclick = () => {
        this.selectedForgeEquip = eq;
        this.renderForgeEnhanceTab();
      };

      listEl.appendChild(slotDiv);
    });

    // Cột Phải: Chi tiết cường hóa
    const targetCard = document.getElementById('forge-target-card');
    const ratesBox = document.getElementById('forge-rates-box');
    const btnDo = document.getElementById('btn-do-enhance');

    if (!this.selectedForgeEquip) {
      targetCard.innerHTML = '<div class="forge-placeholder-text">Vui lòng chọn một trang bị để cường hóa</div>';
      ratesBox.style.display = 'none';
      btnDo.disabled = true;
      return;
    }

    const eq = this.selectedForgeEquip;
    const curLvl = eq.upgradeLevel !== undefined ? eq.upgradeLevel : (eq.enhanceLevel || 0);
    const isPlat = eq.rarity === 'platinum' || eq.isShimmering;
    const iconKey = eq.icon ? eq.icon.replace('.png','') : 'item_1';

    targetCard.innerHTML = `
      <div class="card-item-view">
        <img src="assets/icons/${iconKey}.png" class="card-item-img ${isPlat ? 'rarity-platinum' : ''}" />
        <div class="card-item-meta">
          <div style="font-weight:bold; font-size:15px; color:#facc15;">${eq.name} ${curLvl > 0 ? `+${curLvl}` : ''}</div>
          <div style="font-size:12px; color:${eq.rarityColor || '#cbd5e1'};">${eq.rarityName || 'Trang Bị Giang Hồ'}</div>
          <div style="font-size:12px; color:#38bdf8; margin-top:4px;">
            Cấp cường hóa: <strong>+${curLvl}</strong> ➔ <strong style="color:#4ade80;">+${curLvl + 1}</strong>
          </div>
        </div>
      </div>
    `;

    ratesBox.style.display = 'flex';

    if (curLvl >= 15) {
      document.getElementById('enhance-success-rate').textContent = 'ĐÃ ĐẠT TỐI ĐA (+15)';
      document.getElementById('enhance-penalty-warn').style.display = 'none';
      btnDo.disabled = true;
      btnDo.textContent = 'ĐÃ ĐẠT CẤP TỐI ĐA (+15)';
      return;
    }

    // Tỷ lệ thành công
    let rate = 100;
    if (curLvl >= 12) rate = 10;
    else if (curLvl >= 9) rate = 25;
    else if (curLvl >= 6) rate = 45;
    else if (curLvl >= 3) rate = 70;

    document.getElementById('enhance-success-rate').textContent = `${rate}%`;

    // Số đá cường hóa hiện có
    const stoneItem = p.inventory.find(i => i.itemId === 'item_enhance_stone');
    const stoneCount = stoneItem ? stoneItem.count : 0;
    const reqStone = curLvl >= 10 ? 3 : (curLvl >= 6 ? 2 : 1);
    document.getElementById('enhance-stone-req').innerHTML = `Đá Cường Hóa x${reqStone} (Có: <strong style="color:${stoneCount >= reqStone ? '#4ade80' : '#ef4444'}">${stoneCount}</strong>)`;

    // Chi phí Bạc
    const reqSilver = (curLvl + 1) * 500;
    document.getElementById('enhance-silver-req').innerHTML = `<strong style="color:${p.gold >= reqSilver ? '#facc15' : '#ef4444'}">${reqSilver.toLocaleString()}</strong> Bạc (Có: ${p.gold.toLocaleString()})`;

    // Bùa Bảo Hộ
    const charmItem = p.inventory.find(i => i.itemId === 'item_protection_charm');
    const charmCount = charmItem ? charmItem.count : 0;
    document.getElementById('enhance-charm-count').textContent = `(Có: ${charmCount})`;

    const warnEl = document.getElementById('enhance-penalty-warn');
    if (curLvl >= 6) {
      warnEl.style.display = 'block';
      warnEl.textContent = '⚠ Từ +7 trở lên, nếu thất bại mà không có Bùa Bảo Hộ sẽ rớt 1 cấp!';
    } else {
      warnEl.style.display = 'none';
    }

    const canDo = stoneCount >= reqStone && p.gold >= reqSilver;
    btnDo.disabled = !canDo;
    btnDo.textContent = `⚒ TIẾN HÀNH CƯỜNG HÓA (+${curLvl + 1})`;

    btnDo.onclick = () => {
      const chkCharm = document.getElementById('chk-use-protect-charm');
      this.socket.emit('enhance_item', {
        target: eq.source,
        slot: eq.slotKey,
        invIndex: eq.invIndex,
        useProtectionCharm: chkCharm ? chkCharm.checked : false
      });
      this.audioEngine.playMetalClash();
    };
  }

  // TAB 2: ĐỤC LỖ & KHẢM NGỌC
  renderForgeSocketTab() {
    const p = this.playerState;
    if (!p) return;

    const listEl = document.getElementById('forge-socket-equip-list');
    listEl.innerHTML = '';

    const equips = [];
    if (p.equipment) {
      Object.entries(p.equipment).forEach(([slot, item]) => {
        if (item) equips.push({ ...item, source: 'equipped', slotKey: slot });
      });
    }
    p.inventory.forEach((item, idx) => {
      if (item && (item.type === 'equipment' || item.baseStats)) {
        equips.push({ ...item, source: 'inventory', invIndex: idx });
      }
    });

    if (equips.length === 0) {
      listEl.innerHTML = '<div style="color:#94a3b8; font-size:11px; grid-column:span 4;">Không có trang bị nào</div>';
      return;
    }

    if (!this.selectedSocketEquip && equips.length > 0) {
      this.selectedSocketEquip = equips[0];
    }

    equips.forEach(eq => {
      const slotDiv = document.createElement('div');
      const isSel = this.selectedSocketEquip && (
        (this.selectedSocketEquip.source === 'equipped' && eq.source === 'equipped' && this.selectedSocketEquip.slotKey === eq.slotKey) ||
        (this.selectedSocketEquip.source === 'inventory' && eq.source === 'inventory' && this.selectedSocketEquip.invIndex === eq.invIndex)
      );

      slotDiv.className = `forge-equip-slot ${isSel ? 'selected' : ''} rarity-border-${eq.rarity || 'common'}`;
      const iconKey = eq.icon ? eq.icon.replace('.png','') : 'item_1';
      slotDiv.innerHTML = `
        <img src="assets/icons/${iconKey}.png" />
        ${eq.upgradeLevel > 0 ? `<span class="enhance-badge">+${eq.upgradeLevel}</span>` : ''}
      `;

      slotDiv.onclick = () => {
        this.selectedSocketEquip = eq;
        this.selectedSocketIdx = null;
        this.renderForgeSocketTab();
      };

      listEl.appendChild(slotDiv);
    });

    // Cột Phải: Quản lý 3 lỗ
    const targetCard = document.getElementById('socket-target-card');
    const slotsList = document.getElementById('socket-slots-list');
    const gemPicker = document.getElementById('gem-picker-section');

    if (!this.selectedSocketEquip) {
      targetCard.innerHTML = '<div class="forge-placeholder-text">Chọn một trang bị để quản lý lỗ khảm</div>';
      slotsList.style.display = 'none';
      gemPicker.style.display = 'none';
      return;
    }

    const eq = this.selectedSocketEquip;
    const iconKey = eq.icon ? eq.icon.replace('.png','') : 'item_1';
    const maxSockets = eq.maxSockets || 3;
    const curSockets = eq.sockets || [];
    targetCard.innerHTML = `
      <div class="card-item-view">
        <img src="assets/icons/${iconKey}.png" class="card-item-img" />
        <div class="card-item-meta">
          <div style="font-weight:bold; font-size:15px; color:#38bdf8;">${eq.name} ${eq.upgradeLevel > 0 ? `+${eq.upgradeLevel}` : ''}</div>
          <div style="font-size:12px; color:#cbd5e1;">Lỗ Khảm Hiện Tại: ${curSockets.length}/${maxSockets}</div>
        </div>
      </div>
    `;

    slotsList.style.display = 'flex';
    slotsList.innerHTML = '';

    const drillItem = p.inventory.find(i => i.itemId === 'item_socket_drill');
    const drillCount = drillItem ? drillItem.count : 0;

    // Tự động chọn lỗ rỗng đầu tiên nếu chưa chọn lỗ nào
    if (this.selectedSocketIdx === null || this.selectedSocketIdx >= maxSockets) {
      const firstEmpty = curSockets.findIndex(s => {
        const g = (s && s.gem !== undefined) ? s.gem : (s && s.name ? s : null);
        return !g || !g.name;
      });
      if (firstEmpty !== -1) {
        this.selectedSocketIdx = firstEmpty;
      }
    }

    for (let sIdx = 0; sIdx < maxSockets; sIdx++) {
      const row = document.createElement('div');
      row.className = 'socket-slot-row';

      if (sIdx < curSockets.length) {
        const sock = curSockets[sIdx];
        const gem = (sock && sock.gem !== undefined) ? sock.gem : (sock && sock.name ? sock : null);
        if (gem && gem.name) {
          // Lỗ ĐÃ KHẢM NGỌC
          const gIcon = gem.icon ? gem.icon.replace('.png','') : 'gem_ruby';
          const statText = gem.statDesc || (gem.statVal ? `+${gem.statVal} ${gem.statKey || ''}` : '');
          row.innerHTML = `
            <div class="socket-slot-info">
              <div class="socket-icon-frame active">
                <img src="assets/icons/${gIcon}.png" onerror="this.src='assets/icons/gem_ruby.png'" />
              </div>
              <div>
                <div style="color:#38bdf8; font-weight:bold;">${gem.name}</div>
                <div style="font-size:11px; color:#4ade80;">${statText}</div>
              </div>
            </div>
            <button class="btn-socket-action btn-remove-gem" data-idx="${sIdx}">Tháo Ngọc (200 Bạc)</button>
          `;
          row.querySelector('.btn-remove-gem').onclick = () => {
            this.socket.emit('remove_gem', {
              target: eq.source,
              slot: eq.slotKey,
              invIndex: eq.invIndex,
              socketIdx: sIdx
            });
            this.audioEngine.playMetalClash();
          };
        } else {
          // LỖ RỖNG, CÓ THỂ KHẢM NGỌC
          const isPicking = this.selectedSocketIdx === sIdx;
          row.innerHTML = `
            <div class="socket-slot-info" style="cursor:pointer;">
              <div class="socket-icon-frame ${isPicking ? 'active' : ''}">
                <span style="font-size:18px; color:${isPicking ? '#38bdf8' : '#94a3b8'};">💎</span>
              </div>
              <div>
                <div style="color:${isPicking ? '#38bdf8' : '#cbd5e1'}; font-weight:bold;">Lỗ Khảm Số ${sIdx + 1} (Trống)</div>
                <div style="font-size:11px; color:${isPicking ? '#4ade80' : '#94a3b8'};">${isPicking ? '👉 Đang chọn ngọc trong túi bên dưới' : 'Nhấp để chọn ngọc khảm vào'}</div>
              </div>
            </div>
            <button class="btn-socket-action btn-pick-gem" style="${isPicking ? 'background:#0284c7; border-color:#38bdf8;' : ''}" data-idx="${sIdx}">
              ${isPicking ? '✓ Đang Chọn' : '💎 Khảm Ngọc'}
            </button>
          `;
          const triggerPick = () => {
            this.selectedSocketIdx = sIdx;
            this.renderForgeSocketTab();
          };
          row.querySelector('.socket-slot-info').onclick = triggerPick;
          row.querySelector('.btn-pick-gem').onclick = triggerPick;
        }
      } else if (sIdx === curSockets.length) {
        // Lỗ tiếp theo chưa đục
        row.innerHTML = `
          <div class="socket-slot-info">
            <div class="socket-icon-frame">
              <span style="font-size:16px; color:#475569;">🔒</span>
            </div>
            <div>
              <div style="color:#94a3b8; font-weight:bold;">Lỗ Khảm Số ${sIdx + 1} (Chưa Đục)</div>
              <div style="font-size:11px; color:#facc15;">Cần Mũi Khoan Lỗ (Có: ${drillCount}) + 1,000 Bạc</div>
            </div>
          </div>
          <button class="btn-socket-action btn-drill-socket" ${drillCount <= 0 || p.gold < 1000 ? 'disabled' : ''}>
            🔨 Đục Lỗ (+1)
          </button>
        `;
        const btnDrill = row.querySelector('.btn-drill-socket');
        if (btnDrill && drillCount > 0 && p.gold >= 1000) {
          btnDrill.onclick = () => {
            this.socket.emit('socket_item', {
              target: eq.source,
              slot: eq.slotKey,
              invIndex: eq.invIndex
            });
            this.audioEngine.playMetalClash();
          };
        }
      } else {
        // Lỗ khóa phía sau
        row.innerHTML = `
          <div class="socket-slot-info">
            <div class="socket-icon-frame">
              <span style="font-size:16px; color:#334155;">🔒</span>
            </div>
            <div style="color:#475569;">Lỗ Khảm Số ${sIdx + 1} (Khóa)</div>
          </div>
        `;
      }

      slotsList.appendChild(row);
    }

    // Hiển thị danh sách ngọc để chọn khảm
    const targetSlotObj = (this.selectedSocketIdx !== null && this.selectedSocketIdx < curSockets.length) ? curSockets[this.selectedSocketIdx] : null;
    const isTargetSlotEmpty = targetSlotObj ? (!targetSlotObj.gem || !targetSlotObj.gem.name) : (curSockets.length > 0 && this.selectedSocketIdx !== null);

    if (this.selectedSocketIdx !== null && this.selectedSocketIdx < curSockets.length && isTargetSlotEmpty) {
      gemPicker.style.display = 'block';
      const pickerHeader = gemPicker.querySelector('.forge-section-title');
      if (pickerHeader) {
        pickerHeader.textContent = `Chọn Ngọc Trong Túi Để Khảm Vào Lỗ Số ${this.selectedSocketIdx + 1}:`;
      }
      const gemsGrid = document.getElementById('gems-inventory-grid');
      gemsGrid.innerHTML = '';

      const gemItems = [];
      p.inventory.forEach((item, idx) => {
        if (item && (item.type === 'gem' || (item.itemId && item.itemId.startsWith('gem_')))) {
          gemItems.push({ ...item, invIdx: idx });
        }
      });

      if (gemItems.length === 0) {
        gemsGrid.innerHTML = '<div style="color:#94a3b8; font-size:12px; grid-column:span 6; padding:10px;">Trong túi không có ngọc nào để khảm! Hãy đánh Boss hoặc mở bương để thu thập!</div>';
      } else {
        gemItems.forEach(g => {
          const gDiv = document.createElement('div');
          gDiv.className = 'gem-inventory-item';
          const gIcon = g.icon ? g.icon.replace('.png','') : 'gem_ruby';
          const gStat = g.statDesc || (g.statVal ? `+${g.statVal} ${g.statKey || ''}` : '');
          gDiv.title = `${g.name} (${gStat}) - Nhấp để khảm vào Lỗ ${this.selectedSocketIdx + 1}`;
          gDiv.innerHTML = `
            <img src="assets/icons/${gIcon}.png" onerror="this.src='assets/icons/gem_ruby.png'" />
            ${g.count > 1 ? `<span class="gem-qty">${g.count}</span>` : ''}
          `;
          gDiv.onclick = () => {
            this.socket.emit('embed_gem', {
              target: eq.source,
              slot: eq.slotKey,
              invIndex: eq.invIndex,
              socketIdx: this.selectedSocketIdx,
              gemInvIndex: g.invIdx
            });
            this.audioEngine.playMetalClash();
          };
          gemsGrid.appendChild(gDiv);
        });
      }
    } else {
      gemPicker.style.display = 'none';
    }
  }

  // TAB 3: GHÉP NGỌC (3 LÊN 1)
  renderForgeCombineTab() {
    const p = this.playerState;
    if (!p) return;

    const grid = document.getElementById('gems-combinable-grid');
    grid.innerHTML = '';

    // Gom nhóm ngọc theo (gemType + level)
    const gemGroups = {};
    p.inventory.forEach((item, idx) => {
      if (item && item.type === 'gem' && item.gemType && item.level < 5) {
        const key = `${item.gemType}_${item.level}`;
        if (!gemGroups[key]) {
          gemGroups[key] = {
            gemType: item.gemType,
            level: item.level,
            name: item.name,
            icon: item.icon,
            count: 0
          };
        }
        gemGroups[key].count += (item.count || 1);
      }
    });

    const entries = Object.values(gemGroups).filter(g => g.count >= 3);
    if (entries.length === 0) {
      grid.innerHTML = '<div style="color:#94a3b8; font-size:13px; text-align:center; grid-column:span 3; padding:20px;">Không có loại ngọc nào đủ 3 viên cùng cấp để ghép. Hãy săn Boss hoặc mở rương để thu thập thêm ngọc!</div>';
      return;
    }

    entries.forEach(g => {
      const card = document.createElement('div');
      card.className = 'combine-gem-card';
      card.innerHTML = `
        <div class="combine-gem-preview">
          <img src="assets/icons/${g.icon}.png" />
          <span style="font-size:16px; color:#facc15;">➔</span>
          <img src="assets/icons/${g.icon}.png" style="border:1.5px solid #a855f7; border-radius:4px;" />
        </div>
        <div class="combine-gem-title">${g.name} (Cấp ${g.level})</div>
        <div class="combine-gem-count">Đang có: <strong>${g.count}</strong> viên (Cần 3 viên)</div>
        <button class="btn-do-combine">🔮 Hợp Thành Cấp ${g.level + 1}</button>
      `;

      card.querySelector('.btn-do-combine').onclick = () => {
        this.socket.emit('combine_gems', {
          gemType: g.gemType,
          currentLevel: g.level
        });
        this.audioEngine.playLevelUp();
      };

      grid.appendChild(card);
    });
  }

  // 3. RENDER BẢNG KỸ NĂNG VÕ HỌC (SKILL TREE - PHÍM V)
  renderSkillTree() {
    if (!this.playerState) return;
    const p = this.playerState;

    document.getElementById('skill-points-val').textContent = p.skillPoints;

    const listEl = document.getElementById('skill-tree-list');
    listEl.innerHTML = '';

    let sectSkills = ['hs_1', 'hs_2', 'hs_3', 'hs_4', 'hs_passive_1'];
    if (p.sect === 'xiaoyao') sectSkills = ['xy_1', 'xy_2', 'xy_3', 'xy_4', 'xy_passive_1'];
    else if (p.sect === 'shaolin') sectSkills = ['sl_1', 'sl_2', 'sl_3', 'sl_4', 'sl_passive_1'];
    else if (p.sect === 'wudang') sectSkills = ['wd_1', 'wd_2', 'wd_3', 'wd_4', 'wd_passive_1'];

    sectSkills.forEach((sId, idx) => {
      const def = this.skillsData[sId];
      if (!def) return;
      const curLvl = p.skillLevels[sId] || 1;

      const card = document.createElement('div');
      card.className = 'skill-card-row';
      card.innerHTML = `
        <img src="assets/icons/${def.icon}" class="skill-tree-icon" />
        <div class="skill-tree-info">
          <h5>${def.name} <span class="skill-level-text">Tầng ${curLvl}/${def.maxLevel || 10}</span></h5>
          <p>${def.desc}</p>
        </div>
        <button class="btn-upgrade-skill ${p.skillPoints <= 0 || curLvl >= (def.maxLevel || 10) ? 'disabled' : ''}">
          Đột Phá (+1)
        </button>
      `;

      const btn = card.querySelector('.btn-upgrade-skill');
      if (p.skillPoints > 0 && curLvl < (def.maxLevel || 10)) {
        btn.onclick = () => {
          this.socket.emit('upgrade_skill', { skillId: sId });
          this.audioEngine.playLevelUp();
        };
      }

      listEl.appendChild(card);
    });
  }

  // 4. RENDER BẢN ĐỒ THẾ GIỚI & CHUYỂN MAP (WORLD MAP - PHÍM M)
  renderWorldMapSelector() {
    const listEl = document.getElementById('world-map-cards');
    if (!listEl) return;
    listEl.innerHTML = '';

    const p = this.playerState;
    const pLevel = p ? p.level : 1;
    const isMortalTab = this.currentMapTab === 'mortal';

    // Cập nhật trạng thái active của 2 Tab
    const tabMortal = document.getElementById('tab-btn-map-mortal');
    const tabImmortal = document.getElementById('tab-btn-map-immortal');
    if (tabMortal && tabImmortal) {
      if (isMortalTab) {
        tabMortal.classList.add('active');
        tabImmortal.classList.remove('active');
      } else {
        tabImmortal.classList.add('active');
        tabMortal.classList.remove('active');
      }
    }

    const mortalMaps = [
      { id: 'lac_duong', name: 'Lạc Dương Cổ Thành & Hoa Sơn Đỉnh (Lv.1 - 10)', desc: 'Thành thị phồn hoa, bái sư môn phái, tiễu trừ Sơn Tặc Hắc Phong Trại. Có Đại Ma Tu giáng thế!', img: 'world_map.jpg', boss: 'Sơn Tặc Đầu Mục (Lv.8) & Thái Cổ Ma Tu (Lv.45)', drops: 'Bạch Vân Trang, Thọ Nguyên Đan, Bạc' },
      { id: 'dao_hoa_dao', name: 'Đào Hoa Tiên Đảo (Lv.10 - 20)', desc: 'Biển xanh cát trắng, rừng đào rực rỡ, săn bắt Cửu Vĩ Linh Hồ.', img: 'map_peach_island.jpg', boss: 'Đào Hoa Đảo Chủ (Lv.18)', drops: 'Thanh Phong Trang, Linh Thú Đan, Ngọc Khảm' },
      { id: 'ma_son', name: 'Vạn Kiếp Ma Sơn (Lv.20 - 30)', desc: 'Dung nham sôi trào, Ma Tôn cát cứ, rớt trang bị Lv.20. Có Hư Không Thần Thú!', img: 'map_demon_volcano.jpg', boss: 'Cửu U Ma Tôn (Lv.28) & Hư Không Thần Thú (Lv.60)', drops: 'Xích Diễm Trang, Đá Cường Hóa, Tu Vi Đan' },
      { id: 'con_lon', name: 'Côn Lôn Tuyết Sơn (Lv.30 - 40)', desc: 'Tuyết phủ ngàn năm, Băng Tuyết Kỳ Thú, rớt trang bị Lv.30 & Thần Binh. Có Cửu Thiên Kiếm Ma!', img: 'map_con_lon.jpg', boss: 'Tuyết Sơn Thần Viên (Lv.38) & Cửu Thiên Kiếm Ma (Lv.70)', drops: 'Huyền Băng Trang, Thần Binh Bạch Kim' },
      { id: 'hoang_sa', name: 'Hoàng Sa Cổ Thành (Lv.40 - 50)', desc: 'Sa mạc hoang tàn, Cổ Ma Hoàng Sa thức tỉnh, rớt trang bị Lv.40 & Bùa Bảo Hộ.', img: 'map_hoang_sa.jpg', boss: 'Hoàng Sa Cổ Ma (Lv.48)', drops: 'Hoàng Sa Thần Trang, Bùa Giám Định, Ngọc Cấp Cao' },
      { id: 'than_dien', name: 'Thái Cổ Thần Điện (Lv.50+ Chí Tôn)', desc: 'Thiên địa kỳ trận, Thần Điện Thủ Vệ, rớt trang bị Lv.50 & Thần Binh Bạch Kim.', img: 'map_than_dien.jpg', boss: 'Thần Điện Thủ Vệ Thần Tướng (Lv.58)', drops: 'Thái Cổ Thần Trang, Bộ Set Thần Long, Thọ Nguyên Đan' },
      { id: 'dungeon_abyss', name: 'Bí Cảnh: Cửu U Ma Huyệt (Phụ Bản Lv.25+)', desc: 'Vực sâu vạn trượng quỷ khốc thần sầu, yêu ma tử khí hoành hành, phần thưởng siêu cấp!', img: 'map_dungeon_abyss.jpg', boss: 'Cửu U Minh Hoàng (Lv.35)', drops: 'Bộ Set Bắc Minh, Kim Cang, Thần Trang Sử Thi' }
    ];

    const immortalMaps = [
      { id: 'map_bong_lai', name: 'Bồng Lai Tiên Đảo (Tiên Giới Lv.30 - 50)', desc: 'Mây lành vần vũ, tiên hạc lượn quanh. Nơi các đệ tử Tiên Tông tu hành chân pháp, ngưng tụ Kim Đan.', img: 'map_bong_lai.jpg', boss: 'Bồng Lai Thần Thú (Lv.55) & Tà Kiếm Tiên (Lv.65)', drops: 'Thần Trang Thái Thanh, Cửu Chuyển Đột Phá Đan, Tu Vi Đan', reqLvl: 30 },
      { id: 'map_dao_tri', name: 'Dao Trì Tiên Cảnh (Tiên Giới Lv.50 - 70)', desc: 'Thánh địa Tây Vương Mẫu, hoa sen ngàn năm tỏa hương ngút ngàn, linh tuyền tẩy trần nghịch thiên cải mệnh.', img: 'map_dao_tri.jpg', boss: 'Dao Trì Thánh Thú (Lv.75)', drops: 'Thần Trang Bồ Đề, Trường Sinh Thọ Nguyên Đan, Tiên Tinh', reqLvl: 30 },
      { id: 'map_thai_hu', name: 'Thái Hư Huyễn Cảnh (Thượng Giới Lv.70 - 100+)', desc: 'Hỗn Độn sơ khai, lôi đình cuồn cuộn, nơi chư thần cổ đại ngã xuống, chôn giấu pháp bảo vô thượng.', img: 'map_thai_hu.jpg?v=20260927_2', boss: 'Hỗn Độn Thần Ma (Lv.90)', drops: 'Trang Bị Hỗn Độn Chí Tôn, Tự Tại Cực Ý Thư, Vạn Kiếp Thần Đan', reqLvl: 30 }
    ];

    const targetMaps = isMortalTab ? mortalMaps : immortalMaps;

    targetMaps.forEach(m => {
      const card = document.createElement('div');
      const isCur = p && (p.currentMap === m.id || (m.id === 'lac_duong' && p.currentMap === 'hoa_son'));
      const isLocked = !isMortalTab && pLevel < (m.reqLvl || 30);
      card.className = `map-select-card ${isCur ? 'active-map' : ''} ${isLocked ? 'locked-realm-map' : ''}`;

      let btnHtml = '';
      if (isCur) {
        btnHtml = `<span class="current-map-tag">【Đang Ở Đây】</span>`;
      } else if (isLocked) {
        btnHtml = `<button class="btn-teleport-map locked-btn" disabled>🔒 Yêu Cầu Lv.30 (Chưa Đột Phá)</button>`;
      } else {
        btnHtml = `<button class="btn-teleport-map">Ngự Kiếm Phi Hành ✈</button>`;
      }

      card.innerHTML = `
        <div class="map-card-banner-wrapper">
          <img src="assets/images/${m.img}" class="map-select-img" onerror="this.src='assets/images/world_map.jpg'" />
          ${isLocked ? `<div class="map-lock-banner">🔒 PHÙNG HOA PHÀM GIỚI - TIÊN ĐẠO CHƯA THÔNG</div>` : ''}
        </div>
        <div class="map-select-info">
          <h4>${m.name}</h4>
          <p class="map-desc-text">${m.desc}</p>
          <div class="map-rewards-info">
            <span class="map-boss-label">👹 Thủ Lĩnh: <b style="color:#f87171;">${m.boss}</b></span>
            <span class="map-drop-label">💎 Rơi Đồ: <b style="color:#facc15;">${m.drops}</b></span>
          </div>
          <div class="map-card-footer">
            ${btnHtml}
          </div>
        </div>
      `;

      const btn = card.querySelector('.btn-teleport-map:not(.locked-btn)');
      if (btn) {
        btn.onclick = () => {
          if (m.id === 'dungeon_abyss') {
            this.socket.emit('enter_dungeon');
          } else {
            this.socket.emit('change_map', { mapId: m.id });
          }
          this.audioEngine.playDash();
          this.closeAllModals();
        };
      }

      listEl.appendChild(card);
    });
  }

  // ============================================================
  // BẢNG SĂN BOSS THẾ GIỚI (WORLD BOSS HUNTING BOARD - PHÍM X)
  // ============================================================
  openBossHuntModal() {
    this.socket.emit('get_boss_hunt_list');
    if (!this.bossHuntTimer) {
      this.bossHuntTimer = setInterval(() => {
        if (this.activeModal === 'boss_hunt') {
          this.socket.emit('get_boss_hunt_list');
        } else {
          clearInterval(this.bossHuntTimer);
          this.bossHuntTimer = null;
        }
      }, 1000);
    }
    this.renderBossHuntList();
  }

  renderBossHuntList() {
    const container = document.getElementById('boss-hunt-grid');
    if (!container) return;

    const list = this.bossHuntList || [];
    const aliveCount = list.filter(b => b.isAlive).length;
    const countText = document.getElementById('boss-hunt-count-text');
    if (countText) {
      countText.innerHTML = `Hiện có <strong style="color:#4ade80;">${aliveCount}</strong> / <strong>${list.length}</strong> Boss đang xuất hiện trên Cửu Châu & Tiên Giới`;
    }

    // Lọc theo bộ lọc hiện tại
    const filter = this.currentBossFilter || 'all';
    const filteredList = list.filter(b => {
      const isImmortal = b.isCultivationMap || b.isImmortal;
      if (filter === 'alive') return b.isAlive;
      if (filter === 'mortal') return !isImmortal;
      if (filter === 'immortal' || filter === 'cultiv') return isImmortal || b.isCultivBoss;
      return true;
    });

    if (filteredList.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding: 40px; color:#94a3b8;">
          <div style="font-size: 36px; margin-bottom: 8px;">⏳</div>
          <div>Không tìm thấy Boss phù hợp với bộ lọc hiện tại.</div>
        </div>
      `;
      return;
    }

    const modalBody = container.closest('.modal-bosshunt-body');
    const savedScrollTop = modalBody ? modalBody.scrollTop : 0;

    // Kiểm tra xem số lượng thẻ và id có khớp không để cập nhật in-place, tránh giật lag màn hình
    const existingCards = container.querySelectorAll('.boss-hunt-card');
    const canUpdateInPlace = existingCards.length === filteredList.length && 
      Array.from(existingCards).every((card, idx) => card.dataset.bossId === filteredList[idx].id);

    if (canUpdateInPlace) {
      filteredList.forEach((b, idx) => {
        const card = existingCards[idx];
        const isAlive = b.isAlive;
        const hpPct = isAlive ? Math.max(0, Math.min(100, b.hpPercent ?? 100)) : 0;
        
        // Cập nhật class
        card.className = `boss-hunt-card ${isAlive ? 'boss-alive' : 'boss-dead'} ${b.isCultivationMap || b.isImmortal || b.isCultivBoss ? 'boss-cultiv-card' : ''}`;
        
        // Cập nhật badge trạng thái
        let statusBadgeHtml = '';
        if (isAlive) {
          statusBadgeHtml = `<span class="boss-status-badge status-alive">⚔ ĐANG XUẤT HIỆN</span>`;
        } else {
          const sec = b.respawnRemainingSec || b.respawnSecondsLeft || 0;
          const mins = Math.floor(sec / 60);
          const remSec = sec % 60;
          const timeStr = `${mins < 10 ? '0' : ''}${mins}:${remSec < 10 ? '0' : ''}${remSec}`;
          statusBadgeHtml = `<span class="boss-status-badge status-dead">⏳ Hồi Sinh Sau: ${timeStr}</span>`;
        }
        const badgeEl = card.querySelector('.boss-status-badge');
        if (badgeEl) badgeEl.outerHTML = statusBadgeHtml;

        // Cập nhật thanh máu
        const hpFill = card.querySelector('.boss-card-hp-fill');
        if (hpFill) hpFill.style.width = `${hpPct}%`;
        const hpText = card.querySelector('.boss-card-hp-text');
        if (hpText) hpText.textContent = `Sinh Mệnh: ${hpPct.toFixed(1)}% (${(b.hp || 0).toLocaleString()} / ${(b.maxHp || 0).toLocaleString()})`;

        // Cập nhật nút bấm
        const btnTeleport = card.querySelector('.btn-hunt-teleport');
        if (btnTeleport) {
          btnTeleport.className = `btn-hunt-teleport ${!isAlive ? 'disabled' : ''}`;
          btnTeleport.disabled = !isAlive;
          btnTeleport.textContent = isAlive ? '⚔ Phi Thân Truy Sát' : '⏳ Chờ Hồi Sinh';
        }
      });
      return;
    }

    container.innerHTML = '';
    const p = this.playerState;

    filteredList.forEach(b => {
      const card = document.createElement('div');
      card.dataset.bossId = b.id;
      const isAlive = b.isAlive;
      const isCultiv = b.isCultivationMap || b.isImmortal || b.isCultivBoss;
      card.className = `boss-hunt-card ${isAlive ? 'boss-alive' : 'boss-dead'} ${isCultiv ? 'boss-cultiv-card' : ''}`;

      const bRarity = b.bossRarity || b.rarity || 'legendary';
      const rarityColor = {
        common: '#94a3b8',
        uncommon: '#22c55e',
        rare: '#38bdf8',
        epic: '#c084fc',
        legendary: '#f59e0b',
        mythic: '#ef4444',
        celestial: '#e879f9',
        abyssal: '#a855f7',
        platinum: '#fef08a'
      }[bRarity] || '#ef4444';

      let statusBadge = '';
      if (isAlive) {
        statusBadge = `<span class="boss-status-badge status-alive">⚔ ĐANG XUẤT HIỆN</span>`;
      } else {
        const sec = b.respawnRemainingSec || b.respawnSecondsLeft || 0;
        const mins = Math.floor(sec / 60);
        const remSec = sec % 60;
        const timeStr = `${mins < 10 ? '0' : ''}${mins}:${remSec < 10 ? '0' : ''}${remSec}`;
        statusBadge = `<span class="boss-status-badge status-dead">⏳ Hồi Sinh Sau: ${timeStr}</span>`;
      }

      // Thanh máu boss
      const hpPct = isAlive ? Math.max(0, Math.min(100, b.hpPercent ?? 100)) : 0;

      card.innerHTML = `
        <div class="boss-card-header">
          <div class="boss-avatar-box">
            <img src="${b.avatar || 'assets/images/avatar_boss.png'}" class="boss-avatar-img" onerror="this.src='assets/images/avatar_boss.png'" />
            ${isCultiv ? `<span class="boss-cultiv-tag">TU TIÊN</span>` : ''}
          </div>
          <div class="boss-meta-info">
            <h4 style="color:${rarityColor}; margin:0 0 4px 0;">${b.name} <span class="boss-lvl-tag">Lv.${b.level}</span></h4>
            <div class="boss-loc-text">📍 Map: <span style="color:#67e8f9;">${b.mapName || b.mapId}</span></div>
            ${statusBadge}
          </div>
        </div>

        <div class="boss-hp-section">
          <div class="boss-card-hp-bar">
            <div class="boss-card-hp-fill" style="width: ${hpPct}%;"></div>
          </div>
          <div class="boss-card-hp-text">Sinh Mệnh: ${hpPct.toFixed(1)}% (${(b.hp || 0).toLocaleString()} / ${(b.maxHp || 0).toLocaleString()})</div>
        </div>

        <div class="boss-loot-preview">
          <div class="boss-loot-title">🎁 Báu Vật Rơi Ra:</div>
          <div class="boss-loot-tags">
            ${(b.drops || ['Thần Trang Bạch Kim', 'Thọ Nguyên Đan', 'Đá Cường Hóa', 'Ngọc Khảm']).map(d => `<span class="loot-tag-item">${d}</span>`).join('')}
          </div>
        </div>

        <div class="boss-card-actions">
          <button class="btn-hunt-teleport ${!isAlive ? 'disabled' : ''}" ${!isAlive ? 'disabled' : ''}>
            ${isAlive ? '⚔ Phi Thân Truy Sát' : '⏳ Chờ Hồi Sinh'}
          </button>
        </div>
      `;

      const btnTeleport = card.querySelector('.btn-hunt-teleport');
      if (btnTeleport && isAlive) {
        btnTeleport.onclick = () => {
          this.socket.emit('hunt_boss_teleport', { bossId: b.id });
          this.audioEngine.playDash();
        };
      }

      container.appendChild(card);
    });

    if (modalBody && savedScrollTop > 0) {
      modalBody.scrollTop = savedScrollTop;
    }
  }

  // 5. RENDER KINH MẠCH
  renderMeridians() {
    if (!this.playerState) return;
    const p = this.playerState;

    document.getElementById('meridian-points-val').textContent = p.meridianPoints;
    document.getElementById('meridian-realm-val').textContent = p.realm;

    const meridiansList = [
      { key: 'docMach', name: 'Đốc Mạch', effect: '+20 Ngoại Công mỗi tầng', val: p.meridians.docMach },
      { key: 'nhamMach', name: 'Nhâm Mạch', effect: '+150 Khí Huyết, +10 Ngoại Thủ mỗi tầng', val: p.meridians.nhamMach },
      { key: 'xungMach', name: 'Xung Mạch', effect: '+3% Bạo Kích mỗi tầng', val: p.meridians.xungMach },
      { key: 'doiMach', name: 'Đới Mạch', effect: '+18 Thân Pháp, +2% Né Tránh mỗi tầng', val: p.meridians.doiMach }
    ];

    const listEl = document.getElementById('meridians-list');
    listEl.innerHTML = '';

    meridiansList.forEach(m => {
      const row = document.createElement('div');
      row.className = 'meridian-row';
      row.innerHTML = `
        <div class="meridian-info">
          <h5>${m.name} <span class="meridian-level">Tầng ${m.val}/10</span></h5>
          <p>${m.effect}</p>
        </div>
        <button class="btn-upgrade-meridian ${p.meridianPoints <= 0 || m.val >= 10 ? 'disabled' : ''}">
          Đả Thông
        </button>
      `;

      const btn = row.querySelector('.btn-upgrade-meridian');
      if (p.meridianPoints > 0 && m.val < 10) {
        btn.onclick = () => {
          this.socket.emit('upgrade_meridian', { meridianKey: m.key });
          this.audioEngine.playLevelUp();
        };
      }
      listEl.appendChild(row);
    });
  }

  // 6. RENDER BẢNG XẾP HẠNG (ĐỒNG BỘ TOÀN SERVER CSDL ONLINE)
  renderRanking() {
    const tbody = document.getElementById('ranking-table-body');
    if (!tbody) return;

    // Yêu cầu dữ liệu Bảng Xếp Hạng mới nhất từ Server CSDL
    this.socket.emit('get_leaderboard');

    if (!this.hasSetupLeaderboardListener) {
      this.hasSetupLeaderboardListener = true;
      this.socket.on('leaderboard_data', (serverList) => {
        this.renderLeaderboardTable(serverList);
      });
    }
  }

  renderLeaderboardTable(list = []) {
    const tbody = document.getElementById('ranking-table-body');
    if (!tbody) return;

    if (!list || list.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding: 25px; color:#94a3b8;">Đang kết nối thiên địa bảng...</td></tr>`;
      return;
    }

    const myName = this.playerState ? this.playerState.name : '';
    const sectNames = {
      huashan: 'Hoa Sơn',
      xiaoyao: 'Tiêu Dao',
      shaolin: 'Thiếu Lâm',
      wudang: 'Võ Đang',
      dao: 'Thái Thanh Tiên Tông',
      buddha: 'Phạn Thiên Phật Môn',
      demon: 'U Minh Ma Giáo',
      beast: 'Vạn Yêu Thánh Tộc'
    };

    tbody.innerHTML = list.map((item, idx) => {
      const rankNum = idx + 1;
      const isMe = item.name === myName;
      let rankBadge = `${rankNum}`;
      if (rankNum === 1) rankBadge = '🥇 TOP 1';
      else if (rankNum === 2) rankBadge = '🥈 TOP 2';
      else if (rankNum === 3) rankBadge = '🥉 TOP 3';

      let rankTitleHtml = '';
      if (rankNum === 1) {
        rankTitleHtml = `<div style="font-size:11px; color:#ffd700; text-shadow:0 0 8px rgba(255,215,0,0.8); font-weight:bold; margin-top:2px;">👑【THIÊN HẠ ĐỆ NHẤT CAO THỦ】</div>`;
      } else if (rankNum === 2) {
        rankTitleHtml = `<div style="font-size:11px; color:#ff3366; text-shadow:0 0 8px rgba(255,51,102,0.8); font-weight:bold; margin-top:2px;">⚔【CỬU CHÂU CHÍ TÔN VÔ SONG】</div>`;
      } else if (rankNum === 3) {
        rankTitleHtml = `<div style="font-size:11px; color:#00f0ff; text-shadow:0 0 8px rgba(0,240,255,0.8); font-weight:bold; margin-top:2px;">⚡【BẠCH KIM CHIẾN THẦN QUÂN】</div>`;
      } else if (rankNum === 4) {
        rankTitleHtml = `<div style="font-size:10px; color:#f97316; font-weight:bold; margin-top:2px;">🔥【BÁT HOANG TIÊN TÔN】</div>`;
      } else if (rankNum === 5) {
        rankTitleHtml = `<div style="font-size:10px; color:#eab308; font-weight:bold; margin-top:2px;">🌟【THÁI HƯ ĐẠO QUÂN】</div>`;
      } else if (rankNum === 6) {
        rankTitleHtml = `<div style="font-size:10px; color:#c084fc; font-weight:bold; margin-top:2px;">💠【CỬU TRÙNG THIÊN ĐẾ】</div>`;
      } else if (rankNum === 7) {
        rankTitleHtml = `<div style="font-size:10px; color:#38bdf8; font-weight:bold; margin-top:2px;">❄【VẠN CỔ KIẾM HOÀNG】</div>`;
      } else if (rankNum === 8) {
        rankTitleHtml = `<div style="font-size:10px; color:#34d399; font-weight:bold; margin-top:2px;">🌪【HỖN ĐỘN TÔNG SƯ】</div>`;
      } else if (rankNum === 9) {
        rankTitleHtml = `<div style="font-size:10px; color:#f472b6; font-weight:bold; margin-top:2px;">✨【TIÊU DAO THẦN TƯỚNG】</div>`;
      } else if (rankNum === 10) {
        rankTitleHtml = `<div style="font-size:10px; color:#60a5fa; font-weight:bold; margin-top:2px;">🔷【TRẤN THẾ ANH HÙNG】</div>`;
      }

      const sName = sectNames[item.cultivSect] || sectNames[item.sect] || item.sect || 'Giang Hồ';
      const statusDot = item.isOnline ? `<span style="color:#22c55e; margin-right:4px;" title="Đang Trực Tuyến">●</span>` : `<span style="color:#64748b; margin-right:4px;" title="Rời Mạng">○</span>`;

      return `
        <tr class="${isMe ? 'my-rank-row' : ''}" style="${isMe ? 'background: rgba(234, 179, 8, 0.18); border-left: 3px solid #facc15;' : ''}">
          <td class="rank-num rank-${rankNum}">${rankBadge}</td>
          <td class="rank-name">
            <div style="display:flex; flex-direction:column;">
              <div style="display:flex; align-items:center;">${statusDot}<span>${item.name}</span>${isMe ? ' <b style="color:#fde047; margin-left:4px;">(Ta)</b>' : ''}</div>
              ${rankTitleHtml}
            </div>
          </td>
          <td>${sName}</td>
          <td class="rank-power" style="color:#f59e0b; font-weight:bold;">${(item.combatPower || 1000).toLocaleString()}</td>
          <td><span class="realm-pill">${item.realm || 'Luyện Khí Tầng 1'}</span></td>
        </tr>
      `;
    }).join('');
  }

  updateBossBar(monsters) {
    let boss = null;
    const curMap = this.playerState ? this.playerState.currentMap : 'lac_duong';
    for (const m of Object.values(monsters)) {
      if ((m.isBoss || m.isRevenantBoss) && m.state !== 'dead' && m.mapId === curMap) {
        boss = m;
        break;
      }
    }

    window.currentMapBoss = boss;

    if (boss && this.bossBarContainer) {
      this.bossBarContainer.style.display = 'flex';
      const rColor = {
        common: '#94a3b8',
        uncommon: '#22c55e',
        rare: '#38bdf8',
        epic: '#c084fc',
        legendary: '#f59e0b',
        mythic: '#ef4444',
        celestial: '#e879f9',
        abyssal: '#a855f7',
        platinum: '#fef08a'
      }[boss.bossRarity] || '#ef4444';

      this.bossNameText.innerHTML = `<span style="color: ${rColor};">★ ${boss.name} (Lv.${boss.level}) ★</span>`;
      const hpPct = Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100));
      this.bossHpFill.style.width = `${hpPct}%`;
      this.bossHpText.textContent = `${Math.ceil(boss.hp).toLocaleString()} / ${boss.maxHp.toLocaleString()}`;

      // Tính khoảng cách & hướng mũi tên la bàn
      const distBadge = document.getElementById('boss-distance-badge');
      const p = this.playerState;
      if (distBadge && p) {
        const dx = boss.x - p.x;
        const dy = boss.y - p.y;
        const dist = Math.round(Math.hypot(dx, dy));
        const ang = Math.atan2(dy, dx) * 180 / Math.PI;
        let arrow = '➡';
        if (ang >= -22.5 && ang < 22.5) arrow = '➡';
        else if (ang >= 22.5 && ang < 67.5) arrow = '↘';
        else if (ang >= 67.5 && ang < 112.5) arrow = '⬇';
        else if (ang >= 112.5 && ang < 157.5) arrow = '↙';
        else if (ang >= -67.5 && ang < -22.5) arrow = '↗';
        else if (ang >= -112.5 && ang < -67.5) arrow = '⬆';
        else if (ang >= -157.5 && ang < -112.5) arrow = '↖';
        else arrow = '⬅';

        distBadge.textContent = `🎯 Cách ${dist}m (${arrow})`;
      }

      // Nút Phi Thân Diệt Boss
      const btnGoto = document.getElementById('btn-goto-boss');
      if (btnGoto) {
        btnGoto.onclick = () => {
          this.socket.emit('move_to', { x: boss.x, y: boss.y });
          this.showNotice(`Đang ngự khí phi thân thẳng tới tọa độ Boss (${boss.x}, ${boss.y})!`, 'info');
        };
      }
    } else if (this.bossBarContainer) {
      this.bossBarContainer.style.display = 'none';
    }
  }

  sendChat() {
    if (!this.chatInput) return;
    const msg = this.chatInput.value.trim();
    if (!msg) return;
    this.socket.emit('chat', { message: msg, channel: 'world' });
    this.chatInput.value = '';
    this.chatInput.blur();
  }

  showNotice(msg, type = 'info') {
    if (!msg || typeof msg !== 'string' || msg === 'undefined') return;
    this.addChatMessage('Hệ Thống', msg, 'system');
    const banner = document.getElementById('wuxia-top-banner');
    if (banner) {
      banner.textContent = `❖ ${msg} ❖`;
      banner.className = `wuxia-banner banner-${type} show`;
      setTimeout(() => banner.classList.remove('show'), 4500);
    }
  }

  addChatMessage(sender, msg, channel = 'world', extra = null) {
    if (!msg || typeof msg !== 'string' || msg === 'undefined' || msg.trim() === '') return;
    const row = document.createElement('div');
    row.className = `chat-msg msg-${channel}`;
    row.dataset.channel = channel;

    if (channel === 'system') {
      row.innerHTML = `<span class="chat-tag-sys">【Hệ Thống】</span> <span class="chat-text-sys">${msg}</span>`;
    } else {
      const realmText = (extra && extra.senderRealm) ? extra.senderRealm : (this.playerState ? this.playerState.realm : 'Luyện Khí');
      const realmBadge = `<span class="chat-realm-tag">[${realmText}]</span>`;
      row.innerHTML = `<span class="chat-tag-world">【Thế Giới】</span> ${realmBadge}<span class="chat-sender">${sender}:</span> <span class="chat-text">${msg}</span>`;
    }

    if (this.currentChatFilter !== 'all' && channel !== this.currentChatFilter) {
      row.style.display = 'none';
    } else {
      row.style.display = 'block';
    }

    if (this.chatLog) {
      this.chatLog.appendChild(row);
      this.chatLog.scrollTop = this.chatLog.scrollHeight;
    }

    const tickerText = document.getElementById('ticker-preview-text');
    if (tickerText) {
      tickerText.textContent = `${sender}: ${msg}`;
    }
  }

  filterChat(filterChannel) {
    this.currentChatFilter = filterChannel;
    if (!this.chatLog) return;
    const messages = this.chatLog.querySelectorAll('.chat-msg');
    messages.forEach(msgEl => {
      const msgChannel = msgEl.dataset.channel || 'world';
      if (filterChannel === 'all' || msgChannel === filterChannel) {
        msgEl.style.display = 'block';
      } else {
        msgEl.style.display = 'none';
      }
    });
    this.chatLog.scrollTop = this.chatLog.scrollHeight;
  }

  // RENDER HỆ THỐNG DANH HIỆU (TOP 1-10 SERVER & 12 ĐẠI DANH HIỆU CẢNH GIỚI)
  renderTitlesModal() {
    if (!this.titlesModal || !this.playerState) return;
    const p = this.playerState;
    const allTitles = p.allTitles || {};
    const unlockedTitles = p.unlockedTitles || ['title_1'];
    const activeTitle = p.activeTitle || 'title_1';

    const activeDisplay = document.getElementById('active-title-display');
    if (activeDisplay) {
      const activeDef = allTitles[activeTitle];
      if (activeDef) {
        activeDisplay.textContent = activeDef.name;
        activeDisplay.style.color = activeDef.color || '#facc15';
        activeDisplay.style.borderColor = activeDef.color || '#facc15';
        activeDisplay.style.boxShadow = `0 0 15px ${activeDef.color || 'rgba(250, 204, 21, 0.4)'}`;
      }
    }

    const container = document.getElementById('titles-list-container');
    if (!container) return;
    container.innerHTML = '';

    // Phân nhóm: Danh hiệu Bảng Xếp Hạng Top 1-10 & Danh hiệu Cảnh Giới Cấp Độ
    const rankTitles = [];
    const realmTitles = [];

    for (const [tId, tDef] of Object.entries(allTitles)) {
      if (tDef.isRankTitle || tId.startsWith('title_rank_')) {
        rankTitles.push([tId, tDef]);
      } else {
        realmTitles.push([tId, tDef]);
      }
    }

    // Sắp xếp Rank Titles từ 1 đến 10
    rankTitles.sort((a, b) => (a[1].rank || 0) - (b[1].rank || 0));

    const renderCard = (tId, tDef) => {
      const isUnlocked = unlockedTitles.includes(tId);
      const isActive = activeTitle === tId;
      const isRank = tDef.isRankTitle || tId.startsWith('title_rank_');

      const card = document.createElement('div');
      card.className = `title-card ${isUnlocked ? 'unlocked' : ''} ${isActive ? 'active' : ''} ${isRank ? 'title-card-rank rank-' + (tDef.rank || 1) : ''}`;
      if (isRank && isUnlocked) {
        card.style.background = 'linear-gradient(135deg, rgba(254, 240, 138, 0.12) 0%, rgba(15, 23, 42, 0.85) 100%)';
        card.style.borderColor = tDef.color || '#ffd700';
        card.style.boxShadow = `0 0 12px ${tDef.color ? tDef.color + '55' : 'rgba(255, 215, 0, 0.3)'}`;
      }

      // Format stats
      const statsList = [];
      if (tDef.stats) {
        if (tDef.stats.power) statsList.push(`Ngoại Công +${tDef.stats.power.toLocaleString()}`);
        if (tDef.stats.hp) statsList.push(`Khí Huyết +${tDef.stats.hp.toLocaleString()}`);
        if (tDef.stats.def) statsList.push(`Phòng Thủ +${tDef.stats.def.toLocaleString()}`);
        if (tDef.stats.crit) statsList.push(`Bạo Kích +${Math.round(tDef.stats.crit * 100)}%`);
        if (tDef.stats.lifeSteal) statsList.push(`Hút Sinh Lực +${Math.round(tDef.stats.lifeSteal * 100)}%`);
        if (tDef.stats.reflect) statsList.push(`Phản Đòn +${Math.round(tDef.stats.reflect * 100)}%`);
        if (tDef.stats.speed) statsList.push(`Thân Pháp +${tDef.stats.speed}`);
        if (tDef.stats.dodge) statsList.push(`Né Tránh +${Math.round(tDef.stats.dodge * 100)}%`);
      }
      const statsText = statsList.length > 0 ? statsList.join(' · ') : 'Thuộc tính tiềm ẩn';

      let buttonHtml = '';
      if (isActive) {
        buttonHtml = `<button class="btn-title-action btn-active">⚡ ĐANG ĐEO</button>`;
      } else if (isUnlocked) {
        buttonHtml = `<button class="btn-title-action btn-equip" data-title-id="${tId}">⚔ KÍCH HOẠT</button>`;
      } else if (isRank) {
        buttonHtml = `<button class="btn-title-action btn-locked" disabled>🔒 TOP ${tDef.rank || 1} SERVER</button>`;
      } else {
        buttonHtml = `<button class="btn-title-action btn-locked" disabled>🔒 LV.${tDef.levelReq}</button>`;
      }

      const reqLabel = isUnlocked ? '✓ ĐÃ MỞ KHÓA' : (isRank ? `Cần Đạt Top ${tDef.rank || 1} Toàn Server` : `Cần Cấp ${tDef.levelReq}`);

      card.innerHTML = `
        <img class="title-badge-img" src="assets/titles/${tDef.badge || 'title_1.png'}" alt="${tDef.name}" />
        <div class="title-info-col">
          <div class="title-name-row">
            <span class="title-card-name" style="color: ${tDef.color || '#fff'}; font-size: ${isRank ? '15px' : '14px'}; font-weight:bold;">${tDef.name}</span>
            <span class="title-card-req" style="${isUnlocked ? 'color:#4ade80; font-weight:bold;' : ''}">${reqLabel}</span>
          </div>
          <div class="title-card-stats" style="color:#fde047;">❖ ${statsText}</div>
          <div class="title-card-desc" style="color:#cbd5e1;">${tDef.desc || ''}</div>
        </div>
        <div class="title-action-col">
          ${buttonHtml}
        </div>
      `;

      const btnEquip = card.querySelector('.btn-equip');
      if (btnEquip) {
        btnEquip.onclick = () => {
          this.socket.emit('set_active_title', { titleId: tId });
          this.audioEngine.playSwordDraw();
        };
      }

      return card;
    };

    // 1. MỤC DANH HIỆU BẢNG XẾP HẠNG TOÀN SERVER (TOP 1 - TOP 10)
    if (rankTitles.length > 0) {
      const rankHeader = document.createElement('div');
      rankHeader.className = 'titles-category-header';
      rankHeader.style.cssText = 'grid-column: 1 / -1; margin: 15px 0 8px 0; padding: 6px 12px; background: linear-gradient(90deg, rgba(234, 179, 8, 0.25), transparent); border-left: 4px solid #facc15; font-size: 14px; font-weight: bold; color: #ffd700; text-transform: uppercase; letter-spacing: 1px; display:flex; align-items:center; gap:8px;';
      rankHeader.innerHTML = `<span>👑 10 ĐẠI DANH HIỆU BẢNG XẾP HẠNG TOÀN SERVER (TOP 1 - TOP 10)</span><span style="font-size:11px; color:#cbd5e1; font-weight:normal;">(Cực Phẩm Đỉnh Phong, Hào Quang Cánh Thần Hoành Tráng)</span>`;
      container.appendChild(rankHeader);

      rankTitles.forEach(([tId, tDef]) => {
        container.appendChild(renderCard(tId, tDef));
      });
    }

    // 2. MỤC 12 ĐẠI DANH HIỆU TIẾN TRÌNH CẢNH GIỚI VÕ LÂM & TU TIÊN
    if (realmTitles.length > 0) {
      const realmHeader = document.createElement('div');
      realmHeader.className = 'titles-category-header';
      realmHeader.style.cssText = 'grid-column: 1 / -1; margin: 20px 0 8px 0; padding: 6px 12px; background: linear-gradient(90deg, rgba(56, 189, 248, 0.2), transparent); border-left: 4px solid #38bdf8; font-size: 14px; font-weight: bold; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px; display:flex; align-items:center; gap:8px;';
      realmHeader.innerHTML = `<span>⚔️ 12 ĐẠI DANH HIỆU TIẾN TRÌNH CẢNH GIỚI VÕ LÂM & TU TIÊN</span><span style="font-size:11px; color:#cbd5e1; font-weight:normal;">(Mở khóa theo cấp độ nhân vật)</span>`;
      container.appendChild(realmHeader);

      realmTitles.forEach(([tId, tDef]) => {
        container.appendChild(renderCard(tId, tDef));
      });
    }
  }

  // RENDER BỘ LỌC TỰ NHẶT ĐỒ
  renderLootFilterModal() {
    if (!this.lootFilterModal || !this.playerState) return;
    const filter = this.playerState.lootFilter || { minRarity: 'common', allowEquip: true, allowPotion: true, allowGemCharm: true };

    const radio = this.lootFilterModal.querySelector(`input[name="loot-min-rarity"][value="${filter.minRarity}"]`);
    if (radio) radio.checked = true;

    const chkEquip = document.getElementById('chk-loot-equip');
    if (chkEquip) chkEquip.checked = filter.allowEquip !== false;

    const chkPotion = document.getElementById('chk-loot-potion');
    if (chkPotion) chkPotion.checked = filter.allowPotion !== false;

    const chkGem = document.getElementById('chk-loot-gem-charm');
    if (chkGem) chkGem.checked = filter.allowGemCharm !== false;
  }

  // ============================================================
  // HỆ THỐNG ĐĂNG KÝ / ĐĂNG NHẬP / CHỌN NHÂN VẬT PERSISTENT
  // ============================================================
  initAuthUI() {
    this.currentAuthUser = localStorage.getItem('cuuchau_logged_user') || null;

    const tabBtnLogin = document.getElementById('tab-btn-login');
    const tabBtnReg = document.getElementById('tab-btn-register');
    const paneLogin = document.getElementById('form-login-pane');
    const paneReg = document.getElementById('form-register-pane');
    const authBox = document.getElementById('auth-box');
    const charSelectBox = document.getElementById('char-select-box');
    const charCreateBox = document.getElementById('char-create-box');

    if (tabBtnLogin && tabBtnReg) {
      tabBtnLogin.onclick = () => {
        tabBtnLogin.classList.add('active');
        tabBtnReg.classList.remove('active');
        paneLogin.style.display = 'flex';
        paneReg.style.display = 'none';
      };
      tabBtnReg.onclick = () => {
        tabBtnReg.classList.add('active');
        tabBtnLogin.classList.remove('active');
        paneReg.style.display = 'flex';
        paneLogin.style.display = 'none';
      };
    }

    // Đăng ký tài khoản
    const btnSubmitReg = document.getElementById('btn-submit-register');
    if (btnSubmitReg) {
      btnSubmitReg.onclick = () => {
        const u = (document.getElementById('auth-reg-user')?.value || '').trim();
        const p = document.getElementById('auth-reg-pass')?.value || '';
        const rep = document.getElementById('auth-reg-repass')?.value || '';
        const msgEl = document.getElementById('auth-reg-msg');

        if (p !== rep) {
          if (msgEl) { msgEl.className = 'auth-msg error'; msgEl.textContent = 'Mật khẩu nhập lại không khớp!'; }
          return;
        }

        this.socket.emit('account_register', { username: u, password: p });
      };
    }

    this.socket.on('account_register_result', (res) => {
      const msgEl = document.getElementById('auth-reg-msg');
      if (res && res.success) {
        if (msgEl) { msgEl.className = 'auth-msg success'; msgEl.textContent = res.msg + ' Đang chuyển sang đăng nhập...'; }
        setTimeout(() => {
          if (tabBtnLogin) tabBtnLogin.click();
          const loginUserEl = document.getElementById('auth-login-user');
          if (loginUserEl) loginUserEl.value = res.username;
        }, 1200);
      } else {
        if (msgEl) { msgEl.className = 'auth-msg error'; msgEl.textContent = res ? res.msg : 'Đăng ký thất bại!'; }
      }
    });

    // Đăng nhập tài khoản
    const btnSubmitLogin = document.getElementById('btn-submit-login');
    if (btnSubmitLogin) {
      btnSubmitLogin.onclick = () => {
        const u = (document.getElementById('auth-login-user')?.value || '').trim();
        const p = document.getElementById('auth-login-pass')?.value || '';
        this.socket.emit('account_login', { username: u, password: p });
      };
    }

    this.socket.on('account_login_result', (res) => {
      const msgEl = document.getElementById('auth-login-msg');
      if (res && res.success) {
        this.currentAuthUser = res.username;
        localStorage.setItem('cuuchau_logged_user', res.username);
        
        if (authBox) authBox.style.display = 'none';
        if (charSelectBox) charSelectBox.style.display = 'block';
        const lblUser = document.getElementById('lbl-logged-user');
        if (lblUser) lblUser.textContent = res.username;

        this.renderCharacterList(res.characters || []);
      } else {
        if (msgEl) { msgEl.className = 'auth-msg error'; msgEl.textContent = res ? res.msg : 'Đăng nhập thất bại!'; }
      }
    });

    // Đăng xuất
    const btnLogout = document.getElementById('btn-auth-logout');
    if (btnLogout) {
      btnLogout.onclick = () => {
        this.currentAuthUser = null;
        localStorage.removeItem('cuuchau_logged_user');
        if (authBox) authBox.style.display = 'block';
        if (charSelectBox) charSelectBox.style.display = 'none';
        if (charCreateBox) charCreateBox.style.display = 'none';
      };
    }

    // Mở khung Tạo Nhân Vật
    const btnOpenCreate = document.getElementById('btn-open-create-char');
    if (btnOpenCreate) {
      btnOpenCreate.onclick = () => {
        if (charSelectBox) charSelectBox.style.display = 'none';
        if (charCreateBox) charCreateBox.style.display = 'block';
      };
    }

    // Quay lại danh sách nhân vật
    const btnBack = document.getElementById('btn-back-to-chars');
    if (btnBack) {
      btnBack.onclick = () => {
        if (charCreateBox) charCreateBox.style.display = 'none';
        if (charSelectBox) charSelectBox.style.display = 'block';
      };
    }

    // Chọn môn phái khi tạo nhân vật
    let selectedSect = 'huashan';
    document.querySelectorAll('#char-create-box .sect-card').forEach(card => {
      card.addEventListener('click', () => {
        document.querySelectorAll('#char-create-box .sect-card').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedSect = card.dataset.sect;
      });
    });

    // Xác nhận Tạo Nhân Vật Mới
    const btnSubmitCreate = document.getElementById('btn-submit-create-char');
    if (btnSubmitCreate) {
      btnSubmitCreate.onclick = () => {
        const name = (document.getElementById('char-name-input')?.value || '').trim();
        if (!name) {
          alert('Vui lòng nhập tên nhân vật!');
          return;
        }
        this.socket.emit('create_character', {
          username: this.currentAuthUser,
          name,
          sect: selectedSect
        });
      };
    }

    this.socket.on('create_character_result', (res) => {
      if (res && res.success && res.character) {
        // Tự động chọn nhân vật này vào game ngay lập tức!
        this.socket.emit('select_character', {
          username: this.currentAuthUser,
          charId: res.character.id
        });
      } else {
        alert(res ? res.msg : 'Tạo nhân vật thất bại!');
      }
    });

    this.initPermadeathUI();
    this.initRevenantEventUI();
  }

  // RENDER DANH SÁCH NHÂN VẬT ĐÃ LƯU TRONG DB
  renderCharacterList(characters) {
    const listEl = document.getElementById('char-cards-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    if (characters.length === 0) {
      listEl.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; color: #94a3b8; padding: 25px;">
          Tài khoản này chưa có nhân vật nào trên giang hồ. Hãy bấm <strong>+ TẠO NHÂN VẬT MỚI</strong> để bắt đầu!
        </div>
      `;
      return;
    }

    const sectNames = {
      huashan: 'Hoa Sơn Phái',
      xiaoyao: 'Tiêu Dao Tông',
      shaolin: 'Thiếu Lâm Tung Sơn',
      wudang: 'Võ Đang Thái Cực'
    };

    characters.forEach(c => {
      const card = document.createElement('div');
      card.className = `char-select-card ${c.isDeadPerm ? 'dead' : ''}`;
      
      const statusText = c.isDeadPerm 
        ? '<span style="color: #ef4444; font-weight: bold;">💀 HÓA ĐẠO QUY KHƯ (THỌ TẬN)</span>'
        : `<span style="color: #4ade80;">⏳ Tuổi: ${c.age || 18} / ${c.maxLifespan || 100} Năm</span>`;

      card.innerHTML = `
        <div style="font-size: 16px; font-weight: bold; color: #ffd700; margin-bottom: 4px;">${c.name}</div>
        <div style="font-size: 12px; color: #38bdf8; margin-bottom: 4px;">Lv.${c.level || 1} · ${sectNames[c.sect] || 'Hiệp Khách'}</div>
        <div style="font-size: 12px; color: #c084fc; margin-bottom: 6px;">Cảnh Giới: ${c.realm || 'Luyện Khí Tầng 1'}</div>
        <div style="font-size: 11px; margin-bottom: 12px;">${statusText}</div>
        <button class="btn-enter-char btn-wuxia-primary" ${c.isDeadPerm ? 'disabled style="opacity: 0.5;"' : ''}>
          ${c.isDeadPerm ? 'ĐÃ TẬN SỐ' : '⚔ VÀO GIANG HỒ'}
        </button>
      `;

      const btnEnter = card.querySelector('.btn-enter-char');
      if (btnEnter && !c.isDeadPerm) {
        btnEnter.onclick = (e) => {
          e.stopPropagation();
          this.socket.emit('select_character', {
            username: this.currentAuthUser,
            charId: c.id
          });
        };
      }

      listEl.appendChild(card);
    });
  }

  // ============================================================
  // HỆ THỐNG TU TIÊN & ĐỘT PHÁ CẢNH GIỚI
  // ============================================================
  initCultivationUI() {
    const tabProgress = document.getElementById('tab-cultiv-progress');
    const tabSects = document.getElementById('tab-cultiv-sects');
    const paneProgress = document.getElementById('pane-cultiv-progress');
    const paneSects = document.getElementById('pane-cultiv-sects');

    if (tabProgress && tabSects) {
      tabProgress.onclick = () => {
        tabProgress.classList.add('active');
        tabSects.classList.remove('active');
        if (paneProgress) paneProgress.style.display = 'block';
        if (paneSects) paneSects.style.display = 'none';
      };
      tabSects.onclick = () => {
        tabSects.classList.add('active');
        tabProgress.classList.remove('active');
        if (paneSects) paneSects.style.display = 'block';
        if (paneProgress) paneProgress.style.display = 'none';
      };
    }

    // Nút Đột Phá Cảnh Giới
    const btnBreak = document.getElementById('btn-do-breakthrough');
    if (btnBreak) {
      btnBreak.onclick = () => {
        this.socket.emit('cultivation_breakthrough');
        this.audioEngine.playThunder();
      };
    }

    this.socket.on('breakthrough_result', (res) => {
      const msgEl = document.getElementById('cultiv-breakthrough-msg');
      if (res && res.msg) {
        if (msgEl) {
          msgEl.style.color = res.success ? '#4ade80' : '#f87171';
          msgEl.textContent = res.msg;
        }
        this.showNotice(res.msg, res.success ? 'success' : 'danger');
      }
      this.renderCultivationModal();
    });

    // Các nút Gia Nhập 4 Môn Phái Tu Tiên
    document.querySelectorAll('.btn-join-csect').forEach(btn => {
      btn.onclick = () => {
        const sKey = btn.dataset.csect;
        if (!this.playerState || this.playerState.level < 30) {
          alert('Cần đạt Cấp 30 trở lên mới có thể lĩnh ngộ Tiên Đạo chuyển phái!');
          return;
        }
        if (confirm(`Huynh đài có chắc chắn muốn gia nhập môn hạ Tiên Đạo này? Mở khóa toàn bộ 4 tuyệt kỹ thần thông mới!`)) {
          this.socket.emit('change_cultiv_sect', { sectKey: sKey });
          this.audioEngine.playSwordDraw();
        }
      };
    });

    this.socket.on('change_cultiv_sect_result', (res) => {
      if (res && res.msg) {
        this.showNotice(res.msg, res.success ? 'success' : 'warning');
      }
      this.renderCultivationModal();
    });

    // Nhận Tu Vi từ quái vật
    this.socket.on('tuvi_gain', (data) => {
      if (this.playerState && data) {
        this.playerState.tuvi = data.totalTuvi;
        const tuviTextEl = document.getElementById('player-tuvi-text');
        if (tuviTextEl) tuviTextEl.textContent = data.totalTuvi.toLocaleString();
      }
    });
  }

  // RENDER NỘI DUNG MODAL TU TIÊN
  renderCultivationModal() {
    if (!this.playerState) return;
    const p = this.playerState;

    const realmNameEl = document.getElementById('cultiv-current-realm-name');
    if (realmNameEl) realmNameEl.textContent = p.realm || 'Luyện Khí Tầng 1';

    const cdrValEl = document.getElementById('cultiv-cdr-val');
    if (cdrValEl) cdrValEl.textContent = `${p.cooldownReduction || 0}%`;

    const tuviBoostEl = document.getElementById('cultiv-tuvi-boost-val');
    if (tuviBoostEl) tuviBoostEl.textContent = `+${p.tuviBoost || 0}%`;

    // Thanh Thọ Nguyên
    const age = p.age || 18;
    const maxLife = p.maxLifespan || 100;
    const lifeLabel = document.getElementById('cultiv-lifespan-label');
    if (lifeLabel) lifeLabel.textContent = `${age} / ${maxLife} Năm`;
    const lifeFill = document.getElementById('cultiv-lifespan-fill');
    if (lifeFill) {
      const lifePct = Math.min(100, Math.max(0, (age / maxLife) * 100));
      lifeFill.style.width = `${lifePct}%`;
      // Nếu tuổi thọ sắp cạn kiệt (>80%), đổi sang màu đỏ cảnh báo nguy cấp!
      if (lifePct >= 80) {
        lifeFill.style.background = 'linear-gradient(90deg, #f59e0b, #ef4444)';
      }
    }

    // Thanh Tu Vi
    const curTuvi = p.tuvi || 0;
    const reqTuvi = p.reqTuvi || 100;
    const tuviLabel = document.getElementById('cultiv-tuvi-label');
    if (tuviLabel) tuviLabel.textContent = `${curTuvi.toLocaleString()} / ${reqTuvi.toLocaleString()} Tu Vi`;
    const tuviFill = document.getElementById('cultiv-tuvi-fill');
    if (tuviFill) {
      const tuviPct = reqTuvi > 0 ? Math.min(100, Math.max(0, (curTuvi / reqTuvi) * 100)) : 100;
      tuviFill.style.width = `${tuviPct}%`;
    }

    // Cập nhật trạng thái các nút phái tu tiên
    document.querySelectorAll('.btn-join-csect').forEach(btn => {
      const sKey = btn.dataset.csect;
      if (p.cultivSect === sKey) {
        btn.textContent = '✓ ĐÃ GIA NHẬP';
        btn.style.background = '#10b981';
        btn.style.color = '#fff';
        btn.disabled = true;
      } else {
        btn.textContent = 'GIA NHẬP';
        btn.disabled = p.level < 30;
      }
    });
  }

  // ============================================================
  // XỬ LÝ SỰ KIỆN THỌ CHUNG CHÍNH TẨM (PERMADEATH)
  // ============================================================
  initPermadeathUI() {
    this.socket.on('player_permadeath', (data) => {
      const modal = document.getElementById('modal-permadeath');
      const textEl = document.getElementById('permadeath-msg-text');
      if (textEl && data && data.msg) {
        textEl.textContent = data.msg;
      }
      if (modal) {
        modal.style.display = 'flex';
      }
      this.audioEngine.playBossRoar();
    });

    const btnRestart = document.getElementById('btn-permadeath-restart');
    if (btnRestart) {
      btnRestart.onclick = () => {
        location.reload();
      };
    }
  }

  // ============================================================
  // SỰ KIỆN CƯỜNG GIẢ TỌA HÓA - NGUYÊN HỒN ÁC HÓA (WORLD EVENT)
  // ============================================================
  initRevenantEventUI() {
    this.activeRevenantData = null;
    const modal = document.getElementById('modal-revenant-event');
    const dockBtn = document.getElementById('btn-dock-revenant');
    const btnTeleport = document.getElementById('btn-revenant-teleport-now');
    const btnDismiss = document.getElementById('btn-revenant-dismiss-later');
    const btnClose = document.getElementById('btn-close-revenant-modal');

    const updateModalData = (data) => {
      this.activeRevenantData = data;
      const storyEl = document.getElementById('lbl-revenant-story-msg');
      const ownerEl = document.getElementById('lbl-revenant-owner-name');
      const sectEl = document.getElementById('lbl-revenant-owner-sect');
      const mapEl = document.getElementById('lbl-revenant-target-map');
      const coordsEl = document.getElementById('lbl-revenant-target-coords');
      const lootEl = document.getElementById('lbl-revenant-loot-desc');

      if (storyEl) storyEl.textContent = `"${data.msg || ''}"`;
      if (ownerEl) ownerEl.textContent = data.ownerName || 'Tiền Bối Vô Danh';
      
      const sName = { huashan: 'Hoa Sơn', xiaoyao: 'Tiêu Dao', shaolin: 'Thiếu Lâm', wudang: 'Võ Đang' }[data.ownerSect] || 'Giang Hồ';
      const csName = { dao: 'Thái Thanh', buddha: 'Phạn Thiên', demon: 'U Minh', beast: 'Vạn Yêu' }[data.ownerCultivSect] || '';
      const sectFull = csName ? `${data.ownerRealm || 'Tu Tiên'} · ${csName} (${sName})` : `${data.ownerRealm || 'Võ Lâm'} · ${sName}`;
      if (sectEl) sectEl.textContent = sectFull;

      if (mapEl) mapEl.textContent = data.mapName || 'Tiên Cảnh';
      if (coordsEl) coordsEl.textContent = `(${data.x}, ${data.y})`;
      if (lootEl) lootEl.textContent = `Toàn bộ ${data.totalDropsCount || 8} Thần Trang & Báu vật + ${(data.totalGold || 5000).toLocaleString()} Ngân lượng!`;
    };

    // Khi nhận thông báo Boss Nguyên Hồn Giáng Thế
    this.socket.on('revenant_boss_spawned', (data) => {
      updateModalData(data);
      if (modal) modal.style.display = 'flex';
      if (dockBtn) {
        dockBtn.style.display = 'inline-flex';
        dockBtn.title = `⚠️ TRỪ MA: Nguyên Hồn [${data.ownerName}] tại [${data.mapName}]`;
      }
      this.audioEngine.playThunder();
      this.showNotice(`THIÊN ĐỊA BIẾN SẮC! Cường giả [${data.ownerName}] đã tọa hóa tại [${data.mapName}]! Mau đến trừ ma!`, 'boss_kill');
    });

    // Khi Boss Nguyên Hồn Bị Tiêu Diệt
    this.socket.on('revenant_boss_defeated', (data) => {
      if (modal) modal.style.display = 'none';
      if (dockBtn) dockBtn.style.display = 'none';
      this.activeRevenantData = null;
      this.showNotice(data.msg || 'Nguyên Hồn Ác Hóa đã bị đánh lui! Báu vật đã rơi ra!', 'success');
      this.audioEngine.playLevelUp();
    });

    // Nút tham gia trừ ma (Truyền tống tức thời)
    if (btnTeleport) {
      btnTeleport.onclick = () => {
        if (!this.activeRevenantData) return;
        this.socket.emit('teleport_to_revenant_event', {
          bossId: this.activeRevenantData.bossId
        });
        if (modal) modal.style.display = 'none';
      };
    }

    // Nút đóng / tạm ẩn modal
    if (btnDismiss) {
      btnDismiss.onclick = () => {
        if (modal) modal.style.display = 'none';
      };
    }
    if (btnClose) {
      btnClose.onclick = () => {
        if (modal) modal.style.display = 'none';
      };
    }

    // Nút dock bên phải để mở lại modal bất cứ lúc nào
    if (dockBtn) {
      dockBtn.onclick = () => {
        if (this.activeRevenantData) {
          updateModalData(this.activeRevenantData);
          if (modal) modal.style.display = 'flex';
        } else {
          this.showNotice('Hiện không có Nguyên Hồn Ác Hóa nào giáng thế!', 'info');
        }
      };
    }
  }
}

window.UIManager = UIManager;
