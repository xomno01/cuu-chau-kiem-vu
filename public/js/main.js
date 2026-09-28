// Điểm Nhập Khẩu Client Hoàn Chỉnh - Cửu Châu Kiếm Vũ Online V2

(function () {
  const socket = io();
  window.socket = socket;
  const audioEngine = new AudioEngine();
  const particleSystem = new ParticleSystem();

  let canvas, ctx, renderer, camera, uiManager;
  let myPlayerId = null;
  let currentMapId = 'lac_duong';
  let mapsData = {};

  let latestWorldState = {
    players: {},
    monsters: {},
    projectiles: [],
    droppedItems: [],
    npcs: {}
  };
  let npcsData = {};

  let isGameStarted = false;
  let isAutoCombat = false;
  let autoCombatTargetId = null;
  let lastAutoCombatMoveTime = 0;
  let lastAutoCombatAttackTime = 0;
  let keysDown = {};
  let mouseWorldPos = { x: 0, y: 0 };
  let pendingPickupDropId = null;
  let lastFrameTime = performance.now();

  function init() {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    renderer = new Renderer(canvas);
    camera = new Camera(window.innerWidth, window.innerHeight, 2800, 1800);
    uiManager = new UIManager(socket, audioEngine);
    window.uiManager = uiManager;

    handleResize();
    window.addEventListener('resize', handleResize);

    setupLoginUI();
    setupInputHandlers();
    setupSocketHandlers();

    // Tự động unlock âm thanh ngay khi người dùng chạm hoặc tương tác với trang web
    const unlockAudio = () => {
      audioEngine.unlock();
      ['click', 'keydown', 'touchstart'].forEach(evt => window.removeEventListener(evt, unlockAudio));
    };
    ['click', 'keydown', 'touchstart'].forEach(evt => window.addEventListener(evt, unlockAudio, { passive: true }));
  }

  function handleResize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    camera.resize(window.innerWidth, window.innerHeight);
    const minimapCanvas = document.getElementById('minimap-canvas');
    if (minimapCanvas) {
      const isMobile = window.innerWidth <= 768;
      minimapCanvas.width = isMobile ? 120 : 240;
      minimapCanvas.height = isMobile ? 80 : 150;
    }
  }

  function setupLoginUI() {
    const loginScreen = document.getElementById('screen-login');
    const gameScreen = document.getElementById('screen-game');
    const sectCards = document.querySelectorAll('.sect-card');
    const nameInput = document.getElementById('char-name-input');
    const btnEnterGame = document.getElementById('btn-enter-game');

    let selectedSect = 'huashan';

    sectCards.forEach(card => {
      card.addEventListener('click', () => {
        sectCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedSect = card.dataset.sect;
        audioEngine.playSwordDraw();
      });
    });

    if (btnEnterGame) {
      btnEnterGame.addEventListener('click', () => {
        const name = (nameInput ? nameInput.value.trim() : '') || (selectedSect === 'huashan' ? 'Lệnh Hồ Hiệp' : 'Tiêu Dao Tiên');
        audioEngine.resume();
        audioEngine.playLevelUp();
        audioEngine.startBGM();

        socket.emit('join_game', { name, sect: selectedSect });

        if (loginScreen) loginScreen.style.display = 'none';
        if (gameScreen) gameScreen.style.display = 'block';
      });
    }
  }

  function setupInputHandlers() {
    window.addEventListener('contextmenu', (e) => e.preventDefault());

    let isMouseDown = false;

    window.addEventListener('mouseup', () => {
      isMouseDown = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (!camera) return;
      mouseWorldPos = camera.screenToWorld(e.clientX, e.clientY);
      if (isMouseDown && isGameStarted && e.target === canvas) {
        socket.emit('move_to', { x: mouseWorldPos.x, y: mouseWorldPos.y });
      }
    });

    canvas.addEventListener('mousedown', (e) => {
      if (!isGameStarted) return;
      if (e.button === 0) isMouseDown = true;
      audioEngine.resume();
      const clickWorld = camera.screenToWorld(e.clientX, e.clientY);

      // Chuột Phải: Tấn Công Cơ Bản
      if (e.button === 2) {
        socket.emit('normal_attack', { x: clickWorld.x, y: clickWorld.y });
        audioEngine.playSwordSlash();
        return;
      }

      // Chuột Trái: Trò chuyện NPC, Nhặt Đồ hoặc Di Chuyển
      if (e.button === 0) {
        // 1. Kiểm tra Click vào NPC Trong Thành Lạc Dương
        const allNpcs = latestWorldState.npcs || npcsData;
        if (allNpcs) {
          for (const npc of Object.values(allNpcs)) {
            if (npc.mapId && npc.mapId !== currentMapId) continue;
            const distToNpc = Math.hypot(npc.x - clickWorld.x, npc.y - clickWorld.y);
            if (distToNpc <= 65) {
              uiManager.openNPCDialogue(npc);
              return;
            }
          }
        }

        // 2. Kiểm tra Nhặt Đồ (Mở rộng bán kính click lên 85px và tự chạy lại nếu ở xa)
        let picked = false;
        if (latestWorldState.droppedItems) {
          const myPlayer = latestWorldState.players[myPlayerId];
          for (const item of latestWorldState.droppedItems) {
            if (item.mapId && item.mapId !== currentMapId) continue;
            const dist = Math.hypot(item.x - clickWorld.x, item.y - clickWorld.y);
            if (dist <= 85) {
              if (myPlayer) {
                const distPlayer = Math.hypot(item.x - myPlayer.x, item.y - myPlayer.y);
                if (distPlayer <= 170) {
                  socket.emit('pickup_item', { dropId: item.id });
                } else {
                  socket.emit('move_to', { x: item.x, y: item.y });
                  pendingPickupDropId = item.id;
                  particleSystem.addMoveMarker(item.x, item.y);
                }
              } else {
                socket.emit('pickup_item', { dropId: item.id });
              }
              picked = true;
              break;
            }
          }
        }

        if (!picked) {
          socket.emit('move_to', { x: clickWorld.x, y: clickWorld.y });
          particleSystem.addMoveMarker(clickWorld.x, clickWorld.y);
        }
      }
    });

    // ============================================================
    // HỖ TRỢ ĐIỀU KHIỂN CẢM ỨNG TRÊN MOBILE (TOUCH ENGINE)
    // ============================================================
    let isTouching = false;

    function createTouchRipple(clientX, clientY) {
      const circle = document.createElement('div');
      circle.className = 'touch-ripple-circle';
      circle.style.left = clientX + 'px';
      circle.style.top = clientY + 'px';
      circle.style.width = '50px';
      circle.style.height = '50px';
      document.body.appendChild(circle);
      setTimeout(() => circle.remove(), 520);
    }

    canvas.addEventListener('touchstart', (e) => {
      if (!isGameStarted || !camera) return;
      if (e.target !== canvas) return;
      e.preventDefault();
      audioEngine.resume();
      isTouching = true;

      const touch = e.touches[0];
      const clickWorld = camera.screenToWorld(touch.clientX, touch.clientY);
      mouseWorldPos = clickWorld;
      createTouchRipple(touch.clientX, touch.clientY);

      // 1. Chạm vào NPC trong thành
      const allNpcs = latestWorldState.npcs || npcsData;
      if (allNpcs) {
        for (const npc of Object.values(allNpcs)) {
          if (npc.mapId && npc.mapId !== currentMapId) continue;
          if (Math.hypot(npc.x - clickWorld.x, npc.y - clickWorld.y) <= 80) {
            uiManager.openNPCDialogue(npc);
            return;
          }
        }
      }

      // 2. Chạm vào Đồ rơi
      let picked = false;
      if (latestWorldState.droppedItems) {
        const myPlayer = latestWorldState.players[myPlayerId];
        for (const item of latestWorldState.droppedItems) {
          if (item.mapId && item.mapId !== currentMapId) continue;
          if (Math.hypot(item.x - clickWorld.x, item.y - clickWorld.y) <= 90) {
            if (myPlayer && Math.hypot(item.x - myPlayer.x, item.y - myPlayer.y) > 170) {
              socket.emit('move_to', { x: item.x, y: item.y });
              pendingPickupDropId = item.id;
              particleSystem.addMoveMarker(item.x, item.y);
            } else {
              socket.emit('pickup_item', { dropId: item.id });
            }
            picked = true;
            break;
          }
        }
      }

      // 3. Chạm vào Quái vật / Boss -> Tấn công mục tiêu đó
      if (!picked && latestWorldState.monsters) {
        for (const m of Object.values(latestWorldState.monsters)) {
          if (m.isDead || m.mapId !== currentMapId) continue;
          if (Math.hypot(m.x - clickWorld.x, m.y - clickWorld.y) <= 75) {
            socket.emit('normal_attack', { x: m.x, y: m.y });
            audioEngine.playSwordSlash();
            return;
          }
        }
      }

      // 4. Chạm đất -> Di chuyển tới vị trí đó
      if (!picked) {
        socket.emit('move_to', { x: clickWorld.x, y: clickWorld.y });
        particleSystem.addMoveMarker(clickWorld.x, clickWorld.y);
      }
    }, { passive: false });

    canvas.addEventListener('touchmove', (e) => {
      if (!isGameStarted || !camera || !isTouching) return;
      if (e.target !== canvas) return;
      e.preventDefault();
      const touch = e.touches[0];
      const moveWorld = camera.screenToWorld(touch.clientX, touch.clientY);
      mouseWorldPos = moveWorld;
      socket.emit('move_to', { x: moveWorld.x, y: moveWorld.y });
    }, { passive: false });

    canvas.addEventListener('touchend', () => {
      isTouching = false;
    });

    // Nút Tấn Công Cơ Bản To Ảo Cho Mobile (#btn-mobile-attack)
    const btnMobileAttack = document.getElementById('btn-mobile-attack');
    if (btnMobileAttack) {
      const doAttack = (e) => {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        if (!isGameStarted || !latestWorldState) return;
        const myPlayer = latestWorldState.players[myPlayerId];
        let targetX = mouseWorldPos.x;
        let targetY = mouseWorldPos.y;
        if (myPlayer && latestWorldState.monsters) {
          let closest = null;
          let minD = 450;
          for (const m of Object.values(latestWorldState.monsters)) {
            if (m.isDead || m.mapId !== currentMapId) continue;
            const d = Math.hypot(m.x - myPlayer.x, m.y - myPlayer.y);
            if (d < minD) {
              minD = d;
              closest = m;
            }
          }
          if (closest) {
            targetX = closest.x;
            targetY = closest.y;
          }
        }
        socket.emit('normal_attack', { x: targetX, y: targetY });
        audioEngine.playSwordSlash();
      };
      btnMobileAttack.addEventListener('touchstart', doAttack, { passive: false });
      btnMobileAttack.addEventListener('click', doAttack);
    }

    window.addEventListener('keydown', (e) => {
      if (!isGameStarted) return;
      if (document.activeElement && (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName) || document.activeElement.isContentEditable)) {
        return;
      }
      keysDown[e.code] = true;

      // Phím E: Tương tác với NPC gần nhất (nếu ở gần NPC)
      if (e.code === 'KeyE') {
        const myPlayer = latestWorldState.players[myPlayerId];
        if (myPlayer) {
          const allNpcs = latestWorldState.npcs || npcsData;
          let nearestNpc = null;
          let minDist = 220;
          for (const npc of Object.values(allNpcs)) {
            if (npc.mapId && npc.mapId !== currentMapId) continue;
            const dist = Math.hypot(npc.x - myPlayer.x, npc.y - myPlayer.y);
            if (dist < minDist) {
              minDist = dist;
              nearestNpc = npc;
            }
          }
          if (nearestNpc) {
            uiManager.openNPCDialogue(nearestNpc);
            return;
          }
        }
      }

      // Phím F: Nhặt Nhanh Đồ Rơi Gần Nhất
      if (e.code === 'KeyF') {
        const myPlayer = latestWorldState.players[myPlayerId];
        if (myPlayer && latestWorldState.droppedItems && latestWorldState.droppedItems.length > 0) {
          const nearbyDrops = latestWorldState.droppedItems.filter(d => 
            d.mapId === currentMapId && Math.hypot(d.x - myPlayer.x, d.y - myPlayer.y) <= 220
          );
          if (nearbyDrops.length > 0) {
            nearbyDrops.sort((a, b) => Math.hypot(a.x - myPlayer.x, a.y - myPlayer.y) - Math.hypot(b.x - myPlayer.x, b.y - myPlayer.y));
            socket.emit('pickup_item', { dropId: nearbyDrops[0].id });
            audioEngine.playLoot();
          }
        }
      }

      // Space: Khinh Công
      if (e.code === 'Space') {
        e.preventDefault();
        let dx = 0, dy = 0;
        if (keysDown['KeyW'] || keysDown['ArrowUp']) dy -= 1;
        if (keysDown['KeyS'] || keysDown['ArrowDown']) dy += 1;
        if (keysDown['KeyA'] || keysDown['ArrowLeft']) dx -= 1;
        if (keysDown['KeyD'] || keysDown['ArrowRight']) dx += 1;

        if (dx === 0 && dy === 0) {
          const myPlayer = latestWorldState.players[myPlayerId];
          if (myPlayer) {
            dx = Math.cos(myPlayer.angle);
            dy = Math.sin(myPlayer.angle);
          }
        }
        socket.emit('dash', { dirX: dx, dirY: dy });
        audioEngine.playDash();
        return;
      }

      // Phím 1, 2, 3, 4: Tung Kỹ Năng
      const myPlayer = latestWorldState.players[myPlayerId];
      if (myPlayer) {
        let sectSkills = ['hs_1', 'hs_2', 'hs_3', 'hs_4'];
        if (myPlayer.cultivSect === 'dao') sectSkills = ['tt_1', 'tt_2', 'tt_3', 'tt_4'];
        else if (myPlayer.cultivSect === 'buddha') sectSkills = ['pt_1', 'pt_2', 'pt_3', 'pt_4'];
        else if (myPlayer.cultivSect === 'demon') sectSkills = ['um_1', 'um_2', 'um_3', 'um_4'];
        else if (myPlayer.cultivSect === 'beast') sectSkills = ['vy_1', 'vy_2', 'vy_3', 'vy_4'];
        else if (myPlayer.sect === 'xiaoyao') sectSkills = ['xy_1', 'xy_2', 'xy_3', 'xy_4'];
        else if (myPlayer.sect === 'shaolin') sectSkills = ['sl_1', 'sl_2', 'sl_3', 'sl_4'];
        else if (myPlayer.sect === 'wudang') sectSkills = ['wd_1', 'wd_2', 'wd_3', 'wd_4'];

        let skillIdx = -1;
        if (e.code === 'Digit1') skillIdx = 0;
        if (e.code === 'Digit2') skillIdx = 1;
        if (e.code === 'Digit3') skillIdx = 2;
        if (e.code === 'Digit4') skillIdx = 3;

        if (skillIdx !== -1) {
          const sId = sectSkills[skillIdx];
          socket.emit('cast_skill', {
            skillId: sId,
            x: mouseWorldPos.x,
            y: mouseWorldPos.y
          });
        }
      }

      // Phím Z: Bật / Tắt Auto Combat
      if (e.code === 'KeyZ') {
        isAutoCombat = !isAutoCombat;
        const btnAuto = document.getElementById('btn-auto-combat');
        if (btnAuto) {
          btnAuto.classList.toggle('active', isAutoCombat);
          btnAuto.textContent = isAutoCombat ? '⚔ TỰ ĐỘNG: BẬT' : '⚔ TỰ ĐỘNG: TẮT';
        }
        uiManager.showNotice(isAutoCombat ? 'Đã bật chế độ Tự Động Luyện Cấp!' : 'Đã tắt Tự Động.', 'info');
      }
      // Phím X được xử lý bởi UIManager để mở Bảng Săn Boss Thế Giới mượt mà
    });

    window.addEventListener('keyup', (e) => {
      keysDown[e.code] = false;
    });

    function triggerHuntBoss() {
      const myPlayer = latestWorldState.players[myPlayerId];
      if (!myPlayer) return;

      // 1. Tìm Boss Thế Giới / Boss Nguyên Hồn trên map
      let targetBoss = null;
      for (const m of Object.values(latestWorldState.monsters)) {
        if (m.state === 'dead' || (m.mapId && m.mapId !== currentMapId)) continue;
        if (m.isBoss || m.isRevenantBoss) {
          targetBoss = m;
          break;
        }
      }

      // 2. Nếu không có Boss, tìm Quái Tinh Anh
      if (!targetBoss) {
        for (const m of Object.values(latestWorldState.monsters)) {
          if (m.state === 'dead' || (m.mapId && m.mapId !== currentMapId)) continue;
          if (m.isElite) {
            targetBoss = m;
            break;
          }
        }
      }

      if (targetBoss) {
        isAutoCombat = true;
        const btnAuto = document.getElementById('btn-auto-combat');
        if (btnAuto) {
          btnAuto.classList.add('active');
          btnAuto.textContent = '⚔ TỰ ĐỘNG: BẬT';
        }
        const btnHunt = document.getElementById('btn-hunt-boss');
        if (btnHunt) btnHunt.classList.add('active');

        socket.emit('move_to', { x: targetBoss.x, y: targetBoss.y });
        particleSystem.addMoveMarker(targetBoss.x, targetBoss.y);
        audioEngine.playSwordDraw();
        uiManager.showNotice(`🎯 ĐANG TRUY LÙNG & DIỆT BOSS: [${targetBoss.name}] (${targetBoss.x}, ${targetBoss.y})!`, 'boss_kill');
      } else {
        uiManager.showNotice('Bản đồ hiện tại chưa phát hiện Boss Thế Giới. Đã bật Tự Động quét quái!', 'warning');
        isAutoCombat = true;
        const btnAuto = document.getElementById('btn-auto-combat');
        if (btnAuto) {
          btnAuto.classList.add('active');
          btnAuto.textContent = '⚔ TỰ ĐỘNG: BẬT';
        }
      }
    }
    window.triggerHuntBoss = triggerHuntBoss;

    const btnAuto = document.getElementById('btn-auto-combat');
    if (btnAuto) {
      btnAuto.addEventListener('click', () => {
        isAutoCombat = !isAutoCombat;
        btnAuto.classList.toggle('active', isAutoCombat);
        btnAuto.textContent = isAutoCombat ? '⚔ TỰ ĐỘNG: BẬT' : '⚔ TỰ ĐỘNG: TẮT';
        uiManager.showNotice(isAutoCombat ? 'Đã bật chế độ Tự Động Luyện Cấp!' : 'Đã tắt Tự Động.', 'info');
      });
    }

    const btnHunt = document.getElementById('btn-hunt-boss');
    if (btnHunt) {
      btnHunt.addEventListener('click', triggerHuntBoss);
    }

    const btnDockHunt = document.getElementById('btn-dock-hunt-boss');
    if (btnDockHunt) {
      btnDockHunt.addEventListener('click', triggerHuntBoss);
    }

    const btnRespawn = document.getElementById('btn-respawn');
    if (btnRespawn) {
      btnRespawn.addEventListener('click', () => {
        socket.emit('respawn');
        document.getElementById('modal-death').classList.remove('active');
      });
    }
  }

  function updateHotbarSectIcons(sect, cultivSect = null) {
    const sectIcons = {
      huashan: [
        { icon: 'skill_1', title: 'Tật Phong Kiếm Khí (Phím 1)' },
        { icon: 'skill_2', title: 'Vạn Kiếm Quy Tông (Phím 2)' },
        { icon: 'skill_6', title: 'Tử Hà Hộ Thể (Phím 3)' },
        { icon: 'skill_8', title: 'Thiên Ngoại Phi Tiên (Phím 4)' }
      ],
      xiaoyao: [
        { icon: 'skill_9', title: 'Thiên Sơn Lục Dương (Phím 1)' },
        { icon: 'skill_5', title: 'Bắc Minh Thần Công (Phím 2)' },
        { icon: 'skill_3', title: 'Bát Quái Hộ Trận (Phím 3)' },
        { icon: 'skill_7', title: 'Lăng Ba Tuyệt Ảo (Phím 4)' }
      ],
      shaolin: [
        { icon: 'skill_sl_1', title: 'La Hán Côn Pháp (Phím 1)' },
        { icon: 'skill_sl_2', title: 'Kim Cang Phục Ma Trận (Phím 2)' },
        { icon: 'skill_sl_3', title: 'Kim Cang Bất Hoại Thể (Phím 3)' },
        { icon: 'skill_sl_4', title: 'Sư Tử Hống Thần Công (Phím 4)' }
      ],
      wudang: [
        { icon: 'skill_wd_1', title: 'Thái Cực Thần Kiếm (Phím 1)' },
        { icon: 'skill_wd_2', title: 'Lưỡng Nghi Kiếm Trận (Phím 2)' },
        { icon: 'skill_wd_3', title: 'Tọa Vong Vô Ngã (Phím 3)' },
        { icon: 'skill_wd_4', title: 'Vạn Kiếm Triều Tông (Phím 4)' }
      ],
      // 4 ĐẠI MÔN PHÁI TIÊN ĐẠO
      dao: [
        { icon: 'skill_wd_1', title: 'Thái Thanh Ngự Kiếm Thuật (Phím 1)' },
        { icon: 'skill_wd_2', title: 'Thiên Cương Bắc Đẩu Kiếm Trận (Phím 2)' },
        { icon: 'skill_wd_3', title: 'Thuần Dương Vô Cực Hộ Thể (Phím 3)' },
        { icon: 'skill_wd_4', title: 'Vạn Kiếm Quy Tông Diệt Tuyệt (Phím 4)' }
      ],
      buddha: [
        { icon: 'skill_sl_1', title: 'Kim Cang Phục Ma Chưởng (Phím 1)' },
        { icon: 'skill_sl_2', title: 'Phạn Thiên Đại Bi Chú (Phím 2)' },
        { icon: 'skill_sl_3', title: 'Bồ Đề Kim Thân Bất Diệt (Phím 3)' },
        { icon: 'skill_sl_4', title: 'Như Lai Thần Chưởng Trảm Ma (Phím 4)' }
      ],
      demon: [
        { icon: 'skill_8', title: 'Huyết Sát Ma Kiếm (Phím 1)' },
        { icon: 'skill_5', title: 'Thôn Thiên Ma Công (Phím 2)' },
        { icon: 'skill_6', title: 'Ma Thần Bất Tử Thân (Phím 3)' },
        { icon: 'skill_2', title: 'Vạn Ma Phần Thiên Diệt Thế (Phím 4)' }
      ],
      beast: [
        { icon: 'skill_9', title: 'Thái Cổ Long Trảo (Phím 1)' },
        { icon: 'skill_7', title: 'Thiên Hồ Ảo Ảnh Trận (Phím 2)' },
        { icon: 'skill_3', title: 'Vạn Độc Hủ Cốt Yên (Phím 3)' },
        { icon: 'skill_1', title: 'Yêu Hoàng Thức Tỉnh (Phím 4)' }
      ]
    };
    const activeKey = cultivSect || sect;
    const sList = sectIcons[activeKey] || sectIcons.huashan;
    for (let i = 1; i <= 4; i++) {
      const slotEl = document.getElementById(`skill-slot-${i}`);
      if (slotEl) {
        const item = sList[i - 1];
        const img = slotEl.querySelector('.skill-icon');
        if (img) img.src = `assets/icons/${item.icon}.png`;
        slotEl.title = item.title;
        const castSkill = (e) => {
          if (e && e.type === 'touchstart') e.preventDefault();
          const myPlayer = latestWorldState.players[myPlayerId];
          if (!myPlayer) return;
          const sIds = myPlayer.cultivSect ? {
            dao: ['tt_1', 'tt_2', 'tt_3', 'tt_4'],
            buddha: ['pt_1', 'pt_2', 'pt_3', 'pt_4'],
            demon: ['um_1', 'um_2', 'um_3', 'um_4'],
            beast: ['vy_1', 'vy_2', 'vy_3', 'vy_4']
          }[myPlayer.cultivSect] : {
            huashan: ['hs_1', 'hs_2', 'hs_3', 'hs_4'],
            xiaoyao: ['xy_1', 'xy_2', 'xy_3', 'xy_4'],
            shaolin: ['sl_1', 'sl_2', 'sl_3', 'sl_4'],
            wudang: ['wd_1', 'wd_2', 'wd_3', 'wd_4']
          }[myPlayer.sect] || ['hs_1', 'hs_2', 'hs_3', 'hs_4'];

          let targetX = mouseWorldPos.x;
          let targetY = mouseWorldPos.y;
          if (latestWorldState && latestWorldState.monsters) {
            let closest = null;
            let minD = 480;
            for (const m of Object.values(latestWorldState.monsters)) {
              if (m.isDead || m.mapId !== currentMapId) continue;
              const d = Math.hypot(m.x - myPlayer.x, m.y - myPlayer.y);
              if (d < minD) {
                minD = d;
                closest = m;
              }
            }
            if (closest) {
              targetX = closest.x;
              targetY = closest.y;
            }
          }
          socket.emit('cast_skill', {
            skillId: sIds[i - 1],
            x: targetX,
            y: targetY
          });
        };
        slotEl.onclick = castSkill;
        slotEl.addEventListener('touchstart', castSkill, { passive: false });
      }
    }

    const dashSlot = document.getElementById('skill-slot-dash');
    if (dashSlot && !dashSlot._hasTouchBind) {
      dashSlot._hasTouchBind = true;
      const doDash = (e) => {
        if (e && e.type === 'touchstart') e.preventDefault();
        const myPlayer = latestWorldState.players[myPlayerId];
        if (!myPlayer) return;
        socket.emit('cast_skill', {
          skillId: 'dash',
          x: mouseWorldPos.x,
          y: mouseWorldPos.y
        });
      };
      dashSlot.onclick = doDash;
      dashSlot.addEventListener('touchstart', doDash, { passive: false });
    }
  }

  function setupSocketHandlers() {
    socket.on('game_init', (data) => {
      myPlayerId = data.playerId;
      window.myPlayerId = myPlayerId;
      mapsData = data.mapsData || {};
      npcsData = data.npcsData || {};
      currentMapId = data.currentMap || 'lac_duong';

      uiManager.setInitData(data.skillsData, data.itemsData, mapsData);
      uiManager.updatePlayerHUD(data.playerState);
      updateHotbarSectIcons(data.playerState.sect, data.playerState.cultivSect);

      camera.worldWidth = data.worldWidth;
      camera.worldHeight = data.worldHeight;
      camera.x = data.playerState.x;
      camera.y = data.playerState.y;

      particleSystem.initMapParticles(currentMapId);

      // Chuyển sang màn hình chơi game
      const loginScreen = document.getElementById('screen-login');
      const gameScreen = document.getElementById('screen-game');
      if (loginScreen) loginScreen.style.display = 'none';
      if (gameScreen) gameScreen.style.display = 'block';

      audioEngine.resume();
      audioEngine.playLevelUp();
      audioEngine.startBGM();

      isGameStarted = true;
      window.latestWorldState = latestWorldState;
      requestAnimationFrame(gameLoop);
    });

    socket.on('npc_action_result', (res) => {
      if (res && res.success) {
        audioEngine.playLevelUp();
        if (uiManager.activeModal === 'enhance') {
          uiManager.openEnhanceModal();
        }
      } else {
        audioEngine.playImpact();
      }
    });

    socket.on('map_changed', (data) => {
      currentMapId = data.mapId;
      if (data.mapInfo) {
        mapsData[data.mapId] = data.mapInfo;
        camera.worldWidth = data.mapInfo.width || 2800;
        camera.worldHeight = data.mapInfo.height || 1800;
      } else if (mapsData && mapsData[data.mapId]) {
        camera.worldWidth = mapsData[data.mapId].width || 2800;
        camera.worldHeight = mapsData[data.mapId].height || 1800;
      } else {
        camera.worldWidth = 2800;
        camera.worldHeight = 1800;
      }
      if (typeof data.x === 'number' && !isNaN(data.x)) {
        camera.x = data.x;
        camera.targetX = data.x;
      }
      if (typeof data.y === 'number' && !isNaN(data.y)) {
        camera.y = data.y;
        camera.targetY = data.y;
      }
      particleSystem.initMapParticles(data.mapId);
      audioEngine.playDash();
    });

    socket.on('spin_wheel_result', (res) => {
      uiManager.handleSpinResult(res);
      if (res && res.success) {
        setTimeout(() => {
          const myPlayer = latestWorldState.players[myPlayerId];
          const px = myPlayer ? myPlayer.x : camera.x;
          const py = myPlayer ? myPlayer.y - 35 : camera.y - 35;
          particleSystem.addConfetti(px, py);
        }, 5500);
      }
    });

    socket.on('world_state', (state) => {
      latestWorldState = state;
      window.latestWorldState = state;
      if (state.npcs) npcsData = state.npcs;
      const myPlayer = state.players[myPlayerId];
      if (myPlayer) {
        currentMapId = myPlayer.currentMap || currentMapId;
        uiManager.updatePlayerHUD(myPlayer);

        if (myPlayer.hp <= 0) {
          document.getElementById('modal-death').classList.add('active');
        }
      }
      uiManager.updateBossBar(state.monsters);
    });

    socket.on('skill_cast', (data) => {
      if (data.mapId && data.mapId !== currentMapId) return;
      if (data.type === 'projectile') {
        audioEngine.playSwordAura();
        const p = latestWorldState.players[data.playerId];
        const px = p ? p.x : data.x;
        const py = p ? p.y : data.y;
        particleSystem.addSparks(px, py, data.color || '#38bdf8', 14);
      } else if (data.type === 'aoe') {
        audioEngine.playImpact();
        if (data.skillId === 'hs_2') {
          particleSystem.addSwordStorm(data.x, data.y, data.radius);
          camera.shake(8, 200);
        } else if (data.skillId === 'xy_2') {
          particleSystem.addVortex(data.x, data.y, data.radius);
          camera.shake(6, 180);
        } else if (data.skillId === 'sl_2') {
          particleSystem.addBuddhaAura(data.x, data.y, data.radius || 230);
          camera.shake(12, 280);
        } else if (data.skillId === 'wd_2') {
          particleSystem.addWudangSwordStorm(data.x, data.y, data.radius || 220, '#0284c7', 28);
          camera.shake(9, 220);
        }
      } else if (data.type === 'buff') {
        audioEngine.playSwordDraw();
        const p = latestWorldState.players[data.playerId];
        if (p) {
          if (data.skillId === 'xy_3') {
            particleSystem.addTaijiFormation(p.x, p.y, 160);
          } else if (data.skillId === 'sl_3') {
            particleSystem.addGoldenBell(p.x, p.y, 120);
          } else if (data.skillId === 'wd_3') {
            particleSystem.addManaShield(p.x, p.y, 125);
          } else if (data.skillId === 'hs_3') {
            particleSystem.addSparks(p.x, p.y, '#a855f7', 24);
          }
        }
      } else if (data.type === 'ultimate') {
        audioEngine.playSwordSlash();
        audioEngine.playImpact();
        camera.shake(18, 380);
        if (data.skillId === 'sl_4') {
          particleSystem.addLionRoar(data.startX, data.startY, 340);
        } else if (data.skillId === 'wd_4') {
          particleSystem.addWudangSwordStorm(data.startX, data.startY, 360, '#06b6d4', 45, 2.5);
        } else if (data.skillId === 'hs_4' || data.skillId === 'xy_4') {
          particleSystem.addSparks(data.startX, data.startY, data.color || '#60a5fa', 30);
        }
      }
    });

    socket.on('normal_attack', (data) => {
      if (data.mapId && data.mapId !== currentMapId) return;
      if (data.hit) audioEngine.playMetalClash();
      else audioEngine.playSwordSlash();
    });

    socket.on('boss_skill_cast', (data) => {
      if (data.mapId && data.mapId !== currentMapId) return;
      audioEngine.playImpact();
      camera.shake(18, 400);
      particleSystem.addBossWave(data.x, data.y, data.targetX, data.targetY);
    });

    socket.on('damage_popup', (data) => {
      if (data.mapId && data.mapId !== currentMapId) return;
      particleSystem.addDamagePopup(data.x, data.y, data.damage, data.isCrit, data.dodged, data.isPlayer);
      if (data.isCrit) {
        if (data.isPlayer) {
          camera.shake(8, 200);
        }
        particleSystem.addSparks(data.x, data.y, '#f59e0b', 16);
      }
    });

    socket.on('item_picked', (data) => {
      if (data.playerId === myPlayerId) {
        audioEngine.playLoot();
      }
    });

    socket.on('player_levelup', (data) => {
      if (data.playerId === myPlayerId) {
        audioEngine.playLevelUp();
        camera.shake(10, 300);
      }
    });

    socket.on('chat_message', (msg) => {
      uiManager.addChatMessage(msg.sender, msg.message, msg.channel || 'world', msg);
    });

    socket.on('notice', (notice) => {
      if (!notice) return;
      const msg = typeof notice === 'string' ? notice : (notice.msg || notice.message || notice.text);
      if (!msg || typeof msg !== 'string' || msg === 'undefined') return;
      uiManager.addChatMessage('Hệ Thống', msg, 'system');
      showTopNoticeBanner(msg, notice.type || 'info');
    });

    // KẾT QUẢ GIÁM ĐỊNH TRANG BỊ
    socket.on('appraise_result', (res) => {
      if (res && res.success) {
        audioEngine.playLevelUp();
        uiManager.addChatMessage('Hệ Thống', `✓ ${res.message || 'Giám định thần binh thành công!'}`, 'system');
        showTopNoticeBanner(res.message || 'Giám Định Thành Công!', 'success');
        if (uiManager.activeModal === 'inventory') uiManager.renderInventory();
      } else {
        audioEngine.playImpact();
        uiManager.addChatMessage('Hệ Thống', `⚠ ${res.message || 'Giám định thất bại!'}`, 'system');
      }
    });

    // KẾT QUẢ CƯỜNG HÓA THẦN BINH (+1 ~ +15)
    socket.on('enhance_result', (res) => {
      const text = (res && (res.message || res.msg)) || (res && res.success ? 'Cường hóa thành công!' : 'Cường hóa thất bại!');
      if (res && res.success) {
        audioEngine.playLevelUp();
        uiManager.addChatMessage('Hệ Thống', `🎉 ${text}`, 'system');
        showTopNoticeBanner(text, 'success');
        if (res.newLevel >= 10 || res.level >= 10) {
          const myPlayer = latestWorldState.players[myPlayerId];
          const px = myPlayer ? myPlayer.x : camera.x;
          const py = myPlayer ? myPlayer.y - 35 : camera.y - 35;
          particleSystem.addConfetti(px, py);
          camera.shake(12, 300);
        }
      } else {
        audioEngine.playImpact();
        uiManager.addChatMessage('Hệ Thống', `✖ ${text}`, 'system');
        showTopNoticeBanner(text, 'warning');
      }
      if (uiManager.activeModal === 'forge') uiManager.renderForgeEnhanceTab();
      if (uiManager.activeModal === 'inventory') uiManager.renderInventory();
    });

    // KẾT QUẢ ĐỤC LỖ TRANG BỊ
    socket.on('socket_result', (res) => {
      const text = (res && (res.message || res.msg)) || (res && res.success ? 'Đục lỗ thành công!' : 'Đục lỗ thất bại!');
      if (res && res.success) {
        audioEngine.playMetalClash();
        uiManager.addChatMessage('Hệ Thống', `✓ ${text}`, 'system');
        showTopNoticeBanner(text, 'success');
      } else {
        audioEngine.playImpact();
        uiManager.addChatMessage('Hệ Thống', `⚠ ${text}`, 'system');
      }
      if (uiManager.activeModal === 'forge') uiManager.renderForgeSocketTab();
      if (uiManager.activeModal === 'inventory') uiManager.renderInventory();
    });

    // KẾT QUẢ KHẢM NGỌC
    socket.on('embed_gem_result', (res) => {
      const text = (res && (res.message || res.msg)) || (res && res.success ? 'Khảm ngọc thành công!' : 'Khảm ngọc thất bại!');
      if (res && res.success) {
        audioEngine.playLevelUp();
        uiManager.addChatMessage('Hệ Thống', `💎 ${text}`, 'system');
        showTopNoticeBanner(text, 'success');
      } else {
        audioEngine.playImpact();
        uiManager.addChatMessage('Hệ Thống', `⚠ ${text}`, 'system');
      }
      if (uiManager.activeModal === 'forge') uiManager.renderForgeSocketTab();
      if (uiManager.activeModal === 'inventory') uiManager.renderInventory();
    });

    // KẾT QUẢ THÁO NGỌC
    socket.on('remove_gem_result', (res) => {
      const text = (res && (res.message || res.msg)) || (res && res.success ? 'Tháo ngọc thành công!' : 'Tháo ngọc thất bại!');
      if (res && res.success) {
        audioEngine.playLoot();
        uiManager.addChatMessage('Hệ Thống', `✓ ${text}`, 'system');
      } else {
        audioEngine.playImpact();
        uiManager.addChatMessage('Hệ Thống', `⚠ ${text}`, 'system');
      }
      if (uiManager.activeModal === 'forge') uiManager.renderForgeSocketTab();
      if (uiManager.activeModal === 'inventory') uiManager.renderInventory();
    });

    // KẾT QUẢ GHÉP NGỌC (3 LÊN 1)
    socket.on('combine_gems_result', (res) => {
      const text = (res && (res.message || res.msg)) || (res && res.success ? 'Ghép ngọc thành công!' : 'Ghép ngọc thất bại!');
      if (res && res.success) {
        audioEngine.playLevelUp();
        uiManager.addChatMessage('Hệ Thống', `🔮 ${text}`, 'system');
        showTopNoticeBanner(text, 'success');
      } else {
        audioEngine.playImpact();
        uiManager.addChatMessage('Hệ Thống', `⚠ ${text}`, 'system');
      }
      if (uiManager.activeModal === 'forge') uiManager.renderForgeCombineTab();
      if (uiManager.activeModal === 'inventory') uiManager.renderInventory();
    });
  }

  function showTopNoticeBanner(msg, type) {
    const banner = document.getElementById('wuxia-top-banner');
    if (!banner) return;
    banner.textContent = `❖ ${msg} ❖`;
    banner.className = `wuxia-banner banner-${type} show`;
    setTimeout(() => {
      banner.classList.remove('show');
    }, 4500);
  }

  function handleAutoCombat(myPlayer) {
    if (!isAutoCombat || !myPlayer || myPlayer.hp <= 0) return;

    // 1. TỰ ĐỘNG NHẶT ĐỒ (TUÂN THỦ 100% BỘ LỌC LOOT FILTER CỦA NGƯỜI CHƠI)
    if (latestWorldState.droppedItems && latestWorldState.droppedItems.length > 0) {
      const lf = myPlayer.lootFilter || { minRarity: 'common', allowEquip: true, allowPotion: true, allowGemCharm: true };
      const rVal = { common: 1, uncommon: 2, rare: 3, epic: 4, legendary: 5, mythic: 6, celestial: 7, abyssal: 8, platinum: 9 };
      const minFilterVal = rVal[lf.minRarity] || 1;

      const mapDrops = latestWorldState.droppedItems.filter(d => {
        if (d.mapId !== currentMapId) return false;
        if (d.ignoredByAuto) return false;

        // Kiểm tra loại vật phẩm
        if (d.isEquipment) {
          if (!lf.allowEquip) return false;
          const itVal = rVal[d.rarity] || 1;
          if (itVal < minFilterVal) return false; // Đồ bị lọc bỏ -> Không nhặt!
        } else if (d.itemId === 'item_5' || d.itemId === 'item_6') {
          if (!lf.allowPotion) return false;
        } else {
          if (!lf.allowGemCharm) return false;
        }
        return true;
      });

      if (mapDrops.length > 0) {
        mapDrops.sort((a, b) => {
          const da = Math.hypot(a.x - myPlayer.x, a.y - myPlayer.y);
          const db = Math.hypot(b.x - myPlayer.x, b.y - myPlayer.y);
          return da - db;
        });

        const nearestDrop = mapDrops[0];
        const dist = Math.hypot(nearestDrop.x - myPlayer.x, nearestDrop.y - myPlayer.y);

        if (dist <= 160) {
          socket.emit('pickup_item', { dropId: nearestDrop.id });
          nearestDrop.tryCount = (nearestDrop.tryCount || 0) + 1;
          if (nearestDrop.tryCount >= 3) nearestDrop.ignoredByAuto = true;
          return;
        } else if (dist <= 750) {
          const now = Date.now();
          if (now - lastAutoCombatMoveTime > 300) {
            lastAutoCombatMoveTime = now;
            socket.emit('move_to', { x: nearestDrop.x, y: nearestDrop.y });
          }
          return;
        }
      }
    }

    // Tự động cắn dược cứu mạng khi khí huyết dưới 45%
    const chkPotion = document.getElementById('chk-auto-potion');
    if (chkPotion && chkPotion.checked) {
      const maxHp = myPlayer.maxHp || 1000;
      if (myPlayer.hp / maxHp < 0.45) {
        if (!window.lastAutoPotionHp || Date.now() - window.lastAutoPotionHp > 1400) {
          window.lastAutoPotionHp = Date.now();
          socket.emit('quick_potion', { type: 'hp' });
        }
      }
    }

    // 2. Tìm quái chiến đấu: KHÓA MỤC TIÊU VÀ ĐÁNH ĐẾN KHI TIÊU DIỆT (CHỐNG GIẬT LAG / SPAM PACKET)
    let targetMonster = null;
    if (autoCombatTargetId && latestWorldState.monsters[autoCombatTargetId]) {
      const cur = latestWorldState.monsters[autoCombatTargetId];
      if (cur.state !== 'dead' && (!cur.mapId || cur.mapId === currentMapId)) {
        const d = Math.hypot(cur.x - myPlayer.x, cur.y - myPlayer.y);
        if (d <= 950) {
          targetMonster = cur;
        }
      }
    }

    if (!targetMonster) {
      let targetDist = Infinity;
      // Ưu tiên 1: Boss Thế Giới hoặc Boss Nguyên Hồn trên map
      for (const m of Object.values(latestWorldState.monsters)) {
        if (m.state === 'dead' || (m.mapId && m.mapId !== currentMapId)) continue;
        if (m.isBoss || m.isRevenantBoss) {
          targetMonster = m;
          targetDist = Math.hypot(m.x - myPlayer.x, m.y - myPlayer.y);
          break;
        }
      }

      // Ưu tiên 2: Quái Tinh Anh (Elite)
      if (!targetMonster) {
        for (const m of Object.values(latestWorldState.monsters)) {
          if (m.state === 'dead' || (m.mapId && m.mapId !== currentMapId)) continue;
          if (m.isElite) {
            const d = Math.hypot(m.x - myPlayer.x, m.y - myPlayer.y);
            if (d < targetDist) {
              targetDist = d;
              targetMonster = m;
            }
          }
        }
      }

      // Ưu tiên 3: Quái thường gần nhất trong bán kính 850px
      if (!targetMonster) {
        let minDist = 850;
        for (const m of Object.values(latestWorldState.monsters)) {
          if (m.state === 'dead' || (m.mapId && m.mapId !== currentMapId)) continue;
          const d = Math.hypot(m.x - myPlayer.x, m.y - myPlayer.y);
          if (d < minDist) {
            minDist = d;
            targetMonster = m;
            targetDist = d;
          }
        }
      }
      autoCombatTargetId = targetMonster ? targetMonster.id : null;
    }

    if (targetMonster) {
      const now = Date.now();
      const curDist = Math.hypot(targetMonster.x - myPlayer.x, targetMonster.y - myPlayer.y);
      if (curDist > 115) {
        if (now - lastAutoCombatMoveTime > 300) {
          lastAutoCombatMoveTime = now;
          socket.emit('move_to', { x: targetMonster.x, y: targetMonster.y });
        }
      } else {
        if (now - lastAutoCombatAttackTime > 260) {
          lastAutoCombatAttackTime = now;
          // TUNG KỸ NĂNG: ƯU TIÊN KỸ NĂNG THẦN THÔNG TU TIÊN NẾU ĐÃ CHUYỂN PHÁI!
          let activeSkills = ['hs_1', 'hs_2', 'hs_4'];
          if (myPlayer.cultivSect === 'dao') activeSkills = ['tt_1', 'tt_2', 'tt_3', 'tt_4'];
          else if (myPlayer.cultivSect === 'buddha') activeSkills = ['pt_1', 'pt_2', 'pt_3', 'pt_4'];
          else if (myPlayer.cultivSect === 'demon') activeSkills = ['um_1', 'um_2', 'um_3', 'um_4'];
          else if (myPlayer.cultivSect === 'beast') activeSkills = ['vy_1', 'vy_2', 'vy_3', 'vy_4'];
          else if (myPlayer.sect === 'xiaoyao') activeSkills = ['xy_1', 'xy_2', 'xy_4'];
          else if (myPlayer.sect === 'shaolin') activeSkills = ['sl_1', 'sl_2', 'sl_4'];
          else if (myPlayer.sect === 'wudang') activeSkills = ['wd_1', 'wd_2', 'wd_4'];

          const randomSkill = activeSkills[Math.floor(Math.random() * activeSkills.length)];
          if (Math.random() < 0.5 && myPlayer.mp > 40) {
            socket.emit('cast_skill', {
              skillId: randomSkill,
              x: targetMonster.x,
              y: targetMonster.y
            });
          } else {
            socket.emit('normal_attack', { x: targetMonster.x, y: targetMonster.y });
          }
        }
      }
    }
  }

  function handleKeyboardMovement(myPlayer) {
    if (!myPlayer || myPlayer.hp <= 0) return;
    let dx = 0, dy = 0;
    if (keysDown['KeyW'] || keysDown['ArrowUp']) dy -= 1;
    if (keysDown['KeyS'] || keysDown['ArrowDown']) dy += 1;
    if (keysDown['KeyA'] || keysDown['ArrowLeft']) dx -= 1;
    if (keysDown['KeyD'] || keysDown['ArrowRight']) dx += 1;

    if (dx !== 0 || dy !== 0) {
      const step = 150;
      const targetX = myPlayer.x + dx * step;
      const targetY = myPlayer.y + dy * step;
      socket.emit('move_to', { x: targetX, y: targetY });
    }
  }

  // GAME LOOP 60 FPS (BẢO VỆ TUYỆT ĐỐI KHÔNG BAO GIỜ CRASH)
  function gameLoop(now) {
    try {
      const dt = Math.min(0.1, (now - lastFrameTime) / 1000);
      lastFrameTime = now;

      const myPlayer = latestWorldState.players[myPlayerId];

      if (myPlayer) {
        camera.follow(myPlayer.x, myPlayer.y);
        handleKeyboardMovement(myPlayer);
        handleAutoCombat(myPlayer);

        // Tự động nhặt khi đã di chuyển tới gần món đồ được click
        if (pendingPickupDropId && latestWorldState.droppedItems) {
          const targetDrop = latestWorldState.droppedItems.find(d => d.id === pendingPickupDropId);
          if (targetDrop && targetDrop.mapId === currentMapId) {
            const d = Math.hypot(targetDrop.x - myPlayer.x, targetDrop.y - myPlayer.y);
            if (d <= 160) {
              socket.emit('pickup_item', { dropId: pendingPickupDropId });
              pendingPickupDropId = null;
            }
          } else {
            pendingPickupDropId = null;
          }
        }
      }

      camera.update(dt);
      particleSystem.update(dt);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 1. Vẽ Map
      renderer.renderMap(camera, currentMapId, mapsData);

      // 2. Vẽ Hiệu ứng mặt đất
      particleSystem.renderGroundEffects(ctx, camera);

      // 3. Vẽ Các Cao Nhân NPC Trong Thành
      renderer.renderNPCs(latestWorldState.npcs || npcsData, currentMapId, camera);

      // 4. Vẽ Đồ rơi (Chuẩn 9 Phẩm Cấp & Bạch Kim Chớp Nháy Cầu Vồng)
      renderer.renderDroppedItems(latestWorldState.droppedItems || [], currentMapId, camera);

      // 5. Vẽ Tàn ảnh Khinh công
      particleSystem.renderAfterImages(ctx, camera);

      // 6. Vẽ Quái vật
      renderer.renderMonsters(latestWorldState.monsters || {}, currentMapId, camera);

      // 6. Vẽ Người chơi
      renderer.renderPlayers(latestWorldState.players || {}, myPlayerId, currentMapId, camera, particleSystem);

      // 7. Vẽ Đạn Kiếm Khí
      renderer.renderProjectiles(latestWorldState.projectiles || [], currentMapId, camera);

      // 8. Vẽ Hiệu ứng trên cao (Hoa đào, tia lửa, số sát thương)
      particleSystem.renderTopEffects(ctx, camera);

      // 9. Vẽ Minimap
      const minimapCanvas = document.getElementById('minimap-canvas');
      if (minimapCanvas && myPlayer) {
        renderer.renderMinimap(
          minimapCanvas,
          latestWorldState.players,
          latestWorldState.monsters,
          myPlayer,
          currentMapId,
          mapsData
        );
      }
    } catch (loopErr) {
      console.error('Lỗi an toàn gameLoop (đã tự phục hồi):', loopErr);
    } finally {
      requestAnimationFrame(gameLoop);
    }
  }

  window.addEventListener('DOMContentLoaded', init);
})();
