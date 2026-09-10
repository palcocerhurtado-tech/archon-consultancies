const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

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

function clampList(value, limit) {
  return Array.isArray(value) ? value.slice(0, limit) : [];
}

function fallbackContent(params, reason) {
  const brief =
    normalizeString(params.brief) ||
    "Crear una pieza visual premium para Archon Studio con energia de diseno, marca y movimiento.";
  const format = normalizeString(params.format) || "instagram";
  const mode = normalizeString(params.mode) || "design";

  return {
    source: "fallback",
    fallbackReason: reason ? "ai_unavailable" : "",
    mode: mode,
    format: format,
    slides: [
      {
        kicker: "ARCHON STUDIO",
        headline: "Lienzo en blanco.",
        body: brief,
        footer: "Diseno, imagen y video."
      },
      {
        kicker: "CAPAS",
        headline: "Construye la pieza.",
        body: "Texto, formas, fondos, marcas, escenas y prompts visuales en un mismo espacio.",
        footer: "Control creativo."
      },
      {
        kicker: "SALIDA",
        headline: "Publica o prototipa.",
        body: "Exporta PNG, prepara copy y deja el guion visual listo para producir imagen o video.",
        footer: "Dos fuerzas. Una arquitectura."
      }
    ],
    instagram: `Archon Studio nace como un lienzo creativo para convertir ideas en piezas visuales listas para publicar.\n\n${brief}\n\nDiseno, imagen y video bajo una misma arquitectura.`,
    linkedin: `Archon Studio es un entorno de creacion visual para construir piezas de marca desde cero: capas, texto, composicion, prompts y storyboard.\n\nLa idea: vender primero el estudio, integrar despues generacion avanzada de imagen y video.`,
    hashtags: ["#ArchonStudio", "#Diseno", "#IA", "#MarketingEstrategico", "#Contenido"],
    imagePrompt: `Interfaz creativa premium tipo estudio de diseno, lienzo en blanco, capas, herramientas de imagen y video, estetica Archon, sobria y potente.`,
    videoPrompt: `Storyboard de 8 segundos para presentar Archon Studio: lienzo vacio, aparecen capas, texto, formas y una pieza final exportada.`,
    cta: "Crear una pieza nueva"
  };
}

function buildPrompt(params) {
  return [
    "Eres Archon Studio, un director creativo para un editor visual tipo Canva + Illustrator.",
    "Objetivo: convertir una idea libre en copy, slides, prompt visual y prompt de video.",
    "Trabaja desde lienzo en blanco y desde una idea libre del usuario.",
    "No prometas publicacion automatica ni generacion de imagen si no se pide.",
    "Tono: premium, claro, comercial, sin humo.",
    "Devuelve SOLO JSON valido con esta forma:",
    "{",
    '  "mode": "design|image|video|campaign",',
    '  "format": "instagram|story|linkedin|poster|video",',
    '  "slides": [{"kicker":"string","headline":"string","body":"string","footer":"string"}],',
    '  "instagram": "string",',
    '  "linkedin": "string",',
    '  "hashtags": ["string"],',
    '  "imagePrompt": "string",',
    '  "videoPrompt": "string",',
    '  "cta": "string"',
    "}",
    "Maximo 5 slides. Titulares cortos. Hazlo editable y accionable.",
    "Datos de entrada:",
    JSON.stringify(
      {
        brief: params.brief || "",
        mode: params.mode || "",
        format: params.format || ""
      },
      null,
      2
    )
  ].join("\n");
}

function parseJson(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (error) {
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(raw.slice(start, end + 1));
    } catch (nestedError) {
      return null;
    }
  }
}

function sanitizeGenerated(value, params) {
  const fallback = fallbackContent(params);
  const safe = value && typeof value === "object" ? value : {};
  const slides = clampList(safe.slides, 5)
    .map(function (slide) {
      return {
        kicker: normalizeString(slide && slide.kicker).slice(0, 42),
        headline: normalizeString(slide && slide.headline).slice(0, 86),
        body: normalizeString(slide && slide.body).slice(0, 260),
        footer: normalizeString(slide && slide.footer).slice(0, 64)
      };
    })
    .filter(function (slide) {
      return slide.headline || slide.body;
    });

  return {
    source: normalizeString(safe.source) || "ai",
    fallbackReason: normalizeString(safe.fallbackReason),
    mode: normalizeString(safe.mode) || fallback.mode,
    format: normalizeString(safe.format) || fallback.format,
    slides: slides.length ? slides : fallback.slides,
    instagram: normalizeString(safe.instagram) || fallback.instagram,
    linkedin: normalizeString(safe.linkedin) || fallback.linkedin,
    hashtags: clampList(safe.hashtags, 10)
      .map(normalizeString)
      .filter(Boolean)
      .map(function (tag) {
        return tag.startsWith("#") ? tag : `#${tag.replace(/\s+/g, "")}`;
      }),
    imagePrompt: normalizeString(safe.imagePrompt) || fallback.imagePrompt,
    videoPrompt: normalizeString(safe.videoPrompt) || fallback.videoPrompt,
    cta: normalizeString(safe.cta) || fallback.cta
  };
}

async function callGemini(params) {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackContent(params, "missing Gemini API key");
  }

  const response = await fetch(GEMINI_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-goog-api-key": process.env.GEMINI_API_KEY
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: buildPrompt(params) }] }],
      generationConfig: {
        temperature: 0.55,
        topP: 0.9,
        maxOutputTokens: 1800,
        responseMimeType: "application/json"
      }
    })
  });

  const payload = await response.json().catch(function () {
    return null;
  });

  if (!response.ok || !payload) {
    return fallbackContent(params, "Gemini request failed");
  }

  const raw =
    payload.candidates &&
    payload.candidates[0] &&
    payload.candidates[0].content &&
    payload.candidates[0].content.parts &&
    payload.candidates[0].content.parts[0]
      ? payload.candidates[0].content.parts[0].text
      : "";

  return sanitizeGenerated(parseJson(raw), params);
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
      model: "gemini-2.5-flash",
      connectedSources: []
    },
    200
  );
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (error) {
    return jsonResponse({ error: "Invalid JSON body." }, 400);
  }

  const params = {
    brief: normalizeString(body && body.brief).slice(0, 1400),
    mode: normalizeString(body && body.mode).slice(0, 40),
    format: normalizeString(body && body.format).slice(0, 40)
  };

  const generated = await callGemini(params);
  return jsonResponse({ ok: true, generated: sanitizeGenerated(generated, params) }, 200);
}
