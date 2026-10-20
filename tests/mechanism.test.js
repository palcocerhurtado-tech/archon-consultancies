import test from 'node:test';
import assert from 'node:assert/strict';
import { mechanismFrame } from '../assets/js/archon-mechanism.js';
import { logoLayers } from '../assets/archon/mechanism/layers.js';
import { existsSync } from 'node:fs';

test('every piece returns to its original position at both ends of scroll', () => {
  for (const expressive of [false,true]) for (const compact of [false,true]) {
    for(let i=0;i<10;i++) for(const p of [0,1,-1,2]) {
      const f=mechanismFrame(p,i,expressive,compact);
      assert.equal(Math.abs(f.x)+Math.abs(f.y)+Math.abs(f.rotate),0);
    }
  }
});
test('the suspended state separates every piece and preserves its scale',()=>{
  for(let i=0;i<10;i++){
    const f=mechanismFrame(.5,i);
    assert.equal(f.spread,1);assert.equal(f.scale,1);
    assert.ok(Math.abs(f.x)+Math.abs(f.y)>0);
  }
});
test('opening and assembly have continuous, bounded positions',()=>{
  for(let i=0;i<10;i++){
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
test('all ten lossless layers exist locally with valid geometry',()=>{
  assert.equal(logoLayers.length,10);
  for(const layer of logoLayers){
    assert.ok(existsSync(new URL('..'+layer.src,import.meta.url)));
    assert.ok(layer.width>0&&layer.height>0);
    assert.ok(layer.x>=0&&layer.y>=0);
    assert.ok(layer.x+layer.width<=1632.001&&layer.y+layer.height<=1515.001);
  }
});
