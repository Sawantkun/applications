import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }) => {
  // This endpoint handles only the `app/scopes_update` webhook.
  // If you need to support other webhook topics, add routing here.
  // Read the raw POST body so we can log exactly what Shopify sent.
  // Then create a new Request with that body so `authenticate.webhook`
  // can read the body again (avoids consuming the original request stream).
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

  const { payload, session, topic, shop } =
    await authenticate.webhook(forwardedRequest);

  console.log(`Received ${topic} webhook for ${shop}`);
  console.log("Parsed webhook payload:", payload);
  const current = payload.current;

  if (session) {
    await db.session.update({
      where: {
        id: session.id,
      },
      data: {
        scope: current.toString(),
      },
    });
  }

  return new Response("Webhook processed", { status: 200 });
};
