(function () {
  "use strict";

  const isEnglish = () => document.documentElement.lang === "en";
  const t = (es, en) => (isEnglish() ? en : es);

  function safeRun(fn) {
    try { fn(); } catch (_) { /* one feature failing should not break the rest */ }
  }

  // ── Skip to content ──────────────────────────────────────────────
  function initSkipLink() {
    if (document.querySelector(".skip-link")) return;
    const target =
      document.querySelector("main") ||
      document.getElementById("top") ||
      document.querySelector("h1");
    if (!target) return;
    if (!target.id) target.id = "archon-main-content";
    if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
    const link = document.createElement("a");
    link.href = "#" + target.id;
    link.className = "skip-link";
    link.textContent = t("Saltar al contenido principal", "Skip to main content");
    document.body.insertBefore(link, document.body.firstChild);
  }

  // ── Back to top ──────────────────────────────────────────────────
  function initBackToTop() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "archon-back-to-top";
    btn.setAttribute("aria-label", t("Volver arriba", "Back to top"));
    btn.textContent = "↑";
    document.body.appendChild(btn);
    function onScroll() {
      btn.classList.toggle("is-visible", window.scrollY > 600);
    }
    btn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ── Scroll progress bar ──────────────────────────────────────────
  function initScrollProgress() {
    const bar = document.createElement("div");
    bar.className = "archon-scroll-progress";
    const fill = document.createElement("div");
    fill.className = "archon-scroll-progress-fill";
    bar.appendChild(fill);
    document.body.appendChild(bar);
    function update() {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      fill.style.width = (total > 0 ? Math.min(100, (scrolled / total) * 100) : 0) + "%";
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  // ── UTM / attribution capture, injected into any lead form ──────
  function initAttribution() {
    const STORAGE_KEY = "archon_attribution";
    const utmKeys = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
    const params = new URLSearchParams(window.location.search);
    const hasUtm = utmKeys.some((k) => params.has(k));

    let stored = null;
    try { stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); } catch (_) { stored = null; }

    if (hasUtm || !stored) {
      const fresh = {};
      utmKeys.forEach((k) => { if (params.has(k)) fresh[k] = params.get(k); });
      fresh.landing_page = window.location.pathname;
      fresh.referrer = document.referrer || "direct";
      fresh.first_seen = (stored && stored.first_seen) || new Date().toISOString();
      fresh.last_seen = new Date().toISOString();
      stored = stored && !hasUtm ? stored : Object.assign({}, stored, fresh, {
        first_seen: (stored && stored.first_seen) || fresh.first_seen
      });
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(stored)); } catch (_) { /* storage unavailable */ }
    }

    if (!stored) return;

    const fieldKeys = utmKeys.concat(["landing_page", "referrer", "first_seen"]);
    document.querySelectorAll("form").forEach((form) => {
      fieldKeys.forEach((key) => {
        const value = stored[key];
        if (!value) return;
        if (form.querySelector('[name="' + key + '"]')) return;
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
    });
  }

  // ── Copy to clipboard for phone / email links ────────────────────
  function initCopyLinks() {
    const links = document.querySelectorAll('a[href^="tel:"], a[href^="mailto:"]');
    links.forEach((link) => {
      if (link.dataset.archonCopyBound) return;
      link.dataset.archonCopyBound = "1";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "archon-copy-btn";
      btn.setAttribute("aria-label", t("Copiar", "Copy"));
      btn.textContent = "⧉";
      btn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const raw = link.getAttribute("href").replace(/^mailto:|^tel:/, "").split("?")[0];
        const value = decodeURIComponent(raw);
        const markCopied = () => {
          const prev = btn.textContent;
          btn.classList.add("is-copied");
          btn.textContent = "✓";
          window.setTimeout(() => {
            btn.classList.remove("is-copied");
            btn.textContent = prev;
          }, 1500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(value).then(markCopied).catch(() => {});
        } else {
          const ta = document.createElement("textarea");
          ta.value = value;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); markCopied(); } catch (_) { /* clipboard unavailable */ }
          document.body.removeChild(ta);
        }
      });
      link.insertAdjacentElement("afterend", btn);
    });
  }

  // ── Services dropdown: click/tap support (hover-only before this) ─
  function initServiceMenuToggle() {
    const nav = document.querySelector(".brand-service-nav");
    const toggle = document.querySelector(".brand-service-toggle");
    const menu = document.querySelector(".brand-service-menu");
    if (!nav || !toggle || !menu) return;

    function close() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    function open() {
      nav.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
    }

    toggle.addEventListener("click", (event) => {
      event.stopPropagation();
      if (nav.classList.contains("is-open")) close(); else open();
    });
    document.addEventListener("click", (event) => {
      if (!nav.contains(event.target)) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  // ── Dark mode (homepage only — the rest of the site still has
  //    hardcoded light-theme colors that would break under a dark skin) ─
  function initThemeToggle() {
    if (!document.body.classList.contains("brand-home")) return;
    const STORAGE_KEY = "archon-theme";
    let theme;
    try { theme = localStorage.getItem(STORAGE_KEY); } catch (_) { theme = null; }
    if (!theme) {
      theme = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    document.documentElement.setAttribute("data-theme", theme);

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "archon-theme-toggle";
    function updateLabel() {
      btn.setAttribute("aria-label", t("Cambiar modo oscuro", "Toggle dark mode"));
      btn.textContent = theme === "dark" ? "☀" : "☾";
    }
    updateLabel();
    btn.addEventListener("click", () => {
      theme = theme === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", theme);
      updateLabel();
      try { localStorage.setItem(STORAGE_KEY, theme); } catch (_) { /* storage unavailable */ }
    });
    document.body.appendChild(btn);
  }

  // ── Site search ───────────────────────────────────────────────────
  function initSiteSearch() {
    let index = null;
    let indexPromise = null;

    function loadIndex() {
      if (indexPromise) return indexPromise;
      indexPromise = fetch("/assets/data/search-index.json")
        .then((res) => (res.ok ? res.json() : []))
        .then((data) => { index = Array.isArray(data) ? data : []; return index; })
        .catch(() => { index = []; return index; });
      return indexPromise;
    }

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "archon-search-trigger";
    trigger.setAttribute("aria-label", t("Buscar en el sitio", "Search the site"));
    trigger.textContent = "⌕";

    const overlay = document.createElement("div");
    overlay.className = "archon-search-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.innerHTML =
      '<div class="archon-search-panel">' +
      '<div class="archon-search-field-row">' +
      '<span aria-hidden="true">⌕</span>' +
      '<input type="text" autocomplete="off" spellcheck="false" placeholder="' +
      t("Buscar páginas, servicios, artículos…", "Search pages, services, articles…") +
      '">' +
      '<button type="button" class="archon-search-close" aria-label="' + t("Cerrar", "Close") + '">×</button>' +
      "</div>" +
      '<div class="archon-search-results"></div>' +
      "</div>";

    document.body.appendChild(trigger);
    document.body.appendChild(overlay);

    const input = overlay.querySelector("input");
    const resultsEl = overlay.querySelector(".archon-search-results");
    const closeBtn = overlay.querySelector(".archon-search-close");

    function render(items, query) {
      if (!query) {
        resultsEl.innerHTML = "";
        return;
      }
      if (!items.length) {
        resultsEl.innerHTML =
          '<p class="archon-search-empty">' + t("Sin resultados para", "No results for") + ' “' + query + '”.</p>';
        return;
      }
      resultsEl.innerHTML = items
        .slice(0, 12)
        .map(
          (item) =>
            '<a class="archon-search-result" href="' + item.url + '">' +
            '<div class="archon-search-result-title">' + item.title + "</div>" +
            '<div class="archon-search-result-desc">' + (item.description || "") + "</div>" +
            "</a>"
        )
        .join("");
    }

    function search(query) {
      const q = query.trim().toLowerCase();
      if (!q || !index) { render([], query); return; }
      const scored = index
        .map((item) => {
          const hay = (item.title + " " + (item.description || "") + " " + (item.keywords || "")).toLowerCase();
          const titleHit = item.title.toLowerCase().includes(q);
          if (!hay.includes(q)) return null;
          return { item, score: titleHit ? 2 : 1 };
        })
        .filter(Boolean)
        .sort((a, b) => b.score - a.score)
        .map((entry) => entry.item);
      render(scored, query);
    }

    function openOverlay() {
      overlay.classList.add("is-open");
      loadIndex().then(() => search(input.value));
      window.setTimeout(() => input.focus(), 20);
      document.body.style.overflow = "hidden";
    }
    function closeOverlay() {
      overlay.classList.remove("is-open");
      document.body.style.overflow = "";
    }

    trigger.addEventListener("click", openOverlay);
    closeBtn.addEventListener("click", closeOverlay);
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeOverlay();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) closeOverlay();
      if ((event.key === "k" || event.key === "K") && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        openOverlay();
      }
    });
    input.addEventListener("input", () => search(input.value));
  }

  function init() {
    safeRun(initSkipLink);
    safeRun(initBackToTop);
    safeRun(initScrollProgress);
    safeRun(initAttribution);
    safeRun(initCopyLinks);
    safeRun(initServiceMenuToggle);
    safeRun(initThemeToggle);
    safeRun(initSiteSearch);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
