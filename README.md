# CỬU CHÂU KIẾM VŨ ONLINE (NINE CONTINENTS: SWORD DANCE)
### Webgame Kiếm Hiệp Real-Time MMORPG · Kiến Trúc Chuẩn Production

Tác phẩm webgame kiếm hiệp hoàn chỉnh, tích hợp đồ họa AI art pipeline, âm thanh Web Audio procedural synthesizer, chuyển động 60FPS lock và máy chủ Socket.io đồng bộ thời gian thực.

---

## 🗡 1. Tổng Quan Trò Chơi
* **Tên Game**: Cửu Châu Kiếm Vũ (Thiên Ngoại Kiếm · Giang Hồ Kỳ Duyên)
* **Thể Loại**: Web MMORPG / ARPG Thời Gian Thực (Top-down Isometric Canvas 2D)
* **Phong Cách**: Cổ phong Thủy mặc - Hoàng kim thời Đường Tống (Wuxia Cinematic)
* **Môn Phái**:
  1. **Hoa Sơn Kiếm Phái**: Kiếm pháp thần tốc, bạo kích cực cao, trảm sát vạn địch (Kỹ năng: *Tật Phong Kiếm Khí, Vạn Kiếm Quy Tông, Tử Hà Hộ Thể, Thiên Ngoại Phi Tiên*).
  2. **Tiêu Dao Tiên Tông**: Lăng Ba Vi Bộ hư ảo, hút nội lực chuyển hóa sinh mệnh (Kỹ năng: *Thiên Sơn Lục Dương Chưởng, Bắc Minh Thần Công, Bát Quái Hộ Trận, Lăng Ba Tuyệt Ảo*).
* **Hệ Thống Phím Tắt & Thao Tác**:
  * **Chuột Trái**: Di chuyển tới vị trí chỉ định / Nhặt đồ báu vật rơi.
  * **Chuột Phải**: Tấn công cơ bản (Kiếm Pháp chém xé gió).
  * **Phím 1, 2, 3, 4 (hoặc Q, W, E, R)**: Thi triển 4 chiêu thức võ công môn phái.
  * **Phím SPACE**: Khinh Công Đạp Ba (Dash né đòn chém của địch).
  * **Phím W, A, S, D**: Di chuyển 8 hướng.
  * **Phím Z**: Bật / Tắt chế độ Tự Động Luyện Cấp (Auto Combat AI).
  * **Phím B**: Mở Hành Trang & Trang Bị (16 ô túi đồ + 4 ô trang bị).
  * **Phím K**: Mở Kinh Mạch Bát Huyệt (Đốc, Nhâm, Xung, Đới Mạch).
  * **Phím L**: Bảng Xếp Hạng Thập Đại Cao Thủ Cửu Châu.
  * **Phím Q**: Sổ Tay Nhiệm Vụ Giang Hồ.
  * **Phím M**: Bật / Tắt Nhạc Nền Đàn Tranh Guzheng Cổ Phong.
  * **Phím Enter**: Nhắn tin Kênh Chat Giang Hồ.

---

## 🏛 2. Cấu Trúc Thư Mục Chuẩn Studio

```
cuu-chau-kiem-vu/
├── package.json                   # Cấu hình dự án & thư viện (express, socket.io, cors)
├── README.md                      # Tài liệu hướng dẫn chi tiết
├── server/                        # MÁY CHỦ BACKEND (Node.js)
│   ├── server.js                  # Entry server Express + Socket.io, tick loop 30fps
│   └── game/                      # Logic cốt lõi của game
│       ├── World.js               # Quản lý thế giới, combat hitbox, projectile, drops, safe zone
│       ├── Player.js              # Mô hình người chơi, stats, kinh mạch, inventory, level
│       ├── Monster.js             # Quái thường (Sơn Tặc) & World Boss (Hắc Phong Ma Tôn) AI
│       ├── Skills.js              # Bảng dữ liệu võ học Hoa Sơn & Tiêu Dao
│       └── Items.js               # Bảng dữ liệu 9 Thần binh, đan dược, bí tịch hoàng kim
├── public/                        # MÁY KHÁCH FRONTEND (Client)
│   ├── index.html                 # Giao diện chính, màn hình chọn phái, HUD, Modals
│   ├── css/
│   │   └── game.css               # Thiết kế Thủy Mặc Cổ Phong, viền vàng hoàng kim
│   ├── js/
│   │   ├── main.js                # Game loop 60fps, điều khiển input, socket handlers
│   │   ├── engine/
│   │   │   ├── Renderer.js        # Canvas Renderer, vẽ map, entities, shadows, minimap
│   │   │   ├── Camera.js          # Smooth lerp camera follow, screen shake bạo kích
│   │   │   ├── Particles.js       # Hạt hoa đào bay, tàn ảnh khinh công, vạn kiếm storm
│   │   │   └── AudioEngine.js     # Web Audio API Synthesizer (SFX kiếm kích + BGM đàn tranh)
│   │   └── ui/
│   │       └── UIManager.js       # Điều khiển HUD máu/mana, túi đồ, kinh mạch, chat
│   └── assets/
│       ├── images/                # Assets đã qua xử lý (world_map, sprites trong suốt, avatars)
│       ├── icons/                 # 9 icons kỹ năng & 9 icons trang bị đã crop
│       └── raw/                   # Assets gốc do AI Gemini sinh ra
└── scripts/
    ├── process_assets.py          # Python Script tách nền đen, cắt lưới 3x3 icons, scale map
    └── test_socket.js             # Script tự động test full luồng kết nối và combat
```

---

## 🚀 3. Hướng Dẫn Khởi Chạy

### Cách 1: Khởi động Server Game
Mở PowerShell tại thư mục `C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu`:
```bash
npm start
```
Server sẽ chạy tại: **`http://localhost:3000`**

### Cách 2: Trải nghiệm Trực Tiếp
Mở trình duyệt bất kỳ (Chrome, Edge, Firefox, Cốc Cốc) và truy cập:
👉 **`http://localhost:3000`**

Hệ thống hỗ trợ nhiều người chơi cùng lúc kết nối vào cùng 1 map để cùng luyện cấp, giao tiếp chat võ lâm, tỉ võ và liên thủ săn Boss Ma Tôn!
