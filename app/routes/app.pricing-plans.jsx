import { useState } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
  Divider,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, Link, useSearchParams } from "react-router";
import { billingPlans } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  const url = new URL(request.url);
  const paymentSuccess = url.searchParams.get("payment") === "success";

  return {
    billingPlans,
    paymentSuccess,
  };
};

export default function PricingPlans() {
  const { billingPlans, paymentSuccess } = useLoaderData();
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [searchParams] = useSearchParams();

  const handleSelectPlan = (planKey, plan) => {
    const price =
      billingCycle === "monthly"
        ? plan.amount
        : planKey === "premiumAnnual"
        ? plan.amount
        : plan.amount * 12;
    const cycle = billingCycle === "monthly" ? "monthly" : "annually";

    // Navigate to confirm payment page
    window.location.href = `/app/confirm-payment?plan=${plan.name}&price=${price}&cycle=${cycle}`;
  };

  const planFeatures = {
    basic: [
      "Up to 25 Static Labels",
      "Up to 25 Animated Labels",
      "Flexible Label Placement",
      "Unlimited Products",
      "Basic Support",
    ],
    premium: [
      "Up to 50 Static Labels",
      "Up to 50 Animated Labels",
      "Flexible Label Placement",
      "Unlimited Products",
      "Priority Support",
      "Advanced Customization",
      "Analytics Dashboard",
    ],
  };

  return (
    <Page
      title="Pricing Plans"
      subtitle="Choose the plan that fits your needs"
    >
      {paymentSuccess && (
        <div
          style={{
            marginBottom: "16px",
            padding: "12px 16px",
            background: "#D4F4DD",
            borderRadius: "8px",
            border: "1px solid #108043",
          }}
        >
          <Text tone="success" fontWeight="semibold">
            ✅ Payment successful! Your plan has been activated.
          </Text>
        </div>
      )}

      {/* Billing Cycle Toggle - Compact */}
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
        <div
          style={{
            display: "inline-flex",
            background: "#f6f6f7",
            borderRadius: "8px",
            padding: "4px",
            gap: "4px",
          }}
        >
          <button
            onClick={() => setBillingCycle("monthly")}
            style={{
              padding: "8px 20px",
              borderRadius: "6px",
              border: "none",
              background: billingCycle === "monthly" ? "#fff" : "transparent",
              color: billingCycle === "monthly" ? "#000" : "#6d7175",
              fontWeight: billingCycle === "monthly" ? "600" : "400",
              cursor: "pointer",
              fontSize: "14px",
              boxShadow: billingCycle === "monthly" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annually")}
            style={{
              padding: "8px 20px",
              borderRadius: "6px",
              border: "none",
              background: billingCycle === "annually" ? "#fff" : "transparent",
              color: billingCycle === "annually" ? "#000" : "#6d7175",
              fontWeight: billingCycle === "annually" ? "600" : "400",
              cursor: "pointer",
              fontSize: "14px",
              boxShadow: billingCycle === "annually" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            Annual
            <span
              style={{
                background: "#108043",
                color: "#fff",
                fontSize: "10px",
                padding: "2px 6px",
                borderRadius: "4px",
                fontWeight: "600",
              }}
            >
              Save 25%
            </span>
          </button>
        </div>
      </div>

      <Layout>

        {/* Basic Plan */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="300">
                <Text variant="headingLg" as="h2">
                  {billingPlans.basic.name}
                </Text>
                <div>
                  <Text variant="heading2xl" as="span">
                    ${billingPlans.basic.amount}
                  </Text>
                  <Text variant="bodyMd" tone="subdued" as="span">
                    /month
                  </Text>
                </div>
                {billingPlans.basic.trialDays > 0 && (
                  <Text variant="bodySm" tone="subdued">
                    {billingPlans.basic.trialDays}-day free trial
                  </Text>
                )}
              </BlockStack>

              <Divider />

              <BlockStack gap="200">
                {planFeatures.basic.map((feature, index) => (
                  <Text key={index} variant="bodyMd">
                    • {feature}
                  </Text>
                ))}
              </BlockStack>

              <div style={{ marginTop: "auto", paddingTop: "16px" }}>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleSelectPlan("basic", billingPlans.basic)}
                >
                  Get Started
                </Button>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Premium Plan */}
        <Layout.Section variant="oneThird">
          <Card>
            <div
              style={{
                position: "relative",
                border: "2px solid #108043",
                borderRadius: "8px",
                padding: "20px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  right: "20px",
                  background: "#108043",
                  color: "#fff",
                  padding: "4px 12px",
                  borderRadius: "4px",
                  fontSize: "12px",
                  fontWeight: "600",
                }}
              >
                Popular
              </div>
              <BlockStack gap="400">
                <BlockStack gap="300">
                  <Text variant="headingLg" as="h2">
                    {billingPlans.premium.name}
                  </Text>
                  <div>
                    {billingCycle === "annually" ? (
                      <>
                        <Text variant="heading2xl" as="span">
                          ${Math.round(billingPlans.premiumAnnual.amount / 12)}
                        </Text>
                        <Text variant="bodyMd" tone="subdued" as="span">
                          /month
                        </Text>
                        <div>
                          <Text variant="bodySm" tone="subdued">
                            Billed ${billingPlans.premiumAnnual.amount}/year
                          </Text>
                        </div>
                      </>
                    ) : (
                      <>
                        <Text variant="heading2xl" as="span">
                          ${billingPlans.premium.amount}
                        </Text>
                        <Text variant="bodyMd" tone="subdued" as="span">
                          /month
                        </Text>
                      </>
                    )}
                  </div>
                  {billingPlans.premium.trialDays > 0 && (
                    <Text variant="bodySm" tone="subdued">
                      {billingPlans.premium.trialDays}-day free trial
                    </Text>
                  )}
                </BlockStack>

                <Divider />

                <BlockStack gap="200">
                  {planFeatures.premium.map((feature, index) => (
                    <Text key={index} variant="bodyMd">
                      • {feature}
                    </Text>
                  ))}
                </BlockStack>

                <div style={{ marginTop: "auto", paddingTop: "16px" }}>
                  <Button
                    variant="primary"
                    fullWidth
                    tone="critical"
                    onClick={() =>
                      handleSelectPlan(
                        billingCycle === "annually" ? "premiumAnnual" : "premium",
                        billingCycle === "annually"
                          ? billingPlans.premiumAnnual
                          : billingPlans.premium
                      )
                    }
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </BlockStack>
            </div>
          </Card>
        </Layout.Section>

        {/* Free Plan */}
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400">
              <BlockStack gap="300">
                <Text variant="headingLg" as="h2">
                  Free
                </Text>
                <div>
                  <Text variant="heading2xl" as="span">
                    $0
                  </Text>
                  <Text variant="bodyMd" tone="subdued" as="span">
                    /forever
                  </Text>
                </div>
                <Text variant="bodySm" tone="subdued">
                  Limited Features
                </Text>
              </BlockStack>

              <Divider />

              <BlockStack gap="200">
                <Text variant="bodyMd">• Up to 5 Static Labels</Text>
                <Text variant="bodyMd">• Basic Placement</Text>
                <Text variant="bodyMd">• Community Support</Text>
              </BlockStack>

              <div style={{ marginTop: "auto", paddingTop: "16px" }}>
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={() =>
                    handleSelectPlan("free", {
                      name: "Free",
                      amount: 0,
                    })
                  }
                >
                  Continue with Free
                </Button>
              </div>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
