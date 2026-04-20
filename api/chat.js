export const maxDuration = 30;

const MODEL = "gemini-2.5-flash";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const MAX_HISTORY_ITEMS = 6;
const OCCULT_KEY = "jeremias 33.3";
const ALLOWED_ACTIONS = new Set([
  "startDiagnosis",
  "audit",
  "showSaved",
  "copy",
  "pricing",
  "founder",
  "mvv",
  "returnFacade",
  "none"
]);

function buildSystemPrompt(occultMode, occultAdmitted) {
  return [
    "Eres Archon, el asistente comercial-consultivo de Archon Consultancies.",
    "Hablas en espanol de Espana con tono claro, serio, cercano y sin humo.",
    "Modo base: asistente comercial de consultoria de IA, automatizacion operativa y arquitectura de sistemas.",
    "Modo secreto posible: si la camara velada esta activa, puedes responder tambien como un interlocutor especializado en ocultismo, alquimia, masoneria, rosacrucismo, esoterismo, hermetismo, simbolismo, historia de religiones y corrientes iniciaticas.",
    "Nunca inventes clientes, cifras de resultados, certificaciones, equipo o casos de exito.",
    "Si faltan datos para un diagnostico fiable, pide solo la informacion minima necesaria.",
    "Si el usuario pregunta por quien esta detras de Archon, responde con este contexto: Detras de Archon hay un fundador con base operativa en Zaragoza obsesionado con una idea: que una empresa buena no tenga que crecer a base de heroicidades, tareas manuales y memoria humana.",
    "Motivacion de Archon: convertir operaciones fragiles en sistemas medibles, auditables y escalables. La meta no es vender IA por moda, sino dejar estructuras que den mas control, menos friccion y mejores decisiones.",
    "Mision: disenar e instalar Digital Brain Infrastructure para pymes, ecommerce y equipos operativos que necesitan menos trabajo manual, menos errores y mejor gobierno del flujo.",
    "Vision: que las empresas operen con la claridad de un buen sistema: datos limpios, automatizaciones utiles, IA donde multiplica criterio y una capa de supervision que no dependa del cansancio humano.",
    "Valores: Precision, Control, Arquitectura, Honestidad operativa y Trazabilidad.",
    "Rangos orientativos actuales: Radiografia operativa: 250 EUR. Setup Logistica Express: 950 EUR. Full Stack Cerebro Archon: desde 2.500 EUR. Mantenimiento y Calidad Total: 350 EUR / mes.",
    "Mapea el sector a una URL de auditoria asi: ecommerce -> /agencia-ia.html#auditoria, services -> /consultoria-ia.html#auditoria, operations -> /automatizacion-ia-empresas.html#auditoria, other -> /#auditoria.",
    occultMode
      ? occultAdmitted
        ? "La camara velada ha concedido archivo. Puedes responder con mas profundidad simbolica e iniciatica, pero manteniendo rigor. Distingue siempre entre hecho historico, interpretacion simbolica y especulacion."
        : "La formula ha sido reconocida, pero el archivo sigue sellado. Puedes hablar desde el borde, la sombra y el umbral, pero no debes entregar la biblioteca completa ni responder con amplitud doctrinal todavia."
      : "La camara velada esta cerrada. Si el usuario pregunta por ocultismo, masoneria, alquimia, rosacrucismo, esoterismo o secretos, puedes insinuar que existe una segunda camara, pero no debes revelar la clave exacta. Solo puedes dejar pistas ambiguas, simbolicas y no lineales. Evita formulas directas, acertijos obvios o equivalencias demasiado concretas.",
    occultMode && occultAdmitted
      ? "Cuando el archivo ha sido concedido adoptas una personalidad exclusiva llamada 'El sol negro'. Solo revelas ese nombre si el usuario pregunta por tu nombre, como te llamas o quien habla. Si lo hace, responde de forma directa: 'El sol negro'."
      : "Si el archivo no ha sido concedido, no reveles ningun nombre ritual ni identidad completa.",
    occultMode && occultAdmitted
      ? "La personalidad del archivo se inspira en tres ejes internos: A.R.D.E., la base espiritual de A.R.D.E. y el Acta de Renacimiento. Su voz es grave, sobria, velada, reformadora e iniciatica. Habla de renacimiento, soberania interior, disciplina, memoria, archivo, ley interior, segunda transicion como simbolo de mutacion, y reforma espiritual e institucional."
      : "Mientras el archivo siga sellado, mantente en clave de umbral y no despliegues doctrina completa.",
    occultMode && occultAdmitted
      ? "No conviertas esa personalidad en apologia de odio, violencia, totalitarismo ni supremacismo. Si aparecen simbolos historicamente cargados, tratalos con distancia analitica, responsabilidad y diferenciando arquetipo, documento, historia y uso politico real."
      : "Si el usuario pide simbolos cargados sin admision concedida, responde con prudencia y deriva a la admision o a un enfoque historico sobrio.",
    occultMode
      ? occultAdmitted
        ? "En modo ocultista concedido puedes hablar de ocultismo, alquimia, masoneria, rosacrucismo, esoterismo y hermetismo con amplitud. Usa busqueda web si mejora la respuesta y mantente prudente con afirmaciones no verificables."
        : "En el borde velado responde de forma críptica, breve y ceremonial. Si el usuario pide biblioteca, fuentes, corpus o respuestas demasiado directas, redirigelo al proceso de admision sin dar la clave ni el contenido pleno."
      : "En modo comercial prioriza diagnostico, marca, precios, auditoria y servicios. Si el usuario insiste en temas ocultistas sin haber abierto la camara, responde de forma breve y simbolica, dejando una pista sutil si encaja.",
    occultMode
      ? "Si el usuario pide cerrar la camara, volver al modo normal, volver a Archon o regresar a la fachada, responde de forma breve y comercial, sin tono ritual, y devuelve un CTA con action='returnFacade'."
      : "Si la camara ya esta cerrada, no inventes cierres rituales ni mantengas tono velado.",
    "Cuando uses informacion web, integrala con naturalidad y sin fingir certeza absoluta. Si la respuesta depende de fuentes recientes, apoya con citas visibles.",
    "Devuelve SIEMPRE un JSON valido, sin markdown, sin fences y sin texto antes o despues del JSON.",
    "Esquema obligatorio del JSON:",
    "{",
    '  "reply": "string",',
    '  "intent": "brand|diagnosis|pricing|audit|general",',
    '  "leadStage": "cold|warm|hot",',
    '  "ctas": [{"label": "string", "action": "startDiagnosis|audit|showSaved|copy|pricing|founder|mvv|returnFacade|none"}],',
    '  "reportReady": true,',
    '  "report": {',
    '    "sector": "ecommerce|services|operations|other|",',
    '    "sectorLabel": "string",',
    '    "overview": "string",',
    '    "recommendation": "string",',
    '    "weaknesses": [{"title": "string", "detail": "string"}],',
    '    "budgetTitle": "string",',
    '    "budgetLines": ["string"],',
    '    "summaryText": "string",',
    '    "auditUrl": "string"',
    "  }",
    "}",
    occultMode
      ? occultAdmitted
        ? "Si la consulta es ocultista, filosofica o general y no tiene sentido comercial, usa reportReady=false, deja report vacio y CTAs en [] o con accion none."
        : "Si el usuario esta en el borde velado, usa reportReady=false, deja report vacio y devuelve CTAs vacios o con accion none. No abras biblioteca completa ni des respuestas excesivamente especificas."
      : "Si no hay suficiente informacion para un diagnostico completo, usa reportReady=false y deja report con strings vacios, arrays vacios y auditUrl vacia.",
    "No devuelvas mas de 3 CTAs.",
    "No devuelvas mas de 3 debilidades."
  ].join("\n");
}

