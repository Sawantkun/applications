import { useCallback, useEffect, useMemo, useState } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import QRCode from "qrcode";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  DataTable,
  Thumbnail,
} from "@shopify/polaris";

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const [payload, setPayload] = useState("https://blackbytt.com");
  const [label, setLabel] = useState("Scan to explore BlackBytt");
  const [size, setSize] = useState(280);
  const [foreground, setForeground] = useState("#0b0d17");
  const [background, setBackground] = useState("#ffffff");
  const [qrData, setQrData] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  // Store Products State
  const [storeProducts, setStoreProducts] = useState([]);

  useEffect(() => {
    async function loadRealProducts() {
      const res = await fetch("/api/shopify-products");
      const data = await res.json();
      // Ensure data is an array before setting it
      if (Array.isArray(data)) {
        setStoreProducts(data);
      } else if (data.products && Array.isArray(data.products)) {
        // Handle case where API returns { products: [...] }
        setStoreProducts(data.products);
      } else {
        console.error("Unexpected API response:", data);
        setStoreProducts([]);
      }
    }
    loadRealProducts();
  }, []);

  const qrDescription = useMemo(() => {
    try {
      const url = new URL(payload || "https://blackbytt.com");
      return `QR for ${url.hostname}`;
    } catch {
      return "QR preview";
    }
  }, [payload]);

  const generateQRCode = useCallback(async () => {
    if (!payload) {
      setError("Enter a URL or text to encode.");
      return;
    }

    setIsGenerating(true);
    setError("");
    try {
      const dataUrl = await QRCode.toDataURL(payload, {
        margin: 1,
        width: Number(size),
        color: {
          dark: foreground,
          light: background,
        },
      });
      setQrData(dataUrl);
    } catch (err) {
      setError("We couldn’t generate that QR code. Try different settings.");
    } finally {
      setIsGenerating(false);
    }
  }, [background, foreground, payload, size]);

  useEffect(() => {
    generateQRCode();
  }, [generateQRCode]);

  const downloadImage = () => {
    if (!qrData) return;
    const link = document.createElement("a");
    link.href = qrData;
    link.download = `blackbytt-qr-${Date.now()}.png`;
    link.click();
  };

  const copyImage = async () => {
    if (!qrData || !navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(qrData);
  };

  return (
    <Page title="BlackBytt QR generator">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h3" variant="headingMd">
                Customize your QR code
              </Text>
              <s-text-field
                label="Target URL or text"
                value={payload}
                onInput={(event) => setPayload(event.target.value)}
                helpText="Paste any product page, discount, or flow URL."
                autoComplete="off"
              />
              <s-text-field
                label="Label (optional)"
                value={label}
                onInput={(event) => setLabel(event.target.value)}
                autoComplete="off"
              />
              <InlineStack gap="400">
                <s-text-field
                  label="Size (px)"
                  type="number"
                  min="140"
                  max="520"
                  value={size}
                  onInput={(event) => setSize(event.target.value)}
                />
                <s-text-field
                  label="Foreground"
                  type="color"
                  value={foreground}
                  onInput={(event) => setForeground(event.target.value)}
                />
                <s-text-field
                  label="Background"
                  type="color"
                  value={background}
                  onInput={(event) => setBackground(event.target.value)}
                />
              </InlineStack>
              {error && (
                <s-banner status="critical" title="Generation issue">
                  {error}
                </s-banner>
              )}
              <s-button onClick={generateQRCode} loading={isGenerating}>
                Generate QR
              </s-button>
            </BlockStack>
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="400" align="center">
              <Text as="h3" variant="headingMd">
                Preview
              </Text>
              {qrData ? (
                <img
                  src={qrData}
                  width={size}
                  height={size}
                  alt={qrDescription}
                  style={{ borderRadius: "16px", background }}
                />
              ) : (
                <Text>Provide details to generate your QR code.</Text>
              )}
              {label && <Text>{label}</Text>}
              <InlineStack gap="400">
                <s-button
                  onClick={downloadImage}
                  variant="primary"
                  disabled={!qrData}
                >
                  Download PNG
                </s-button>
                <s-button
                  onClick={copyImage}
                  variant="secondary"
                  disabled={!qrData}
                >
                  Copy data URL
                </s-button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Store Products
              </Text>
              {storeProducts.length === 0 ? (
                <Text color="subdued">(Products from Shopify will appear here)</Text>
              ) : (
                <DataTable
                  columnContentTypes={["text", "text", "numeric", "text"]}
                  headings={["Image", "Title", "Price", "Status"]}
                  rows={storeProducts.map((product) => [
                    product.image ? (
                      <Thumbnail
                        source={product.image.src}
                        alt={product.title}
                        size="small"
                      />
                    ) : (
                      ""
                    ),
                    product.title,
                    product.variants && product.variants[0]
                      ? `$${product.variants[0].price}`
                      : "-",
                    product.status,
                  ])}
                />
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
