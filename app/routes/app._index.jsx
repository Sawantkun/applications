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
  Tabs,
  Button,
  Banner,
} from "@shopify/polaris";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return null;
};

function DashboardSection({ products }) {
  // QR Code Logic (Moved here)
  const [payload, setPayload] = useState("https://blackbytt.com");
  const [label, setLabel] = useState("Scan to explore BlackBytt");
  const [size, setSize] = useState(280);
  const [foreground, setForeground] = useState("#0b0d17");
  const [background, setBackground] = useState("#ffffff");
  const [qrData, setQrData] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

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
        color: { dark: foreground, light: background },
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
    <BlockStack gap="500">
      <Layout>
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <Text as="h2" variant="headingMd">
                Overview
              </Text>
              <InlineStack gap="400" wrap={false}>
                <Card>
                  <BlockStack gap="200">
                    <Text variant="headingSm">Total Products</Text>
                    <Text variant="headingXl">{products.length}</Text>
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="200">
                    <Text variant="headingSm">Total Revenue</Text>
                    <Text variant="headingXl">$12,450</Text>
                  </BlockStack>
                </Card>
                <Card>
                  <BlockStack gap="200">
                    <Text variant="headingSm">Active Orders</Text>
                    <Text variant="headingXl">8</Text>
                  </BlockStack>
                </Card>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>

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
                <Banner status="critical" title="Generation issue">
                  {error}
                </Banner>
              )}
              <Button onClick={generateQRCode} loading={isGenerating}>
                Generate QR
              </Button>
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
                <Button
                  onClick={downloadImage}
                  variant="primary"
                  disabled={!qrData}
                >
                  Download PNG
                </Button>
                <Button
                  onClick={copyImage}
                  variant="secondary"
                  disabled={!qrData}
                >
                  Copy data URL
                </Button>
              </InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </BlockStack>
  );
}

function ProductsSection({ products, setProducts }) {
  const addMockProduct = () => {
    const newProduct = {
      id: `gid://shopify/Product/mock-${Date.now()}`,
      title: "New Mock Product",
      status: "DRAFT",
      variants: [{ price: "19.99" }],
      image: null,
    };
    setProducts([...products, newProduct]);
  };

  return (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                Store Products
              </Text>
              <Button onClick={addMockProduct}>Add Mock Product</Button>
            </InlineStack>
            {products.length === 0 ? (
              <Text color="subdued">
                (Products from Shopify will appear here)
              </Text>
            ) : (
              <DataTable
                columnContentTypes={["text", "text", "numeric", "text"]}
                headings={["Image", "Title", "Price", "Status"]}
                rows={products.map((product) => [
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
  );
}

function AnalyticsSection({ products }) {
  const totalValue = products.reduce((acc, p) => {
    const price =
      p.variants && p.variants[0] ? parseFloat(p.variants[0].price) : 0;
    return acc + price;
  }, 0);

  const averagePrice =
    products.length > 0 ? (totalValue / products.length).toFixed(2) : "0.00";

  return (
    <Layout>
      <Layout.Section>
        <Card>
          <BlockStack gap="400">
            <Text as="h2" variant="headingMd">
              Analytics
            </Text>
            <InlineStack gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text variant="headingSm">Average Price</Text>
                  <Text variant="headingXl">${averagePrice}</Text>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text variant="headingSm">Product Count</Text>
                  <Text variant="headingXl">{products.length}</Text>
                </BlockStack>
              </Card>
            </InlineStack>
          </BlockStack>
        </Card>
      </Layout.Section>
    </Layout>
  );
}

export default function Index() {
  const [selectedTab, setSelectedTab] = useState(0);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function loadRealProducts() {
      const res = await fetch("/api/shopify-products");
      const data = await res.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else if (data.products && Array.isArray(data.products)) {
        setProducts(data.products);
      }
    }
    loadRealProducts();

    // Subscribe to server-sent events for live product updates (SSE)
    // The /sse.subscribe route returns an SSE stream authenticated for admin sessions.
    let es;
    try {
      es = new EventSource("/sse/subscribe");

      // Handle product_created events and append to local state
      es.addEventListener("product_created", (e) => {
        try {
          const product = JSON.parse(e.data);
          const normalized = {
            id: product.id,
            title: product.title,
            status: product.status || "ACTIVE",
            variants: (product.variants || []).map((v) =>
              // support either { price } or { node: { price } } shapes
              v && v.price !== undefined
                ? { price: v.price }
                : v && v.node && v.node.price
                  ? { price: v.node.price }
                  : { price: "0.00" },
            ),
            image:
              product.images && product.images.length > 0
                ? { src: product.images[0].url }
                : product.image || null,
          };

          setProducts((prev) => {
            // avoid duplicate insertion by id
            if (prev.some((p) => p.id === normalized.id)) return prev;
            return [normalized, ...prev];
          });

          // Console logs are useful for the recorded demo
          console.log("SSE: product_created", normalized);
        } catch (err) {
          console.error("Failed to parse SSE product_created event", err);
        }
      });

      es.onerror = (err) => {
        // Log SSE errors so they appear in the demo recording
        console.error("SSE connection error", err);
      };
    } catch (err) {
      console.error("Failed to create EventSource for SSE", err);
    }

    // Cleanup on unmount
    return () => {
      if (es) {
        try {
          es.close();
        } catch (e) {
          // ignore
        }
      }
    };
  }, []);

  const tabs = [
    { id: "dashboard", content: "Dashboard" },
    { id: "products", content: "Products" },
    { id: "analytics", content: "Analytics" },
  ];

  return (
    <Page title="BlackBytt App">
      <BlockStack gap="500">
        <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />
        {selectedTab === 0 && <DashboardSection products={products} />}
        {selectedTab === 1 && (
          <ProductsSection products={products} setProducts={setProducts} />
        )}
        {selectedTab === 2 && <AnalyticsSection products={products} />}
      </BlockStack>
    </Page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
