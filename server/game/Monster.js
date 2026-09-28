// Quản lý Quái vật & Boss Thế Giới Đa Bản Đồ - Cửu Châu Kiếm Vũ V3
// Hỗ trợ Quái Tinh Anh (Elite Monster: ★, Size +25%, HP x3, Dame x1.4)

class Monster {
  constructor(id, mapId, type, name, level, x, y, isBoss = false, isElite = false, bossRarity = null, revenantData = null) {
    this.id = id;
    this.mapId = mapId; // 'lac_duong' | 'dao_hoa_dao' | 'ma_son' | 'con_lon' | 'hoang_sa' | 'than_dien' | 'dungeon_abyss'
    this.type = type;
    this.name = isElite && !isBoss ? `★ ${name} ★` : name;
    this.level = level;
    this.isBoss = isBoss;
    this.isElite = isElite;
    this.bossRarity = bossRarity; // 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'celestial' | 'abyssal' | 'platinum'
    
    // NGUYÊN HỒN ÁC HÓA (REVENANT WORLD BOSS) TỪ CƯỜNG GIẢ TỌA HÓA
    this.isRevenantBoss = !!revenantData;
    this.revenantOwnerName = revenantData ? revenantData.ownerName : null;
    this.revenantOwnerSect = revenantData ? revenantData.ownerSect : null;
    this.revenantOwnerCultivSect = revenantData ? revenantData.ownerCultivSect : null;
    this.revenantOwnerRealm = revenantData ? revenantData.ownerRealm : null;
    this.revenantLoot = revenantData ? revenantData.loot : null;

    // Tọa độ & Điểm hồi sinh
    this.spawnX = x;
    this.spawnY = y;
    this.x = x;
    this.y = y;
    this.angle = 0;
    
    // Chỉ số theo chủng loại
    if (isBoss) {
      const rarityScale = {
        common:    { hp: 25000,   atk: 160,  def: 70,   exp: 2500,   size: 105 },
        uncommon:  { hp: 50000,   atk: 250,  def: 110,  exp: 4500,   size: 112 },
        rare:      { hp: 100000,  atk: 380,  def: 160,  exp: 8000,   size: 120 },
        epic:      { hp: 200000,  atk: 580,  def: 240,  exp: 15000,  size: 130 },
        legendary: { hp: 450000,  atk: 900,  def: 360,  exp: 30000,  size: 140 },
        mythic:    { hp: 900000,  atk: 1450, def: 520,  exp: 60000,  size: 150 },
        celestial: { hp: 1800000, atk: 2200, def: 750,  exp: 110000, size: 160 },
        abyssal:   { hp: 3500000, atk: 3300, def: 1050, exp: 200000, size: 170 },
        platinum:  { hp: 6800000, atk: 4800, def: 1500, exp: 400000, size: 185 }
      };
      const sc = (this.bossRarity && rarityScale[this.bossRarity]) ? rarityScale[this.bossRarity] : rarityScale.legendary;
      this.maxHp = sc.hp + (level - 1) * 1500;
      this.hp = this.maxHp;
      this.attack = sc.atk + (level - 1) * 35;
      this.defense = sc.def + (level - 1) * 18;
      this.speed = 185;
      this.aggroRange = 650;
      this.attackRange = 110;
      this.attackCooldown = 1600;
      this.expReward = sc.exp + level * 300;
      this.size = sc.size;
    } else if (type === 'spirit_fox') {
      // Đào Hoa Đảo (nhanh nhẹn, né cao) - Cân bằng lại thách thức phàm nhân
      this.maxHp = 6800 + (level - 1) * 450;
      this.hp = this.maxHp;
      this.attack = 140 + (level - 1) * 22;
      this.defense = 90 + (level - 1) * 12;
      this.speed = 220;
      this.aggroRange = 400;
      this.attackRange = 85;
      this.attackCooldown = 1300;
      this.expReward = 350 + level * 50;
      this.size = 75;
    } else if (type === 'fire_demon') {
      // Vạn Kiếp Ma Sơn
      this.maxHp = 12500 + (level - 1) * 650;
      this.hp = this.maxHp;
      this.attack = 210 + (level - 1) * 28;
      this.defense = 140 + (level - 1) * 16;
      this.speed = 170;
      this.aggroRange = 450;
      this.attackRange = 90;
      this.attackCooldown = 1500;
      this.expReward = 520 + level * 70;
      this.size = 85;
    } else if (type === 'snow_beast') {
      // Côn Lôn Tuyết Sơn
      this.maxHp = 22000 + (level - 1) * 850;
      this.hp = this.maxHp;
      this.attack = 320 + (level - 1) * 35;
      this.defense = 200 + (level - 1) * 22;
      this.speed = 195;
      this.aggroRange = 460;
      this.attackRange = 95;
      this.attackCooldown = 1450;
      this.expReward = 850 + level * 95;
      this.size = 85;
    } else if (type === 'desert_demon') {
      // Hoàng Sa Cổ Thành
      this.maxHp = 35000 + (level - 1) * 1200;
      this.hp = this.maxHp;
      this.attack = 450 + (level - 1) * 42;
      this.defense = 280 + (level - 1) * 28;
      this.speed = 205;
      this.aggroRange = 480;
      this.attackRange = 100;
      this.attackCooldown = 1400;
      this.expReward = 1250 + level * 120;
      this.size = 90;
    } else if (type === 'celestial_guard') {
      // Thái Cổ Thần Điện
      this.maxHp = 55000 + (level - 1) * 1600;
      this.hp = this.maxHp;
      this.attack = 650 + (level - 1) * 55;
      this.defense = 420 + (level - 1) * 36;
      this.speed = 215;
      this.aggroRange = 520;
      this.attackRange = 105;
      this.attackCooldown = 1350;
      this.expReward = 2000 + level * 160;
      this.size = 95;
    } else if (type === 'cultiv_fox') {
      // Quái Tu Tiên Bồng Lai: Máu gấp 20 lần quái thường phàm nhân, công kích dũng mãnh
      this.maxHp = 480000 + (level - 40) * 16000;
      this.hp = this.maxHp;
      this.attack = 3200 + (level - 40) * 80;
      this.defense = 1200 + (level - 40) * 35;
      this.speed = 230;
      this.aggroRange = 580;
      this.attackRange = 100;
      this.attackCooldown = 1300;
      this.expReward = 28000 + level * 500;
      this.size = 90;
    } else if (type === 'cultiv_snow') {
      // Quái Tu Tiên Dao Trì: Băng Tinh Thú, trâu khỏe gấp 20 lần
      this.maxHp = 1100000 + (level - 58) * 38000;
      this.hp = this.maxHp;
      this.attack = 6200 + (level - 58) * 130;
      this.defense = 2400 + (level - 58) * 60;
      this.speed = 215;
      this.aggroRange = 600;
      this.attackRange = 110;
      this.attackCooldown = 1350;
      this.expReward = 60000 + level * 850;
      this.size = 100;
    } else if (type === 'cultiv_demon') {
      // Quái Tu Tiên Thái Hư Huyễn Cảnh: Thần Ma cõi hư không cực hạn (x20 lần)
      this.maxHp = 2600000 + (level - 75) * 85000;
      this.hp = this.maxHp;
      this.attack = 12500 + (level - 75) * 220;
      this.defense = 4800 + (level - 75) * 90;
      this.speed = 225;
      this.aggroRange = 640;
      this.attackRange = 120;
      this.attackCooldown = 1300;
      this.expReward = 130000 + level * 1600;
      this.size = 110;
    } else {
      // Sơn Tặc Lạc Dương - Cân bằng lại
      this.maxHp = 3200 + (level - 1) * 300;
      this.hp = this.maxHp;
      this.attack = 95 + (level - 1) * 18;
      this.defense = 60 + (level - 1) * 10;
      this.speed = 190;
      this.aggroRange = 360;
      this.attackRange = 75;
      this.attackCooldown = 1450;
      this.expReward = 220 + level * 45;
      this.size = 65;
    }

    // QUÁI TINH ANH (ELITE): HP x3, Dame x1.4, Kích thước to hơn 25%, thưởng x3
    if (this.isElite && !this.isBoss) {
      this.maxHp = Math.round(this.maxHp * 3.0);
      this.hp = this.maxHp;
      this.attack = Math.round(this.attack * 1.4);
      this.defense = Math.round(this.defense * 1.3);
      this.size = Math.round(this.size * 1.25);
      this.expReward = this.expReward * 3;
    }
    
    this.state = 'idle';
    this.targetPlayerId = null;
    this.lastAttackTime = 0;
    this.lastSkillTime = 0;
    this.patrolTargetX = x;
    this.patrolTargetY = y;
    this.nextPatrolTime = Date.now() + 2000;
    this.deathTime = 0;
    this.respawnDelay = isBoss ? 45000 : (isElite ? 22000 : 12000);
  }
  
