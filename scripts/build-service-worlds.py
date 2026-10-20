"""Export native SVG material masks as compositor-friendly local WebP layers.

Run after design/service-worlds/compose.py. Pillow only crops/converts the SVG
renderer output; all geometry, textures, lighting and masks are native SVG.
"""
from pathlib import Path
import base64
import json
import math
import subprocess
import tempfile
import xml.etree.ElementTree as ET
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'design/service-worlds'
DEST = ROOT / 'assets/archon/worlds'
NS = 'http://www.w3.org/2000/svg'
XL = 'http://www.w3.org/1999/xlink'
ET.register_namespace('', NS)
ET.register_namespace('xlink', XL)

def node(tag, attrs=None):
    return ET.Element('{'+NS+'}'+tag, attrs or {})

def use(ref, attrs=None):
    return node('use', {'{'+XL+'}href': '#'+ref, **(attrs or {})})

def rect(x,y,w,h):
    return f'M{x} {y}h{w}v{h}h{-w}Z'

def export(svg, path, tmp):
    source = tmp / 'layer.svg'
    png = tmp / 'layer.png'
    ET.ElementTree(svg).write(source, encoding='unicode')
    subprocess.run(['inkscape', str(source), '--export-type=png', '--export-filename='+str(png)], check=True, capture_output=True)
    with Image.open(png) as image:
        image = image.convert('RGBA')
        bounds = image.getchannel('A').getbbox()
        assert bounds, path
        image.crop(bounds).save(path, 'WEBP', lossless=True)
    return bounds

ARCHES = {
 'intelligence': [
  ('arch-left','M680 207 C699 126 772 72 869 55 L889 128 C826 138 780 165 758 207Z'),
  ('arch-right','M932 128 L951 55 C1053 69 1127 128 1154 207 L1066 207 C1040 162 995 137 932 128Z'),
  ('keystone','M870 36H950L928 134H889Z'),
  ('capital-left',rect(676,218,94,30)),('capital-right',rect(1058,218,98,30)),
  ('pier-left',rect(687,258,64,360)),('pier-right',rect(1078,258,65,360)),
  ('base',rect(646,620,537,55)),
 ],
 'atelier': [
  ('arch-left','M682 274 C703 181 767 137 857 119 L880 185 C823 193 780 225 765 274Z'),
  ('arch-right','M936 184 L953 120 C1046 137 1105 186 1137 274 L1056 274 C1033 225 993 195 936 184Z'),
  ('keystone','M862 106H945L926 196H883Z'),
  ('capital-left',rect(677,274,103,32)),('capital-right',rect(1047,274,106,33)),
  ('pier-left',rect(691,307,57,244)),('pier-right',rect(1070,306,60,249)),
  ('base',rect(665,553,490,37)),
 ]
}
ARCH_MOTION=[[-45,-38,-4],[45,-38,4],[0,-28,0],[-48,-8,-2],[48,-8,2],[-55,15,0],[55,15,0],[0,48,0]]
STAR_NAMES=['star-top','star-gold-right','star-right','star-gold-bottom','star-left','star-gold-left']
STAR_MOTION=[[0,-40,0],[35,-15,4],[35,25,3],[0,43,0],[-35,25,-3],[-35,-15,-4]]
# Sector boundaries run through the six inner corners. The PNG alpha is the
# actual outer silhouette: sectors only partition it without inventing geometry.
CORNERS=[(313,347),(576,342),(646,444),(532,642),(375,640),(236,454)]

