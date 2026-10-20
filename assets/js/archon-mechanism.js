import { logoLayers } from '../archon/mechanism/layers.js';
/* Scroll choreography uses clipped instances of the original artwork, never a redraw. */
export const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t); };

export function mechanismFrame(progress, index, expressive = false, compact = false) {
  const p = clamp(progress);
  const delay = index * 0.009;
  const opening = smooth((p - 0.10 - delay) / 0.24);
  const closing = smooth((p - 0.57 - delay) / 0.25);
  const spread = opening * (1 - closing);
  const vectors = [[0,-210,-7],[-220,130,-11],[170,125,9],[-240,-90,-18],[190,-100,16],[0,230,9],[125,-155,5],[210,85,-5],[235,-45,13],[240,165,-10]];
  const [x,y,r] = vectors[index];
  const strength = (expressive ? 1.18 : 0.85) * (compact ? 0.62 : 1);
  return { x:x*spread*strength, y:y*spread*strength, rotate:r*spread*(expressive?1.3:0.65),
    scale:1 - smooth((p-0.89)/0.11)*0.08, spread };
}

const NS = 'http://www.w3.org/2000/svg';

function initMechanism(section, number) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px)');
  const stage = section.querySelector('[data-mechanism-stage]');
  const mount = section.querySelector('[data-mechanism-art]');
  const original = mount.querySelector('img');
  const phase = section.querySelector('[data-mechanism-phase]');
  const counter = section.querySelector('[data-mechanism-counter]');
  const bar = section.querySelector('[data-mechanism-bar]');
  const expressive = section.dataset.mechanism === 'atelier';
  const svg = document.createElementNS(NS,'svg');
  svg.setAttribute('viewBox','-310 -110 2240 1870');
  svg.setAttribute('aria-hidden','true');
  svg.classList.add('mechanism-svg');
  const groups = logoLayers.map(layer => {
    const outer=document.createElementNS(NS,'g');
    outer.style.transformOrigin=`${layer.cx}px ${layer.cy}px`;
    const image=document.createElementNS(NS,'image');
    image.setAttribute('href',layer.src);
    for(const key of ['x','y','width','height']) image.setAttribute(key,String(layer[key]));
    outer.append(image);svg.append(outer);
    return outer;
  });
  // The source itself is shown whenever assembled, guaranteeing the exact original silhouette.
  const intact=document.createElementNS(NS,'image');
  intact.setAttribute('href',original.getAttribute('src'));
  intact.setAttribute('width','1632');intact.setAttribute('height','1515');
  intact.classList.add('mechanism-intact');svg.append(intact);
  let target=0,current=0,raf=0,active=false,phaseIndex=-1;
  let travel=1,start=0,lastTime=0;
  function measure(){
    const topbar=document.querySelector('.brand-topbar');
    const header=Math.ceil(topbar?.getBoundingClientRect().height||0);
    section.style.setProperty('--mechanism-header',header+'px');
    start=section.getBoundingClientRect().top+scrollY-header;
    travel=Math.max(1,section.offsetHeight-stage.offsetHeight);
    target=clamp((scrollY-start)/travel);
  }
  function render(){
    const p=reduced.matches?0:current;
    let maxSpread=0;
    groups.forEach((g,i)=>{
      const f=mechanismFrame(p,i,expressive,compact.matches);
      maxSpread=Math.max(maxSpread,f.spread);
      g.style.transform=`translate(${f.x.toFixed(3)}px,${f.y.toFixed(3)}px) rotate(${f.rotate.toFixed(3)}deg)`;
    });
    intact.style.opacity=maxSpread<0.0001?'1':'0';
    groups.forEach(g=>{g.style.opacity=maxSpread<0.0001?'0':'1';});
    svg.style.transform=`scale(${mechanismFrame(p,0,expressive,compact.matches).scale})`;
    bar.style.transform=`scaleX(${p})`;
    counter.textContent=String(Math.round(p*100)).padStart(3,'0');
    const next=p<0.17?0:p<0.43?1:p<0.59?2:p<0.90?3:4;
    if(next!==phaseIndex){
      phaseIndex=next;
      const en=document.documentElement.lang==='en';
      phase.textContent=(en?['The whole','Separation','Balance','Assembly','One architecture']:['El conjunto','Despiece','Equilibrio','Ensamblaje','Una arquitectura'])[next];
    }
  }
  function tick(time){
    raf=0;
    if(!active||document.hidden||reduced.matches)return;
    const diff=target-current;
    const dt=lastTime?Math.min(time-lastTime,64):16.67; lastTime=time;
    current=Math.abs(diff)<0.00015?target:current+diff*(1-Math.exp(-dt/85));
    render();
    if(Math.abs(target-current)>0.00015)raf=requestAnimationFrame(tick);
  }
  function request(){if(active&&!raf&&!reduced.matches&&!document.hidden){lastTime=0;raf=requestAnimationFrame(tick);}}
  function scroll(){target=clamp((scrollY-start)/travel);request();}
  function resize(){measure();if(reduced.matches){current=0;render();}else request();}
  function preference(){
    section.classList.toggle('mechanism-reduced',reduced.matches);
    if(raf){cancelAnimationFrame(raf);raf=0;}
    measure();current=reduced.matches?0:target;render();request();
  }
  // Wait for the original artwork before replacing its accessible static fallback.
  Promise.all([original.decode(), ...logoLayers.map(layer => {
    const image=new Image(); image.src=layer.src; return image.decode();
  })]).then(()=>{
    mount.append(svg);original.hidden=true;section.classList.add('mechanism-ready');
    measure();current=target;preference();
    new IntersectionObserver(entries=>{
      active=entries[0].isIntersecting;
      if(active){measure();current=target;render();request();}
      else if(raf){cancelAnimationFrame(raf);raf=0;}
    },{rootMargin:'120px 0px'}).observe(section);
    new ResizeObserver(resize).observe(document.querySelector('.brand-topbar'));
    new ResizeObserver(resize).observe(stage);
    window.addEventListener('scroll',scroll,{passive:true});
    window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}else request();});
    reduced.addEventListener('change',preference);
    compact.addEventListener('change',resize);
    new MutationObserver(()=>{phaseIndex=-1;render();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }).catch(()=>{/* The unmodified image remains visible if enhancement is unavailable. */});
}
if(typeof document!=='undefined'){
  document.querySelectorAll('[data-mechanism]').forEach(initMechanism);
}