  // Vòng lặp AI
  update(dt, players, world) {
    if (this.state === 'dead') {
      if (Date.now() - this.deathTime >= this.respawnDelay) {
        this.respawn(world);
      }
      return;
    }

    // Tìm người chơi gần nhất trong map hiện tại
    let nearestDist = Infinity;
    let nearestPlayer = null;

    for (const p of Object.values(players)) {
      if (p.hp <= 0 || p.currentMap !== this.mapId) continue;
      // Nếu trong Khu An Toàn (Safezone) thì quái không tấn công
      const mapInfo = world.maps[this.mapId];
      if (mapInfo && mapInfo.safeZone) {
        const sz = mapInfo.safeZone;
        if (p.x >= sz.minX && p.x <= sz.maxX && p.y >= sz.minY && p.y <= sz.maxY) {
          continue;
        }
      }

      const dist = Math.hypot(p.x - this.x, p.y - this.y);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestPlayer = p;
      }
    }

    const now = Date.now();

    if (nearestPlayer && nearestDist <= this.aggroRange) {
      this.targetPlayerId = nearestPlayer.id;
      this.state = 'chase';
      
      const dx = nearestPlayer.x - this.x;
      const dy = nearestPlayer.y - this.y;
      this.angle = Math.atan2(dy, dx);

      if (nearestDist > this.attackRange) {
        const moveDist = this.speed * dt;
        this.x += (dx / nearestDist) * moveDist;
        this.y += (dy / nearestDist) * moveDist;
      } else {
        // Tấn công cơ bản
        if (now - this.lastAttackTime >= this.attackCooldown) {
          this.lastAttackTime = now;
          this.performAttack(nearestPlayer, world);
        }
      }

      // Kỹ năng đặc biệt của Boss
      if (this.isBoss && now - this.lastSkillTime >= 6500 && nearestDist <= 380) {
        this.lastSkillTime = now;
        this.performBossSkill(nearestPlayer, world);
      }

    } else {
      // Tuần tra ngẫu nhiên
      this.targetPlayerId = null;
      this.state = 'idle';

      if (now >= this.nextPatrolTime) {
        this.nextPatrolTime = now + 3000 + Math.random() * 4000;
        const rad = Math.random() * Math.PI * 2;
        const d = 50 + Math.random() * 120;
        this.patrolTargetX = this.spawnX + Math.cos(rad) * d;
        this.patrolTargetY = this.spawnY + Math.sin(rad) * d;
      }

      const pdx = this.patrolTargetX - this.x;
      const pdy = this.patrolTargetY - this.y;
      const pDist = Math.hypot(pdx, pdy);

      if (pDist > 10) {
        this.angle = Math.atan2(pdy, pdx);
        const pMove = (this.speed * 0.45) * dt;
        this.x += (pdx / pDist) * pMove;
        this.y += (pdy / pDist) * pMove;
      }
    }
  }

  performAttack(player, world) {
    const isMaster = player && (player.username === 'xomno01' || player.name === 'Matcha');
    const isCrit = Math.random() < 0.15;
    let rawDmg = Math.floor(this.attack * (isCrit ? 1.6 : 1.0));

    // ĐẶC QUYỀN ACC CHÍNH: Hộ Thể Kim Cang Bất Hoại, quái đánh chỉ mất 10% dame
    if (isMaster) {
      rawDmg = Math.max(1, Math.floor(rawDmg * 0.1));
    }

    const result = player.takeDamage(rawDmg, isCrit);

    world.io.emit('damage_popup', {
      mapId: this.mapId,
      targetId: player.id,
      x: player.x,
      y: player.y - 30,
      damage: result.damage,
      isCrit: result.isCrit,
      dodged: result.dodged,
      isPlayer: true
    });
  }

  performBossSkill(player, world) {
    const sName = this.isRevenantBoss ? '💀 Ma Hồn Thôn Thiên' : 'Ma Hỏa Liệt Địa';
    world.io.emit('boss_skill_cast', {
      mapId: this.mapId,
      bossId: this.id,
      skillName: sName,
      x: this.x,
      y: this.y,
      targetX: player.x,
      targetY: player.y,
      isRevenant: this.isRevenantBoss
    });

    const aoeRadius = this.isRevenantBoss ? 450 : 350;
    const dmgMultiplier = this.isRevenantBoss ? 2.5 : 2.2;

    for (const p of Object.values(world.players)) {
      if (p.hp <= 0 || p.currentMap !== this.mapId) continue;
      const dist = Math.hypot(p.x - this.x, p.y - this.y);
      if (dist <= aoeRadius) {
        const isMaster = p.username === 'xomno01' || p.name === 'Matcha';
        let rawDmg = Math.floor(this.attack * dmgMultiplier);
        if (isMaster) rawDmg = Math.max(1, Math.floor(rawDmg * 0.1));

        const result = p.takeDamage(rawDmg, true);
        world.io.emit('damage_popup', {
          mapId: this.mapId,
          targetId: p.id,
          x: p.x,
          y: p.y - 35,
          damage: result.damage,
          isCrit: true,
          dodged: result.dodged,
          isPlayer: true
        });
      }
    }
  }

  takeDamage(amount, attacker) {
    const isMaster = attacker && (attacker.username === 'xomno01' || attacker.name === 'Matcha');
    let realDamage = amount;

    if (isMaster) {
      // ĐẶC QUYỀN ACC CHÍNH: Bá đạo vô địch, gây 150% sát thương xuyên thủng mọi giáp quái!
      realDamage = Math.floor(amount * 1.5);
    } else {
      // CÂN BẰNG NGƯỜI CHƠI THƯỜNG: Quái vật áp dụng phòng thủ thực tế
      const def = this.defense || 50;
      const reduction = Math.min(0.75, def / (def + 280));
      realDamage = Math.max(5, Math.floor(amount * (1 - reduction)));
    }

    this.hp = Math.max(0, this.hp - realDamage);
    if (attacker && !this.targetPlayerId) {
      this.targetPlayerId = attacker.id;
    }
    const dead = this.hp <= 0;
    if (dead) {
      this.state = 'dead';
      this.deathTime = Date.now();
    }
    return { damage: realDamage, dead };
  }
  
  respawn(world = null) {
    // NGUYÊN HỒN ÁC HÓA LÀ BOSS SỰ KIỆN DUY NHẤT, KHÔNG TỰ HỒI SINH
    if (this.isRevenantBoss) return;

    this.x = this.spawnX;
    this.y = this.spawnY;
    this.hp = this.maxHp;
    this.state = 'idle';
    this.targetPlayerId = null;

    if (this.isBoss && world) {
      const mapName = world.maps[this.mapId] ? world.maps[this.mapId].name : this.mapId;
      world.broadcastNotice(`THIÊN ĐỊA DỊ BIẾN! Đại Boss [${this.name}] vừa hồi sinh giáng thế tại [${mapName}]!`, 'boss_kill');
    }
  }
  
  toClientState() {
    return {
      id: this.id,
      mapId: this.mapId,
      type: this.type,
      name: this.name,
      level: this.level,
      isBoss: this.isBoss,
      isElite: this.isElite,
      isCultivBoss: !!this.isCultivBoss,
      bossRarity: this.bossRarity || null,
      isRevenantBoss: this.isRevenantBoss || false,
      revenantOwnerName: this.revenantOwnerName || null,
      revenantOwnerSect: this.revenantOwnerSect || null,
      revenantOwnerCultivSect: this.revenantOwnerCultivSect || null,
      revenantOwnerRealm: this.revenantOwnerRealm || null,
      x: Math.round(this.x),
      y: Math.round(this.y),
      angle: Number(this.angle.toFixed(2)),
      hp: this.hp,
      maxHp: this.maxHp,
      state: this.state,
      size: this.size
    };
  }
}

module.exports = { Monster };
