import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";
import path from "path";

const app = express();

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

// Simple labels store (demo). Replace with DB or Shopify Admin calls.
// Use productId as provided in storefront [data-product-id]
const LABELS = {
  // Example mappings (adjust to your real IDs)
  // "123456789": { label: "NEW", enabled: true },
  // "gid://shopify/Product/123456789": { label: "SALE", enabled: true },
};

// Helper to return demo label if none configured (remove in prod)
function demoLabelFor(productId) {
  // simple heuristic: if numeric ends with even -> SALE otherwise NEW
  const digits = productId?.replace(/\D/g, "");
  if (!digits) return { label: "Label", enabled: true };
  const last = Number(digits[digits.length - 1]);
  return { label: last % 2 === 0 ? "SALE" : "NEW", enabled: true };
}

// CORS helper for simple use
app.use("/api/*", (req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Labels endpoint used by frontend script
app.get("/api/labels", (req, res) => {
  const productId = req.query.productId || "";
  if (!productId) {
    return res.status(400).json({ error: "missing productId" });
  }
  const entry = LABELS[productId] || demoLabelFor(productId);
  return res.json({ productId, label: entry.label, enabled: !!entry.enabled });
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
});
