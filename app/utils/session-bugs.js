/**
 * ============================================================================
 * COMMON SESSION BUGS THAT CAUSE CRASHES
 * ============================================================================
 * 
 * These are real-world examples of session-related bugs that can crash
 * your Shopify app in production. Learn to recognize and avoid them.
 */

import { authenticate } from "../shopify.server";
import prisma from "../db.server";

/**
 * BUG #1: Missing Session Check
 * 
 * PROBLEM: Assuming session always exists without checking
 * RESULT: App crashes with "Cannot read property 'shop' of undefined"
 */
export async function bugMissingSessionCheck({ request }) {
  // ❌ BAD: No error handling
  const { session } = await authenticate.admin(request);
  const shop = session.shop; // Crashes if authentication fails!
  
  // ✅ GOOD: Handle authentication errors
  try {
    const { session } = await authenticate.admin(request);
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    const shop = session.shop;
    return { shop };
  } catch (error) {
    console.error("Authentication failed:", error);
    return new Response("Unauthorized", { status: 401 });
  }
}

/**
 * BUG #2: Using Wrong Session Type
 * 
 * PROBLEM: Trying to access userId on offline sessions
 * RESULT: Returns null, causing logic errors
 */
export async function bugWrongSessionType({ request }) {
  const { session } = await authenticate.admin(request);
  
  // ❌ BAD: Assuming userId exists
  const userId = session.userId; // null for offline sessions!
  if (userId) {
    // This code never runs for offline sessions
    console.log(`User ID: ${userId}`);
  }
  
  // ✅ GOOD: Check session type first
  if (session.isOnline && session.userId) {
    console.log(`Online session for user: ${session.userId}`);
  } else {
    console.log(`Offline session for store: ${session.shop}`);
  }
  
  return { isOnline: session.isOnline };
}

/**
 * BUG #3: Not Validating Shop Domain
 * 
 * PROBLEM: Using session.shop without validating format
 * RESULT: Security issues or database errors
 */
export async function bugInvalidShopDomain({ request }) {
  const { session } = await authenticate.admin(request);
  
  // ❌ BAD: No validation
  const shop = session.shop;
  // What if shop is undefined, null, or malformed?
  
  // ✅ GOOD: Validate shop domain
  if (!session || !session.shop) {
    return new Response("Invalid session", { status: 401 });
  }
  
  // Ensure shop is in correct format: "store.myshopify.com"
  const shopPattern = /^[a-zA-Z0-9-]+\.myshopify\.com$/;
  if (!shopPattern.test(session.shop)) {
    return new Response("Invalid shop domain", { status: 400 });
  }
  
  return { shop: session.shop };
}

/**
 * BUG #4: Expired Session Handling
 * 
 * PROBLEM: Not checking if online session has expired
 * RESULT: API calls fail with 401 Unauthorized
 */
export async function bugExpiredSession({ request }) {
  const { session } = await authenticate.admin(request);
  
  // ❌ BAD: Not checking expiration
  if (session.isOnline) {
    // Session might be expired!
    const response = await admin.graphql(`query { shop { name } }`);
  }
  
  // ✅ GOOD: Check expiration for online sessions
  if (session.isOnline && session.expires) {
    const now = new Date();
    const expiresAt = new Date(session.expires);
    
    if (now > expiresAt) {
      // Session expired - redirect to re-authenticate
      return new Response("Session expired", { 
        status: 401,
        headers: { "Location": "/auth/login" }
      });
    }
  }
  
  return { valid: true };
}

/**
 * BUG #5: Missing Scope Validation
 * 
 * PROBLEM: Making API calls without checking if app has required permissions
 * RESULT: API calls fail with 403 Forbidden
 */
export async function bugMissingScopeCheck({ request }) {
  const { admin, session } = await authenticate.admin(request);
  
  // ❌ BAD: No scope check
  const response = await admin.graphql(`
    mutation {
      productCreate(input: { title: "New" }) {
        product { id }
      }
    }
  `);
  // Fails if app doesn't have write_products scope!
  
  // ✅ GOOD: Check scopes first
  const scopes = session.scope?.split(",") || [];
  const hasWriteProducts = scopes.includes("write_products");
  
  if (!hasWriteProducts) {
    return new Response("Missing required scope: write_products", { 
      status: 403 
    });
  }
  
  const response = await admin.graphql(`
    mutation {
      productCreate(input: { title: "New" }) {
        product { id }
      }
    }
  `);
  
  return { success: true };
}

/**
 * BUG #6: Race Condition with Session Updates
 * 
 * PROBLEM: Multiple requests trying to update session simultaneously
 * RESULT: Data corruption or lost updates
 */
export async function bugRaceCondition({ request }) {
  const { session } = await authenticate.admin(request);
  
  // ❌ BAD: Direct database update without locking
  // If two requests update at the same time, one overwrites the other
  await prisma.session.update({
    where: { id: session.id },
    data: { scope: "new_scope" }
  });
  
  // ✅ GOOD: Use transactions or optimistic locking
  await prisma.$transaction(async (tx) => {
    const current = await tx.session.findUnique({
      where: { id: session.id }
    });
    
    await tx.session.update({
      where: { id: session.id },
      data: { 
        scope: current.scope + ",new_scope" // Append, don't overwrite
      }
    });
  });
  
  return { success: true };
}

/**
 * BUG #7: Not Handling Session Storage Errors
 * 
 * PROBLEM: Assuming session storage always works
 * RESULT: App crashes when database is unavailable
 */
export async function bugStorageErrors({ request }) {
  // ❌ BAD: No error handling
  const { session } = await authenticate.admin(request);
  
  // ✅ GOOD: Handle storage errors gracefully
  try {
    const { session } = await authenticate.admin(request);
    return { shop: session.shop };
  } catch (error) {
    // Session storage might be down (database connection lost, etc.)
    if (error.message.includes("session") || error.message.includes("storage")) {
      console.error("Session storage error:", error);
      return new Response("Service temporarily unavailable", { 
        status: 503 
      });
    }
    throw error; // Re-throw if it's a different error
  }
}
