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
    // Read the raw POST body so we can log exactly what Shopify sent.
    const rawBody = await request.text();
    console.log("Received raw webhook body:", rawBody);

    // Convert the raw text body into JSON with safety try/catch
    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      data = null;
    }
    console.log("Parsed data:", data);

    // Forward a new Request containing the raw body to the authenticator
    // so it can verify signatures without the original stream being consumed.
    const forwardedRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: rawBody,
    });

    const { payload, topic, shop } = await authenticate.webhook(forwardedRequest);

    console.log(`Received ${topic} webhook for ${shop}`);
    console.log("Parsed webhook payload:", payload);

    const normalizedTopic = topic?.toLowerCase();

    if (normalizedTopic !== "products/create") {
      console.log(`Ignoring webhook topic ${topic} in products.create route`);
      return new Response(null, { status: 204 });
    }

    const product = payload ?? data;

    // Broadcast SSE event asynchronously, but don't let it block the response
    // Use Promise.resolve().then() instead of setTimeout for better async handling
    Promise.resolve().then(() => {
      try {
        broadcast("product_created", product, shop);
        console.log("Broadcasted product_created event to SSE clients", {
          shop,
        });
      } catch (err) {
        console.error("Failed to broadcast product_created event:", err);
      }
    }).catch((broadcastErr) => {
      console.error("Error in broadcast promise:", broadcastErr);
    });

    // Respond immediately to Shopify to avoid timeouts
    return new Response("Webhook processed", { status: 200 });
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
