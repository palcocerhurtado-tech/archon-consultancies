(function () {
  const API_ENDPOINT = "/api/content-engine";

  const state = {
    generated: null,
    slideIndex: 0,
    theme: "archon",
    size: "square",
    template: "blank",
    background: "#F4F1EC",
    intensity: 58,
    layers: []
  };

  const el = {
    briefInput: document.getElementById("briefInput"),
    formatSelect: document.getElementById("formatSelect"),
    modeSelect: document.getElementById("modeSelect"),
    generateBtn: document.getElementById("generateBtn"),
    blankBtn: document.getElementById("blankBtn"),
    sourceStatus: document.getElementById("sourceStatus"),
    slideTabs: document.getElementById("slideTabs"),
    canvas: document.getElementById("studioCanvas"),
    templateSelect: document.getElementById("templateSelect"),
    kickerInput: document.getElementById("kickerInput"),
    headlineInput: document.getElementById("headlineInput"),
    bodyInput: document.getElementById("bodyInput"),
    footerInput: document.getElementById("footerInput"),
    themeSelect: document.getElementById("themeSelect"),
    backgroundInput: document.getElementById("backgroundInput"),
    sizeSelect: document.getElementById("sizeSelect"),
    intensityInput: document.getElementById("intensityInput"),
    postOutput: document.getElementById("postOutput"),
    promptOutput: document.getElementById("promptOutput"),
    videoOutput: document.getElementById("videoOutput"),
    copyPostBtn: document.getElementById("copyPostBtn"),
    copyPromptBtn: document.getElementById("copyPromptBtn"),
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

  function defaultGenerated() {
    return {
      mode: "design",
      format: "instagram",
      slides: [
        {
          kicker: "ARCHON STUDIO",
          headline: "Lienzo en blanco.",
          body: "Diseña piezas de imagen, video y marca sin conectar cuentas externas.",
          footer: "Creative Canvas"
        }
      ],
      instagram: "Archon Studio empieza como un lienzo en blanco: texto, formas, capas, prompts y storyboard en una sola superficie.",
      linkedin: "Archon Studio es la base de un producto creativo: primero editor visual, despues IA integrada de imagen y video.",
      hashtags: ["#ArchonStudio", "#Diseno", "#IA", "#Contenido"],
      imagePrompt: "Interfaz creativa premium con lienzo en blanco, capas, herramientas de imagen, video y marca Archon.",
      videoPrompt: "Plano 1: lienzo vacio. Plano 2: aparecen herramientas. Plano 3: capas de texto y forma. Plano 4: pieza final exportada.",
      cta: "Crear una pieza nueva"
    };
  }

  function setStatus(message) {
    if (el.sourceStatus) el.sourceStatus.textContent = message;
  }

  function theme() {
    return themes[state.theme] || themes.archon;
  }

  function setCanvasSize() {
    const size = sizes[state.size] || sizes.square;
    el.canvas.width = size[0];
    el.canvas.height = size[1];
  }

  function currentSlide() {
    const slides = state.generated && Array.isArray(state.generated.slides) ? state.generated.slides : [];
    return slides[state.slideIndex] || slides[0] || defaultGenerated().slides[0];
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

  function drawLines(ctx, lines, x, y, lineHeight, maxLines) {
    lines.slice(0, maxLines).forEach(function (line, index) {
      ctx.fillText(line, x, y + index * lineHeight);
    });
    return y + Math.min(lines.length, maxLines) * lineHeight;
  }

  function hexToRgba(hex, alpha) {
    const clean = String(hex || "#000000").replace("#", "");
    const value = parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function resetLayers(template) {
    if (template === "offer") {
      state.layers = [
        { type: "shape", x: 0.62, y: 0.12, w: 0.22, h: 0.22, tone: "accent" },
        { type: "badge", x: 0.68, y: 0.72, text: "CTA" }
      ];
    } else if (template === "quote") {
      state.layers = [
        { type: "shape", x: 0.08, y: 0.12, w: 0.84, h: 0.04, tone: "accent" },
        { type: "text", x: 0.12, y: 0.7, text: "Una idea clara cambia la pieza completa." }
      ];
    } else if (template === "video") {
      state.layers = [
        { type: "video", x: 0.1, y: 0.18, text: "00:00 Lienzo" },
        { type: "video", x: 0.1, y: 0.3, text: "00:03 Capas" },
        { type: "video", x: 0.1, y: 0.42, text: "00:06 Export" }
      ];
    } else if (template === "launch") {
      state.layers = [
        { type: "image", x: 0.6, y: 0.16, w: 0.26, h: 0.26 },
        { type: "badge", x: 0.1, y: 0.72, text: "NEW" }
      ];
    } else {
      state.layers = [];
    }
  }

  function drawLayer(ctx, layer, width, height) {
    const t = theme();
    const x = layer.x * width;
    const y = layer.y * height;
    const w = (layer.w || 0.22) * width;
    const h = (layer.h || 0.12) * height;

    if (layer.type === "shape") {
      ctx.fillStyle = layer.tone === "accent" ? hexToRgba(t.accent, 0.16 + state.intensity / 500) : hexToRgba(t.text, 0.08);
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = t.line;
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
    }

    if (layer.type === "image") {
      ctx.fillStyle = hexToRgba(t.accent, 0.1);
      ctx.fillRect(x, y, w, h);
      ctx.strokeStyle = t.accent;
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, w, h);
      ctx.fillStyle = t.accent;
      ctx.font = `700 ${Math.max(18, width * 0.02)}px "IBM Plex Mono", monospace`;
      ctx.fillText("IMAGEN", x + 28, y + 34);
    }

    if (layer.type === "badge") {
      ctx.fillStyle = t.text;
      ctx.fillRect(x, y, Math.max(120, w * 0.72), 58);
      ctx.fillStyle = t.bg;
      ctx.font = `700 ${Math.max(18, width * 0.018)}px "IBM Plex Mono", monospace`;
      ctx.fillText(layer.text || "SELLO", x + 24, y + 19);
    }

    if (layer.type === "text") {
      ctx.fillStyle = t.muted;
      ctx.font = `700 ${Math.max(22, width * 0.028)}px Inter, Arial, sans-serif`;
      wrapText(ctx, layer.text || "Texto libre", width * 0.45).slice(0, 2).forEach(function (line, index) {
        ctx.fillText(line, x, y + index * width * 0.036);
      });
    }

    if (layer.type === "video") {
      ctx.fillStyle = hexToRgba(t.text, 0.06);
      ctx.fillRect(x, y, width * 0.48, 72);
      ctx.fillStyle = t.accent;
      ctx.font = `700 ${Math.max(18, width * 0.018)}px "IBM Plex Mono", monospace`;
      ctx.fillText(layer.text || "00:00 Escena", x + 20, y + 22);
      ctx.strokeStyle = t.line;
      ctx.strokeRect(x, y, width * 0.48, 72);
    }
  }

  function drawCanvas() {
    setCanvasSize();
    const ctx = el.canvas.getContext("2d");
    const t = theme();
    const width = el.canvas.width;
    const height = el.canvas.height;
    const slide = currentSlide();
    const margin = Math.max(70, Math.round(width * 0.075));
    const usableWidth = width - margin * 2;
    const headlineSize = Math.max(54, Math.round(width * 0.072));
    const bodySize = Math.max(28, Math.round(width * 0.031));
    const kickerSize = Math.max(19, Math.round(width * 0.018));

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = state.background || t.bg;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = t.panel;
    ctx.fillRect(margin * 0.65, margin * 0.65, width - margin * 1.3, height - margin * 1.3);
    ctx.strokeStyle = t.line;
    ctx.lineWidth = 3;
    ctx.strokeRect(margin * 0.65, margin * 0.65, width - margin * 1.3, height - margin * 1.3);

    ctx.save();
    ctx.globalAlpha = 0.04 + state.intensity / 1300;
    ctx.strokeStyle = t.accent;
    ctx.lineWidth = Math.max(18, width * 0.032);
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.23, width * 0.22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    state.layers.forEach(function (layer) {
      drawLayer(ctx, layer, width, height);
    });

    ctx.fillStyle = t.accent;
    ctx.font = `700 ${kickerSize}px "IBM Plex Mono", monospace`;
    ctx.textBaseline = "top";
    ctx.fillText(String(slide.kicker || "ARCHON STUDIO").toUpperCase(), margin, margin + 38);

    ctx.fillStyle = t.text;
    ctx.font = `800 ${headlineSize}px Inter, Arial, sans-serif`;
    let y = margin + 108;
    y = drawLines(ctx, wrapText(ctx, slide.headline || "", usableWidth), margin, y, headlineSize * 1.06, state.size === "linkedin" ? 3 : 4);

    ctx.fillStyle = t.muted;
    ctx.font = `400 ${bodySize}px Inter, Arial, sans-serif`;
    y += Math.max(36, height * 0.04);
    drawLines(ctx, wrapText(ctx, slide.body || "", usableWidth), margin, y, bodySize * 1.45, state.size === "story" ? 7 : 5);

    ctx.fillStyle = t.text;
    ctx.font = `700 ${Math.max(20, Math.round(width * 0.022))}px "IBM Plex Mono", monospace`;
    ctx.fillText(slide.footer || "Archon Consultancies", margin, height - margin - 36);

    ctx.fillStyle = t.accent;
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
    el.videoOutput.value = state.generated ? state.generated.videoPrompt || "" : "";
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
    state.generated = generated || defaultGenerated();
    state.slideIndex = 0;
    renderTabs();
    syncInputsFromSlide();
    drawCanvas();
  }

  function applyTemplate(template) {
    state.template = template;
    resetLayers(template);
    const generated = defaultGenerated();
    if (template === "launch") {
      generated.slides[0] = { kicker: "LANZAMIENTO", headline: "Presenta algo nuevo.", body: "Una pieza directa para anunciar producto, oferta o campana.", footer: "Archon Studio" };
    }
    if (template === "offer") {
      generated.slides[0] = { kicker: "OFERTA", headline: "Una promesa clara.", body: "Ordena problema, solucion y siguiente paso en una composicion comercial.", footer: "Hablar con Archon" };
    }
    if (template === "quote") {
      generated.slides[0] = { kicker: "IDEA", headline: "Menos ruido. Mas direccion.", body: "El diseno funciona cuando cada capa sabe que esta haciendo.", footer: "Archon Studio" };
    }
    if (template === "video") {
      generated.slides[0] = { kicker: "STORYBOARD", headline: "Tres escenas. Una pieza.", body: "Idea, ritmo visual y CTA preparados para producir un reel o anuncio.", footer: "Video prompt ready" };
    }
    applyGenerated(generated);
  }

  function addTool(type) {
    if (type === "template") {
      applyTemplate(el.templateSelect.value === "blank" ? "launch" : el.templateSelect.value);
      setStatus("Plantilla aplicada.");
      return;
    }

    const layer = {
      type: type,
      x: 0.12 + (state.layers.length % 3) * 0.08,
      y: 0.18 + (state.layers.length % 4) * 0.1,
      w: type === "text" ? 0.36 : 0.24,
      h: type === "text" ? 0.1 : 0.16,
      text: type === "video" ? "00:00 Escena" : type === "badge" ? "SELLO" : "Texto libre",
      tone: "accent"
    };
    state.layers.push(layer);
    drawCanvas();
    setStatus(type === "video" ? "Escena añadida al storyboard." : "Capa añadida al lienzo.");
  }

  async function generateContent() {
    el.generateBtn.disabled = true;
    setStatus("Generando direccion creativa...");
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          brief: el.briefInput.value,
          format: el.formatSelect.value,
          mode: el.modeSelect.value
        })
      });
      const payload = await response.json();
      applyGenerated(payload.generated || defaultGenerated());
      setStatus("Direccion generada. Edita capas, copy, prompt o exporta PNG.");
    } catch (error) {
      applyGenerated(defaultGenerated());
      setStatus("No se pudo llamar a la IA. He dejado un lienzo editable.");
    } finally {
      el.generateBtn.disabled = false;
    }
  }

  async function copyText(textarea, message) {
    const text = textarea.value || "";
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setStatus(message);
    } catch (error) {
      textarea.select();
      setStatus("Selecciona el texto y copialo manualmente.");
    }
  }

  function downloadPng() {
    drawCanvas();
    const link = document.createElement("a");
    link.download = `archon-studio-${state.template || "lienzo"}-${state.slideIndex + 1}.png`;
    link.href = el.canvas.toDataURL("image/png");
    link.click();
    setStatus("PNG exportado.");
  }

  [el.kickerInput, el.headlineInput, el.bodyInput, el.footerInput].forEach(function (input) {
    input.addEventListener("input", syncSlideFromInputs);
  });

  document.querySelectorAll("[data-tool]").forEach(function (button) {
    button.addEventListener("click", function () {
      addTool(button.dataset.tool);
    });
  });

  el.templateSelect.addEventListener("change", function () {
    applyTemplate(el.templateSelect.value);
    setStatus("Plantilla cargada.");
  });

  el.themeSelect.addEventListener("change", function () {
    state.theme = el.themeSelect.value;
    drawCanvas();
  });

  el.backgroundInput.addEventListener("input", function () {
    state.background = el.backgroundInput.value;
    drawCanvas();
  });

  el.sizeSelect.addEventListener("change", function () {
    state.size = el.sizeSelect.value;
    drawCanvas();
  });

  el.intensityInput.addEventListener("input", function () {
    state.intensity = Number(el.intensityInput.value) || 0;
    drawCanvas();
  });

  el.blankBtn.addEventListener("click", function () {
    el.templateSelect.value = "blank";
    state.background = "#F4F1EC";
    el.backgroundInput.value = state.background;
    applyTemplate("blank");
    setStatus("Lienzo nuevo listo.");
  });

  el.generateBtn.addEventListener("click", generateContent);
  el.copyPostBtn.addEventListener("click", function () {
    copyText(el.postOutput, "Copy copiado.");
  });
  el.copyPromptBtn.addEventListener("click", function () {
    copyText(el.modeSelect.value === "video" ? el.videoOutput : el.promptOutput, "Prompt copiado.");
  });
  el.downloadBtn.addEventListener("click", downloadPng);

  state.generated = defaultGenerated();
  resetLayers("blank");
  applyGenerated(state.generated);
  setStatus("Lienzo en blanco listo. Sin cuentas externas.");
})();
