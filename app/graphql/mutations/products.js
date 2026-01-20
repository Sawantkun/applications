/**
 * Product GraphQL Mutations
 * 
 * This file contains GraphQL mutations for product operations.
 * These mutations can be generated using Shopify Dev MCP.
 * 
 * Example MCP requests:
 * - "Create a mutation to update a product's title"
 * - "Generate a mutation to create a new product"
 * - "Build a mutation to delete a product"
 */

/**
 * Update product title
 * Usage: Import and use in route actions
 * 
 * Example:
 * import { UPDATE_PRODUCT_TITLE } from "../graphql/mutations/products.js";
 * const response = await admin.graphql(UPDATE_PRODUCT_TITLE, {
 *   variables: { 
 *     product: { 
 *       id: "gid://shopify/Product/123",
 *       title: "New Product Title"
 *     }
 *   }
 * });
 * 
 * Note: This mutation uses the current productUpdate API with ProductUpdateInput.
 * The 'input' argument is deprecated - use 'product' instead.
 */
export const UPDATE_PRODUCT_TITLE = `
  mutation updateProductTitle($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product {
        id
        title
      }
      userErrors {
        field
        message
      }
    }
  }
`;

/**
 * Create a new product
 * This is a placeholder - MCP can generate more complex mutations
 */
export const CREATE_PRODUCT = `
  mutation productCreate($input: ProductInput!) {
    productCreate(input: $input) {
      product {
        id
        title
        handle
      }
      userErrors {
        field
        message
      }
    }
  }
`;
