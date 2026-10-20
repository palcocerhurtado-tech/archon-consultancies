"""Compose native SVG layouts with the user's unmodified transparent star.

Higgsfield supplies the architectural scene and material samples. The original
star's alpha fixes its silhouette; color masks assign the scene's bronze/gold.
"""
from pathlib import Path
import base64
import hashlib
import json
import shutil
import sys
import subprocess

root = Path(__file__).parent
source = Path(sys.argv[1])
master = root / 'star-original.png'
if source.resolve() != master.resolve():
    shutil.copyfile(source, master)

def uri(path):
    return 'data:image/png;base64,' + base64.b64encode(path.read_bytes()).decode()

specs = [('intelligence', 752, 220, 312), ('atelier', 760, 235, 290)]
for name, x, y, width in specs:
    height = width * 860 / 891
    bronze = '700 320 34 128' if name == 'intelligence' else '700 335 34 128'
    gold = '895 66 24 32' if name == 'intelligence' else '889 130 24 32'
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1344" height="752" viewBox="0 0 1344 752">
<title>ARCHON {name.title()} — estrella original con materiales integrados</title>
<desc>La silueta procede del PNG original. Bronce y oro se toman del arco de esta misma escena, con relieve y sombra suaves.</desc>
<defs>
<image id="scene" width="1344" height="752" xlink:href="{uri(root / (name+'-background.png'))}"/>
<image id="master" x="{x}" y="{y}" width="{width}" height="{height}" preserveAspectRatio="xMidYMid meet" xlink:href="{uri(master)}"/>
<filter id="gold-select" color-interpolation-filters="sRGB">
<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  10 0 0 0 -2"/>
<feComposite in2="SourceGraphic" operator="in"/>
</filter>
<filter id="alpha-white"><feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/></filter>
<mask id="silhouette" maskUnits="userSpaceOnUse" x="{x-5}" y="{y-5}" width="{width+10}" height="{height+10}"><use xlink:href="#master" filter="url(#alpha-white)"/></mask>
<mask id="gold-mask" maskUnits="userSpaceOnUse" x="{x-5}" y="{y-5}" width="{width+10}" height="{height+10}"><use xlink:href="#master" filter="url(#gold-select)"/></mask>
<pattern id="bronze" patternUnits="userSpaceOnUse" width="34" height="128"><svg width="34" height="128" viewBox="{bronze}" preserveAspectRatio="none"><use xlink:href="#scene"/></svg></pattern>
<pattern id="gold" patternUnits="userSpaceOnUse" width="36" height="48"><svg width="36" height="48" viewBox="{gold}" preserveAspectRatio="none"><use xlink:href="#scene"/></svg></pattern>
<linearGradient id="shade" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#ffffff" stop-opacity=".10"/><stop offset=".42" stop-color="#000000" stop-opacity="0"/><stop offset="1" stop-color="#000000" stop-opacity=".17"/></linearGradient>
<filter id="relief" x="-.08" y="-.08" width="1.16" height="1.16" color-interpolation-filters="sRGB">
<feGaussianBlur in="SourceAlpha" stdDeviation=".7" result="height"/>
<feSpecularLighting in="height" surfaceScale="2.2" specularConstant=".65" specularExponent="18" lighting-color="#e6d3aa" result="light"><feDistantLight azimuth="225" elevation="48"/></feSpecularLighting>
<feComposite in="light" in2="SourceAlpha" operator="in" result="shine"/>
<feComposite in="SourceGraphic" in2="shine" operator="arithmetic" k1="0" k2="1" k3=".5" k4="0" result="lit"/>
<feGaussianBlur in="SourceAlpha" stdDeviation="1.3" result="blur"/><feOffset in="blur" dx="1.7" dy="2.3" result="offset"/>
<feFlood flood-color="#21190e" flood-opacity=".32"/><feComposite in2="offset" operator="in" result="shadow"/>
<feMerge><feMergeNode in="shadow"/><feMergeNode in="lit"/></feMerge>
</filter>
</defs>
<use xlink:href="#scene"/>
<g filter="url(#relief)"><g mask="url(#silhouette)">
<rect x="{x}" y="{y}" width="{width}" height="{height}" fill="url(#bronze)"/>
<rect x="{x}" y="{y}" width="{width}" height="{height}" fill="url(#gold)" mask="url(#gold-mask)"/>
<rect x="{x}" y="{y}" width="{width}" height="{height}" fill="url(#shade)"/>
</g></g>
</svg>'''
    out = root / (name+'-concept.svg')
    out.write_text(svg)
    subprocess.run(['inkscape', str(out), '--export-type=png', '--export-filename='+str(root / (name+'-preview.png'))], check=True, capture_output=True)

(root / 'provenance.json').write_text(json.dumps({
    'star': {'source': source.name, 'sha256': hashlib.sha256(master.read_bytes()).hexdigest(), 'redrawn': False, 'transformation': 'uniform scale and translation; original alpha mask; bronze and gold sampled from surrounding objects; shallow relief and cast shadow'},
    'backgrounds': {'provider': 'Higgsfield', 'intelligence': '31dce057-fec4-4d32-9750-d48ae6ce4057', 'atelier': '2e64894e-2824-4a1f-8d69-c06de2a8f04f'},
    'status': 'concepts for review; not connected to production pages',
}, indent=2))
assert master.read_bytes() == source.read_bytes()
print('Two SVG concepts rendered; original star is byte-identical.')
