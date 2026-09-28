# -*- coding: utf-8 -*-
"""
Script tạo toàn bộ kho Asset Đồ Họa cho Cửu Châu Kiếm Vũ Online V3:
- 2 Môn Phái mới: Thiếu Lâm (Shaolin), Võ Đang (Wudang) [Sprite + Avatar]
- 3 Bản đồ mới: Côn Lôn Tuyết Sơn, Hoàng Sa Cổ Thành, Thái Cổ Thần Điện [Map + Minimap]
- Vật phẩm mới: Giám Định Phù, Đá Cường Hóa, Bùa Bảo Hộ, Kim Cương Tạc (Đục Lỗ)
- 6 Loại Ngọc Khảm: Hồng Ngọc, Lam Ngọc, Hoàng Ngọc, Lục Ngọc, Tử Ngọc, Hổ Phách
- Icon kỹ năng võ học mới cho Thiếu Lâm & Võ Đang
- Icon các bộ trang bị Set Thần Long, Bắc Minh, Kim Cang
"""

import os
import sys
import math
import random
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

OUTPUT_IMAGES = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\images"
OUTPUT_ICONS = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\icons"

os.makedirs(OUTPUT_IMAGES, exist_ok=True)
os.makedirs(OUTPUT_ICONS, exist_ok=True)

print("[1/5] Khoi tao Asset Generator...")

# -------------------------------------------------------------
# 1. TẠO SPRITE & AVATAR THIẾU LÂM (SHAOLIN) & VÕ ĐANG (WUDANG)
# -------------------------------------------------------------
def create_shaolin_hero():
    # 256x256 sprite
    im = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    
    # 1. Hào quang Kim Cang Bồ Đề vàng kim phía sau
    for r in range(110, 40, -10):
        alpha = int(140 * (1 - r / 110))
        d.ellipse([128 - r, 128 - r, 128 + r, 128 + r], fill=(251, 191, 36, alpha))
        
    # Vòng tròn chữ Vạn / Phật quang
    d.ellipse([68, 68, 188, 188], outline=(245, 158, 11, 200), width=4)
    for ang in range(0, 360, 45):
        rad = math.radians(ang)
        x1 = 128 + int(math.cos(rad) * 60)
        y1 = 128 + int(math.sin(rad) * 60)
        x2 = 128 + int(math.cos(rad) * 75)
        y2 = 128 + int(math.sin(rad) * 75)
        d.line([x1, y1, x2, y2], fill=(253, 230, 138, 220), width=3)

    # 2. Thân thể Tăng Nhân Thiếu Lâm
    # Chân và quần tăng lữ
    d.polygon([(90, 190), (115, 190), (105, 240), (85, 240)], fill=(217, 119, 6)) # chân trái
    d.polygon([(141, 190), (166, 190), (171, 240), (151, 240)], fill=(217, 119, 6)) # chân phải
    # Giày vải bọc xà cạp trắng
    d.rectangle([82, 230, 107, 246], fill=(241, 245, 249), outline=(71, 85, 105), width=2)
    d.rectangle([149, 230, 174, 246], fill=(241, 245, 249), outline=(71, 85, 105), width=2)

    # Thân áo Cà Sa vàng nghệ & cam lửa
    d.polygon([(80, 105), (176, 105), (185, 200), (71, 200)], fill=(234, 88, 12))
    # Dải cà sa vàng kim chéo qua vai
    d.polygon([(95, 105), (145, 105), (175, 200), (125, 200)], fill=(251, 191, 36), outline=(180, 83, 9), width=2)
    # Thắt lưng đai phật tử
    d.rectangle([75, 155, 181, 172], fill=(120, 53, 15), outline=(245, 158, 11), width=2)
    d.ellipse([116, 153, 140, 174], fill=(251, 191, 36), outline=(217, 119, 6), width=2)

    # Tràng hạt bồ đề quanh cổ
    for deg in range(30, 151, 15):
        rad = math.radians(deg)
        bx = 128 + int(math.cos(rad) * 36)
        by = 92 + int(math.sin(rad) * 22)
        d.ellipse([bx - 5, by - 5, bx + 5, by + 5], fill=(120, 53, 15), outline=(251, 191, 36), width=1)

    # Đầu tăng nhân thanh tịnh
    d.ellipse([106, 52, 150, 102], fill=(254, 215, 170), outline=(217, 119, 6), width=2)
    # Dấu giới hương (6 chấm trên trán)
    for row in range(2):
        for col in range(3):
            d.ellipse([120 + col * 5, 62 + row * 5, 123 + col * 5, 65 + row * 5], fill=(220, 38, 38))
    # Mắt uy nghiêm
    d.line([115, 78, 124, 77], fill=(15, 23, 42), width=3)
    d.line([132, 77, 141, 78], fill=(15, 23, 42), width=3)
    # Lông mày kiếm
    d.line([113, 73, 125, 72], fill=(69, 26, 3), width=2)
    d.line([131, 72, 143, 73], fill=(69, 26, 3), width=2)

    # Cửu Hoàn Thiền Trượng (Vũ khí Phật môn)
    d.line([195, 25, 195, 245], fill=(180, 83, 9), width=7)
    # Đỉnh trượng vàng có các vòng khoen
    d.ellipse([180, 15, 210, 48], outline=(251, 191, 36), width=5, fill=(245, 158, 11))
    d.ellipse([187, 24, 203, 39], outline=(254, 240, 138), width=3)
    for dy in [20, 32, 44]:
        d.ellipse([175, dy, 185, dy + 10], outline=(253, 224, 71), width=2)
        d.ellipse([205, dy, 215, dy + 10], outline=(253, 224, 71), width=2)

    # Cánh tay lực lưỡng cầm thiền trượng & thủ ấn
    d.polygon([(165, 115), (198, 140), (192, 155), (160, 130)], fill=(254, 215, 170), outline=(180, 83, 9), width=2) # tay phải nắm trượng
    d.polygon([(90, 115), (70, 135), (82, 145), (100, 125)], fill=(254, 215, 170), outline=(180, 83, 9), width=2) # tay trái lập chưởng ấn

    im.save(os.path.join(OUTPUT_IMAGES, "hero_shaolin.png"))
    
    # Avatar 80x80
    avatar = im.crop((85, 40, 175, 130)).resize((80, 80), Image.Resampling.LANCZOS)
    avatar.save(os.path.join(OUTPUT_IMAGES, "avatar_shaolin.png"))
    print("  [OK] Đã tạo hero_shaolin.png & avatar_shaolin.png")

