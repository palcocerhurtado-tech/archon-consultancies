(function () {
  const API_ENDPOINT = "/api/content-engine";
  const state = {
    repos: [],
    generated: null,
    slideIndex: 0,
    theme: "archon",
    size: "square"
  };

  const el = {
    repoSelect: document.getElementById("repoSelect"),
    briefInput: document.getElementById("briefInput"),
    formatSelect: document.getElementById("formatSelect"),
    angleSelect: document.getElementById("angleSelect"),
    generateBtn: document.getElementById("generateBtn"),
    sourceStatus: document.getElementById("sourceStatus"),
    slideTabs: document.getElementById("slideTabs"),
    canvas: document.getElementById("studioCanvas"),
    kickerInput: document.getElementById("kickerInput"),
    headlineInput: document.getElementById("headlineInput"),
    bodyInput: document.getElementById("bodyInput"),
    footerInput: document.getElementById("footerInput"),
    themeSelect: document.getElementById("themeSelect"),
    sizeSelect: document.getElementById("sizeSelect"),
    postOutput: document.getElementById("postOutput"),
    promptOutput: document.getElementById("promptOutput"),
    copyPostBtn: document.getElementById("copyPostBtn"),
    downloadBtn: document.getElementById("downloadBtn")
  };

  const themes = {
    archon: { bg: "#F4F1EC", panel: "#FFFFFF", text: "#0B0B0B", muted: "#4A4A4A", accent: "#A8884B", line: "rgba(11,11,11,0.18)" },
    water: { bg: "#ECF5F4", panel: "#FFFFFF", text: "#09252A", muted: "#416268", accent: "#276872", line: "rgba(39,104,114,0.22)" },
    fire: { bg: "#F8EFEC", panel: "#FFFFFF", text: "#2A0E09", muted: "#70483F", accent: "#B74837", line: "rgba(183,72,55,0.22)" },
    mono: { bg: "#0B0B0B", panel: "#171717", text: "#F4F1EC", muted: "#B8B2A8", accent: "#A8884B", line: "rgba(244,241,236,0.22)" }
  };

  const sizes = {
    square: [1080, 1080],
    story: [1080, 1920],
    linkedin: [1200, 627]
  };

  function selectedRepo() {
    return state.repos.find(function (repo) {
      return repo.name === el.repoSelect.value;
    }) || state.repos[0] || null;
  }

  function fallbackGenerated(repo) {
    const name = repo && repo.name ? repo.name : "Archon Studio";
    const description = repo && repo.description ? repo.description : "un sistema construido para unir tecnologia, comunicacion y venta";
    return {
      repoName: name,
      angle: "autoridad",
      format: "instagram",
      slides: [
        {
          kicker: "ARCHON STUDIO",
          headline: name,
          body: "Trabajo real convertido en una pieza visual lista para publicar.",
          footer: "Dos fuerzas. Una arquitectura."
        },
        {
          kicker: "INTELLIGENCE",
          headline: "Primero sistema.",
          body: description,
          footer: "Datos, automatizacion y control."
        },
        {
          kicker: "ATELIER",
          headline: "Despues narrativa.",
          body: "La misma construccion se transforma en posicionamiento, contenido y crecimiento.",
          footer: "Expresion, comunicacion y movimiento."
        }
      ],
      instagram: `Proyecto: ${name}\n\n${description}\n\nDos fuerzas. Una arquitectura.`,
      linkedin: `Archon Studio convierte trabajo real en contenido publicable.\n\nHoy: ${name}.\n\n${description}`,
      hashtags: ["#ArchonConsultancies", "#IA", "#Automatizacion", "#MarketingEstrategico"],
      imagePrompt: `Pieza editorial premium sobre ${name}, interfaz de diseno, capas, tecnologia y marca Archon.`,
      cta: "Hablar con Archon"
    };
  }

  function setStatus(message) {
    if (el.sourceStatus) el.sourceStatus.textContent = message;
  }

  function setCanvasSize() {
    const size = sizes[state.size] || sizes.square;
    el.canvas.width = size[0];
    el.canvas.height = size[1];
  }

  function wrapText(ctx, text, maxWidth) {
    const words = String(text || "").split(/\s+/).filter(Boolean);
    const lines = [];
    let line = "";
    words.forEach(function (word) {
      const next = line ? `${line} ${word}` : word;
      if (ctx.measureText(next).width <= maxWidth || !line) {
        line = next;
      } else {
        lines.push(line);
        line = word;
      }
    });
    if (line) lines.push(line);
    return lines;
  }

  function drawTextBlock(ctx, lines, x, y, lineHeight, maxLines) {
    lines.slice(0, maxLines).forEach(function (line, index) {
      ctx.fillText(line, x, y + index * lineHeight);
    });
    return y + Math.min(lines.length, maxLines) * lineHeight;
  }

  function currentSlide() {
    const slides = state.generated && Array.isArray(state.generated.slides) ? state.generated.slides : [];
    return slides[state.slideIndex] || slides[0] || fallbackGenerated(selectedRepo()).slides[0];
  }

  function drawCanvas() {
    setCanvasSize();
    const ctx = el.canvas.getContext("2d");
    const theme = themes[state.theme] || themes.archon;
    const width = el.canvas.width;
    const height = el.canvas.height;
    const slide = currentSlide();
    const margin = Math.max(70, Math.round(width * 0.075));
    const usableWidth = width - margin * 2;
    const headlineSize = Math.max(54, Math.round(width * 0.072));
    const bodySize = Math.max(28, Math.round(width * 0.031));
    const kickerSize = Math.max(19, Math.round(width * 0.018));

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = theme.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = theme.panel;
    ctx.fillRect(margin * 0.7, margin * 0.7, width - margin * 1.4, height - margin * 1.4);

    ctx.strokeStyle = theme.line;
    ctx.lineWidth = 3;
    ctx.strokeRect(margin * 0.7, margin * 0.7, width - margin * 1.4, height - margin * 1.4);

    ctx.fillStyle = theme.accent;
    ctx.fillRect(margin, margin, Math.max(130, width * 0.18), 8);
    ctx.fillRect(width - margin - 8, margin, 8, Math.max(130, height * 0.16));

    ctx.save();
    ctx.globalAlpha = 0.06;
    ctx.strokeStyle = theme.accent;
    ctx.lineWidth = Math.max(28, width * 0.04);
    ctx.beginPath();
    ctx.arc(width * 0.78, height * 0.24, width * 0.2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = theme.accent;
    ctx.font = `700 ${kickerSize}px "IBM Plex Mono", monospace`;
    ctx.textBaseline = "top";
    ctx.fillText(String(slide.kicker || "ARCHON STUDIO").toUpperCase(), margin, margin + 38);

    ctx.fillStyle = theme.text;
    ctx.font = `800 ${headlineSize}px Inter, Arial, sans-serif`;
    const headlineLines = wrapText(ctx, slide.headline || "", usableWidth);
    let y = margin + 105;
    y = drawTextBlock(ctx, headlineLines, margin, y, headlineSize * 1.06, state.size === "linkedin" ? 3 : 4);

    ctx.fillStyle = theme.muted;
    ctx.font = `400 ${bodySize}px Inter, Arial, sans-serif`;
    const bodyLines = wrapText(ctx, slide.body || "", usableWidth);
    y += Math.max(36, height * 0.04);
    drawTextBlock(ctx, bodyLines, margin, y, bodySize * 1.45, state.size === "story" ? 7 : 5);

    ctx.fillStyle = theme.text;
    ctx.font = `700 ${Math.max(20, Math.round(width * 0.022))}px "IBM Plex Mono", monospace`;
    ctx.fillText(slide.footer || "Archon Consultancies", margin, height - margin - 36);

    ctx.fillStyle = theme.accent;
    ctx.fillText("ARCHON", width - margin - 136, height - margin - 36);
  }

  function renderTabs() {
    const slides = state.generated && Array.isArray(state.generated.slides) ? state.generated.slides : [];
    el.slideTabs.innerHTML = "";
    slides.forEach(function (_, index) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = `Slide ${index + 1}`;
      button.className = index === state.slideIndex ? "is-active" : "";
      button.addEventListener("click", function () {
        state.slideIndex = index;
        syncInputsFromSlide();
        renderTabs();
        drawCanvas();
      });
      el.slideTabs.appendChild(button);
    });
  }

  function syncInputsFromSlide() {
    const slide = currentSlide();
    el.kickerInput.value = slide.kicker || "";
    el.headlineInput.value = slide.headline || "";
    el.bodyInput.value = slide.body || "";
    el.footerInput.value = slide.footer || "";
    el.postOutput.value = state.generated ? `${state.generated.instagram || ""}\n\n${(state.generated.hashtags || []).join(" ")}`.trim() : "";
    el.promptOutput.value = state.generated ? state.generated.imagePrompt || "" : "";
  }

  function syncSlideFromInputs() {
    if (!state.generated || !Array.isArray(state.generated.slides)) return;
    const slide = state.generated.slides[state.slideIndex];
    if (!slide) return;
    slide.kicker = el.kickerInput.value;
    slide.headline = el.headlineInput.value;
    slide.body = el.bodyInput.value;
    slide.footer = el.footerInput.value;
    drawCanvas();
  }

  function applyGenerated(generated) {
    state.generated = generated || fallbackGenerated(selectedRepo());
    state.slideIndex = 0;
    renderTabs();
    syncInputsFromSlide();
    drawCanvas();
  }

  async function loadRepos() {
    try {
      const response = await fetch(API_ENDPOINT);
      const payload = await response.json();
      state.repos = payload.repos || [];
    } catch (error) {
      state.repos = [];
    }

    if (!state.repos.length) {
      state.repos = [
        {
          name: "archon-consultancies",
          description: "Web, marca y sistema comercial de Archon Consultancies.",
          language: "HTML",
          htmlUrl: "https://github.com/palcocerhurtado-tech/archon-consultancies"
        }
      ];
      setStatus("No se pudieron cargar repos ahora. Uso un ejemplo local.");
    } else {
      setStatus(`${state.repos.length} repos publicos cargados desde GitHub.`);
    }

    el.repoSelect.innerHTML = "";
    state.repos.forEach(function (repo) {
      const option = document.createElement("option");
      option.value = repo.name;
      option.textContent = repo.name;
      el.repoSelect.appendChild(option);
    });
    applyGenerated(fallbackGenerated(selectedRepo()));
  }

  async function generateContent() {
    const repo = selectedRepo();
    el.generateBtn.disabled = true;
    setStatus("Generando pieza con Archon Studio...");
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          repo: repo,
          brief: el.briefInput.value,
          format: el.formatSelect.value,
          angle: el.angleSelect.value
        })
      });
      const payload = await response.json();
      applyGenerated(payload.generated || fallbackGenerated(repo));
      setStatus("Pieza generada. Puedes editar capas, copiar copy o exportar PNG.");
    } catch (error) {
      applyGenerated(fallbackGenerated(repo));
      setStatus("No se pudo llamar a la IA. He dejado un borrador editable.");
    } finally {
      el.generateBtn.disabled = false;
    }
  }

  async function copyPost() {
    const text = el.postOutput.value || "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setStatus("Copy copiado al portapapeles.");
    } catch (error) {
      el.postOutput.select();
      setStatus("Selecciona el copy y copialo manualmente.");
    }
  }

  function downloadPng() {
    drawCanvas();
    const link = document.createElement("a");
    const repo = selectedRepo();
    link.download = `archon-studio-${repo ? repo.name : "pieza"}-${state.slideIndex + 1}.png`;
    link.href = el.canvas.toDataURL("image/png");
    link.click();
    setStatus("PNG exportado.");
  }

  [el.kickerInput, el.headlineInput, el.bodyInput, el.footerInput].forEach(function (input) {
    input.addEventListener("input", syncSlideFromInputs);
  });

  el.themeSelect.addEventListener("change", function () {
    state.theme = el.themeSelect.value;
    drawCanvas();
  });

  el.sizeSelect.addEventListener("change", function () {
    state.size = el.sizeSelect.value;
    drawCanvas();
  });

  el.repoSelect.addEventListener("change", function () {
    applyGenerated(fallbackGenerated(selectedRepo()));
  });

  el.generateBtn.addEventListener("click", generateContent);
  el.copyPostBtn.addEventListener("click", copyPost);
  el.downloadBtn.addEventListener("click", downloadPng);

  loadRepos();
})();
