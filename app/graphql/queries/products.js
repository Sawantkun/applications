/**
 * Product GraphQL Queries
 * 
 * This file contains GraphQL queries for product operations.
 * These queries can be generated using Shopify Dev MCP.
 * 
 * Example MCP requests:
 * - "Generate a GraphQL query to fetch products with pagination"
 * - "Create a query to get product details with variants and images"
 * - "Build a query to search products by title"
 */

/**
 * Get products with basic information
 * Usage: Import and use in route loaders
 * 
 * Example:
 * import { GET_PRODUCTS } from "../graphql/queries/products.js";
 * const response = await admin.graphql(GET_PRODUCTS, { 
 *   variables: { first: 10 } 
 * });
 */
export const GET_PRODUCTS = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
          handle
          status
        }
      }
    }
  }
`;

/**
 * Get product with full details including variants and images
 * This is a placeholder - MCP can generate more complex queries
 */
export const GET_PRODUCT_DETAILS = `
  query getProductDetails($id: ID!) {
    product(id: $id) {
      id
      title
      description
      handle
      status
      variants(first: 10) {
        edges {
          node {
            id
            title
            price
            sku
          }
        }
      }
      images(first: 10) {
        edges {
          node {
            id
            url
            altText
          }
        }
      }
    }
  }
`;
