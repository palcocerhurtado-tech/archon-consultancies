export const needs = {
  intelligence: {
    value:'Intelligence', label:['Quiero automatizar','I want to automate'],
    title:['Menos trabajo manual. Más control.','Less manual work. More control.'],
    description:['Empecemos por el proceso que más tiempo te quita: consultas, seguimiento, datos o tareas repetidas.','Start with the process that takes up most of your time: enquiries, follow-up, data or repetitive tasks.'],
    points:[['Conectar las herramientas que ya usas.','Connect the tools you already use.'],['Definir responsables, avisos y seguimiento.','Define owners, notifications and follow-up.'],['Elegir una primera mejora con alcance claro.','Choose a first improvement with a clear scope.']],
    href:'/intelligence', link:['Explorar Intelligence','Explore Intelligence'],
    question:['¿Qué tarea repites y cómo la resolvéis hoy?','Which task do you repeat, and how do you handle it today?'],
    hint:['Por ejemplo: de dónde llegan las consultas, quién las atiende y dónde se pierde el seguimiento.','For example: where enquiries come from, who handles them and where follow-up gets lost.'],
  },
  atelier: {
    value:'Atelier', label:['Quiero mejorar mi marca','I want to improve my brand'],
    title:['Una marca que se entiende y se reconoce.','A brand people understand and recognise.'],
    description:['Pongamos el foco en qué vendes, a quién quieres llegar y qué parte de tu comunicación necesita orden.','Focus on what you sell, who you want to reach and which part of your communication needs structure.'],
    points:[['Aclarar tu mensaje y tu posicionamiento.','Clarify your message and positioning.'],['Dar coherencia a web, contenido y campañas.','Bring consistency to your website, content and campaigns.'],['Definir un ritmo de trabajo sostenible.','Define a sustainable working rhythm.']],
    href:'/atelier', link:['Explorar Atelier','Explore Atelier'],
    question:['¿Qué vendes, a quién y qué te gustaría mejorar de tu comunicación?','What do you sell, to whom, and what would you improve about your communication?'],
    hint:['Puedes hablar de tu web, identidad, contenido o campañas. Si tienes una web, incluye el enlace.','Tell us about your website, identity, content or campaigns. Include your website link if you have one.'],
  },
  guidance: {
    value:'No lo sé todavía', label:['Necesito orientación','I need some guidance'],
    title:['No necesitas llegar con la solución elegida.','You do not need to have chosen a solution.'],
    description:['Cuéntanos qué te frena. La primera conversación sirve para entender el contexto y decidir por dónde empezar.','Tell us what is holding you back. The first conversation is for understanding your context and deciding where to start.'],
    points:[['Separar el síntoma del problema.','Separate the symptom from the problem.'],['Identificar qué merece atención primero.','Identify what deserves attention first.'],['Acordar el siguiente paso, si hay encaje.','Agree on the next step if we are a good fit.']],
    href:'/contacto?necesidad=guidance#formulario', link:['Cómo es el primer diagnóstico','About the first consultation'],
    question:['¿Qué te está frenando y qué te gustaría que cambiase?','What is holding you back, and what would you like to change?'],
    hint:['Cuéntalo con tus palabras. No hace falta un documento técnico ni elegir un servicio.','Use your own words. You do not need a technical brief or a chosen service.'],
  },
};

export function needFromValue(value='') {
  if(/^(Archon )?Intelligence$/.test(value)) return 'intelligence';
  if(/^(Archon )?Atelier$/.test(value)) return 'atelier';
  return 'guidance';
}
export function allowedNeed(value) { return Object.hasOwn(needs,value) ? value : null; }
export function readProgress(scroll, height, viewport) {
  return Math.max(0,Math.min(1,scroll/Math.max(1,height-viewport)));
}
const language = () => document.documentElement.lang==='en' ? 1 : 0;
const t = pair => pair[language()];
const create = (tag, className, text) => {
  const node=document.createElement(tag);
  if(className)node.className=className;
  if(text!==undefined)node.textContent=text;
  return node;
};

