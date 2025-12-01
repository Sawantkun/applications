import { useState } from "react";
import {
  BlockStack,
  Button,
  Card,
  Checkbox,
  InlineGrid,
  Page,
  Text,
  TextField,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

export default function PreferencesPage() {
  const [brand, setBrand] = useState({
    primaryColor: "#FFD74A",
    accentColor: "#1E1E24",
    fontFamily: "Inter",
  });
  const [notifications, setNotifications] = useState({
    productUpdates: true,
    weeklyDigest: false,
  });

  const handleBrandChange = (field) => (value) => {
    setBrand((prev) => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field) => (checked) => {
    setNotifications((prev) => ({ ...prev, [field]: checked }));
  };

  return (
    <Page
      title="Preferences"
      subtitle="These defaults are applied every time you create a label."
    >
      <BlockStack gap="500">
        <Card padding="500">
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">
              Brand defaults
            </Text>
            <InlineGrid columns={{ xs: 1, sm: 2 }} gap="300">
              <TextField
                label="Primary color"
                type="color"
                value={brand.primaryColor}
                onChange={handleBrandChange("primaryColor")}
                autoComplete="off"
              />
              <TextField
                label="Accent color"
                type="color"
                value={brand.accentColor}
                onChange={handleBrandChange("accentColor")}
                autoComplete="off"
              />
              <TextField
                label="Font family"
                value={brand.fontFamily}
                onChange={handleBrandChange("fontFamily")}
                autoComplete="off"
                helpText="Accepts any system or web-safe font defined in your theme."
              />
            </InlineGrid>
            <Button primary>Save brand defaults</Button>
          </BlockStack>
        </Card>

        <Card padding="500">
          <BlockStack gap="300">
            <Text variant="headingMd" as="h2">
              Notifications
            </Text>
            <Checkbox
              label="Send me product announcements"
              checked={notifications.productUpdates}
              onChange={handleNotificationChange("productUpdates")}
            />
            <Checkbox
              label="Weekly performance digest"
              checked={notifications.weeklyDigest}
              onChange={handleNotificationChange("weeklyDigest")}
            />
            <Text tone="subdued">
              We only send the essentials. Update your preferences any time.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}

