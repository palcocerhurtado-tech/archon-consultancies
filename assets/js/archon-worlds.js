import { worlds } from '../archon/worlds/layers.js';
import { advanceMotion, clamp } from './archon-mechanism.js';

const smooth = value => { const t = clamp(value); return t*t*t*(t*(t*6-15)+10); };

export function worldFrame(progress, layer, kind, compact = false) {
  const p = clamp(progress);
  const spread = smooth((p-.025)/.30) * (1-smooth((p-.45)/.34));
  const strength = (kind === 'atelier' ? .48 : 1) * (compact ? .58 : 1);
  return {
    x: layer.motion[0]*spread*strength,
    y: layer.motion[1]*spread*strength,
    rotate: layer.motion[2]*spread*strength,
    scale: layer.name === 'rings' ? 1+spread*.10*strength : 1,
    spread,
  };
}

function initWorld(section) {
  const kind = section.dataset.world, world = worlds[kind];
  if (!world) return;
  const stage = section.querySelector('[data-mechanism-stage]');
  const art = section.querySelector('[data-world-art]');
  const fallback = art.querySelector('img');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 760px)');
  const header = document.querySelector('.brand-topbar');
  const plane = document.createElement('div');
  plane.className = 'world-plane'; plane.setAttribute('aria-hidden','true');
  const background = new Image();
  background.src = world.background; background.alt = ''; background.className = 'world-background';
  plane.append(background);
  const parts = world.layers.map(layer => {
    const image = new Image(); image.src = layer.src; image.alt = ''; image.draggable = false;
    image.className = 'world-part';
    image.style.left = layer.x/world.width*100+'%';
    image.style.top = layer.y/world.height*100+'%';
    image.style.width = layer.width/world.width*100+'%';
    image.style.height = layer.height/world.height*100+'%';
    plane.append(image); return image;
  });
  const phase = section.querySelector('[data-mechanism-phase]');
  const counter = section.querySelector('[data-mechanism-counter]');
  const bar = section.querySelector('[data-mechanism-bar]');
  let target=0, current=0, velocity=0, raf=0, lastTime=0, active=false;
  let start=0, travel=1, unit=1, count=-1, lastPhase=-1, ready=false;
  function measure() {
    const headerHeight = Math.ceil(header?.getBoundingClientRect().height || 0);
    section.style.setProperty('--mechanism-header',headerHeight+'px');
    start = section.getBoundingClientRect().top+scrollY-headerHeight;
    travel = Math.max(1,section.offsetHeight-stage.offsetHeight);
    target = clamp((scrollY-start)/travel);
    const width = Math.min(art.clientWidth*(compact.matches ? 1.92 : 1),art.clientHeight*world.width/world.height);
    plane.style.width=width+'px'; plane.style.height=width*world.height/world.width+'px';
    unit=width/world.width;
  }
  function render() {
    const p=reduced.matches ? 0 : current;
    parts.forEach((part,i) => {
      const frame=worldFrame(p,world.layers[i],kind,compact.matches);
      part.style.transform=`translate3d(${(frame.x*unit).toFixed(3)}px,${(frame.y*unit).toFixed(3)}px,0) rotate(${frame.rotate.toFixed(3)}deg) scale(${frame.scale.toFixed(5)})`;
    });
    bar.style.transform=`scaleX(${p})`;
    const nextCount=Math.round(p*100);
    if (nextCount!==count) { count=nextCount; counter.textContent=String(count).padStart(3,'0'); }
    const nextPhase=p<.06 ? 0 : p<.325 ? 1 : p<.45 ? 2 : p<.79 ? 3 : 4;
    if (nextPhase!==lastPhase) {
      lastPhase=nextPhase;
      phase.textContent=(document.documentElement.lang==='en'
        ? ['The whole','Separation','Balance','Assembly','One architecture']
        : ['El conjunto','Despiece','Equilibrio','Ensamblaje','Una arquitectura'])[nextPhase];
    }
  }
  function tick(time) {
    raf=0;
    if (!active || !ready || document.hidden || reduced.matches) return;
    const dt=lastTime ? (time-lastTime)/1000 : 1/60; lastTime=time;
    const next=advanceMotion(current,target,velocity,dt);
    current=next.position; velocity=next.velocity;
    if (Math.abs(target-current)<.00001 && Math.abs(velocity)<.0001) {current=target;velocity=0;}
    render();
    if (current!==target || velocity!==0) raf=requestAnimationFrame(tick);
  }
  function request() {
    if (active && ready && !raf && !reduced.matches && !document.hidden) {lastTime=0;raf=requestAnimationFrame(tick);}
  }
  function resize() { if (!ready) return; measure(); render(); request(); }
  function preference() {
    if (raf) {cancelAnimationFrame(raf);raf=0;}
    section.classList.toggle('world-reduced',reduced.matches);
    section.classList.toggle('world-active',active&&!reduced.matches);
    measure(); current=reduced.matches ? 0 : target;velocity=0;render();request();
  }
  Promise.all([background.decode(),...parts.map(image=>image.decode())]).then(() => {
    art.append(plane);fallback.hidden=true;ready=true;
    section.classList.add('world-ready');preference();
    new IntersectionObserver(entries => {
      active=entries[0].isIntersecting;
      section.classList.toggle('world-active',active&&!reduced.matches);
      if (active) {measure();request();}
      else if (raf) {cancelAnimationFrame(raf);raf=0;}
    },{rootMargin:'120px 0px'}).observe(section);
    const resizeObserver=new ResizeObserver(resize);
    resizeObserver.observe(art);if(header)resizeObserver.observe(header);
    window.addEventListener('scroll',()=>{target=clamp((scrollY-start)/travel);request();},{passive:true});
    window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}else request();
    });
    reduced.addEventListener('change',preference);compact.addEventListener('change',resize);
    new MutationObserver(()=>{lastPhase=-1;render();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }).catch(()=>{/* The complete approved composition remains visible. */});
}

if(typeof document!=='undefined') document.querySelectorAll('[data-world]').forEach(section=>{
  const observer=new IntersectionObserver(entries=>{
    if(entries[0].isIntersecting){observer.disconnect();initWorld(section);}
  },{rootMargin:'600px 0px'});
  observer.observe(section);
});
