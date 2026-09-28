// Âm Thanh Kiếm Hiệp Chuẩn Studio - Web Audio API Synthesizer
// Tái hiện sống động tiếng đao kiếm, chưởng phong, khinh công và nhạc ngũ cung Đàn Tranh

class AudioEngine {
  constructor() {
    this.ctx = null;
    this.unlocked = false;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmTimer = null;
  }

  initAudioContext() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch (e) {
      console.warn('Web Audio API không được hỗ trợ:', e);
    }
  }

  unlock() {
    if (this.unlocked && this.ctx && this.ctx.state === 'running') return;
    this.initAudioContext();
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().then(() => {
          this.unlocked = true;
          if (!this.isMuted && !this.bgmPlaying) {
            this.startBGM();
          }
        }).catch(() => {});
      } else if (this.ctx.state === 'running') {
        this.unlocked = true;
        if (!this.isMuted && !this.bgmPlaying) {
          this.startBGM();
        }
      }
    }
  }

  isReady() {
    return Boolean(this.unlocked && this.ctx && this.ctx.state === 'running' && !this.isMuted);
  }

  resume() {
    if (this.unlocked && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.bgmPlaying) {
      this.stopBGM();
    } else if (!this.isMuted && !this.bgmPlaying) {
      this.startBGM();
    }
    return this.isMuted;
  }

  // 1. Tiếng Kiếm Tuốt Vỏ (Sword Draw / Unsheathe)
  playSwordDraw() {
    if (!this.isReady()) return;
    const now = this.ctx.currentTime;
    
    // Kim loại vang sắc nhọn
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(3200, now + 0.12);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.36);
  }

  // 2. Tiếng Kiếm Chém Xé Gió (Sword Slash)
  playSwordSlash() {
    if (!this.isReady()) return;
    const now = this.ctx.currentTime;

    // White noise sweep
    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.frequency.exponentialRampToValueAtTime(2800, now + 0.08);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.18);
    filter.Q.value = 3.5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    whiteNoise.start(now);
  }

  // 3. Tiếng Binh Khí Va Chạm (Metal Clash / Parry)
  playMetalClash() {
    if (!this.isReady()) return;
    const now = this.ctx.currentTime;

    // Hai sóng sine lệch pha tạo tiếng keng kim khí vang dội
    [880, 1760, 2400].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = idx === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq + Math.random() * 50, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.25);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.32);
    });
  }

  // 4. Tiếng Kiếm Khí Phóng Ra (Sword Aura Projectile)
  playSwordAura() {
    if (!this.isReady()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.35);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // 5. Tiếng Khinh Công Lướt Gió (Dash / Wind Step)
  playDash() {
    if (!this.isReady()) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(680, now + 0.1);
    osc.frequency.exponentialRampToValueAtTime(150, now + 0.28);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.3);
  }

  // 6. Tiếng Nổ Chưởng Lực / Bạo Kích (Impact Blast)
  playImpact() {
    if (!this.isReady()) return;
    const now = this.ctx.currentTime;

    // Sub bass punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.26);
  }

  // 7. Tiếng Nhặt Vàng / Bảo Thạch (Loot Coin Chime)
  playLoot() {
    if (!this.isReady()) return;
    const now = this.ctx.currentTime;

    [1046.5, 1318.5, 1567.98].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.06);

      gain.gain.setValueAtTime(0.18, now + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.06 + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.06);
      osc.stop(now + idx * 0.06 + 0.26);
    });
  }

  // 8. Tiếng Thăng Cấp Đột Phá Cảnh Giới (Level Up)
  playLevelUp() {
    if (!this.isReady()) return;
    const now = this.ctx.currentTime;

    // Ngũ cung thăng hoa: C, D, E, G, A, C (đàn tranh dạo khúc)
    const notes = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.5];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.09);

      gain.gain.setValueAtTime(0.25, now + idx * 0.09);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now + idx * 0.09);
      osc.stop(now + idx * 0.09 + 0.52);
    });
  }

  // 9. NHẠC NỀN BGM CỔ PHONG - ĐÀN TRANH GUZHENG NGŨ CUNG
  startBGM() {
    if (!this.isReady() || this.bgmPlaying) return;
    this.bgmPlaying = true;

    // Giai điệu ngũ cung: C4, D4, E4, G4, A4, C5, D5, E5 (Cung - Thương - Giốc - Chủy - Vũ)
    const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const sequence = [
      0, 2, 4, 3, 2, 4, 5, 4,
      3, 2, 0, 1, 2, 0, 4, 2,
      4, 5, 7, 5, 4, 3, 2, 4,
      2, 0, 1, 0, 2, 4, 3, 0
    ];
    let noteIdx = 0;

    const playNextNote = () => {
      if (!this.bgmPlaying || this.isMuted) return;

      const now = this.ctx.currentTime;
      const freq = pentatonic[sequence[noteIdx % sequence.length]];
      noteIdx++;

      // Tiếng gảy dây đàn tranh (Plucked String Physical Modeling / Decay)
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.09, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1500, now);
      filter.frequency.exponentialRampToValueAtTime(400, now + 1.2);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);

      // Nhịp điệu lững lờ 480ms - 960ms
      const delay = (noteIdx % 4 === 0) ? 960 : 480;
      this.bgmTimer = setTimeout(playNextNote, delay);
    };

    playNextNote();
  }

  stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

window.AudioEngine = AudioEngine;
