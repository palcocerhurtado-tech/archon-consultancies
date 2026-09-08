(function () {
  "use strict";

  const measurementId = "G-1DEHH0QHZ5";
  const key = "archon-analytics-consent";
  const isEnglish = () => document.documentElement.lang === "en";
  let choice;
  try { choice = window.localStorage.getItem(key); } catch (_) {}

  function enableAnalytics() {
    if (window.__archonAnalyticsLoaded) return;
    window.__archonAnalyticsLoaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", measurementId);
    const script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(measurementId);
    document.head.append(script);
  }

  function removeBanner() {
    document.querySelector(".archon-consent")?.remove();
  }

  function save(value) {
    try { window.localStorage.setItem(key, value); } catch (_) {}
    if (value === "accepted") enableAnalytics();
    removeBanner();
  }

  window.ArchonConsent = {
    hasAnalyticsConsent: () => choice === "accepted"
  };

  if (choice === "accepted") {
    enableAnalytics();
    return;
  }
  if (choice === "rejected") return;

  const banner = document.createElement("aside");
  banner.className = "archon-consent";
  banner.setAttribute("role", "dialog");
  banner.setAttribute("aria-label", isEnglish() ? "Analytics preference" : "Preferencia de analítica");
  banner.innerHTML = isEnglish()
    ? '<p>We use Google Analytics to understand how the site is used. You can accept or decline analytics cookies. <a href="/privacidad">Privacy</a>.</p><div class="archon-consent__actions"><button type="button" data-choice="accepted">Accept analytics</button><button type="button" data-choice="rejected">Decline</button></div>'
    : '<p>Usamos Google Analytics para entender cómo se utiliza la web. Puedes aceptar o rechazar las cookies de analítica. <a href="/privacidad">Privacidad</a>.</p><div class="archon-consent__actions"><button type="button" data-choice="accepted">Aceptar analítica</button><button type="button" data-choice="rejected">Rechazar</button></div>';
  banner.addEventListener("click", (event) => {
    const button = event.target.closest("[data-choice]");
    if (!button) return;
    choice = button.dataset.choice;
    save(choice);
  });
  document.body.append(banner);
})();
