import { AppProvider } from "@shopify/shopify-app-react-router/react";
import { useState } from "react";
import { Form, useActionData, useLoaderData } from "react-router";
import { login } from "../../shopify.server";
import { loginErrorMessage } from "./error.server";

/**
 * ============================================================================
 * OAUTH ENTRY POINT (Install → Redirect)
 * ============================================================================
 * 
 * This is where OAuth actually starts. When a merchant installs your app:
 * 
 * 1. Merchant enters their shop domain (e.g., "my-store.myshopify.com")
 * 2. Form submits to this route
 * 3. login(request) is called → Redirects to Shopify OAuth approval screen
 * 4. Merchant approves permissions on Shopify
 * 5. Shopify redirects back to /auth/callback with authorization code
 * 
 * The shop parameter is extracted from the form and used to redirect to
 * the correct Shopify OAuth URL for that store.
 */
export const loader = async ({ request }) => {
  // login() checks if OAuth is needed and redirects if necessary
  const errors = loginErrorMessage(await login(request));

  return { errors };
};

export const action = async ({ request }) => {
  // When form is submitted, login() redirects merchant to Shopify OAuth
  // The shop parameter from the form is used to build the OAuth URL
  const errors = loginErrorMessage(await login(request));

  return {
    errors,
  };
};

export default function Auth() {
  const loaderData = useLoaderData();
  const actionData = useActionData();
  const [shop, setShop] = useState("");
  const { errors } = actionData || loaderData;

  return (
    <AppProvider embedded={false}>
      <s-page>
        <Form method="post">
          <s-section heading="Log in">
            <s-text-field
              name="shop"
              label="Shop domain"
              details="example.myshopify.com"
              value={shop}
              onChange={(e) => setShop(e.currentTarget.value)}
              autocomplete="on"
              error={errors.shop}
            ></s-text-field>
            <s-button type="submit">Log in</s-button>
          </s-section>
        </Form>
      </s-page>
    </AppProvider>
  );
}