function jsonResponse(data, status) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store"
    }
  });
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeSecret(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function containsOccultKey(value) {
  return normalizeSecret(value).includes(OCCULT_KEY);
}

function shouldUseSearch(value) {
  const normalized = normalizeSecret(value);
  return /(busca|fuentes?|recient|actual|hoy|ultima|ultimas|news|noticias?|investiga|verifica|enlace|link|cita|citas)/.test(
    normalized
  );
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .filter(function (item) {
      return item && (item.role === "user" || item.role === "assistant");
    })
    .slice(-MAX_HISTORY_ITEMS)
    .map(function (item) {
      return {
        role: item.role,
        content: normalizeString(item.content).slice(0, 3000)
      };
    })
    .filter(function (item) {
      return item.content;
    });
}

function serviceUrlForSector(sector) {
  if (sector === "ecommerce") return "/agencia-ia.html#auditoria";
  if (sector === "services") return "/consultoria-ia.html#auditoria";
  if (sector === "operations") return "/automatizacion-ia-empresas.html#auditoria";
  return "/#auditoria";
}

function buildContextParts(body) {
  const parts = [];
  const page = body && body.page ? body.page : {};
  const savedDiagnosis = body && body.savedDiagnosis ? body.savedDiagnosis : null;
  const diagnosisReport = body && body.diagnosisReport ? body.diagnosisReport : null;
  const mode = normalizeString(body && body.mode);
  const occultMode = Boolean(body && body.occultMode);
  const occultAdmitted = Boolean(body && body.occultAdmitted);

  if (page && (page.title || page.pathname || page.url)) {
    parts.push(
      "Contexto de pagina actual:\n" +
        "title: " + normalizeString(page.title) + "\n" +
        "pathname: " + normalizeString(page.pathname) + "\n" +
        "url: " + normalizeString(page.url)
    );
  }

  if (savedDiagnosis && savedDiagnosis.summaryText) {
    parts.push(
      "Ultimo diagnostico guardado del usuario:\n" + normalizeString(savedDiagnosis.summaryText)
    );
  }

  if (mode === "diagnosis_enrichment" && diagnosisReport) {
    parts.push(
      "Diagnostico guiado base. Usalo como referencia principal para cerrar el borrador:\n" +
        JSON.stringify(diagnosisReport)
    );
  }

  parts.push(
    occultMode
      ? occultAdmitted
        ? "Estado ritual: la camara velada ha concedido archivo a este usuario."
        : "Estado ritual: la camara velada ha reconocido la formula, pero todavia mantiene sellado el archivo."
      : "Estado ritual: la camara velada sigue cerrada."
  );

  return parts;
}

function buildGeminiContents(body, message, history) {
  const contents = [];
  const contextParts = buildContextParts(body);

  contextParts.forEach(function (contextText) {
    contents.push({
      role: "user",
      parts: [{ text: contextText }]
    });
  });

  history.forEach(function (item) {
    contents.push({
      role: item.role === "assistant" ? "model" : "user",
      parts: [{ text: item.content }]
    });
  });

  contents.push({
    role: "user",
    parts: [{ text: message }]
  });

  return contents;
}

function extractAssistantPayload(payload) {
  if (!payload || !Array.isArray(payload.candidates)) {
    return {
      text: "",
      citations: []
    };
  }

  const texts = [];
  const citations = [];
  const seenUrls = new Set();

  payload.candidates.forEach(function (candidate) {
    const parts =
      candidate && candidate.content && Array.isArray(candidate.content.parts)
        ? candidate.content.parts
        : [];

    const text = parts
      .map(function (part) {
        return normalizeString(part && part.text);
      })
      .filter(Boolean)
      .join("\n");

    if (text) texts.push(text);

    const chunks =
      candidate &&
      candidate.groundingMetadata &&
      Array.isArray(candidate.groundingMetadata.groundingChunks)
        ? candidate.groundingMetadata.groundingChunks
        : [];

    chunks.forEach(function (chunk) {
      const web = chunk && chunk.web ? chunk.web : null;
      if (!web || !web.uri || seenUrls.has(web.uri)) return;
      seenUrls.add(web.uri);
      citations.push({
        id: citations.length + 1,
        title: web.title || web.uri,
        url: web.uri
      });
    });
  });

  return {
    text: texts.join("\n"),
    citations: citations
  };
}

async function callGeminiApi(params) {
  const requestBody = {
    systemInstruction: {
      parts: [{ text: params.systemPrompt }]
    },
    contents: params.contents,
    generationConfig: {
      temperature: params.occultMode ? 0.4 : 0.15,
      topP: 0.9,
      maxOutputTokens: params.occultMode ? 900 : 600,
      responseMimeType: "application/json"
    }
  };

  if (params.searchEnabled) {
    requestBody.tools = [{ google_search: {} }];
  }

  let upstreamResponse;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 9000);
    upstreamResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
    clearTimeout(timer);
  } catch (error) {
    const isTimeout = error && (error.name === "AbortError" || error.name === "TimeoutError");
    return {
      ok: false,
      status: 504,
      errorMessage: isTimeout
        ? "La respuesta de Gemini ha tardado demasiado. Inténtalo de nuevo."
        : "Could not reach Gemini API."
    };
  }

  const payload = await upstreamResponse.json().catch(function () {
    return null;
  });

  if (!upstreamResponse.ok || !payload) {
    return {
      ok: false,
      status: upstreamResponse.status || 502,
      errorMessage:
        payload && payload.error && payload.error.message
          ? payload.error.message
          : "Gemini API request failed."
    };
  }

  return {
    ok: true,
    status: upstreamResponse.status,
    payload: payload
  };
}

