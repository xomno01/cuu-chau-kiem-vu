import math
from PIL import Image, ImageDraw, ImageFilter

def draw_circle(draw, cx, cy, r, fill, outline=None, width=1):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill, outline=outline, width=width)

# 1. Bồng Lai Linh Hồ (Cửu Vĩ Hồ Tuyết Ngọc)
def create_mob_bong_lai_fox():
    w, h = 256, 256
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # 9 Đuôi xòe hình quạt phát sáng ngọc bích
    tail_angles = [-75, -55, -35, -15, 0, 15, 35, 55, 75]
    for ang_deg in tail_angles:
        rad = math.radians(ang_deg)
        tx = 128 + math.sin(rad) * 65
        ty = 175 - math.cos(rad) * 65
        draw.line([(128, 160), (tx, ty)], fill=(209, 250, 229, 210), width=18)
        draw.line([(128, 160), (tx, ty)], fill=(255, 255, 255, 255), width=10)
        draw_circle(draw, tx, ty, 14, fill=(52, 211, 153, 230), outline=(255, 255, 255, 255), width=2)

    # Thân hồ ly trắng tuyết
    draw.ellipse([88, 110, 168, 195], fill=(240, 253, 250, 255), outline=(45, 212, 191, 255), width=3)

    # Đầu hồ ly
    draw.polygon([(128, 70), (85, 125), (171, 125)], fill=(255, 255, 255, 255), outline=(45, 212, 191, 255))
    # Mõm
    draw.polygon([(128, 140), (115, 118), (141, 118)], fill=(254, 205, 211, 255))
    draw_circle(draw, 128, 138, 4, fill=(15, 23, 42, 255))

    # Tai dài nhọn hồ ly
    draw.polygon([(90, 85), (70, 25), (110, 65)], fill=(255, 255, 255, 255), outline=(45, 212, 191, 255), width=2)
    draw.polygon([(88, 80), (74, 35), (105, 65)], fill=(251, 113, 133, 220))

    draw.polygon([(166, 85), (186, 25), (146, 65)], fill=(255, 255, 255, 255), outline=(45, 212, 191, 255), width=2)
    draw.polygon([(168, 80), (182, 35), (151, 65)], fill=(251, 113, 133, 220))

    # Đôi mắt phượng ngọc bích thần bí
    draw.ellipse([102, 95, 116, 107], fill=(13, 148, 136, 255))
    draw.ellipse([140, 95, 154, 107], fill=(13, 148, 136, 255))
    draw_circle(draw, 107, 99, 2, fill=(255, 255, 255, 255))
    draw_circle(draw, 145, 99, 2, fill=(255, 255, 255, 255))

    # Ngọc minh châu ngậm trên trán
    draw_circle(draw, 128, 82, 7, fill=(56, 189, 248, 255), outline=(255, 255, 255, 255), width=2)

    im.save('public/assets/images/mob_bong_lai_fox.png')
    print('Created mob_bong_lai_fox.png')

# 2. Bồng Lai Đảo Chủ (Tiên Phong Đạo Cốt, Phi Kiếm Trận)
def create_boss_bong_lai():
    w, h = 300, 300
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # 1. Vòng Bát Quái Thái Cực hào quang sau lưng
    draw_circle(draw, 150, 150, 115, fill=(16, 185, 129, 35), outline=(52, 211, 153, 220), width=4)
    draw_circle(draw, 150, 150, 90, fill=None, outline=(251, 191, 36, 200), width=2)

    # 8 Cây Phi Kiếm Tiên Đạo bay lượn quanh người
    for k in range(8):
        ang = k * (math.pi / 4)
        kx = 150 + math.cos(ang) * 115
        ky = 150 + math.sin(ang) * 115
        sword_len = 32
        sx2 = kx + math.cos(ang + math.pi/2) * sword_len
        sy2 = ky + math.sin(ang + math.pi/2) * sword_len
        draw.line([(kx, ky), (sx2, sy2)], fill=(56, 189, 248, 255), width=6)
        draw.line([(kx, ky), (sx2, sy2)], fill=(255, 255, 255, 255), width=2)
        draw_circle(draw, kx, ky, 5, fill=(250, 204, 21, 255))

    # Áo Choàng Đạo Bào Ngọc Bích Dát Vàng
    draw.polygon([(150, 110), (70, 260), (230, 260)], fill=(5, 150, 105, 255), outline=(251, 191, 36, 255), width=4)
    # Lớp lót bạch ngọc
    draw.polygon([(150, 115), (115, 260), (185, 260)], fill=(240, 253, 250, 255), outline=(52, 211, 153, 200), width=2)

    # Thân & Đầu Tiên Nhân
    draw_circle(draw, 150, 85, 28, fill=(254, 226, 226, 255), outline=(217, 119, 6, 255), width=2)
    # Tóc trắng búi đạo quán
    draw.ellipse([120, 52, 180, 88], fill=(248, 250, 252, 255))
    draw_circle(draw, 150, 48, 14, fill=(251, 191, 36, 255), outline=(255, 255, 255, 255), width=2) # Đạo trâm ngọc
    # Râu dài tiên phong
    draw.polygon([(140, 100), (160, 100), (150, 145)], fill=(255, 255, 255, 255))

    # Mắt uy nghiêm
    draw.line([(136, 85), (145, 85)], fill=(15, 23, 42, 255), width=3)
    draw.line([(155, 85), (164, 85)], fill=(15, 23, 42, 255), width=3)

    # Tay cầm Thái Cổ Thần Kiếm
    draw.line([(185, 160), (225, 80)], fill=(251, 191, 36, 255), width=7)
    draw.line([(185, 160), (225, 80)], fill=(255, 255, 255, 255), width=3)

    im.save('public/assets/images/boss_bong_lai.png')
    print('Created boss_bong_lai.png')

