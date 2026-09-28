import os
from PIL import Image, ImageDraw, ImageFilter
import numpy as np

SHAOLIN_SRC = r'C:\Users\phamn\.gemini\antigravity\brain\d3c374a5-59b6-40b1-b4b4-b6e30734a701\shaolin_avatar_1790431856693.jpg'
WUDANG_SRC = r'C:\Users\phamn\.gemini\antigravity\brain\d3c374a5-59b6-40b1-b4b4-b6e30734a701\wudang_avatar_1790431880747.jpg'
OUT_DIR = r'C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\images'

def create_avatar(src_path, crop_box, out_name, size=(256, 256)):
    img = Image.open(src_path).convert('RGB')
    cropped = img.crop(crop_box)
    resized = cropped.resize(size, Image.Resampling.LANCZOS)
    
    # Tạo circular mask mềm mại với viền vàng kim
    mask = Image.new('L', size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((2, 2, size[0] - 3, size[1] - 3), fill=255)
    
    out_img = Image.new('RGBA', size, (0, 0, 0, 0))
    out_img.paste(resized, (0, 0), mask)
    
    # Viền vàng kim mỏng
    border_draw = ImageDraw.Draw(out_img)
    border_draw.ellipse((2, 2, size[0] - 3, size[1] - 3), outline=(212, 175, 55, 220), width=3)
    
    dest = os.path.join(OUT_DIR, out_name)
    out_img.save(dest, 'PNG')
    print(f'Saved avatar: {dest}')

def isolate_character(src_path, out_name, char_box, bg_samples, tolerance=45):
    """
    Tách nhân vật khỏi background bằng color distance + flood-fill / mask
    và làm mịn biên với Gaussian feathering.
    """
    img = Image.open(src_path).convert('RGBA')
    w, h = img.size
    arr = np.array(img, dtype=np.float32)
    rgb = arr[:, :, :3]
    
    # Khởi tạo alpha = 255
    alpha = np.ones((h, w), dtype=np.float32) * 255.0
    
    # Khoanh vùng ngoài char_box: giảm dần alpha
    x1, y1, x2, y2 = char_box
    for y in range(h):
        for x in range(w):
            if x < x1 or x > x2 or y < y1 or y > y2:
                # Tính khoảng cách tới biên char_box
                dx = max(0, x1 - x, x - x2)
                dy = max(0, y1 - y, y - y2)
                d = np.hypot(dx, dy)
                if d > 40:
                    alpha[y, x] = 0
                else:
                    alpha[y, x] = max(0, 255.0 * (1.0 - d / 40.0))
    
    # Trong vùng background samples: trừ alpha nếu màu gần với màu nền đặc trưng
    for bg_rgb in bg_samples:
        diff = np.linalg.norm(rgb - np.array(bg_rgb, dtype=np.float32), axis=2)
        bg_mask = diff < tolerance
        alpha[bg_mask] = np.minimum(alpha[bg_mask], np.clip((diff[bg_mask] / tolerance) ** 2 * 255.0, 0, 255))
    
    # Chuyển alpha thành PIL image để feather mềm mượt
    alpha_img = Image.fromarray(alpha.astype(np.uint8), mode='L')
    alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(radius=1.8))
    
    img.putalpha(alpha_img)
    
    # Resize về 1024x1024 chuẩn RGBA
    final_hero = img.resize((1024, 1024), Image.Resampling.LANCZOS)
    dest = os.path.join(OUT_DIR, out_name)
    final_hero.save(dest, 'PNG')
    print(f'Saved hero: {dest}')

# 1. Tạo Avatar Thiếu Lâm (crop chuẩn mặt + vầng hào quang kim quang)
# Ảnh 1024x1024: Đầu ở x ~ 512, y ~ 200
create_avatar(SHAOLIN_SRC, (280, 110, 740, 570), 'avatar_shaolin.png', (128, 128))

# 2. Tạo Avatar Võ Đang (crop chuẩn mặt thanh tú + búi tóc ngọc trâm)
# Ảnh 1024x1024: Đầu ở x ~ 512, y ~ 160
create_avatar(WUDANG_SRC, (300, 60, 720, 480), 'avatar_wudang.png', (128, 128))

# 3. Tạo Hero Sprite Thiếu Lâm
# Nền chùa: nâu đậm/đen ở 4 góc và 2 bên
shaolin_bg_colors = [
    [25, 20, 18], [45, 35, 28], [60, 45, 35], [20, 15, 12], [85, 70, 55], [35, 30, 25]
]
isolate_character(SHAOLIN_SRC, 'hero_shaolin.png', (260, 120, 760, 970), shaolin_bg_colors, tolerance=40)

# 4. Tạo Hero Sprite Võ Đang
# Nền mây núi: trắng xám mây (210, 215, 225) và đá xanh (70, 80, 90)
wudang_bg_colors = [
    [215, 220, 228], [235, 238, 242], [180, 190, 200], [150, 160, 170], [90, 100, 110]
]
isolate_character(WUDANG_SRC, 'hero_wudang.png', (70, 60, 950, 970), wudang_bg_colors, tolerance=42)

print('=== Processing Complete! ===')
