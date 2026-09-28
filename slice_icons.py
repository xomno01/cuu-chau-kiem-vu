import os
from PIL import Image

def slice_grid(image_path, grid_rows, grid_cols, mappings, output_dir):
    img = Image.open(image_path).convert("RGBA")
    w, h = img.size
    cell_w = w / grid_cols
    cell_h = h / grid_rows

    # Viền lề nhỏ để cắt gọn gàng vào trong ô tránh đường biên đen
    margin_x = int(cell_w * 0.05)
    margin_y = int(cell_h * 0.05)

    os.makedirs(output_dir, exist_ok=True)

    for (row, col, filename) in mappings:
        left = int(col * cell_w + margin_x)
        top = int(row * cell_h + margin_y)
        right = int((col + 1) * cell_w - margin_x)
        bottom = int((row + 1) * cell_h - margin_y)

        cropped = img.crop((left, top, right, bottom))
        # Resize về kích thước chuẩn sắc nét 128x128
        resized = cropped.resize((128, 128), Image.Resampling.LANCZOS)
        out_path = os.path.join(output_dir, filename)
        resized.save(out_path, format="PNG")
        print(f"Saved: {out_path} ({resized.size[0]}x{resized.size[1]})")

def main():
    brain_dir = r"C:\Users\phamn\.gemini\antigravity\brain\d3c374a5-59b6-40b1-b4b4-b6e30734a701"
    output_dir = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\icons"

    # 1. Cắt Item & Gem Sheet (4x4)
    item_sheet = os.path.join(brain_dir, "wuxia_gems_items_sheet_1790433974050.jpg")
    item_mappings = [
        (0, 0, "item_appraisal.png"),
        (0, 1, "item_enhance_stone.png"),
        (0, 2, "item_protection_charm.png"),
        (0, 3, "item_socket_drill.png"),
        (1, 0, "gem_ruby.png"),
        (1, 1, "gem_sapphire.png"),
        (1, 2, "gem_topaz.png"),
        (1, 3, "gem_emerald.png"),
        (2, 0, "gem_amethyst.png"),
        (2, 1, "gem_amber.png"),
        (2, 2, "set_than_long.png"),
        (2, 3, "set_kim_cang.png"),
        (3, 0, "item_reforge.png"),
        (3, 1, "item_amber_core.png"),
        (3, 2, "set_bac_minh.png"),
        (3, 3, "item_bell_talisman.png")
    ]
    if os.path.exists(item_sheet):
        print("Slicing Items & Gems...")
        slice_grid(item_sheet, 4, 4, item_mappings, output_dir)
    else:
        print(f"Error: {item_sheet} not found!")

    # 2. Cắt Skill Sheet (4x4)
    skill_sheet = os.path.join(brain_dir, "wuxia_skills_sheet_1790434004207.jpg")
    skill_mappings = [
        (0, 0, "skill_sl_1.png"),  # La Hán Côn Pháp
        (0, 1, "skill_sl_2.png"),  # Kim Cang Phục Ma Trận
        (0, 2, "skill_sl_3.png"),  # Kim Cang Bất Hoại Thể
        (0, 3, "skill_sl_4.png"),  # Sư Tử Hống Thần Công
        (2, 0, "skill_wd_1.png"),  # Thái Cực Thần Kiếm
        (2, 1, "skill_wd_2.png"),  # Lưỡng Nghi Kiếm Trận
        (3, 2, "skill_wd_3.png"),  # Tọa Vong Vô Ngã (Khiên Thái Cực)
        (2, 3, "skill_wd_4.png")   # Vạn Kiếm Triều Tông
    ]
    if os.path.exists(skill_sheet):
        print("Slicing Martial Arts Skills...")
        slice_grid(skill_sheet, 4, 4, skill_mappings, output_dir)
    else:
        print(f"Error: {skill_sheet} not found!")

if __name__ == "__main__":
    main()
