import os
from PIL import Image

BASE_DIR = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu"
BRAIN_DIR = r"C:\Users\phamn\.gemini\antigravity\brain\d3c374a5-59b6-40b1-b4b4-b6e30734a701"

ITEMS_GRID = os.path.join(BASE_DIR, "public", "assets", "raw", "items_grid.jpg")
GEMS_SHEET = os.path.join(BRAIN_DIR, "wuxia_gems_items_sheet_1790433974050.jpg")

ICONS_DIR = os.path.join(BASE_DIR, "public", "assets", "icons")
ITEMS_DIR = os.path.join(BASE_DIR, "public", "assets", "items")
SECTS_DIR = os.path.join(BASE_DIR, "public", "assets", "sects")

os.makedirs(ICONS_DIR, exist_ok=True)
os.makedirs(ITEMS_DIR, exist_ok=True)
os.makedirs(SECTS_DIR, exist_ok=True)

def crop_cell_3x3(img, row, col, pad_ratio=0.045):
    w, h = img.size
    cw = w / 3.0
    ch = h / 3.0
    px = cw * pad_ratio
    py = ch * pad_ratio
    left = int(col * cw + px)
    top = int(row * ch + py)
    right = int((col + 1) * cw - px)
    bottom = int((row + 1) * ch - py)
    cropped = img.crop((left, top, right, bottom))
    return cropped.resize((128, 128), Image.Resampling.LANCZOS)

def crop_cell_4x4(img, row, col, pad_ratio=0.04):
    w, h = img.size
    cw = w / 4.0
    ch = h / 4.0
    px = cw * pad_ratio
    py = ch * pad_ratio
    left = int(col * cw + px)
    top = int(row * ch + py)
    right = int((col + 1) * cw - px)
    bottom = int((row + 1) * ch - py)
    cropped = img.crop((left, top, right, bottom))
    return cropped.resize((128, 128), Image.Resampling.LANCZOS)

def main():
    print("Slicing items from items_grid.jpg...")
    im_items = Image.open(ITEMS_GRID).convert("RGBA")
    
    # 1. Cloud Boots (Row 1, Col 0) -> equip_cloud_boots.png
    boots = crop_cell_3x3(im_items, 1, 0)
    boots.save(os.path.join(ICONS_DIR, "equip_cloud_boots.png"), "PNG")
    print("Saved: equip_cloud_boots.png")
    
    # 2. Health Elixir / Lifespan Pill (Row 1, Col 1) -> item_lifespan_pill.png
    lifespan = crop_cell_3x3(im_items, 1, 1)
    lifespan.save(os.path.join(ICONS_DIR, "item_lifespan_pill.png"), "PNG")
    lifespan.save(os.path.join(ITEMS_DIR, "item_lifespan_pill.png"), "PNG")
    print("Saved: item_lifespan_pill.png")

    # 3. Qi Pill / Breakthrough Pill (Row 1, Col 2) -> item_breakthrough_pill.png
    breakthrough = crop_cell_3x3(im_items, 1, 2)
    breakthrough.save(os.path.join(ICONS_DIR, "item_breakthrough_pill.png"), "PNG")
    breakthrough.save(os.path.join(ITEMS_DIR, "item_breakthrough_pill.png"), "PNG")
    print("Saved: item_breakthrough_pill.png")

    print("\nSlicing items from wuxia_gems_items_sheet...")
    im_gems = Image.open(GEMS_SHEET).convert("RGBA")

    # 4. Amber Qi Core / Tu Vi Pill (Row 2, Col 1) -> item_tuvi_pill.png
    tuvi = crop_cell_4x4(im_gems, 2, 1)
    tuvi.save(os.path.join(ICONS_DIR, "item_tuvi_pill.png"), "PNG")
    tuvi.save(os.path.join(ITEMS_DIR, "item_tuvi_pill.png"), "PNG")
    print("Saved: item_tuvi_pill.png")

    # 5. Sect Icons:
    # Dao: Row 0, Col 0 (Golden Daoist Talisman)
    dao = crop_cell_4x4(im_gems, 0, 0)
    dao.save(os.path.join(ICONS_DIR, "sect_cultiv_dao.png"), "PNG")
    dao.save(os.path.join(SECTS_DIR, "sect_cultiv_dao.png"), "PNG")
    print("Saved: sect_cultiv_dao.png")

    # Buddha: Row 2, Col 3 (Golden Buddhist Bell / Vajra)
    buddha = crop_cell_4x4(im_gems, 2, 3)
    buddha.save(os.path.join(ICONS_DIR, "sect_cultiv_buddha.png"), "PNG")
    buddha.save(os.path.join(SECTS_DIR, "sect_cultiv_buddha.png"), "PNG")
    print("Saved: sect_cultiv_buddha.png")

    # Demon: Row 0, Col 2 (Crimson Phoenix Blood Medallion)
    demon = crop_cell_4x4(im_gems, 0, 2)
    demon.save(os.path.join(ICONS_DIR, "sect_cultiv_demon.png"), "PNG")
    demon.save(os.path.join(SECTS_DIR, "sect_cultiv_demon.png"), "PNG")
    print("Saved: sect_cultiv_demon.png")

    # Beast: Row 2, Col 2 (Golden Dragon Medallion)
    beast = crop_cell_4x4(im_gems, 2, 2)
    beast.save(os.path.join(ICONS_DIR, "sect_cultiv_beast.png"), "PNG")
    beast.save(os.path.join(SECTS_DIR, "sect_cultiv_beast.png"), "PNG")
    print("Saved: sect_cultiv_beast.png")

if __name__ == "__main__":
    main()
