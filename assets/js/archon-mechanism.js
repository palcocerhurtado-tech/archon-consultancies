import { logoLayers } from '../archon/mechanism/layers.js';
/* Original artwork, split into disjoint lossless layers. No redraw or deformation. */
export const clamp = value => Math.max(0, Math.min(1, value));
const smooth = value => { const t=clamp(value); return clamp(t*t*t*(t*(t*6-15)+10)); };
const vectors = [[0,-210,-7],[-220,130,-11],[170,125,9],[-240,-90,-18],[190,-100,16],[0,230,9],[125,-155,5],[210,85,-5],[235,-45,13],[240,165,-10]];

export function mechanismFrame(progress,index,expressive=false,compact=false){
  const p=clamp(progress),delay=index*.007;
  const spread=smooth((p-.04-delay)/.38)*(1-smooth((p-.51-delay)/.38));
  const [x,y,r]=vectors[index];
  const strength=(expressive?1.18:.85)*(compact?.62:1);
  return {x:x*spread*strength,y:y*spread*strength,rotate:r*spread*(expressive?1.3:.65),
    scale:1-smooth((p-.93)/.07)*.08,spread};
}

// Exact critically damped response: preserves velocity, independent of display refresh rate.
export function advanceMotion(current,target,velocity,seconds){
  const dt=Math.max(0,Math.min(seconds,.064)),omega=18;
  const offset=current-target,c=velocity+omega*offset,decay=Math.exp(-omega*dt);
  const position=target+(offset+c*dt)*decay;
  const nextVelocity=(velocity-omega*c*dt)*decay;
  return {position:clamp(position),velocity:position<0||position>1?0:nextVelocity};
}

