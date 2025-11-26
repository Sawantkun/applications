import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);

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
