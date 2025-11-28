import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
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

  const { shop, session, topic } = await authenticate.webhook(forwardedRequest);

  console.log(`Received ${topic} webhook for ${shop}`);

  // Webhook requests can trigger multiple times and after an app has already been uninstalled.
  // If this webhook already ran, the session may have been deleted previously.
  if (session) {
    await db.session.deleteMany({ where: { shop } });
  }

  // Respond explicitly that the webhook was processed with status 200
  return new Response("Webhook processed", { status: 200 });
};
