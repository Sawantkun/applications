import React from "react";
import { subscribe } from "../sse.server";
import { authenticate } from "../shopify.server";

/**
 * SSE subscribe route
 *
 * Usage (client):
 *   // If you have a shop domain for targeting:
 *   const es = new EventSource(`/sse.subscribe?shop=${encodeURIComponent(shopDomain)}`);
 *   es.addEventListener("product_created", (e) => console.log("product_created", JSON.parse(e.data)));
 *
 * This loader returns a Response backed by a ReadableStream configured for Server-Sent Events.
 * The stream and headers are handled by the `subscribe` function in `app/sse.server.js`.
 *
 * We attempt to authenticate the request as an admin session. If authentication fails,
 * we return 401 to avoid exposing SSE to unauthenticated clients. If you prefer public
 * subscriptions for dev, adjust this behavior accordingly.
 */
export const loader = async ({ request }) => {
  // Require admin authentication so only authorized clients (in-session) can subscribe.
  try {
    await authenticate.admin(request);
  } catch (err) {
    // Auth failed — return Unauthorized
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  // Allow passing shop via query param or X-Shopify-Shop-Domain header
  const shop =
    url.searchParams.get("shop") ||
    request.headers.get("x-shopify-shop-domain") ||
    null;

  // Return the SSE subscription response created by our server helper.
  return subscribe({ shop });
};

/**
 * Minimal route UI component.
 *
 * When opened in a browser, this route will render a tiny page explaining how to
 * connect. The actual SSE connection is handled client-side via EventSource.
 */
export default function SSESubscribe() {
  return (
    <div style={{ padding: 20, fontFamily: "system-ui, -apple-system, Roboto, sans-serif" }}>
      <h2>SSE Subscribe</h2>
      <p style={{ color: "#666" }}>
        This endpoint exposes a Server-Sent Events stream. Connect with:
      </p>
      <pre
        style={{
          background: "#f6f8fa",
          padding: "8px 12px",
          borderRadius: 6,
          overflowX: "auto",
        }}
      >
        {`const es = new EventSource('/sse.subscribe?shop=your-shop.myshopify.com');
es.addEventListener('product_created', e => console.log('product_created', JSON.parse(e.data)));`}
      </pre>
    </div>
  );
}
