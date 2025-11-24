---
description: Deploy the Shopify application to production
---

# Shopify App Deployment Workflow

This workflow guides you through deploying your Shopify application to production.

## Prerequisites Check

1. Verify Node.js version is compatible (>=20.19 <22 || >=22.12)
```bash
node --version
```

2. Verify Shopify CLI is installed
```bash
shopify version
```

3. Ensure you're logged into Shopify Partners
```bash
shopify auth logout
shopify auth login
```

## Pre-Deployment Steps

4. Install all dependencies
// turbo
```bash
npm install
```

5. Set up the database (generates Prisma client and runs migrations)
// turbo
```bash
npm run setup
```

6. Build the application for production
// turbo
```bash
npm run build
```

7. Test the production build locally (optional but recommended)
```bash
npm run start
```
Press Ctrl+C to stop after testing.

## Configuration

8. Update `shopify.app.toml` with your production URL
- Replace `application_url` with your actual production URL
- Update `redirect_urls` in the `[auth]` section

9. Choose your deployment platform:
   - **Google Cloud Run** (recommended for production): https://shopify.dev/docs/apps/launch/deployment/deploy-to-google-cloud-run
   - **Fly.io** (quick deployment): https://fly.io/docs/js/shopify/
   - **Render** (Docker-based): https://render.com/docs/deploy-shopify-app
   - **Manual** (custom hosting): https://shopify.dev/docs/apps/launch/deployment/deploy-to-hosting-service

## Deployment

10. Deploy app configuration to Shopify
```bash
npm run deploy
```

11. Deploy to your chosen hosting platform
Follow the platform-specific instructions from step 9.

## Environment Variables

12. Set these environment variables on your hosting platform:
- `NODE_ENV=production`
- `SHOPIFY_API_KEY` (from Partners dashboard)
- `SHOPIFY_API_SECRET` (from Partners dashboard)
- `SCOPES=write_products` (or your required scopes)
- `HOST` (your production URL)
- `DATABASE_URL` (if using external database)

## Post-Deployment

13. Verify the app is running
Visit your production URL and check the health.

14. Install the app on a test store
- Go to Shopify Partners dashboard
- Navigate to your app
- Click "Test on development store"
- Install and verify functionality

15. Monitor logs for any errors
Check your hosting platform's logs for issues.

## Troubleshooting

If you encounter "Database tables don't exist" error:
```bash
npm run setup
```

If webhooks fail HMAC validation:
- Ensure webhooks are defined in `shopify.app.toml` (not admin-created)

If you get "nbf claim timestamp check failed":
- Sync your system clock (enable automatic time setting)

## Success!

Your Shopify app should now be deployed and accessible at your production URL.
