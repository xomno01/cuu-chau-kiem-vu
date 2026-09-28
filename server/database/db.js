const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { CULTIVATION_REALMS } = require('../game/CultivationSystem');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'game_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class Database {
  constructor() {
    this.data = {
      users: {} // username -> { passwordHash, characters: { charId: charData } }
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf8');
        this.data = JSON.parse(raw);
        console.log(`[Database] Đã nạp thành công CSDL: ${Object.keys(this.data.users).length} tài khoản.`);
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[Database] Lỗi khi nạp dữ liệu DB:', err);
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf8');
    } catch (err) {
      console.error('[Database] Lỗi khi ghi dữ liệu DB:', err);
    }
  }

  hashPassword(password) {
    return crypto.createHash('sha256').update(password + '_cuuchau_salt_2026').digest('hex');
  }

  register(username, password) {
    username = (username || '').trim().toLowerCase();
    if (!username || username.length < 3) {
      return { success: false, msg: 'Tên tài khoản phải có ít nhất 3 ký tự!' };
    }
    if (!password || password.length < 4) {
      return { success: false, msg: 'Mật khẩu phải có ít nhất 4 ký tự!' };
    }
    if (this.data.users[username]) {
      return { success: false, msg: 'Tài khoản này đã tồn tại trên giang hồ!' };
    }

    const passwordHash = this.hashPassword(password);
    this.data.users[username] = {
      username,
      passwordHash,
      createdAt: Date.now(),
      characters: {}
    };
    this.save();
    return { success: true, msg: 'Đăng ký tài khoản thành công!', username };
  }

  login(username, password) {
    username = (username || '').trim().toLowerCase();
    const user = this.data.users[username];
    if (!user) {
      return { success: false, msg: 'Tài khoản không tồn tại!' };
    }
    if (user.passwordHash !== this.hashPassword(password)) {
      return { success: false, msg: 'Mật khẩu không chính xác!' };
    }

    const charList = Object.values(user.characters).map(c => {
      const realmName = c.realm || (CULTIVATION_REALMS[c.realmIdx] ? CULTIVATION_REALMS[c.realmIdx].name : 'Luyện Khí Tầng 1');
      return {
        id: c.id,
        name: c.name,
        sect: c.sect,
        cultivSect: c.cultivSect || null,
        level: c.level || 1,
        realm: realmName,
        realmIdx: c.realmIdx || 0,
        combatPower: c.combatPower || 1000,
        age: c.age || 18,
        maxLifespan: c.maxLifespan || 100,
        isDeadPerm: !!c.isDeadPerm,
        lastSaved: c.lastSaved || Date.now()
      };
    });

    return {
      success: true,
      msg: 'Đăng nhập thành công!',
      username,
      characters: charList
    };
  }

  getLeaderboard(onlinePlayers = {}) {
    const allChars = [];
    const onlineMap = {};
    for (const [id, p] of Object.entries(onlinePlayers)) {
      if (p && p.name) {
        onlineMap[p.name.toLowerCase()] = p;
      }
    }

    for (const u of Object.values(this.data.users)) {
      for (const c of Object.values(u.characters)) {
        if (!c || !c.name) continue;
        const onlineP = onlineMap[c.name.toLowerCase()];
        const realmName = onlineP 
          ? (typeof onlineP.getRealmName === 'function' ? onlineP.getRealmName() : (onlineP.realm || 'Luyện Khí Tầng 1'))
          : (c.realm || (CULTIVATION_REALMS[c.realmIdx] ? CULTIVATION_REALMS[c.realmIdx].name : 'Luyện Khí Tầng 1'));

        const power = onlineP 
          ? (typeof onlineP.getCombatPower === 'function' ? onlineP.getCombatPower() : (onlineP.combatPower || 1000))
          : (c.combatPower || (c.level ? c.level * 1250 : 1000));

        allChars.push({
          id: c.id,
          name: c.name,
          username: u.username,
          sect: onlineP ? onlineP.sect : (c.sect || 'huashan'),
          cultivSect: onlineP ? onlineP.cultivSect : (c.cultivSect || null),
          level: onlineP ? onlineP.level : (c.level || 1),
          realm: realmName,
          combatPower: Math.round(power),
          isOnline: !!onlineP,
          currentMap: onlineP ? onlineP.currentMap : (c.currentMap || 'lac_duong'),
          isDeadPerm: !!c.isDeadPerm
        });
      }
    }

    // Sắp xếp Lực Chiến giảm dần
    allChars.sort((a, b) => b.combatPower - a.combatPower);
    return allChars.slice(0, 50);
  }

  createCharacter(username, name, sect) {
    username = (username || '').trim().toLowerCase();
    name = (name || '').trim();
    if (!this.data.users[username]) {
      return { success: false, msg: 'Tài khoản không hợp lệ!' };
    }
    if (!name || name.length < 2 || name.length > 24) {
      return { success: false, msg: 'Tên nhân vật phải từ 2 đến 24 ký tự!' };
    }

    // Kiểm tra trùng tên nhân vật trên toàn bộ server
    for (const u of Object.values(this.data.users)) {
      for (const c of Object.values(u.characters)) {
        if (c.name.toLowerCase() === name.toLowerCase()) {
          return { success: false, msg: 'Tên nhân vật này đã có người sử dụng!' };
        }
      }
    }

    const charId = 'char_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const newChar = {
      id: charId,
      name,
      sect: sect || 'huashan',
      cultivSect: null,
      level: 1,
      exp: 0,
      realmIdx: 0,
      tuvi: 0,
      age: 18,
      maxLifespan: 100,
      isDeadPerm: false,
      gold: 3500,
      createdAt: Date.now(),
      lastSaved: Date.now()
    };

    this.data.users[username].characters[charId] = newChar;
    this.save();

    return { success: true, msg: 'Tạo nhân vật thành công!', character: newChar };
  }

  getCharacter(username, charId) {
    username = (username || '').trim().toLowerCase();
    const user = this.data.users[username];
    if (!user || !user.characters[charId]) return null;
    return user.characters[charId];
  }

  saveCharacter(username, charId, charData) {
    username = (username || '').trim().toLowerCase();
    const user = this.data.users[username];
    if (!user) return false;

    charData.lastSaved = Date.now();
    user.characters[charId] = {
      ...user.characters[charId],
      ...charData
    };
    this.save();
    return true;
  }

  deleteCharacter(username, charId) {
    username = (username || '').trim().toLowerCase();
    const user = this.data.users[username];
    if (!user || !user.characters[charId]) return false;
    delete user.characters[charId];
    this.save();
    return true;
  }
}

const db = new Database();
module.exports = { db };
