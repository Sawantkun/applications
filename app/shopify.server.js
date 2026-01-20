import "@shopify/shopify-app-react-router/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp as createShopifyApp,
} from "@shopify/shopify-app-react-router/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

import { restResources } from "@shopify/shopify-api/rest/admin/2024-10";

/**
 * ============================================================================
 * OAUTH & AUTHENTICATION CONFIGURATION
 * ============================================================================
 * 
 * This is where OAuth is declared and configured for your Shopify app.
 * 
 * OAuth Flow:
 * 1. Merchant installs app → Redirects to Shopify OAuth
 * 2. Merchant approves permissions → Shopify redirects back with code
 * 3. App exchanges code for access token → Session is created
 * 4. Session is stored → App can make authenticated API calls
 * 
 * Key Configuration:
 * - apiKey: Your app's API key (from Partner Dashboard)
 * - apiSecretKey: Your app's secret (never expose this)
 * - scopes: Permissions your app requests (e.g., "read_products,write_products")
 * - appUrl: Your app's public URL
 * - authPathPrefix: Where OAuth routes live (default: "/auth")
 * - sessionStorage: Where sessions are stored (database, Redis, etc.)
 */

/**
 * ============================================================================
 * SESSION STORAGE CONFIGURATION
 * ============================================================================
 * 
 * This is where your Shopify app stores session data for each store.
 * 
 * A session represents the app's "memory" for a specific store:
 * - shop: The store's domain (e.g., "my-store.myshopify.com")
 * - accessToken: The OAuth token used to make authenticated API calls
 * - scope: The permissions granted to your app
 * - isOnline: Whether this is an online (user-specific) or offline (store-wide) session
 * - expires: When the session expires (for online sessions)
 * 
 * PrismaSessionStorage stores sessions in your database using the Session model.
 * This allows your app to remember stores across server restarts.
 */
const shopify = createShopifyApp({
  // OAuth Credentials
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  
  // API Configuration
  apiVersion: ApiVersion.October24,
  
  // OAuth Scopes: Permissions your app requests from merchants
  // Format: "read_products,write_products,read_orders"
  // These are the permissions merchants see when installing your app
  scopes: process.env.SCOPES?.split(","),
  
  // App URL: Your app's public URL (required for OAuth redirects)
  appUrl: process.env.SHOPIFY_APP_URL || "",
  
  // Auth Path Prefix: Where OAuth routes live
  // Default: "/auth" → Creates routes like /auth/login, /auth/callback
  authPathPrefix: "/auth",
  
  // Session Storage: Where OAuth sessions are persisted
  // After OAuth completes, the session (with access token) is stored here
  // This uses Prisma to store sessions in your database
  sessionStorage: new PrismaSessionStorage(prisma),
  
  distribution: AppDistribution.AppStore,
  restResources,
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

/**
 * ============================================================================
 * BILLING CONFIGURATION
 * ============================================================================
 * 
 * Billing is defined here as backend configuration, not UI.
 * This controls how merchants pay for your app.
 * 
 * Types of billing:
 * 1. Recurring Subscriptions - Monthly/Annual charges
 * 2. Usage-Based - Charges based on merchant activity
 * 3. One-Time Charges - Setup fees or one-time services
 * 
 * See app/utils/billing-examples.js for implementation examples.
 */
export const billingPlans = {
  basic: {
    amount: 9.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS", // Monthly subscription
    name: "Basic Plan",
    trialDays: 7, // 7-day free trial
  },
  premium: {
    amount: 29.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS", // Monthly subscription
    name: "Premium Plan",
    trialDays: 14, // 14-day free trial
  },
  premiumAnnual: {
    amount: 299.99, // $24.99/month when billed annually
    currencyCode: "USD",
    interval: "ANNUAL", // Annual subscription
    name: "Premium Plan (Annual)",
    trialDays: 14,
  },
};

export default shopify;
export const shopifyAppInstance = shopify;
export const shopifyApp = shopify; // backwards compatibility with video script wording
export const apiVersion = ApiVersion.October24;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;

/**
 * ============================================================================
 * AUTHENTICATION HELPERS (DO NOT REWRITE ZONE)
 * ============================================================================
 * 
 * These helpers are provided by Shopify's SDK. DO NOT rewrite this logic.
 * These functions handle all OAuth complexity for you.
 * 
 * authenticate.admin(request) - Enforces authentication in routes
 *   - Extracts session from request
 *   - Returns { admin, session } if authenticated
 *   - Throws/redirects if not authenticated
 * 
 * login(request) - Initiates OAuth flow
 *   - Redirects merchant to Shopify OAuth approval screen
 *   - Handles shop parameter validation
 * 
 * authenticate.webhook(request) - Authenticates webhook requests
 *   - Validates HMAC signature
 *   - Returns { payload, session, topic, shop }
 * 
 * These are Shopify-managed - configure, don't rewrite!
 */
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
