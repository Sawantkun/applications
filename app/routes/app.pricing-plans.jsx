import { useState } from "react";
import { Page, Layout, Text, Button, InlineStack, BlockStack, Card } from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { Link } from "react-router";

export const loader = async ({ request }) => {
    await authenticate.admin(request);
    return null;
};

export default function PricingPlans() {
    const [billingCycle, setBillingCycle] = useState("monthly");

    const handleToggle = (cycle) => {
        setBillingCycle(cycle);
    };

    return (
        <Page>
            <div style={{ padding: "20px 0" }}>
                <Text variant="headingXl" as="h1">
                    Pricing plans
                </Text>
            </div>

            <div style={{
                background: "#fff",
                borderRadius: "16px",
                padding: "40px",
                boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)",
                margin: "0 auto",
                width: "100%",
            }}>
                <BlockStack gap="800" align="center">
                    <BlockStack gap="400" align="center">
                        <Text variant="heading2xl" as="h2" alignment="center">
                            Plans and Pricing
                        </Text>
                        <Text variant="bodyLg" as="p" tone="subdued" alignment="center">
                            Current Plan : Demo
                        </Text>

                        <div style={{ position: "relative", marginTop: "10px", display: "flex", justifyContent: "center", width: "100%" }}>
                            <div style={{
                                background: "#FCEEA1",
                                borderRadius: "30px",
                                padding: "5px",
                                display: "inline-flex",
                                position: "relative",
                                zIndex: 1
                            }}>
                                <button
                                    onClick={() => handleToggle("monthly")}
                                    style={{
                                        background: billingCycle === "monthly" ? "#FCEEA1" : "transparent",
                                        border: "none",
                                        padding: "8px 20px",
                                        borderRadius: "25px",
                                        cursor: "pointer",
                                        fontWeight: billingCycle === "monthly" ? "bold" : "normal",
                                        fontSize: "14px"
                                    }}
                                >
                                    Monthly
                                </button>
                                <button
                                    onClick={() => handleToggle("annually")}
                                    style={{
                                        background: billingCycle === "annually" ? "#FFD700" : "transparent",
                                        border: "none",
                                        padding: "8px 20px",
                                        borderRadius: "25px",
                                        cursor: "pointer",
                                        fontWeight: billingCycle === "annually" ? "bold" : "normal",
                                        fontSize: "14px"
                                    }}
                                >
                                    Annually
                                </button>
                            </div>

                            <div style={{
                                position: "absolute",
                                top: "-35px",
                                right: "300px",
                                background: "#FCEEA1",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "bold"
                            }}>
                                25% off on annual plan
                                <svg width="30" height="30" viewBox="0 0 50 50" style={{ position: "absolute", left: "-25px", top: "5px", transform: "rotate(10deg)" }}>
                                    <path d="M 30 10 Q 10 30 30 40" stroke="black" fill="transparent" strokeWidth="1.5" />
                                    <path d="M 28 38 L 30 40 L 32 37" stroke="black" fill="transparent" strokeWidth="1.5" />
                                </svg>
                            </div>
                        </div>
                    </BlockStack>

                    <InlineStack gap="800" align="center" blockAlign="start">
                        {/* Basic Plan */}
                        <div style={{
                            border: "1px solid #e1e3e5",
                            borderRadius: "16px",
                            padding: "30px",
                            width: "320px",
                            minHeight: "450px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between"
                        }}>
                            <BlockStack gap="400">
                                <InlineStack align="space-between" blockAlign="center">
                                    <Text variant="headingxl" as="h3">Basic</Text>
                                    <div style={{ background: "#E4F0FF", color: "#005BD3", padding: "4px 8px", borderRadius: "4px", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}>
                                        Current Plan
                                    </div>
                                </InlineStack>

                                <div style={{ minHeight: "60px" }}>
                                    <Text variant="heading2xl" as="p" tone="critical">Free</Text>
                                </div>

                                <Text tone="subdued" as="p">
                                    "Experience essential features with our free plan, no strings attached."
                                </Text>

                                <BlockStack gap="200">
                                    <PlanFeature text="Upto 25 Static Labels" />
                                    <PlanFeature text="Upto 25 Animated Labels" />
                                    <PlanFeature text="Flexible Label Placement" />
                                    <PlanFeature text="Unlimited Products" />
                                </BlockStack>
                            </BlockStack>

                            <div style={{ marginTop: "20px" }}>
                                <Link to="/app/confirm-payment?plan=Basic&price=Free&cycle=monthly" style={{ textDecoration: "none" }}>
                                    <button style={{
                                        width: "100%",
                                        background: "#000",
                                        color: "#fff",
                                        border: "none",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "bold"
                                    }}>
                                        Join for free
                                    </button>
                                </Link>
                            </div>
                        </div>

                        {/* Premium Plan */}
                        <div style={{
                            border: "2px solid #4A90E2",
                            borderRadius: "16px",
                            padding: "30px",
                            width: "320px",
                            minHeight: "450px",
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "space-between",
                            position: "relative",
                            boxShadow: "0 4px 12px rgba(74, 144, 226, 0.15)"
                        }}>
                            <div style={{
                                position: "absolute",
                                top: "-10px",
                                right: "-10px",
                                background: "#FF5C5C",
                                color: "white",
                                padding: "5px 10px",
                                borderRadius: "4px",
                                fontWeight: "bold",
                                transform: "rotate(10deg)",
                                boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
                            }}>
                                10% <br /><span style={{ fontSize: "10px" }}>OFF</span>
                            </div>

                            <BlockStack gap="400">
                                <Text variant="headingxl" as="h3">Premium</Text>

                                <div style={{ minHeight: "60px", display: "flex", alignItems: "baseline", gap: "10px" }}>
                                    {billingCycle === "annually" && (
                                        <span style={{ textDecoration: "line-through", color: "#8c9196", fontSize: "20px" }}>$120</span>
                                    )}
                                    <Text variant="heading2xl" as="p" tone="critical">
                                        ${billingCycle === "monthly" ? "10" : "90"}
                                    </Text>
                                    <Text variant="bodyMd" tone="subdued">
                                        /{billingCycle === "monthly" ? "month" : "year"}
                                    </Text>
                                </div>

                                <Text tone="subdued" as="p">
                                    "Unlock premium benefits for unparalleled performance."
                                </Text>

                                <BlockStack gap="200">
                                    <PlanFeature text="Upto 50 Static Labels" />
                                    <PlanFeature text="Upto 50 Animated labels" />
                                    <PlanFeature text="Flexible Label Placement" />
                                    <PlanFeature text="Unlimited Products" />
                                </BlockStack>
                            </BlockStack>

                            <div style={{ marginTop: "20px" }}>
                                <Link to={`/app/confirm-payment?plan=Premium&price=${billingCycle === "monthly" ? "10" : "90"}&cycle=${billingCycle}`} style={{ textDecoration: "none" }}>
                                    <button style={{
                                        width: "100%",
                                        background: "#000",
                                        color: "#fff",
                                        border: "none",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        cursor: "pointer",
                                        fontWeight: "bold"
                                    }}>
                                        Upgrade to Pro
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </InlineStack>
                </BlockStack>
            </div>

            <div style={{ marginTop: "40px", marginBottom: "40px" }}>
                <div style={{
                    background: "#fff",
                    borderRadius: "16px",
                    padding: "30px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    margin: "0 auto",
                    boxShadow: "0px 1px 3px rgba(0, 0, 0, 0.1)"
                }}>
                    <div style={{ maxWidth: "60%" }}>
                        <Text variant="headingLg" as="h3" tone="critical">
                            Want to cancel your plan?
                        </Text>
                        <div style={{ marginTop: "10px" }}>
                            <Text tone="subdued" as="p">
                                We understand that circumstances change, and we're here to help.
                            </Text>
                        </div>
                        <div style={{ marginTop: "20px" }}>
                            <button style={{
                                background: "#000",
                                color: "#fff",
                                border: "none",
                                padding: "10px 20px",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "bold",
                                fontSize: "14px"
                            }}>
                                Cancel plan
                            </button>
                        </div>
                    </div>
                    <div>
                        {/* Placeholder for the calendar/cancel icon image */}
                        <div style={{ fontSize: "60px" }}>📅</div>
                    </div>
                </div>
            </div>
        </Page>
    );
}

function PlanFeature({ text }) {
    return (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
                background: "#FFD7D7",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0
            }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D82C2C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            </div>
            <Text variant="bodyMd" as="span" fontWeight="bold">
                {text}
            </Text>
        </div>
    );
}
