import { useCallback, useEffect, useMemo, useState } from "react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { authenticate } from "../shopify.server";
import QRCode from "qrcode";

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
    <s-page heading="BlackBytt QR generator">
      <s-layout>
        <s-layout-section>
          <s-card rounded="large">
            <s-stack direction="block" gap="base">
              <s-heading level="3">Customize your QR code</s-heading>
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
              <s-stack direction="inline" gap="base">
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
              </s-stack>
              {error && (
                <s-banner status="critical" title="Generation issue">
                  {error}
                </s-banner>
              )}
              <s-button onClick={generateQRCode} loading={isGenerating}>
                Generate QR
              </s-button>
            </s-stack>
          </s-card>
        </s-layout-section>
        <s-layout-section secondary>
          <s-card rounded="large">
            <s-stack direction="block" gap="base" alignment="center">
              <s-heading level="3">Preview</s-heading>
              {qrData ? (
                <img
                  src={qrData}
                  width={size}
                  height={size}
                  alt={qrDescription}
                  style={{ borderRadius: "16px", background }}
                />
              ) : (
                <s-text>Provide details to generate your QR code.</s-text>
              )}
              {label && <s-text>{label}</s-text>}
              <s-stack direction="inline" gap="base">
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
              </s-stack>
            </s-stack>
          </s-card>
        </s-layout-section>
      </s-layout>
    </s-page>
  );
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
