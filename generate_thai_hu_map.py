import math
import random
from PIL import Image, ImageDraw, ImageFilter

def create_thai_hu_map():
    width = 1920
    height = 1080
    im = Image.new('RGB', (width, height), (8, 4, 18))
    draw = ImageDraw.Draw(im)

    # 1. Gradient bầu trời Hư Không Tinh Vân (Nebula)
    for y in range(height):
        ratio = y / height
        r = int(10 + 25 * math.sin(ratio * math.pi))
        g = int(4 + 10 * math.sin(ratio * math.pi * 0.8))
        b = int(24 + 50 * math.sin(ratio * math.pi))
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # 2. Các dải Tinh Vân (Nebula Glow Clouds)
    nebula_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    n_draw = ImageDraw.Draw(nebula_layer)

    # Vòng xoáy tinh vân tím & hồng
    center_x, center_y = width // 2, height // 2
    for _ in range(120):
        rad = random.uniform(80, 520)
        ang = random.uniform(0, math.pi * 2)
        cx = int(center_x + math.cos(ang) * rad * 1.6)
        cy = int(center_y + math.sin(ang) * rad * 0.9)
        blob_r = random.randint(40, 180)
        
        hue_choice = random.choice([
            (168, 85, 247, 35),   # Purple
            (217, 70, 239, 30),   # Fuchsia
            (56, 189, 248, 25),   # Sky blue
            (244, 63, 94, 25),    # Rose
            (99, 102, 241, 30)    # Indigo
        ])
        n_draw.ellipse([cx - blob_r, cy - blob_r, cx + blob_r, cy + blob_r], fill=hue_choice)

    nebula_layer = nebula_layer.filter(ImageFilter.GaussianBlur(35))
    im.paste(nebula_layer, (0, 0), nebula_layer)

    # 3. Hàng ngàn ngôi sao lấp lánh (Starfield)
    draw = ImageDraw.Draw(im)
    random.seed(42)
    for _ in range(800):
        sx = random.randint(0, width)
        sy = random.randint(0, height)
        size = random.choice([1, 1, 1, 2, 2, 3])
        brightness = random.randint(140, 255)
        color = random.choice([
            (brightness, brightness, 255),
            (255, brightness, brightness),
            (brightness, 255, brightness),
            (255, 255, 255)
        ])
        if size == 1:
            draw.point((sx, sy), fill=color)
        else:
            draw.ellipse([sx - size, sy - size, sx + size, sy + size], fill=color)

    # 4. Các bệ đá lơ lửng Hư Không (Floating Obsidian Platforms)
    plat_layer = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    p_draw = ImageDraw.Draw(plat_layer)

    platforms = [
        # Center main sanctum platform
        {'cx': width // 2, 'cy': height // 2 + 60, 'rw': 340, 'rh': 160, 'color': (30, 24, 48)},
        # Left upper temple platform
        {'cx': 380, 'cy': 340, 'rw': 220, 'rh': 110, 'color': (25, 20, 40)},
        # Right upper relic platform
        {'cx': 1520, 'cy': 320, 'rw': 240, 'rh': 120, 'color': (25, 20, 40)},
        # Left lower gateway
        {'cx': 320, 'cy': 780, 'rw': 200, 'rh': 100, 'color': (20, 16, 35)},
        # Right lower arena
        {'cx': 1580, 'cy': 800, 'rw': 220, 'rh': 110, 'color': (20, 16, 35)},
        # Mid north boss shrine
        {'cx': width // 2, 'cy': 180, 'rw': 260, 'rh': 110, 'color': (35, 25, 55)},
    ]

    for p in platforms:
        cx, cy, rw, rh = p['cx'], p['cy'], p['rw'], p['rh']
        # Vùng chân đá nhọn lơ lửng phía dưới (Cliff roots)
        for i in range(12):
            bx = cx + random.randint(-rw + 30, rw - 30)
            by = cy + rh // 2 + random.randint(20, 130)
            p_draw.polygon([(bx - 25, cy + rh // 2), (bx + 25, cy + rh // 2), (bx, by)], fill=(15, 10, 25, 230))

        # Mặt bệ đá chính
        p_draw.ellipse([cx - rw, cy - rh, cx + rw, cy + rh], fill=p['color'] + (255,))
        # Viền bệ đá phát sáng tím ngọc (Runic Glow Rim)
        p_draw.ellipse([cx - rw, cy - rh, cx + rw, cy + rh], outline=(168, 85, 247, 230), width=4)
        p_draw.ellipse([cx - rw + 15, cy - rh + 10, cx + rw - 15, cy + rh - 10], outline=(192, 132, 252, 160), width=2)

        # Trận đồ phù chú cổ xưa trên mặt bệ đá (Magic Circles)
        inner_w = int(rw * 0.6)
        inner_h = int(rh * 0.6)
        p_draw.ellipse([cx - inner_w, cy - inner_h, cx + inner_w, cy + inner_h], outline=(236, 72, 153, 180), width=2)
        # Các nan hoa trận pháp Bát Quái
        for k in range(8):
            ang = k * (math.pi / 4)
            ex = int(cx + math.cos(ang) * inner_w)
            ey = int(cy + math.sin(ang) * inner_h)
            p_draw.line([(cx, cy), (ex, ey)], fill=(192, 132, 252, 140), width=1)

    # 5. Cầu năng lượng hư không nối giữa các bệ đá (Energy Light Bridges)
    bridges = [
        ((width // 2, height // 2 + 60), (380, 340)),
        ((width // 2, height // 2 + 60), (1520, 320)),
        ((width // 2, height // 2 + 60), (320, 780)),
        ((width // 2, height // 2 + 60), (1580, 800)),
        ((width // 2, height // 2 + 60), (width // 2, 180)),
    ]
    for start, end in bridges:
        p_draw.line([start, end], fill=(168, 85, 247, 180), width=8)
        p_draw.line([start, end], fill=(244, 114, 182, 220), width=3)
        p_draw.line([start, end], fill=(255, 255, 255, 255), width=1)

    im.paste(plat_layer, (0, 0), plat_layer)

    # Lưu file kết quả
    out_path = 'public/assets/images/map_thai_hu.jpg'
    im.save(out_path, quality=95)
    print(f'[Map] Da tao xong {out_path} ({width}x{height})')

if __name__ == '__main__':
    create_thai_hu_map()
