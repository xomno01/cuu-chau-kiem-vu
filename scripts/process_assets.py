import os
import sys
from PIL import Image, ImageOps, ImageFilter, ImageDraw

RAW_DIR = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\raw"
IMG_DIR = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\images"
ICON_DIR = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\icons"

os.makedirs(IMG_DIR, exist_ok=True)
os.makedirs(ICON_DIR, exist_ok=True)

def remove_black_background(img_path, threshold=20, softness=30):
    """
    Tách nền đen mượt mà cho nhân vật kiếm hiệp, giữ lại kiếm khí phát sáng và dải lụa mỏng.
    """
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    for item in data:
        r, g, b, a = item
        # Độ sáng trung bình hoặc max RGB
        brightness = max(r, g, b)
        
        if brightness <= threshold:
            # Hoàn toàn đen -> trong suốt
            new_data.append((r, g, b, 0))
        elif brightness < threshold + softness:
            # Chuyển tiếp mượt mà (anti-aliased edge)
            factor = (brightness - threshold) / float(softness)
            alpha = int(255 * factor)
            new_data.append((r, g, b, alpha))
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    return img

def crop_grid_3x3(grid_path, output_dir, prefix, size=(128, 128)):
    """
    Cắt tấm ảnh lưới 3x3 thành 9 icons riêng biệt, loại bỏ viền lề và căn chỉnh chuẩn xác.
    """
    img = Image.open(grid_path)
    w, h = img.size
    
    col_w = w / 3.0
    row_h = h / 3.0
    
    # Margin nhỏ bên trong mỗi ô để lấy trọn icon đẹp nhất
    pad_x = col_w * 0.03
    pad_y = row_h * 0.03
    
    count = 1
    for r in range(3):
        for c in range(3):
            left = int(c * col_w + pad_x)
            top = int(r * row_h + pad_y)
            right = int((c + 1) * col_w - pad_x)
            bottom = int((r + 1) * row_h - pad_y)
            
            cell = img.crop((left, top, right, bottom))
            cell = cell.resize(size, Image.Resampling.LANCZOS)
            
            out_file = os.path.join(output_dir, f"{prefix}_{count}.png")
            cell.save(out_file, "PNG", quality=95)
            print(f"Saved: {out_file}")
            count += 1

def make_circular_avatar(char_img, size=(128, 128), head_focus_crop=True):
    """
    Tạo avatar tròn viền ngọc bích từ ảnh nhân vật
    """
    w, h = char_img.size
    if head_focus_crop:
        # Crop nửa trên tập trung vào khuôn mặt và thần thái
        crop_box = (int(w * 0.2), int(h * 0.05), int(w * 0.8), int(h * 0.55))
        cropped = char_img.crop(crop_box)
    else:
        cropped = char_img
        
    cropped = cropped.resize(size, Image.Resampling.LANCZOS)
    
    # Tạo mask hình tròn
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((2, 2, size[0] - 3, size[1] - 3), fill=255)
    
    avatar = Image.new("RGBA", size, (0, 0, 0, 0))
    avatar.paste(cropped, (0, 0), mask=mask)
    
    # Vẽ viền tròn vàng ngọc
    draw_av = ImageDraw.Draw(avatar)
    draw_av.ellipse((2, 2, size[0] - 3, size[1] - 3), outline=(212, 175, 55, 255), width=3)
    return avatar

def main():
    print("=== DANG XU LY TOAN BO ASSETS CHO CUU CHAU KIEM VU ONLINE ===")
    
    # 1. Cat 9 Icons Ky Nang
    skills_path = os.path.join(RAW_DIR, "skills_grid.jpg")
    if os.path.exists(skills_path):
        print("-> Dang cat luoi Skill Icons 3x3...")
        crop_grid_3x3(skills_path, ICON_DIR, "skill", size=(128, 128))
        
    # 2. Cat 9 Icons Trang Bi & Vat Pham
    items_path = os.path.join(RAW_DIR, "items_grid.jpg")
    if os.path.exists(items_path):
        print("-> Dang cat luoi Item Icons 3x3...")
        crop_grid_3x3(items_path, ICON_DIR, "item", size=(128, 128))
        
    # 3. Tach nen va toi uu nhan vat
    chars = [
        ("hero_huashan.jpg", "hero_huashan.png", "avatar_huashan.png"),
        ("hero_xiaoyao.jpg", "hero_xiaoyao.png", "avatar_xiaoyao.png"),
        ("boss_demon.jpg", "boss_demon.png", "avatar_boss.png"),
        ("bandit_mob.jpg", "bandit_mob.png", None)
    ]
    
    for raw_name, out_sprite, out_avatar in chars:
        p = os.path.join(RAW_DIR, raw_name)
        if os.path.exists(p):
            print(f"-> Tach nen cho {raw_name}...")
            thresh = 10 if "hero" in raw_name else 14
            sprite = remove_black_background(p, threshold=thresh, softness=28)
            sprite_path = os.path.join(IMG_DIR, out_sprite)
            sprite.save(sprite_path, "PNG")
            print(f"Saved sprite: {sprite_path}")
            
            if out_avatar:
                raw_img = Image.open(p)
                avatar = make_circular_avatar(raw_img, size=(128, 128))
                av_path = os.path.join(IMG_DIR, out_avatar)
                avatar.save(av_path, "PNG")
                print(f"Saved avatar: {av_path}")

    # 4. Toi uu World Map
    map_raw = os.path.join(RAW_DIR, "map_world.jpg")
    if os.path.exists(map_raw):
        print("-> Toi uu ban do the gioi...")
        map_img = Image.open(map_raw)
        map_dest = os.path.join(IMG_DIR, "world_map.jpg")
        map_img.save(map_dest, "JPEG", quality=95)
        
        # Tao Minimap
        minimap = map_img.resize((320, 180), Image.Resampling.LANCZOS)
        minimap_dest = os.path.join(IMG_DIR, "minimap.jpg")
        minimap.save(minimap_dest, "JPEG", quality=90)
        print(f"Saved world map & minimap: {map_dest}, {minimap_dest}")
        
    # 5. Banner Logo
    logo_raw = os.path.join(RAW_DIR, "game_logo.jpg")
    if os.path.exists(logo_raw):
        logo_dest = os.path.join(IMG_DIR, "banner.jpg")
        logo_img = Image.open(logo_raw)
        logo_img.save(logo_dest, "JPEG", quality=92)
        print(f"Saved banner logo: {logo_dest}")

    print("=== HOAN TAT XU LY TOAN BO ASSETS! ===")

if __name__ == "__main__":
    main()
