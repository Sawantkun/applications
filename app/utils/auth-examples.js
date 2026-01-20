/**
 * ============================================================================
 * AUTHENTICATION EXAMPLES
 * ============================================================================
 * 
 * This file demonstrates how authentication is enforced in app routes.
 * Use these patterns when building protected routes in your Shopify app.
 */

import { authenticate } from "../shopify.server";

/**
 * EXAMPLE 1: Basic Auth Enforcement in a Route
 * 
 * This shows how to protect a route so only authenticated merchants can access it.
 */
export async function exampleProtectedRoute({ request }) {
  // authenticate.admin() enforces authentication:
  // - Extracts session from request cookies/headers
  // - Validates session exists and is valid
  // - Returns { admin, session } if authenticated
  // - Throws/redirects to login if not authenticated
  const { admin, session } = await authenticate.admin(request);
  
  // After authentication, you have:
  // - admin: GraphQL client with access token automatically included
  // - session: Session object with shop, accessToken, scope, etc.
  
  // Use session.shop to identify which store this request is for
  const shop = session.shop;
  
  // Use admin.graphql() to make authenticated API calls
  const response = await admin.graphql(`
    query {
      shop {
        name
        email
      }
    }
  `);
  
  return { shop, shopData: await response.json() };
}

/**
 * EXAMPLE 2: Auth Enforcement with Error Handling
 * 
 * Always handle authentication errors gracefully.
 */
export async function exampleAuthWithErrorHandling({ request }) {
  try {
    const { admin, session } = await authenticate.admin(request);
    
    // Your protected route logic here
    return { success: true, shop: session.shop };
  } catch (error) {
    // Authentication failed - redirect to login
    // Shopify SDK handles this automatically, but you can customize
    console.error("Authentication failed:", error);
    throw new Response("Unauthorized", { status: 401 });
  }
}

/**
 * EXAMPLE 3: Using Session Data
 * 
 * After authentication, use session data for store-specific operations.
 */
export async function exampleUsingSessionData({ request }) {
  const { session } = await authenticate.admin(request);
  
  // Session contains:
  // - shop: Store domain (e.g., "my-store.myshopify.com")
  // - accessToken: OAuth token (automatically used by admin client)
  // - scope: Permissions granted (e.g., "read_products,write_products")
  // - isOnline: Whether this is user-specific or store-wide session
  // - expires: Expiration time (for online sessions)
  
  // Use session.shop to filter data by store
  // const labels = await prisma.label.findMany({
  //   where: { shop: session.shop }
  // });
  
  return {
    shop: session.shop,
    scope: session.scope,
    isOnline: session.isOnline,
  };
}

/**
 * EXAMPLE 4: Webhook Authentication
 * 
 * Webhooks use a different authentication method (HMAC validation).
 */
export async function exampleWebhookAuth({ request }) {
  // authenticate.webhook() validates webhook requests:
  // - Validates HMAC signature from Shopify
  // - Extracts webhook payload
  // - Returns { payload, session, topic, shop }
  const { payload, session, topic, shop } = await authenticate.webhook(request);
  
  // Process webhook based on topic
  if (topic === "products/create") {
    // Handle product creation
    console.log("New product:", payload);
  }
  
  return new Response("OK", { status: 200 });
}
