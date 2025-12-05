import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import path from "path";
import fs from "fs";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(compression());
app.disable("x-powered-by");

// Trust Render's proxy to ensure request.protocol is 'https'
app.set("trust proxy", 1);

// Logging
app.use(morgan("tiny"));

// Serve static assets
app.use(
    "/assets",
    express.static("build/client/assets", { immutable: true, maxAge: "1y" })
);
app.use(express.static("build/client", { maxAge: "1h" }));

// Serve frontend assets (label script + css)
app.use("/frontend", express.static(path.join(process.cwd(), "public", "frontend")));

// Simple persistent labels store (data/labels.json)
const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "labels.json");

function ensureDataFile() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, JSON.stringify({}, null, 2));
  } catch (err) {
    console.error("[BB] failed to ensure data file", err);
  }
}

function readLabels() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, "utf8");
    return JSON.parse(raw || "{}");
  } catch (err) {
    console.error("[BB] readLabels error", err);
    return {};
  }
}

function writeLabels(obj) {
  ensureDataFile();
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(obj, null, 2));
    return true;
  } catch (err) {
    console.error("[BB] writeLabels error", err);
    return false;
  }
}

// Load labels into memory (not required but convenient)
let LABELS = readLabels();

// Helper demo fallback
function demoLabelFor(productId) {
  const digits = (productId || "").replace(/\D/g, "");
  if (!digits) return { label: "Label", enabled: true };
  const last = Number(digits[digits.length - 1]);
  return { label: last % 2 === 0 ? "SALE" : "NEW", enabled: true };
}

// Simple CORS for API during development
app.use("/api/", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// GET /api/labels?productId=...
app.get("/api/labels", (req, res) => {
  const productId = req.query.productId || req.query.product_id || "";
  console.log(`[BB] GET /api/labels productId=${productId} origin=${req.get("origin") || req.ip}`);
  if (!productId) return res.status(400).json({ error: "missing productId" });
  // try exact productId, also try numeric-only key (shop themes sometimes send numeric id)
  const entry = LABELS[productId] || LABELS[productId.replace(/\D/g, "")];
  if (entry) return res.json({ productId, label: entry.label, enabled: !!entry.enabled });
  const demo = demoLabelFor(productId);
  return res.json({ productId, label: demo.label, enabled: demo.enabled });
});

// Legacy app-proxy /apps/blackbytt-labels/labels?product_id=... (Shopify app proxy / theme requests)
app.get("/apps/blackbytt-labels/labels", (req, res) => {
  const productId = req.query.product_id || req.query.productId || "";
  console.log(`[BB] GET /apps/blackbytt-labels/labels product_id=${productId} origin=${req.get("origin") || req.ip}`);
  if (!productId) return res.status(400).json({ error: "missing product_id" });
  const entry = LABELS[productId] || LABELS[productId.replace(/\D/g, "")];
  if (entry) return res.json({ productId, label: entry.label, enabled: !!entry.enabled });
  const demo = demoLabelFor(productId);
  return res.json({ productId, label: demo.label, enabled: demo.enabled });
});

// POST /api/labels to set label for testing { productId, label, enabled }
// Persists to data/labels.json so storefront requests see it
app.post("/api/labels", (req, res) => {
  const { productId, label, enabled = true } = req.body || {};
  if (!productId || !label) return res.status(400).json({ error: "productId and label required" });
  LABELS[productId] = { label, enabled: !!enabled };
  // also persist numeric-only key for convenience
  const numeric = productId.replace(/\D/g, "");
  if (numeric) LABELS[numeric] = { label, enabled: !!enabled };
  const ok = writeLabels(LABELS);
  console.log(`[BB] SET label for ${productId} => ${label} (enabled=${!!enabled}) persisted=${ok}`);
  return res.json({ ok: true, productId, label, enabled: !!enabled });
});

// snippet helper for theme
app.get("/snippet", (req, res) => {
  const origin = req.protocol + "://" + req.get("host");
  const scriptTag = `<script src="${origin}/frontend/label-inject.js" defer></script>\n<!-- optional: <link rel="stylesheet" href="${origin}/frontend/label-inject.css"> -->`;
  res.type("text/plain").send(scriptTag);
});

app.get("/", (req, res) => {
  res.send("BlackBytt app server — labels API available at /api/labels and /apps/blackbytt-labels/labels — snippet at /snippet");
});

app.all(
    "*",
    createRequestHandler({
        build: async () => {
            const build = await import("./build/server/index.js");
            return build;
        },
    })
);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`✅ Server ready: http://localhost:${port}`);
    console.log(`Serve snippet: GET http://localhost:${port}/snippet`);
});
