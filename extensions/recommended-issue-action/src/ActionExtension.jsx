import "@shopify/ui-extensions/preact";
import { render } from "preact";
import { useState, useCallback } from "preact/hooks";

export default async () => {
  render(<Extension />, document.body);
};

function Extension() {
  const { data, close } = shopify;
  const productId = data?.selected?.[0]?.id;
  
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState({ title: "", description: "" } | null);
  const [error, setError] = useState(null);

  const onGenerate = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!productId) {
        throw new Error("No product ID available");
      }
      
      const res = await fetch(`/api/recommendedProductIssue?productId=${encodeURIComponent(productId)}`);
      
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      
      const json = await res.json();
      setSuggestion(json.productIssue);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  return (
    <s-admin-action heading="Recommended Product Issue">
      <s-button slot="primaryaction" onClick={onGenerate} disabled={loading || !productId} loading={loading}>
        {loading ? "Generating..." : "Generate suggestion"}
      </s-button>
      <s-button slot="secondaryactions" onClick={close}>
        Cancel
      </s-button>
      <s-stack gap="base">
        {!productId && (
          <s-text tone="warning">No product ID available</s-text>
        )}
        {error && (
          <s-text tone="critical">{error}</s-text>
        )}
        {suggestion && (
          <s-box padding="base">
            <s-stack gap="base">
              <s-text>Title: {suggestion.title}</s-text>
              <s-text>Description: {suggestion.description}</s-text>
            </s-stack>
          </s-box>
        )}
      </s-stack>
    </s-admin-action>
  );
}