export function initWizard(form) {
  const project=form.querySelector('select[name="project_type"],select[name="tipo_proyecto"],select[name="interest"]');
  const message=form.querySelector('textarea[name="message"],textarea[name="mensaje"]');
  const email=form.querySelector('input[type="email"]');
  const submit=form.querySelector('button[type="submit"]');
  if(!project||!message||!email||!submit) return null;
  const fields=Array.from(form.querySelectorAll('input:not([type="hidden"]):not([name="_honey"]),select,textarea'));
  const legends=[['Tu proyecto','Your project'],['Cómo contactarte','Your contact details'],['Revisar y enviar','Review and send']];
  const steps=legends.map((label,i)=>{
    const step=create('fieldset','ux-form-step');
    step.dataset.step=String(i);
    const legend=create('legend',null,t(label));step.append(legend);return step;
  });
  const progress=create('ol','ux-form-progress');
  const indicators=legends.map((label,i)=>{
    const li=create('li',null,`${i+1}. ${t(label)}`);progress.append(li);return li;
  });
  progress.setAttribute('aria-label',t(['Pasos del formulario','Form steps']));
  form.prepend(progress);
  const fieldLabels=new Map();
  fields.forEach((field,i)=>{
    const label=Array.from(form.querySelectorAll('label')).find(node=>node.htmlFor&&node.htmlFor===field.id);
    const generic=field===message ? ['Qué quieres mejorar','What you want to improve']
      :field===project ? ['Qué necesitas trabajar','What you need to work on']
      :field.type==='email' ? ['Email','Email']
      :['name','nombre'].includes(field.name) ? ['Nombre','Name']
      :['business'].includes(field.name) ? ['Empresa o proyecto (opcional)','Company or project (optional)']
      :['Teléfono (opcional)','Phone (optional)'];
    if(!field.id)field.id=`ux-${document.body.dataset.uxPage}-${i}`;
    const visibleLabel=label||create('label','brand-label',t(generic));
    visibleLabel.htmlFor=field.id;
    field.removeAttribute('aria-label');
    // This visible label is owned by this component and follows language changes.
    visibleLabel.removeAttribute('data-es');visibleLabel.removeAttribute('data-en');
    fieldLabels.set(field,{node:visibleLabel,copy:generic});
    const target=['name','nombre','email','telefono','phone'].includes(field.name)?steps[1]:steps[0];
    if(field.name==='business')field.required=false;
    if(field.tagName==='INPUT'&&field.maxLength<0)field.maxLength=field.type==='email'?254:200;
    if(field===message)field.maxLength=5000;
    const wrap=create('div','ux-field');wrap.append(visibleLabel,field);target.append(wrap);
  });
  const help=create('p','ux-field-hint');help.id=message.id+'-hint';
  message.setAttribute('aria-describedby',[message.getAttribute('aria-describedby'),help.id].filter(Boolean).join(' '));
  message.after(help);
  const summary=create('div','ux-summary');steps[2].append(summary);
  const privacy=form.querySelector('.contact-privacy,.home-note')||create('p','contact-privacy');
  privacy.removeAttribute('data-es');privacy.removeAttribute('data-en');
  const privacyText=create('span'),privacyLink=create('a','brand-link');privacyLink.href='/privacidad';
  privacy.replaceChildren(privacyText,privacyLink);steps[2].append(privacy);
  const nextInfo=create('p','ux-next-info',t(['Pablo revisará tu solicitud y te responderá por email para acordar el siguiente paso.','Pablo will review your enquiry and reply by email to agree on the next step.']));
  steps[2].append(nextInfo,submit);
  steps.forEach(step=>form.append(step));
  const status=form.querySelector('.contact-status');if(status)form.append(status);
  const controls=create('div','ux-form-controls');
  const back=create('button','ux-text-button');back.type='button';
  const next=create('button','brand-btn brand-btn--accent');next.type='button';
  controls.append(back,next);form.append(controls);
  const error=create('p','ux-form-error');error.setAttribute('role','alert');form.prepend(error);
  let index=0;
  const busy=()=>form.getAttribute('aria-busy')==='true';
  function refreshQuestion() {
    const division=form.querySelector('[name="division"]')?.value;
    const route=needFromValue(division||project.value);
    const both=/^Ambas/.test(project.value);
    fieldLabels.get(message).node.textContent=both?t(['¿Qué quieres mejorar dentro de tu negocio y en su comunicación?','What would you improve in your operations and communication?']):t(needs[route].question);
    help.textContent=both?t(['Cuéntanos el bloqueo principal. Priorizaremos juntos por dónde empezar.','Tell us about the main bottleneck. We will prioritise where to start together.']):t(needs[route].hint);
    message.placeholder=help.textContent;
  }
  function updateSummary() {
    summary.replaceChildren();
    [0,1].forEach(group=>{
      const section=create('section','ux-summary-section');
      const h=create('h3',null,t(legends[group]));
      const edit=create('button','ux-text-button',t(['Editar','Edit']));edit.type='button';edit.setAttribute('aria-label',t(['Editar: ','Edit: '])+t(legends[group]));edit.addEventListener('click',()=>show(group,true));
      const row=create('div','ux-summary-heading');row.append(h,edit);section.append(row);
      const list=create('dl');
      fields.filter(field=>steps[group].contains(field)).forEach(field=>{
        const value=field.tagName==='SELECT'?field.selectedOptions[0]?.textContent:field.value;
        const dt=create('dt',null,fieldLabels.get(field).node.textContent);
        const dd=create('dd',null,value?.trim()||t(['Sin indicar','Not provided']));list.append(dt,dd);
      });
      section.append(list);summary.append(section);
    });
  }
  function show(step,focus=false) {
    if(busy())return;
    index=step;
    steps.forEach((node,i)=>{node.hidden=i!==index;});
    indicators.forEach((node,i)=>{
      if(i===index)node.setAttribute('aria-current','step');else node.removeAttribute('aria-current');
      node.classList.toggle('is-complete',i<index);
    });
    back.hidden=index===0;next.hidden=index===2;
    next.textContent=index===1?t(['Revisar solicitud →','Review enquiry →']):t(['Continuar →','Continue →']);
    if(index===2)updateSummary();
    error.textContent='';
    if(focus){const legend=steps[index].querySelector('legend');legend.tabIndex=-1;legend.focus();}
  }
  function validate(step) {
    const inputs=fields.filter(field=>steps[step].contains(field));
    for(const field of inputs) {
      field.setCustomValidity(field.required&&!field.value.trim()?t(['Completa este campo.','Please complete this field.']):'');
      if(!field.checkValidity()) {
        show(step);field.setAttribute('aria-invalid','true');
        error.textContent=t(['Revisa el campo indicado para continuar.','Check the highlighted field to continue.']);
        field.reportValidity();field.focus();return false;
      }
      field.removeAttribute('aria-invalid');
    }
    return true;
  }
  const proceed=()=>{if(!busy()&&validate(index))show(Math.min(2,index+1),true);};
  back.addEventListener('click',()=>show(Math.max(0,index-1),true));next.addEventListener('click',proceed);
  form.addEventListener('input',event=>{
    if(fields.includes(event.target)){event.target.setCustomValidity('');event.target.removeAttribute('aria-invalid');error.textContent='';}
  });
  project.addEventListener('change',()=>{project.setCustomValidity('');project.removeAttribute('aria-invalid');refreshQuestion();});
  // Capture before the existing delivery handler. Enter advances intermediate
  // steps; only a fully validated review reaches the real submission listener.
  form.addEventListener('submit',event=>{
    if(busy()){event.preventDefault();event.stopImmediatePropagation();return;}
    if(index<2){event.preventDefault();event.stopImmediatePropagation();proceed();return;}
    if(!validate(0)||!validate(1)){event.preventDefault();event.stopImmediatePropagation();}
  },true);
  const observer=new MutationObserver(()=>{back.disabled=busy();next.disabled=busy();summary.querySelectorAll('button').forEach(button=>button.disabled=busy());});
  observer.observe(form,{attributes:true,attributeFilter:['aria-busy']});
  const refresh=()=>{
    steps.forEach((step,i)=>step.querySelector('legend').textContent=t(legends[i]));
    indicators.forEach((li,i)=>li.textContent=`${i+1}. ${t(legends[i])}`);
    fieldLabels.forEach(({node,copy})=>node.textContent=t(copy));
    back.textContent=t(['← Atrás','← Back']);next.textContent=index===1?t(['Revisar solicitud →','Review enquiry →']):t(['Continuar →','Continue →']);
    refreshQuestion();if(index===2)updateSummary();
    nextInfo.textContent=t(['Pablo revisará tu solicitud y te responderá por email para acordar el siguiente paso.','Pablo will review your enquiry and reply by email to agree on the next step.']);
    if(privacyText)privacyText.textContent=t(['Usaremos tus datos para atender esta solicitud. ','We will use your details to respond to this enquiry. ']);
    if(privacyLink)privacyLink.textContent=t(['Privacidad','Privacy']);
  };
  const requested=allowedNeed(new URLSearchParams(location.search).get('necesidad'));
  if(requested&&['project_type','tipo_proyecto'].includes(project.name)&&!project.value)project.value=needs[requested].value;
  form.noValidate=true;form.classList.add('ux-wizard');refresh();show(0);
  return {refresh,show,project};
}

