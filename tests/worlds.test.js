import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { worlds } from '../assets/archon/worlds/layers.js';
import { worldFrame } from '../assets/js/archon-worlds.js';

test('both material worlds return every part to the approved geometry',()=>{
  for(const [kind,world] of Object.entries(worlds)) for(const compact of [false,true]) {
    for(const layer of world.layers) for(const p of [-1,0,1,2]) {
      const f=worldFrame(p,layer,kind,compact);
      assert.equal(Math.abs(f.x)+Math.abs(f.y)+Math.abs(f.rotate),0);
      assert.equal(f.scale,1);
    }
  }
});

test('all six original star components exist in each world and assets fit the canvas',()=>{
  for(const [kind,world] of Object.entries(worlds)) {
    assert.equal(world.layers.filter(layer=>layer.name.startsWith('star-')).length,6);
    assert.equal(world.layers.length,kind==='intelligence'?15:14);
    for(const layer of world.layers) {
      assert.ok(existsSync(new URL('..'+layer.src,import.meta.url)));
      assert.ok(layer.x>=0&&layer.y>=0&&layer.width>0&&layer.height>0);
      assert.ok(layer.x+layer.width<=world.width&&layer.y+layer.height<=world.height);
    }
    for(const src of [world.background,world.assembled]) assert.ok(existsSync(new URL('..'+src,import.meta.url)));
  }
});

test('service poses are reversible and continuous, with quieter mobile and Atelier motion',()=>{
  for(const [kind,world] of Object.entries(worlds)) for(const layer of world.layers) {
    let previous=worldFrame(0,layer,kind);
    for(let i=1;i<=1000;i++) {
      const p=i/1000,f=worldFrame(p,layer,kind);
      assert.ok(f.spread>=0&&f.spread<=1);
      assert.ok(Math.abs(f.x-previous.x)<2&&Math.abs(f.y-previous.y)<2);
      assert.deepEqual(worldFrame(p,layer,kind),f);
      previous=f;
    }
    const desktop=worldFrame(.4,layer,kind),mobile=worldFrame(.4,layer,kind,true);
    assert.ok(Math.abs(mobile.x)<=Math.abs(desktop.x)&&Math.abs(mobile.y)<=Math.abs(desktop.y));
  }
  const layer=worlds.intelligence.layers.find(layer=>layer.name==='star-top');
  assert.ok(Math.abs(worldFrame(.4,layer,'atelier').y)<Math.abs(worldFrame(.4,layer,'intelligence').y));
});

test('only service pages opt into the new scenes and retain static image fallbacks',()=>{
  for(const kind of ['intelligence','atelier']) {
    const html=readFileSync(new URL('../'+kind+'.html',import.meta.url),'utf8');
    assert.ok(html.includes('data-world="'+kind+'"'));
    assert.ok(html.includes(worlds[kind].assembled));
    assert.ok(!html.includes('data-mechanism="'+kind+'"'));
  }
  assert.ok(!readFileSync(new URL('../index.html',import.meta.url),'utf8').includes('archon-worlds.js'));
});

test('fully separated layers remain inside the scene canvas, including rotated corners',()=>{
  for(const [kind,w] of Object.entries(worlds)) for(const layer of w.layers) {
    const f=worldFrame(.39,layer,kind),a=f.rotate*Math.PI/180;
    for(const x of [-layer.width/2,layer.width/2]) for(const y of [-layer.height/2,layer.height/2]) {
      const px=layer.x+layer.width/2+f.x+(x*Math.cos(a)-y*Math.sin(a))*f.scale;
      const py=layer.y+layer.height/2+f.y+(x*Math.sin(a)+y*Math.cos(a))*f.scale;
      assert.ok(px>=0&&px<=w.width&&py>=0&&py<=w.height,`${kind}/${layer.name}: ${px},${py}`);
    }
  }
});
