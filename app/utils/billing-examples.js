/**
 * ============================================================================
 * SHOPIFY APP BILLING CONFIGURATION
 * ============================================================================
 * 
 * This file demonstrates how to configure billing for your Shopify app.
 * Billing is defined in your shopify.server.js file and controls how
 * merchants pay for your app.
 */

import { authenticate } from "../shopify.server";

/**
 * EXAMPLE: Recurring Subscription Billing Configuration
 * 
 * Recurring billing charges merchants on a regular interval (monthly/yearly).
 * This is the most common billing model for SaaS apps.
 */
export const recurringBillingPlans = {
  // Basic Plan - Monthly
  basic: {
    amount: 9.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS", // or "ANNUAL"
    name: "Basic Plan",
    trialDays: 7, // Optional: free trial period
  },
  
  // Premium Plan - Monthly
  premium: {
    amount: 29.99,
    currencyCode: "USD",
    interval: "EVERY_30_DAYS",
    name: "Premium Plan",
    trialDays: 14,
  },
  
  // Premium Plan - Annual (discounted)
  premiumAnnual: {
    amount: 299.99, // $24.99/month when billed annually
    currencyCode: "USD",
    interval: "ANNUAL",
    name: "Premium Plan (Annual)",
    trialDays: 14,
  },
};

/**
 * EXAMPLE: Free Trial Configuration
 * 
 * Free trials allow merchants to use your app for a period without charge.
 * After the trial ends, they're automatically charged.
 */
export const planWithTrial = {
  amount: 19.99,
  currencyCode: "USD",
  interval: "EVERY_30_DAYS",
  name: "Pro Plan",
  trialDays: 30, // 30-day free trial
};

/**
 * EXAMPLE: Usage-Based Billing
 * 
 * Usage-based billing charges merchants based on their activity.
 * Common for apps that charge per API call, per order, or per product.
 */
export async function createUsageCharge({ request, amount, description }) {
  const { admin, session } = await authenticate.admin(request);
  
  // Create a usage charge for a specific amount
  // This is typically called from a webhook or action
  const response = await admin.graphql(`
    mutation appUsageRecordCreate($subscriptionLineItemId: ID!, $price: MoneyInput!) {
      appUsageRecordCreate(
        subscriptionLineItemId: $subscriptionLineItemId
        price: $price
        description: "${description}"
      ) {
        appUsageRecord {
          id
          price
          description
        }
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      subscriptionLineItemId: "gid://shopify/AppSubscriptionLineItem/123", // Get from active subscription
      price: {
        amount: amount,
        currencyCode: "USD"
      }
    }
  });
  
  return await response.json();
}

/**
 * EXAMPLE: One-Time Charge
 * 
 * One-time charges are for setup fees, one-time services, or upgrades.
 */
export async function createOneTimeCharge({ request, amount, name }) {
  const { admin, session } = await authenticate.admin(request);
  
  const response = await admin.graphql(`
    mutation appPurchaseOneTimeCreate($name: String!, $price: MoneyInput!, $returnUrl: URL!) {
      appPurchaseOneTimeCreate(
        name: $name
        price: $price
        returnUrl: $returnUrl
      ) {
        appPurchaseOneTime {
          id
          name
          price
        }
        confirmationUrl
        userErrors {
          field
          message
        }
      }
    }
  `, {
    variables: {
      name: name,
      price: {
        amount: amount,
        currencyCode: "USD"
      },
      returnUrl: `${process.env.SHOPIFY_APP_URL}/app/confirm-payment`
    }
  });
  
  return await response.json();
}

/**
 * EXAMPLE: Paywall Enforcement
 * 
 * Check if a merchant has an active subscription before allowing access
 * to paid features.
 */
export async function checkBillingStatus({ request }) {
  const { admin, session } = await authenticate.admin(request);
  
  // Query active subscriptions
  const response = await admin.graphql(`
    query {
      currentAppInstallation {
        activeSubscriptions {
          id
          name
          status
          lineItems {
            id
            plan {
              pricingDetails {
                ... on AppRecurringPricing {
                  price {
                    amount
                    currencyCode
                  }
                  interval
                }
              }
            }
          }
        }
      }
    }
  `);
  
  const data = await response.json();
  const subscriptions = data.data?.currentAppInstallation?.activeSubscriptions || [];
  
  // Check if merchant has an active paid subscription
  const hasActiveSubscription = subscriptions.some(
    sub => sub.status === "ACTIVE" && sub.lineItems.length > 0
  );
  
  return {
    hasActiveSubscription,
    subscriptions
  };
}

/**
 * EXAMPLE: Redirect to Billing if Not Subscribed
 * 
 * Use this in route loaders to enforce paywalls.
 */
export async function enforceBilling({ request }) {
  const billingStatus = await checkBillingStatus({ request });
  
  if (!billingStatus.hasActiveSubscription) {
    // Redirect to pricing/upgrade page
    throw new Response(null, {
      status: 302,
      headers: {
        Location: "/app/pricing-plans"
      }
    });
  }
  
  return billingStatus;
}
