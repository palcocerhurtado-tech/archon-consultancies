const sectorData = {
  ecommerce: {
    form: "E-commerce",
    headline: "E-commerce con pedidos, cobros e incidencias tensas",
    narrative: "Cuando la tienda vende, el problema ya no es vender más. El problema es que pagos, stock, envíos y soporte cruzan demasiadas manos antes de resolverse bien.",
    pain: "Pedidos mal validados, excepciones manuales y soporte reaccionando tarde.",
    quickWin: "Automatizar validación de pedidos, incidencias y notificaciones con reglas claras.",
    stack: ["Shopify / WooCommerce", "Logística y pagos", "Soporte y postventa"],
    panelTitle: "Si vendes online desde Zaragoza, la fricción aparece cuando ventas y operaciones dejan de ir al mismo ritmo.",
    panelCopy: "Tu stack puede ser bueno. El problema es la distancia entre herramienta y acción. Cuando una validación, una incidencia o una notificación tarda más de lo que debería, el negocio pierde margen y claridad.",
    flow: [
      "Entrada limpia del pedido y su contexto.",
      "Reglas para pagos, stock, fraude o excepciones.",
      "Notificaciones y soporte con información consistente."
    ],
    outcome: "Menos tiempo persiguiendo estados, menos incidencias sin dueño y una operativa que soporta más volumen sin añadir desorden.",
    firstMove: "Mapear el punto exacto donde las incidencias entran sin estructura y obligan a reaccionar tarde.",
    avoid: "Herramientas nuevas antes de tener un flujo de decisiones claro.",
    tags: ["Menos tickets rebotando", "Más trazabilidad", "Menos dependencia del fundador"],
    cityHeadline: "Pymes, ecommerce y equipos operativos que ya no quieren sostener su crecimiento con heroísmo.",
    cityCopy: "En ecommerce, la tensión suele aparecer cuando vender es fácil pero coordinar cobros, logística y soporte ya consume demasiado cerebro humano.",
    calcPreset: {events: 420, minutes: 6, hourly: 18, errors: 14},
    incidentCost: 110,
    recoveryRate: 0.54,
    priority: "Prioridad: pedidos e incidencias"
  },
  services: {
    form: "Servicios",
    headline: "Empresas de servicios con aprobaciones, seguimiento y handoffs lentos",
    narrative: "Cuando presupuestos, proyectos, seguimientos y clientes dependen de demasiados mensajes, recordatorios y manos, la operativa se vuelve opaca y carísima.",
    pain: "Seguimiento manual, aprobaciones lentas y conocimiento repartido en emails y chats.",
    quickWin: "Diseñar un flujo único para captación, handoff, seguimiento y reporting con IA donde aporte criterio.",
    stack: ["CRM y formularios", "Email y agenda", "Documentación y reporting"],
    panelTitle: "En servicios, la fuga grande no siempre está en vender. Suele estar en coordinar y entregar bien sin sobrecargar al equipo.",
    panelCopy: "Cada seguimiento sin sistema y cada handoff mal trazado multiplica retrasos. La buena noticia es que eso se puede rediseñar sin rehacer el negocio entero.",
    flow: [
      "Entrada y cualificación con contexto limpio.",
      "Handoffs con estado, responsable y siguiente acción.",
      "Reporting y seguimiento sin perseguir información."
    ],
    outcome: "Clientes mejor atendidos, menos cuellos de botella internos y una entrega más estable aunque el volumen suba.",
    firstMove: "Ordenar el paso entre venta, ejecución y seguimiento para que nadie trabaje a ciegas.",
    avoid: "Meter un agente de IA antes de tener responsables y etapas bien definidas.",
    tags: ["Menos seguimiento manual", "Más visibilidad", "Más consistencia en entrega"],
    cityHeadline: "Empresas de servicios que quieren dejar de gestionar cada entrega desde la bandeja de entrada.",
    cityCopy: "En servicios, Archon suele entrar cuando el equipo ya vende, pero la coordinación interna y la comunicación con cliente están tragando demasiado tiempo de gente buena.",
    calcPreset: {events: 260, minutes: 11, hourly: 28, errors: 8},
    incidentCost: 170,
    recoveryRate: 0.48,
    priority: "Prioridad: handoff y seguimiento"
  },
  operations: {
    form: "Operaciones internas",
    headline: "Operaciones internas con validaciones, backoffice y excepciones sin railes",
    narrative: "Compras, aprobaciones, conciliación, incidencias internas o reportes. Cuando el backoffice trabaja como pegamento, todo el negocio responde peor de lo que podría.",
    pain: "Backoffice manual, estados ambiguos y demasiadas tareas administrativas sin automatizar.",
    quickWin: "Crear una fuente única de verdad y automatizar validaciones, aprobaciones y alertas críticas.",
    stack: ["ERP / hojas", "Aprobaciones", "Reportes y excepciones"],
    panelTitle: "En operaciones internas, el mayor coste suele esconderse en tareas que nadie cuestiona porque siempre se han hecho así.",
    panelCopy: "El problema no es solo tiempo. Es también latencia, errores silenciosos y falta de visibilidad para decidir bien. Ahorrar administración ya es bueno; recuperar control es mejor.",
    flow: [
      "Entrada estructurada de solicitudes y estados.",
      "Reglas de aprobación y alertas por excepción.",
      "Reporting limpio para dirección y operaciones."
    ],
    outcome: "Menos trabajo invisible, mejor control de procesos internos y una base más sana para crecer o delegar.",
    firstMove: "Detectar qué validación o reporte está robando más tiempo y no aporta valor humano real.",
    avoid: "Automatizar el caos tal y como esta, sin limpiar responsables ni criterios.",
    tags: ["Menos backoffice ciego", "Más control", "Más velocidad de decisión"],
    cityHeadline: "Equipos internos que ya notan que el verdadero cuello de botella no esta en vender, sino en gobernar bien lo que ya existe.",
    cityCopy: "Si estás en Zaragoza y tu operativa depende de demasiadas validaciones o reportes manuales, una lectura cercana del proceso puede acelerar muchísimo la priorización correcta.",
    calcPreset: {events: 310, minutes: 9, hourly: 24, errors: 11},
    incidentCost: 210,
    recoveryRate: 0.5,
    priority: "Prioridad: aprobaciones y reporting"
  }
};

