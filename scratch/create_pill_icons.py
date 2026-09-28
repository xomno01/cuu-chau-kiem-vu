import os
from PIL import Image, ImageDraw, ImageFont, ImageFilter

out_dir = r"C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\icons"
os.makedirs(out_dir, exist_ok=True)

def create_icon(filename, bg_gradient_colors, inner_symbol, label_text, border_color, glow_color):
    size = (128, 128)
    img = Image.new("RGBA", size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Outer background rounded rect
    margin = 4
    # Radial/concentric background
    for r in range(60, 0, -2):
        factor = r / 60.0
        c1 = bg_gradient_colors[0]
        c2 = bg_gradient_colors[1]
        cur_c = (
            int(c1[0] * factor + c2[0] * (1 - factor)),
            int(c1[1] * factor + c2[1] * (1 - factor)),
            int(c1[2] * factor + c2[2] * (1 - factor)),
            245
        )
        draw.ellipse([64 - r, 64 - r, 64 + r, 64 + r], fill=cur_c)
    
    # Outer decorative border
    draw.rounded_rectangle([margin, margin, 128 - margin, 128 - margin], radius=16, outline=border_color, width=3)
    draw.rounded_rectangle([margin + 3, margin + 3, 128 - margin - 3, 128 - margin - 3], radius=13, outline=glow_color, width=1)
    
    # Golden corners
    corner_size = 12
    draw.line([margin, margin + corner_size, margin + corner_size, margin], fill="#fde047", width=3)
    draw.line([128 - margin, margin + corner_size, 128 - margin - corner_size, margin], fill="#fde047", width=3)
    draw.line([margin, 128 - margin - corner_size, margin + corner_size, 128 - margin], fill="#fde047", width=3)
    draw.line([128 - margin, 128 - margin - corner_size, 128 - margin - corner_size, 128 - margin], fill="#fde047", width=3)
    
    # Inner sacred pill / flask drawing
    if inner_symbol == "lifespan": # Thọ Nguyên Đan (Green/Emerald Vitality Elixir)
        # Golden aura
        draw.ellipse([34, 30, 94, 90], fill=(16, 185, 129, 60))
        # Pearl Elixir
        draw.ellipse([40, 36, 88, 84], fill=(16, 185, 129, 230), outline="#6ee7b7", width=3)
        # Highlight shine
        draw.ellipse([46, 42, 60, 56], fill=(255, 255, 255, 220))
        # Inner Rune (Hán tự Thọ 壽 hoặc hồ lô)
        draw.line([64, 46, 64, 74], fill="#fef08a", width=3)
        draw.line([52, 54, 76, 54], fill="#fef08a", width=3)
        draw.line([54, 64, 74, 64], fill="#fef08a", width=3)
    elif inner_symbol == "tuvi": # Tu Vi Đan (Purple/Cyan Cosmic Qi Sphere)
        # Outer nebula ring
        draw.arc([28, 28, 100, 100], start=30, end=330, fill="#a855f7", width=4)
        draw.ellipse([38, 38, 90, 90], fill=(147, 51, 234, 230), outline="#c084fc", width=3)
        draw.ellipse([45, 45, 60, 60], fill=(255, 255, 255, 210))
        # Star aura
        draw.line([64, 46, 64, 82], fill="#facc15", width=2)
        draw.line([46, 64, 82, 64], fill="#facc15", width=2)
        draw.ellipse([58, 58, 70, 70], fill=(250, 204, 21, 255))
    elif inner_symbol == "breakthrough": # Cửu Chuyển Đột Phá Đan (Gold/Crimson Thunder Dragon Pill)
        # Golden lightning arcs
        draw.ellipse([34, 32, 94, 92], fill=(234, 88, 12, 100))
        draw.ellipse([38, 36, 90, 88], fill=(234, 179, 8, 240), outline="#fef08a", width=3)
        draw.ellipse([44, 42, 58, 56], fill=(255, 255, 255, 230))
        # Lightning bolt in center
        points = [(64, 44), (54, 62), (64, 62), (58, 80), (74, 58), (64, 58), (70, 44)]
        draw.polygon(points, fill="#ef4444", outline="#fff")
        
    # Text badge at bottom
    try:
        font = ImageFont.truetype("arial.ttf", 14)
    except:
        font = ImageFont.load_default()
    
    # Save image
    out_path = os.path.join(out_dir, filename)
    img.save(out_path, "PNG")
    print(f"Generated {out_path}")

create_icon("item_lifespan_pill.png", ((5, 150, 105), (6, 78, 59)), "lifespan", "THỌ", "#10b981", "#34d399")
create_icon("item_tuvi_pill.png", ((126, 34, 206), (59, 7, 100)), "tuvi", "TU VI", "#a855f7", "#c084fc")
create_icon("item_breakthrough_pill.png", ((217, 119, 6), (120, 53, 15)), "breakthrough", "ĐỘT PHÁ", "#f59e0b", "#fde047")
