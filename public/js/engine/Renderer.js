// Engine Đồ Họa Kiếm Hiệp Canvas 2D Nâng Cấp Toàn Diện - Đa Bản Đồ & Quái Thú Mới

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    
    // Tải toàn bộ kho hình ảnh Assets
    this.assets = {
      worldMap: this.loadImage('assets/images/world_map.jpg'),
      mapPeach: this.loadImage('assets/images/map_peach_island.jpg'),
      mapVolcano: this.loadImage('assets/images/map_demon_volcano.jpg'),
      mapConLon: this.loadImage('assets/images/map_con_lon.jpg'),
      mapHoangSa: this.loadImage('assets/images/map_hoang_sa.jpg'),
      mapThanDien: this.loadImage('assets/images/map_than_dien.jpg'),
      mapAbyss: this.loadImage('assets/images/map_dungeon_abyss.jpg'),
      mapBongLai: this.loadImage('assets/images/map_bong_lai.jpg'),
      mapDaoTri: this.loadImage('assets/images/map_dao_tri.jpg'),
      mapThaiHu: this.loadImage('assets/images/map_thai_hu.jpg?v=20260927_2'),
      
      heroHuashan: this.loadImage('assets/images/hero_huashan.png'),
      heroXiaoyao: this.loadImage('assets/images/hero_xiaoyao.png'),
      heroShaolin: this.loadImage('assets/images/hero_shaolin.png'),
      heroWudang: this.loadImage('assets/images/hero_wudang.png'),
      bossDemon: this.loadImage('assets/images/boss_demon.png'),
      banditMob: this.loadImage('assets/images/bandit_mob.png'),
      beastFox: this.loadImage('assets/images/beast_spirit_fox.png'),
      fireDemon: this.loadImage('assets/images/mob_fire_demon.png'),
      snowBeast: this.loadImage('assets/images/mob_snow_beast.png'),
      desertDemon: this.loadImage('assets/images/mob_desert_demon.png'),
      celestialGuard: this.loadImage('assets/images/mob_celestial_guard.png'),
      
      // Quái & Boss Tu Tiên
      cultivFox: this.loadImage('assets/images/mob_bong_lai_fox.png'),
      bossBongLai: this.loadImage('assets/images/boss_bong_lai.png'),
      cultivSnow: this.loadImage('assets/images/mob_dao_tri_beast.png'),
      bossDaoTri: this.loadImage('assets/images/boss_dao_tri.png'),
      cultivDemon: this.loadImage('assets/images/mob_thai_hu_demon.png'),
      bossThaiHu: this.loadImage('assets/images/boss_thai_hu.png'),
      
      items: {}
    };
    
    for (let i = 1; i <= 9; i++) {
      this.assets.items[`item_${i}`] = this.loadImage(`assets/icons/item_${i}.png`);
      this.assets.items[`equip_${i}`] = this.loadImage(`assets/icons/equip_${i}.png`);
    }

    // Các icons tính năng mới & Tu Tiên Dược Phẩm
    const newIcons = [
      'item_appraisal', 'item_enhance_stone', 'item_protection_charm', 'item_socket_drill',
      'item_reforge', 'item_bell_talisman', 'item_amber_core',
      'gem_ruby', 'gem_sapphire', 'gem_topaz', 'gem_emerald', 'gem_amethyst', 'gem_amber',
      'set_than_long', 'set_bac_minh', 'set_kim_cang',
      'item_tuvi_pill', 'item_lifespan_pill', 'item_breakthrough_pill',
      'wpn_sword', 'arm_robe', 'item_cultiv', 'equip_cloud_boots',
      'sect_cultiv_dao', 'sect_cultiv_buddha', 'sect_cultiv_demon', 'sect_cultiv_beast'
    ];
    for (const icon of newIcons) {
      this.assets.items[icon] = this.loadImage(`assets/icons/${icon}.png`);
    }

    this.loaded = false;
    this.portalPulse = 0;
  }

  loadImage(src) {
    const img = new Image();
    img.src = src;
    return img;
  }

  // Phương thức vẽ ảnh an toàn 100%, chống ngoại lệ InvalidStateError từ Broken Image
  safeDrawImage(ctx, img, dx, dy, dw, dh, fallbackFn = null) {
    if (img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0) {
      try {
        ctx.drawImage(img, dx, dy, dw, dh);
        return true;
      } catch (err) {
        console.warn('Canvas drawImage handled safely:', err);
      }
    }
    if (typeof fallbackFn === 'function') {
      try {
        fallbackFn();
      } catch (e) {}
    }
    return false;
  }

  resize(w, h) {
    this.canvas.width = w;
    this.canvas.height = h;
  }

  drawShadow(x, y, radiusX, radiusY) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    this.ctx.fill();
    this.ctx.restore();
  }

  // Vẽ Bản đồ tương ứng với map hiện tại
  renderMap(camera, currentMap, mapsData) {
    const mapInfo = mapsData[currentMap] || mapsData.lac_duong;
    let mapImg = this.assets.worldMap;
    if (currentMap === 'dao_hoa_dao') mapImg = this.assets.mapPeach;
    else if (currentMap === 'ma_son') mapImg = this.assets.mapVolcano;
    else if (currentMap === 'con_lon') mapImg = this.assets.mapConLon;
    else if (currentMap === 'hoang_sa') mapImg = this.assets.mapHoangSa;
    else if (currentMap === 'than_dien') mapImg = this.assets.mapThanDien;
    else if (currentMap === 'dungeon_abyss') mapImg = this.assets.mapAbyss;
    else if (currentMap === 'map_bong_lai') mapImg = this.assets.mapBongLai;
    else if (currentMap === 'map_dao_tri') mapImg = this.assets.mapDaoTri;
    else if (currentMap === 'map_thai_hu') mapImg = this.assets.mapThaiHu;

    const screenTL = camera.worldToScreen(0, 0);
    const drew = this.safeDrawImage(this.ctx, mapImg, screenTL.x, screenTL.y, mapInfo.width, mapInfo.height);
    if (!drew) {
      // Fallback tiên cảnh gradient theo từng map
      const grad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
      if (currentMap === 'map_bong_lai') {
        grad.addColorStop(0, '#064e3b');
        grad.addColorStop(0.5, '#065f46');
        grad.addColorStop(1, '#047857');
      } else if (currentMap === 'map_dao_tri') {
        grad.addColorStop(0, '#0c4a6e');
        grad.addColorStop(0.5, '#0284c7');
        grad.addColorStop(1, '#0369a1');
      } else if (currentMap === 'map_thai_hu') {
        grad.addColorStop(0, '#2e1065');
        grad.addColorStop(0.5, '#581c87');
        grad.addColorStop(1, '#3b0764');
      } else {
        grad.addColorStop(0, '#0f172a');
        grad.addColorStop(1, '#1e293b');
      }
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    // Vẽ Khu An Toàn Trong Thành
    if (mapInfo.safeZone) {
      const sz = camera.worldToScreen(mapInfo.safeZone.minX, mapInfo.safeZone.minY);
      const szW = mapInfo.safeZone.maxX - mapInfo.safeZone.minX;
      const szH = mapInfo.safeZone.maxY - mapInfo.safeZone.minY;
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      this.ctx.lineWidth = 2.5;
      this.ctx.setLineDash([12, 8]);
      this.ctx.strokeRect(sz.x, sz.y, szW, szH);
      this.ctx.font = 'bold 13px "Noto Serif", serif';
      this.ctx.fillStyle = 'rgba(125, 211, 252, 0.85)';
      const safeTitle = currentMap === 'lac_duong' ? '❖ NỘI THÀNH LẠC DƯƠNG (KHU AN TOÀN - MIỄN CHIẾN) ❖' : '❖ DOANH TRẠI TIÊN ĐẠO (KHU AN TOÀN - MIỄN CHIẾN) ❖';
      this.ctx.fillText(safeTitle, sz.x + szW / 2 - 190, sz.y + 26);
      this.ctx.restore();
    }

    // Vẽ Các Cổng Truyền Tống (Portals)
    this.portalPulse += 0.04;
    if (mapInfo.portals) {
      for (const portal of mapInfo.portals) {
        this.renderPortal(portal, camera);
      }
    }
  }

  // Vẽ Cổng Dịch Chuyển phát sáng
  renderPortal(portal, camera) {
    const screen = camera.worldToScreen(portal.x, portal.y);
    const radius = 55 + Math.sin(this.portalPulse) * 8;

    this.ctx.save();
    // Vòng hào quang xanh tím
    const grad = this.ctx.createRadialGradient(screen.x, screen.y, 10, screen.x, screen.y, radius);
    grad.addColorStop(0, 'rgba(168, 85, 247, 0.8)');
    grad.addColorStop(0.5, 'rgba(59, 130, 246, 0.4)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.ctx.fillStyle = grad;
    this.ctx.beginPath();
    this.ctx.arc(screen.x, screen.y, radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Vòng xoay Bát Quái Cổng
    this.ctx.strokeStyle = '#c084fc';
    this.ctx.lineWidth = 2.5;
    this.ctx.shadowColor = '#d8b4fe';
    this.ctx.shadowBlur = 15;
    this.ctx.stroke();

    // Tên cổng
    this.ctx.font = 'bold 13px "Noto Serif", serif';
    this.ctx.fillStyle = '#fde047';
    this.ctx.textAlign = 'center';
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 3;
    this.ctx.strokeText(`🌀 ${portal.name}`, screen.x, screen.y - radius - 8);
    this.ctx.fillText(`🌀 ${portal.name}`, screen.x, screen.y - radius - 8);

    this.ctx.restore();
  }

  // VẼ CÁC NPC TRONG THÀNH LẠC DƯƠNG
  renderNPCs(npcs, currentMap, camera) {
    if (!npcs) return;
    const now = Date.now();
    for (const npc of Object.values(npcs)) {
      if (npc.mapId && npc.mapId !== currentMap) continue;
      const screen = camera.worldToScreen(npc.x, npc.y);
      const size = 76;

      // 1. Bóng đổ
      this.drawShadow(screen.x, screen.y + 32, 26, 11);

      // 2. Vòng Thái Cực Trận Chân Khí dưới chân NPC
      this.ctx.save();
      const rot = (now * 0.0015) % (Math.PI * 2);
      this.ctx.translate(screen.x, screen.y + 26);
      this.ctx.rotate(rot);
      this.ctx.beginPath();
      this.ctx.arc(0, 0, 36, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
      this.ctx.fill();
      this.ctx.strokeStyle = 'rgba(251, 191, 36, 0.65)';
      this.ctx.lineWidth = 1.8;
      this.ctx.setLineDash([8, 6]);
      this.ctx.stroke();
      this.ctx.restore();

      // 3. Vẽ Sprite NPC
      const spriteImg = (npc.role === 'doctor' || npc.role === 'scripture') 
        ? this.assets.heroXiaoyao 
        : this.assets.heroHuashan;

      this.ctx.save();
      this.ctx.translate(screen.x, screen.y);
      this.safeDrawImage(this.ctx, spriteImg, -size / 2, -size / 2, size, size, () => {
        // Fallback bóng dáng hiệp khách nếu ảnh chưa sẵn sàng
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
        this.ctx.fillStyle = '#38bdf8';
        this.ctx.fill();
      });
      this.ctx.restore();

      // 4. Danh hiệu & Tên NPC
      this.ctx.save();
      this.ctx.textAlign = 'center';
      
      // Danh hiệu vàng kim
      this.ctx.font = 'bold 11px "Noto Serif", serif';
      this.ctx.fillStyle = '#fde047';
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2.5;
      const titleText = `【${npc.title || 'Cao Nhân'}】`;
      this.ctx.strokeText(titleText, screen.x, screen.y - 56);
      this.ctx.fillText(titleText, screen.x, screen.y - 56);

      // Tên NPC
      this.ctx.font = 'bold 13px "Noto Serif", serif';
      this.ctx.fillStyle = '#67e8f9';
      this.ctx.lineWidth = 3;
      this.ctx.strokeText(npc.name, screen.x, screen.y - 40);
      this.ctx.fillText(npc.name, screen.x, screen.y - 40);

      // Nút nhắc nhở tương tác [E]
      const pulseE = 0.85 + Math.sin(now * 0.006) * 0.15;
      this.ctx.font = 'bold 11px "Noto Sans", sans-serif';
      this.ctx.fillStyle = `rgba(255, 255, 255, ${pulseE})`;
      this.ctx.strokeStyle = '#000';
      this.ctx.lineWidth = 2.5;
      this.ctx.strokeText('[ Phím E: Trò Chuyện ]', screen.x, screen.y - 25);
      this.ctx.fillText('[ Phím E: Trò Chuyện ]', screen.x, screen.y - 25);

      this.ctx.restore();
    }
  }

  // VẼ RƠI ĐỒ (9 CẤP BẬC PHẨM CẤP & BẠCH KIM CHÍ TÔN CHỚP NHÁY)
  renderDroppedItems(items, currentMap, camera) {
    const now = Date.now();
    for (const item of items) {
      if (item.mapId && item.mapId !== currentMap) continue;
      const screen = camera.worldToScreen(item.x, item.y);
      const bob = Math.sin(now * 0.005 + item.x) * 6;

      // Tìm icon
      let iconKey = item.itemId;
      if (item.icon) {
        iconKey = item.icon.replace('.png', '');
      } else if (item.itemInstance && item.itemInstance.icon) {
        iconKey = item.itemInstance.icon.replace('.png', '');
      } else if (item.itemInstance && item.itemInstance.itemId) {
        iconKey = item.itemInstance.itemId;
      }
      const iconImg = this.assets.items[iconKey] || this.assets.items.item_1;

      // Màu sắc phẩm cấp
      const rarityColors = {
        common: '#e2e8f0',
        uncommon: '#4ade80',
        rare: '#38bdf8',
        epic: '#c084fc',
        legendary: '#fbbf24',
        mythic: '#fb923c',
        celestial: '#f87171',
        abyssal: '#a855f7',
        platinum: '#ffffff'
      };
      const baseColor = item.rarityColor || rarityColors[item.rarity] || '#fbbf24';

      this.ctx.save();

      // CỘT SÁNG CHIẾU TỪ TRỜI XUỐNG
      const colH = (item.rarity === 'platinum' || item.rarity === 'celestial') ? 110 : 75;
      const grad = this.ctx.createLinearGradient(screen.x, screen.y + bob, screen.x, screen.y - colH);

      if (item.rarity === 'platinum' || item.isShimmering) {
        // Cầu vồng Bạch Kim biến thiên màu liên tục
        const hue = (now * 0.12) % 360;
        grad.addColorStop(0, `hsla(${hue}, 100%, 75%, 0.85)`);
        grad.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 100%, 80%, 0.5)`);
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      } else {
        grad.addColorStop(0, baseColor);
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      }

      this.ctx.fillStyle = grad;
      this.ctx.fillRect(screen.x - 14, screen.y - colH, 28, colH + bob);

      // Hiệu ứng hạt sao lấp lánh cho đồ Bạch Kim / Thần Thoại
      if (item.rarity === 'platinum' || item.rarity === 'celestial' || item.isShimmering) {
        for (let s = 0; s < 4; s++) {
          const sAngle = (now * 0.004 + s * (Math.PI / 2)) % (Math.PI * 2);
          const sDist = 22 + Math.sin(now * 0.008 + s) * 8;
          const sx = screen.x + Math.cos(sAngle) * sDist;
          const sy = screen.y + bob + Math.sin(sAngle) * (sDist * 0.6);
          this.ctx.fillStyle = '#ffffff';
          this.ctx.beginPath();
          this.ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
          this.ctx.fill();
        }
      }

      // Bóng dưới chân
      this.drawShadow(screen.x, screen.y + 14, 16, 7);

      // Vòng hào quang xoay chớp tắt cho đồ Tu Tiên rơi trên mặt đất
      const isCultiv = item.isCultivGear || (item.itemInstance && item.itemInstance.isCultivGear);
      if (isCultiv) {
        this.ctx.save();
        const oRot = (now * 0.003) % (Math.PI * 2);
        this.ctx.translate(screen.x, screen.y + 14);
        this.ctx.rotate(oRot);
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, 24, 11, 0, 0, Math.PI * 2);
        const aColor = item.orbitColor || (item.itemInstance && item.itemInstance.orbitColor) || '#ffd700';
        this.ctx.strokeStyle = aColor;
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([6, 4]);
        this.ctx.shadowColor = aColor;
        this.ctx.shadowBlur = 12;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Icon vật phẩm an toàn tuyệt đối
      this.safeDrawImage(this.ctx, iconImg, screen.x - 20, screen.y - 20 + bob, 40, 40, () => {
        // Fallback: Hình thoi ngọc bảo kiếm hiệp phát sáng theo màu phẩm cấp
        this.ctx.save();
        this.ctx.translate(screen.x, screen.y + bob);
        this.ctx.rotate(Math.PI / 4);
        this.ctx.fillStyle = baseColor;
        this.ctx.fillRect(-12, -12, 24, 24);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        this.ctx.strokeRect(-12, -12, 24, 24);
        this.ctx.restore();
      });

      // Viền phát sáng xung quanh icon
      this.ctx.strokeStyle = (item.rarity === 'platinum' || item.isShimmering) 
        ? `hsl(${(now * 0.15) % 360}, 100%, 70%)` 
        : baseColor;
      this.ctx.lineWidth = 1.8;
      this.ctx.strokeRect(screen.x - 20, screen.y - 20 + bob, 40, 40);

      // Tên vật phẩm nổi phía trên
      const itemName = item.name || (item.itemInstance ? item.itemInstance.name : 'Bảo Vật');
      this.ctx.font = 'bold 11px "Noto Serif", serif';
      this.ctx.textAlign = 'center';
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 3;
      this.ctx.strokeText(itemName, screen.x, screen.y - 28 + bob);
      this.ctx.fillStyle = (item.rarity === 'platinum' || item.isShimmering) 
        ? `hsl(${(now * 0.15) % 360}, 100%, 75%)` 
        : baseColor;
      this.ctx.fillText(itemName, screen.x, screen.y - 28 + bob);

      this.ctx.restore();
    }
  }

  // Vẽ Quái Vật theo bản đồ hiện tại
  renderMonsters(monsters, currentMap, camera) {
    const now = Date.now();
    for (const m of Object.values(monsters)) {
      if (m.state === 'dead' || (m.mapId && m.mapId !== currentMap)) continue;
      const screen = camera.worldToScreen(m.x, m.y);
      const size = m.size || 70;

      // 1. Bóng đổ dưới chân
      this.drawShadow(screen.x, screen.y + size * 0.38, size * 0.36, size * 0.16);

      // 2. MA KHÍ BÁT QUÁI DƯỚI CHÂN BOSS HOẶC QUÁI TINH ANH
      // 2. MA KHÍ BÁT QUÁI DƯỚI CHÂN BOSS HOẶC QUÁI TINH ANH
      if (m.isBoss) {
        this.ctx.save();
        const rot = (now * (m.isRevenantBoss ? 0.0035 : 0.002)) % (Math.PI * 2);
        this.ctx.translate(screen.x, screen.y + size * 0.35);
        this.ctx.rotate(rot);
        
        // Hào quang ma tộc đỏ - tím bốc lên (Nguyên Hồn Ác Hóa hoặc Boss Tu Tiên Giáng Thế)
        const aRadius = m.isRevenantBoss ? size * 0.95 : (m.isCultivBoss ? size * 0.88 : size * 0.75);
        const grad = this.ctx.createRadialGradient(0, 0, 10, 0, 0, aRadius);
        if (m.isRevenantBoss) {
          grad.addColorStop(0, 'rgba(244, 63, 94, 0.65)');
          grad.addColorStop(0.5, 'rgba(147, 51, 234, 0.55)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else if (m.isCultivBoss) {
          grad.addColorStop(0, 'rgba(168, 85, 247, 0.65)');
          grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.55)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        } else {
          grad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
          grad.addColorStop(0.5, 'rgba(147, 51, 234, 0.35)');
          grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        }
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, aRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = m.isRevenantBoss ? '#f43f5e' : (m.isCultivBoss ? '#38bdf8' : '#ef4444');
        this.ctx.lineWidth = (m.isRevenantBoss || m.isCultivBoss) ? 3.0 : 2.2;
        this.ctx.setLineDash(m.isRevenantBoss ? [16, 6] : (m.isCultivBoss ? [14, 5] : [12, 6]));
        this.ctx.stroke();

        // Vòng nhỏ xoay ngược chiều
        this.ctx.beginPath();
        this.ctx.arc(0, 0, aRadius * 0.55, 0, Math.PI * 2);
        this.ctx.strokeStyle = m.isRevenantBoss ? '#c084fc' : (m.isCultivBoss ? '#facc15' : '#a855f7');
        this.ctx.lineWidth = (m.isRevenantBoss || m.isCultivBoss) ? 2.0 : 1.5;
        this.ctx.setLineDash([6, 6]);
        this.ctx.stroke();

        this.ctx.restore();
      } else if (m.isElite) {
        // HÀO QUANG VÀNG KIM DƯỚI CHÂN QUÁI TINH ANH
        this.ctx.save();
        const rot = (now * 0.003) % (Math.PI * 2);
        this.ctx.translate(screen.x, screen.y + size * 0.35);
        this.ctx.rotate(rot);
        const grad = this.ctx.createRadialGradient(0, 0, 5, 0, 0, size * 0.65);
        grad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
        grad.addColorStop(0.7, 'rgba(234, 179, 8, 0.25)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.65, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.strokeStyle = '#facc15';
        this.ctx.lineWidth = 1.8;
        this.ctx.setLineDash([8, 4]);
        this.ctx.stroke();
        this.ctx.restore();
      }

      this.ctx.save();
      this.ctx.translate(screen.x, screen.y);

      const facingLeft = Math.cos(m.angle) < 0;
      if (facingLeft) this.ctx.scale(-1, 1);

      // NHỊP THỞ TỰ NHIÊN & ĐỘ LẮC LƯ DI CHUYỂN
      const breatheY = 1.0 + Math.sin(now * 0.004 + (m.x % 50)) * 0.04;
      const breatheX = 1.0 + Math.cos(now * 0.004 + (m.x % 50)) * 0.02;
      const walkTilt = Math.sin(now * 0.008 + (m.x % 30)) * 0.04;
      this.ctx.scale(breatheX, breatheY);
      this.ctx.rotate(walkTilt);

      let spriteImg = this.assets.banditMob;
      if (m.isBoss) {
        if (m.id === 'boss_bl_emperor' || m.id === 'boss_cultiv_invader_1') spriteImg = this.assets.bossBongLai;
        else if (m.id === 'boss_dt_queen' || m.id === 'boss_cultiv_invader_2') spriteImg = this.assets.bossDaoTri;
        else if (m.id === 'boss_th_overlord' || m.id === 'boss_cultiv_invader_3') spriteImg = this.assets.bossThaiHu;
        else spriteImg = this.assets.bossDemon;
      }
      else if (m.type === 'spirit_fox') spriteImg = this.assets.beastFox;
      else if (m.type === 'snow_beast') spriteImg = this.assets.snowBeast;
      else if (m.type === 'fire_demon') spriteImg = this.assets.fireDemon;
      else if (m.type === 'desert_demon') spriteImg = this.assets.desertDemon;
      else if (m.type === 'celestial_guard') spriteImg = this.assets.celestialGuard;
      else if (m.type === 'cultiv_fox') spriteImg = this.assets.cultivFox;
      else if (m.type === 'cultiv_snow') spriteImg = this.assets.cultivSnow;
      else if (m.type === 'cultiv_demon') spriteImg = this.assets.cultivDemon;

      if (m.isRevenantBoss) {
        const pulse = 1.0 + Math.sin(Date.now() * 0.006) * 0.08;
        this.ctx.scale(pulse * 1.15, pulse * 1.15);
        this.ctx.shadowColor = '#f43f5e';
        this.ctx.shadowBlur = 25;
        this.ctx.filter = 'drop-shadow(0 0 15px #f43f5e) hue-rotate(290deg)';
      } else if (m.isBoss) {
        const pulse = 1.0 + Math.sin(Date.now() * 0.005) * 0.06;
        this.ctx.scale(pulse, pulse);
      } else if (m.isElite) {
        this.ctx.scale(1.15, 1.15); // Quái tinh anh to hơn
      }
      this.safeDrawImage(this.ctx, spriteImg, -size / 2, -size / 2, size, size, () => {
        // Fallback quái vật nếu ảnh bị lỗi
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
        this.ctx.fillStyle = m.isBoss ? '#ef4444' : (m.isElite ? '#eab308' : '#a855f7');
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      });
      this.ctx.filter = 'none';
      this.ctx.restore();

      // VẼ NGÔI SAO VÀNG CHO QUÁI TINH ANH
      if (m.isElite) {
        this.ctx.save();
        const starRot = (now * 0.004) % (Math.PI * 2);
        this.ctx.translate(screen.x, screen.y - size * 0.72);
        this.ctx.rotate(starRot);
        this.ctx.font = 'bold 18px "Noto Serif", serif';
        this.ctx.fillStyle = '#fde047';
        this.ctx.shadowColor = '#f59e0b';
        this.ctx.shadowBlur = 10;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('★', 0, 0);
        this.ctx.restore();
      }

      let monsterDisplayName = m.isElite ? `★ [Tinh Anh] ${m.name}` : m.name;
      if (m.isRevenantBoss) {
        const rRealm = m.revenantOwnerRealm ? ` [${m.revenantOwnerRealm}]` : '';
        monsterDisplayName = `💀【NGUYÊN HỒN ÁC HÓA】 ${m.revenantOwnerName || m.name}${rRealm}`;
      } else if (m.isBoss && m.bossRarity) {
        const rarityLabels = {
          common: '【Boss Phổ Thông】',
          uncommon: '【Boss Ưu Tú】',
          rare: '【Boss Hiếm】',
          epic: '【Boss Sử Thi】',
          legendary: '【Boss Hoàng Kim】',
          mythic: '【Boss Truyền Thuyết】',
          celestial: '【Boss Thần Thoại】',
          abyssal: '【Boss Ma Thần】',
          platinum: '★【Boss Bạch Kim Chí Tôn】★'
        };
        monsterDisplayName = `${rarityLabels[m.bossRarity] || '【Boss】'} ${m.name}`;
      }
      const monsterBarColor = m.isRevenantBoss ? '#ff0055' : 
        (m.isBoss ? '#ef4444' : 
        (m.isElite ? '#facc15' : 
        (m.type === 'spirit_fox' ? '#67e8f9' : 
        (m.type === 'snow_beast' ? '#38bdf8' : 
        (m.type === 'fire_demon' ? '#f87171' : 
        (m.type === 'desert_demon' ? '#fbbf24' : 
        (m.type === 'celestial_guard' ? '#eab308' : 
        (m.type === 'cultiv_fox' ? '#a7f3d0' : 
        (m.type === 'cultiv_snow' ? '#7dd3fc' : 
        (m.type === 'cultiv_demon' ? '#c084fc' : '#94a3b8'))))))))));

      this.renderEntityHealthBar(
        screen.x,
        screen.y - size * 0.55,
        monsterDisplayName,
        m.hp,
        m.maxHp,
        m.level,
        monsterBarColor,
        m.isBoss || m.isRevenantBoss
      );
    }
  }

  // Vẽ Người Chơi
  renderPlayers(players, myPlayerId, currentMap, camera, particleSystem) {
    const now = Date.now();
    for (const p of Object.values(players)) {
      if (p.hp <= 0 || (p.currentMap && p.currentMap !== currentMap)) continue;
      const screen = camera.worldToScreen(p.x, p.y);
      const isMe = p.id === myPlayerId;
      const size = 80;

      // 1. Bóng đổ
      this.drawShadow(screen.x, screen.y + 32, 24, 10);
      
      let spriteImg = this.assets.heroHuashan;
      if (p.sect === 'xiaoyao') spriteImg = this.assets.heroXiaoyao;
      else if (p.sect === 'shaolin') spriteImg = this.assets.heroShaolin;
      else if (p.sect === 'wudang') spriteImg = this.assets.heroWudang;

      // 2. Khinh công lướt gió (Dash)
      if (p.isDashing && particleSystem) {
        particleSystem.addAfterImage(spriteImg, p.x, p.y, p.angle, size, p.sect);
      }

      // 3. Bụi bước chân khi di chuyển
      if (p.isMoving && particleSystem && Math.random() < 0.28) {
        particleSystem.addRunDust(p.x, p.y + 28);
      }

      // 4. VÒNG HÀO QUANG CẢNH GIỚI CHÂN KHÍ DƯỚI CHÂN
      const realmIdx = typeof p.realmIdx === 'number' ? p.realmIdx : 0;
      this.drawCultivationAura(screen.x, screen.y + 30, realmIdx, now);

      // 5. HIỆU ỨNG THIỀN ĐỊNH ĐẢ TỌA
      if (p.isMeditating) {
        this.ctx.save();
        const rot = (now * 0.002) % (Math.PI * 2);
        this.ctx.translate(screen.x, screen.y + 20);
        this.ctx.rotate(rot);
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 42, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(52, 211, 153, 0.2)';
        this.ctx.fill();
        this.ctx.strokeStyle = '#34d399';
        this.ctx.lineWidth = 2;
        this.ctx.shadowColor = '#6ee7b7';
        this.ctx.shadowBlur = 15;
        this.ctx.stroke();
        this.ctx.restore();
      }

      this.ctx.save();
      this.ctx.translate(screen.x, screen.y);

      const facingLeft = Math.cos(p.angle) < 0;
      if (facingLeft) this.ctx.scale(-1, 1);

      // Nhịp thở người chơi (Subtle breathing)
      const pBreathe = 1.0 + Math.sin(now * 0.004 + (p.x % 40)) * 0.022;
      this.ctx.scale(pBreathe, pBreathe);

      // Khiên hộ thể
      if (p.hasShield) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.54, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(168, 85, 247, 0.2)';
        this.ctx.fill();
        this.ctx.strokeStyle = '#c084fc';
        this.ctx.lineWidth = 2.5;
        this.ctx.shadowColor = '#d8b4fe';
        this.ctx.shadowBlur = 14;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // Vòng tròn chỉ thị bản thân
      if (isMe) {
        this.ctx.save();
        this.ctx.beginPath();
        this.ctx.ellipse(0, 32, 26, 12, 0, 0, Math.PI * 2);
        this.ctx.strokeStyle = '#38bdf8';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        this.ctx.restore();
      }

      // THẦN BINH BẠCH KIM: Kiếm khí ngũ sắc lượn quanh người
      const hasPlatEquip = (p.equipment?.weapon?.rarity === 'platinum') || (p.equipment?.weapon?.isShimmering);
      if (hasPlatEquip) {
        this.drawPlatinumWeaponAura(0, 0, size, now);
      }

      // HÀO QUANG TIÊN ĐẠO XOAY VÒNG QUANH THÂN CHO MÔN PHÁI TU TIÊN HOẶC ĐỒ TU TIÊN
      const hasCultivGear = Object.values(p.equipment || {}).some(e => e && e.isCultivGear);
      if (p.cultivSect || hasCultivGear) {
        this.drawCultivSectOrbit(0, 0, size, p.cultivSect || 'dao', now);
      }

      this.safeDrawImage(this.ctx, spriteImg, -size / 2, -size / 2, size, size, () => {
        // Fallback nhân vật nếu ảnh chưa tải xong
        this.ctx.beginPath();
        this.ctx.arc(0, 0, size * 0.35, 0, Math.PI * 2);
        this.ctx.fillStyle = '#60a5fa';
        this.ctx.fill();
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1.5;
        this.ctx.stroke();
      });
      this.ctx.restore();

      const sectMap = {
        huashan: '【Hoa Sơn】',
        xiaoyao: '【Tiêu Dao】',
        shaolin: '【Thiếu Lâm】',
        wudang: '【Võ Đang】'
      };
      const cSectMap = {
        dao: '【Thái Thanh】',
        buddha: '【Phạn Thiên】',
        demon: '【U Minh】',
        beast: '【Vạn Yêu】'
      };
      const sectLabel = p.cultivSect ? (cSectMap[p.cultivSect] || '【Tiên Đạo】') : (sectMap[p.sect] || '【Hiệp Khách】');
      let nameWithTitle = `${sectLabel} ${p.name}`;
      if (p.isMeditating) nameWithTitle = `[Đang Thiền Định] ` + nameWithTitle;

      // Vẽ Danh Hiệu Võ Lâm phía trên đầu nhân vật
      this.drawPlayerTitle(screen.x, screen.y - size * 0.55 - 22, p, now);

      this.renderEntityHealthBar(
        screen.x,
        screen.y - size * 0.55,
        nameWithTitle,
        p.hp,
        p.maxHp,
        p.level,
        isMe ? '#22c55e' : '#38bdf8',
        false,
        p.realm
      );
    }
  }

  // VẼ DANH HIỆU VÕ LÂM HÀO QUANG TRÊN ĐẦU NHÂN VẬT (TOP 1-10 ĐỈNH PHONG HOÀNH TRÁNG, CÁNH THẦN CỰC ĐẠI, VƯƠNG MIỆN TỎA SÁNG)
  drawPlayerTitle(x, y, player, now) {
    if (!player) return;
    const titleInfo = player.activeTitleInfo || (player.allTitles && player.activeTitle ? player.allTitles[player.activeTitle] : null);
    const titleName = titleInfo ? titleInfo.name : (player.activeTitle === 'title_1' ? 'Sơ Xuất Giang Hồ' : null);
    if (!titleName) return;

    this.ctx.save();
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    const color = titleInfo?.color || '#facc15';
    const isRankTitle = (player.activeTitle && player.activeTitle.startsWith('title_rank_')) || (titleInfo && titleInfo.isRankTitle);
    const rankNum = isRankTitle ? (titleInfo?.rank || parseInt(player.activeTitle.replace('title_rank_', '')) || 999) : 999;
    const isTop1 = rankNum === 1;
    const isTop2 = rankNum === 2;
    const isTop3 = rankNum === 3;
    const isTop10 = rankNum <= 10;

    const isMythicTier = isRankTitle || player.activeTitle === 'title_12' || player.activeTitle === 'title_11' || player.activeTitle === 'title_10';
    const isGoldTier = isRankTitle || player.activeTitle === 'title_9' || player.activeTitle === 'title_8' || player.activeTitle === 'title_7';

    // 1. CỠ CHỮ & KÍCH THƯỚC BANNER DANH HIỆU
    let titleFontSize = 13;
    let bannerH = 24;
    let bannerPad = 44;
    let bannerYOffset = -4;

    if (isTop1) {
      titleFontSize = 17;
      bannerH = 34;
      bannerPad = 66;
      bannerYOffset = -14;
    } else if (isTop2 || isTop3) {
      titleFontSize = 15;
      bannerH = 30;
      bannerPad = 54;
      bannerYOffset = -10;
    } else if (isTop10) {
      titleFontSize = 14;
      bannerH = 27;
      bannerPad = 48;
      bannerYOffset = -7;
    }

    this.ctx.font = `bold ${titleFontSize}px "Noto Serif", serif`;
    const textWidth = this.ctx.measureText(titleName).width;
    const bannerW = Math.max(isTop1 ? 190 : 130, textWidth + bannerPad);
    const bannerY = y + bannerYOffset;

    // 2. VẼ ĐÔI CÁNH HÀO QUANG TIÊN ĐẠO (CELESTIAL WINGS) HAI BÊN
    const wingFlap = isTop1 ? (Math.sin(now * 0.005) * 11) : (Math.sin(now * 0.005) * 6);
    const wingColor = isTop1 
      ? `hsl(${(now * 0.18) % 360}, 100%, 75%)` 
      : (isTop2 ? '#ff3366' : (isTop3 ? '#00f0ff' : (isMythicTier ? `hsl(${(now * 0.15) % 360}, 100%, 75%)` : (isGoldTier ? '#fbbf24' : '#38bdf8'))));

    this.ctx.save();
    this.ctx.strokeStyle = wingColor;
    this.ctx.lineWidth = isTop1 ? 3.5 : (isTop3 ? 2.8 : 2.2);
    this.ctx.shadowColor = isTop1 ? '#ffd700' : wingColor;
    this.ctx.shadowBlur = isTop1 ? 25 : (isTop3 ? 18 : 10);

    const lx = x - bannerW / 2;
    const rx = x + bannerW / 2;
    const wingLen = isTop1 ? 72 : (isTop2 ? 56 : (isTop3 ? 50 : (isTop10 ? 44 : 34)));

    // Cánh trái (Tầng chính)
    this.ctx.beginPath();
    this.ctx.moveTo(lx, bannerY);
    this.ctx.bezierCurveTo(lx - wingLen * 0.45, bannerY - 18 + wingFlap, lx - wingLen * 0.8, bannerY - 8 + wingFlap, lx - wingLen, bannerY + 6);
    this.ctx.bezierCurveTo(lx - wingLen * 0.7, bannerY + 18, lx - wingLen * 0.35, bannerY + 12, lx, bannerY + 3);
    this.ctx.fillStyle = isTop1 
      ? 'rgba(255, 215, 0, 0.45)' 
      : (isTop2 ? 'rgba(255, 51, 102, 0.35)' : (isTop3 ? 'rgba(0, 240, 255, 0.35)' : (isMythicTier ? 'rgba(236, 72, 153, 0.25)' : 'rgba(56, 189, 248, 0.25)')));
    this.ctx.fill();
    this.ctx.stroke();

    // Cánh phải (Tầng chính)
    this.ctx.beginPath();
    this.ctx.moveTo(rx, bannerY);
    this.ctx.bezierCurveTo(rx + wingLen * 0.45, bannerY - 18 + wingFlap, rx + wingLen * 0.8, bannerY - 8 + wingFlap, rx + wingLen, bannerY + 6);
    this.ctx.bezierCurveTo(rx + wingLen * 0.7, bannerY + 18, rx + wingLen * 0.35, bannerY + 12, rx, bannerY + 3);
    this.ctx.fill();
    this.ctx.stroke();

    // Tầng cánh phụ thứ 2 dành riêng cho Top 1 & Top 3
    if (isTop1 || isTop3) {
      const subFlap = Math.cos(now * 0.006) * 8;
      const subLen = wingLen * 0.68;
      // Cánh phụ trái
      this.ctx.beginPath();
      this.ctx.moveTo(lx, bannerY + 5);
      this.ctx.bezierCurveTo(lx - subLen * 0.5, bannerY + 12 + subFlap, lx - subLen * 0.85, bannerY + 18 + subFlap, lx - subLen, bannerY + 28);
      this.ctx.bezierCurveTo(lx - subLen * 0.6, bannerY + 30, lx - subLen * 0.3, bannerY + 22, lx, bannerY + 8);
      this.ctx.fillStyle = isTop1 ? 'rgba(245, 158, 11, 0.35)' : 'rgba(14, 165, 233, 0.3)';
      this.ctx.fill();
      this.ctx.stroke();

      // Cánh phụ phải
      this.ctx.beginPath();
      this.ctx.moveTo(rx, bannerY + 5);
      this.ctx.bezierCurveTo(rx + subLen * 0.5, bannerY + 12 + subFlap, rx + subLen * 0.85, bannerY + 18 + subFlap, rx + subLen, bannerY + 28);
      this.ctx.bezierCurveTo(rx + subLen * 0.6, bannerY + 30, rx + subLen * 0.3, bannerY + 22, rx, bannerY + 8);
      this.ctx.fill();
      this.ctx.stroke();
    }
    this.ctx.restore();

    // 3. VẼ KHUNG BANNER RIBBON PHÁT SÁNG DƯỚI NỀN
    this.ctx.save();
    const bgGrad = this.ctx.createLinearGradient(x - bannerW / 2, bannerY, x + bannerW / 2, bannerY);
    if (isTop1) {
      const hue = (now * 0.18) % 360;
      bgGrad.addColorStop(0, `hsla(${hue}, 100%, 25%, 0.95)`);
      bgGrad.addColorStop(0.5, `hsla(${(hue + 50) % 360}, 100%, 42%, 0.98)`);
      bgGrad.addColorStop(1, `hsla(${hue}, 100%, 25%, 0.95)`);
    } else if (isTop2) {
      bgGrad.addColorStop(0, 'rgba(159, 18, 57, 0.95)');
      bgGrad.addColorStop(0.5, 'rgba(244, 63, 94, 0.95)');
      bgGrad.addColorStop(1, 'rgba(159, 18, 57, 0.95)');
    } else if (isTop3) {
      bgGrad.addColorStop(0, 'rgba(12, 74, 110, 0.95)');
      bgGrad.addColorStop(0.5, 'rgba(2, 132, 199, 0.95)');
      bgGrad.addColorStop(1, 'rgba(12, 74, 110, 0.95)');
    } else if (isMythicTier) {
      const hue = (now * 0.12) % 360;
      bgGrad.addColorStop(0, `hsla(${hue}, 90%, 25%, 0.85)`);
      bgGrad.addColorStop(0.5, `hsla(${(hue + 60) % 360}, 100%, 35%, 0.95)`);
      bgGrad.addColorStop(1, `hsla(${hue}, 90%, 25%, 0.85)`);
    } else if (isGoldTier) {
      bgGrad.addColorStop(0, 'rgba(120, 53, 15, 0.85)');
      bgGrad.addColorStop(0.5, 'rgba(217, 119, 6, 0.95)');
      bgGrad.addColorStop(1, 'rgba(120, 53, 15, 0.85)');
    } else {
      bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.85)');
      bgGrad.addColorStop(0.5, 'rgba(30, 41, 59, 0.95)');
      bgGrad.addColorStop(1, 'rgba(15, 23, 42, 0.85)');
    }

    // Bo góc banner
    const r = isTop1 ? 8 : 6;
    const bx = x - bannerW / 2;
    const by = bannerY - bannerH / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(bx + r, by);
    this.ctx.lineTo(bx + bannerW - r, by);
    this.ctx.quadraticCurveTo(bx + bannerW, by, bx + bannerW, by + r);
    this.ctx.lineTo(bx + bannerW, by + bannerH - r);
    this.ctx.quadraticCurveTo(bx + bannerW, by + bannerH, bx + bannerW - r, by + bannerH);
    this.ctx.lineTo(bx + r, by + bannerH);
    this.ctx.quadraticCurveTo(bx, by + bannerH, bx, by + bannerH - r);
    this.ctx.lineTo(bx, by + r);
    this.ctx.quadraticCurveTo(bx, by, bx + r, by);
    this.ctx.closePath();
    this.ctx.fillStyle = bgGrad;
    this.ctx.fill();

    // Viền kim loại mạ vàng / thần quang
    this.ctx.strokeStyle = isTop1 
      ? `hsl(${(now * 0.2) % 360}, 100%, 80%)` 
      : (isTop2 ? '#fecdd3' : (isTop3 ? '#a5f3fc' : (isMythicTier ? `hsl(${(now * 0.15) % 360}, 100%, 75%)` : (isGoldTier ? '#fde047' : '#93c5fd'))));
    this.ctx.lineWidth = isTop1 ? 2.8 : (isTop3 ? 2.2 : 1.8);
    this.ctx.stroke();
    this.ctx.restore();

    // 4. BIỂU TƯỢNG VƯƠNG MIỆN / NGỌC TỶ ĐỈNH BANNER (TOP 1 CÓ VÒNG HÀO QUANG XOAY)
    const iconSymbol = isTop1 ? '👑' : (isTop2 ? '⚔️' : (isTop3 ? '⚡' : (isMythicTier ? '👑' : (isGoldTier ? '★' : '❖'))));
    const iconY = bannerY - bannerH / 2 - (isTop1 ? 6 : 3);
    this.ctx.font = isTop1 ? 'bold 16px "Noto Sans", sans-serif' : 'bold 12px "Noto Sans", sans-serif';
    this.ctx.fillText(iconSymbol, x, iconY);

    if (isTop1) {
      // Vòng hào quang kim quang xoay quanh vương miện của Đệ Nhất
      this.ctx.save();
      this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.7)';
      this.ctx.lineWidth = 1.5;
      this.ctx.setLineDash([4, 4]);
      this.ctx.beginPath();
      this.ctx.arc(x, iconY, 14 + Math.sin(now * 0.008) * 3, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();
    }

    // 5. CHỮ DANH HIỆU SẮC NÉT PHÁT SÁNG RỰC RỠ
    this.ctx.font = `bold ${titleFontSize}px "Noto Serif", serif`;
    this.ctx.lineWidth = isTop1 ? 4.5 : (isTop3 ? 4.0 : 3.5);
    this.ctx.strokeStyle = '#050505';
    this.ctx.strokeText(titleName, x, bannerY);

    if (isTop1) {
      const hue = (now * 0.18) % 360;
      this.ctx.fillStyle = `hsl(${hue}, 100%, 90%)`;
      this.ctx.shadowColor = '#ffd700';
      this.ctx.shadowBlur = 22;
    } else if (isTop2) {
      this.ctx.fillStyle = '#fff1f2';
      this.ctx.shadowColor = '#f43f5e';
      this.ctx.shadowBlur = 18;
    } else if (isTop3) {
      this.ctx.fillStyle = '#f0fdfa';
      this.ctx.shadowColor = '#06b6d4';
      this.ctx.shadowBlur = 18;
    } else if (isMythicTier) {
      const hue = (now * 0.15) % 360;
      this.ctx.fillStyle = `hsl(${hue}, 100%, 85%)`;
      this.ctx.shadowColor = `hsl(${hue}, 100%, 70%)`;
      this.ctx.shadowBlur = 14;
    } else if (isGoldTier) {
      this.ctx.fillStyle = '#fef08a';
      this.ctx.shadowColor = '#eab308';
      this.ctx.shadowBlur = 10;
    } else {
      this.ctx.fillStyle = color;
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 8;
    }
    this.ctx.fillText(titleName, x, bannerY);

    this.ctx.restore();
  }

  // Vẽ Hào Quang Cảnh Giới Chân Khí Dưới Chân Người Chơi
  drawCultivationAura(x, y, realmIdx, now) {
    this.ctx.save();
    this.ctx.translate(x, y);

    let auraColor = 'rgba(56, 189, 248, 0.35)';
    let strokeColor = '#38bdf8';
    let radius = 28;

    if (realmIdx < 9) {
      // Luyện Khí (0 - 8)
      auraColor = 'rgba(125, 211, 252, 0.22)';
      strokeColor = '#7dd3fc';
      radius = 26 + (realmIdx % 3) * 2;
    } else if (realmIdx < 12) {
      // Trúc Cơ (9 - 11)
      auraColor = 'rgba(52, 211, 153, 0.32)';
      strokeColor = '#34d399';
      radius = 32;
    } else if (realmIdx === 12) {
      // Kim Đan (12)
      auraColor = 'rgba(251, 191, 36, 0.4)';
      strokeColor = '#fbbf24';
      radius = 36;
    } else if (realmIdx === 13) {
      // Nguyên Anh (13)
      auraColor = 'rgba(192, 132, 252, 0.45)';
      strokeColor = '#c084fc';
      radius = 38;
    } else {
      // Hóa Thần & Thiên Ngoại Kiếm Tiên (14 - 15)
      const hue = (now * 0.15) % 360;
      auraColor = `hsla(${hue}, 100%, 75%, 0.45)`;
      strokeColor = `hsl(${hue}, 100%, 70%)`;
      radius = 42;
    }

    const rot = (now * 0.0018) % (Math.PI * 2);
    this.ctx.rotate(rot);

    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, radius, radius * 0.48, 0, 0, Math.PI * 2);
    this.ctx.fillStyle = auraColor;
    this.ctx.fill();

    this.ctx.strokeStyle = strokeColor;
    this.ctx.lineWidth = 1.6;
    this.ctx.setLineDash([6, 5]);
    this.ctx.stroke();

    // Đối với Kim Đan trở lên: Vòng hoa văn Bát Quái xoay đảo chiều
    if (realmIdx >= 12) {
      this.ctx.rotate(-rot * 2);
      this.ctx.beginPath();
      this.ctx.ellipse(0, 0, radius * 0.65, radius * 0.32, 0, 0, Math.PI * 2);
      this.ctx.strokeStyle = strokeColor;
      this.ctx.lineWidth = 1.2;
      this.ctx.setLineDash([4, 4]);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  // Kiếm Khí Ngũ Sắc Cho Thần Binh Bạch Kim
  drawPlatinumWeaponAura(centerX, centerY, size, now) {
    this.ctx.save();
    for (let i = 0; i < 3; i++) {
      const angle = (now * 0.003 + i * (Math.PI * 2 / 3)) % (Math.PI * 2);
      const dist = size * 0.46;
      const px = centerX + Math.cos(angle) * dist;
      const py = centerY + Math.sin(angle) * (dist * 0.65);
      const hue = (now * 0.15 + i * 120) % 360;

      this.ctx.fillStyle = `hsl(${hue}, 100%, 75%)`;
      this.ctx.shadowColor = `hsl(${hue}, 100%, 80%)`;
      this.ctx.shadowBlur = 10;
      this.ctx.beginPath();
      this.ctx.arc(px, py, 2.8, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  // HÀO QUANG TIÊN ĐẠO XOAY VÒNG CHỚP TẮT QUANH NGƯỜI
  drawCultivSectOrbit(centerX, centerY, size, cultivSect, now) {
    this.ctx.save();
    const sectColors = {
      dao: '#00e5ff',
      buddha: '#ffd700',
      demon: '#ff1744',
      beast: '#00e676'
    };
    const mainColor = sectColors[cultivSect] || '#ffd700';

    // 1. Quỹ đạo elip phát sáng xoay tròn
    const orbitRot = (now * 0.002) % (Math.PI * 2);
    this.ctx.translate(centerX, centerY);
    this.ctx.rotate(orbitRot);

    this.ctx.beginPath();
    this.ctx.ellipse(0, 0, size * 0.52, size * 0.28, 0, 0, Math.PI * 2);
    this.ctx.strokeStyle = mainColor;
    this.ctx.lineWidth = 1.4;
    this.ctx.setLineDash([5, 5]);
    this.ctx.shadowColor = mainColor;
    this.ctx.shadowBlur = 12;
    this.ctx.stroke();

    // 2. 2 Viên Tiên Đan Linh Phách bay lượn quanh quỹ đạo
    for (let i = 0; i < 2; i++) {
      const angle = (now * 0.0035 + i * Math.PI) % (Math.PI * 2);
      const px = Math.cos(angle) * (size * 0.52);
      const py = Math.sin(angle) * (size * 0.28);

      this.ctx.beginPath();
      this.ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.shadowColor = mainColor;
      this.ctx.shadowBlur = 14;
      this.ctx.fill();

      // Đuôi sáng
      this.ctx.beginPath();
      this.ctx.arc(px - Math.cos(angle) * 3, py - Math.sin(angle) * 3, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = mainColor;
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  // Vẽ Đạn Kiếm Khí
  renderProjectiles(projectiles, currentMap, camera) {
    for (const proj of projectiles) {
      if (proj.mapId && proj.mapId !== currentMap) continue;
      const screen = camera.worldToScreen(proj.x, proj.y);
      this.ctx.save();
      this.ctx.translate(screen.x, screen.y);
      this.ctx.rotate(proj.angle);

      this.ctx.fillStyle = proj.color || '#38bdf8';
      this.ctx.shadowColor = proj.color || '#38bdf8';
      this.ctx.shadowBlur = 18;

      this.ctx.beginPath();
      this.ctx.moveTo(35, 0);
      this.ctx.lineTo(-20, -14);
      this.ctx.lineTo(-12, 0);
      this.ctx.lineTo(-20, 14);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.fillStyle = '#ffffff';
      this.ctx.beginPath();
      this.ctx.moveTo(30, 0);
      this.ctx.lineTo(-12, -6);
      this.ctx.lineTo(-8, 0);
      this.ctx.lineTo(-12, 6);
      this.ctx.closePath();
      this.ctx.fill();

      this.ctx.restore();
    }
  }

  renderEntityHealthBar(x, y, name, hp, maxHp, level, nameColor = '#ffffff', isBoss = false, realmText = null) {
    this.ctx.save();
    this.ctx.textAlign = 'center';

    this.ctx.font = isBoss ? 'bold 16px "Noto Serif", serif' : '13px "Noto Serif", sans-serif';
    this.ctx.fillStyle = nameColor;
    this.ctx.lineWidth = 3;
    this.ctx.strokeStyle = '#0f172a';
    
    let titleStr = `Lv.${level} ${name}`;
    if (realmText) titleStr += ` · [${realmText}]`;
    
    this.ctx.strokeText(titleStr, x, y - 8);
    this.ctx.fillText(titleStr, x, y - 8);

    const barW = isBoss ? 160 : 72;
    const barH = isBoss ? 8 : 5;
    const barX = x - barW / 2;
    const barY = y - 4;

    this.ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    this.ctx.fillRect(barX - 1, barY - 1, barW + 2, barH + 2);

    const hpPct = Math.max(0, Math.min(1, hp / maxHp));
    const hpGrad = this.ctx.createLinearGradient(barX, barY, barX + barW, barY);
    if (isBoss) {
      hpGrad.addColorStop(0, '#ef4444');
      hpGrad.addColorStop(1, '#991b1b');
    } else {
      hpGrad.addColorStop(0, '#22c55e');
      hpGrad.addColorStop(1, '#15803d');
    }
    this.ctx.fillStyle = hpGrad;
    this.ctx.fillRect(barX, barY, barW * hpPct, barH);

    this.ctx.strokeStyle = '#d4af37';
    this.ctx.lineWidth = 1;
    this.ctx.strokeRect(barX - 1, barY - 1, barW + 2, barH + 2);

    this.ctx.restore();
  }

  // Radar Minimap
  renderMinimap(minimapCanvas, players, monsters, myPlayer, currentMap, mapsData) {
    if (!minimapCanvas || !myPlayer) return;
    const mctx = minimapCanvas.getContext('2d');
    const mw = minimapCanvas.width;
    const mh = minimapCanvas.height;

    const mapInfo = mapsData[currentMap] || mapsData.lac_duong;
    const scaleX = mw / mapInfo.width;
    const scaleY = mh / mapInfo.height;

    let mapImg = this.assets.worldMap;
    if (currentMap === 'dao_hoa_dao') mapImg = this.assets.mapPeach;
    else if (currentMap === 'ma_son') mapImg = this.assets.mapVolcano;
    else if (currentMap === 'con_lon') mapImg = this.assets.mapConLon;
    else if (currentMap === 'hoang_sa') mapImg = this.assets.mapHoangSa;
    else if (currentMap === 'than_dien') mapImg = this.assets.mapThanDien;
    else if (currentMap === 'dungeon_abyss') mapImg = this.assets.mapAbyss;
    else if (currentMap === 'map_bong_lai') mapImg = this.assets.mapBongLai;
    else if (currentMap === 'map_dao_tri') mapImg = this.assets.mapDaoTri;
    else if (currentMap === 'map_thai_hu') mapImg = this.assets.mapThaiHu;

    const drewMinimap = this.safeDrawImage(mctx, mapImg, 0, 0, mw, mh);
    if (drewMinimap) {
      mctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
      mctx.fillRect(0, 0, mw, mh);
    } else {
      mctx.fillStyle = '#0f172a';
      mctx.fillRect(0, 0, mw, mh);
    }

    // Quái vật & Boss Thế Giới trên Minimap
    let activeBossOnMap = null;
    for (const m of Object.values(monsters)) {
      if (m.state === 'dead' || (m.mapId && m.mapId !== currentMap)) continue;

      if (m.isBoss || m.isRevenantBoss) {
        activeBossOnMap = m;
        const bx = m.x * scaleX;
        const by = m.y * scaleY;
        const pulse = Math.sin(Date.now() / 180) * 2.5;

        // Vòng hào quang phát sáng
        mctx.fillStyle = m.isRevenantBoss ? 'rgba(244, 63, 94, 0.35)' : 'rgba(239, 68, 68, 0.35)';
        mctx.beginPath();
        mctx.arc(bx, by, 9 + pulse, 0, Math.PI * 2);
        mctx.fill();

        // Chấm Boss chính
        mctx.fillStyle = m.isRevenantBoss ? '#be123c' : '#dc2626';
        mctx.beginPath();
        mctx.arc(bx, by, 6.5, 0, Math.PI * 2);
        mctx.fill();
        mctx.strokeStyle = '#facc15';
        mctx.lineWidth = 1.8;
        mctx.stroke();

        // Chữ BOSS trên Minimap
        mctx.fillStyle = '#fef08a';
        mctx.font = 'bold 8px sans-serif';
        mctx.textAlign = 'center';
        mctx.fillText('☠ BOSS', bx, by - 8);
      } else if (m.isElite) {
        // Quái Tinh Anh
        const ex = m.x * scaleX;
        const ey = m.y * scaleY;
        mctx.fillStyle = '#f97316';
        mctx.beginPath();
        mctx.arc(ex, ey, 4.5, 0, Math.PI * 2);
        mctx.fill();
        mctx.strokeStyle = '#fde047';
        mctx.lineWidth = 1.2;
        mctx.stroke();
      } else {
        mctx.fillStyle = '#eab308';
        mctx.beginPath();
        mctx.arc(m.x * scaleX, m.y * scaleY, 2.5, 0, Math.PI * 2);
        mctx.fill();
      }
    }

    // Đường la bàn chỉ hướng từ Người Chơi tới Boss trên Minimap
    if (activeBossOnMap) {
      mctx.save();
      mctx.setLineDash([3, 3]);
      mctx.strokeStyle = 'rgba(250, 204, 21, 0.65)';
      mctx.lineWidth = 1.2;
      mctx.beginPath();
      mctx.moveTo(myPlayer.x * scaleX, myPlayer.y * scaleY);
      mctx.lineTo(activeBossOnMap.x * scaleX, activeBossOnMap.y * scaleY);
      mctx.stroke();
      mctx.restore();
    }

    // Người chơi khác
    for (const p of Object.values(players)) {
      if (p.id === myPlayer.id || p.hp <= 0 || (p.currentMap && p.currentMap !== currentMap)) continue;
      mctx.fillStyle = '#38bdf8';
      mctx.beginPath();
      mctx.arc(p.x * scaleX, p.y * scaleY, 3, 0, Math.PI * 2);
      mctx.fill();
    }

    // Bản thân
    mctx.fillStyle = '#22c55e';
    mctx.beginPath();
    mctx.arc(myPlayer.x * scaleX, myPlayer.y * scaleY, 4, 0, Math.PI * 2);
    mctx.fill();
    mctx.strokeStyle = '#ffffff';
    mctx.lineWidth = 1;
    mctx.stroke();
  }
}

window.Renderer = Renderer;
