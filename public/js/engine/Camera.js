// Hệ Thống Camera Mượt Mà & Hiệu Ứng Rung Màn Hình (Screen Shake)

class Camera {
  constructor(viewportWidth, viewportHeight, worldWidth, worldHeight) {
    this.viewportWidth = viewportWidth;
    this.viewportHeight = viewportHeight;
    this.worldWidth = worldWidth;
    this.worldHeight = worldHeight;
    
    this.x = worldWidth / 2;
    this.y = worldHeight / 2;
    this.targetX = this.x;
    this.targetY = this.y;
    
    // Độ mượt (Smooth follow lerp factor)
    this.smoothSpeed = 0.08;
    
    // Screen Shake
    this.shakeIntensity = 0;
    this.shakeDuration = 0;
    this.shakeOffsetX = 0;
    this.shakeOffsetY = 0;
  }

  resize(w, h) {
    this.viewportWidth = w;
    this.viewportHeight = h;
  }

  follow(targetX, targetY) {
    this.targetX = targetX;
    this.targetY = targetY;
  }

  shake(intensity = 10, duration = 250) {
    // Nếu có modal đang mở (Boss Hunt, Túi Đồ, Nhân Vật...) -> KHÔNG RUNG để người chơi không bị nhảy màn hình/chóng mặt
    if (typeof document !== 'undefined' && document.querySelector('.wuxia-modal.active')) {
      this.shakeIntensity = 0;
      this.shakeDuration = 0;
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
      return;
    }
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
  }

  update(dt) {
    if (isNaN(this.x) || !isFinite(this.x)) this.x = (this.worldWidth || 2800) / 2;
    if (isNaN(this.y) || !isFinite(this.y)) this.y = (this.worldHeight || 1800) / 2;
    if (isNaN(this.targetX) || !isFinite(this.targetX)) this.targetX = this.x;
    if (isNaN(this.targetY) || !isFinite(this.targetY)) this.targetY = this.y;

    const wW = Math.max(1200, this.worldWidth || 2800);
    const wH = Math.max(800, this.worldHeight || 1800);

    // Lerp di chuyển camera về phía nhân vật
    this.x += (this.targetX - this.x) * (1 - Math.pow(1 - this.smoothSpeed, dt * 60));
    this.y += (this.targetY - this.y) * (1 - Math.pow(1 - this.smoothSpeed, dt * 60));
    
    // Giữ camera không lọt ra ngoài bản đồ
    const halfW = (this.viewportWidth || 1200) / 2;
    const halfH = (this.viewportHeight || 800) / 2;
    this.x = Math.max(halfW, Math.min(wW - halfW, this.x));
    this.y = Math.max(halfH, Math.min(wH - halfH, this.y));
    
    // Cập nhật rung màn hình
    if (this.shakeDuration > 0) {
      this.shakeDuration -= dt * 1000;
      this.shakeOffsetX = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeOffsetY = (Math.random() - 0.5) * this.shakeIntensity * 2;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - dt * 25);
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  // Chuyển đổi tọa độ World -> Screen
  worldToScreen(worldX, worldY) {
    return {
      x: worldX - this.x + this.viewportWidth / 2 + this.shakeOffsetX,
      y: worldY - this.y + this.viewportHeight / 2 + this.shakeOffsetY
    };
  }

  // Chuyển đổi tọa độ Screen -> World (để click chuột chuẩn)
  screenToWorld(screenX, screenY) {
    return {
      x: screenX - this.viewportWidth / 2 + this.x - this.shakeOffsetX,
      y: screenY - this.viewportHeight / 2 + this.y - this.shakeOffsetY
    };
  }
}

window.Camera = Camera;
