import { useState, useCallback, useEffect } from "react";
import {
  Page,
  Layout,
  Card,
  BlockStack,
  InlineStack,
  Text,
  Button,
  Checkbox,
  Modal,
  TextField,
  DropZone,
  Thumbnail,
  Banner,
  ButtonGroup,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { useActionData, useLoaderData, Form, useSubmit, Link, useNavigate } from "react-router";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader = async ({ request }) => {
  const { admin, session } = await authenticate.admin(request);
  const url = new URL(request.url);
  const editId = url.searchParams.get("edit");

  let label = null;
  if (editId) {
    label = await prisma.label.findUnique({
      where: { id: editId },
    });
  }

  let selectedProduct = null;
  if (label?.selectedProductId) {
    try {
      const response = await admin.graphql(
        `#graphql
        query getProduct($id: ID!) {
          product(id: $id) {
            id
            title
            featuredImage {
              url
            }
          }
        }`,
        { variables: { id: label.selectedProductId } }
      );
      const responseJson = await response.json();
      selectedProduct = responseJson.data.product;
    } catch (error) {
      console.error("Error fetching product:", error);
    }
  }

  return { label, shop: session.shop, initialProduct: selectedProduct };
};

export const action = async ({ request }) => {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const labelId = formData.get("labelId");

  const labelData = {
    shop: session.shop,
    labelType: formData.get("labelType") || "TEXT",
    labelContent: formData.get("labelContent") || "",
    position: formData.get("position") || "TOP_LEFT",
    hoverEffect: formData.get("hoverEffect") === "true",
    showOnProductPages: formData.get("showOnProductPages") === "true",
    showOnCollectionPages: formData.get("showOnCollectionPages") === "true",
    showOnSearchPages: formData.get("showOnSearchPages") === "true",
    showOnHomePage: formData.get("showOnHomePage") === "true",
    showOnCartPage: formData.get("showOnCartPage") === "true",
    showOnOtherPages: formData.get("showOnOtherPages") === "true",
    selectedProductId: formData.get("selectedProductId") || null,
    isActive: true, // Default to active on create/update
  };

  if (labelId) {
    await prisma.label.update({
      where: { id: labelId },
      data: labelData,
    });
  } else {
    await prisma.label.create({
      data: labelData,
    });
  }

  return { success: true, message: labelId ? "Label updated successfully!" : "Label created successfully!" };
};

const POSITIONS = [
  { id: "TOP_LEFT", label: "Top Left", style: { top: "8px", left: "8px" } },
  { id: "TOP_CENTER", label: "Top Center", style: { top: "8px", left: "50%", transform: "translateX(-50%)" } },
  { id: "TOP_RIGHT", label: "Top Right", style: { top: "8px", right: "8px" } },
  { id: "CENTER_LEFT", label: "Center Left", style: { top: "50%", left: "8px", transform: "translateY(-50%)" } },
  { id: "CENTER", label: "Center", style: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" } },
  { id: "CENTER_RIGHT", label: "Center Right", style: { top: "50%", right: "8px", transform: "translateY(-50%)" } },
  { id: "BOTTOM_LEFT", label: "Bottom Left", style: { bottom: "8px", left: "8px" } },
  { id: "BOTTOM_CENTER", label: "Bottom Center", style: { bottom: "8px", left: "50%", transform: "translateX(-50%)" } },
  { id: "BOTTOM_RIGHT", label: "Bottom Right", style: { bottom: "8px", right: "8px" } },
];

export default function PreferencesPage() {
  const { label, shop, initialProduct } = useLoaderData();
  const actionData = useActionData();
  const submit = useSubmit();
  const navigate = useNavigate();

  // State management
  const [selectedPosition, setSelectedPosition] = useState(label?.position || "TOP_LEFT");
  const [labelModalActive, setLabelModalActive] = useState(false);
  const [labelType, setLabelType] = useState(label?.labelType || "TEXT");
  const [labelContent, setLabelContent] = useState(label?.labelContent || "");
  const [labelText, setLabelText] = useState(label?.labelType === "TEXT" ? label?.labelContent : "NEW");
  const [files, setFiles] = useState([]);
  const [hoverEffect, setHoverEffect] = useState(label?.hoverEffect || false);
  const [showOnProductPages, setShowOnProductPages] = useState(label?.showOnProductPages ?? true);
  const [showOnCollectionPages, setShowOnCollectionPages] = useState(label?.showOnCollectionPages || false);
  const [showOnSearchPages, setShowOnSearchPages] = useState(label?.showOnSearchPages || false);
  const [showOnHomePage, setShowOnHomePage] = useState(label?.showOnHomePage || false);
  const [showOnCartPage, setShowOnCartPage] = useState(label?.showOnCartPage || false);
  const [showOnOtherPages, setShowOnOtherPages] = useState(label?.showOnOtherPages || false);

  // Product Picker State
  const [selectedProduct, setSelectedProduct] = useState(initialProduct);
  const [isHovered, setIsHovered] = useState(false);

  // Update state when label changes (e.g. when switching between edit/create)
  useEffect(() => {
    setSelectedPosition(label?.position || "TOP_LEFT");
    setLabelType(label?.labelType || "TEXT");
    setLabelContent(label?.labelContent || "");
    setLabelText(label?.labelType === "TEXT" ? label?.labelContent : "NEW");
    setHoverEffect(label?.hoverEffect || false);
    setShowOnProductPages(label?.showOnProductPages ?? true);
    setShowOnCollectionPages(label?.showOnCollectionPages || false);
    setShowOnSearchPages(label?.showOnSearchPages || false);
    setShowOnHomePage(label?.showOnHomePage || false);
    setShowOnCartPage(label?.showOnCartPage || false);
    setShowOnOtherPages(label?.showOnOtherPages || false);
    setSelectedProduct(initialProduct);
  }, [label, initialProduct]);

  const handleDropZoneDrop = useCallback((_dropFiles, acceptedFiles, _rejectedFiles) => {
    setFiles(acceptedFiles);

    // Convert to base64
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLabelContent(reader.result);
        setLabelType(file.type.includes("svg") ? "SVG" : "IMAGE");
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleSaveLabelModal = () => {
    if (labelType === "TEXT") {
      setLabelContent(labelText);
    }
    setLabelModalActive(false);
  };

  const handleSave = () => {
    const formData = new FormData();
    if (label?.id) {
      formData.append("labelId", label.id);
    }
    formData.append("labelType", labelType);
    formData.append("labelContent", labelType === "TEXT" ? labelText : labelContent);
    formData.append("position", selectedPosition);
    formData.append("hoverEffect", hoverEffect.toString());
    formData.append("showOnProductPages", showOnProductPages.toString());
    formData.append("showOnCollectionPages", showOnCollectionPages.toString());
    formData.append("showOnSearchPages", showOnSearchPages.toString());
    formData.append("showOnHomePage", showOnHomePage.toString());
    formData.append("showOnCartPage", showOnCartPage.toString());
    formData.append("showOnOtherPages", showOnOtherPages.toString());

    if (selectedProduct) {
      formData.append("selectedProductId", selectedProduct.id);
    }

    submit(formData, { method: "post" });
  };

  const selectProduct = async () => {
    try {
      const selected = await window.shopify.resourcePicker({
        type: "product",
        multiple: false,
      });

      if (selected && selected.length > 0) {
        const product = selected[0];
        setSelectedProduct({
          id: product.id,
          title: product.title,
          featuredImage: product.images[0] ? { url: product.images[0].originalSrc } : null
        });
      }
    } catch (error) {
      console.log("Resource picker cancelled or error:", error);
    }
  };

  const validImageTypes = ["image/svg+xml", "image/png", "image/jpeg", "image/jpg"];
  const fileUpload = !files.length && <DropZone.FileUpload />;
  const uploadedFiles = files.length > 0 && (
    <div style={{ padding: "16px" }}>
      <InlineStack gap="400" align="center">
        <Thumbnail
          size="large"
          alt={files[0].name}
          source={window.URL.createObjectURL(files[0])}
        />
        <div>
          <Text variant="bodyMd" fontWeight="bold">{files[0].name}</Text>
          <Text variant="bodySm" tone="subdued">{(files[0].size / 1024).toFixed(2)} KB</Text>
        </div>
      </InlineStack>
    </div>
  );

  const renderLabelPreview = () => {
    const currentContent = labelType === "TEXT" ? labelText : labelContent;

    if (!currentContent) {
      return (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "#8c9196",
          fontSize: "14px",
          textAlign: "center"
        }}>
          No label selected
        </div>
      );
    }

    const labelStyle = {
      position: "absolute",
      ...getPositionStyles(selectedPosition),
      transition: "transform 0.3s ease",
      transform: hoverEffect && isHovered ?
        `${getPositionStyles(selectedPosition).transform || ''} scale(1.1)` :
        `${getPositionStyles(selectedPosition).transform || ''} scale(1)`,
      zIndex: 10
    };

    if (labelType === "TEXT") {
      return (
        <div style={{
          background: "#000",
          color: "#fff",
          padding: "6px 12px",
          borderRadius: "4px",
          fontSize: "12px",
          fontWeight: "bold",
          display: "inline-block",
          ...labelStyle
        }}>
          {labelText}
        </div>
      );
    }

    return (
      <img
        src={currentContent}
        alt="Label preview"
        style={{
          maxWidth: "80px",
          maxHeight: "80px",
          ...labelStyle
        }}
      />
    );
  };

  const getPositionStyles = (position) => {
    const styles = {
      TOP_LEFT: { top: "10px", left: "10px" },
      TOP_CENTER: { top: "10px", left: "50%", transform: "translateX(-50%)" },
      TOP_RIGHT: { top: "10px", right: "10px" },
      CENTER_LEFT: { top: "50%", left: "10px", transform: "translateY(-50%)" },
      CENTER: { top: "50%", left: "50%", transform: "translate(-50%, -50%)" },
      CENTER_RIGHT: { top: "50%", right: "10px", transform: "translateY(-50%)" },
      BOTTOM_LEFT: { bottom: "10px", left: "10px" },
      BOTTOM_CENTER: { bottom: "10px", left: "50%", transform: "translateX(-50%)" },
      BOTTOM_RIGHT: { bottom: "10px", right: "10px" },
    };
    return styles[position] || styles.TOP_LEFT;
  };

  return (
    <Page
      title={label ? "Edit Label" : "Create Label"}
      backAction={{ content: "Labels", url: "/app/labels" }}
    >
      <Layout>
        <Layout.Section>
          {actionData?.success && (
            <Banner tone="success" onDismiss={() => { }}>
              {actionData.message}
            </Banner>
          )}

          <InlineStack gap="600" align="start" blockAlign="start">
            {/* Left side - Product Preview */}
            <div style={{ flex: "0 0 400px" }}>
              <Card padding="400">
                <BlockStack gap="400">
                  <div
                    style={{
                      background: "#e5e5e5",
                      borderRadius: "8px",
                      height: "400px",
                      position: "relative",
                      overflow: "hidden",
                      cursor: hoverEffect ? "pointer" : "default"
                    }}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                  >
                    {selectedProduct?.featuredImage ? (
                      <img
                        src={selectedProduct.featuredImage.url}
                        alt={selectedProduct.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                          transform: hoverEffect && isHovered ? "scale(1.05)" : "scale(1)"
                        }}
                      />
                    ) : (
                      <div style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#8c9196"
                      }}>
                        Select a product to preview
                      </div>
                    )}
                    {renderLabelPreview()}
                  </div>
                  <Button
                    variant="primary"
                    tone="default"
                    fullWidth
                    onClick={selectProduct}
                  >
                    {selectedProduct ? "Change Product" : "Select Product"}
                  </Button>
                </BlockStack>
              </Card>
            </div>

            {/* Right side - Label Configuration */}
            <div style={{ flex: "1" }}>
              <Card padding="500">
                <BlockStack gap="500">
                  <Button
                    variant="primary"
                    tone="default"
                    fullWidth
                    onClick={() => setLabelModalActive(true)}
                  >
                    Change Label
                  </Button>

                  {/* Label Position */}
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h2">
                      Label Position
                    </Text>
                    <div style={{
                      background: "#f1f2f4",
                      padding: "20px",
                      borderRadius: "12px",
                      display: "flex",
                      justifyContent: "center"
                    }}>
                      <div style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(3, 1fr)",
                        gap: "12px",
                        width: "fit-content"
                      }}>
                        {POSITIONS.map((pos) => (
                          <button
                            key={pos.id}
                            onClick={() => setSelectedPosition(pos.id)}
                            style={{
                              width: "60px",
                              height: "60px",
                              background: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              position: "relative",
                              cursor: "pointer",
                              boxShadow: selectedPosition === pos.id ? "0 0 0 2px #000" : "0 1px 2px rgba(0,0,0,0.05)"
                            }}
                            title={pos.label}
                          >
                            <div style={{
                              width: "16px",
                              height: "16px",
                              background: "#4a4a4a",
                              borderRadius: "2px",
                              position: "absolute",
                              ...pos.style
                            }} />
                          </button>
                        ))}
                      </div>
                    </div>
                  </BlockStack>

                  {/* Conditions */}
                  <BlockStack gap="300">
                    <Text variant="headingMd" as="h2">
                      CONDITIONS
                    </Text>

                    <InlineStack gap="200" align="start">
                      <Text variant="bodyMd">Hover effect</Text>
                      <ButtonGroup variant="segmented">
                        <Button
                          pressed={hoverEffect}
                          onClick={() => setHoverEffect(true)}
                          size="slim"
                        >
                          Yes
                        </Button>
                        <Button
                          pressed={!hoverEffect}
                          onClick={() => setHoverEffect(false)}
                          size="slim"
                        >
                          No
                        </Button>
                      </ButtonGroup>
                    </InlineStack>

                    <BlockStack gap="200">
                      <Checkbox
                        label="Product Pages"
                        checked={showOnProductPages}
                        onChange={setShowOnProductPages}
                      />
                      <Checkbox
                        label="Collection Pages"
                        checked={showOnCollectionPages}
                        onChange={setShowOnCollectionPages}
                      />
                      <Checkbox
                        label="Search Results Pages"
                        checked={showOnSearchPages}
                        onChange={setShowOnSearchPages}
                      />
                      <Checkbox
                        label="Home Page"
                        checked={showOnHomePage}
                        onChange={setShowOnHomePage}
                      />
                      <Checkbox
                        label="Cart Page"
                        checked={showOnCartPage}
                        onChange={setShowOnCartPage}
                      />
                      <Checkbox
                        label="Other Pages"
                        checked={showOnOtherPages}
                        onChange={setShowOnOtherPages}
                      />
                    </BlockStack>
                  </BlockStack>

                  {/* Save Button */}
                  <Button
                    variant="primary"
                    tone="default"
                    fullWidth
                    onClick={handleSave}
                  >
                    Save
                  </Button>
                </BlockStack>
              </Card>
            </div>
          </InlineStack>
        </Layout.Section>
      </Layout>

      {/* Label Upload/Text Modal */}
      <Modal
        open={labelModalActive}
        onClose={() => setLabelModalActive(false)}
        title="Change Label"
        primaryAction={{
          content: "Save",
          onAction: handleSaveLabelModal,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setLabelModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="400">
            <ButtonGroup variant="segmented">
              <Button
                pressed={labelType === "TEXT"}
                onClick={() => setLabelType("TEXT")}
              >
                Text Label
              </Button>
              <Button
                pressed={labelType === "IMAGE" || labelType === "SVG"}
                onClick={() => setLabelType("IMAGE")}
              >
                Upload Image/SVG
              </Button>
            </ButtonGroup>

            {labelType === "TEXT" ? (
              <TextField
                label="Label Text"
                value={labelText}
                onChange={setLabelText}
                placeholder="e.g., NEW, SALE, 50% OFF"
                autoComplete="off"
              />
            ) : (
              <DropZone
                accept="image/svg+xml,image/png,image/jpeg,image/jpg"
                type="image"
                onDrop={handleDropZoneDrop}
                allowMultiple={false}
              >
                {uploadedFiles}
                {fileUpload}
              </DropZone>
            )}
          </BlockStack>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
