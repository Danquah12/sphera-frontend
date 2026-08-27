#!/usr/bin/env python3
"""
Generate a 9:16 portrait MP4 about password security using PIL.
Outputs: password_security_reel.mp4 (raw H.264-ish via struct)

Since ffmpeg isn't available, we'll generate an animated WebP instead,
which modern browsers handle as a video-like element.

Actually: let's use Python's built-in struct to write a valid MPEG4 container.
Simpler: output a series of JPEG frames then wrap in a minimal AVI with struct.
"""
from PIL import Image, ImageDraw, ImageFont
import struct, os, sys

W, H = 540, 960
FPS = 24
OUT = '/home/kali/.gemini/antigravity/scratch/sphera/password_security.webp'

slides = [
    {'bg': (15, 10, 40), 'accent': (124, 58, 237),
     'title': '🔐 Secure\nYour Passwords', 'body': '5 Essential Tips'},
    {'bg': (10, 30, 60), 'accent': (14, 165, 233),
     'title': 'Tip 1', 'body': '✅ Use 12+ characters\n✅ Mix letters, numbers\n   & symbols'},
    {'bg': (5, 40, 20), 'accent': (5, 150, 105),
     'title': 'Tip 2', 'body': '🚫 Never reuse\n   passwords\n💡 Each account\n   = unique password'},
    {'bg': (40, 15, 10), 'accent': (220, 38, 38),
     'title': 'Tip 3', 'body': '🔑 Use a\n   Password Manager\n   (Bitwarden, 1Password)'},
    {'bg': (40, 30, 5), 'accent': (245, 158, 11),
     'title': 'Tip 4', 'body': '📱 Enable 2FA\n   on every account\n   you care about'},
    {'bg': (30, 10, 40), 'accent': (167, 139, 250),
     'title': 'Tip 5', 'body': '🔄 Check if you\'ve\n   been breached:\n   haveibeenpwned.com'},
    {'bg': (15, 10, 40), 'accent': (124, 58, 237),
     'title': 'Stay Safe\nOnline 🛡️', 'body': 'Share this tip!'},
]

def render_slide(d, alpha=255):
    img = Image.new('RGB', (W, H), d['bg'])
    draw = ImageDraw.Draw(img)

    # Gradient-like background circles
    for r in range(300, 50, -40):
        a = int(30 * (1 - r/300))
        draw.ellipse([W//2 - r, H//3 - r, W//2 + r, H//3 + r],
                     fill=tuple(min(255, c + a) for c in d['bg']))

    # Accent bar
    draw.rectangle([0, 0, 8, H], fill=d['accent'])
    draw.rectangle([0, H - 8, W, H], fill=d['accent'])

    # Title
    try:
        tfont = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 56)
        bfont = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 34)
    except:
        tfont = ImageFont.load_default()
        bfont = tfont

    # Draw title
    y = 200
    for line in d['title'].split('\n'):
        draw.text((W//2, y), line, font=tfont, fill=(255, 255, 255), anchor='mm')
        y += 70

    # Accent divider
    draw.rectangle([W//2 - 60, y + 10, W//2 + 60, y + 14], fill=d['accent'])

    # Body text
    y += 50
    for line in d['body'].split('\n'):
        draw.text((W//2, y), line, font=bfont, fill=(200, 200, 220), anchor='mm')
        y += 50

    return img

frames = []
HOLD = FPS * 2      # 2 seconds per slide
FADE = FPS // 2     # 0.5s fade

for i, slide in enumerate(slides):
    img = render_slide(slide)
    # Hold frames
    for _ in range(HOLD):
        frames.append(img.copy())
    # Fade to black
    if i < len(slides) - 1:
        for f in range(FADE):
            t = f / FADE
            faded = Image.blend(img, Image.new('RGB', (W, H), (0, 0, 0)), t)
            frames.append(faded)

# Save as animated WebP
print(f"Saving {len(frames)} frames as animated WebP...")
frames[0].save(
    OUT,
    save_all=True,
    append_images=frames[1:],
    duration=int(1000 / FPS),
    loop=0,
    quality=70
)
print(f"Done! Saved to {OUT}")
print(f"File size: {os.path.getsize(OUT) / 1024:.1f} KB")
