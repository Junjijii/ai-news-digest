#!/usr/bin/env python3
"""AI News Digest アプリアイコン生成スクリプト"""
from PIL import Image, ImageDraw, ImageFont
import math
import os

SIZE = 1024

def draw_icon():
    img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Background - rounded rectangle with gradient-like effect
    # Base dark indigo
    cx, cy = SIZE // 2, SIZE // 2
    r = SIZE // 2 - 20

    # Draw circular background with subtle radial gradient
    for i in range(r, 0, -1):
        ratio = i / r
        # Gradient from deep indigo (#1e1b4b) to indigo (#4338ca)
        red = int(30 + (67 - 30) * (1 - ratio))
        green = int(27 + (56 - 27) * (1 - ratio))
        blue = int(75 + (202 - 75) * (1 - ratio))
        draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(red, green, blue, 255))

    # Draw a rounded square mask over the circle for app icon shape
    margin = 40
    corner_r = 180
    # Rounded rectangle background
    bg_img = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    bg_draw = ImageDraw.Draw(bg_img)
    bg_draw.rounded_rectangle(
        [margin, margin, SIZE - margin, SIZE - margin],
        radius=corner_r,
        fill=(15, 15, 20, 255)
    )

    # Gradient fill for rounded rect
    for y in range(margin, SIZE - margin):
        ratio = (y - margin) / (SIZE - 2 * margin)
        red = int(30 + (67 - 30) * ratio * 0.5)
        green = int(27 + (56 - 27) * ratio * 0.5)
        blue = int(75 + (202 - 75) * ratio * 0.3)
        for x in range(margin, SIZE - margin):
            if bg_img.getpixel((x, y))[3] > 0:
                bg_img.putpixel((x, y), (red, green, blue, 255))

    img = bg_img

    draw = ImageDraw.Draw(img)

    # Draw lightning bolt / AI symbol
    # Stylized "AI" lightning bolt
    bolt_color = (129, 140, 248)  # Indigo-400
    bolt_glow = (99, 102, 241)    # Indigo-500

    # Lightning bolt path (simplified polygon)
    bolt_points = [
        (480, 160),   # top
        (380, 480),   # left middle
        (470, 480),   # inner middle left
        (420, 840),   # bottom
        (640, 440),   # right middle
        (540, 440),   # inner middle right
    ]

    # Glow effect
    for offset in range(12, 0, -1):
        alpha = int(30 * (1 - offset / 12))
        glow_points = []
        for px, py in bolt_points:
            glow_points.append((px, py))
        glow_color = (99, 102, 241, alpha)
        shifted = [(p[0] + offset * 0.5, p[1]) for p in glow_points]
        draw.polygon(shifted, fill=glow_color)

    # Main bolt
    draw.polygon(bolt_points, fill=bolt_color)

    # Add bright edge highlight
    highlight_color = (199, 210, 254)  # Indigo-200
    highlight_points = [
        (480, 180),
        (475, 200),
        (395, 470),
        (390, 475),
    ]

    # Small news lines on the right side
    line_y_start = 300
    line_colors = [
        (129, 140, 248, 180),  # indigo
        (96, 165, 250, 160),   # blue
        (52, 211, 153, 140),   # green
    ]
    for i, color in enumerate(line_colors):
        y = line_y_start + i * 60
        x_start = 580
        x_end = 780
        line_width = 8
        draw.rounded_rectangle(
            [x_start, y, x_end, y + line_width],
            radius=4,
            fill=color
        )
        # Shorter secondary line
        draw.rounded_rectangle(
            [x_start, y + 20, x_start + 120, y + 20 + 6],
            radius=3,
            fill=(*color[:3], color[3] // 2)
        )

    # "AI" text at bottom
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 80)
    except:
        font = ImageFont.load_default()

    text = "NEWS"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    tx = (SIZE - tw) // 2 + 40
    ty = 720
    draw.text((tx, ty), text, fill=(199, 210, 254, 200), font=font)

    return img


def create_iconset(img, output_dir):
    """Create .iconset directory with all required sizes"""
    iconset_dir = os.path.join(output_dir, 'icon.iconset')
    os.makedirs(iconset_dir, exist_ok=True)

    sizes = [16, 32, 64, 128, 256, 512, 1024]
    for size in sizes:
        resized = img.resize((size, size), Image.LANCZOS)
        resized.save(os.path.join(iconset_dir, f'icon_{size}x{size}.png'))
        if size <= 512:
            resized2x = img.resize((size * 2, size * 2), Image.LANCZOS)
            resized2x.save(os.path.join(iconset_dir, f'icon_{size}x{size}@2x.png'))

    # Also save 1024 as the base PNG
    img.save(os.path.join(output_dir, 'icon.png'))

    return iconset_dir


if __name__ == '__main__':
    output_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'build')
    img = draw_icon()
    iconset_dir = create_iconset(img, output_dir)
    print(f"Iconset created at: {iconset_dir}")
    print(f"PNG saved at: {os.path.join(output_dir, 'icon.png')}")
