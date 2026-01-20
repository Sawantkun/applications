# Recommended Issue Action Extension

This Admin action extension demonstrates how to connect a UI extension to your app's backend.

## Structure

- `shopify.extension.toml` - Extension configuration
- `src/ActionExtension.jsx` - Extension component that fetches data from backend

## How It Works

1. **Extension Location**: Appears in the "More actions" menu on Product detail pages
2. **Backend Route**: `/app/routes/api.recommendedProductIssue.js` provides JSON data
3. **Data Flow**: Extension uses `fetch()` to call backend route with CORS support

## Key Concepts

- **CORS**: Backend route uses `cors()` wrapper from `authenticate.admin()` to allow cross-domain requests
- **Authorization**: Shopify automatically adds Authorization header for your app domain
- **Relative Paths**: Use relative paths like `/api/...` - they resolve against your `app_url`

## Testing

1. Run `shopify app dev`
2. Press `p` to open Dev Console
3. Click preview link for this extension
4. In Shopify Admin: Products → Open a product → More actions → "Recommended Product Issue"
5. Click "Generate suggestion" to see data from backend