def create_wudang_hero():
    # 256x256 sprite
    im = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)

    # 1. Hào quang Thái Cực Bát Quái xanh lam & trắng
    for r in range(112, 40, -10):
        alpha = int(130 * (1 - r / 112))
        d.ellipse([128 - r, 128 - r, 128 + r, 128 + r], fill=(56, 189, 248, alpha))
    
    # Vòng tròn Bát Quái
    d.ellipse([64, 64, 192, 192], outline=(14, 165, 233, 220), width=4)
    # Vẽ biểu tượng Âm Dương Thái Cực
    d.chord([88, 88, 168, 168], 90, 270, fill=(248, 250, 252, 180))
    d.chord([88, 88, 168, 168], 270, 90, fill=(15, 23, 42, 180))
    d.ellipse([108, 88, 148, 128], fill=(248, 250, 252, 180))
    d.ellipse([108, 128, 148, 168], fill=(15, 23, 42, 180))
    d.ellipse([124, 104, 132, 112], fill=(15, 23, 42, 220))
    d.ellipse([124, 144, 132, 152], fill=(248, 250, 252, 220))

    # 2. Thân thể Đạo Sĩ Võ Đang
    # Quần vải trắng xanh
    d.polygon([(90, 190), (115, 190), (105, 240), (85, 240)], fill=(224, 242, 254))
    d.polygon([(141, 190), (166, 190), (171, 240), (151, 240)], fill=(224, 242, 254))
    d.rectangle([82, 230, 107, 246], fill=(15, 23, 42), outline=(56, 189, 248), width=2)
    d.rectangle([149, 230, 174, 246], fill=(15, 23, 42), outline=(56, 189, 248), width=2)

    # Đạo Bào Thái Cực lam ngọc và trắng tinh khôi
    d.polygon([(75, 100), (181, 100), (195, 205), (61, 205)], fill=(248, 250, 252))
    # Vạt áo lam ngọc
    d.polygon([(100, 100), (156, 100), (180, 205), (130, 205)], fill=(30, 58, 138), outline=(56, 189, 248), width=2)
    # Thắt lưng bát quái đạo gia
    d.rectangle([70, 150, 186, 168], fill=(2, 132, 199), outline=(186, 230, 253), width=2)
    d.ellipse([115, 146, 141, 172], fill=(255, 255, 255), outline=(14, 165, 233), width=3)

    # Dải lụa bay phất phơ (Kiếm tiên phong phạm)
    d.line([65, 160, 40, 220], fill=(56, 189, 248), width=4)
    d.line([190, 160, 215, 220], fill=(56, 189, 248), width=4)

    # Đầu đạo sĩ & búi tóc đạo quan
    d.ellipse([106, 50, 150, 100], fill=(254, 215, 170), outline=(3, 105, 161), width=2)
    # Tóc đen buộc búi đạo quán
    d.polygon([(102, 58), (154, 58), (145, 45), (111, 45)], fill=(15, 23, 42))
    d.rectangle([120, 32, 136, 46], fill=(56, 189, 248), outline=(255, 255, 255), width=2)
    d.line([115, 40, 141, 40], fill=(251, 191, 36), width=3) # Trâm ngọc

    # Đôi mắt sáng như sao băng
    d.line([115, 76, 124, 76], fill=(14, 116, 144), width=3)
    d.line([132, 76, 141, 76], fill=(14, 116, 144), width=3)

    # Chân Vũ Kiếm (Vũ khí Võ Đang)
    d.line([60, 30, 60, 235], fill=(203, 213, 225), width=5)
    d.line([48, 85, 72, 85], fill=(251, 191, 36), width=4) # đốc kiếm vàng
    d.rectangle([56, 85, 64, 115], fill=(30, 41, 59)) # chuôi kiếm
    # Kiếm khí xanh biếc bao bọc
    d.line([59, 25, 59, 85], fill=(56, 189, 248), width=3)

    im.save(os.path.join(OUTPUT_IMAGES, "hero_wudang.png"))
    avatar = im.crop((85, 30, 175, 120)).resize((80, 80), Image.Resampling.LANCZOS)
    avatar.save(os.path.join(OUTPUT_IMAGES, "avatar_wudang.png"))
    print("  [OK] Đã tạo hero_wudang.png & avatar_wudang.png")

