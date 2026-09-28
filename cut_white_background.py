import os
from PIL import Image, ImageFilter
import numpy as np

SHAOLIN_SRC = r'C:\Users\phamn\.gemini\antigravity\brain\d3c374a5-59b6-40b1-b4b4-b6e30734a701\shaolin_sprite_1790432000147.jpg'
WUDANG_SRC = r'C:\Users\phamn\.gemini\antigravity\brain\d3c374a5-59b6-40b1-b4b4-b6e30734a701\wudang_sprite_1790432023243.jpg'
OUT_DIR = r'C:\Users\phamn\.gemini\antigravity\scratch\cuu-chau-kiem-vu\public\assets\images'

def remove_white_bg(src_path, out_name, white_thresh=248, soft_range=15):
    img = Image.open(src_path).convert('RGB')
    w, h = img.size
    arr = np.array(img, dtype=np.float32)
    
    # Tính độ sáng (luminance) hoặc khoảng cách tới màu trắng (255, 255, 255)
    # Khoảng cách tới trắng:
    dist_to_white = np.linalg.norm(arr - 255.0, axis=2)
    
    # Nếu rất gần trắng (dist < 10) => nền 100% trong suốt
    # Nếu hơi trắng (10 <= dist <= 28) => chuyển tiếp mượt mà
    alpha = np.ones((h, w), dtype=np.float32) * 255.0
    
    # Flood-fill từ 4 cạnh để chỉ xóa nền ngoài, không làm thủng áo trắng bên trong
    from collections import deque
    is_bg = np.zeros((h, w), dtype=bool)
    
    # Tiêu chuẩn pixel nền: R > 235 and G > 235 and B > 235
    bg_candidate = (arr[:, :, 0] > 235) & (arr[:, :, 1] > 235) & (arr[:, :, 2] > 235)
    
    queue = deque()
    for x in range(w):
        if bg_candidate[0, x]: queue.append((0, x)); is_bg[0, x] = True
        if bg_candidate[h - 1, x]: queue.append((h - 1, x)); is_bg[h - 1, x] = True
    for y in range(h):
        if bg_candidate[y, 0]: queue.append((y, 0)); is_bg[y, 0] = True
        if bg_candidate[y, w - 1]: queue.append((y, w - 1)); is_bg[y, w - 1] = True
        
    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w:
                if not is_bg[ny, nx] and bg_candidate[ny, nx]:
                    is_bg[ny, nx] = True
                    queue.append((ny, nx))
                    
    # Cho các pixel là background: tính alpha mượt mà
    for y in range(h):
        for x in range(w):
            if is_bg[y, x]:
                d = dist_to_white[y, x]
                if d < 12:
                    alpha[y, x] = 0.0
                elif d < 30:
                    alpha[y, x] = ((d - 12) / 18.0) * 255.0
                    
    alpha_img = Image.fromarray(alpha.astype(np.uint8), mode='L')
    alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(radius=0.7))
    
    rgba = img.convert('RGBA')
    rgba.putalpha(alpha_img)
    
    # Save 1024x1024
    dest = os.path.join(OUT_DIR, out_name)
    rgba.save(dest, 'PNG')
    print(f'Cutout saved successfully: {dest}')

remove_white_bg(SHAOLIN_SRC, 'hero_shaolin.png')
remove_white_bg(WUDANG_SRC, 'hero_wudang.png')
print('All hero cutouts done!')
