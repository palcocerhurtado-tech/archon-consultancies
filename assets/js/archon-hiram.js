(function () {
  "use strict";

  const HIRAM_KEY_HANDOFF = "archon_hiram_passphrase";
  const ARCHIVE_URL = "/assets/data/hiram-acacia-777.enc.json";
  const SALT = new TextEncoder().encode("archon-hiram-acacia-777-salt-v1");
  const ITERATIONS = 150000;
  const HANDOFF_MAX_AGE_MS = 5 * 60 * 1000;

  const root = document.getElementById("hiram-root");

  function base64ToBytes(b64) {
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i += 1) bytes[i] = bin.charCodeAt(i);
    return bytes;
  }

  function showSealed(message) {
    root.innerHTML =
      '<div class="h-sealed">' +
      '<div>' +
      '<svg class="h-sealed-glyph" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="32" cy="32" r="30" stroke="#B026FF" stroke-width="1.5" opacity="0.5"/>' +
      '<path d="M20 44V28a12 12 0 0 1 24 0v16" stroke="#F0ABFC" stroke-width="2"/>' +
      '<rect x="24" y="40" width="16" height="12" stroke="#F0ABFC" stroke-width="2"/>' +
      '<circle cx="32" cy="46" r="2" fill="#F0ABFC"/>' +
      "</svg>" +
      '<h1 class="h-sealed-mark">El archivo permanece sellado</h1>' +
      '<p class="h-sealed-copy">' +
      (message || "No se reconoce la llave. Esta cámara solo se abre pronunciando la clave completa ante el archivo velado, tras resolver la epifanía de trece pasos.") +
      "</p>" +
      "</div>" +
      "</div>";
  }

  async function deriveKey(passphrase) {
    const material = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", salt: SALT, iterations: ITERATIONS, hash: "SHA-256" },
      material,
      { name: "AES-GCM", length: 256 },
      false,
      ["decrypt"]
    );
  }

  async function decryptArchive(passphrase) {
    const response = await fetch(ARCHIVE_URL, { cache: "no-store" });
    if (!response.ok) throw new Error("archive_fetch_failed");
    const payload = await response.json();
    const key = await deriveKey(passphrase);
    const iv = base64ToBytes(payload.iv);
    const data = base64ToBytes(payload.data);
    const plainBuffer = await crypto.subtle.decrypt({ name: "AES-GCM", iv: iv }, key, data);
    const json = new TextDecoder().decode(plainBuffer);
    return JSON.parse(json);
  }

  function readHandoff() {
    let raw;
    try {
      raw = sessionStorage.getItem(HIRAM_KEY_HANDOFF);
    } catch (error) {
      return null;
    }
    if (!raw) return null;
    try {
      sessionStorage.removeItem(HIRAM_KEY_HANDOFF);
    } catch (error) {
      /* ignore */
    }
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (error) {
      return null;
    }
    if (!parsed || !parsed.passphrase) return null;
    if (Date.now() - Number(parsed.issuedAt || 0) > HANDOFF_MAX_AGE_MS) return null;
    return parsed.passphrase;
  }

  function escapeHtml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function cardArt(svgMarkup) {
    return svgMarkup || "";
  }

  function renderArchive(archive) {
    const documents = Array.isArray(archive.documents) ? archive.documents : [];
    const routes = {};
    documents.forEach((doc) => {
      const key = doc.route || "general";
      routes[key] = (routes[key] || 0) + 1;
    });

    const filterLabels = archive.routeLabels || {};
    const filters = ["all"].concat(Object.keys(routes));

    root.innerHTML =
      '<div class="h-shell">' +
      '<header class="h-header">' +
      '<span class="h-eyebrow">' + escapeHtml(archive.eyebrow || "Archivo desbloqueado") + "</span>" +
      '<h1 class="h-title">' + escapeHtml(archive.title || "Cámara de Hiram Acacia 777") + "</h1>" +
      '<p class="h-subtitle">' + escapeHtml(archive.subtitle || "") + "</p>" +
      '<div class="h-toolbar" id="hiram-filters"></div>' +
      "</header>" +
      '<section class="h-grid" id="hiram-grid"></section>' +
      "</div>" +
      '<div class="h-reader" id="hiram-reader">' +
      '<div class="h-reader-panel">' +
      '<button type="button" class="h-reader-close" id="hiram-reader-close">×</button>' +
      '<span class="h-reader-eyebrow" id="hiram-reader-eyebrow"></span>' +
      '<h2 class="h-reader-title" id="hiram-reader-title"></h2>' +
      '<div class="h-reader-body" id="hiram-reader-body"></div>' +
      "</div>" +
      "</div>";

    const filterBar = document.getElementById("hiram-filters");
    let activeFilter = "all";

    function renderGrid() {
      const grid = document.getElementById("hiram-grid");
      const visible = documents.filter((doc) => activeFilter === "all" || doc.route === activeFilter);

      if (!visible.length) {
        grid.innerHTML = '<p class="h-empty">Nada en esta sección del archivo.</p>';
        return;
      }

      grid.innerHTML = visible
        .map((doc, index) => {
          let actionLink;
          if (doc.downloadUrl) {
            actionLink = '<a class="h-btn" href="' + escapeHtml(doc.downloadUrl) + '" download>Descargar PDF</a>';
          } else if (doc.externalUrl) {
            actionLink =
              '<a class="h-btn" href="' + escapeHtml(doc.externalUrl) + '" target="_blank" rel="noopener">Fuente íntegra</a>';
          } else {
            actionLink = '<span class="h-btn" aria-disabled="true">Sin fuente</span>';
          }
          return (
            '<article class="h-card" data-index="' + documents.indexOf(doc) + '">' +
            '<div class="h-card-art">' + cardArt(doc.art) + "</div>" +
            '<div class="h-card-body">' +
            '<span class="h-card-eyebrow">' + escapeHtml(doc.eyebrow || doc.route || "") + "</span>" +
            '<h3 class="h-card-title">' + escapeHtml(doc.title || "") + "</h3>" +
            '<p class="h-card-summary">' + escapeHtml(doc.shortSummary || "") + "</p>" +
            '<div class="h-card-actions">' +
            '<button type="button" class="h-btn is-primary" data-action="read" data-index="' + documents.indexOf(doc) + '">Leer resumen</button>' +
            actionLink +
            "</div>" +
            "</div>" +
            "</article>"
          );
        })
        .join("");

      grid.querySelectorAll('[data-action="read"]').forEach((btn) => {
        btn.addEventListener("click", () => openReader(documents[Number(btn.dataset.index)]));
      });
    }

    filterBar.innerHTML = filters
      .map((id) => {
        const label = id === "all" ? "Todo el archivo" : filterLabels[id] || id;
        const count = id === "all" ? documents.length : routes[id];
        return (
          '<button type="button" class="h-filter' + (id === "all" ? " is-active" : "") + '" data-filter="' + escapeHtml(id) + '">' +
          escapeHtml(label) + " (" + count + ")" +
          "</button>"
        );
      })
      .join("");

    filterBar.querySelectorAll(".h-filter").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter;
        filterBar.querySelectorAll(".h-filter").forEach((b) => b.classList.toggle("is-active", b === btn));
        renderGrid();
      });
    });

    const reader = document.getElementById("hiram-reader");
    function openReader(doc) {
      document.getElementById("hiram-reader-eyebrow").textContent = doc.eyebrow || doc.route || "";
      document.getElementById("hiram-reader-title").textContent = doc.title || "";
      document.getElementById("hiram-reader-body").textContent = doc.fullSummary || doc.shortSummary || "";
      reader.classList.add("is-open");
    }
    document.getElementById("hiram-reader-close").addEventListener("click", () => {
      reader.classList.remove("is-open");
    });
    reader.addEventListener("click", (event) => {
      if (event.target === reader) reader.classList.remove("is-open");
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") reader.classList.remove("is-open");
    });

    renderGrid();
  }

  async function init() {
    const passphrase = readHandoff();
    if (!passphrase) {
      showSealed();
      return;
    }

    try {
      const archive = await decryptArchive(passphrase);
      renderArchive(archive);
    } catch (error) {
      showSealed("La llave no ha coincidido con el sello del archivo. Vuelve a la cámara velada y completa la epifanía de nuevo.");
    }
  }

  init();
})();
