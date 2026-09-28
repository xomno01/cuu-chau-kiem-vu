import os
import shutil
from PIL import Image, ImageEnhance, ImageFilter, ImageDraw

BRAIN_DIR = r"C:\Users\phamn\.gemini\antigravity\brain\d3c374a5-59b6-40b1-b4b4-b6e30734a701"
PUBLIC_DIR = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public"
MAPS_DIR = os.path.join(PUBLIC_DIR, "assets", "maps")
MONSTERS_DIR = os.path.join(PUBLIC_DIR, "assets", "monsters")
ITEMS_DIR = os.path.join(PUBLIC_DIR, "assets", "items")
SECTS_DIR = os.path.join(PUBLIC_DIR, "assets", "sects")

os.makedirs(MAPS_DIR, exist_ok=True)
os.makedirs(MONSTERS_DIR, exist_ok=True)
os.makedirs(ITEMS_DIR, exist_ok=True)
os.makedirs(SECTS_DIR, exist_ok=True)

# 1. PROCESS 3 CULTIVATION MAPS
# Map 1: Bong Lai Tien Dao
src_bl = os.path.join(BRAIN_DIR, "map_bong_lai_1790439519006.jpg")
if os.path.exists(src_bl):
    im_bl = Image.open(src_bl).convert("RGB")
    im_bl.save(os.path.join(MAPS_DIR, "map_bong_lai.jpg"), "JPEG", quality=90)
    im_bl.resize((240, 240), Image.Resampling.LANCZOS).save(os.path.join(MAPS_DIR, "minimap_bong_lai.jpg"), "JPEG", quality=85)
    print("Done Map Bong Lai")

# Map 2: Con Lon Dao Tri (Chuyển sắc băng ngọc tiên cảnh hồ sen)
src_dt = os.path.join(BRAIN_DIR, "map_con_lon_1790434989582.jpg")
if os.path.exists(src_dt):
    im_dt = Image.open(src_dt).convert("RGB")
    # Biến đổi màu sắc xanh ngọc Dao Trì
    enhancer = ImageEnhance.Color(im_dt)
    im_dt_teal = enhancer.enhance(1.4)
    # Tinh chỉnh sắc xanh thiên thanh
    r, g, b = im_dt_teal.split()
    b = ImageEnhance.Brightness(b).enhance(1.25)
    g = ImageEnhance.Brightness(g).enhance(1.15)
    im_dt_final = Image.merge("RGB", (r, g, b))
    im_dt_final.save(os.path.join(MAPS_DIR, "map_dao_tri.jpg"), "JPEG", quality=90)
    im_dt_final.resize((240, 240), Image.Resampling.LANCZOS).save(os.path.join(MAPS_DIR, "minimap_dao_tri.jpg"), "JPEG", quality=85)
    print("Done Map Dao Tri")

# Map 3: Thai Hu Huyen Canh (Cõi hư không tiên ma tím huyền ảo)
src_th = os.path.join(BRAIN_DIR, "wuxia_map_demon_volcano_1790414514534.jpg")
if os.path.exists(src_th):
    im_th = Image.open(src_th).convert("RGB")
    # Tinh chỉnh sắc tím hư không huyền ảo
    r, g, b = im_th.split()
    r = ImageEnhance.Brightness(r).enhance(1.2)
    b = ImageEnhance.Brightness(b).enhance(1.5)
    g = ImageEnhance.Brightness(g).enhance(0.8)
    im_th_final = Image.merge("RGB", (r, g, b))
    im_th_final.save(os.path.join(MAPS_DIR, "map_thai_hu.jpg"), "JPEG", quality=90)
    im_th_final.resize((240, 240), Image.Resampling.LANCZOS).save(os.path.join(MAPS_DIR, "minimap_thai_hu.jpg"), "JPEG", quality=85)
    print("Done Map Thai Hu")

# 2. PROCESS CULTIVATION MOBS & BOSSES (TRANSPARENT PNG)
def extract_and_make_sprite(src_path, dst_path, size=(128, 128), glow_color=(0, 255, 255, 120)):
    if not os.path.exists(src_path):
        return
    im = Image.open(src_path).convert("RGBA")
    # Crop center square
    w, h = im.size
    min_side = min(w, h)
    left = (w - min_side) // 2
    top = (h - min_side) // 2
    im_cropped = im.crop((left, top, left + min_side, top + min_side)).resize(size, Image.Resampling.LANCZOS)
    
    # Tạo mask hình tròn / bo viền mềm và loại bỏ viền đen/trắng thừa
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((4, 4, size[0] - 4, size[1] - 4), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(2))
    
    datas = im_cropped.getdata()
    newData = []
    mask_data = mask.getdata()
    for i, item in enumerate(datas):
        # nếu viền ngoài mask
        alpha = mask_data[i]
        # nếu quá tối hoặc quá sáng ở mép ngoài
        if item[0] < 20 and item[1] < 20 and item[2] < 20:
            alpha = min(alpha, 120)
        newData.append((item[0], item[1], item[2], min(item[3], alpha)))
    
    im_cropped.putdata(newData)
    im_cropped.save(dst_path, "PNG")
    print(f"Generated sprite: {dst_path}")

# Mobs Bồng Lai: Linh Hồ
src_fox = os.path.join(BRAIN_DIR, "wuxia_beast_spirit_fox_1790414546955.jpg")
extract_and_make_sprite(src_fox, os.path.join(MONSTERS_DIR, "mob_bong_lai_fox.png"), (110, 110))
extract_and_make_sprite(src_fox, os.path.join(MONSTERS_DIR, "boss_bong_lai.png"), (160, 160))