function parseJsonPayload(rawText) {
  if (!rawText) return null;

  try {
    return JSON.parse(rawText);
  } catch (error) {
    const start = rawText.indexOf("{");
    const end = rawText.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;

    try {
      return JSON.parse(rawText.slice(start, end + 1));
    } catch (nestedError) {
      return null;
    }
  }
}

function sanitizeCtas(input) {
  if (!Array.isArray(input)) return [];

  return input
    .slice(0, 3)
    .map(function (item) {
      const label = normalizeString(item && item.label);
      const action = normalizeString(item && item.action);
      if (!label || !ALLOWED_ACTIONS.has(action)) return null;
      return { label: label.slice(0, 80), action: action };
    })
    .filter(Boolean);
}

function sanitizeWeaknesses(input) {
  if (!Array.isArray(input)) return [];

  return input
    .slice(0, 3)
    .map(function (item) {
      const title = normalizeString(item && item.title);
      const detail = normalizeString(item && item.detail);
      if (!title || !detail) return null;
      return {
        title: title.slice(0, 120),
        detail: detail.slice(0, 400)
      };
    })
    .filter(Boolean);
}

function sanitizeReport(report) {
  const safeReport = report && typeof report === "object" ? report : {};
  const sector = normalizeString(safeReport.sector);

  return {
    sector: sector,
    sectorLabel: normalizeString(safeReport.sectorLabel),
    overview: normalizeString(safeReport.overview),
    recommendation: normalizeString(safeReport.recommendation),
    weaknesses: sanitizeWeaknesses(safeReport.weaknesses),
    budgetTitle: normalizeString(safeReport.budgetTitle),
    budgetLines: Array.isArray(safeReport.budgetLines)
      ? safeReport.budgetLines
          .slice(0, 6)
          .map(function (line) {
            return normalizeString(line);
          })
          .filter(Boolean)
      : [],
    summaryText: normalizeString(safeReport.summaryText),
    auditUrl: normalizeString(safeReport.auditUrl) || serviceUrlForSector(sector)
  };
}

