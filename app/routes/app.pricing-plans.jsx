import {
  Badge,
  BlockStack,
  Button,
  Card,
  InlineStack,
  Page,
  Text,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Test labels on a handful of products before upgrading.",
    features: [
      "Up to 3 active labels",
      "Basic color customization",
      "Email support",
    ],
  },
  {
    name: "Growth",
    price: "$19/mo",
    badge: "Popular",
    description: "Ship new campaigns faster with unlimited variations.",
    features: [
      "Unlimited labels",
      "Scheduling & automation",
      "Priority support",
    ],
  },
  {
    name: "Scale",
    price: "$39/mo",
    description: "For teams that need deeper collaboration and analytics.",
    features: [
      "Everything in Growth",
      "Audience targeting",
      "Dedicated success manager",
    ],
  },
];

function PlanCard({ plan }) {
  return (
    <Card padding="500">
      <BlockStack gap="300">
        <InlineStack gap="200" align="space-between">
          <Text variant="headingMd" as="h3">
            {plan.name}
          </Text>
          {plan.badge && <Badge tone="success">{plan.badge}</Badge>}
        </InlineStack>
        <Text variant="headingXl">{plan.price}</Text>
        <Text tone="subdued">{plan.description}</Text>
        <BlockStack as="ul" gap="200">
          {plan.features.map((feature) => (
            <li key={feature}>
              <Text as="span">{feature}</Text>
            </li>
          ))}
        </BlockStack>
        <Button variant="primary">Choose plan</Button>
      </BlockStack>
    </Card>
  );
}

export default function PricingPlansPage() {
  return (
    <Page
      title="Pricing plans"
      subtitle="Pick the package that matches your campaign volume."
    >
      <BlockStack gap="400">
        <InlineStack gap="400" wrap>
          {plans.map((plan) => (
            <div key={plan.name} style={{ flex: "1 1 260px" }}>
              <PlanCard plan={plan} />
            </div>
          ))}
        </InlineStack>
        <Card padding="500">
          <BlockStack gap="200">
            <Text variant="headingMd">Need a custom plan?</Text>
            <Text tone="subdued">
              We partner with high-volume stores to deliver bespoke workflows,
              service-level agreements, and onboarding help.
            </Text>
            <Button>Talk to sales</Button>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

