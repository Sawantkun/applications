import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Badge,
} from "@shopify/polaris";
import { Link } from "react-router";

export const loader = async ({ request }) => {
  const { session } = await authenticate.admin(request);

  // Get the shop domain for theme customizer URL
  return { shop: session.shop };
};

const steps = [
  {
    title: "Step 1: Integrate our app.",
    description:
      "To enter the Theme Editor page, click the \"Enabled app embed\" button below, then activate our app and click \"Save\".",
    actionLabel: "Enable Label",
    actionUrl: "shopify://admin/themes/current/editor",
    isExternal: true,
    image: "/assets/step1-placeholder.svg",
  },
  {
    title: "Step 2: Create your label.",
    description:
      "To begin the procedure, click the \"Labels\" tab, then \"Create Labels,\" then personalize the label to meet your needs.",
    actionLabel: "Create Label",
    actionUrl: "/app/preferences",
    isExternal: false,
    image: "/assets/step2-placeholder.svg",
  },
  {
    title: "Step 3: Publish your label.",
    description:
      "After you’ve finished designing the label, save and activate it so it appears on your shop. Reach out if it doesn’t show.",
    actionLabel: "Manage label",
    actionUrl: "/app/labels",
    isExternal: false,
    image: "/assets/step3-placeholder.svg",
  },
];

function StepCard({ title, description, actionLabel, actionUrl, isExternal, image }) {
  const handleClick = () => {
    if (isExternal) {
      window.open(actionUrl, '_blank');
    }
  };

  return (
    <div style={{ flex: "1 1 280px", minWidth: 280, }}>
      <Card padding="0">
        <div style={{ scale: "1.05", background: "#f1f2f4", borderTopLeftRadius: "8px", borderTopRightRadius: "8px", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <img src={image} alt={title} style={{ objectFit: "cover" }} />
        </div>
        <div style={{ padding: "1rem" }}>
          <BlockStack gap="300">
            <Text variant="headingMd" as="h3">
              {title}
            </Text>
            <Text tone="subdued">{description}</Text>
            {isExternal ? (
              <div>
                <Button variant="primary" onClick={handleClick}>{actionLabel}</Button>
              </div>
            ) : (
              <Link to={actionUrl} style={{ textDecoration: "none" }}>
                <Button variant="primary">{actionLabel}</Button>
              </Link>
            )}
          </BlockStack>
        </div>
      </Card>
    </div>
  );
}

export default function Index() {
  const handleContactClick = () => {
    window.location.href = "mailto:theblacklabgroup@gmail.com?subject=BlackBytt Labels Support Request";
  };

  const handleInstallationGuide = () => {
    // You can create a separate route for installation guide or link to external documentation
    window.open("https://help.shopify.com/en/manual/online-store/themes/theme-structure/extend/apps", "_blank");
  };

  return (
    <Page
      title="Welcome To Blackbytt labels"
      subtitle="Follow the guided steps below to activate beautifully branded badges in minutes."
    >
      <BlockStack gap="600">
        <Card padding="600">
          <BlockStack gap="400">
            <Text as="h2" variant="headingLg">
              Launch on-brand Shopify badges in three simple steps.
            </Text>
            <Text tone="subdued">
              Use the checklist below to integrate, design, and publish without
              leaving your admin.
            </Text>
            <InlineStack gap="400" wrap={true}>
              {steps.map((step) => (
                <StepCard key={step.title} {...step} />
              ))}
            </InlineStack>
          </BlockStack>
        </Card>

        <Layout>
          <Layout.Section>
            <Card padding="500">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="400" blockAlign="center">
                  <img src="/assets/installation-guide-placeholder.svg" alt="Installation Guide" style={{ width: "60px", height: "60px", objectFit: "contain" }} />
                  <BlockStack gap="200">
                    <Text variant="headingMd">Installation Guide</Text>
                    <Text tone="subdued">
                      Easily install Shopify Badges and Labels. Check the guide for
                      more details.
                    </Text>
                  </BlockStack>
                </InlineStack>
                <Button variant="secondary" onClick={handleInstallationGuide}>Read Installation Guide</Button>
              </InlineStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout padding="600">
          <Layout.Section variant="oneHalf">
            <Card padding="500">
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <BlockStack gap="200">
                    <Text variant="headingMd">Support</Text>
                    <Text tone="subdued">
                      Connect with us anytime at theblacklabgroup@gmail.com.
                    </Text>
                  </BlockStack>
                  <img src="/assets/support-placeholder.svg" alt="Support" style={{ width: "80px", height: "80px", objectFit: "contain" }} />
                </InlineStack>
                <Button variant="primary" onClick={handleContactClick}>Contact</Button>
              </BlockStack>
            </Card>
          </Layout.Section>
          <Layout.Section variant="oneHalf">
            <Card padding="500">
              <BlockStack gap="200">
                <Text variant="headingMd">Need help publishing?</Text>
                <Text tone="subdued">
                  If your label does not appear on your theme, let us know and
                  we will fix it for you.
                </Text>
                <Button onClick={handleContactClick}>Talk to support</Button>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