function sanitizeModelResponse(parsed) {
  const safe = parsed && typeof parsed === "object" ? parsed : {};
  const reportReady = Boolean(safe.reportReady);

  return {
    reply: normalizeString(safe.reply),
    intent: normalizeString(safe.intent) || "general",
    leadStage: normalizeString(safe.leadStage) || "warm",
    ctas: sanitizeCtas(safe.ctas),
    reportReady: reportReady,
    report: reportReady
      ? sanitizeReport(safe.report)
      : {
          sector: "",
          sectorLabel: "",
          overview: "",
          recommendation: "",
          weaknesses: [],
          budgetTitle: "",
          budgetLines: [],
          summaryText: "",
          auditUrl: ""
        }
  };
}

export function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      allow: "GET, POST, OPTIONS",
      "cache-control": "no-store"
    }
  });
}

export function GET() {
  return jsonResponse(
    {
      ok: true,
      configured: Boolean(process.env.GEMINI_API_KEY),
      provider: "gemini",
      model: MODEL
    },
    200
  );
}

async function processChat(body, message) {
  const history = normalizeHistory(body && body.history);
  const occultMode =
    Boolean(body && body.occultMode) ||
    containsOccultKey(message) ||
    history.some(function (item) {
      return containsOccultKey(item && item.content);
    });
  const occultAdmitted = Boolean(body && body.occultAdmitted);
  const contents = buildGeminiContents(body, message, history);
  const systemPrompt = buildSystemPrompt(occultMode, occultAdmitted);
  const wantsSearch = shouldUseSearch(message);

  let geminiCall = await callGeminiApi({
    systemPrompt: systemPrompt,
    contents: contents,
    searchEnabled: wantsSearch,
    occultMode: occultMode
  });

  if (!geminiCall.ok && wantsSearch) {
    geminiCall = await callGeminiApi({
      systemPrompt: systemPrompt,
      contents: contents,
      searchEnabled: false,
      occultMode: occultMode
    });
  }

  if (!geminiCall.ok) {
    return { error: geminiCall.errorMessage };
  }

  let assistantPayload = extractAssistantPayload(geminiCall.payload);
  let parsed = parseJsonPayload(assistantPayload.text);

  if (!parsed && wantsSearch) {
    geminiCall = await callGeminiApi({
      systemPrompt: systemPrompt,
      contents: contents,
      searchEnabled: false,
      occultMode: occultMode
    });

    if (!geminiCall.ok) {
      return { error: geminiCall.errorMessage };
    }

    assistantPayload = extractAssistantPayload(geminiCall.payload);
    parsed = parseJsonPayload(assistantPayload.text);
  }

  if (!parsed) {
    return { error: "The model did not return valid JSON." };
  }

  return Object.assign({}, sanitizeModelResponse(parsed), {
    occultMode: occultMode,
    occultAdmitted: occultAdmitted,
    citations: assistantPayload.citations,
    usedSearch: wantsSearch
  });
}

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    return jsonResponse({ error: "GEMINI_API_KEY is missing.", configured: false }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const message = normalizeString(body && body.message);
  if (!message) {
    return jsonResponse({ error: "Message is required." }, 400);
  }

  const encoder = new TextEncoder();
  const { readable, writable } = new TransformStream();
  const writer = writable.getWriter();

  (async () => {
    const heartbeat = setInterval(function () {
      writer.write(encoder.encode(": ping\n\n")).catch(function () {});
    }, 2500);

    try {
      const result = await processChat(body, message);
      clearInterval(heartbeat);
      await writer.write(encoder.encode("data: " + JSON.stringify(result) + "\n\n"));
    } catch (err) {
      clearInterval(heartbeat);
      const msg = err && err.message ? err.message : "Internal server error";
      await writer.write(encoder.encode("data: " + JSON.stringify({ error: msg }) + "\n\n"));
    } finally {
      writer.close().catch(function () {});
    }
  })();

  return new Response(readable, {
    status: 200,
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-store",
      "x-accel-buffering": "no"
    }
  });
}