worlds={}
DEST.mkdir(parents=True,exist_ok=True)
with tempfile.TemporaryDirectory() as temp:
 tmp=Path(temp)
 for kind, sx, sy, sw in [('intelligence',752,220,312),('atelier',760,235,290)]:
    dest=DEST/kind
    dest.mkdir(exist_ok=True)
    original=ET.parse(SOURCE/(kind+'-concept.svg')).getroot()
    defs=original.find('{'+NS+'}defs')
    materials=original.findall('{'+NS+'}g')[-1]
    # Threshold is applied only inside manually bounded metal regions.
    matte=node('filter',{'id':'metal-alpha','color-interpolation-filters':'sRGB'})
    matte.append(node('feColorMatrix',{'type':'matrix','values':'0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 -25 0 18.2'}))
    matte.append(node('feComposite',{'in2':'SourceGraphic','operator':'in'}))
    defs.append(matte)
    all_layers=[]
    def canvas():
        svg=node('svg',{'width':'1344','height':'752','viewBox':'0 0 1344 752'})
        svg.append(ET.fromstring(ET.tostring(defs)))
        return svg
    def save(svg,name,motion):
        bounds=export(svg,dest/(name+'.webp'),tmp)
        x,y,r,b=bounds
        all_layers.append({'name':name,'src':f'/assets/archon/worlds/{kind}/{name}.webp','x':x,'y':y,'width':r-x,'height':b-y,'motion':motion})
    if kind=='intelligence':
        svg=canvas()
        for rx,ry in [(196,213),(184,200)]:
            svg.append(node('ellipse',{'cx':'910','cy':'354','rx':str(rx),'ry':str(ry),'fill':'none','stroke':'#79561f','stroke-width':'4'}))
            svg.append(node('ellipse',{'cx':'910','cy':'353.2','rx':str(rx),'ry':str(ry),'fill':'none','stroke':'#c3a46b','stroke-width':'1.2'}))
        save(svg,'rings',[0,0,7])
    for (name,path),motion in zip(ARCHES[kind],ARCH_MOTION):
        svg=canvas()
        clip=node('clipPath',{'id':'part-clip'})
        clip.append(node('path',{'d':path}))
        svg.find('{'+NS+'}defs').append(clip)
        mask=node('mask',{'id':'metal-mask','maskUnits':'userSpaceOnUse','x':'0','y':'0','width':'1344','height':'752'})
        mask.append(use('scene',{'filter':'url(#metal-alpha)'}))
        svg.find('{'+NS+'}defs').append(mask)
        svg.append(use('scene',{'clip-path':'url(#part-clip)','mask':'url(#metal-mask)'}))
        save(svg,name,motion)
    for i,(name,motion) in enumerate(zip(STAR_NAMES,STAR_MOTION)):
        svg=canvas()
        cx,cy=446,460
        a=CORNERS[i]; b=CORNERS[(i+1)%6]
        points=[(cx,cy),(cx+20*(a[0]-cx),cy+20*(a[1]-cy)),(cx+20*(b[0]-cx),cy+20*(b[1]-cy))]
        points=[(sx+x*sw/891,sy+y*sw/891) for x,y in points]
        clip=node('clipPath',{'id':'sector'})
        clip.append(node('polygon',{'points':' '.join(f'{x},{y}' for x,y in points)}))
        svg.find('{'+NS+'}defs').append(clip)
        group=node('g',{'clip-path':'url(#sector)'})
        group.append(ET.fromstring(ET.tostring(materials)))
        svg.append(group)
        save(svg,name,motion)
    Image.open(SOURCE/(kind+'-clean.png')).save(dest/'background.webp','WEBP',quality=92)
    # The static enhancement uses exactly the same layers as every animated frame.
    assembled=Image.open(dest/'background.webp').convert('RGBA')
    for part in all_layers:
        with Image.open(dest/(part['name']+'.webp')) as im:
            assembled.alpha_composite(im.convert('RGBA'),(part['x'],part['y']))
    assembled.save(dest/'assembled.webp','WEBP',quality=94)
    worlds[kind]={'width':1344,'height':752,'background':f'/assets/archon/worlds/{kind}/background.webp','assembled':f'/assets/archon/worlds/{kind}/assembled.webp','layers':all_layers}
(DEST/'layers.js').write_text('export const worlds = '+json.dumps(worlds,indent=2)+';\n')
print({name:len(world['layers']) for name,world in worlds.items()})
