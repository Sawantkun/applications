/*
applications/app/sse.server.js

SSE broadcaster module

Exports:
- subscribe({ shop }): returns a Response with a ReadableStream configured for SSE.
- broadcast(event, data, shop = null): sends an SSE to all connected clients (or only clients matching `shop`).
- sendToClient(id, event, data): send to a single client by id.
- clients: Map of connected clients for inspection (id -> { shop, connectedAt }).

Usage (example in a route):
import { subscribe, broadcast } from "../sse.server";

export const loader = () => {
  return subscribe({ shop: "example.myshopify.com" });
};

Then, from a webhook handler call:
import { broadcast } from "../sse.server";
broadcast("product_created", payload, shopDomain);
*/

const clients = new Map(); // id -> { controller, shop, connectedAt, pingInterval }

/**
 * Create a short unique id for each client.
 */
function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Standard SSE headers for responses.
 */
function sseHeaders() {
  return {
    "Content-Type": "text/event-stream; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive",
    // Allow cross-origin for local dev (adjust in prod as needed)
    "Access-Control-Allow-Origin": "*",
  };
}

/**
 * Format an SSE message. Handles multiline data and JSON.
 * @param {string|null} event
 * @param {any} data
 * @returns {string}
 */
function formatSse(event, data) {
  let out = "";
  if (event) out += `event: ${event}\n`;

  if (data === undefined || data === null) {
    out += `data: \n\n`;
    return out;
  }

  let payload = data;
  if (typeof data === "object") {
    try {
      payload = JSON.stringify(data);
    } catch (err) {
      payload = String(data);
    }
  } else {
    payload = String(data);
  }

  // Support multiline payloads
  const lines = payload.split(/\r?\n/);
  for (const line of lines) {
    out += `data: ${line}\n`;
  }
  out += `\n`;
  return out;
}

/**
 * Subscribe a new SSE client.
 * Returns a Response whose body is a ReadableStream that will emit SSE messages.
 *
 * Options:
 *  - shop: optional shop domain to tag the client with (useful for targeted broadcasts)
 *
 * Example:
 *   return subscribe({ shop: "your-shop.myshopify.com" });
 */
function subscribe({ shop = null } = {}) {
  const id = createId();

  const stream = new ReadableStream({
    start(controller) {
      // Save client reference
      clients.set(id, {
        controller,
        shop,
        connectedAt: Date.now(),
        id,
      });

      // Immediately send a comment and an initial connected event
      try {
        controller.enqueue(formatSse(null, `connected:${id}`));
      } catch (err) {
        // ignore enqueue errors
      }

      // Heartbeat ping every 20s to keep the connection alive through proxies
      const pingInterval = setInterval(() => {
        try {
          // A colon-prefixed comment is a valid SSE keep-alive
          controller.enqueue(": ping\n\n");
        } catch (err) {
          // If enqueue fails, the connection is probably closed — cleanup below
        }
      }, 20_000);

      // Attach ping interval so we can clear it on cancel
      const client = clients.get(id);
      if (client) client.pingInterval = pingInterval;
    },

    cancel(reason) {
      // connection closed, cleanup
      const client = clients.get(id);
      if (client) {
        if (client.pingInterval) {
          clearInterval(client.pingInterval);
        }
        clients.delete(id);
      }
    },
  });

  const response = new Response(stream, {
    headers: sseHeaders(),
    status: 200,
  });

  return response;
}

/**
 * Broadcast an SSE to all connected clients.
 * If `shop` is provided, only clients with a matching `shop` value will receive the event.
 *
 * @param {string} event
 * @param {any} data
 * @param {string|null} shop
 */
function broadcast(event, data, shop = null) {
  const message = formatSse(event, data);

  for (const [id, client] of clients.entries()) {
    if (shop && client.shop && client.shop !== shop) {
      continue;
    }

    try {
      client.controller.enqueue(message);
    } catch (err) {
      // If enqueue fails, try to clean up this client
      try {
        if (client.pingInterval) clearInterval(client.pingInterval);
      } catch (e) {}
      clients.delete(id);
    }
  }
}

/**
 * Send an event to a specific client by id.
 * @param {string} id
 * @param {string} event
 * @param {any} data
 * @returns {boolean} true if sent
 */
function sendToClient(id, event, data) {
  const client = clients.get(id);
  if (!client) return false;
  try {
    client.controller.enqueue(formatSse(event, data));
    return true;
  } catch (err) {
    if (client.pingInterval) clearInterval(client.pingInterval);
    clients.delete(id);
    return false;
  }
}

/**
 * Close a client connection server-side.
 * @param {string} id
 */
function closeClient(id) {
  const client = clients.get(id);
  if (!client) return false;
  try {
    if (client.pingInterval) clearInterval(client.pingInterval);
    // Close the stream by enqueuing a comment and then closing controller
    try {
      client.controller.enqueue(": closing\n\n");
    } catch (e) {}
    try {
      client.controller.close();
    } catch (e) {}
  } finally {
    clients.delete(id);
  }
  return true;
}

export { subscribe, broadcast, sendToClient, closeClient, clients };
