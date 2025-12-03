import { useState } from "react";
import { Page, Layout, Card, BlockStack, InlineStack, Text, Button, Divider } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useLoaderData, useNavigate, Link, redirect } from "react-router";

export const loader = async ({ request }) => {
    await authenticate.admin(request);

    const url = new URL(request.url);
    const planName = url.searchParams.get("plan") || "Basic";
    const planPrice = url.searchParams.get("price") || "Free";
    const billingCycle = url.searchParams.get("cycle") || "monthly";

    // Define plan features
    const planFeatures = {
        Basic: [
            "Upto 25 Static Labels",
            "Upto 25 Animated Labels",
            "Flexible Label Placement",
            "Unlimited Products"
        ],
        Premium: [
            "Upto 50 Static Labels",
            "Upto 50 Animated labels",
            "Flexible Label Placement",
            "Unlimited Products"
        ]
    };

    return {
        planName,
        planPrice,
        billingCycle,
        features: planFeatures[planName] || planFeatures.Basic
    };
};

export const action = async ({ request }) => {
    const { session } = await authenticate.admin(request);

    // Here you would integrate with Shopify Billing API
    // For now, we'll just redirect back to pricing with a success message

    return redirect("/app/pricing-plans?payment=success");
};

export default function ConfirmPayment() {
    const { planName, planPrice, billingCycle, features } = useLoaderData();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);

    const handleConfirmPayment = async () => {
        setProcessing(true);

        // Simulate payment processing
        setTimeout(() => {
            navigate("/app/pricing-plans?payment=success");
        }, 1500);
    };

    const isPremium = planName === "Premium";
    const displayPrice = planPrice === "Free" ? "Free" : `$${planPrice}`;
    const originalPrice = isPremium && billingCycle === "annually" ? "$120" : null;

    return (
        <Page
            title="Confirm Payment"
            backAction={{ content: "Back to pricing", url: "/app/pricing-plans" }}
        >
            <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px 0" }}>
                <Layout>
                    <Layout.Section>
                        <Card padding="600">
                            <BlockStack gap="600">
                                {/* Plan Summary */}
                                <BlockStack gap="400">
                                    <Text variant="headingLg" as="h2">
                                        Order Summary
                                    </Text>

                                    <div style={{
                                        background: "#f6f6f7",
                                        borderRadius: "12px",
                                        padding: "24px"
                                    }}>
                                        <BlockStack gap="300">
                                            <InlineStack align="space-between">
                                                <Text variant="headingMd" as="h3">
                                                    {planName} Plan
                                                </Text>
                                                {isPremium && (
                                                    <div style={{
                                                        background: "#FF5C5C",
                                                        color: "white",
                                                        padding: "4px 12px",
                                                        borderRadius: "4px",
                                                        fontSize: "12px",
                                                        fontWeight: "bold"
                                                    }}>
                                                        10% OFF
                                                    </div>
                                                )}
                                            </InlineStack>

                                            <Text tone="subdued">
                                                Billing cycle: {billingCycle === "monthly" ? "Monthly" : "Annually"}
                                            </Text>

                                            <Divider />

                                            <BlockStack gap="200">
                                                <Text variant="bodyMd" fontWeight="semibold">
                                                    Plan includes:
                                                </Text>
                                                {features.map((feature, index) => (
                                                    <InlineStack key={index} gap="200" align="start">
                                                        <div style={{
                                                            background: "#FFD7D7",
                                                            borderRadius: "50%",
                                                            width: "20px",
                                                            height: "20px",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            flexShrink: 0,
                                                            marginTop: "2px"
                                                        }}>
                                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D82C2C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                                <polyline points="20 6 9 17 4 12"></polyline>
                                                            </svg>
                                                        </div>
                                                        <Text variant="bodyMd">{feature}</Text>
                                                    </InlineStack>
                                                ))}
                                            </BlockStack>
                                        </BlockStack>
                                    </div>
                                </BlockStack>

                                <Divider />

                                {/* Price Breakdown */}
                                <BlockStack gap="300">
                                    <Text variant="headingMd" as="h3">
                                        Price Details
                                    </Text>

                                    <InlineStack align="space-between">
                                        <Text variant="bodyMd">Subtotal</Text>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            {originalPrice && (
                                                <Text variant="bodyMd" tone="subdued">
                                                    <s>{originalPrice}</s>
                                                </Text>
                                            )}
                                            <Text variant="bodyMd" fontWeight="semibold">
                                                {displayPrice}
                                            </Text>
                                        </div>
                                    </InlineStack>

                                    {isPremium && billingCycle === "annually" && (
                                        <InlineStack align="space-between">
                                            <Text variant="bodyMd" tone="success">
                                                Annual discount (25%)
                                            </Text>
                                            <Text variant="bodyMd" tone="success" fontWeight="semibold">
                                                -$30
                                            </Text>
                                        </InlineStack>
                                    )}

                                    <Divider />

                                    <InlineStack align="space-between">
                                        <Text variant="headingMd" as="h3">
                                            Total
                                        </Text>
                                        <Text variant="headingLg" as="h2">
                                            {displayPrice}
                                            {planPrice !== "Free" && (
                                                <Text variant="bodySm" tone="subdued" as="span">
                                                    {" "}/{billingCycle === "monthly" ? "month" : "year"}
                                                </Text>
                                            )}
                                        </Text>
                                    </InlineStack>
                                </BlockStack>

                                <Divider />

                                {/* Payment Method (Placeholder) */}
                                {planPrice !== "Free" && (
                                    <BlockStack gap="300">
                                        <Text variant="headingMd" as="h3">
                                            Payment Method
                                        </Text>
                                        <div style={{
                                            border: "1px solid #c9cccf",
                                            borderRadius: "8px",
                                            padding: "16px",
                                            background: "#fafbfb"
                                        }}>
                                            <InlineStack gap="300" align="center">
                                                <div style={{
                                                    width: "40px",
                                                    height: "28px",
                                                    background: "#000",
                                                    borderRadius: "4px",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "#fff",
                                                    fontSize: "10px",
                                                    fontWeight: "bold"
                                                }}>
                                                    CARD
                                                </div>
                                                <BlockStack gap="100">
                                                    <Text variant="bodyMd" fontWeight="semibold">
                                                        Shopify Payments
                                                    </Text>
                                                    <Text variant="bodySm" tone="subdued">
                                                        Payment will be processed through Shopify
                                                    </Text>
                                                </BlockStack>
                                            </InlineStack>
                                        </div>
                                    </BlockStack>
                                )}

                                {/* Action Buttons */}
                                <BlockStack gap="300">
                                    <Button
                                        variant="primary"
                                        size="large"
                                        fullWidth
                                        onClick={handleConfirmPayment}
                                        loading={processing}
                                        tone="critical"
                                    >
                                        {planPrice === "Free" ? "Activate Free Plan" : "Confirm Payment"}
                                    </Button>

                                    <Link to="/app/pricing-plans" style={{ textDecoration: "none" }}>
                                        <Button
                                            variant="plain"
                                            size="large"
                                            fullWidth
                                        >
                                            Back to pricing plans
                                        </Button>
                                    </Link>
                                </BlockStack>

                                {/* Terms */}
                                <div style={{
                                    background: "#f6f6f7",
                                    borderRadius: "8px",
                                    padding: "16px"
                                }}>
                                    <Text variant="bodySm" tone="subdued" alignment="center">
                                        By confirming, you agree to our Terms of Service and Privacy Policy.
                                        {planPrice !== "Free" && " Your subscription will auto-renew until cancelled."}
                                    </Text>
                                </div>
                            </BlockStack>
                        </Card>
                    </Layout.Section>

                    {/* Side Panel - Why Choose This Plan */}
                    <Layout.Section variant="oneThird">
                        <Card padding="500">
                            <BlockStack gap="400">
                                <Text variant="headingMd" as="h3">
                                    Why choose {planName}?
                                </Text>

                                <BlockStack gap="300">
                                    <div>
                                        <Text variant="bodyMd" fontWeight="semibold">
                                            ✨ Easy to use
                                        </Text>
                                        <Text variant="bodySm" tone="subdued">
                                            Set up beautiful labels in minutes without any coding
                                        </Text>
                                    </div>

                                    <div>
                                        <Text variant="bodyMd" fontWeight="semibold">
                                            🎨 Fully customizable
                                        </Text>
                                        <Text variant="bodySm" tone="subdued">
                                            Upload your own designs or use text labels
                                        </Text>
                                    </div>

                                    <div>
                                        <Text variant="bodyMd" fontWeight="semibold">
                                            📈 Boost conversions
                                        </Text>
                                        <Text variant="bodySm" tone="subdued">
                                            Highlight products and increase sales with eye-catching labels
                                        </Text>
                                    </div>

                                    {isPremium && (
                                        <div>
                                            <Text variant="bodyMd" fontWeight="semibold">
                                                ⚡ Premium features
                                            </Text>
                                            <Text variant="bodySm" tone="subdued">
                                                Get access to more labels and advanced customization
                                            </Text>
                                        </div>
                                    )}
                                </BlockStack>

                                <Divider />

                                <BlockStack gap="200">
                                    <Text variant="bodyMd" fontWeight="semibold">
                                        Need help?
                                    </Text>
                                    <Text variant="bodySm" tone="subdued">
                                        Contact our support team at theblacklabgroup@gmail.com
                                    </Text>
                                </BlockStack>
                            </BlockStack>
                        </Card>
                    </Layout.Section>
                </Layout>
            </div>
        </Page>
    );
}