# -------------------------------------------------------------
# 2. TẠO 3 MAP MỚI (CÔN LÔN TUYẾT SƠN, HOÀNG SA CỔ THÀNH, THÁI CỔ THẦN ĐIỆN)
# -------------------------------------------------------------
def create_snow_mountain_map():
    # 2800 x 1800 map
    w, h = 2800, 1800
    im = Image.new("RGB", (w, h), (224, 242, 254))
    d = ImageDraw.Draw(im)

    # Nền tuyết trắng băng giá chuyển sắc
    for y in range(0, h, 20):
        c = int(220 + 35 * (y / h))
        d.rectangle([0, y, w, y + 20], fill=(c - 30, c - 15, c))

    # Đỉnh núi tuyết trùng điệp phía bắc
    for i in range(14):
        px = i * 220 + random.randint(-40, 40)
        py = random.randint(180, 380)
        d.polygon([(px - 180, 500), (px, py), (px + 180, 500)], fill=(186, 230, 253), outline=(125, 211, 252))
        d.polygon([(px - 60, py + 120), (px, py), (px + 60, py + 120)], fill=(255, 255, 255))

    # Tảng băng xanh ngọc và hồ băng nứt nẻ
    d.ellipse([900, 700, 1900, 1250], fill=(147, 197, 253), outline=(59, 130, 246), width=6)
    # Vết nứt băng
    d.line([1050, 850, 1350, 1000], fill=(255, 255, 255), width=4)
    d.line([1350, 1000, 1600, 920], fill=(255, 255, 255), width=4)
    d.line([1350, 1000, 1420, 1200], fill=(255, 255, 255), width=4)

    # Rừng thông tuyết Côn Lôn phủ tuyết
    for _ in range(65):
        tx = random.randint(100, w - 100)
        ty = random.randint(450, h - 150)
        # Bỏ qua giữa hồ băng
        if 950 < tx < 1850 and 750 < ty < 1200:
            continue
        d.polygon([(tx - 25, ty), (tx, ty - 60), (tx + 25, ty)], fill=(30, 64, 175))
        d.polygon([(tx - 20, ty - 30), (tx, ty - 80), (tx + 20, ty - 30)], fill=(59, 130, 246))
        d.polygon([(tx - 12, ty - 60), (tx, ty - 95), (tx + 12, ty - 60)], fill=(248, 250, 252))

    # Điện thờ Băng Cung Côn Lôn cổ kính
    d.rectangle([1250, 420, 1550, 620], fill=(30, 58, 138), outline=(147, 197, 253), width=4)
    d.polygon([(1200, 420), (1400, 320), (1600, 420)], fill=(15, 23, 42), outline=(191, 219, 254), width=4)

    im.save(os.path.join(OUTPUT_IMAGES, "map_con_lon.jpg"), quality=85)
    im.resize((240, 150), Image.Resampling.LANCZOS).save(os.path.join(OUTPUT_IMAGES, "minimap_con_lon.jpg"))
    print("  [OK] Đã tạo map_con_lon.jpg & minimap_con_lon.jpg")

