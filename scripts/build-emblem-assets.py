"""Extract independent animation components from the Higgsfield emblem.
Usage: python scripts/build-emblem-assets.py SOURCE.png
Development dependencies: pillow, numpy, scipy. No browser dependencies.
"""
from pathlib import Path
import json,sys
import numpy as np
from PIL import Image
from scipy.ndimage import label,find_objects,distance_transform_edt

root=Path(__file__).resolve().parents[1]
im=Image.open(sys.argv[1]).convert('RGB')
a=np.asarray(im).copy(); h,w=a.shape[:2]
assert (w,h)==(1024,1024),'Inspect geometry before extracting another source'
labels,_=label(a.min(axis=2)<242)
regions=[]
for key,box in enumerate(find_objects(labels),1):
    area=(labels[box]==key).sum()
    if area>100:regions.append((key,box))
assert len(regions)==12,'Expected 12 disconnected regions before splitting the base and piers'
owner=np.full((h,w),-1,dtype='int8')
for key,box in regions:
    x,y=box[1].start,box[0].start
    if y<110:index=2
    elif y<130:index=0 if x<512 else 1
    elif y<330:index=8
    elif y<390:index=3 if x<512 else 4
    elif y<435:
        take=labels==key; yy,xx=np.indices((h,w))
        owner[take&(yy<859)&(xx<512)]=5
        owner[take&(yy<859)&(xx>=512)]=6
        owner[take&(yy>=859)]=7
        continue
    elif y<470:index=11 if x<512 else 12
    elif y<560:index=9 if x<512 else 10
    else:index=13
    owner[labels==key]=index
# Retain antialiased edge pixels adjacent to a component; discard the uniform white field.
distance,nearest=distance_transform_edt(owner<0,return_indices=True)
near_owner=owner[nearest[0],nearest[1]]
keep=(distance<=1.5)&(a.min(axis=2)<254)
owner[keep]=near_owner[keep]
core=(owner>=0)&(a.min(axis=2)<210)
core_distance,core_nearest=distance_transform_edt(~core,return_indices=True)
foreground_colour=a[core_nearest[0],core_nearest[1]].astype(float)
direction=255-foreground_colour
coverage=((255-a.astype(float))*direction).sum(axis=2)/np.maximum((direction*direction).sum(axis=2),1)
keep=keep&(core_distance<=3)
alpha=np.where(keep,np.where(core,1,np.clip(coverage,0,1)),0)
# Unmatte only edge pixels so they do not carry a white halo on the website's ivory.
colour=np.clip((a.astype(float)-(1-alpha[:,:,None])*255)/np.maximum(alpha[:,:,None],1/255),0,255).round().astype('uint8')
rgba=np.dstack([colour,(alpha*255).round().astype('uint8')]);rgba[~keep]=0
out=root/'assets/archon/emblem';out.mkdir(exist_ok=True)
Image.fromarray(rgba).save(out/'assembled.webp',lossless=True,exact=True)
scale=1515/1024;offset=(1632-1515)/2
names=['arch-left','arch-right','keystone','capital-left','capital-right','pier-left','pier-right','base','star-top','star-left','star-right','star-gold-left','star-gold-right','star-gold-bottom']
# Precise, restrained architectural movement; wider trajectories for the star facets.
vectors=[[-180,-150,-5],[180,-150,5],[0,-250,0],[-215,-15,-3],[215,-15,3],[-240,80,0],[240,80,0],[0,240,0],[0,-180,-6],[-170,120,-10],[170,120,10],[-185,-65,-12],[185,-65,12],[0,205,7]]
layers=[];reconstructed=np.zeros_like(rgba)
for i,name in enumerate(names):
    take=keep&(owner==i);yy,xx=np.where(take);assert len(xx),name
    x0,y0,x1,y1=int(xx.min()),int(yy.min()),int(xx.max())+1,int(yy.max())+1
    crop=rgba[y0:y1,x0:x1].copy();crop[~take[y0:y1,x0:x1]]=0
    Image.fromarray(crop).save(out/f'{name}.webp',lossless=True,exact=True)
    reconstructed[take]=rgba[take]
    layers.append(dict(name=name,src=f'/assets/archon/emblem/{name}.webp',x=offset+x0*scale,y=y0*scale,width=(x1-x0)*scale,height=(y1-y0)*scale,cx=offset+(x0+x1)/2*scale,cy=(y0+y1)/2*scale,motion=vectors[i]))
assert np.array_equal(reconstructed,rgba),'Layer reconstruction must preserve every pixel'
manifest='// Higgsfield emblem, extracted into disjoint lossless layers.\n'
manifest+='export const artworkBounds = '+json.dumps(dict(x=offset,y=0,width=1515,height=1515))+';\n'
manifest+='export const logoLayers = '+json.dumps(layers,indent=2)+';\n'
(out/'layers.js').write_text(manifest)
(out/'provenance.json').write_text(json.dumps(dict(provider='Higgsfield',model='gpt_image_2_5',job_id='07ae2e24-1f0f-46d7-b67a-380ecf790a70',components=names,reference='User-provided architectural arch and geometric star',format='Raster artwork with a vector-like geometric finish'),indent=2)+'\n')
print('PASS: 14 independent parts reconstruct the transparent emblem exactly.')
print('WebP total bytes:',sum(p.stat().st_size for p in out.glob('*.webp')))
