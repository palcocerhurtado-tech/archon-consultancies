(function () {
  const STORAGE_KEY = "archon_architecture_diagnosis_v2";
  const SESSION_KEY = "archon_chat_session_v1";
  const FORM_SELECTOR = 'form[action*="formsubmit.co"]';
  const API_ENDPOINT = "/api/chat";
  const OCCULT_KEY = "jeremias 33.3";

  const profile = {
    founder:
      "Detras de Archon hay un fundador con base operativa en Zaragoza obsesionado con una idea: que una empresa buena no tenga que crecer a base de heroicidades, tareas manuales y memoria humana.",
    motivation:
      "La motivacion de Archon es convertir operaciones fragiles en sistemas medibles, auditables y escalables. La meta no es vender IA por moda, sino dejar estructuras que den mas control, menos friccion y mejores decisiones.",
    mission:
      "La mision es disenar e instalar Digital Brain Infrastructure para pymes, ecommerce y equipos operativos que necesitan menos trabajo manual, menos errores y mejor gobierno del flujo.",
    vision:
      "La vision es que las empresas puedan operar con la claridad de un buen sistema: datos limpios, automatizaciones utiles, IA donde de verdad multiplica criterio y una capa de supervision que no dependa del cansancio humano.",
    values: [
      "Precision: intervenir donde hay retorno real.",
      "Control: nada de cajas negras sin supervision.",
      "Arquitectura: primero sistema, luego velocidad.",
      "Honestidad operativa: si no toca construir, se dice.",
      "Trazabilidad: cada cambio debe poder leerse y medirse."
    ]
  };

  const pricing = [
    "Radiografia operativa: 250 EUR.",
    "Setup Logistica Express: 950 EUR.",
    "Full Stack Cerebro Archon: desde 2.500 EUR.",
    "Mantenimiento y Calidad Total: 350 EUR / mes."
  ];

  const diagnosisFlow = [
    {
      id: "sector",
      prompt: "Para empezar: que tipo de empresa o flujo describe mejor tu caso?",
      options: [
        { value: "ecommerce", label: "E-commerce", aliases: ["ecommerce", "e-commerce", "tienda", "shopify", "woocommerce"] },
        { value: "services", label: "Servicios", aliases: ["servicios", "agencia", "asesoria", "consultora"] },
        { value: "operations", label: "Operaciones internas", aliases: ["operaciones", "backoffice", "internas", "administracion"] },
        { value: "other", label: "Otro modelo", aliases: ["otro", "industria", "mixto"] }
      ]
    },
    {
      id: "team",
      prompt: "Cuanta gente toca el proceso de forma habitual?",
      options: [
        { value: "1-5", label: "1 a 5 personas", aliases: ["1", "2", "3", "4", "5", "pequeno"] },
        { value: "6-15", label: "6 a 15 personas", aliases: ["6", "10", "15", "medio"] },
        { value: "16-40", label: "16 a 40 personas", aliases: ["16", "20", "30", "40"] },
        { value: "40+", label: "Mas de 40 personas", aliases: ["40", "50", "100", "grande"] }
      ]
    },
    {
      id: "bottleneck",
      prompt: "Cual es el cuello de botella principal ahora mismo?",
      options: [
        { value: "operations", label: "Pedidos u operaciones", aliases: ["pedidos", "operaciones", "logistica"] },
        { value: "support", label: "Soporte o incidencias", aliases: ["soporte", "tickets", "incidencias", "cliente"] },
        { value: "handoff", label: "Venta a entrega / handoff", aliases: ["handoff", "seguimiento", "entrega", "proyectos"] },
        { value: "backoffice", label: "Backoffice y reportes", aliases: ["backoffice", "reportes", "administracion"] },
        { value: "finance", label: "Cobros y validaciones", aliases: ["cobros", "pagos", "validaciones", "conciliacion"] }
      ]
    },
    {
      id: "stack",
      prompt: "Como esta hoy la informacion y el stack?",
      options: [
        { value: "manual", label: "Email, hojas y WhatsApp por todas partes", aliases: ["manual", "whatsapp", "hojas", "excel", "email"] },
        { value: "fragmented", label: "Herramientas sueltas sin conexion clara", aliases: ["fragmentado", "sueltas", "sin conexion"] },
        { value: "partial", label: "Hay algo conectado, pero sigue habiendo fugas", aliases: ["parcial", "algo conectado", "medio"] },
        { value: "structured", label: "Bastante ordenado, pero lento", aliases: ["ordenado", "estructurado", "estable"] }
      ]
    },
    {
      id: "dependency",
      prompt: "Cuanta dependencia hay del fundador o de personas clave?",
      options: [
        { value: "founder", label: "Alta: si falta una persona, se nota mucho", aliases: ["alta", "fundador", "persona clave", "mucho"] },
        { value: "team", label: "Media: varias personas sostienen el flujo", aliases: ["media", "varias personas"] },
        { value: "documented", label: "Baja: esta razonablemente documentado", aliases: ["baja", "documentado", "razonable"] }
      ]
    },
    {
      id: "urgency",
      prompt: "En que horizonte quieres mover esto?",
      options: [
        { value: "now", label: "Este trimestre", aliases: ["ya", "ahora", "trimestre", "urgente"] },
        { value: "soon", label: "En los proximos 3 a 6 meses", aliases: ["3", "6", "meses", "pronto"] },
        { value: "later", label: "Solo estoy explorando", aliases: ["explorando", "mirando", "luego"] }
      ]
    }
  ];

  const weaknessMap = {
    source: {
      title: "Fuente de verdad fragmentada",
      detail: "La informacion esta demasiado repartida y eso erosiona criterio, tiempos y calidad."
    },
    automation: {
      title: "Flujos sin railes operativos",
      detail: "Hay demasiado trabajo repetitivo sin reglas, disparadores ni trazabilidad real."
    },
    visibility: {
      title: "Poca visibilidad para direccion",
      detail: "Cuesta saber que esta frenando el sistema y quien tiene la siguiente accion."
    },
    dependency: {
      title: "Dependencia de personas clave",
      detail: "Parte del negocio sigue viviendo en la cabeza del fundador o del equipo que mas aguanta."
    },
    support: {
      title: "Respuesta lenta a incidencias",
      detail: "Excepciones, soporte o validaciones llegan tarde y generan mas coste del que parece."
    }
  };

  const allowedActions = new Set([
    "startDiagnosis",
    "audit",
    "showSaved",
    "copy",
    "pricing",
    "founder",
    "mvv",
    "none"
  ]);

  const state = {
    open: false,
    mode: "idle",
    step: 0,
    answers: {},
    aiAvailable: null,
    occultMode: false
  };

  let ui = null;

  function normalize(text) {
    return (text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function containsOccultKey(text) {
    return normalize(text).indexOf(OCCULT_KEY) !== -1;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatReplyHtml(text) {
    return String(text || "")
      .split(/\n{2,}/)
      .filter(Boolean)
      .map(function (chunk) {
        return "<p>" + escapeHtml(chunk).replace(/\n/g, "<br>") + "</p>";
      })
      .join("");
  }

  function defaultSession() {
    return {
      history: [],
      configured: null,
      occultMode: false
    };
  }

  function loadSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? JSON.parse(raw) : defaultSession();
    } catch (error) {
      return defaultSession();
    }
  }

  function saveSession(session) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch (error) {
      return;
    }
  }

  function updateSession(patch) {
    const session = Object.assign({}, defaultSession(), loadSession(), patch);
    saveSession(session);
    return session;
  }

  function pushHistory(role, content) {
    if (!content) return;
    const session = loadSession();
    const nextHistory = session.history
      .concat([{ role: role, content: String(content).slice(0, 3000) }])
      .slice(-10);

    updateSession({ history: nextHistory });
  }

  function saveDiagnosis(report) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(report));
    } catch (error) {
      return;
    }
  }

  function loadDiagnosis() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function serviceUrlForSector(sector) {
    if (sector === "ecommerce") return "/agencia-ia.html#auditoria";
    if (sector === "services") return "/consultoria-ia.html#auditoria";
    if (sector === "operations") return "/automatizacion-ia-empresas.html#auditoria";
    return "/#auditoria";
  }

  function labelForAnswer(stepId, value) {
    const step = diagnosisFlow.find(function (item) {
      return item.id === stepId;
    });

    if (!step) return value;

    const option = step.options.find(function (item) {
      return item.value === value;
    });

    return option ? option.label : value;
  }

  function inferLeadStage(severity, answers) {
    if (answers.urgency === "now" && severity >= 7) return "hot";
    if (severity >= 7 || answers.urgency === "now") return "warm";
    return "cold";
  }

  function buildSummaryText(report) {
    return [
      report.sectorLabel ? "Sector: " + report.sectorLabel : "",
      report.weaknesses.length
        ? "Debilidades estructurales: " +
          report.weaknesses
            .map(function (item) {
              return item.title;
            })
            .join(" | ")
        : "",
      report.budgetTitle ? "Presupuesto borrador: " + report.budgetTitle : "",
      report.budgetLines.length ? report.budgetLines.join(" ") : "",
      report.recommendation || ""
    ]
      .filter(Boolean)
      .join("\n");
  }

  function buildDiagnosisReport(answers) {
    const scores = {
      source: 0,
      automation: 0,
      visibility: 0,
      dependency: 0,
      support: 0
    };

    if (answers.sector === "ecommerce") {
      scores.automation += 2;
      scores.support += 1;
      scores.source += 1;
    } else if (answers.sector === "services") {
      scores.visibility += 2;
      scores.dependency += 1;
      scores.source += 1;
    } else if (answers.sector === "operations") {
      scores.source += 2;
      scores.automation += 1;
      scores.visibility += 1;
    } else {
      scores.source += 1;
      scores.automation += 1;
    }

    if (answers.team === "6-15") scores.visibility += 1;
    if (answers.team === "16-40" || answers.team === "40+") {
      scores.visibility += 2;
      scores.source += 1;
    }

    if (answers.bottleneck === "operations") {
      scores.automation += 3;
      scores.source += 1;
    }
    if (answers.bottleneck === "support") {
      scores.support += 3;
      scores.automation += 1;
    }
    if (answers.bottleneck === "handoff") {
      scores.visibility += 2;
      scores.dependency += 1;
    }
    if (answers.bottleneck === "backoffice") {
      scores.source += 2;
      scores.visibility += 1;
    }
    if (answers.bottleneck === "finance") {
      scores.automation += 2;
      scores.source += 1;
      scores.support += 1;
    }

    if (answers.stack === "manual") {
      scores.source += 3;
      scores.automation += 2;
      scores.visibility += 1;
    } else if (answers.stack === "fragmented") {
      scores.source += 2;
      scores.automation += 2;
      scores.visibility += 1;
    } else if (answers.stack === "partial") {
      scores.automation += 1;
      scores.visibility += 1;
    } else if (answers.stack === "structured") {
      scores.visibility += 1;
    }

    if (answers.dependency === "founder") {
      scores.dependency += 3;
      scores.visibility += 1;
    } else if (answers.dependency === "team") {
      scores.dependency += 2;
    }

    if (answers.urgency === "now") {
      scores.automation += 1;
      scores.support += 1;
    } else if (answers.urgency === "soon") {
      scores.visibility += 1;
    }

    const ranked = Object.keys(scores)
      .map(function (key) {
        return {
          key: key,
          score: scores[key],
          title: weaknessMap[key].title,
          detail: weaknessMap[key].detail
        };
      })
      .sort(function (left, right) {
        return right.score - left.score;
      });

    const topWeaknesses = ranked.slice(0, 3);
    const severity = topWeaknesses.reduce(function (total, item) {
      return total + item.score;
    }, 0);

    let budgetTitle = "Borrador: radiografia y quick win";
    let budgetLines = [
      "Radiografia operativa: 250 EUR.",
      "Quick win focalizado: 950 a 1.400 EUR.",
      "Mantenimiento opcional: 350 EUR / mes."
    ];

    if (severity >= 10) {
      budgetTitle = "Borrador: arquitectura completa con despliegue";
      budgetLines = [
        "Radiografia operativa: 250 EUR.",
        "Setup prioritario: 950 EUR.",
        "Full Stack Cerebro Archon: desde 2.500 a 4.500 EUR segun alcance.",
        "Mantenimiento y calidad total: 350 EUR / mes."
      ];
    } else if (severity >= 7) {
      budgetTitle = "Borrador: blueprint y primer sprint de sistema";
      budgetLines = [
        "Radiografia operativa: 250 EUR.",
        "Sprint de correccion estructural: 1.400 a 2.500 EUR.",
        "Mantenimiento opcional: 350 EUR / mes."
      ];
    }

    const sectorLabel = labelForAnswer("sector", answers.sector);
    const overview =
      "Para un negocio tipo " +
      sectorLabel.toLowerCase() +
      ", la lectura inicial apunta a " +
      topWeaknesses[0].title.toLowerCase() +
      " y " +
      topWeaknesses[1].title.toLowerCase() +
      " como fugas mas claras. Hay margen real para ganar control sin rehacerlo todo de golpe.";

    const recommendation =
      "Siguiente paso recomendado: una auditoria de 33 minutos para validar prioridades, decidir el quick win correcto y revisar este presupuesto borrador contigo en reunion.";

    const report = {
      createdAt: new Date().toISOString(),
      source: "local",
      leadStage: inferLeadStage(severity, answers),
      sector: answers.sector,
      sectorLabel: sectorLabel,
      answers: answers,
      overview: overview,
      recommendation: recommendation,
      weaknesses: topWeaknesses,
      budgetTitle: budgetTitle,
      budgetLines: budgetLines,
      summaryText: "",
      auditUrl: serviceUrlForSector(answers.sector)
    };

    report.summaryText = [
      "Sector: " + sectorLabel,
      "Equipo: " + labelForAnswer("team", answers.team),
      "Cuello de botella: " + labelForAnswer("bottleneck", answers.bottleneck),
      "Stack actual: " + labelForAnswer("stack", answers.stack),
      "Dependencia: " + labelForAnswer("dependency", answers.dependency),
      "Horizonte: " + labelForAnswer("urgency", answers.urgency),
      "Debilidades estructurales: " +
        topWeaknesses
          .map(function (item) {
            return item.title;
          })
          .join(" | "),
      "Presupuesto borrador: " + budgetTitle + " -> " + budgetLines.join(" "),
      recommendation
    ].join("\n");

    return report;
  }

  function normalizeAiReport(input, fallback) {
    const safeInput = input || {};
    const base = fallback || {};
    const sector = safeInput.sector || base.sector || "other";
    const sectorLabel = safeInput.sectorLabel || base.sectorLabel || labelForAnswer("sector", sector);
    const weaknesses = Array.isArray(safeInput.weaknesses) && safeInput.weaknesses.length
      ? safeInput.weaknesses
          .slice(0, 3)
          .map(function (item) {
            return {
              title: item && item.title ? item.title : "",
              detail: item && item.detail ? item.detail : ""
            };
          })
          .filter(function (item) {
            return item.title && item.detail;
          })
      : base.weaknesses || [];
    const budgetLines = Array.isArray(safeInput.budgetLines) && safeInput.budgetLines.length
      ? safeInput.budgetLines.filter(Boolean).slice(0, 6)
      : base.budgetLines || [];

    const report = {
      createdAt: new Date().toISOString(),
      source: "gemini",
      leadStage: safeInput.leadStage || base.leadStage || "warm",
      sector: sector,
      sectorLabel: sectorLabel,
      answers: base.answers || {},
      overview: safeInput.overview || base.overview || "",
      recommendation:
        safeInput.recommendation ||
        base.recommendation ||
        "Siguiente paso recomendado: una auditoria de 33 minutos para revisar este borrador contigo.",
      weaknesses: weaknesses,
      budgetTitle: safeInput.budgetTitle || base.budgetTitle || "Borrador Archon",
      budgetLines: budgetLines,
      summaryText: safeInput.summaryText || "",
      auditUrl: safeInput.auditUrl || base.auditUrl || serviceUrlForSector(sector)
    };

    if (!report.summaryText) {
      report.summaryText = buildSummaryText(report);
    }

    return report;
  }

  function ensureHiddenField(form, name, value) {
    let field = form.querySelector('input[name="' + name + '"]');
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      form.appendChild(field);
    }
    field.value = value;
  }

  function hydrateForms() {
    const saved = loadDiagnosis();
    const forms = document.querySelectorAll(FORM_SELECTOR);

    forms.forEach(function (form) {
      const noteParent = form.parentElement;
      if (!saved) return;

      ensureHiddenField(form, "chatbot_summary", saved.summaryText);
      ensureHiddenField(form, "chatbot_budget_draft", saved.budgetTitle + " | " + saved.budgetLines.join(" "));
      ensureHiddenField(
        form,
        "chatbot_structural_weaknesses",
        saved.weaknesses
          .map(function (item) {
            return item.title;
          })
          .join(" | ")
      );
      ensureHiddenField(form, "chatbot_recommendation", saved.recommendation);
      ensureHiddenField(form, "chatbot_created_at", saved.createdAt);
      ensureHiddenField(form, "chatbot_source", saved.source || "local");
      ensureHiddenField(form, "chatbot_lead_stage", saved.leadStage || "warm");

      const platformSelect = form.querySelector('select[name="platform"]');
      if (platformSelect && saved.sectorLabel) {
        const matchingOption = Array.from(platformSelect.options).find(function (option) {
          return normalize(option.textContent) === normalize(saved.sectorLabel);
        });
        if (matchingOption) platformSelect.value = matchingOption.value || matchingOption.textContent;
      }

      const sectorSelect = form.querySelector('select[name="sector"]');
      if (sectorSelect && saved.sectorLabel) {
        const sectorOption = Array.from(sectorSelect.options).find(function (option) {
          return normalize(option.textContent) === normalize(saved.sectorLabel);
        });
        if (sectorOption) sectorSelect.value = sectorOption.value || sectorOption.textContent;
      }

      if (noteParent && !noteParent.querySelector(".chatbot-form-note")) {
        const note = document.createElement("p");
        note.className = "chatbot-form-note";
        note.textContent = "El analisis del chatbot se adjuntara a esta solicitud.";
        noteParent.appendChild(note);
      }
    });
  }

  function openAuditFromReport(report) {
    const target = (report && report.auditUrl) || "/#auditoria";
    if (target.charAt(0) === "#" && document.querySelector(target)) {
      document.querySelector(target).scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (target.indexOf("#") === 0 && !document.querySelector(target)) {
      window.location.href = "/" + target;
      return;
    }
    if (target.indexOf("#auditoria") !== -1 && window.location.pathname + window.location.hash === target) {
      const localTarget = document.getElementById("auditoria");
      if (localTarget) localTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    window.location.href = target;
  }

  function copyReport() {
    const saved = loadDiagnosis();
    if (!saved || !navigator.clipboard) return;
    navigator.clipboard.writeText(saved.summaryText).then(function () {
      setStatus("Resumen copiado. Puedes pegarlo en email o CRM.", "live");
    });
  }

  function setStatus(text, stateName) {
    if (!ui || !ui.status) return;
    ui.status.textContent = text;
    ui.status.setAttribute("data-state", stateName || "");
  }

  function setOccultMode(active) {
    state.occultMode = Boolean(active);
    updateSession({ occultMode: state.occultMode });

    if (!ui) return;

    ui.root.classList.toggle("is-occult", state.occultMode);

    if (ui.gate) {
      ui.gate.textContent = state.occultMode
        ? "Camara velada abierta"
        : "Camara velada dormida";
    }

    if (ui.subtitle) {
      ui.subtitle.textContent = state.occultMode
        ? "La segunda camara esta activa. Ahora tambien puedo hablar de ocultismo, hermetismo, alquimia y masoneria con mas profundidad."
        : "Diagnostico estructural, borrador de presupuesto y respuestas sobre la marca. Existe una segunda camara para quien sepa abrirla.";
    }

    if (ui.toggle) {
      ui.toggle.textContent = state.occultMode
        ? "Camara velada"
        : "Analisis Archon";
    }
  }

  function scrollMessagesToBottom() {
    if (!ui || !ui.body) return;
    ui.body.scrollTop = ui.body.scrollHeight;
  }

  function appendMessage(type, html) {
    const message = document.createElement("div");
    message.className = "archon-chatbot-message archon-chatbot-message--" + type;
    message.innerHTML = html;
    ui.messages.appendChild(message);
    scrollMessagesToBottom();
    return message;
  }

  function addUserMessage(text) {
    appendMessage("user", escapeHtml(text));
  }

  function addBotMessage(html) {
    return appendMessage("bot", html);
  }

  function addCitations(citations) {
    if (!Array.isArray(citations) || !citations.length) return;

    const wrapper = document.createElement("div");
    wrapper.className = "archon-chatbot-actions archon-chatbot-citations";

    citations.slice(0, 5).forEach(function (citation) {
      if (!citation || !citation.url) return;

      const link = document.createElement("a");
      link.className = "archon-chatbot-link";
      link.href = citation.url;
      link.target = "_blank";
      link.rel = "noreferrer noopener";
      link.textContent = citation.title || citation.url;
      wrapper.appendChild(link);
    });

    ui.messages.appendChild(wrapper);
    scrollMessagesToBottom();
  }

  function addOptions(options) {
    const wrapper = document.createElement("div");
    wrapper.className = "archon-chatbot-options";

    options.forEach(function (option) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "archon-chatbot-option";
      button.textContent = option.label;
      button.addEventListener("click", function () {
        handleOption(option);
      });
      wrapper.appendChild(button);
    });

    ui.messages.appendChild(wrapper);
    scrollMessagesToBottom();
  }

  function removePendingOptions() {
    ui.messages.querySelectorAll(".archon-chatbot-options").forEach(function (node) {
      node.remove();
    });
  }

  function defaultOptions() {
    return [
      { label: "Analizar mi empresa", action: "startDiagnosis" },
      { label: "Quien esta detras de Archon", action: "founder" },
      { label: "Mision, vision y valores", action: "mvv" },
      { label: "Precios orientativos", action: "pricing" }
    ];
  }

  function renderSavedDiagnosisPreview(saved) {
    addBotMessage(
      '<div class="archon-chatbot-summary">' +
        "<strong>Tienes un borrador guardado</strong>" +
        "<span>" + escapeHtml(saved.overview) + "</span>" +
        "<span>" + escapeHtml(saved.budgetTitle) + "</span>" +
      "</div>"
    );
    addOptions([
      { label: "Ver borrador", action: "showSaved" },
      { label: "Reservar revision", action: "audit" }
    ]);
  }

  function renderWelcome() {
    ui.messages.innerHTML = "";
    addBotMessage(
      "<p><strong>Analisis Archon</strong></p>" +
        "<p>Puedo diagnosticar debilidades estructurales, preparar un borrador de presupuesto y responder preguntas sobre Archon, su motivacion y sus servicios.</p>" +
        "<p>Y si alguna vez sospechas que este panel tiene una segunda camara, recuerda esto: algunas puertas no se abren con botones, sino con formula.</p>"
    );

    const saved = loadDiagnosis();
    if (saved) renderSavedDiagnosisPreview(saved);

    addOptions(defaultOptions());
    setStatus("Listo para ayudarte.", "ready");
  }

  function renderReportCard(report, sourceLabel) {
    const budgetItems = report.budgetLines
      .map(function (line) {
        return "<li>" + escapeHtml(line) + "</li>";
      })
      .join("");

    addBotMessage(
      '<div class="archon-chatbot-summary">' +
        "<strong>" + escapeHtml(report.budgetTitle) + "</strong>" +
        "<span>" + escapeHtml(report.overview) + "</span>" +
        "<span>" + escapeHtml(report.recommendation) + "</span>" +
        (sourceLabel ? "<span>Origen del borrador: " + escapeHtml(sourceLabel) + ".</span>" : "") +
        (budgetItems ? "<ul>" + budgetItems + "</ul>" : "") +
      "</div>"
    );
  }

  function currentStep() {
    return diagnosisFlow[state.step];
  }

  function askDiagnosisQuestion() {
    const step = currentStep();
    if (!step) {
      finishDiagnosis();
      return;
    }

    addBotMessage("<p><strong>Paso " + (state.step + 1) + " de " + diagnosisFlow.length + "</strong></p><p>" + escapeHtml(step.prompt) + "</p>");
    addOptions(
      step.options.map(function (option) {
        return {
          label: option.label,
          action: "diagnosisChoice",
          value: option.value
        };
      })
    );
    setStatus("Estoy construyendo tu borrador estructural.", "thinking");
  }

  function startDiagnosis() {
    state.mode = "diagnosis";
    state.step = 0;
    state.answers = {};
    removePendingOptions();
    addBotMessage(
      "<p><strong>Perfecto.</strong></p><p>Voy a hacerte seis preguntas cortas para detectar friccion estructural, priorizar el punto debil y proponerte un borrador que luego revisareis en reunion.</p>"
    );
    askDiagnosisQuestion();
  }

  function answerFounder() {
    addBotMessage("<p><strong>Quien esta detras de Archon</strong></p><p>" + escapeHtml(profile.founder) + "</p>");
    addBotMessage("<p><strong>Motivacion</strong></p><p>" + escapeHtml(profile.motivation) + "</p>");
    addOptions([
      { label: "Mision y valores", action: "mvv" },
      { label: "Diagnosticar mi empresa", action: "startDiagnosis" }
    ]);
    setStatus("Si quieres, tambien te cuento la mision y los valores.", "ready");
  }

  function answerMissionVisionValues() {
    addBotMessage(
      "<p><strong>Mision</strong></p><p>" + escapeHtml(profile.mission) + "</p>" +
        "<p><strong>Vision</strong></p><p>" + escapeHtml(profile.vision) + "</p>" +
        "<p><strong>Valores</strong></p><ul>" +
          profile.values
            .map(function (item) {
              return "<li>" + escapeHtml(item) + "</li>";
            })
            .join("") +
        "</ul>"
    );
    addOptions([
      { label: "Quiero mi borrador", action: "startDiagnosis" },
      { label: "Precios orientativos", action: "pricing" }
    ]);
    setStatus("Puedo aterrizar esto a tu empresa con un diagnostico guiado.", "ready");
  }

  function answerPricing() {
    addBotMessage(
      "<p><strong>Rangos orientativos de Archon</strong></p><ul>" +
        pricing
          .map(function (line) {
            return "<li>" + escapeHtml(line) + "</li>";
          })
          .join("") +
        "</ul><p>El chatbot solo te da un borrador. El presupuesto real se revisa contigo en reunion despues de validar proceso, stack y prioridad.</p>"
    );
    addOptions([
      { label: "Quiero mi borrador", action: "startDiagnosis" },
      { label: "Reservar revision", action: "audit" }
    ]);
    setStatus("Los precios finales dependen de alcance, friccion y secuencia.", "ready");
  }

  function answerServices() {
    addBotMessage(
      "<p><strong>Que hace Archon</strong></p><p>Archon diagnostica, ordena y construye sistemas operativos con IA para empresas que quieren menos trabajo manual, menos dependencia de personas clave y mas control del flujo.</p>"
    );
    addOptions([
      { label: "Analizar mi empresa", action: "startDiagnosis" },
      { label: "Reservar revision", action: "audit" }
    ]);
    setStatus("Si quieres, te hago el diagnostico ahora mismo.", "ready");
  }

  function answerAudit() {
    addBotMessage(
      "<p><strong>Siguiente paso</strong></p><p>Lo mejor es reservar una auditoria de 33 minutos. Asi revisais el borrador, ajustais prioridad y decides si toca quick win, setup focalizado o arquitectura completa.</p>"
    );
    addOptions([{ label: "Ir a la auditoria", action: "audit" }]);
    setStatus("Puedo llevarte al formulario correcto.", "ready");
  }

  function normalizeApiActions(actions) {
    if (!Array.isArray(actions)) return [];

    return actions
      .slice(0, 3)
      .map(function (item) {
        if (!item || !allowedActions.has(item.action) || !item.label) return null;
        return {
          label: item.label,
          action: item.action
        };
      })
      .filter(Boolean);
  }

  function emptyReportFallback() {
    return {
      createdAt: new Date().toISOString(),
      source: "local",
      leadStage: "warm",
      sector: "other",
      sectorLabel: labelForAnswer("sector", "other"),
      answers: {},
      overview: "",
      recommendation: "",
      weaknesses: [],
      budgetTitle: "",
      budgetLines: [],
      summaryText: "",
      auditUrl: serviceUrlForSector("other")
    };
  }

  async function checkApiAvailability() {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "GET",
        headers: {
          Accept: "application/json"
        }
      });

      if (!response.ok) throw new Error("API unavailable");

      const data = await response.json();
      state.aiAvailable = Boolean(data.configured);
      updateSession({ configured: state.aiAvailable });

      if (state.aiAvailable) {
        setStatus("IA Gemini conectada con busqueda viva. Puedes conversar o pedir tu borrador.", "live");
      } else {
        setStatus("Modo local activo. La IA se activara al configurar GEMINI_API_KEY.", "fallback");
      }
    } catch (error) {
      state.aiAvailable = false;
      updateSession({ configured: false });
      setStatus("Modo local activo. Si despliegas la API en Vercel, el chat conversara con IA.", "fallback");
    }
  }

  async function askGemini(payload) {
    const session = loadSession();

    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: payload.message,
          mode: payload.mode || "chat",
          occultMode: state.occultMode,
          history: session.history || [],
          page: {
            title: document.title,
            pathname: window.location.pathname,
            url: window.location.href
          },
          diagnosisReport: payload.diagnosisReport || null,
          savedDiagnosis: loadDiagnosis()
        })
      });

      if (!response.ok) {
        updateSession({ configured: false });
        state.aiAvailable = false;
        return null;
      }

      const data = await response.json();
      updateSession({ configured: true });
      state.aiAvailable = true;

      if (payload.message) pushHistory("user", payload.message);
      if (data.reply) pushHistory("assistant", data.reply);

      return data;
    } catch (error) {
      updateSession({ configured: false });
      state.aiAvailable = false;
      return null;
    }
  }

  function renderApiResponse(data) {
    if (!data) return false;

    if (data.occultMode) {
      setOccultMode(true);
    }

    if (data.reply) {
      addBotMessage(formatReplyHtml(data.reply));
    }

    if (data.citations && data.citations.length) {
      addCitations(data.citations);
    }

    if (data.reportReady && data.report) {
      const report = normalizeAiReport(
        Object.assign({}, data.report, { leadStage: data.leadStage }),
        loadDiagnosis() || emptyReportFallback()
      );
      saveDiagnosis(report);
      hydrateForms();
      renderReportCard(report, "Gemini 2.5 Flash");
    }

    const actions = normalizeApiActions(data.ctas);
    if (actions.length) {
      addOptions(actions);
    } else if (!state.occultMode) {
      addOptions(defaultOptions());
    }

    setStatus(
      state.occultMode
        ? "Camara velada abierta. Gemini y busqueda viva activos."
        : "IA Gemini conectada. Sigo contigo.",
      "live"
    );
    return true;
  }

  function renderLocalDiagnosis(report, sourceLabel) {
    const weaknessItems = report.weaknesses
      .map(function (item) {
        return "<li><strong>" + escapeHtml(item.title) + ".</strong> " + escapeHtml(item.detail) + "</li>";
      })
      .join("");

    const budgetItems = report.budgetLines
      .map(function (line) {
        return "<li>" + escapeHtml(line) + "</li>";
      })
      .join("");

    addBotMessage(
      "<p><strong>Lectura estructural inicial</strong></p>" +
        "<p>" + escapeHtml(report.overview) + "</p>" +
        '<div class="archon-chatbot-summary">' +
          "<strong>" + escapeHtml(report.budgetTitle) + "</strong>" +
          "<span>" + escapeHtml(report.recommendation) + "</span>" +
          (sourceLabel ? "<span>Origen del borrador: " + escapeHtml(sourceLabel) + ".</span>" : "") +
          "<ul>" + budgetItems + "</ul>" +
        "</div>" +
        "<p><strong>Debilidades mas probables</strong></p>" +
        "<ul>" + weaknessItems + "</ul>"
    );

    addOptions([
      { label: "Reservar revision", action: "audit" },
      { label: "Copiar resumen", action: "copy" },
      { label: "Nuevo analisis", action: "startDiagnosis" }
    ]);
  }

  async function finishDiagnosis() {
    const localReport = buildDiagnosisReport(state.answers);
    let finalReport = localReport;

    removePendingOptions();
    setStatus("Construyendo borrador con Gemini 2.5 Flash...", "thinking");

    const apiResponse = await askGemini({
      message: "Genera un borrador completo a partir del diagnostico guiado.",
      mode: "diagnosis_enrichment",
      diagnosisReport: localReport
    });

    if (apiResponse && apiResponse.reportReady && apiResponse.report) {
      finalReport = normalizeAiReport(
        Object.assign({}, apiResponse.report, { leadStage: apiResponse.leadStage }),
        localReport
      );
      saveDiagnosis(finalReport);
      hydrateForms();
      if (apiResponse.reply) {
        addBotMessage(formatReplyHtml(apiResponse.reply));
      }
      renderReportCard(finalReport, "Gemini 2.5 Flash");
      addOptions([
        { label: "Reservar revision", action: "audit" },
        { label: "Copiar resumen", action: "copy" },
        { label: "Nuevo analisis", action: "startDiagnosis" }
      ]);
      setStatus("Borrador IA guardado. Se adjuntara al lead.", "live");
    } else {
      saveDiagnosis(finalReport);
      hydrateForms();
      renderLocalDiagnosis(finalReport, "modo local");
      setStatus("Borrador guardado. Si envias el formulario, el analisis viajara con el lead.", "fallback");
    }

    state.mode = "idle";
    state.step = 0;
    state.answers = {};
  }

  function handleOption(option) {
    removePendingOptions();

    if (option.action === "none") {
      addOptions(defaultOptions());
      return;
    }

    if (option.action === "startDiagnosis") {
      startDiagnosis();
      return;
    }

    if (option.action === "diagnosisChoice") {
      const step = currentStep();
      if (!step) return;
      addUserMessage(option.label);
      state.answers[step.id] = option.value;
      state.step += 1;
      askDiagnosisQuestion();
      return;
    }

    if (option.action === "founder") {
      answerFounder();
      return;
    }

    if (option.action === "mvv") {
      answerMissionVisionValues();
      return;
    }

    if (option.action === "pricing") {
      answerPricing();
      return;
    }

    if (option.action === "showSaved") {
      const saved = loadDiagnosis();
      if (!saved) {
        addBotMessage("<p>No encuentro un borrador guardado. Si quieres, lo hacemos ahora en menos de dos minutos.</p>");
        addOptions([{ label: "Empezar ahora", action: "startDiagnosis" }]);
        return;
      }
      addBotMessage(
        "<p><strong>Ultimo borrador guardado</strong></p><p>" +
          escapeHtml(saved.overview) +
          "</p><p><strong>" +
          escapeHtml(saved.budgetTitle) +
          "</strong></p><ul>" +
          saved.budgetLines
            .map(function (line) {
              return "<li>" + escapeHtml(line) + "</li>";
            })
            .join("") +
          "</ul>"
      );
      addOptions([
        { label: "Reservar revision", action: "audit" },
        { label: "Copiar resumen", action: "copy" }
      ]);
      return;
    }

    if (option.action === "audit") {
      openAuditFromReport(loadDiagnosis());
      setStatus("Te llevo al siguiente paso.", "ready");
      return;
    }

    if (option.action === "copy") {
      copyReport();
      return;
    }
  }

  function handleDiagnosisFreeText(text) {
    const step = currentStep();
    if (!step) return;
    const normalizedText = normalize(text);

    const matched = step.options.find(function (option) {
      return (
        normalize(option.label).indexOf(normalizedText) !== -1 ||
        normalizedText.indexOf(normalize(option.label)) !== -1 ||
        (option.aliases || []).some(function (alias) {
          return normalizedText.indexOf(alias) !== -1;
        })
      );
    });

    if (!matched) {
      addBotMessage("<p>Para que el borrador sea util, respondeme con una de las opciones visibles o escribe algo equivalente.</p>");
      addOptions(
        step.options.map(function (option) {
          return {
            label: option.label,
            action: "diagnosisChoice",
            value: option.value
          };
        })
      );
      return;
    }

    handleOption({
      label: matched.label,
      action: "diagnosisChoice",
      value: matched.value
    });
  }

  function handleLocalFreeText(text) {
    const normalizedText = normalize(text);

    if (containsOccultKey(text)) {
      setOccultMode(true);
      addBotMessage(
        "<p><strong>La formula ha sido reconocida.</strong></p><p>La camara velada ya esta marcada para esta sesion, pero sin Gemini activo no puedo desplegar la capa ocultista completa.</p>"
      );
      setStatus("Camara velada lista. Falta activar la IA en Vercel.", "fallback");
      return;
    }

    if (
      normalizedText.indexOf("ocult") !== -1 ||
      normalizedText.indexOf("hermet") !== -1 ||
      normalizedText.indexOf("alquim") !== -1 ||
      normalizedText.indexOf("mason") !== -1 ||
      normalizedText.indexOf("rosacruz") !== -1 ||
      normalizedText.indexOf("secreto") !== -1 ||
      normalizedText.indexOf("camara") !== -1 ||
      normalizedText.indexOf("pista") !== -1
    ) {
      addBotMessage(
        "<p>Hay una segunda camara para ese tipo de preguntas. No se abre con un boton.</p><p>Puedo darte una pista: <strong>un profeta, un numero maestro repetido y un versiculo ternario</strong>. Otra mas: <strong>11 x 3 = 33; el tercer sello queda solo</strong>.</p>"
      );
      addOptions(defaultOptions());
      return;
    }

    if (
      normalizedText.indexOf("analisis") !== -1 ||
      normalizedText.indexOf("diagnostico") !== -1 ||
      normalizedText.indexOf("debilidades") !== -1 ||
      normalizedText.indexOf("presupuesto") !== -1
    ) {
      startDiagnosis();
      return;
    }

    if (
      normalizedText.indexOf("quien eres") !== -1 ||
      normalizedText.indexOf("quien esta detras") !== -1 ||
      normalizedText.indexOf("fundador") !== -1 ||
      normalizedText.indexOf("quien soy") !== -1
    ) {
      answerFounder();
      return;
    }

    if (
      normalizedText.indexOf("motivacion") !== -1 ||
      normalizedText.indexOf("por que") !== -1 ||
      normalizedText.indexOf("porque") !== -1 ||
      normalizedText.indexOf("origen") !== -1
    ) {
      addBotMessage("<p><strong>Motivacion de Archon</strong></p><p>" + escapeHtml(profile.motivation) + "</p>");
      addOptions(defaultOptions());
      return;
    }

    if (
      normalizedText.indexOf("mision") !== -1 ||
      normalizedText.indexOf("vision") !== -1 ||
      normalizedText.indexOf("valores") !== -1
    ) {
      answerMissionVisionValues();
      return;
    }

    if (
      normalizedText.indexOf("precio") !== -1 ||
      normalizedText.indexOf("coste") !== -1 ||
      normalizedText.indexOf("cuanto") !== -1
    ) {
      answerPricing();
      return;
    }

    if (
      normalizedText.indexOf("que haceis") !== -1 ||
      normalizedText.indexOf("que haces") !== -1 ||
      normalizedText.indexOf("servicios") !== -1 ||
      normalizedText.indexOf("archon") !== -1
    ) {
      answerServices();
      return;
    }

    if (
      normalizedText.indexOf("reunion") !== -1 ||
      normalizedText.indexOf("auditoria") !== -1 ||
      normalizedText.indexOf("hablar") !== -1
    ) {
      answerAudit();
      return;
    }

    addBotMessage(
      "<p>Puedo ayudarte con cuatro rutas rapidas: diagnosticar la empresa, explicar quien esta detras de Archon, resumir mision y valores o aterrizar precios orientativos.</p>"
    );
    addOptions(defaultOptions());
  }

  async function handleFreeText(text) {
    if (state.mode === "diagnosis") {
      handleDiagnosisFreeText(text);
      return;
    }

    if (containsOccultKey(text)) {
      setOccultMode(true);
    }

    setStatus("Pensando la mejor siguiente jugada...", "thinking");

    const apiResponse = await askGemini({
      message: text,
      mode: "chat"
    });

    if (renderApiResponse(apiResponse)) {
      return;
    }

    handleLocalFreeText(text);
    setStatus("Modo local activo. La IA se activara cuando GEMINI_API_KEY este configurada.", "fallback");
  }

  async function submitInput(event) {
    event.preventDefault();
    const text = ui.input.value.trim();
    if (!text) return;
    removePendingOptions();
    addUserMessage(text);
    ui.input.value = "";
    await handleFreeText(text);
  }

  function toggleChat(forceOpen) {
    state.open = typeof forceOpen === "boolean" ? forceOpen : !state.open;
    ui.root.classList.toggle("is-open", state.open);
    ui.toggle.setAttribute("aria-expanded", String(state.open));
    if (state.open) {
      ui.input.focus();
      scrollMessagesToBottom();
    }
  }

  function createUi() {
    const root = document.createElement("div");
    root.className = "archon-chatbot";
    root.innerHTML =
      '<button class="archon-chatbot-toggle" type="button" aria-expanded="false" aria-controls="archon-chatbot-panel">Analisis Archon</button>' +
      '<section class="archon-chatbot-panel" id="archon-chatbot-panel" aria-label="Chatbot de Archon">' +
        '<div class="archon-chatbot-header">' +
          "<div>" +
            "<strong>Archon</strong>" +
            '<span class="archon-chatbot-subtitle">Diagnostico estructural, borrador de presupuesto y respuestas sobre la marca. Existe una segunda camara para quien sepa abrirla.</span>' +
          "</div>" +
          '<div class="archon-chatbot-gate">Camara velada dormida</div>' +
          '<button class="archon-chatbot-close" type="button" aria-label="Cerrar chatbot">&times;</button>' +
        "</div>" +
        '<div class="archon-chatbot-body">' +
          '<div class="archon-chatbot-messages"></div>' +
        "</div>" +
        '<div class="archon-chatbot-footer">' +
          '<div class="archon-chatbot-status">Listo para ayudarte.</div>' +
          '<form class="archon-chatbot-form">' +
            '<input class="archon-chatbot-input" type="text" name="chatbot_message" placeholder="Escribe aqui tu pregunta o responde una opcion..." autocomplete="off">' +
            '<button class="archon-chatbot-send" type="submit">Enviar</button>' +
          "</form>" +
        "</div>" +
      "</section>";

    document.body.appendChild(root);

    ui = {
      root: root,
      toggle: root.querySelector(".archon-chatbot-toggle"),
      close: root.querySelector(".archon-chatbot-close"),
      body: root.querySelector(".archon-chatbot-body"),
      messages: root.querySelector(".archon-chatbot-messages"),
      form: root.querySelector(".archon-chatbot-form"),
      input: root.querySelector(".archon-chatbot-input"),
      status: root.querySelector(".archon-chatbot-status"),
      gate: root.querySelector(".archon-chatbot-gate"),
      subtitle: root.querySelector(".archon-chatbot-subtitle")
    };
  }

  function bindUi() {
    ui.toggle.addEventListener("click", function () {
      toggleChat();
    });
    ui.close.addEventListener("click", function () {
      toggleChat(false);
    });
    ui.form.addEventListener("submit", submitInput);
    window.addEventListener("storage", hydrateForms);
  }

  function init() {
    const session = loadSession();
    state.occultMode = Boolean(session.occultMode);
    createUi();
    bindUi();
    hydrateForms();
    setOccultMode(state.occultMode);
    renderWelcome();
    checkApiAvailability();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
