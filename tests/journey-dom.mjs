import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
// Development-only DOM checks. Pass a jsdom module path, or install it locally.
const {JSDOM}=await import(process.argv[2]?pathToFileURL(resolve(process.argv[2])).href:'jsdom');
const root=fileURLToPath(new URL('../',import.meta.url));
const journey=await import('file://'+root+'assets/js/archon-journey.js');
const close=[];
async function setup(page,search='',mobile=false){
 const dom=new JSDOM(readFileSync(root+page+'.html','utf8'),{url:'https://archonconsultancies.com/'+page+search,runScripts:'outside-only',pretendToBeVisual:true});
 const w=dom.window;close.push(w);
 w.matchMedia=q=>({matches:q.includes('max-width')&&mobile,addEventListener(){}});w.ResizeObserver=class {observe(){}};
 w.scrollTo=()=>{};w.HTMLElement.prototype.scrollIntoView=()=>{};
 for(const key of ['document','location','MutationObserver','ResizeObserver','Event','Image','FormData'])globalThis[key]=w[key];
 globalThis.window=w;globalThis.matchMedia=w.matchMedia;globalThis.requestAnimationFrame=cb=>w.requestAnimationFrame(cb);globalThis.scrollY=0;globalThis.innerHeight=900;
 let sends=[];w.fetch=async(url,params)=>{sends.push({url,data:JSON.parse(params.body)});return {ok:true,json:async()=>({success:false})};};
 w.eval(readFileSync(root+'assets/js/archon-contact.js','utf8'));
 journey.initJourney();
 const form=w.document.querySelector('[data-ux-form]');
 const set=(name,value)=>{const el=form.elements.namedItem(name);el.value=value;el.dispatchEvent(new w.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));};
 const submit=()=>form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
 const step=()=>Array.from(form.querySelectorAll('.ux-form-step')).findIndex(e=>!e.hidden);
 return {w,form,sends,set,submit,step};
}
const home=await setup('index');
assert.equal(home.step(),0);assert.equal(home.form.noValidate,true);
home.submit();assert.equal(home.step(),0);assert.equal(home.sends.length,0);
const choice=home.w.document.querySelector('[value="atelier"][name="visitor-need"]');choice.checked=true;choice.dispatchEvent(new home.w.Event('change',{bubbles:true}));
assert.equal(home.form.elements.project_type.value,'Atelier');
assert.match(home.form.querySelector('label[for="home-message"]').textContent,/vendes/);
assert.equal(home.w.document.querySelector('[data-need-placeholder]').hidden,true);
home.set('message','   ');home.submit();assert.equal(home.step(),0);
home.set('message','Quiero mejorar mi web y su mensaje.');home.set('business','Mi proyecto');home.submit();assert.equal(home.step(),1);assert.equal(home.sends.length,0);
home.set('name','Pablo Prueba');home.set('email','incorrecto');home.submit();assert.equal(home.step(),1);assert.equal(home.sends.length,0);
home.set('email','prueba@example.com');home.submit();assert.equal(home.step(),2);assert.equal(home.sends.length,0);assert.match(home.form.querySelector('.ux-summary').textContent,/prueba@example.com/);
home.form.querySelector('.ux-summary button').click();assert.equal(home.step(),0);assert.equal(home.form.elements.message.value,'Quiero mejorar mi web y su mensaje.');
home.form.querySelector('.ux-form-controls .brand-btn').click();home.form.querySelector('.ux-form-controls .brand-btn').click();assert.equal(home.step(),2);
home.submit();home.submit();await new Promise(r=>setTimeout(r,20));assert.equal(home.sends.length,1);assert.equal(home.sends[0].data.project_type,'Atelier');assert.equal(home.sends[0].data.email,'prueba@example.com');assert.equal(home.form.elements.message.value,'Quiero mejorar mi web y su mensaje.');assert.equal(home.form.querySelector('.contact-status').dataset.state,'error');
console.log('PASS home: need selection, whitespace and email validation, Enter, edit, payload, recoverable delivery failure.');
home.w.close();
for(const page of ['intelligence','atelier','contacto']){
 const a=await setup(page,page==='contacto'?'?necesidad=atelier':'');assert.equal(a.step(),0);
 if(page==='contacto')assert.equal(a.form.elements.tipo_proyecto.value,'Atelier');
 else assert.equal(a.form.elements.business.required,false);
 assert.equal(a.form.querySelectorAll('.ux-form-step').length,3);assert.equal(a.form.querySelectorAll('.contact-status').length,1);
 a.w.document.documentElement.lang='en';await new Promise(r=>setTimeout(r,5));assert.equal(a.form.querySelector('legend').textContent,'Your project');assert.match(a.form.querySelector('.contact-privacy,.home-note').textContent,/We will use/);
 console.log('PASS '+page+': enhancement, existing delivery handler, optional company and language change.'); a.w.close();
}
const menu=await setup('index','',true);
const nav=menu.w.document.querySelector('.brand-nav-links'),trigger=menu.w.document.querySelector('.ux-menu-toggle');
assert.equal(nav.hidden,true);trigger.click();assert.equal(nav.hidden,false);assert.equal(trigger.getAttribute('aria-expanded'),'true');
menu.w.document.dispatchEvent(new menu.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(nav.hidden,true);assert.equal(menu.w.document.activeElement,trigger);
trigger.click();const services=nav.querySelector('.brand-service-toggle');services.click();assert.equal(services.getAttribute('aria-expanded'),'true');
menu.w.document.dispatchEvent(new menu.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(services.getAttribute('aria-expanded'),'false');assert.equal(nav.hidden,false);
menu.w.document.body.click();assert.equal(nav.hidden,true);menu.w.close();
console.log('PASS mobile: open, Escape, nested services and outside-click dismissal.');
assert.equal(journey.allowedNeed('__proto__'),null);assert.equal(journey.allowedNeed('atelier'),'atelier');assert.equal(journey.readProgress(100,1000,500),.2);
for(const w of close)w.close();console.log('All DOM interaction checks passed. No real request sent.');
