(function () {
  "use strict";

  const receiptKey = "archon-contact-receipt";
  const production = /^(www\.)?archonconsultancies\.com$/.test(window.location.hostname);
  const english = () => document.documentElement.lang === "en";
  const copy = (es, en) => english() ? en : es;
  const pageId = window.location.pathname.replace(/\.html$/, "").replace(/^\/+|\/+$/g, "") || "home";
  const validPages = new Set(["home", "index", "contacto", "atelier", "intelligence", "agencia-ia",
    "consultora-ia-zaragoza", "radiografia-operativa-ia", "precio-consultoria-ia-empresas", "automatizacion-ia-empresas"]);
  const formId = validPages.has(pageId) ? (pageId === "index" ? "home" : pageId) : "contact";

  function track(name, parameters, callback) {
    if (!production || typeof window.gtag !== "function") {
      if (callback) callback();
      return;
    }
    try {
      window.gtag("event", name, {
        ...parameters,
        ...(callback ? { event_callback: callback, event_timeout: 1200 } : {}),
        transport_type: "beacon"
      });
    } catch (_) {
      if (callback) callback();
    }
  }

  function interest(data) {
    const value = data.get("project_type") || data.get("tipo_proyecto") || data.get("division");
    if (/^(Archon )?Intelligence$/.test(value)) return "intelligence";
    if (/^(Archon )?Atelier$/.test(value)) return "atelier";
    if (/^Ambas( líneas)?$/.test(value)) return "both";
    if (pageId === "atelier") return "atelier";
    if (pageId === "intelligence") return "intelligence";
    return "unspecified";
  }

  document.querySelectorAll("[data-contact-cta], a[href^='mailto:'], a[href^='tel:']").forEach((link) => {
    link.addEventListener("click", () => {
      const method = link.hasAttribute("data-contact-cta") ? "form"
        : link.getAttribute("href").startsWith("mailto:") ? "email" : "phone";
      track("contact_click", { contact_method: method, form_id: formId });
    });
  });

  document.querySelectorAll("form[action^='https://formsubmit.co/']").forEach((form) => {
    if (!window.fetch || !window.FormData || !window.AbortController) return;
    const endpoint = new URL(form.action);
    if (endpoint.origin !== "https://formsubmit.co") return;
    const status = document.createElement("p");
    status.className = "contact-status";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    status.setAttribute("aria-atomic", "true");
    form.append(status);
    const buttons = Array.from(form.querySelectorAll("button[type='submit'], input[type='submit']"));
    const buttonLabels = new Map();
    let busy = false;
    let complete = false;
    let started = false;

    form.addEventListener("input", () => {
      if (started) return;
      started = true;
      track("contact_form_start", { form_id: formId });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (busy || complete || !form.reportValidity()) return;
      const data = new FormData(form);
      if (String(data.get("_honey") || "").trim()) return;
      busy = true;
      form.setAttribute("aria-busy", "true");
      status.dataset.state = "pending";
      status.textContent = copy("Enviando tu solicitud...", "Sending your enquiry...");
      buttons.forEach((button) => {
        buttonLabels.set(button, button.tagName === "INPUT" ? button.value : button.textContent);
        button.disabled = true;
      });
      const parameters = { form_id: formId, service_interest: interest(data) };
      track("contact_form_submit", parameters);
      const controller = new AbortController();
      const timer = window.setTimeout(() => controller.abort(), 20000);
      let accepted = false;
      let failure = "network";

      try {
        const response = await window.fetch(endpoint.origin + "/ajax" + endpoint.pathname, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(Object.fromEntries(data)),
          signal: controller.signal
        });
        failure = "provider";
        if (!response.ok) throw new Error("Provider rejected request");
        const result = await response.json();
        accepted = result.success === true || result.success === "true";
        if (!accepted) throw new Error("Provider did not confirm acceptance");
      } catch (error) {
        if (error.name === "AbortError") failure = "timeout";
      } finally {
        window.clearTimeout(timer);
        busy = false;
        form.removeAttribute("aria-busy");
      }

      if (!accepted) {
        status.dataset.state = "error";
        status.textContent = copy(
          "No hemos podido confirmar el envío. Tus datos siguen en el formulario. Puedes reintentarlo o escribir a archon.consultancies@hotmail.com.",
          "We could not confirm submission. Your details remain in the form. You can retry or email archon.consultancies@hotmail.com."
        );
        buttons.forEach((button) => { button.disabled = false; });
        track("contact_form_error", { ...parameters, error_type: failure });
        return;
      }

      complete = true;
      status.dataset.state = "success";
      status.textContent = copy("Solicitud enviada. Abriendo la confirmación...", "Enquiry sent. Opening confirmation...");
      // Keep only a short-lived receipt, never form values or contact details.
      try {
        window.sessionStorage.setItem(receiptKey, JSON.stringify({ at: Date.now(), formId }));
      } catch (_) {}
      let navigated = false;
      function showConfirmation() {
        if (navigated) return;
        navigated = true;
        window.location.assign("/gracias" + (english() ? "?lang=en" : ""));
      }
      window.setTimeout(showConfirmation, 1400);
      track("generate_lead", parameters, showConfirmation);
    });

    window.addEventListener("pageshow", (event) => {
      if (!event.persisted) return;
      busy = false;
      complete = false;
      form.removeAttribute("aria-busy");
      status.textContent = "";
      buttons.forEach((button) => {
        button.disabled = false;
        const label = button.dataset[english() ? "en" : "es"] || buttonLabels.get(button);
        if (!label) return;
        if (button.tagName === "INPUT") button.value = label;
        else button.textContent = label;
      });
    });
  });

  const confirmation = document.querySelector("[data-contact-confirmation]");
  if (!confirmation) return;
  if (new URLSearchParams(window.location.search).get("lang") === "en") {
    document.documentElement.lang = "en";
    document.querySelectorAll("[data-es][data-en]").forEach((node) => { node.innerHTML = node.dataset.en; });
  }
  let receipt;
  try {
    receipt = JSON.parse(window.sessionStorage.getItem(receiptKey));
  } catch (_) {}
  const recent = receipt && Number.isFinite(receipt.at) && Date.now() >= receipt.at
    && Date.now() - receipt.at < 30 * 60 * 1000 && validPages.has(receipt.formId);
  if (recent) {
    confirmation.textContent = copy("Solicitud enviada.", "Enquiry sent.");
    document.querySelector("[data-confirmation-detail]").textContent = copy(
      "El servicio de envío ha aceptado tu solicitud. Pablo la revisará y te responderá por email para acordar el siguiente paso.",
      "The submission service has accepted your enquiry. Pablo will review it and reply by email to agree on the next step."
    );
  }
})();
