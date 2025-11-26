import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
    const { admin } = await authenticate.admin(request);

    try {
        const response = await admin.rest.resources.Product.all({
            session: admin.session,
            limit: 10,
        });

        return response.data;
    } catch (error) {
        console.error("Failed to load products:", error);
        return new Response(JSON.stringify({ error: "Failed to load products" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};
