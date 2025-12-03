import { Outlet, useLoaderData, useRouteError } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const apiKey = process.env.SHOPIFY_API_KEY;
  console.log("Loader: SHOPIFY_API_KEY present?", Boolean(apiKey));

  if (!apiKey) {
    console.error("Loader: SHOPIFY_API_KEY is missing!");
  }

  // eslint-disable-next-line no-undef
  return { apiKey: apiKey || "" };
};

import { AppProvider as PolarisAppProvider } from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import "../styles/polaris-overrides.css";
import translations from "@shopify/polaris/locales/en.json";

export default function App() {
  const { apiKey } = useLoaderData();

  return (
    <AppProvider embedded apiKey={apiKey}>
      <PolarisAppProvider i18n={translations}>
        <s-app-nav>
          <s-link href="/app">Home</s-link>
          <s-link href="/app/labels">Labels</s-link>
          <s-link href="/app/preferences">Preferences</s-link>
          <s-link href="/app/pricing-plans">Pricing plans</s-link>
        </s-app-nav>
        <Outlet />
      </PolarisAppProvider>
    </AppProvider>
  );
}

// Shopify needs React Router to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