function initMechanism(section){
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const compact=matchMedia('(max-width: 760px)');
  const stage=section.querySelector('[data-mechanism-stage]');
  const mount=section.querySelector('[data-mechanism-art]');
  const original=mount.querySelector('img');
  const phase=section.querySelector('[data-mechanism-phase]');
  const counter=section.querySelector('[data-mechanism-counter]');
  const bar=section.querySelector('[data-mechanism-bar]');
  const expressive=section.dataset.mechanism==='atelier';
  const viewport=document.createElement('div');
  viewport.className='mechanism-viewport';viewport.setAttribute('aria-hidden','true');
  const plane=document.createElement('div');plane.className='mechanism-plane';viewport.append(plane);
  const groups=logoLayers.map(layer=>{
    const part=document.createElement('img');part.src=layer.src;part.alt='';
    part.className='mechanism-part';part.draggable=false;
    part.style.left=(layer.x+310)/2240*100+'%';part.style.top=(layer.y+110)/1870*100+'%';
    part.style.width=layer.width/2240*100+'%';part.style.height=layer.height/1870*100+'%';
    part.style.transformOrigin=`${(layer.cx-layer.x)/layer.width*100}% ${(layer.cy-layer.y)/layer.height*100}%`;
    plane.append(part);return part;
  });
  const intact=document.createElement('img');intact.src=original.src;intact.alt='';
  intact.className='mechanism-intact';intact.draggable=false;plane.append(intact);
  let target=0,current=0,velocity=0,raf=0,active=false,phaseIndex=-1;
  let travel=1,start=0,lastTime=0,unit=1,assembled=null,lastCounter=-1;
  function measure(){
    const header=Math.ceil(document.querySelector('.brand-topbar')?.getBoundingClientRect().height||0);
    section.style.setProperty('--mechanism-header',header+'px');
    start=section.getBoundingClientRect().top+scrollY-header;
    travel=Math.max(1,section.offsetHeight-stage.offsetHeight);
    target=clamp((scrollY-start)/travel);
    const width=Math.min(mount.clientWidth,mount.clientHeight*2240/1870);
    unit=width/2240;plane.style.width=width+'px';plane.style.height=width*1870/2240+'px';
  }
  function render(){
    const p=reduced.matches?0:current;
    let maxSpread=0;
    groups.forEach((part,i)=>{
      const f=mechanismFrame(p,i,expressive,compact.matches);
      maxSpread=Math.max(maxSpread,f.spread);
      part.style.transform=`translate3d(${(f.x*unit).toFixed(3)}px,${(f.y*unit).toFixed(3)}px,0) rotate(${f.rotate.toFixed(3)}deg)`;
    });
    const nextAssembled=maxSpread<.000001;
    if(nextAssembled!==assembled){
      assembled=nextAssembled;plane.classList.toggle('is-assembled',assembled);
    }
    plane.style.transform=`scale(${mechanismFrame(p,0,expressive,compact.matches).scale})`;
    bar.style.transform=`scaleX(${p})`;
    const count=Math.round(p*100);
    if(count!==lastCounter){counter.textContent=String(count).padStart(3,'0');lastCounter=count;}
    const next=p<.12?0:p<.44?1:p<.53?2:p<.94?3:4;
    if(next!==phaseIndex){
      phaseIndex=next;
      phase.textContent=(document.documentElement.lang==='en'
        ?['The whole','Separation','Balance','Assembly','One architecture']
        :['El conjunto','Despiece','Equilibrio','Ensamblaje','Una arquitectura'])[next];
    }
  }
  function tick(time){
    raf=0;if(!active||document.hidden||reduced.matches)return;
    const dt=lastTime?(time-lastTime)/1000:1/60;lastTime=time;
    const next=advanceMotion(current,target,velocity,dt);current=next.position;velocity=next.velocity;
    if(Math.abs(target-current)<.00001&&Math.abs(velocity)<.0001){current=target;velocity=0;}
    render();
    if(current!==target||velocity!==0)raf=requestAnimationFrame(tick);
  }
  function request(){if(active&&!raf&&!reduced.matches&&!document.hidden){lastTime=0;raf=requestAnimationFrame(tick);}}
  function scroll(){target=clamp((scrollY-start)/travel);request();}
  function resize(){measure();if(reduced.matches){current=0;velocity=0;render();}else request();}
  function preference(){
    section.classList.toggle('mechanism-reduced',reduced.matches);
    if(raf){cancelAnimationFrame(raf);raf=0;}
    measure();current=reduced.matches?0:target;velocity=0;render();request();
  }
  Promise.all([original.decode(),intact.decode(),...groups.map(part=>part.decode())]).then(()=>{
    mount.append(viewport);original.hidden=true;section.classList.add('mechanism-ready');
    measure();current=target;preference();
    new IntersectionObserver(entries=>{
      active=entries[0].isIntersecting;
      if(active){measure();render();request();}
      else if(raf){cancelAnimationFrame(raf);raf=0;}
      section.classList.toggle('mechanism-active',active&&!reduced.matches);
    },{rootMargin:'120px 0px'}).observe(section);
    new ResizeObserver(resize).observe(document.querySelector('.brand-topbar'));
    new ResizeObserver(resize).observe(mount);
    window.addEventListener('scroll',scroll,{passive:true});
    window.addEventListener('resize',resize,{passive:true});
    document.addEventListener('visibilitychange',()=>{if(document.hidden&&raf){cancelAnimationFrame(raf);raf=0;}else request();});
    reduced.addEventListener('change',preference);compact.addEventListener('change',resize);
    new MutationObserver(()=>{phaseIndex=-1;render();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
  }).catch(()=>{/* Leave the source image visible when enhancement is unavailable. */});
}

function initCore(core){
  const hero=core.closest('.home-hero'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let active=true,raf=0,travel=1,start=0;
  function render(){
    raf=0;if(!active||reduced.matches||document.hidden)return;
    const progress=clamp((scrollY-start)/travel);
    core.style.setProperty('--core-open',progress.toFixed(4));
  }
  function request(){if(!raf&&active&&!document.hidden)raf=requestAnimationFrame(render);}
  function measure(){start=hero.getBoundingClientRect().top+scrollY;travel=Math.max(hero.offsetHeight,1);request();}
  new IntersectionObserver(entries=>{
    active=entries[0].isIntersecting;core.classList.toggle('core-paused',!active);request();
  }).observe(core);
  window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',measure,{passive:true});
  document.addEventListener('visibilitychange',()=>{core.classList.toggle('core-hidden',document.hidden);request();});
  reduced.addEventListener('change',()=>{if(reduced.matches)core.style.setProperty('--core-open','0');else measure();});
  measure();
}
if(typeof document!=='undefined'){
  document.querySelectorAll('[data-mechanism]').forEach(initMechanism);
  document.querySelectorAll('[data-archon-core]').forEach(initCore);
}