function initPicker(root,wizards) {
  const inputs=Array.from(root.querySelectorAll('input[name="visitor-need"]'));
  const panel=root.querySelector('[data-need-result]');
  const title=panel.querySelector('h3'),description=panel.querySelector('p'),list=panel.querySelector('ul');
  const primary=panel.querySelector('[data-need-contact]'),secondary=panel.querySelector('[data-need-service]');
  let selected=null;
  function refresh() {
    inputs.forEach(input=>{input.nextElementSibling.querySelector('strong').textContent=t(needs[input.value].label);});
    root.querySelector('[data-need-placeholder]').hidden=Boolean(selected);
    if(!selected)return;
    const need=needs[selected];panel.hidden=false;
    title.textContent=t(need.title);description.textContent=t(need.description);
    list.replaceChildren(...need.points.map(pair=>create('li',null,t(pair))));
    secondary.href=need.href;secondary.textContent=t(need.link);
    primary.textContent=t(['Hablar de mi proyecto →','Discuss my project →']);
    primary.href='#contacto';
  }
  inputs.forEach(input=>input.addEventListener('change',()=>{
    if(!input.checked)return;selected=input.value;
    wizards.forEach(wizard=>{
      if(wizard.project.name==='project_type'){wizard.project.value=needs[selected].value;wizard.project.dispatchEvent(new Event('change',{bubbles:true}));}
    });
    refresh();
  }));
  root.hidden=false;refresh();return refresh;
}

