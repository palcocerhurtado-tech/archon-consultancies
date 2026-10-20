"""Extract lossless scroll layers; never overwrite the original logo.
Development only: python -m pip install pillow numpy scipy
"""
from pathlib import Path
import json
import numpy as np
from PIL import Image
from scipy.ndimage import label, find_objects

root = Path(__file__).resolve().parents[1]
source = Image.open(root / 'assets/archon/archon-ac-outline-gold.png').convert('RGBA')
# Retina-sized derivative; native artwork remains unmodified in the repository.
width = 2000
source = source.resize((width, round(source.height * width / source.width)), Image.Resampling.LANCZOS)
a = np.asarray(source).copy()
r, g, b = (a[:, :, i].astype('int16') for i in range(3))
foreground = a[:, :, 3] > 0
gold = (r - b > 20) & (r >= g) & foreground
labels, _ = label(foreground & ~gold)
objects = find_objects(labels)
regions = []
for k, box in enumerate(objects, 1):
    area = (labels[box] == k).sum()
    if area > 3000:
        regions.append((box, k))
# Assign the seven entire monochrome components by position.
assignment = np.full(foreground.shape, -1, dtype='int8')
for box, k in regions:
    x, y = box[1].start * 1632 / width, box[0].start * 1515 / source.height
    if x > 1400: index = 9
    elif x > 1200: index = 8
    elif x > 1000: index = 7
    elif x > 600 and y < 400: index = 6
    elif y < 500: index = 0
    elif x < 100: index = 1
    else: index = 2
    assignment[labels == k] = index
# All remaining non-transparent pixels belong to one of the three golden inserts.
yy, xx = np.indices(foreground.shape)
remaining = foreground & (assignment == -1)
assignment[remaining & (yy > source.height * .72)] = 5
assignment[remaining & (yy <= source.height * .72) & (xx < width * .32)] = 3
assignment[remaining & (assignment == -1)] = 4
assert np.all(assignment[foreground] >= 0)
output = root / 'assets/archon/mechanism'
output.mkdir(exist_ok=True)
source.save(output / 'assembled.webp', lossless=True, exact=True)
centres = [(518,650),(265,1090),(800,1090),(260,820),(780,810),(525,1280),(900,470),(1220,1000),(1305,640),(1490,1190)]
metadata = []
reconstructed = np.zeros_like(a)
for i, centre in enumerate(centres):
    take = assignment == i
    y, x = np.where(take)
    assert len(x), i
    x0, y0, x1, y1 = int(x.min()), int(y.min()), int(x.max()) + 1, int(y.max()) + 1
    layer = a[y0:y1, x0:x1].copy()
    local = take[y0:y1, x0:x1]
    layer[~local] = 0
    Image.fromarray(layer).save(output / f'part-{i}.webp', lossless=True, exact=True)
    reconstructed[take] = a[take]
    metadata.append(dict(src=f'/assets/archon/mechanism/part-{i}.webp',
        x=x0*1632/width, y=y0*1515/source.height, width=(x1-x0)*1632/width,
        height=(y1-y0)*1515/source.height, cx=centre[0], cy=centre[1]))
assert np.array_equal(reconstructed[foreground], a[foreground]), 'Reconstruction changed visible pixels'
(output / 'layers.js').write_text('// Generated lossless layers. Source artwork is unchanged.\nexport const logoLayers = ' + json.dumps(metadata, indent=2) + ';\n')
print('PASS: 10 disjoint layers reconstruct every visible pixel exactly; original artwork untouched.')
print('Total WebP bytes:', sum(p.stat().st_size for p in output.glob('*.webp')))
