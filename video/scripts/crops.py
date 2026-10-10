"""Pre-crops the stock uniform photo into small square listing photos (public/crops/*.jpg), one per crop used in src/theme.tsx.
Usage: python3 scripts/crops.py   (re-run after changing LISTINGS crops)"""
import re, subprocess, os
src = open('src/theme.tsx').read()
crops = set(re.findall(r'crop: \[([\d.]+), ([\d.]+), ([\d.]+)\]', src))
os.makedirs('public/crops', exist_ok=True)
W, H = 1203, 880
for fx, fy, z in sorted(crops):
    fx, fy, z = float(fx), float(fy), float(z)
    side = W / z
    x0 = min(max(fx * W - side / 2, 0), W - side)
    y0 = min(max(fy * H - side / 2, 0), H - side)
    name = f"{fx:g}_{fy:g}_{z:g}"
    subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-i', 'public/uniforms.jpg', '-vf', f'crop={side:.0f}:{side:.0f}:{x0:.0f}:{y0:.0f},scale=640:640:flags=lanczos', '-q:v', '2', f'public/crops/{name}.jpg'], check=True)
    print(name)
