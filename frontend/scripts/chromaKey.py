# Chroma-key a magenta-background render to a transparent PNG.  usage: python3 chromaKey.py in.jpg out.png
import sys
from PIL import Image, ImageFilter
import numpy as np
im = Image.open(sys.argv[1]).convert('RGB')
a = np.asarray(im).astype(int)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
key = (r > 150) & (b > 150) & (g < 120) & (np.abs(r - b) < 90)
alpha = np.where(key, 0, 255).astype(np.uint8)
mask = Image.fromarray(alpha).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))
out = Image.fromarray(a.astype(np.uint8)).convert('RGBA'); out.putalpha(mask)
arr = np.asarray(out).astype(int)
m = (arr[..., 3] > 0) & (arr[..., 0] > arr[..., 1] + 60) & (arr[..., 2] > arr[..., 1] + 60)
arr[m, 0] = arr[m, 1]; arr[m, 2] = arr[m, 1]
out = Image.fromarray(arr.astype(np.uint8), 'RGBA'); out = out.crop(out.getbbox())
out.save(sys.argv[2]); print(sys.argv[2], out.size)