const roadmapData = {
  audit: {
    label: "Fase 01",
    title: "Radar de fricción operativa",
    duration: "33 minutos + síntesis inicial",
    signal: "Objetivo: decidir si hay retorno real",
    copy: "Revisamos proceso, herramientas, personas clave, excepciones y bloqueos. La idea no es impresionarte, sino decidir si conviene construir algo, empezar por una automatización concreta o no tocar nada todavía.",
    items: [
      "Mapa de puntos de fricción y latencia.",
      "Hipótesis de ahorro, riesgo y orden de prioridad.",
      "Decisión clara sobre el siguiente paso."
    ]
  },
  blueprint: {
    label: "Fase 02",
    title: "Blueprint del sistema",
    duration: "72 horas para la dirección inicial",
    signal: "Objetivo: ordenar datos, flujos y responsables",
    copy: "Diseñamos la estructura mínima que hace falta: fuente de verdad, raíles de automatización, puntos de IA, alertas y supervisión. Ni una capa más de la necesaria.",
    items: [
      "Arquitectura propuesta por capas y secuencia.",
      "Lista de quick wins y de decisiones que conviene aplazar.",
      "Mapa de integraciones y excepciones relevantes."
    ]
  },
  build: {
    label: "Fase 03",
    title: "Build y despliegue controlado",
    duration: "Sprint quirúrgico según complejidad",
    signal: "Objetivo: pasar de idea a flujo real",
    copy: "Construimos lo que toca, lo probamos sobre el proceso real y dejamos criterios de supervisión para que el sistema no se convierta en otra fuente de incertidumbre.",
    items: [
      "Automatizaciones, validaciones y triggers.",
      "IA aplicada donde realmente multiplica criterio o velocidad.",
      "Pruebas sobre casos normales y excepciones."
    ]
  },
  scale: {
    label: "Fase 04",
    title: "Scale, ajuste y gobierno",
    duration: "Seguimiento y refinamiento",
    signal: "Objetivo: no volver al caos al crecer",
    copy: "Medimos resultados, afinamos reglas, abrimos nuevas capas solo si el sistema ya aguanta y evitamos que la complejidad vuelva a colarse por una puerta lateral.",
    items: [
      "Lectura de ahorro, latencia y puntos ciegos.",
      "Iteraciones para nuevos cuellos de botella.",
      "Gobierno operativo para sostener el sistema."
    ]
  }
};

let currentSector = "ecommerce";

