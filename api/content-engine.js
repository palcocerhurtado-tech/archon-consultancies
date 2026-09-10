const GITHUB_USER = "palcocerhurtado-tech";
const GITHUB_API = "https://api.github.com";
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

function repoSummary(repo) {
  return {
    name: repo.name,
    description: repo.description || "",
    language: repo.language || "",
    htmlUrl: repo.html_url,
    topics: Array.isArray(repo.topics) ? repo.topics.slice(0, 8) : [],
    updatedAt: repo.updated_at || "",
    stars: repo.stargazers_count || 0
  };
}

async function fetchRepos() {
  let response;
  try {
    response = await fetch(
      `${GITHUB_API}/users/${GITHUB_USER}/repos?per_page=100&sort=updated`,
      {
        headers: {
          accept: "application/vnd.github+json",
          "user-agent": "archon-content-engine"
        }
      }
    );
  } catch (error) {
    return [];
  }

  if (!response.ok) return [];

  const repos = await response.json();
  return Array.isArray(repos)
    ? repos
        .filter(function (repo) {
          return !repo.fork;
        })
        .map(repoSummary)
        .slice(0, 30)
    : [];
}

function fallbackContent(params) {
  const repoName = normalizeString(params.repo && params.repo.name) || "un sistema Archon";
  const description =
    normalizeString(params.repo && params.repo.description) ||
    normalizeString(params.brief) ||
    "una pieza construida para convertir trabajo tecnico en comunicacion clara";
  const language = normalizeString(params.repo && params.repo.language) || "sistema";
  const angle = normalizeString(params.angle) || "autoridad";

  return {
    source: "fallback",
    repoName: repoName,
    angle: angle,
    format: normalizeString(params.format) || "instagram",
    slides: [
      {
        kicker: "ARCHON STUDIO",
        headline: repoName,
        body: "Un proyecto real convertido en una pieza de comunicacion lista para redes.",
        footer: "Archon Consultancies"
      },
      {
        kicker: "INTELLIGENCE",
        headline: "Del trabajo tecnico al sistema.",
        body: `${description} Tecnologia base: ${language}.`,
        footer: "Dentro: datos, estructura y control."
      },
      {
        kicker: "ATELIER",
        headline: "Del sistema a la narrativa.",
        body: "La pieza se transforma en contenido publicable, medible y conectado con ventas.",
        footer: "Fuera: expresion, posicionamiento y crecimiento."
      }
    ],
    instagram: `Estoy convirtiendo proyectos reales en contenido que explica como trabaja Archon.\n\nHoy: ${repoName}.\n\nLa idea no es publicar por publicar. Es transformar construccion tecnica en una narrativa que una empresa pueda entender, medir y usar.\n\nDos fuerzas. Una arquitectura.`,
    linkedin: `Una empresa no necesita mas contenido. Necesita que su trabajo real se pueda explicar mejor.\n\n${repoName} sirve como ejemplo: ${description}\n\nArchon Studio convierte repositorios, sistemas e ideas en piezas de comunicacion para redes, manteniendo trazabilidad entre lo que se construye dentro y lo que se expresa fuera.`,
    hashtags: ["#ArchonConsultancies", "#Automatizacion", "#IA", "#MarketingEstrategico", "#GitHub"],
    imagePrompt: `Visual editorial sobrio para ${repoName}: interfaz tecnica, capas de diseno, energia agua y fuego, marca premium, sin texto pequeno.`,
    cta: "Quieres convertir tus sistemas en contenido que venda? Habla con Archon."
  };
}

function buildPrompt(params) {
  return [
    "Eres Archon Studio, un motor editorial de Archon Consultancies.",
    "Objetivo: convertir trabajo tecnico real en contenido comercial para Instagram, LinkedIn y carruseles.",
    "No inventes resultados, clientes, metricas auditadas ni promesas.",
    "Usa el principio conceptual: Dos fuerzas. Una arquitectura.",
    "Intelligence = dentro, infraestructura, datos, automatizacion, control, agua.",
    "Atelier = fuera, expresion, posicionamiento, comunicacion, crecimiento, fuego.",
    "Devuelve SOLO JSON valido con esta forma:",
    "{",
    '  "repoName": "string",',
    '  "angle": "autoridad|demo|producto|aprendizaje",',
    '  "format": "instagram|linkedin|carousel",',
    '  "slides": [{"kicker":"string","headline":"string","body":"string","footer":"string"}],',
    '  "instagram": "string",',
    '  "linkedin": "string",',
    '  "hashtags": ["string"],',
    '  "imagePrompt": "string",',
    '  "cta": "string"',
    "}",
    "Maximo 5 slides. Titulares cortos. Texto util, comercial y sin humo.",
    "Datos de entrada:",
    JSON.stringify(
      {
        repo: params.repo || null,
        brief: params.brief || "",
        angle: params.angle || "",
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
        body: normalizeString(slide && slide.body).slice(0, 240),
        footer: normalizeString(slide && slide.footer).slice(0, 64)
      };
    })
    .filter(function (slide) {
      return slide.headline || slide.body;
    });

  return {
    source: safe.source || "ai",
    repoName: normalizeString(safe.repoName) || fallback.repoName,
    angle: normalizeString(safe.angle) || fallback.angle,
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
    cta: normalizeString(safe.cta) || fallback.cta
  };
}

async function callGemini(params) {
  if (!process.env.GEMINI_API_KEY) {
    return fallbackContent(params);
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
        temperature: 0.45,
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
    return fallbackContent(params);
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

export async function GET() {
  const repos = await fetchRepos();
  return jsonResponse(
    {
      ok: true,
      user: GITHUB_USER,
      repos: repos
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
    repo: body && body.repo && typeof body.repo === "object" ? body.repo : null,
    brief: normalizeString(body && body.brief).slice(0, 1000),
    angle: normalizeString(body && body.angle).slice(0, 40),
    format: normalizeString(body && body.format).slice(0, 40)
  };

  const generated = await callGemini(params);
  return jsonResponse({ ok: true, generated: sanitizeGenerated(generated, params) }, 200);
}
