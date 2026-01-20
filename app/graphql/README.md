# GraphQL Queries and Mutations

This folder is organized for MCP-generated GraphQL queries and mutations.

## Folder Structure

```
graphql/
├── queries/          # GraphQL queries (read operations)
│   ├── products.js   # Product-related queries
│   ├── orders.js     # Order-related queries
│   └── customers.js  # Customer-related queries
├── mutations/        # GraphQL mutations (write operations)
│   ├── products.js   # Product-related mutations
│   ├── orders.js     # Order-related mutations
│   └── customers.js  # Customer-related mutations
└── README.md         # This file
```

## Using MCP to Generate GraphQL

Ask your AI assistant (with MCP enabled) to generate GraphQL queries or mutations:

### Example Requests:
- "Generate a GraphQL query to fetch products with pagination"
- "Create a mutation to update a product's title"
- "Build a query to get order details with line items"
- "Create a mutation to create a new product variant"

## Code Organization

### Option 1: Separate Files (Recommended for larger apps)
Store queries/mutations in separate files and import them:

```javascript
// app/graphql/queries/products.js
export const GET_PRODUCTS = `
  query getProducts($first: Int!) {
    products(first: $first) {
      edges {
        node {
          id
          title
        }
      }
    }
  }
`;

// app/routes/api.shopify-products.jsx
import { GET_PRODUCTS } from "../graphql/queries/products.js";
const response = await admin.graphql(GET_PRODUCTS, { variables: { first: 10 } });
```

### Option 2: Inline in Routes (Current approach)
Keep queries directly in route files (as shown in `app/routes/api.shopify-products.jsx`):

```javascript
const response = await admin.graphql(`
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
```

## Important Notes

- MCP helps generate accurate GraphQL code based on Shopify's schema
- You can organize code however fits your project structure
- MCP is a development tool only, not a runtime dependency
- Generated code should follow Shopify's GraphQL best practices

## Resources

- [Shopify Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)
- [Shopify Dev MCP Documentation](https://shopify.dev/docs/apps/build/devmcp)
