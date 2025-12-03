(function () {
  // Autodetect base origin from this script tag so fetch() targets the app domain.
  const currentScript = document.currentScript;
  const baseOrigin = (currentScript && new URL(currentScript.src).origin) || "";

  if (!baseOrigin) {
    console.warn("BB: cannot detect script origin for label API calls.");
  }

  // CSS class name used for injected badges
  const BADGE_CLASS = "bb-label";

  // Simple cache to avoid duplicate network requests
  const labelCache = new Map();

  function createBadge(text) {
    const span = document.createElement("span");
    span.className = BADGE_CLASS;
    span.textContent = text || "";
    return span;
  }

  function ensureStylesLoaded() {
    // try to load CSS automatically if script tag has data-css attribute or side-by-side file exists
    if (currentScript && currentScript.getAttribute("data-css") === "false") return;
    const cssHref = baseOrigin + "/frontend/label-inject.css";
    if (!document.querySelector(`link[href="${cssHref}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = cssHref;
      document.head.appendChild(link);
    }
  }

  function insertBadge(cardEl, text) {
    if (!cardEl || cardEl.querySelector(`.${BADGE_CLASS}`)) return;
    // prefer an image or anchor inside card for positioning
    const anchor = cardEl.querySelector("a") || cardEl;
    // make container position relative if not set
    const computed = window.getComputedStyle(anchor);
    if (computed.position === "static") {
      anchor.style.position = "relative";
    }
    const badge = createBadge(text);
    anchor.appendChild(badge);
  }

  function fetchLabel(productId) {
    if (!baseOrigin) return Promise.resolve(null);
    if (labelCache.has(productId)) return Promise.resolve(labelCache.get(productId));
    const url = `${baseOrigin}/api/labels?productId=${encodeURIComponent(productId)}`;
    return fetch(url, { credentials: "omit" })
      .then((r) => {
        if (!r.ok) throw new Error("bad response");
        return r.json();
      })
      .then((json) => {
        labelCache.set(productId, json);
        return json;
      })
      .catch(() => {
        labelCache.set(productId, null);
        return null;
      });
  }

  function handleCard(cardEl) {
    if (!cardEl) return;
    if (cardEl.querySelector(`.${BADGE_CLASS}`)) return; // already handled
    const productId = cardEl.getAttribute("data-product-id") || cardEl.dataset.productId;
    if (!productId) return;
    // If label text exists on the element itself (data-label) we prefer that
    const dataLabel = cardEl.getAttribute("data-label") || cardEl.dataset.label;
    if (dataLabel) {
      insertBadge(cardEl, dataLabel);
      return;
    }
    // Fetch from app
    fetchLabel(productId).then((json) => {
      if (!json || !json.enabled) return;
      insertBadge(cardEl, json.label || "Label");
    });
  }

  function scanAndInject(root = document) {
    const nodes = root.querySelectorAll ? root.querySelectorAll("[data-product-id]") : [];
    nodes.forEach((node) => {
      // if query returned sub-element use closest product card
      const card = node.matches && node.matches("[data-product-id]") ? node : node.closest("[data-product-id]");
      handleCard(card);
    });
  }

  function setupObserver() {
    const observer = new MutationObserver((mutations) => {
      for (const m of mutations) {
        if (m.addedNodes && m.addedNodes.length) {
          m.addedNodes.forEach((n) => {
            if (!(n instanceof HTMLElement)) return;
            if (n.matches && n.matches("[data-product-id]")) {
              handleCard(n);
            } else {
              scanAndInject(n);
            }
          });
        }
      }
    });
    observer.observe(document.documentElement || document.body, {
      childList: true,
      subtree: true,
    });
  }

  function init() {
    ensureStylesLoaded();
    scanAndInject(document);
    setupObserver();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
