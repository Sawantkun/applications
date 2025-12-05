(function () {
  const script = document.currentScript;
  const baseOrigin = script ? new URL(script.src).origin : window.location.origin;
  const BADGE_CLASS = "bb-label";
  const cache = new Map();

  function log(...args) { console.info("[BB]", ...args); }
  function warn(...args) { console.warn("[BB]", ...args); }

  function ensureCss() {
    const href = baseOrigin + "/frontend/label-inject.css";
    if (!document.querySelector(`link[href="${href}"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      document.head.appendChild(link);
    }
  }

  function createBadge(text) {
    const s = document.createElement("span");
    s.className = BADGE_CLASS;
    s.textContent = text || "";
    return s;
  }

  function insertBadge(cardEl, text) {
    if (!cardEl || cardEl.querySelector(`.${BADGE_CLASS}`)) return;
    const anchor = cardEl.querySelector("a, img, .product__image, .card__media") || cardEl;
    const computed = window.getComputedStyle(anchor);
    if (computed.position === "static") anchor.style.position = "relative";
    const badge = createBadge(text);
    anchor.appendChild(badge);
    log("inserted badge", cardEl.getAttribute("data-product-id"), text);
  }

  function fetchLabel(productId) {
    if (!productId) return Promise.resolve(null);
    if (cache.has(productId)) return Promise.resolve(cache.get(productId));
    const url = `${baseOrigin}/api/labels?productId=${encodeURIComponent(productId)}`;
    log("fetching", url);
    return fetch(url, { credentials: "omit" })
      .then(r => r.ok ? r.json() : Promise.reject(r.status))
      .then(json => { cache.set(productId, json); return json; })
      .catch(err => { warn("fetch failed", productId, err); cache.set(productId, null); return null; });
  }

  function handleCard(card) {
    if (!card || card.querySelector(`.${BADGE_CLASS}`)) return;
    const pid = card.getAttribute("data-product-id") || card.dataset.productId;
    if (!pid) return;
    const inline = card.getAttribute("data-label") || card.dataset.label;
    if (inline) { insertBadge(card, inline); return; }
    fetchLabel(pid).then(json => {
      if (!json) return;
      if (json.enabled) insertBadge(card, json.label || "Label");
    });
  }

  function scan(root = document) {
    const nodes = root.querySelectorAll ? root.querySelectorAll("[data-product-id]") : [];
    nodes.forEach(n => {
      const card = n.matches && n.matches("[data-product-id]") ? n : n.closest && n.closest("[data-product-id]");
      if (card) handleCard(card);
    });
  }

  function observe() {
    const obs = new MutationObserver(muts => {
      muts.forEach(m => {
        m.addedNodes.forEach(node => {
          if (!(node instanceof HTMLElement)) return;
          if (node.matches && node.matches("[data-product-id]")) handleCard(node);
          else scan(node);
        });
      });
    });
    obs.observe(document.documentElement || document.body, { childList: true, subtree: true });
  }

  function init() {
    ensureCss();
    scan(document);
    observe();
    log("initialized baseOrigin=", baseOrigin);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
