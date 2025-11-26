import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import morgan from "morgan";

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

// Handle all other requests with React Router
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
