/**
 * ============================================================================
 * SESSION USAGE EXAMPLES
 * ============================================================================
 * 
 * This file demonstrates common patterns for working with sessions in Shopify apps.
 * Use these examples as reference when building your own routes.
 */

import { authenticate } from "../shopify.server";

/**
 * EXAMPLE 1: Basic Session Access in a Route Loader
 * 
 * The authenticate.admin() function returns both the admin GraphQL client
 * and the session object. The session contains store identity and access tokens.
 */
export async function exampleBasicSessionAccess({ request }) {
  // authenticate.admin() extracts the session from the request
  // and returns both the admin client and the session
  const { admin, session } = await authenticate.admin(request);
  
  // Session object structure:
  // {
  //   id: "session-id",
  //   shop: "my-store.myshopify.com",  // Store identity
  //   state: "state-string",
  //   isOnline: false,                  // false = offline (store-wide) session
  //   scope: "read_products,write_products",
  //   expires: null,                    // null for offline sessions
  //   accessToken: "shpat_...",         // OAuth token for API calls
  //   userId: null,                     // null for offline sessions
  //   firstName: null,
  //   lastName: null,
  //   email: null,
  //   accountOwner: false,
  //   locale: null,
  //   collaborator: false,
  //   emailVerified: false
  // }
  
  // Use session.shop to identify which store this request is for
  const storeDomain = session.shop;
  
  // Use admin.graphql() to make authenticated API calls
  // The session's accessToken is automatically included
  const response = await admin.graphql(`
    query {
      shop {
        name
        email
      }
    }
  `);
  
  return { storeDomain, shopData: await response.json() };
}

/**
 * EXAMPLE 2: Online vs Offline Sessions
 * 
 * Shopify apps can have two types of sessions:
 * 
 * 1. OFFLINE SESSIONS (isOnline: false)
 *    - Store-wide access
 *    - Never expire
 *    - Used for background tasks, webhooks, scheduled jobs
 *    - userId is null
 * 
 * 2. ONLINE SESSIONS (isOnline: true)
 *    - User-specific access
 *    - Expire after a period of inactivity
 *    - Used when a merchant is actively using your app
 *    - userId contains the merchant's user ID
 */
export async function exampleOnlineVsOffline({ request }) {
  const { session } = await authenticate.admin(request);
  
  if (session.isOnline) {
    // This is an online session - a merchant is actively using the app
    console.log(`Merchant ${session.userId} from ${session.shop} is using the app`);
    console.log(`Session expires at: ${session.expires}`);
    
    // Online sessions are perfect for:
    // - Real-time UI updates
    // - User-specific data
    // - Interactive features
  } else {
    // This is an offline session - store-wide access
    console.log(`Store-wide session for ${session.shop}`);
    console.log(`This session does not expire`);
    
    // Offline sessions are perfect for:
    // - Webhooks
    // - Scheduled background jobs
    // - Store-wide operations
  }
  
  return { isOnline: session.isOnline, shop: session.shop };
}

/**
 * EXAMPLE 3: Store Identity
 * 
 * session.shop is the consistent identifier for a store.
 * It's always in the format: "store-name.myshopify.com"
 */
export async function exampleStoreIdentity({ request }) {
  const { session } = await authenticate.admin(request);
  
  // session.shop is the store's domain
  // Format: "store-name.myshopify.com"
  const storeDomain = session.shop;
  
  // Use this to:
  // - Query store-specific data from your database
  // - Filter results by store
  // - Log which store is making requests
  
  // Example: Query labels for this specific store
  // const labels = await prisma.label.findMany({
  //   where: { shop: session.shop }
  // });
  
  return { storeDomain };
}

/**
 * EXAMPLE 4: Access Tokens and Scopes
 * 
 * The accessToken in the session is what allows your app to make
 * authenticated API calls to Shopify. Scopes define what permissions
 * your app has.
 */
export async function exampleTokensAndScopes({ request }) {
  const { admin, session } = await authenticate.admin(request);
  
  // session.accessToken is the OAuth token
  // It's automatically used by admin.graphql() and admin.rest()
  // You rarely need to access it directly
  
  // session.scope contains the permissions granted to your app
  // Example: "read_products,write_products,read_orders"
  const scopes = session.scope?.split(",") || [];
  
  // Check if your app has a specific permission
  const canWriteProducts = scopes.includes("write_products");
  
  if (canWriteProducts) {
    // Make authenticated API call
    // The accessToken is automatically included in the request
    const response = await admin.graphql(`
      mutation {
        productCreate(input: { title: "New Product" }) {
          product { id }
        }
      }
    `);
    
    return { success: true, data: await response.json() };
  }
  
  return { error: "Insufficient permissions" };
}

/**
 * EXAMPLE 5: Authenticated API Calls
 * 
 * The admin client returned by authenticate.admin() automatically
 * includes the session's accessToken in all API requests.
 */
export async function exampleAuthenticatedApiCall({ request }) {
  const { admin, session } = await authenticate.admin(request);
  
  // The admin client automatically uses session.accessToken
  // You don't need to manually add it to headers
  
  // GraphQL API call
  const graphqlResponse = await admin.graphql(`
    query getProducts {
      products(first: 10) {
        edges {
          node {
            id
            title
          }
        }
      }
    }
  `);
  
  // REST API call (if using REST resources)
  // const restResponse = await admin.rest.resources.Product.all({
  //   session: session,
  // });
  
  const data = await graphqlResponse.json();
  
  return {
    shop: session.shop,
    products: data.data.products.edges.map(edge => edge.node)
  };
}
