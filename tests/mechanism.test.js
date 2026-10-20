import test from 'node:test';
import assert from 'node:assert/strict';
import { mechanismFrame, advanceMotion } from '../assets/js/archon-mechanism.js';
import { logoLayers } from '../assets/archon/emblem/layers.js';
import { existsSync } from 'node:fs';

test('every piece returns to its original position at both ends of scroll', () => {
  for (const expressive of [false,true]) for (const compact of [false,true]) {
    for(let i=0;i<logoLayers.length;i++) for(const p of [0,1,-1,2]) {
      const f=mechanismFrame(p,i,expressive,compact);
      assert.equal(Math.abs(f.x)+Math.abs(f.y)+Math.abs(f.rotate),0);
    }
  }
});
test('the suspended state separates every piece and preserves its scale',()=>{
  for(let i=0;i<logoLayers.length;i++){
    const f=mechanismFrame(.4,i);
    assert.equal(f.spread,1);assert.equal(f.scale,1);
    assert.ok(Math.abs(f.x)+Math.abs(f.y)>0);
  }
});
test('opening and assembly have continuous, bounded positions',()=>{
  for(let i=0;i<logoLayers.length;i++){
    let prev=mechanismFrame(0,i,true);
    for(let n=1;n<=1000;n++){
      const f=mechanismFrame(n/1000,i,true);
      assert.ok(Number.isFinite(f.x)&&Number.isFinite(f.y));
      assert.ok(f.spread>=0&&f.spread<=1);
      assert.ok(Math.abs(f.x-prev.x)<5&&Math.abs(f.y-prev.y)<5);
      prev=f;
    }
  }
});
test('scroll direction cannot change the pose for a given progress',()=>{
  const forward=Array.from({length:101},(_,n)=>mechanismFrame(n/100,3,true));
  for(let n=100;n>=0;n--)assert.deepEqual(mechanismFrame(n/100,3,true),forward[n]);
});
test('mobile shortens travel and Atelier has a wider composition',()=>{
  assert.ok(Math.abs(mechanismFrame(.5,1,false,true).x)<Math.abs(mechanismFrame(.5,1).x));
  assert.ok(Math.abs(mechanismFrame(.5,1,true).x)>Math.abs(mechanismFrame(.5,1).x));
});
test('all fourteen emblem parts exist locally with valid geometry',()=>{
  assert.equal(logoLayers.length,14);
  for(const layer of logoLayers){
    assert.ok(existsSync(new URL('..'+layer.src,import.meta.url)));
    assert.ok(layer.width>0&&layer.height>0);
    assert.ok(layer.x>=0&&layer.y>=0);
    assert.ok(layer.x+layer.width<=1632.001&&layer.y+layer.height<=1515.001);
  }
});


test('damping reaches the same position at 60Hz and 120Hz',()=>{
  const simulate=hz=>{
    let position=0,velocity=0;
    for(let i=0;i<hz;i++){
      const next=advanceMotion(position,1,velocity,1/hz);
      position=next.position;velocity=next.velocity;
    }
    return position;
  };
  assert.ok(Math.abs(simulate(60)-simulate(120))<1e-10);
  assert.ok(simulate(60)>.9999);
});
test('rapid scroll reversals remain continuous and bounded',()=>{
  let position=0,velocity=0;
  for(let i=0;i<300;i++){
    const next=advanceMotion(position,i<80?1:i<160?0:1,velocity,1/60);
    assert.ok(next.position>=0&&next.position<=1);
    assert.ok(Math.abs(next.position-position)<.19);
    assert.ok(Number.isFinite(next.velocity));
    position=next.position;velocity=next.velocity;
  }
});


test('scroll response reaches 95 percent of a new target within ten 60Hz frames',()=>{
  let position=0,velocity=0;
  for(let i=0;i<logoLayers.length;i++){
    const next=advanceMotion(position,1,velocity,1/60);
    position=next.position;velocity=next.velocity;
  }
  assert.ok(position>.95);
});


test('architectural components and all six star rays have independent trajectories',()=>{
  const names=new Set(logoLayers.map(x=>x.name));
  for(const name of ['arch-left','arch-right','keystone','capital-left','capital-right','pier-left','pier-right','base','star-top','star-left','star-right','star-gold-left','star-gold-right','star-gold-bottom'])assert.ok(names.has(name));
  for(const layer of logoLayers)assert.equal(layer.motion.length,3);
});
