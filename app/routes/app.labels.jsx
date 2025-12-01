import {
  BlockStack,
  Card,
  Divider,
  InlineStack,
  Page,
  Text,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

const steps = [
  {
    title: "Step 1: Integrate our app into your Shopify theme.",
    body: "Open the theme editor, click “Enable app embed,” then save the changes so the app can surface inside your storefront.",
    action: "Enable app embed",
  },
  {
    title: "Step 2: Create your label.",
    body: "Head to the Labels tab, press “Create label,” then tailor the badge colors, copy, and placements for your brand.",
    action: "Create label",
  },
  {
    title: "Step 3: Publish your label.",
    body: "Save your changes and activate the label. If you don’t see it on your theme, reach out so we can help right away.",
    action: "Manage label",
  },
];

function StepCard({ title, body, action }) {
  return (
    <Card padding="400" background="bg-surface-secondary">
      <BlockStack gap="300">
        <div
          style={{
            alignSelf: "center",
            width: "90px",
            height: "90px",
            borderRadius: "18px",
            background:
              "linear-gradient(135deg, #f7c948 0%, #ffe58a 55%, #fff2c2 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            color: "#1c1b1f",
          }}
        >
          BB
        </div>
        <BlockStack gap="200">
          <Text variant="headingMd" as="h3">
            {title}
          </Text>
          <Text tone="subdued">{body}</Text>
        </BlockStack>
        <Button fullWidth>{action}</Button>
      </BlockStack>
    </Card>
  );
}

export default function LabelsPage() {
  return (
    <Page title="BlackBytt Labels" subtitle="Launch high-converting badges in minutes.">
      <BlockStack gap="600">
        <Card padding="500">
          <BlockStack gap="300">
            <Text variant="headingLg" as="h1">
              Welcome to BlackBytt Labels
            </Text>
            <Text tone="subdued">
              Follow the guided workflow below or jump directly into the Labels
              builder to start showcasing your offers, shipping perks, and social
              proof right on the storefront.
            </Text>
          </BlockStack>
        </Card>

        <InlineStack gap="400" wrap={true} align="stretch">
          {steps.map((step) => (
            <div key={step.title} style={{ flex: "1 1 280px" }}>
              <StepCard {...step} />
            </div>
          ))}
        </InlineStack>

        <Card padding="500">
          <InlineStack align="space-between" gap="400" wrap={true}>
            <BlockStack gap="200">
              <Text variant="headingMd">Installation Guide</Text>
              <Text tone="subdued">
                Need to share setup instructions with teammates? Download the
                quick-start PDF that covers embed activation, label creation, and
                troubleshooting.
              </Text>
            </BlockStack>
            <Button variant="primary">Read Installation Guide</Button>
          </InlineStack>
        </Card>

        <Card padding="500">
          <InlineStack gap="400" align="space-between" wrap={true}>
            <BlockStack gap="200">
              <Text variant="headingMd">Support</Text>
              <Text tone="subdued">
                Prefer a walkthrough or have a custom requirement? Our team is a
                message away at theblacklabgroup@gmail.com.
              </Text>
            </BlockStack>
            <Button>Contact</Button>
          </InlineStack>
          <Divider />
          <Text tone="subdued" as="p">
            Response time is typically under 24 hours on business days.
          </Text>
        </Card>
      </BlockStack>
    </Page>
  );
}

