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
  // Read raw POST body for logging and to avoid consuming the original stream
  const rawBody = await request.text();
  console.log("Received raw webhook body:", rawBody);

  // Try converting to JSON for easier inspection
  let data;
  try {
    data = JSON.parse(rawBody);
  } catch (e) {
    data = null;
  }
  console.log("Parsed data:", data);

  // Forward a new Request containing the same raw body so authenticate.webhook can validate it
  const forwardedRequest = new Request(request.url, {
    method: request.method,
    headers: request.headers,
    body: rawBody,
  });

  // Authenticate and parse the webhook (this will also validate HMAC)
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
    // Return a clear response so you can see the failure during testing/recording.
    return new Response("Webhook auth failed", { status: 401 });
  }

  // Only handle products/create here
  if (topic && topic !== "products/create") {
    console.log(`Ignoring webhook topic ${topic} in products.create route`);
    return new Response("Ignored", { status: 204 });
  }

  // Choose canonical product object from authenticated payload, fallback to parsed data
  const product = payload ?? data;

  // Broadcast to SSE clients (targets by shop when provided)
  try {
    broadcast("product_created", product, shop);
    console.log("Broadcasted product_created event to SSE clients", { shop });
  } catch (err) {
    console.error("Failed to broadcast product_created event:", err);
  }

  // Respond to Shopify
  return new Response("Webhook processed", { status: 200 });
};
