class ParticleSystem {
  constructor() {
    this.petals = []; // Hạt môi trường (hoa đào, lá phong, tàn tro)
    this.sparkles = []; // Hạt kiếm khí lấp lánh
    this.afterImages = []; // Tàn ảnh khinh công
    this.damagePopups = []; // Số sát thương nổi
    this.specialEffects = []; // Vạn kiếm rơi, Bát quái xoay, Lốc xoáy
    this.dustParticles = []; // Bụi bước chân khi di chuyển
    this.confetti = []; // Pháo hoa ngũ sắc chúc mừng trúng thưởng
    this.currentMap = 'lac_duong';
    
    this.initMapParticles('lac_duong', 70);
  }

  // Khởi tạo hạt môi trường theo chủ đề từng bản đồ
  initMapParticles(mapId = 'lac_duong', count = 70) {
    this.petals = [];
    this.currentMap = mapId;

    for (let i = 0; i < count; i++) {
      if (mapId === 'ma_son') {
        // Vạn Kiếp Ma Sơn: Tàn tro than hồng và đốm lửa bốc từ dưới đất lên
        this.petals.push({
          type: 'ember',
          x: Math.random() * 3000,
          y: Math.random() * 2000,
          size: 2.5 + Math.random() * 4,
          vx: (Math.random() - 0.5) * 35,
          vy: -(30 + Math.random() * 65), // Bốc lên trên
          swing: Math.random() * Math.PI * 2,
          swingSpeed: 2.0 + Math.random() * 3.0,
          alpha: 0.6 + Math.random() * 0.4,
          color: Math.random() > 0.4 ? '#f97316' : (Math.random() > 0.5 ? '#ef4444' : '#fbbf24')
        });
      } else if (mapId === 'dao_hoa_dao') {
        // Đào Hoa Tiên Đảo: Cánh hoa anh đào hồng tím + đom đóm xanh ngọc bích
        const isFirefly = Math.random() < 0.25;
        this.petals.push({
          type: isFirefly ? 'firefly' : 'petal',
          x: Math.random() * 3000,
          y: Math.random() * 2000,
          size: isFirefly ? (2 + Math.random() * 3) : (5 + Math.random() * 6),
          vx: isFirefly ? (Math.random() - 0.5) * 25 : (35 + Math.random() * 45),
          vy: isFirefly ? (Math.random() - 0.5) * 20 : (30 + Math.random() * 40),
          swing: Math.random() * Math.PI * 2,
          swingSpeed: 1.2 + Math.random() * 2.0,
          alpha: 0.45 + Math.random() * 0.45,
          color: isFirefly ? '#67e8f9' : (Math.random() > 0.4 ? '#fbcfe8' : '#e879f9')
        });
      } else {
        // Lạc Dương Thành: Cánh hoa đào hồng + lá phong vàng thu cổ điển
        const isLeaf = Math.random() < 0.35;
        this.petals.push({
          type: isLeaf ? 'leaf' : 'petal',
          x: Math.random() * 3000,
          y: Math.random() * 2000,
          size: 5 + Math.random() * 6,
          vx: 35 + Math.random() * 50,
          vy: 28 + Math.random() * 40,
          swing: Math.random() * Math.PI * 2,
          swingSpeed: 1.5 + Math.random() * 2.0,
          alpha: 0.4 + Math.random() * 0.45,
          color: isLeaf ? '#facc15' : (Math.random() > 0.4 ? '#fbcfe8' : '#f43f5e')
        });
      }
    }
  }

  // Thêm hạt bụi bước chân khi chạy
  addRunDust(x, y) {
    if (this.dustParticles.length > 50) return;
    this.dustParticles.push({
      x: x + (Math.random() - 0.5) * 16,
      y: y + 26 + (Math.random() - 0.5) * 6,
      size: 4 + Math.random() * 5,
      alpha: 0.4,
      grow: 18,
      life: 0.35
    });
  }

