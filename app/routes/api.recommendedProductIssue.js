import { authenticate } from "../shopify.server";

/**
 * ============================================================================
 * BACKEND ROUTE FOR ADMIN EXTENSION
 * ============================================================================
 * 
 * This route provides data to the Admin action extension.
 * 
 * Key points:
 * 1. Extensions run on a different domain than your app
 * 2. Use cors() wrapper to allow cross-domain requests
 * 3. Shopify automatically adds Authorization header for your app domain
 * 4. Return JSON (not React components)
 * 
 * ============================================================================
 * LECTURE RECORDING NOTES
 * ============================================================================
 * 
 * This file demonstrates:
 * - How to create a backend route that extensions can call
 * - Using cors() to enable cross-domain requests
 * - Reading query parameters from the request
 * - Returning JSON data for extensions to consume
 * 
 * Time markers for lecture:
 * - 2:20-2:40: Show file path and route filename
 * - 2:40-3:20: Explain cors() wrapper (10s pause)
 * - 3:20-4:10: Show return cors(Response.json(...)) pattern (8s pause)
 */
export const loader = async ({ request }) => {
  // Important: extensions run on a different domain.
  // Wrap your response with cors() so extensions can access this route.
  const { cors } = await authenticate.admin(request);

  const productIssues = [
    { title: "Too big", description: "The product was too big." },
    { title: "Too small", description: "The product was too small." },
    {
      title: "Just right",
      description: "The product was just right, but the customer is still unhappy.",
    },
  ];

  // Read productId from query string
  const url = new URL(request.url);
  const productId = url.searchParams.get("productId"); // e.g. "gid://shopify/Product/123"

  if (!productId) {
    return cors(Response.json({ error: "productId is required" }, { status: 400 }));
  }

  // Pick a deterministic suggestion based on the numeric id
  const splitStr = productId.split("/");
  const idNumber = parseInt(splitStr[splitStr.length - 1], 10);
  const issue = productIssues[idNumber % productIssues.length];

  // Return JSON the extension will consume
  return cors(Response.json({ productIssue: issue }));
};
