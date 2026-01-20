import { authenticate } from "../shopify.server";

/**
 * ============================================================================
 * AUTHENTICATED API CALL EXAMPLE
 * ============================================================================
 * 
 * This route demonstrates how to use sessions to make authenticated API calls.
 * 
 * Key points:
 * 1. authenticate.admin() extracts the session from the request
 * 2. The admin client automatically uses session.accessToken
 * 3. session.shop identifies which store this request is for
 * 
 * ============================================================================
 * MCP CODE GENERATION EXAMPLE
 * ============================================================================
 * 
 * The GraphQL query below could be generated using Shopify Dev MCP.
 * 
 * Example MCP requests:
 * - "Generate a GraphQL query to fetch products with variants and images"
 * - "Create a query to get product details with pagination"
 * 
 * MCP helps ensure queries follow Shopify's GraphQL schema and best practices.
 * 
 * Alternative: You could also import queries from app/graphql/queries/products.js
 * See: app/graphql/README.md for organization options.
 */
export const loader = async ({ request }) => {
    // authenticate.admin() returns:
    // - admin: GraphQL client with session.accessToken automatically included
    // - session: The session object containing shop, accessToken, scope, etc.
    const { admin, session } = await authenticate.admin(request);
    
    // session.shop identifies the store: "my-store.myshopify.com"
    // session.accessToken is automatically used by admin.graphql()

    try {
        const response = await admin.graphql(
            `#graphql
      query getProducts {
        products(first: 10) {
          edges {
            node {
              id
              title
              handle
              status
              variants(first: 1) {
                edges {
                  node {
                    id
                    price
                  }
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
          }
        }
      }`
        );

        const responseJson = await response.json();

        return responseJson.data.products.edges.map((edge) => {
            const node = edge.node;
            return {
                id: node.id,
                title: node.title,
                status: node.status,
                variants: node.variants.edges.map((v) => ({ price: v.node.price })),
                image: node.images.edges.length > 0 ? { src: node.images.edges[0].node.url } : null,
            };
        });
    } catch (error) {
        console.error("Failed to load products:", error);
        return new Response(JSON.stringify({ error: "Failed to load products" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