  // Thêm pháo hoa ngũ sắc chúc mừng trúng thưởng
  addConfetti(x, y, count = 40) {
    const colors = ['#facc15', '#38bdf8', '#ec4899', '#4ade80', '#c084fc', '#ffffff'];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 120 + Math.random() * 280;
      this.confetti.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: 3 + Math.random() * 4,
        alpha: 1.0,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 12,
        life: 1.4 + Math.random() * 0.8
      });
    }
  }

  // Thêm tàn ảnh khinh công (After-image trail)
  addAfterImage(img, x, y, angle, size, sect) {
    this.afterImages.push({
      img,
      x,
      y,
      angle,
      size,
      alpha: 0.65,
      fadeRate: 2.2, // giảm nhanh trong ~0.35s
      color: sect === 'huashan' ? '#38bdf8' : '#34d399'
    });
  }

  // Thêm tia lửa kiếm khí khi chém trúng quái
  addSparks(x, y, color = '#fbbf24', count = 12) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 80 + Math.random() * 220;
      this.sparkles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 2.5 + Math.random() * 3,
        alpha: 1.0,
        color,
        life: 0.35 + Math.random() * 0.25
      });
    }
  }

  // Thêm số sát thương nổi (Damage Popup)
  addDamagePopup(x, y, damage, isCrit = false, dodged = false, isPlayer = false) {
    this.damagePopups.push({
      x: x + (Math.random() - 0.5) * 30,
      y,
      damage,
      isCrit,
      dodged,
      isPlayer,
      alpha: 1.0,
      scale: isCrit ? 1.7 : 1.0,
      vy: isCrit ? -85 : -55,
      life: 0.95
    });
  }

  // Thêm hiệu ứng Vạn Kiếm Quy Tông (Sword Storm)
  addSwordStorm(x, y, radius, duration = 1.8) {
    this.specialEffects.push({
      type: 'sword_storm',
      x,
      y,
      radius,
      duration,
      elapsed: 0,
      swords: Array.from({ length: 24 }).map(() => ({
        offsetX: (Math.random() - 0.5) * radius * 1.8,
        offsetY: (Math.random() - 0.5) * radius * 1.8 - 300,
        speed: 550 + Math.random() * 300,
        landed: false,
        size: 32 + Math.random() * 16,
        delay: Math.random() * 0.8
      }))
    });
  }

  // Thêm hiệu ứng Bát Quái Đồ Xoay (Taiji Formation)
  addTaijiFormation(x, y, radius, duration = 6.0) {
    this.specialEffects.push({
      type: 'taiji',
      x,
      y,
      radius,
      duration,
      elapsed: 0,
      rotation: 0
    });
  }

  // Thêm hiệu ứng Lốc Xoáy Bắc Minh (Vortex)
  addVortex(x, y, radius, duration = 2.5) {
    this.specialEffects.push({
      type: 'vortex',
      x,
      y,
      radius,
      duration,
      elapsed: 0,
      rotation: 0
    });
  }

  // Thêm hiệu ứng Ma Đao Liệt Không (Boss Flame Wave)
  addBossWave(x, y, targetX, targetY) {
    const angle = Math.atan2(targetY - y, targetX - x);
    this.specialEffects.push({
      type: 'boss_wave',
      x,
      y,
      angle,
      duration: 0.7,
      elapsed: 0,
      radius: 220
    });
  }

  // Điểm đánh dấu bước chân khi click chuột di chuyển
  addMoveMarker(x, y) {
    this.specialEffects.push({
      type: 'move_marker',
      x,
      y,
      duration: 0.55,
      elapsed: 0,
      radius: 20
    });
  }

  // THIẾU LÂM: Kim Cang Phục Ma Trận (Phật quang chữ Vạn chấn động dưới đất)
  addBuddhaAura(x, y, radius = 230, duration = 2.2) {
    this.specialEffects.push({
      type: 'buddha_aura',
      x,
      y,
      radius,
      duration,
      elapsed: 0,
      rotation: 0
    });
    this.addSparks(x, y, '#fbbf24', 24);
  }

  // THIẾU LÂM: Kim Cang Bất Hoại Thể (Chuông vàng hộ thể)
  addGoldenBell(x, y, radius = 120, duration = 4.0) {
    this.specialEffects.push({
      type: 'golden_bell',
      x,
      y,
      radius,
      duration,
      elapsed: 0
    });
    this.addSparks(x, y, '#f59e0b', 16);
  }

  // THIẾU LÂM: Sư Tử Hống (Sóng âm chấn động lở đất)
  addLionRoar(x, y, radius = 320, duration = 1.0) {
    this.specialEffects.push({
      type: 'lion_roar',
      x,
      y,
      maxRadius: radius,
      duration,
      elapsed: 0
    });
    this.addSparks(x, y, '#ea580c', 32);
  }

  // VÕ ĐANG: Lưỡng Nghi Kiếm Trận & Vạn Kiếm Triều Tông (Mưa kiếm băng lam cắm đất)
  addWudangSwordStorm(x, y, radius = 240, color = '#0284c7', count = 30, duration = 2.0) {
    this.specialEffects.push({
      type: 'wudang_swords',
      x,
      y,
      radius,
      duration,
      elapsed: 0,
      color,
      swords: Array.from({ length: count }).map(() => ({
        offsetX: (Math.random() - 0.5) * radius * 1.8,
        offsetY: (Math.random() - 0.5) * radius * 1.8 - 320,
        speed: 600 + Math.random() * 320,
        landed: false,
        size: 34 + Math.random() * 18,
        delay: Math.random() * 0.7
      }))
    });
  }

  // VÕ ĐANG: Tọa Vong Vô Ngã (Khiên Thái Cực Hộ Thể)
  addManaShield(x, y, radius = 125, duration = 4.0) {
    this.specialEffects.push({
      type: 'mana_shield',
      x,
      y,
      radius,
      duration,
      elapsed: 0,
      rotation: 0
    });
  }

  // Vòng lặp cập nhật hạt
  update(dt) {
    // 1. Cập nhật hoa đào
    for (const p of this.petals) {
      p.swing += p.swingSpeed * dt;
      p.x += (p.vx + Math.sin(p.swing) * 25) * dt;
      p.y += p.vy * dt;
      
      // Lặp lại khi bay ra ngoài bản đồ
      if (p.x > 3200) p.x = 0;
      if (p.y > 2000) p.y = 0;
    }

    // 2. Cập nhật tàn ảnh
    for (let i = this.afterImages.length - 1; i >= 0; i--) {
      const ai = this.afterImages[i];
      ai.alpha -= ai.fadeRate * dt;
      if (ai.alpha <= 0) {
        this.afterImages.splice(i, 1);
      }
    }

    // 3. Cập nhật tia lửa kiếm khí
    for (let i = this.sparkles.length - 1; i >= 0; i--) {
      const s = this.sparkles[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      s.alpha = Math.max(0, s.life / 0.5);
      if (s.life <= 0) {
        this.sparkles.splice(i, 1);
      }
    }

    // 4. Cập nhật số sát thương nổi
    for (let i = this.damagePopups.length - 1; i >= 0; i--) {
      const pop = this.damagePopups[i];
      pop.y += pop.vy * dt;
      pop.life -= dt;
      pop.alpha = Math.max(0, pop.life / 0.95);
      if (pop.life <= 0) {
        this.damagePopups.splice(i, 1);
      }
    }

    // 5. Cập nhật bụi bước chân
    for (let i = this.dustParticles.length - 1; i >= 0; i--) {
      const d = this.dustParticles[i];
      d.life -= dt;
      d.size += d.grow * dt;
      d.alpha = Math.max(0, d.life / 0.35);
      if (d.life <= 0) {
        this.dustParticles.splice(i, 1);
      }
    }

    // 6. Cập nhật pháo hoa trúng thưởng
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx * dt;
      c.y += c.vy * dt;
      c.vy += 120 * dt; // Trọng lực rơi chậm
      c.rotation += c.rotSpeed * dt;
      c.life -= dt;
      c.alpha = Math.max(0, c.life / 1.4);
      if (c.life <= 0) {
        this.confetti.splice(i, 1);
      }
    }

    // 7. Cập nhật hiệu ứng đặc biệt
    for (let i = this.specialEffects.length - 1; i >= 0; i--) {
      const fx = this.specialEffects[i];
      fx.elapsed += dt;

      if (fx.type === 'sword_storm') {
        for (const sw of fx.swords) {
          if (fx.elapsed >= sw.delay && !sw.landed) {
            sw.offsetY += sw.speed * dt;
            if (sw.offsetY >= (Math.random() - 0.5) * 60) {
              sw.landed = true;
              this.addSparks(fx.x + sw.offsetX, fx.y + sw.offsetY, '#fbbf24', 6);
            }
          }
        }
      } else if (fx.type === 'wudang_swords') {
        for (const sw of fx.swords) {
          if (fx.elapsed >= sw.delay && !sw.landed) {
            sw.offsetY += sw.speed * dt;
            if (sw.offsetY >= (Math.random() - 0.5) * 60) {
              sw.landed = true;
              this.addSparks(fx.x + sw.offsetX, fx.y + sw.offsetY, fx.color || '#38bdf8', 6);
            }
          }
        }
      } else if (fx.type === 'taiji' || fx.type === 'mana_shield') {
        fx.rotation += dt * 1.5;
      } else if (fx.type === 'buddha_aura') {
        fx.rotation += dt * 0.8;
      } else if (fx.type === 'vortex') {
        fx.rotation += dt * 4.0;
      }

      if (fx.elapsed >= fx.duration) {
        this.specialEffects.splice(i, 1);
      }
    }
  }

  // Vẽ các hiệu ứng mặt đất (Under-layer: Bụi chân, Bát quái, Lốc xoáy, Vạn kiếm, Phật quang)
  renderGroundEffects(ctx, camera) {
    // Vẽ bụi bước chân
    for (const d of this.dustParticles) {
      const screen = camera.worldToScreen(d.x, d.y);
      ctx.save();
      ctx.globalAlpha = d.alpha * 0.35;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, d.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (const fx of this.specialEffects) {
      const screenPos = camera.worldToScreen(fx.x, fx.y);

      if (fx.type === 'taiji') {
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        ctx.rotate(fx.rotation);
        
        // Vòng tròn Bát Quái Kim Quang
        ctx.beginPath();
        ctx.arc(0, 0, fx.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#fde047';
        ctx.shadowBlur = 15;
        ctx.stroke();

        // Vẽ biểu tượng Âm Dương Thái Cực
        ctx.beginPath();
        ctx.arc(0, 0, fx.radius * 0.7, 0, Math.PI, false);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, fx.radius * 0.7, 0, Math.PI, true);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();

        ctx.restore();
      } else if (fx.type === 'buddha_aura') {
        // Phật quang chữ Vạn xoay tròn dưới chân (Thiếu Lâm)
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        ctx.rotate(fx.rotation);

        const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, fx.radius);
        grad.addColorStop(0, 'rgba(251, 191, 36, 0.4)');
        grad.addColorStop(0.7, 'rgba(217, 119, 6, 0.2)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, fx.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#f59e0b';
        ctx.shadowBlur = 18;
        ctx.stroke();

        // Vẽ chữ VẠN (卍) khổng lồ phát hào quang
        ctx.fillStyle = 'rgba(255, 245, 157, 0.65)';
        ctx.font = `bold ${Math.round(fx.radius * 0.6)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('卍', 0, 0);

        ctx.restore();
      } else if (fx.type === 'lion_roar') {
        // Sóng âm Sư Tử Hống chấn động lở đất
        const progress = fx.elapsed / fx.duration;
        const curR = fx.maxRadius * progress;
        const alpha = Math.max(0, 1 - progress);

        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);

        for (let ring = 0; ring < 3; ring++) {
          const r = Math.max(10, curR - ring * 35);
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(234, 88, 12, ${alpha * (1 - ring * 0.25)})`;
          ctx.lineWidth = 4 + (3 - ring);
          ctx.shadowColor = '#ea580c';
          ctx.shadowBlur = 20;
          ctx.stroke();
        }

        ctx.restore();
      } else if (fx.type === 'golden_bell') {
        // Chuông vàng Kim Chung Hộ Thể (Thiếu Lâm)
        const alpha = Math.sin((fx.elapsed / fx.duration) * Math.PI) * 0.5 + 0.3;
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);

        const grad = ctx.createRadialGradient(0, -10, 5, 0, 0, fx.radius);
        grad.addColorStop(0, `rgba(254, 240, 138, ${alpha * 0.7})`);
        grad.addColorStop(0.6, `rgba(234, 179, 8, ${alpha * 0.4})`);
        grad.addColorStop(1, 'rgba(161, 98, 7, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, fx.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = `rgba(250, 204, 21, ${alpha})`;
        ctx.lineWidth = 3.5;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 16;
        ctx.stroke();

        ctx.restore();
      } else if (fx.type === 'mana_shield') {
        // Khiên Thái Cực Hộ Thể (Võ Đang)
        const alpha = Math.sin((fx.elapsed / fx.duration) * Math.PI) * 0.45 + 0.35;
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        ctx.rotate(fx.rotation);

        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
        ctx.lineWidth = 3;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
        ctx.beginPath();
        ctx.arc(0, 0, fx.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Biểu tượng Âm Dương trong khiên
        ctx.beginPath();
        ctx.arc(0, 0, fx.radius * 0.5, 0, Math.PI, false);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(0, 0, fx.radius * 0.5, 0, Math.PI, true);
        ctx.fillStyle = `rgba(2, 132, 199, ${alpha * 0.4})`;
        ctx.fill();

        ctx.restore();
      } else if (fx.type === 'vortex') {
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        ctx.rotate(fx.rotation);

        const grad = ctx.createRadialGradient(0, 0, 10, 0, 0, fx.radius);
        grad.addColorStop(0, 'rgba(129, 140, 248, 0.6)');
        grad.addColorStop(0.6, 'rgba(79, 70, 229, 0.3)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, fx.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#a5b4fc';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      } else if (fx.type === 'move_marker') {
        const progress = fx.elapsed / fx.duration;
        const currentR = fx.radius * (1 + progress * 0.7);
        const alpha = Math.max(0, 1 - progress);
        ctx.save();
        ctx.translate(screenPos.x, screenPos.y);
        ctx.strokeStyle = `rgba(250, 204, 21, ${alpha * 0.9})`;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#facc15';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, currentR, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = `rgba(250, 204, 21, ${alpha * 0.7})`;
        ctx.beginPath();
        ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
        ctx.fill();

        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + progress;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * (currentR - 4), Math.sin(a) * (currentR - 4));
          ctx.lineTo(Math.cos(a) * (currentR + 4), Math.sin(a) * (currentR + 4));
          ctx.stroke();
        }
        ctx.restore();
      }
    }
  }

  // Vẽ tàn ảnh khinh công
  renderAfterImages(ctx, camera) {
    for (const ai of this.afterImages) {
      if (!ai.img || !ai.img.complete) continue;
      const screenPos = camera.worldToScreen(ai.x, ai.y);
      
      ctx.save();
      ctx.globalAlpha = ai.alpha * 0.7;
      ctx.translate(screenPos.x, screenPos.y);
      ctx.rotate(ai.angle + Math.PI / 2);
      ctx.drawImage(ai.img, -ai.size / 2, -ai.size / 2, ai.size, ai.size);
      ctx.restore();
    }
  }

  // Vẽ các hiệu ứng trên không (Vạn kiếm cắm đất, tia lửa, cánh hoa, chữ số sát thương)
  renderTopEffects(ctx, camera) {
    // 1. Vẽ Vạn Kiếm Rơi (Hoa Sơn Hoàng Kim & Võ Đang Băng Lam)
    for (const fx of this.specialEffects) {
      if (fx.type === 'sword_storm' || fx.type === 'wudang_swords') {
        const swordColor = fx.type === 'wudang_swords' ? (fx.color || '#38bdf8') : '#fde047';
        const shadowCol = fx.type === 'wudang_swords' ? '#0284c7' : '#eab308';
        for (const sw of fx.swords) {
          if (fx.elapsed >= sw.delay) {
            const swWorldX = fx.x + sw.offsetX;
            const swWorldY = fx.y + sw.offsetY;
            const screen = camera.worldToScreen(swWorldX, swWorldY);

            ctx.save();
            ctx.translate(screen.x, screen.y);
            ctx.rotate(Math.PI / 4); // mũi kiếm cắm nghiêng

            ctx.fillStyle = swordColor;
            ctx.shadowColor = shadowCol;
            ctx.shadowBlur = 12;
            // Vẽ lưỡi kiếm
            ctx.beginPath();
            ctx.moveTo(0, -sw.size);
            ctx.lineTo(sw.size * 0.25, 0);
            ctx.lineTo(0, sw.size * 0.3);
            ctx.lineTo(-sw.size * 0.25, 0);
            ctx.closePath();
            ctx.fill();

            ctx.restore();
          }
        }
      }
    }

    // 2. Vẽ tia lửa kiếm khí
    for (const s of this.sparkles) {
      const screen = camera.worldToScreen(s.x, s.y);
      ctx.save();
      ctx.globalAlpha = s.alpha;
      ctx.fillStyle = s.color;
      ctx.shadowColor = s.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(screen.x, screen.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Vẽ hạt môi trường giang hồ (hoa đào, đom đóm, tàn tro dung nham)
    for (const p of this.petals) {
      const screen = camera.worldToScreen(p.x, p.y);
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.translate(screen.x, screen.y);
      ctx.rotate(p.swing);
      
      if (p.type === 'ember') {
        // Tàn tro ma sơn phát sáng
        ctx.shadowColor = '#f97316';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'firefly') {
        // Đom đóm đào hoa đảo nhấp nháy phát sáng
        ctx.shadowColor = '#67e8f9';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Cánh hoa đào hoặc lá phong
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.55, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 3.5. Vẽ pháo hoa ngũ sắc chúc mừng trúng thưởng
    for (const c of this.confetti) {
      const screen = camera.worldToScreen(c.x, c.y);
      ctx.save();
      ctx.globalAlpha = c.alpha;
      ctx.fillStyle = c.color;
      ctx.shadowColor = c.color;
      ctx.shadowBlur = 8;
      ctx.translate(screen.x, screen.y);
      ctx.rotate(c.rotation);
      ctx.fillRect(-c.size / 2, -c.size / 2, c.size * 1.5, c.size);
      ctx.restore();
    }

    // 4. Vẽ số sát thương nổi (Floating Damage Popups)
    for (const pop of this.damagePopups) {
      const screen = camera.worldToScreen(pop.x, pop.y);
      ctx.save();
      ctx.globalAlpha = pop.alpha;
      
      let fontStr = pop.isCrit 
        ? 'bold 26px "Cinzel", "Noto Serif", serif'
        : 'bold 18px "Noto Serif", sans-serif';
        
      ctx.font = fontStr;
      ctx.textAlign = 'center';
      ctx.lineWidth = 3;

      if (pop.dodged) {
        ctx.fillStyle = '#67e8f9';
        ctx.strokeStyle = '#083344';
        ctx.strokeText('NÉ TRÁNH!', screen.x, screen.y);
        ctx.fillText('NÉ TRÁNH!', screen.x, screen.y);
      } else if (pop.isPlayer) {
        // Sát thương người chơi nhận vào (Màu Đỏ Tươi)
        ctx.fillStyle = '#f87171';
        ctx.strokeStyle = '#450a0a';
        ctx.strokeText(`-${pop.damage}`, screen.x, screen.y);
        ctx.fillText(`-${pop.damage}`, screen.x, screen.y);
      } else {
        // Sát thương gây lên quái
        if (pop.isCrit) {
          ctx.fillStyle = '#fbbf24'; // Vàng rực bạo kích
          ctx.strokeStyle = '#78350f';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 12;
          ctx.strokeText(`BẠO KÍCH! -${pop.damage}`, screen.x, screen.y);
          ctx.fillText(`BẠO KÍCH! -${pop.damage}`, screen.x, screen.y);
        } else {
          ctx.fillStyle = '#ffffff'; // Trắng thường
          ctx.strokeStyle = '#1e293b';
          ctx.strokeText(`-${pop.damage}`, screen.x, screen.y);
          ctx.fillText(`-${pop.damage}`, screen.x, screen.y);
        }
      }

      ctx.restore();
    }
  }
}

window.ParticleSystem = ParticleSystem;