window.archonUiText = window.archonUiText || {
  locale: "es-ES",
  currencySuffix: " EUR",
  monthSuffix: " / mes",
  recoverableHoursSuffix: " h recuperables / mes",
  stickyLeakPrefix: "Tu fuga operativa estimada ahora mismo: ",
  perYearSuffix: " / año.",
  urgencyModerate: "Urgencia moderada",
  urgencyHigh: "Urgencia alta",
  urgencyCritical: "Urgencia crítica",
  calcNarrativePrefix: "En este escenario ",
  calcNarrativeMiddle: " está perdiendo aproximadamente ",
  calcNarrativeSuffix: " al año entre tiempo operativo y excepciones. Lo importante no es solo ahorrar: es recuperar control y bajar latencia."
};

function formatEuros(value){
  const uiText = window.archonUiText || {};
  const locale = uiText.locale || "es-ES";
  const currencySuffix = uiText.currencySuffix || " EUR";
  return new Intl.NumberFormat(locale, {maximumFractionDigits: 0}).format(Math.round(value)) + currencySuffix;
}

function setText(id, value){
  const node = document.getElementById(id);
  if (node) node.textContent = value;
}

function updateSector(sectorKey, applyPreset){
  currentSector = sectorKey;
  const data = sectorData[sectorKey];
  document.querySelectorAll(".sector-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.sector === sectorKey);
  });

  setText("sectorHeadline", data.headline);
  setText("sectorNarrative", data.narrative);
  setText("sectorPain", data.pain);
  setText("sectorQuickWin", data.quickWin);
  setText("sectorStackA", data.stack[0]);
  setText("sectorStackB", data.stack[1]);
  setText("sectorStackC", data.stack[2]);
  setText("sectorPanelTitle", data.panelTitle);
  setText("sectorPanelCopy", data.panelCopy);
  setText("sectorFlow1", data.flow[0]);
  setText("sectorFlow2", data.flow[1]);
  setText("sectorFlow3", data.flow[2]);
  setText("sectorOutcome", data.outcome);
  setText("sectorFirstMove", data.firstMove);
  setText("sectorAvoid", data.avoid);
  setText("sectorTag1", data.tags[0]);
  setText("sectorTag2", data.tags[1]);
  setText("sectorTag3", data.tags[2]);
  setText("cityHeadline", data.cityHeadline);
  setText("cityCopy", data.cityCopy);

  const sectorInput = document.querySelector('input[name="selected_sector"]');
  if (sectorInput) sectorInput.value = data.form;

  const sectorSelect = document.getElementById("serviceSector");
  if (sectorSelect) sectorSelect.value = data.form;

  if (applyPreset){
    document.getElementById("eventsRange").value = data.calcPreset.events;
    document.getElementById("minutesRange").value = data.calcPreset.minutes;
    document.getElementById("hourlyRange").value = data.calcPreset.hourly;
    document.getElementById("errorsRange").value = data.calcPreset.errors;
  }

  updateCalculator();
}

function updateCalculator(){
  const data = sectorData[currentSector];
  const events = Number(document.getElementById("eventsRange").value);
  const minutes = Number(document.getElementById("minutesRange").value);
  const hourly = Number(document.getElementById("hourlyRange").value);
  const errors = Number(document.getElementById("errorsRange").value);

  const monthlyHours = (events * minutes) / 60;
  const monthlyLaborLeak = monthlyHours * hourly;
  const monthlyErrorLeak = errors * data.incidentCost;
  const monthlyLeak = monthlyLaborLeak + monthlyErrorLeak;
  const annualLeak = monthlyLeak * 12;
  const recoverableHours = monthlyHours * data.recoveryRate;

  setText("eventsOutput", events);
  setText("minutesOutput", minutes);
  setText("hourlyOutput", hourly + " EUR");
  setText("errorsOutput", errors);
  setText("annualLeakValue", formatEuros(annualLeak));
  const uiText = window.archonUiText || {};
  setText("monthlyLeakChip", formatEuros(monthlyLeak) + (uiText.monthSuffix || " / mes"));
  setText("hoursLeakChip", Math.round(recoverableHours) + (uiText.recoverableHoursSuffix || " h recuperables / mes"));
  setText("priorityChip", data.priority);

  let urgency = uiText.urgencyModerate || "Urgencia moderada";
  if (annualLeak >= 30000) urgency = uiText.urgencyCritical || "Urgencia crítica";
  else if (annualLeak >= 14000) urgency = uiText.urgencyHigh || "Urgencia alta";
  setText("urgencyChip", urgency);

  setText(
    "calcNarrative",
    (uiText.calcNarrativePrefix || "En este escenario ") +
      sectorData[currentSector].form.toLowerCase() +
      (uiText.calcNarrativeMiddle || " está perdiendo aproximadamente ") +
      formatEuros(annualLeak) +
      (uiText.calcNarrativeSuffix || " al año entre tiempo operativo y excepciones. Lo importante no es solo ahorrar: es recuperar control y bajar latencia.")
  );

  const sticky = document.getElementById("stickyLeakText");
  if (sticky){
    sticky.textContent = (uiText.stickyLeakPrefix || "Tu fuga operativa estimada ahora mismo: ") + formatEuros(annualLeak) + (uiText.perYearSuffix || " / año.");
  }

  const hiddenLeak = document.querySelector('input[name="estimated_annual_leak"]');
  if (hiddenLeak) hiddenLeak.value = formatEuros(annualLeak);

  const hiddenPriority = document.querySelector('input[name="priority_hint"]');
  if (hiddenPriority) hiddenPriority.value = data.quickWin;
}

