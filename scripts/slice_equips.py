import os
from PIL import Image

RAW_PATH = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\raw\equip_grid.jpg"
ICON_DIR = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\icons"

def slice_equip_grid():
    img = Image.open(RAW_PATH)
    w, h = img.size
    col_w = w / 3.0
    row_h = h / 3.0
    
    pad_x = col_w * 0.035
    pad_y = row_h * 0.035
    
    idx = 1
    for r in range(3):
        for c in range(3):
            left = int(c * col_w + pad_x)
            top = int(r * row_h + pad_y)
            right = int((c + 1) * col_w - pad_x)
            bottom = int((r + 1) * row_h - pad_y)
            
            cell = img.crop((left, top, right, bottom))
            cell = cell.resize((128, 128), Image.Resampling.LANCZOS)
            out_file = os.path.join(ICON_DIR, f"equip_{idx}.png")
            cell.save(out_file, "PNG", quality=95)
            print(f"Saved: equip_{idx}.png")
            idx += 1

if __name__ == "__main__":
    slice_equip_grid()