def create_desert_ruins_map():
    w, h = 2800, 1800
    im = Image.new("RGB", (w, h), (245, 158, 11))
    d = ImageDraw.Draw(im)

    # Đồi cát sa mạc hoàng hôn vàng óng
    for y in range(0, h, 20):
        r = int(217 + 25 * (y / h))
        g = int(119 + 50 * (y / h))
        b = int(6 + 20 * (y / h))
        d.rectangle([0, y, w, y + 20], fill=(r, g, b))

    # Cồn cát uốn lượn
    for i in range(12):
        sy = 300 + i * 130
        d.arc([-200, sy, w + 200, sy + 350], 0, 180, fill=(180, 83, 9), width=8)

    # Phế tích Hoàng Sa Cổ Thành (Thành quách sa thạch, cột đổ nát)
    for col_x in [600, 900, 1200, 1600, 1900, 2200]:
        col_y = random.randint(500, 1300)
        d.rectangle([col_x, col_y, col_x + 50, col_y + 160], fill=(120, 53, 15), outline=(251, 191, 36), width=3)
        d.polygon([(col_x - 15, col_y), (col_x + 25, col_y - 30), (col_x + 65, col_y)], fill=(180, 83, 9))

    # Ốc đảo xanh biếc giữa sa mạc
    d.ellipse([1100, 800, 1700, 1150], fill=(13, 148, 136), outline=(45, 212, 191), width=6)
    # Cây chà là quanh ốc đảo
    for px, py in [(1120, 810), (1200, 760), (1600, 820), (1660, 1020), (1250, 1140)]:
        d.line([px, py, px, py - 60], fill=(120, 53, 15), width=6)
        for ang in [-45, 0, 45, -90, 90]:
            rad = math.radians(ang)
            d.line([px, py - 60, px + int(math.cos(rad) * 40), py - 60 + int(math.sin(rad) * 40)], fill=(22, 163, 74), width=4)

    im.save(os.path.join(OUTPUT_IMAGES, "map_hoang_sa.jpg"), quality=85)
    im.resize((240, 150), Image.Resampling.LANCZOS).save(os.path.join(OUTPUT_IMAGES, "minimap_hoang_sa.jpg"))
    print("  [OK] Đã tạo map_hoang_sa.jpg & minimap_hoang_sa.jpg")