function updateRoadmap(stageKey){
  const data = roadmapData[stageKey];
  document.querySelectorAll(".roadmap-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.stage === stageKey);
  });
  setText("roadmapLabel", data.label);
  setText("roadmapTitle", data.title);
  setText("roadmapDuration", data.duration);
  setText("roadmapSignal", data.signal);
  setText("roadmapCopy", data.copy);
  setText("roadmapItem1", data.items[0]);
  setText("roadmapItem2", data.items[1]);
  setText("roadmapItem3", data.items[2]);
}

function initReveal(){
  const nodes = document.querySelectorAll(".reveal");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting){
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, {threshold: 0.14});

  nodes.forEach((node) => observer.observe(node));
}

function initCounters(){
  const counters = document.querySelectorAll(".counter");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      const target = Number(node.dataset.target || 0);
      const prefix = node.dataset.prefix || "";
      const suffix = node.dataset.suffix || "";
      let current = 0;
      const duration = 900;
      const start = performance.now();

      function tick(now){
        const progress = Math.min((now - start) / duration, 1);
        current = target * progress;
        node.textContent = prefix + Math.round(current) + suffix;
        if (progress < 1){
          requestAnimationFrame(tick);
        } else {
          node.textContent = prefix + target + suffix;
        }
      }

      requestAnimationFrame(tick);
      observer.unobserve(node);
    });
  }, {threshold: 0.55});

  counters.forEach((counter) => observer.observe(counter));
}

function initStickyCta(){
  const sticky = document.getElementById("stickyCta");
  function onScroll(){
    if (window.scrollY > 760){
      sticky.classList.add("visible");
    } else {
      sticky.classList.remove("visible");
    }
  }
  window.addEventListener("scroll", onScroll, {passive:true});
  onScroll();
}

document.querySelectorAll(".sector-btn").forEach((button) => {
  button.addEventListener("click", () => updateSector(button.dataset.sector, true));
});

document.querySelectorAll(".roadmap-tab").forEach((button) => {
  button.addEventListener("click", () => updateRoadmap(button.dataset.stage));
});

["eventsRange", "minutesRange", "hourlyRange", "errorsRange"].forEach((id) => {
  document.getElementById(id).addEventListener("input", updateCalculator);
});

updateSector("ecommerce", true);
updateRoadmap("audit");
initReveal();
initCounters();
initStickyCta();

// Hamburger menu
const hamburgerBtn = document.getElementById("hamburgerBtn");
const mobileMenu = document.getElementById("mobileMenu");
hamburgerBtn.addEventListener("click", () => {
  hamburgerBtn.classList.toggle("active");
  mobileMenu.classList.toggle("open");
  document.body.style.overflow = mobileMenu.classList.contains("open") ? "hidden" : "";
});
document.querySelectorAll(".mob-link").forEach((link) => {
  link.addEventListener("click", () => {
    hamburgerBtn.classList.remove("active");
    mobileMenu.classList.remove("open");
    document.body.style.overflow = "";
  });
});

window.archonData = {
  sectorData: sectorData,
  roadmapData: roadmapData,
  getCurrentSector: function () { return currentSector; },
  updateSector: updateSector,
  updateRoadmap: updateRoadmap,
  updateCalculator: updateCalculator
};