function initNavigation() {
  const header=document.querySelector('.brand-topbar');
  const nav=header?.querySelector('.brand-nav-links');if(!header||!nav)return ()=>{};
  const mobile=matchMedia('(max-width: 900px)');
  const button=create('button','ux-menu-toggle');button.type='button';
  nav.id='ux-primary-navigation';button.setAttribute('aria-controls',nav.id);button.setAttribute('aria-expanded','false');
  header.querySelector('.brand-nav').append(button);header.classList.add('ux-nav-ready');
  function menu(open,focus=false) {
    button.setAttribute('aria-expanded',String(open));nav.hidden=mobile.matches&&!open;
    if(focus)button.focus();
  }
  button.addEventListener('click',()=>menu(button.getAttribute('aria-expanded')!=='true'));
  mobile.addEventListener('change',()=>menu(false));menu(false);
  nav.addEventListener('click',event=>{if(event.target.closest('a'))menu(false);});
  const services=nav.querySelector('.brand-service-nav'),toggle=services?.querySelector('button'),drop=services?.querySelector('.brand-service-menu');
  function servicesOpen(open){if(!toggle)return;toggle.setAttribute('aria-expanded',String(open));services.classList.toggle('ux-services-open',open);}
  if(toggle&&drop){drop.id='ux-services-navigation';toggle.setAttribute('aria-controls',drop.id);toggle.removeAttribute('aria-haspopup');toggle.addEventListener('click',()=>servicesOpen(toggle.getAttribute('aria-expanded')!=='true'));toggle.addEventListener('keydown',e=>{if(e.key==='ArrowDown'){e.preventDefault();servicesOpen(true);drop.querySelector('a')?.focus();}});}
  document.addEventListener('keydown',event=>{
    if(event.key!=='Escape')return;
    if(toggle?.getAttribute('aria-expanded')==='true'){servicesOpen(false);toggle.focus();}
    else if(mobile.matches&&button.getAttribute('aria-expanded')==='true')menu(false,true);
  });
  document.addEventListener('click',event=>{if(!header.contains(event.target)){servicesOpen(false);if(mobile.matches)menu(false);}});
  const definitions={
    home:[['top','Inicio','Home'],['necesidad','Tu necesidad','Your needs'],['servicios','Servicios','Services'],['casos','Casos','Cases'],['precios','Inversión','Pricing'],['contacto','Contacto','Contact']],
    intelligence:[['arquitectura','Visión','Vision'],['servicios','Servicios','Services'],['diferencial','Método','Approach'],['contacto','Contacto','Contact']],
    atelier:[['arquitectura','Visión','Vision'],['alcance','Alcance','Scope'],['precios','Inversión','Pricing'],['contacto','Contacto','Contact']],
    contacto:[['top','Diagnóstico','Consultation'],['formulario','Tu solicitud','Your enquiry']],
  };
  const sections=(definitions[document.body.dataset.uxPage]||[]).filter(([id])=>document.getElementById(id));
  const wayfinder=create('nav','ux-wayfinder');wayfinder.setAttribute('aria-label',t(['En esta página','On this page']));
  const shell=create('div','brand-shell ux-wayfinder-inner');
  const links=create('div','ux-section-links');
  const items=sections.map(([id,es,en])=>{const a=create('a',null,t([es,en]));a.href='#'+id;links.append(a);return a;});
  const mobileLabel=create('label','ux-section-select');const labelText=create('span','ux-sr-only',t(['Ir a una sección','Jump to a section']));
  const select=create('select');sections.forEach(([id,es,en])=>{const option=create('option',null,t([es,en]));option.value=id;select.append(option);});
  mobileLabel.append(labelText,select);
  select.addEventListener('change',()=>{document.getElementById(select.value)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});});
  const cta=create('a','ux-diagnosis');cta.href=document.body.dataset.uxPage==='contacto'?'#formulario':'#contacto';cta.setAttribute('data-contact-cta','wayfinder');
  const meter=create('span','ux-reading-progress');meter.setAttribute('aria-hidden','true');
  shell.append(links,mobileLabel,cta);wayfinder.append(shell,meter);header.append(wayfinder);
  let frame=0,offset=header.offsetHeight;
  function render() {
    frame=0;
    const current=sections.reduce((active,[id],i)=>document.getElementById(id).getBoundingClientRect().top<=offset+80?i:active,0);
    items.forEach((a,i)=>{if(i===current)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});
    if(select!==document.activeElement)select.value=sections[current]?.[0]||'';
    meter.style.transform=`scaleX(${readProgress(scrollY,document.documentElement.scrollHeight,innerHeight)})`;
    const contact=document.querySelector('form.ux-wizard');
    if(contact){const r=contact.getBoundingClientRect();cta.hidden=r.top<innerHeight&&r.bottom>offset;}
  }
  const request=()=>{if(!frame)frame=requestAnimationFrame(render);};
  new ResizeObserver(()=>{offset=header.offsetHeight;document.documentElement.style.setProperty('--ux-header-height',offset+'px');request();}).observe(header);
  new ResizeObserver(request).observe(document.body);
  window.addEventListener('scroll',request,{passive:true});window.addEventListener('resize',request,{passive:true});request();
  return ()=>{
    button.textContent=t(['Menú','Menu']);button.setAttribute('aria-label',t(['Abrir o cerrar el menú','Open or close navigation']));
    wayfinder.setAttribute('aria-label',t(['En esta página','On this page']));
    labelText.textContent=t(['Ir a una sección','Jump to a section']);
    items.forEach((a,i)=>a.textContent=t(sections[i].slice(1)));
    Array.from(select.options).forEach((o,i)=>o.textContent=t(sections[i].slice(1)));
    cta.textContent=t(['Solicitar diagnóstico ↗','Request a consultation ↗']);
  };
}

export function initJourney() {
  const wizards=Array.from(document.querySelectorAll('form[data-ux-form]')).map(initWizard).filter(Boolean);
  const pickers=Array.from(document.querySelectorAll('[data-need-picker]')).map(root=>initPicker(root,wizards));
  const navigation=initNavigation();
  const refresh=()=>{wizards.forEach(wizard=>wizard.refresh());pickers.forEach(refresh=>refresh());navigation();};
  new MutationObserver(refresh).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});refresh();
}
if(typeof document!=='undefined')initJourney();