# 3. Dao Trì Băng Tinh Thú (Hàn Băng Thú Xanh Lam Lấp Lánh)
def create_mob_dao_tri_beast():
    w, h = 256, 256
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # Gai băng nhọn sau lưng
    for i in range(7):
        ang = math.radians(-50 + i * 18)
        bx = 128 + math.sin(ang) * 55
        by = 135 - math.cos(ang) * 55
        draw.line([(128, 140), (bx, by)], fill=(56, 189, 248, 255), width=12)
        draw.line([(128, 140), (bx, by)], fill=(224, 242, 254, 255), width=5)

    # Thân Kỳ Lân Băng
    draw.ellipse([70, 115, 186, 205], fill=(14, 116, 144, 255), outline=(125, 211, 252, 255), width=4)
    # Mảng pha lê băng
    draw.polygon([(90, 140), (128, 120), (166, 140), (128, 175)], fill=(186, 230, 253, 200))

    # Đầu Thú Băng
    draw_circle(draw, 128, 95, 34, fill=(8, 145, 178, 255), outline=(224, 242, 254, 255), width=3)
    # Cặp sừng pha lê băng lam
    draw.line([(110, 75), (80, 28)], fill=(186, 230, 253, 255), width=8)
    draw.line([(110, 75), (80, 28)], fill=(255, 255, 255, 255), width=3)
    draw.line([(146, 75), (176, 28)], fill=(186, 230, 253, 255), width=8)
    draw.line([(146, 75), (176, 28)], fill=(255, 255, 255, 255), width=3)

    # Mắt phát sáng hàn khí
    draw_circle(draw, 114, 92, 6, fill=(255, 255, 255, 255), outline=(56, 189, 248, 255), width=2)
    draw_circle(draw, 142, 92, 6, fill=(255, 255, 255, 255), outline=(56, 189, 248, 255), width=2)

    im.save('public/assets/images/mob_dao_tri_beast.png')
    print('Created mob_dao_tri_beast.png')

# 4. Dao Trì Thánh Mẫu (Tây Vương Mẫu Uy Vũ Hoa Lệ)
def create_boss_dao_tri():
    w, h = 300, 300
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # Vầng trăng hàn băng và dải lụa tiên
    draw_circle(draw, 150, 145, 120, fill=(6, 182, 212, 35), outline=(34, 211, 238, 220), width=4)

    # Dải lụa tiên uốn lượn bay bổng
    ribbon_pts = [(50, 180), (80, 110), (150, 70), (220, 110), (250, 180), (220, 250), (150, 280), (80, 250)]
    for idx in range(len(ribbon_pts)):
        p1 = ribbon_pts[idx]
        p2 = ribbon_pts[(idx + 1) % len(ribbon_pts)]
        draw.line([p1, p2], fill=(165, 243, 252, 190), width=10)
        draw.line([p1, p2], fill=(255, 255, 255, 240), width=3)

    # Cung trang hoa lệ lấp lánh băng thanh ngọc khiết
    draw.polygon([(150, 110), (60, 270), (240, 270)], fill=(3, 105, 161, 255), outline=(251, 191, 36, 255), width=4)
    draw.polygon([(150, 115), (100, 270), (200, 270)], fill=(224, 242, 254, 255), outline=(56, 189, 248, 255), width=2)

    # Đầu & Vương Miện Phượng Hoàng Vàng Ngọc
    draw_circle(draw, 150, 80, 26, fill=(254, 226, 226, 255), outline=(217, 119, 6, 255), width=2)
    # Vương miện vàng cánh phượng
    draw.polygon([(120, 68), (150, 25), (180, 68)], fill=(251, 191, 36, 255), outline=(255, 255, 255, 255), width=2)
    draw_circle(draw, 150, 45, 8, fill=(236, 72, 153, 255)) # Viên hồng ngọc đỉnh miện

    # Tóc đen tiên nữ búi cao quý phái
    draw.ellipse([124, 55, 176, 85], fill=(15, 23, 42, 255))

    # Pháp bảo: Gương Hàn Băng Dao Trì Bảo Kính trên tay
    draw_circle(draw, 220, 150, 26, fill=(224, 242, 254, 240), outline=(251, 191, 36, 255), width=4)
    draw_circle(draw, 220, 150, 16, fill=(6, 182, 212, 255))

    im.save('public/assets/images/boss_dao_tri.png')
    print('Created boss_dao_tri.png')

