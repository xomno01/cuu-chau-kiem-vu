import os
from PIL import Image

RAW_DIR = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\raw"
IMG_DIR = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\images"

def remove_black_background(img_path, threshold=15, softness=30):
    img = Image.open(img_path).convert("RGBA")
    data = img.getdata()
    new_data = []
    
    for item in data:
        r, g, b, a = item
        brightness = max(r, g, b)
        if brightness <= threshold:
            new_data.append((r, g, b, 0))
        elif brightness < threshold + softness:
            factor = (brightness - threshold) / float(softness)
            new_data.append((r, g, b, int(255 * factor)))
        else:
            new_data.append((r, g, b, 255))
            
    img.putdata(new_data)
    return img

def main():
    print("=== DANG XU LY CAC ASSET MAP & QUAI VAT MOI ===")
    
    # 1. Xu ly Map Dao Hoa Dao
    p_peach = os.path.join(RAW_DIR, "map_peach_island.jpg")
    if os.path.exists(p_peach):
        img = Image.open(p_peach)
        dest = os.path.join(IMG_DIR, "map_peach_island.jpg")
        img.save(dest, "JPEG", quality=95)
        
        mini = img.resize((320, 180), Image.Resampling.LANCZOS)
        mini.save(os.path.join(IMG_DIR, "minimap_peach.jpg"), "JPEG", quality=90)
        print("Saved map_peach_island.jpg and minimap_peach.jpg")

    # 2. Xu ly Map Ma Son Dung Nham
    p_volcano = os.path.join(RAW_DIR, "map_demon_volcano.jpg")
    if os.path.exists(p_volcano):
        img = Image.open(p_volcano)
        dest = os.path.join(IMG_DIR, "map_demon_volcano.jpg")
        img.save(dest, "JPEG", quality=95)
        
        mini = img.resize((320, 180), Image.Resampling.LANCZOS)
        mini.save(os.path.join(IMG_DIR, "minimap_volcano.jpg"), "JPEG", quality=90)
        print("Saved map_demon_volcano.jpg and minimap_volcano.jpg")

    # 3. Xu ly Cuu Vi Linh Ho
    p_fox = os.path.join(RAW_DIR, "beast_spirit_fox.jpg")
    if os.path.exists(p_fox):
        sprite = remove_black_background(p_fox, threshold=12, softness=30)
        sprite.save(os.path.join(IMG_DIR, "beast_spirit_fox.png"), "PNG")
        print("Saved beast_spirit_fox.png")

    # 4. Xu ly Viem Ma Thu
    p_magma = os.path.join(RAW_DIR, "mob_fire_demon.jpg")
    if os.path.exists(p_magma):
        sprite = remove_black_background(p_magma, threshold=14, softness=28)
        sprite.save(os.path.join(IMG_DIR, "mob_fire_demon.png"), "PNG")
        print("Saved mob_fire_demon.png")

    print("=== HOAN TAT XU LY ASSETS MOI! ===")

if __name__ == "__main__":
    main()