def create_celestial_temple_map():
    w, h = 2800, 1800
    im = Image.new("RGB", (w, h), (15, 23, 42))
    d = ImageDraw.Draw(im)

    # Bầu trời tinh vân tiên cảnh ngũ sắc tím - vàng - hồng
    for y in range(0, h, 25):
        pct = y / h
        r = int(59 + 80 * pct)
        g = int(7 + 40 * pct)
        b = int(100 + 100 * pct)
        d.rectangle([0, y, w, y + 25], fill=(r, g, b))

    # Đảo mây bay lơ lửng khổng lồ
    for cx, cy, rad_x, rad_y in [
        (1400, 900, 750, 480), # Đảo trung tâm Thần Điện
        (450, 550, 320, 220),  # Đảo tây bắc
        (2350, 550, 320, 220), # Đảo đông bắc
        (450, 1350, 320, 220), # Đảo tây nam
        (2350, 1350, 320, 220) # Đảo đông nam
    ]:
        # Viền mây phát sáng
        for r_ext in range(35, 0, -5):
            d.ellipse([cx - rad_x - r_ext, cy - rad_y - r_ext, cx + rad_x + r_ext, cy + rad_y + r_ext], 
                      fill=(245, 158, 11, int(150 * (1 - r_ext / 35))))
        d.ellipse([cx - rad_x, cy - rad_y, cx + rad_x, cy + rad_y], fill=(30, 41, 59), outline=(251, 191, 36), width=6)
        # Nền đá cẩm thạch ngọc bích
        d.ellipse([cx - rad_x + 30, cy - rad_y + 30, cx + rad_x - 30, cy + rad_y - 30], fill=(248, 250, 252))

    # Cầu vồng kết nối các đảo
    d.arc([450, 350, 2350, 1450], 180, 360, fill=(244, 63, 94), width=6)
    d.arc([450, 370, 2350, 1470], 180, 360, fill=(251, 191, 36), width=6)
    d.arc([450, 390, 2350, 1490], 180, 360, fill=(56, 189, 248), width=6)

    # Thần Điện Thái Cổ vàng rực rỡ ở trung tâm
    d.rectangle([1200, 680, 1600, 920], fill=(217, 119, 6), outline=(253, 224, 71), width=6)
    d.polygon([(1150, 680), (1400, 520), (1650, 680)], fill=(245, 158, 11), outline=(254, 240, 138), width=5)

    im.save(os.path.join(OUTPUT_IMAGES, "map_than_dien.jpg"), quality=85)
    im.resize((240, 150), Image.Resampling.LANCZOS).save(os.path.join(OUTPUT_IMAGES, "minimap_than_dien.jpg"))
    print("  [OK] Đã tạo map_than_dien.jpg & minimap_than_dien.jpg")

