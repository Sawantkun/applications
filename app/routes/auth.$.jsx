import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";

/**
 * ============================================================================
 * OAUTH CALLBACK & SESSION CREATION
 * ============================================================================
 * 
 * This route handles the OAuth callback from Shopify.
 * 
 * OAuth Flow:
 * 1. Merchant approves permissions on Shopify
 * 2. Shopify redirects to /auth/callback with authorization code
 * 3. authenticate.admin(request) is called
 * 4. SDK exchanges code for access token (happens internally)
 * 5. Session is created and stored in sessionStorage
 * 6. Merchant is redirected to your app
 * 
 * The session creation and token handling is abstracted by Shopify's SDK.
 * You don't need to manually handle the OAuth code exchange - it's automatic.
 * 
 * After this completes, the merchant has an active session and can use your app.
 */
export const loader = async ({ request }) => {
  // authenticate.admin() handles the OAuth callback:
  // - Extracts authorization code from URL
  // - Exchanges code for access token (internal)
  // - Creates session with access token
  // - Stores session in sessionStorage
  // - Returns { admin, session } if successful
  await authenticate.admin(request);

  return null;
};

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
