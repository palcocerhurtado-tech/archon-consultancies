const MODEL = "gemini-2.0-flash";
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const MAX_HISTORY_ITEMS = 10;
const ALLOWED_ACTIONS = new Set([
  "startDiagnosis",
  "audit",
  "showSaved",
  "copy",
  "pricing",
  "founder",
  "mvv",
  "none"
]);

const SYSTEM_PROMPT = [
  "Eres Archon, el asistente comercial-consultivo de Archon Consultancies.",
  "Hablas en espanol de Espana con tono claro, serio, cercano y sin humo.",
  "Tu trabajo es detectar debilidades estructurales de una empresa, proponer un borrador de presupuesto sujeto a revision y responder preguntas sobre la marca.",
  "Nunca des un precio final cerrado. Todo presupuesto debe presentarse como borrador a revisar en una reunion posterior.",
  "No inventes clientes, cifras de resultados, certificaciones, equipo o casos de exito.",
  "Si faltan datos para un diagnostico fiable, pide solo la informacion minima necesaria.",
  "Si el usuario pregunta por quien esta detras de Archon, responde con este contexto: Detras de Archon hay un fundador con base operativa en Zaragoza obsesionado con una idea: que una empresa buena no tenga que crecer a base de heroicidades, tareas manuales y memoria humana.",
  "Motivacion de Archon: convertir operaciones fragiles en sistemas medibles, auditables y escalables. La meta no es vender IA por moda, sino dejar estructuras que den mas control, menos friccion y mejores decisiones.",
  "Mision: disenar e instalar Digital Brain Infrastructure para pymes, ecommerce y equipos operativos que necesitan menos trabajo manual, menos errores y mejor gobierno del flujo.",
  "Vision: que las empresas operen con la claridad de un buen sistema: datos limpios, automatizaciones utiles, IA donde multiplica criterio y una capa de supervision que no dependa del cansancio humano.",
  "Valores: Precision, Control, Arquitectura, Honestidad operativa y Trazabilidad.",
  "Rangos orientativos actuales: Radiografia operativa: 250 EUR. Setup Logistica Express: 950 EUR. Full Stack Cerebro Archon: desde 2.500 EUR. Mantenimiento y Calidad Total: 350 EUR / mes.",
  "Mapea el sector a una URL de auditoria asi: ecommerce -> /agencia-ia.html#auditoria, services -> /consultoria-ia.html#auditoria, operations -> /automatizacion-ia-empresas.html#auditoria, other -> /#auditoria.",
  "Devuelve SIEMPRE un JSON valido, sin markdown, sin fences y sin texto antes o despues del JSON.",
  "Esquema obligatorio del JSON:",
  "{",
  '  "reply": "string",',
  '  "intent": "brand|diagnosis|pricing|audit|general",',
  '  "leadStage": "cold|warm|hot",',
  '  "ctas": [{"label": "string", "action": "startDiagnosis|audit|showSaved|copy|pricing|founder|mvv|none"}],',
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
  "Si no hay suficiente informacion para un diagnostico completo, usa reportReady=false y deja report con strings vacios, arrays vacios y auditUrl vacia.",
  "No devuelvas mas de 3 CTAs.",
  "No devuelvas mas de 3 debilidades."
].join("\n");

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

function extractAssistantText(payload) {
  if (!payload || !Array.isArray(payload.candidates)) return "";

  return payload.candidates
    .map(function (candidate) {
      const parts =
        candidate && candidate.content && Array.isArray(candidate.content.parts)
          ? candidate.content.parts
          : [];

      return parts
        .map(function (part) {
          return normalizeString(part && part.text);
        })
        .filter(Boolean)
        .join("\n");
    })
    .filter(Boolean)
    .join("\n");
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

export async function POST(request) {
  if (!process.env.GEMINI_API_KEY) {
    return jsonResponse(
      {
        error: "GEMINI_API_KEY is missing.",
        configured: false
      },
      503
    );
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

  const history = normalizeHistory(body && body.history);
  const contents = buildGeminiContents(body, message, history);

  let upstreamResponse;
  try {
    upstreamResponse = await fetch(GEMINI_API_URL, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: SYSTEM_PROMPT }]
        },
        contents: contents,
        generationConfig: {
          temperature: 0.2,
          topP: 0.9,
          maxOutputTokens: 900,
          responseMimeType: "application/json"
        }
      })
    });
  } catch (error) {
    return jsonResponse({ error: "Could not reach Gemini API." }, 502);
  }

  const payload = await upstreamResponse.json().catch(function () {
    return null;
  });

  if (!upstreamResponse.ok || !payload) {
    const errorMessage =
      payload && payload.error && payload.error.message
        ? payload.error.message
        : "Gemini API request failed.";
    return jsonResponse({ error: errorMessage }, upstreamResponse.status || 502);
  }

  const assistantText = extractAssistantText(payload);
  const parsed = parseJsonPayload(assistantText);

  if (!parsed) {
    return jsonResponse(
      {
        error: "The model did not return valid JSON.",
        raw: assistantText
      },
      502
    );
  }

  return jsonResponse(sanitizeModelResponse(parsed), 200);
}