# Mobs Dao Trì: Băng Tinh Dị Thú
src_snow = os.path.join(BRAIN_DIR, "mob_snow_beast_1790435060044.jpg")
extract_and_make_sprite(src_snow, os.path.join(MONSTERS_DIR, "mob_dao_tri_beast.png"), (120, 120))
extract_and_make_sprite(src_snow, os.path.join(MONSTERS_DIR, "boss_dao_tri.png"), (170, 170))

# Mobs Thái Hư: Hư Không Thần Thú
src_demon = os.path.join(BRAIN_DIR, "wuxia_mob_fire_demon_1790414580349.jpg")
extract_and_make_sprite(src_demon, os.path.join(MONSTERS_DIR, "mob_thai_hu_demon.png"), (130, 130))
src_boss = os.path.join(BRAIN_DIR, "wuxia_boss_demon_1790413385747.jpg")
extract_and_make_sprite(src_boss, os.path.join(MONSTERS_DIR, "boss_thai_hu.png"), (180, 180))

# 3. GENERATE CULTIVATION PILLS (Tu Vi Đan, Thọ Nguyên Đan, Đột Phá Đan)
def draw_pill(filename, base_color, aura_color, text_char):
    im = Image.new("RGBA", (80, 80), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    # Aura glow
    for r in range(36, 24, -2):
        alpha = int(80 * (38 - r) / 12)
        draw.ellipse((40 - r, 40 - r, 40 + r, 40 + r), fill=(aura_color[0], aura_color[1], aura_color[2], alpha))
    # Outer ring
    draw.ellipse((14, 14, 66, 66), outline=aura_color, width=2)
    # Main Pill sphere
    draw.ellipse((16, 16, 64, 64), fill=base_color)
    # Highlight reflection
    draw.ellipse((22, 20, 38, 36), fill=(255, 255, 255, 170))
    # Golden spark ring
    draw.arc((12, 12, 68, 68), start=45, end=225, fill=(255, 220, 100, 200), width=3)
    im.save(os.path.join(ITEMS_DIR, filename), "PNG")
    print(f"Created pill: {filename}")

draw_pill("item_tuvi_pill.png", (150, 40, 220, 255), (180, 100, 255), "Tu")      # Tím huyền ảo (Tu Vi)
draw_pill("item_lifespan_pill.png", (240, 180, 30, 255), (255, 220, 80), "Thọ")  # Hoàng kim (Thọ Nguyên)
draw_pill("item_breakthrough_pill.png", (20, 210, 220, 255), (100, 255, 240), "Phá") # Băng thanh ngọc (Đột Phá)

# 4. GENERATE 4 CULTIVATION SECT ICONS
def draw_cultiv_sect(filename, bg_color, border_color, symbol_type):
    im = Image.new("RGBA", (100, 100), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)
    # Vòng tròn bát quái / hào quang
    draw.ellipse((4, 4, 96, 96), fill=bg_color, outline=border_color, width=3)
    draw.ellipse((10, 10, 90, 90), outline=(255, 255, 255, 80), width=1)
    
    cx, cy = 50, 50
    if symbol_type == "dao":
        # Thái Cực Đạo Giáo
        draw.arc((20, 20, 80, 80), 0, 360, fill=(100, 220, 255), width=2)
        draw.chord((20, 20, 80, 80), 90, 270, fill=(255, 255, 255, 220))
        draw.chord((20, 20, 80, 80), 270, 90, fill=(30, 30, 40, 220))
        draw.ellipse((44, 26, 56, 38), fill=(30, 30, 40, 255))
        draw.ellipse((44, 62, 56, 74), fill=(255, 255, 255, 255))
    elif symbol_type == "buddha":
        # Vạn Tự Phật Giáo
        draw.ellipse((20, 20, 80, 80), fill=(240, 180, 40, 220))
        draw.rectangle((44, 25, 56, 75), fill=(255, 255, 220))
        draw.rectangle((25, 44, 75, 56), fill=(255, 255, 220))
        draw.rectangle((25, 25, 37, 44), fill=(255, 255, 220))
        draw.rectangle((63, 56, 75, 75), fill=(255, 255, 220))
    elif symbol_type == "demon":
        # Ma Tông Huyết Diễm
        draw.polygon([(50, 16), (20, 78), (80, 78)], fill=(180, 20, 30, 220), outline=(255, 60, 60))
        draw.polygon([(50, 84), (20, 22), (80, 22)], fill=(40, 0, 0, 150), outline=(255, 100, 100))
        draw.ellipse((42, 42, 58, 58), fill=(255, 20, 20))
    elif symbol_type == "beast":
        # Yêu Tộc Long Trảo / Hồ Đồng
        draw.ellipse((22, 22, 78, 78), fill=(40, 140, 60, 220), outline=(100, 255, 140), width=2)
        # 3 móng vuốt
        draw.line([(32, 28), (40, 72)], fill=(240, 255, 200), width=4)
        draw.line([(50, 22), (50, 78)], fill=(240, 255, 200), width=5)
        draw.line([(68, 28), (60, 72)], fill=(240, 255, 200), width=4)
        
    im.save(os.path.join(SECTS_DIR, filename), "PNG")
    print(f"Created sect icon: {filename}")

draw_cultiv_sect("sect_cultiv_dao.png", (10, 25, 50, 240), (100, 200, 255), "dao")
draw_cultiv_sect("sect_cultiv_buddha.png", (60, 45, 10, 240), (255, 215, 0), "buddha")
draw_cultiv_sect("sect_cultiv_demon.png", (50, 10, 15, 240), (255, 50, 80), "demon")
draw_cultiv_sect("sect_cultiv_beast.png", (10, 45, 25, 240), (80, 255, 120), "beast")

print("ALL ASSETS PROCESSED SUCCESSFULLY!")
