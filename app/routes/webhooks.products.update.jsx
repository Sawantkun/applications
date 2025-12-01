import { authenticate } from "../shopify.server";

export const action = async ({ request }) => {
  try {
    const rawBody = await request.text();
    console.log("Received raw webhook body:", rawBody);

    let data;
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      data = null;
    }
    console.log("Parsed data:", data);

    const forwardedRequest = new Request(request.url, {
      method: request.method,
      headers: request.headers,
      body: rawBody,
    });

    const { payload, topic, shop } = await authenticate.webhook(forwardedRequest);

    console.log(`Received ${topic} webhook for ${shop}`);
    console.log("Parsed webhook payload:", payload);

    const normalizedTopic = topic?.toLowerCase();
    if (normalizedTopic !== "products/update") {
      console.log(`Ignoring webhook topic ${topic} in products.update route`);
      return new Response(null, { status: 204 });
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (err) {
    console.error(
      "Unhandled error in products.update webhook handler:",
      err && err.stack ? err.stack : err,
    );
    console.error("Error name:", err?.name);
    console.error("Error message:", err?.message);

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
        message: err?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};