# -------------------------------------------------------------
# 3. TẠO ICONS CHO HỆ THỐNG VẬT PHẨM MỚI (64x64)
# -------------------------------------------------------------
def make_icon_base(bg_color=(30, 41, 59), border_color=(251, 191, 36)):
    im = Image.new("RGBA", (64, 64), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle([2, 2, 61, 61], radius=8, fill=bg_color, outline=border_color, width=2)
    return im, d

def create_item_icons():
    # 1. Giám Định Phù (Appraisal Scroll)
    im, d = make_icon_base(bg_color=(15, 23, 42), border_color=(56, 189, 248))
    # Cuộn phù thư màu vàng sáng
    d.rounded_rectangle([14, 10, 50, 54], radius=4, fill=(254, 240, 138), outline=(202, 138, 4), width=2)
    d.line([20, 20, 44, 20], fill=(220, 38, 38), width=2)
    d.line([20, 28, 44, 28], fill=(15, 23, 42), width=2)
    d.line([20, 36, 44, 36], fill=(15, 23, 42), width=2)
    d.line([20, 44, 36, 44], fill=(220, 38, 38), width=2)
    # Tia sáng giám định
    d.ellipse([38, 36, 54, 52], outline=(56, 189, 248), width=2, fill=(14, 165, 233, 140))
    d.line([49, 47, 58, 56], fill=(56, 189, 248), width=3) # cán kính lúp
    im.save(os.path.join(OUTPUT_ICONS, "item_appraisal.png"))

    # 2. Đá Cường Hóa (Enhance Stone)
    im, d = make_icon_base(bg_color=(15, 23, 42), border_color=(168, 85, 247))
    # Thiên Thạch phát sáng đa giác
    d.polygon([(32, 10), (52, 24), (46, 52), (18, 52), (12, 24)], fill=(147, 51, 234), outline=(216, 180, 254), width=2)
    d.polygon([(32, 10), (40, 28), (32, 48), (24, 28)], fill=(192, 132, 252))
    # Tia sấm sét cường hóa
    d.line([30, 16, 36, 32], fill=(254, 240, 138), width=2)
    d.line([36, 32, 28, 36], fill=(254, 240, 138), width=2)
    d.line([28, 36, 35, 46], fill=(254, 240, 138), width=2)
    im.save(os.path.join(OUTPUT_ICONS, "item_enhance_stone.png"))

    # 3. Bùa Bảo Hộ (Protection Talisman)
    im, d = make_icon_base(bg_color=(69, 10, 10), border_color=(251, 191, 36))
    # Lá bùa đỏ thẫm
    d.polygon([(20, 8), (44, 8), (48, 56), (16, 56)], fill=(220, 38, 38), outline=(251, 191, 36), width=2)
    # Hoa văn cấm chế Thái Cực vàng kim
    d.ellipse([24, 16, 40, 32], outline=(253, 224, 71), width=2)
    d.line([32, 34, 32, 50], fill=(253, 224, 71), width=2)
    d.line([24, 42, 40, 42], fill=(253, 224, 71), width=2)
    im.save(os.path.join(OUTPUT_ICONS, "item_protection_charm.png"))

    # 4. Kim Cương Tạc / Đá Đục Lỗ (Socket Drill)
    im, d = make_icon_base(bg_color=(15, 23, 42), border_color=(148, 163, 184))
    # Mũi khoan kim cương sắc bén
    d.polygon([(20, 14), (44, 14), (32, 52)], fill=(226, 232, 240), outline=(56, 189, 248), width=2)
    d.polygon([(26, 14), (38, 14), (32, 42)], fill=(125, 211, 252))
    # Lỗ ngọc đang được đục
    d.ellipse([26, 46, 38, 58], outline=(245, 158, 11), width=2)
    im.save(os.path.join(OUTPUT_ICONS, "item_socket_drill.png"))

    # 5. 6 Loại Ngọc Khảm (Gems):
    gems = [
        ("gem_ruby", (239, 68, 68), (254, 202, 202)),      # Hồng Ngọc
        ("gem_sapphire", (59, 130, 246), (191, 219, 254)),  # Lam Ngọc
        ("gem_topaz", (245, 158, 11), (254, 240, 138)),    # Hoàng Ngọc
        ("gem_emerald", (16, 185, 129), (167, 243, 208)),  # Lục Ngọc
        ("gem_amethyst", (168, 85, 247), (233, 213, 255)), # Tử Ngọc
        ("gem_amber", (234, 88, 12), (253, 186, 116))      # Hổ Phách
    ]

    for gem_key, main_col, light_col in gems:
        im_gem, d_gem = make_icon_base(bg_color=(15, 23, 42), border_color=main_col)
        # Viên ngọc cắt giác bát giác (Octagon Cut Gem)
        pts = [(24, 12), (40, 12), (52, 24), (52, 40), (40, 52), (24, 52), (12, 40), (12, 24)]
        d_gem.polygon(pts, fill=main_col, outline=light_col, width=2)
        # Mặt vát phản chiếu ánh sáng lấp lánh
        d_gem.polygon([(28, 20), (36, 20), (44, 28), (44, 36), (36, 44), (28, 44), (20, 36), (20, 28)], fill=light_col)
        im_gem.save(os.path.join(OUTPUT_ICONS, f"{gem_key}.png"))

    print("  [OK] Đã tạo toàn bộ Icons: Giám Định Phù, Đá Cường Hóa, Bùa Bảo Hộ, Khoan Lỗ & 6 Loại Ngọc Khảm!")

# -------------------------------------------------------------
# 4. TẠO ICONS BỘ KỸ NĂNG VÕ HỌC THIẾU LÂM & VÕ ĐANG
# -------------------------------------------------------------
def create_skill_icons():
    # Thiếu Lâm: sl_1, sl_2, sl_3, sl_4
    sl_skills = [
        ("skill_sl_1", (245, 158, 11), "CÔN"),
        ("skill_sl_2", (217, 119, 6), "TRẬN"),
        ("skill_sl_3", (220, 38, 38), "HỐNG"),
        ("skill_sl_4", (234, 179, 8), "DỊCH")
    ]
    for key, color, tag in sl_skills:
        im, d = make_icon_base(bg_color=(69, 26, 3), border_color=color)
        d.ellipse([14, 14, 50, 50], outline=color, width=3)
        d.line([16, 48, 48, 16], fill=(254, 240, 138), width=4) # trượng côn
        d.ellipse([26, 26, 38, 38], fill=color)
        im.save(os.path.join(OUTPUT_ICONS, f"{key}.png"))

    # Võ Đang: wd_1, wd_2, wd_3, wd_4
    wd_skills = [
        ("skill_wd_1", (56, 189, 248), "KIẾM"),
        ("skill_wd_2", (14, 165, 233), "KHÍ"),
        ("skill_wd_3", (99, 102, 241), "HỘ"),
        ("skill_wd_4", (34, 211, 238), "VẠN")
    ]
    for key, color, tag in wd_skills:
        im, d = make_icon_base(bg_color=(15, 23, 42), border_color=color)
        d.ellipse([14, 14, 50, 50], outline=color, width=3)
        # Hình kiếm khí thái cực
        d.line([32, 12, 32, 52], fill=(248, 250, 252), width=3)
        d.line([24, 22, 40, 22], fill=color, width=3)
        im.save(os.path.join(OUTPUT_ICONS, f"{key}.png"))

    print("  [OK] Đã tạo Icons kỹ năng Thiếu Lâm & Võ Đang!")

# -------------------------------------------------------------
# 5. TẠO ICONS BỘ SET TRANG BỊ MỚI (LV10, LV20, LV30, LV40, LV50)
# -------------------------------------------------------------
def create_set_equipment_icons():
    # Tạo các icon trang bị theo cấp: equip_lv10, equip_lv20, equip_lv30, equip_lv40, equip_lv50
    sets = [
        ("set_than_long", (239, 68, 68)), # Đỏ rực Thần Long
        ("set_bac_minh", (59, 130, 246)),  # Lam băng Bắc Minh
        ("set_kim_cang", (245, 158, 11))  # Hoàng kim Kim Cang
    ]
    for s_name, s_col in sets:
        im, d = make_icon_base(bg_color=(15, 23, 42), border_color=s_col)
        # Khiên giáp & kiếm set
        d.polygon([(32, 10), (52, 20), (46, 50), (32, 58), (18, 50), (12, 20)], fill=s_col, outline=(255, 255, 255), width=2)
        d.ellipse([26, 26, 38, 38], fill=(255, 255, 255))
        im.save(os.path.join(OUTPUT_ICONS, f"{s_name}.png"))
    print("  [OK] Đã tạo Icons 3 Bộ Trang Bị Kích Hoạt Bonus!")

if __name__ == "__main__":
    create_shaolin_hero()
    create_wudang_hero()
    create_snow_mountain_map()
    create_desert_ruins_map()
    create_celestial_temple_map()
    create_item_icons()
    create_skill_icons()
    create_set_equipment_icons()
    print("\n>>> TẤT CẢ ASSETS ĐÃ ĐƯỢC TẠO HOÀN TẤT THÀNH CÔNG! <<<")
