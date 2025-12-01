import { authenticate } from "../shopify.server";
import { broadcast } from "../sse.server";

/**
 * Webhook handler for Shopify `products/create`
 *
 * - Logs raw body and parsed JSON to the console so you can show it in the video.
 * - Forwards a cloned Request to `authenticate.webhook` so signature verification works.
 * - Broadcasts a `product_created` SSE event to connected clients via ../sse.server.
 * - Returns a clear 200 response when processed.
 */
export const action = async ({ request }) => {
  try {
    // Validate request method
    if (request.method !== "POST") {
      console.error("Invalid request method:", request.method);
      return new Response("Method not allowed", { status: 405 });
    }

    const rawBody = await request.text();
    
    if (!rawBody || rawBody.length === 0) {
      console.error("Empty webhook body received");
      return new Response("Empty body", { status: 400 });
    }
    
    console.log("Received raw webhook body:", rawBody);

    // Log headers early so we can inspect them when debugging 500s
    try {
      console.log(
        "Request headers:",
        Object.fromEntries(request.headers.entries()),
      );
    } catch (hdrErr) {
      console.error("Failed to read request.headers for logging:", hdrErr);
    }

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      data = null;
    }
    console.log("Parsed data:", data);

    // Properly clone headers for the forwarded request
    // This is critical for HMAC signature verification
    const headers = new Headers();
    for (const [key, value] of request.headers.entries()) {
      headers.set(key, value);
    }

    const forwardedRequest = new Request(request.url, {
      method: request.method,
      headers: headers,
      body: rawBody,
    });

    let payload, topic, shop;
    try {
      const auth = await authenticate.webhook(forwardedRequest);
      payload = auth.payload;
      topic = auth.topic;
      shop = auth.shop;
      console.log("authenticate.webhook succeeded", { topic, shop });
      console.log("Authenticated payload:", payload);
    } catch (err) {
      // Log the authentication error for debugging (visible in server logs).
      console.error("authenticate.webhook failed:", err);
      console.error("Error message:", err?.message);
      console.error("Error stack:", err?.stack);
      // Return a clear response so you can see the failure during testing/recording.
      return new Response("Webhook auth failed", { status: 401 });
    }

    if (!topic || !shop) {
      console.error("Missing topic or shop after authentication", { topic, shop });
      return new Response("Invalid webhook data", { status: 400 });
    }

    console.log(`Received ${topic} webhook for ${shop}`);
    console.log("authenticate.webhook succeeded", { topic, shop });
    console.log("Authenticated payload:", payload);

    if (topic !== "products/create") {
      console.log(`Ignoring webhook topic ${topic} in products.create route`);
      return new Response("Ignored", { status: 204 });
    }

    const product = payload ?? data;
    
    if (!product) {
      console.error("No product data in webhook payload");
      return new Response("Missing product data", { status: 400 });
    }

    // Respond immediately to Shopify to avoid timeouts; perform broadcast asynchronously.
    const response = new Response("Webhook processed", { status: 200 });

    // Fire-and-forget broadcast so the HTTP response isn't delayed by SSE work.
    setTimeout(() => {
      try {
        broadcast("product_created", product, shop);
        console.log("Broadcasted product_created event to SSE clients", {
          shop,
        });
      } catch (err) {
        console.error("Failed to broadcast product_created event:", err);
      }
    }, 0);

    return response;
  } catch (err) {
    // Top-level catch to capture unexpected failures and log full details for debugging 500s
    console.error(
      "Unhandled error in products.create webhook handler:",
      err && err.stack ? err.stack : err,
    );
    console.error("Error name:", err?.name);
    console.error("Error message:", err?.message);
    
    // Try to log headers, but don't fail if we can't
    try {
      const headersObj = Object.fromEntries(request.headers.entries());
      console.error("Request headers at failure:", headersObj);
      console.error("Request URL:", request.url);
      console.error("Request method:", request.method);
    } catch (logErr) {
      console.error("Failed while logging request details:", logErr);
    }
    
    return new Response(
      JSON.stringify({ 
        error: "Internal Server Error",
        message: err?.message || "Unknown error"
      }),
      { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};
