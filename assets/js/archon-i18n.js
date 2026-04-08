(function () {
  const STORAGE_KEY = "archon-lang";
  const html = document.documentElement;
  const toggle = document.getElementById("langToggle");
  const form = document.querySelector(".form");
  const archon = window.archonData;

  if (!toggle || !archon) return;

  const baseTitle = document.title;
  const enTitle = "AI Consulting in Zaragoza for companies | Archon Consultancies";

  const BASE_UI_TEXT = JSON.parse(JSON.stringify(window.archonUiText || {}));
  const EN_UI_TEXT = {
    locale: "en-GB",
    currencySuffix: " EUR",
    monthSuffix: " / month",
    recoverableHoursSuffix: " recoverable hrs / month",
    stickyLeakPrefix: "Your estimated operational leak right now: ",
    perYearSuffix: " / year.",
    urgencyModerate: "Moderate urgency",
    urgencyHigh: "High urgency",
    urgencyCritical: "Critical urgency",
    calcNarrativePrefix: "In this scenario, ",
    calcNarrativeMiddle: " is losing roughly ",
    calcNarrativeSuffix: " per year across operational time and exceptions. The point is not only to save money: it is to recover control and reduce latency."
  };

  const BASE_SECTOR_DATA = JSON.parse(JSON.stringify(archon.sectorData));
  const BASE_ROADMAP_DATA = JSON.parse(JSON.stringify(archon.roadmapData));

  const EN_SECTOR_DATA = {
    ecommerce: {
      form: "E-commerce",
      headline: "E-commerce with strained orders, payments and incidents",
      narrative: "When the store is selling, the problem is no longer selling more. The problem is that payments, stock, shipping and support pass through too many hands before they get resolved properly.",
      pain: "Poorly validated orders, manual exceptions and support reacting too late.",
      quickWin: "Automate order validation, incidents and notifications with clear rules.",
      stack: ["Shopify / WooCommerce", "Logistics and payments", "Support and post-sale"],
      panelTitle: "If you sell online from Zaragoza, friction shows up when sales and operations stop moving at the same pace.",
      panelCopy: "Your stack may be good. The problem is the distance between the tool and the action. When a validation, incident or notification takes longer than it should, the business loses margin and clarity.",
      flow: [
        "Clean order intake and context.",
        "Rules for payments, stock, fraud or exceptions.",
        "Notifications and support with consistent information."
      ],
      outcome: "Less time chasing statuses, fewer ownerless incidents and an operation that can handle more volume without extra disorder.",
      firstMove: "Map the exact point where incidents enter without structure and force the team to react late.",
      avoid: "New tools before you have a clear decision flow.",
      tags: ["Fewer bouncing tickets", "More traceability", "Less founder dependency"],
      cityHeadline: "SMEs, e-commerce brands and operations teams that no longer want to sustain growth with heroics.",
      cityCopy: "In e-commerce, pressure usually appears when selling is easy but coordinating payments, logistics and support is already consuming too much human brainpower.",
      calcPreset: {events: 420, minutes: 6, hourly: 18, errors: 14},
      incidentCost: 110,
      recoveryRate: 0.54,
      priority: "Priority: orders and incidents"
    },
    services: {
      form: "Services",
      headline: "Service firms with slow approvals, follow-up and handoffs",
      narrative: "When proposals, projects, follow-up and clients depend on too many messages, reminders and hands, operations become opaque and expensive.",
      pain: "Manual follow-up, slow approvals and knowledge scattered across email and chat.",
      quickWin: "Design a single flow for acquisition, handoff, follow-up and reporting, with AI only where it improves judgment.",
      stack: ["CRM and forms", "Email and calendar", "Documentation and reporting"],
      panelTitle: "In services, the biggest leak is not always in selling. It is usually in coordinating and delivering well without overloading the team.",
      panelCopy: "Every follow-up without a system and every poorly traced handoff multiplies delays. The good news is that this can be redesigned without rebuilding the whole business.",
      flow: [
        "Clean intake and qualification with context.",
        "Handoffs with status, owner and next action.",
        "Reporting and follow-up without chasing information."
      ],
      outcome: "Better-served clients, fewer internal bottlenecks and more stable delivery even as volume grows.",
      firstMove: "Fix the transition between sales, delivery and follow-up so no one works blind.",
      avoid: "Adding an AI agent before roles and stages are clearly defined.",
      tags: ["Less manual follow-up", "More visibility", "More delivery consistency"],
      cityHeadline: "Service companies that want to stop managing every delivery from the inbox.",
      cityCopy: "In services, Archon usually comes in when the team is already selling, but internal coordination and client communication are consuming too much time from good people.",
      calcPreset: {events: 260, minutes: 11, hourly: 28, errors: 8},
      incidentCost: 170,
      recoveryRate: 0.48,
      priority: "Priority: handoff and follow-up"
    },
    operations: {
      form: "Internal operations",
      headline: "Internal operations with validations, back office and exceptions off the rails",
      narrative: "Purchasing, approvals, reconciliation, internal incidents or reports. When the back office acts like glue, the whole business responds worse than it should.",
      pain: "Manual back office, ambiguous statuses and too many administrative tasks without automation.",
      quickWin: "Create a single source of truth and automate validations, approvals and critical alerts.",
      stack: ["ERP / sheets", "Approvals", "Reports and exceptions"],
      panelTitle: "In internal operations, the biggest cost is usually hidden inside tasks no one questions because they have always been done that way.",
      panelCopy: "The problem is not just time. It is also latency, silent errors and poor visibility for good decisions. Saving admin time is good; recovering control is better.",
      flow: [
        "Structured intake of requests and statuses.",
        "Approval rules and exception alerts.",
        "Clean reporting for leadership and operations."
      ],
      outcome: "Less invisible work, better control of internal processes and a healthier base for growth or delegation.",
      firstMove: "Find which validation or report is taking the most time without adding real human value.",
      avoid: "Automating chaos as it is, without cleaning up responsibilities or criteria.",
      tags: ["Less blind back office", "More control", "Faster decisions"],
      cityHeadline: "Internal teams that already feel the real bottleneck is not in selling, but in governing what already exists.",
      cityCopy: "If you are in Zaragoza and your operation depends on too many validations or manual reports, a close reading of the process can accelerate prioritisation dramatically.",
      calcPreset: {events: 310, minutes: 9, hourly: 24, errors: 11},
      incidentCost: 210,
      recoveryRate: 0.5,
      priority: "Priority: approvals and reporting"
    }
  };

  const EN_ROADMAP_DATA = {
    audit: {
      label: "Phase 01",
      title: "Operational friction radar",
      duration: "33 minutes + initial synthesis",
      signal: "Goal: decide whether there is real return",
      copy: "We review process, tools, key people, exceptions and bottlenecks. The point is not to impress you, but to decide whether it makes sense to build something, start with a specific automation or leave it untouched for now.",
      items: [
        "Map of friction and latency points.",
        "Savings, risk and priority hypotheses.",
        "A clear decision on the next step."
      ]
    },
    blueprint: {
      label: "Phase 02",
      title: "System blueprint",
      duration: "72 hours for the initial direction",
      signal: "Goal: organise data, flows and owners",
      copy: "We design the minimum structure required: source of truth, automation rails, AI points, alerts and supervision. Not one layer more than necessary.",
      items: [
        "Layered architecture proposal and sequence.",
        "List of quick wins and decisions worth postponing.",
        "Map of integrations and relevant exceptions."
      ]
    },
    build: {
      label: "Phase 03",
      title: "Build and controlled deployment",
      duration: "Surgical sprint depending on complexity",
      signal: "Goal: move from idea to real flow",
      copy: "We build what is needed, test it against the real process and leave supervision criteria in place so the system does not become another source of uncertainty.",
      items: [
        "Automations, validations and triggers.",
        "AI applied only where it truly multiplies judgment or speed.",
        "Testing on normal cases and exceptions."
      ]
    },
    scale: {
      label: "Phase 04",
      title: "Scale, refinement and governance",
      duration: "Follow-up and optimisation",
      signal: "Goal: avoid sliding back into chaos as you grow",
      copy: "We measure results, refine rules, open new layers only if the system already holds and prevent complexity from sneaking back in through a side door.",
      items: [
        "Readout of savings, latency and blind spots.",
        "Iterations for new bottlenecks.",
        "Operational governance to sustain the system."
      ]
    }
  };

  const EN_STATIC = [
    { selector: ".nav-links li:nth-child(1) a", text: "Services" },
    { selector: ".nav-links li:nth-child(2) a", text: "Sectors" },
    { selector: ".nav-links li:nth-child(3) a", text: "Process" },
    { selector: ".nav-links li:nth-child(4) a", text: "ROI" },
    { selector: ".nav-links li:nth-child(6) a", text: "Blog" },
    { selector: ".nav-links li:nth-child(7) a", text: "About" },
    { selector: ".nav-cta", text: "Book audit" },
    { selector: "#hamburgerBtn", attr: "aria-label", text: "Open menu" },
    { selector: "#mobileMenu a:nth-child(1)", text: "Services" },
    { selector: "#mobileMenu a:nth-child(2)", text: "Sectors" },
    { selector: "#mobileMenu a:nth-child(3)", text: "Process" },
    { selector: "#mobileMenu a:nth-child(4)", text: "ROI" },
    { selector: "#mobileMenu a:nth-child(6)", text: "Blog" },
    { selector: "#mobileMenu a:nth-child(7)", text: "About" },
    { selector: "#mobileMenu a:nth-child(8)", text: "Book audit" },
    { selector: ".hero-copy .eyebrow", text: "Operational base: Zaragoza | delivery across Spain" },
    { selector: ".hero-copy h1", html: "Your company does not need more tools. <span>It needs a system.</span>" },
    { selector: ".hero-sub", text: "Archon Consultancies is an AI consultancy in Zaragoza that designs Digital Brain Infrastructure for SMEs, e-commerce brands and service companies that want to reduce operational friction and scale with a system." },
    { selector: ".hero-actions .btn-primary", text: "Book a 33 min audit" },
    { selector: ".hero-actions .btn-secondary", text: "Calculate operational leak" },
    { selector: ".hero-pills .pill:nth-child(1)", text: "On site in Zaragoza" },
    { selector: ".hero-pills .pill:nth-child(2)", text: "Initial roadmap in 72h" },
    { selector: ".hero-pills .pill:nth-child(3)", text: "No hype, no unnecessary layers" },
    { selector: ".hero-story .story-card:nth-child(1) strong", text: "Control" },
    { selector: ".hero-story .story-card:nth-child(1) p", text: "We connect data, rules and decisions so operations stop depending on memory and heroics." },
    { selector: ".hero-story .story-card:nth-child(2) strong", text: "Speed" },
    { selector: ".hero-story .story-card:nth-child(2) p", text: "We automate validations, handoffs and follow-up to recover hours and reduce reaction latency." },
    { selector: ".hero-story .story-card:nth-child(3) strong", text: "Scale" },
    { selector: ".hero-story .story-card:nth-child(3) p", text: "We design infrastructure that handles more volume without turning every week into a new fire." },
    { selector: ".panel-top .eyebrow.alt", text: "Reading mode" },
    { selector: ".panel-status", text: "Live / Zaragoza" },
    { selector: ".sector-switch", attr: "aria-label", text: "Sector selection" },
    { selector: ".sector-btn[data-sector='ecommerce']", text: "E-commerce" },
    { selector: ".sector-btn[data-sector='services']", text: "Services" },
    { selector: ".sector-btn[data-sector='operations']", text: "Operations" },
    { selector: ".hero-panel .signal-grid .signal-tag:nth-child(1) strong", text: "Core friction" },
    { selector: ".hero-panel .signal-grid .signal-tag:nth-child(2) strong", text: "Quick win" },
    { selector: ".metric-grid .stat-card:nth-child(1) strong", text: "Time to roadmap" },
    { selector: ".metric-grid .stat-card:nth-child(1) p", text: "If there is a fit, we return a clear direction and a fast implementation order." },
    { selector: ".metric-grid .stat-card:nth-child(2) strong", text: "System layers" },
    { selector: ".metric-grid .stat-card:nth-child(2) p", text: "Data, automation and AI with supervision. No more and no less than needed." },
    { selector: ".metric-grid .stat-card:nth-child(3) strong", text: "Local service" },
    { selector: ".metric-grid .stat-card:nth-child(3) p", text: "Based in Zaragoza to work close when the operation requires it." },
    { selector: ".metric-grid .stat-card:nth-child(4) strong", text: "Continuous operation" },
    { selector: ".metric-grid .stat-card:nth-child(4) p", text: "The goal is for the business to react with a system, not with human fatigue." },
    { selector: "#rutas .section-header .eyebrow", text: "Entry routes" },
    { selector: "#rutas .section-title", html: "Three entry doors. <span>One thesis.</span>" },
    { selector: "#rutas .section-copy", text: "Whether you are looking for AI consulting, an AI agency or automation for your company, the promise is the same: less friction, better judgment and an operation that does not break when volume rises." },
    { selector: "#rutas .lane-card:nth-child(1) strong", text: "Service 01" },
    { selector: "#rutas .lane-card:nth-child(1) h3", text: "AI consulting" },
    { selector: "#rutas .lane-card:nth-child(1) p", text: "For companies that need to sort priorities, detect operational leaks and decide what to automate first without buying more noise." },
    { selector: "#rutas .lane-card:nth-child(1) a", text: "View consulting" },
    { selector: "#rutas .lane-card:nth-child(2) strong", text: "Service 02" },
    { selector: "#rutas .lane-card:nth-child(2) h3", text: "AI agency" },
    { selector: "#rutas .lane-card:nth-child(2) p", text: "For teams ready to move into execution: integrations, agents, flows and end-to-end control." },
    { selector: "#rutas .lane-card:nth-child(2) a", text: "View agency" },
    { selector: "#rutas .lane-card:nth-child(3) strong", text: "Service 03" },
    { selector: "#rutas .lane-card:nth-child(3) h3", text: "AI automation" },
    { selector: "#rutas .lane-card:nth-child(3) p", text: "For businesses with bottlenecks in sales, support or back office that need to react faster with less manual load." },
    { selector: "#rutas .lane-card:nth-child(3) a", text: "View automation" },
    { selector: "#problema .section-header .eyebrow", text: "The problem" },
    { selector: "#problema .section-title", html: "Companies do not slow down for lack of ambition. <span>They slow down because of friction.</span>" },
    { selector: "#problema .section-copy", text: "Orders, approvals, follow-up, incidents, corrections and scattered data. The cost does not always show in an invoice. It shows in delays, slow decisions and teams acting as human glue." },
    { selector: "#arquitectura .section-header .eyebrow", text: "The solution" },
    { selector: "#arquitectura .section-title", html: "Archon installs an operational <span>Digital Brain</span>" },
    { selector: "#arquitectura .section-copy", text: "It is not a pretty website or a prompt taped together. It is a layer that observes what happens, decides with context and triggers the next right action, with human supervision where it matters." },
    { selector: "#sectores .section-header .eyebrow", text: "Sectors" },
    { selector: "#sectores .section-title", html: "The same architecture. <span>A different bottleneck.</span>" },
    { selector: "#sectores .section-copy", text: "We do not sell generic solutions. Change the sector and the friction changes too. That is why the audit starts by understanding where things break in your case, not in a PowerPoint deck." },
    { selector: "#sectores .sector-panel:nth-child(1) .eyebrow.alt", text: "Local reading" },
    { selector: "#sectores .sector-outcome strong", text: "Expected outcome" },
    { selector: "#sectores .sector-panel:nth-child(2) .eyebrow.alt", text: "What usually happens" },
    { selector: "#sectores .sector-panel:nth-child(2) h3", html: "You do not need to automate everything. You need to automate <span style='color:var(--green)'>the right part</span>." },
    { selector: "#sectores .sector-panel:nth-child(2) > p", text: "Some companies need a radar and others already need build. Archon works with a simple sequence: detect the leak, organise the flow, put rails in place and only then add AI where it multiplies judgment and speed." },
    { selector: "#sectores .sector-panel:nth-child(2) .signal-tag:nth-child(1) strong", text: "First move" },
    { selector: "#sectores .sector-panel:nth-child(2) .signal-tag:nth-child(2) strong", text: "What we avoid" },
    { selector: "#roadmap .section-header .eyebrow", text: "Archon process" },
    { selector: "#roadmap .section-title", html: "We do not start with tools. <span>We start with sequence.</span>" },
    { selector: "#roadmap .section-copy", text: "Real selling is not about telling you AI can do a thousand things. It is about setting an intelligent order so you start where return and control are most real." },
    { selector: ".roadmap-tabs", attr: "aria-label", text: "Implementation roadmap" },
    { selector: ".roadmap-tab[data-stage='audit']", text: "Radar" },
    { selector: ".roadmap-tab[data-stage='blueprint']", text: "Blueprint" },
    { selector: ".roadmap-tab[data-stage='build']", text: "Build" },
    { selector: ".roadmap-tab[data-stage='scale']", text: "Scale" },
    { selector: "#zaragoza .section-header .eyebrow", text: "Local base" },
    { selector: "#zaragoza .section-title", html: "From Zaragoza. <span>With a systems mindset.</span>" },
    { selector: "#zaragoza .section-copy", text: "If you are in Zaragoza or Aragon, we can work with a closer read of the business. If not, we work remotely across Spain just as well. The value is not the video call. The value is the architecture that remains afterwards." },
    { selector: "#zaragoza .local-copy .eyebrow.alt", text: "Who it fits" },
    { selector: "#zaragoza .local-card:nth-child(1) strong", text: "Zaragoza" },
    { selector: "#zaragoza .local-card:nth-child(1) p", text: "Discovery and audit sessions with local context when it helps to sit in front of the real process." },
    { selector: "#zaragoza .local-card:nth-child(2) strong", text: "Remote" },
    { selector: "#zaragoza .local-card:nth-child(2) p", text: "Build can be delivered from anywhere in Spain with the same discipline if the flow and sources are clear." },
    { selector: "#zaragoza .local-card:nth-child(3) strong", text: "Focus" },
    { selector: "#zaragoza .local-card:nth-child(3) p", text: "We do not do AI for fashion. We work where sales, support, collections or operations have a concrete, measurable leak." },
    { selector: "#roi .section-header .eyebrow", text: "ROI simulator" },
    { selector: "#roi .section-title", html: "Put a number on your <span>operational leak</span>" },
    { selector: "#roi .section-copy", text: "This simulator does not replace a serious audit, but it helps you see in minutes whether the hidden cost already justifies moving. Change the sector, move the sliders and watch the impact change." },
    { selector: "#roi .calc-box .eyebrow.alt", text: "Parameters" },
    { selector: "#roi .calc-box h3", text: "Express x-ray for companies with real friction" },
    { selector: "#roi .calc-box > p", text: "We take monthly activity, manual load and incidents that require intervention. From that we estimate swallowed time, repeated cost and recovery potential." },
    { selector: "label[for='eventsRange'] span", text: "Operational events / month" },
    { selector: "label[for='minutesRange'] span", text: "Manual minutes per event" },
    { selector: "label[for='hourlyRange'] span", text: "Hourly cost" },
    { selector: "label[for='errorsRange'] span", text: "Manual incidents / month" },
    { selector: "#roi .calc-field:nth-child(1) p", text: "Orders, tickets, files, validations or recurring tasks that still pass through human hands." },
    { selector: "#roi .calc-field:nth-child(2) p", text: "Time spent reviewing, copying, confirming, chasing or correcting." },
    { selector: "#roi .calc-field:nth-child(3) p", text: "Approximate cost of operational, leadership or support time absorbed by that friction." },
    { selector: "#roi .calc-field:nth-child(4) p", text: "Errors, exceptions or cases that force intervention outside the normal flow." },
    { selector: "#roi .calc-result .eyebrow", text: "Estimated impact" },
    { selector: "#fit .section-header .eyebrow", text: "Fit" },
    { selector: "#fit .section-title", html: "When yes. <span>When not.</span>" },
    { selector: "#fit .section-copy", text: "A good marketing website also filters. Not every business needs an Archon layer right now. If there is no real friction or no willingness to organise the process, the honest answer is not to move forward." },
    { selector: "#fit .fit-card.good .eyebrow.alt", text: "Good fit" },
    { selector: "#fit .fit-card.good h3", text: "Business with volume, friction and need for judgment" },
    { selector: "#fit .fit-card.bad .eyebrow.alt", text: "Not the moment" },
    { selector: "#fit .fit-card.bad h3", text: "Business without flow yet or looking for quick magic" },
    { selector: "#editorial .section-header .eyebrow", text: "Editorial" },
    { selector: "#editorial .section-title", html: "The website no longer ends on the home page. <span>Now it also has a signature.</span>" },
    { selector: "#editorial .section-copy", text: "This is where Archon's editorial layer lives: the company, the founder, the blog and a deliberate crack called 33. It helps sell better, rank better and show clearly who signs what is being said." },
    { selector: "#editorial .lane-card:nth-child(1) a", text: "Go to blog" },
    { selector: "#editorial .lane-card:nth-child(2) strong", text: "Company" },
    { selector: "#editorial .lane-card:nth-child(2) a", text: "Read the story" },
    { selector: "#editorial .lane-card:nth-child(3) strong", text: "Author" },
    { selector: "#editorial .lane-card:nth-child(3) a", text: "View profile" },
    { selector: "#editorial .lane-card:nth-child(4) a", text: "Open 33" },
    { selector: "#faq .section-header .eyebrow", text: "FAQ" },
    { selector: "#faq .section-title", html: "Normal questions. <span>Direct answers.</span>" },
    { selector: "#faq .section-copy", text: "Archon's sales should not depend on mystery. If this makes sense for your business, it needs to be clear before a proposal exists." },
    { selector: "#faq .faq-card:nth-child(1) summary", text: "What exactly does Archon do?" },
    { selector: "#faq .faq-card:nth-child(1) p", text: "We analyse operational friction, design the right architecture and deploy automation and AI only where they genuinely reduce manual load, errors and dependence on key people." },
    { selector: "#faq .faq-card:nth-child(2) summary", text: "Do you only work in Zaragoza?" },
    { selector: "#faq .faq-card:nth-child(2) p", text: "We are based in Zaragoza and can work both in person and remotely with companies across Spain. Local adds context; the method does not depend on location." },
    { selector: "#faq .faq-card:nth-child(3) summary", text: "Does the free audit sell or diagnose?" },
    { selector: "#faq .faq-card:nth-child(3) p", text: "Diagnose. If we see fit and return, we will tell you clearly. If we do not, we will tell you that too. The goal is to organise, not force a layer that does not belong." },
    { selector: "#faq .faq-card:nth-child(4) summary", text: "Is this for SMEs or only for large companies?" },
    { selector: "#faq .faq-card:nth-child(4) p", text: "It works when there is enough volume, friction and complexity for good architecture to save time, reduce errors or improve control. That moment often arrives before you are a large company." },
    { selector: "#auditoria .cta-panel:first-child .eyebrow", text: "CTA" },
    { selector: "#auditoria .cta-title", text: "Book a free 33-minute audit and we will tell you what to automate first." },
    { selector: "#auditoria .cta-copy", text: "No hype. No inflated promises. We review your context, assess whether there is return and define the first move that genuinely brings you closer to a cleaner, faster operation." },
    { selector: "#auditoria .cta-point:nth-child(1)", text: "We detect bottlenecks, human dependencies and points where information arrives too late." },
    { selector: "#auditoria .cta-point:nth-child(2)", text: "We give you an order: what to attack first, what to leave for later and what is not worth touching yet." },
    { selector: "#auditoria .cta-point:nth-child(3)", text: "If you are in Zaragoza, we can run discovery with a closer read of the business. If not, remote works perfectly." },
    { selector: ".form", attr: "aria-label", text: "Form to book an AI audit" },
    { selector: ".form input[name='name']", attr: "placeholder", text: "Full name" },
    { selector: ".form input[name='name']", attr: "aria-label", text: "Full name" },
    { selector: ".form input[name='email']", attr: "placeholder", text: "Contact email" },
    { selector: ".form input[name='email']", attr: "aria-label", text: "Contact email" },
    { selector: ".form input[name='business']", attr: "placeholder", text: "Company or business" },
    { selector: ".form input[name='business']", attr: "aria-label", text: "Company or business" },
    { selector: ".form input[name='city']", attr: "placeholder", text: "City (e.g. Zaragoza)" },
    { selector: ".form input[name='city']", attr: "aria-label", text: "City" },
    { selector: "#serviceSector", attr: "aria-label", text: "Company sector" },
    { selector: ".form select[name='bottleneck']", attr: "aria-label", text: "Main bottleneck" },
    { selector: ".form textarea[name='challenge']", attr: "placeholder", text: "Briefly tell me where you feel the most friction or manual load." },
    { selector: ".form textarea[name='challenge']", attr: "aria-label", text: "Describe the main operational challenge" },
    { selector: ".form button[type='submit']", text: "I want my audit" },
    { selector: ".form-note", text: "We receive the real request, including the sector and the operational leak estimate you saw on the page." },
    { selector: ".disclaimer", text: "33 minutes. No obligation. Human reply." },
    { selector: "footer .foot-copy span", text: "AI - Automation - Operational architecture" },
    { selector: "footer .foot-links li:nth-child(1) a", text: "Services" },
    { selector: "footer .foot-links li:nth-child(2) a", text: "Sectors" },
    { selector: "footer .foot-links li:nth-child(3) a", text: "Process" },
    { selector: "footer .foot-links li:nth-child(5) a", text: "Blog" },
    { selector: "footer .foot-links li:nth-child(6) a", text: "About Archon" },
    { selector: "footer .foot-links li:nth-child(9) a", text: "Audit" },
    { selector: "#stickyCta a", text: "Book audit" }
  ];

  const defaults = EN_STATIC.map(function (item) {
    const node = document.querySelector(item.selector);
    const value = node
      ? item.html
        ? node.innerHTML
        : item.attr
          ? node.getAttribute(item.attr)
          : node.textContent
      : null;

    return Object.assign({}, item, { defaultValue: value });
  });

  function deepAssign(target, source) {
    Object.keys(target).forEach(function (key) {
      delete target[key];
    });
    Object.keys(source).forEach(function (key) {
      target[key] = JSON.parse(JSON.stringify(source[key]));
    });
  }

  function applyStatic(lang) {
    defaults.forEach(function (item) {
      const node = document.querySelector(item.selector);
      if (!node) return;
      const value = lang === "en" ? item.text : item.defaultValue;
      if (item.html) {
        node.innerHTML = lang === "en" ? item.html : item.defaultValue;
        return;
      }
      if (item.attr) {
        if (value === null || typeof value === "undefined") return;
        node.setAttribute(item.attr, value);
        return;
      }
      if (value === null || typeof value === "undefined") return;
      node.textContent = value;
    });
  }

  function applyFormOptions(lang) {
    const sectorSelect = document.getElementById("serviceSector");
    if (sectorSelect && sectorSelect.options.length >= 4) {
      sectorSelect.options[0].text = lang === "en" ? "E-commerce" : "E-commerce";
      sectorSelect.options[1].text = lang === "en" ? "Services" : "Servicios";
      sectorSelect.options[2].text = lang === "en" ? "Internal operations" : "Operaciones internas";
      sectorSelect.options[3].text = lang === "en" ? "Other" : "Otro";
    }

    const bottleneck = document.querySelector(".form select[name='bottleneck']");
    if (bottleneck && bottleneck.options.length >= 6) {
      const labels = lang === "en"
        ? ["Main bottleneck", "Orders and operations", "Customer support", "Collections and validations", "Back office and reporting", "Other"]
        : ["Mayor cuello de botella", "Pedidos y operaciones", "Soporte al cliente", "Cobros y validaciones", "Backoffice y reportes", "Otro"];
      labels.forEach(function (label, index) {
        if (bottleneck.options[index]) bottleneck.options[index].text = label;
      });
    }

    const subject = form && form.querySelector("input[name='_subject']");
    if (subject) {
      subject.value = lang === "en" ? "Audit request - Archon Home v2" : "Solicitud de auditoría - Home Archon v2";
    }

    const autoresponse = form && form.querySelector("input[name='_autoresponse']");
    if (autoresponse) {
      autoresponse.value = lang === "en"
        ? "We have received your audit request. If there is a fit, we will reply with the next step and a proposed slot as soon as possible."
        : "Hemos recibido tu solicitud de auditoría. Si vemos encaje, te responderemos con el siguiente paso y una propuesta de hueco lo antes posible.";
    }

    const service = form && form.querySelector("input[name='service']");
    if (service) {
      service.value = lang === "en" ? "Archon Audit - Home V2" : "Auditoría Archon - Home V2";
    }
  }

  function applyLanguage(lang) {
    window.archonUiText = JSON.parse(JSON.stringify(lang === "en" ? EN_UI_TEXT : BASE_UI_TEXT));
    deepAssign(archon.sectorData, lang === "en" ? EN_SECTOR_DATA : BASE_SECTOR_DATA);
    deepAssign(archon.roadmapData, lang === "en" ? EN_ROADMAP_DATA : BASE_ROADMAP_DATA);

    applyStatic(lang);
    applyFormOptions(lang);

    document.title = lang === "en" ? enTitle : baseTitle;
    html.lang = lang;

    const activeStage = document.querySelector(".roadmap-tab.active")?.dataset.stage || "audit";
    const activeSector = archon.getCurrentSector ? archon.getCurrentSector() : "ecommerce";

    archon.updateSector(activeSector, false);
    archon.updateRoadmap(activeStage);
    archon.updateCalculator();

    toggle.textContent = lang === "en" ? "EN / ES" : "ES / EN";
    toggle.setAttribute("aria-pressed", lang === "en" ? "true" : "false");
    toggle.setAttribute("aria-label", lang === "en" ? "Switch language to Spanish" : "Cambiar idioma a inglés");

    const savedSector = form && form.querySelector("input[name='selected_sector']");
    if (savedSector) savedSector.value = archon.sectorData[activeSector].form;
  }

  function getInitialLanguage() {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "es" || saved === "en") return saved;
    return "es";
  }

  let currentLang = getInitialLanguage();
  applyLanguage(currentLang);

  toggle.addEventListener("click", function () {
    currentLang = currentLang === "es" ? "en" : "es";
    window.localStorage.setItem(STORAGE_KEY, currentLang);
    applyLanguage(currentLang);
  });
})();