# 5. Thái Hư Huyễn Ma (Quỷ Thú Hư Không Tím Ma Mị)
def create_mob_thai_hu_demon():
    w, h = 256, 256
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # Hào quang tím đen bốc khói
    draw_circle(draw, 128, 128, 85, fill=(88, 28, 135, 90), outline=(168, 85, 247, 180), width=3)

    # Cánh dơi bóng tối xương gai
    draw.polygon([(128, 110), (35, 55), (60, 130), (30, 170), (110, 150)], fill=(30, 10, 50, 240), outline=(192, 132, 252, 255), width=3)
    draw.polygon([(128, 110), (221, 55), (196, 130), (226, 170), (146, 150)], fill=(30, 10, 50, 240), outline=(192, 132, 252, 255), width=3)

    # Thân ma quỷ
    draw.ellipse([88, 90, 168, 195], fill=(20, 5, 35, 255), outline=(168, 85, 247, 255), width=3)

    # Cặp sừng quỷ cong nhọn
    draw.line([(100, 95), (65, 30)], fill=(147, 51, 234, 255), width=10)
    draw.line([(100, 95), (65, 30)], fill=(236, 72, 153, 255), width=3)
    draw.line([(156, 95), (191, 30)], fill=(147, 51, 234, 255), width=10)
    draw.line([(156, 95), (191, 30)], fill=(236, 72, 153, 255), width=3)

    # 3 Đôi mắt đỏ rực hư không
    draw.ellipse([105, 115, 117, 125], fill=(239, 68, 68, 255))
    draw.ellipse([139, 115, 151, 125], fill=(239, 68, 68, 255))
    draw.ellipse([122, 100, 134, 110], fill=(244, 63, 94, 255)) # Mắt thứ ba

    im.save('public/assets/images/mob_thai_hu_demon.png')
    print('Created mob_thai_hu_demon.png')

# 6. Thái Hư Ma Tôn (Ma Hoàng Chí Tôn Hắc Kim & Đại Ma Đao)
def create_boss_thai_hu():
    w, h = 320, 320
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    draw = ImageDraw.Draw(im)

    # Vòng tròn ma pháp Hỗn Độn đỏ tím cực đại
    draw_circle(draw, 160, 160, 135, fill=(59, 7, 100, 80), outline=(236, 72, 153, 255), width=5)
    draw_circle(draw, 160, 160, 105, fill=None, outline=(168, 85, 247, 200), width=3)

    # Đôi ma dực khổng lồ sau lưng
    draw.polygon([(160, 140), (20, 40), (50, 170), (10, 240), (130, 200)], fill=(15, 5, 25, 255), outline=(217, 70, 239, 255), width=4)
    draw.polygon([(160, 140), (300, 40), (270, 170), (310, 240), (190, 200)], fill=(15, 5, 25, 255), outline=(217, 70, 239, 255), width=4)

    # Chiến giáp Ma Hoàng Hắc Kim gai góc
    draw.polygon([(160, 100), (80, 280), (240, 280)], fill=(24, 10, 40, 255), outline=(245, 158, 11, 255), width=5)
    # Lõi ma năng tím rực ở ngực
    draw.polygon([(160, 130), (140, 170), (180, 170)], fill=(236, 72, 153, 255), outline=(255, 255, 255, 255), width=2)

    # Đầu Ma Vương & Hoàng Kim Khôi Giáp Ma Sừng
    draw_circle(draw, 160, 85, 32, fill=(15, 5, 25, 255), outline=(245, 158, 11, 255), width=3)
    # Cặp ma sừng khổng lồ uốn cong
    draw.line([(135, 75), (70, 15)], fill=(168, 85, 247, 255), width=14)
    draw.line([(135, 75), (70, 15)], fill=(251, 191, 36, 255), width=4)
    draw.line([(185, 75), (250, 15)], fill=(168, 85, 247, 255), width=14)
    draw.line([(185, 75), (250, 15)], fill=(251, 191, 36, 255), width=4)

    # Mắt rực lửa hắc ám
    draw.ellipse([140, 80, 152, 90], fill=(239, 68, 68, 255))
    draw.ellipse([168, 80, 180, 90], fill=(239, 68, 68, 255))

    # Cự Ma Trảm Tiên Đao khổng lồ
    draw.polygon([(230, 280), (270, 50), (290, 60), (245, 285)], fill=(88, 28, 135, 255), outline=(236, 72, 153, 255), width=4)
    draw.line([(270, 50), (230, 280)], fill=(255, 255, 255, 255), width=3)

    im.save('public/assets/images/boss_thai_hu.png')
    print('Created boss_thai_hu.png')

if __name__ == '__main__':
    create_mob_bong_lai_fox()
    create_boss_bong_lai()
    create_mob_dao_tri_beast()
    create_boss_dao_tri()
    create_mob_thai_hu_demon()
    create_boss_thai_hu()
