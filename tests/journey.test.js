import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {needs,allowedNeed,needFromValue,readProgress} from '../assets/js/archon-journey.js';

test('only defined needs can be used to prefill a contact request',()=>{
  for(const key of ['intelligence','atelier','guidance'])assert.equal(allowedNeed(key),key);
  for(const value of [null,'','__proto__','constructor','https://example.com','<script>'])assert.equal(allowedNeed(value),null);
  assert.equal(needFromValue('Archon Intelligence'),'intelligence');
  assert.equal(needFromValue('Atelier'),'atelier');
  assert.equal(needFromValue('No lo sé todavía'),'guidance');
});

test('every need has a bilingual question and an internal next step',()=>{
  for(const need of Object.values(needs)){
    for(const key of ['label','title','description','question','hint','link'])assert.ok(need[key].length===2&&need[key].every(value=>value.length>0));
    assert.match(need.href,/^\/(intelligence|atelier|contacto)(\?|$)/);
    assert.ok(need.points.length===3&&need.points.every(pair=>pair.length===2));
  }
});

test('reading progress handles short pages and bounds at either end',()=>{
  assert.equal(readProgress(0,1000,500),0);
  assert.equal(readProgress(250,1000,500),.5);
  assert.equal(readProgress(800,1000,500),1);
  assert.equal(readProgress(-100,1000,500),0);
  assert.equal(readProgress(0,200,500),0);
});

test('the four enhanced pages retain the native delivery endpoint and fields',()=>{
  for(const page of ['index','contacto','intelligence','atelier']){
    const html=readFileSync(new URL('../'+page+'.html',import.meta.url),'utf8');
    assert.equal((html.match(/data-ux-form/g)||[]).length,1);
    assert.match(html,/action="https:\/\/formsubmit.co\/archon.consultancies@hotmail.com"/);
    assert.ok(html.includes('type="submit"')&&html.includes('name="_honey"'));
    assert.ok(!html.includes('novalidate'));
    assert.equal((html.match(/archon-journey.js/g)||[]).length,1);
  }
});
