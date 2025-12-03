import { useState } from "react";
import {
    Page,
    Layout,
    Card,
    DataTable,
    Button,
    ButtonGroup,
    Badge,
    InlineStack,
    Checkbox,
    Thumbnail,
    Icon,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import { Link, useLoaderData } from "react-router";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const loader = async ({ request }) => {
    const { session } = await authenticate.admin(request);

    // Fetch all labels for this shop
    const labels = await prisma.label.findMany({
        where: { shop: session.shop },
        orderBy: { createdAt: 'desc' }
    });

    return { labels, shop: session.shop };
};

export const action = async ({ request }) => {
    const { session } = await authenticate.admin(request);
    const formData = await request.formData();
    const action = formData.get("action");
    const labelId = formData.get("labelId");

    if (action === "delete") {
        await prisma.label.delete({
            where: { id: labelId },
        });
    } else if (action === "toggle") {
        const label = await prisma.label.findUnique({
            where: { id: labelId },
        });

        await prisma.label.update({
            where: { id: labelId },
            data: { isActive: !label.isActive },
        });
    } else if (action === "bulkDelete") {
        const labelIds = formData.get("labelIds").split(",");
        await prisma.label.deleteMany({
            where: {
                id: { in: labelIds },
                shop: session.shop,
            },
        });
    }

    return { success: true };
};

export default function ManageLabels() {
    const { labels } = useLoaderData();
    const [selectedLabels, setSelectedLabels] = useState([]);
    const [filterStatus, setFilterStatus] = useState("all");

    const handleSelectAll = () => {
        if (selectedLabels.length === filteredLabels.length) {
            setSelectedLabels([]);
        } else {
            setSelectedLabels(filteredLabels.map(label => label.id));
        }
    };

    const handleSelectLabel = (labelId) => {
        if (selectedLabels.includes(labelId)) {
            setSelectedLabels(selectedLabels.filter(id => id !== labelId));
        } else {
            setSelectedLabels([...selectedLabels, labelId]);
        }
    };

    const handleDelete = async (labelId) => {
        if (confirm("Are you sure you want to delete this label?")) {
            const formData = new FormData();
            formData.append("action", "delete");
            formData.append("labelId", labelId);

            await fetch(window.location.href, {
                method: "POST",
                body: formData,
            });

            window.location.reload();
        }
    };

    const handleBulkDelete = async () => {
        if (selectedLabels.length === 0) return;

        if (confirm(`Are you sure you want to delete ${selectedLabels.length} label(s)?`)) {
            const formData = new FormData();
            formData.append("action", "bulkDelete");
            formData.append("labelIds", selectedLabels.join(","));

            await fetch(window.location.href, {
                method: "POST",
                body: formData,
            });

            window.location.reload();
        }
    };

    const handleToggleStatus = async (labelId) => {
        const formData = new FormData();
        formData.append("action", "toggle");
        formData.append("labelId", labelId);

        await fetch(window.location.href, {
            method: "POST",
            body: formData,
        });

        window.location.reload();
    };

    // Filter labels based on status
    const filteredLabels = labels.filter(label => {
        if (filterStatus === "all") return true;
        if (filterStatus === "enable") return label.isActive;
        if (filterStatus === "disable") return !label.isActive;
        return true;
    });

    const enabledCount = labels.filter(l => l.isActive).length;
    const disabledCount = labels.filter(l => !l.isActive).length;

    return (
        <Page
            title="Labels"
            primaryAction={
                <Link to="/app/preferences" style={{ textDecoration: "none" }}>
                    <Button variant="primary">Create Label</Button>
                </Link>
            }
        >
            <Layout>
                <Layout.Section>
                    <Card padding="0">
                        {/* Filter Tabs */}
                        <div style={{
                            padding: "16px 20px",
                            borderBottom: "1px solid #e1e3e5",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center"
                        }}>
                            <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                    onClick={() => setFilterStatus("all")}
                                    style={{
                                        background: filterStatus === "all" ? "#000" : "#f6f6f7",
                                        color: filterStatus === "all" ? "#fff" : "#000",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontWeight: "500",
                                        fontSize: "14px"
                                    }}
                                >
                                    All
                                </button>
                                <button
                                    onClick={() => setFilterStatus("enable")}
                                    style={{
                                        background: filterStatus === "enable" ? "#616161" : "#f6f6f7",
                                        color: filterStatus === "enable" ? "#fff" : "#000",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontWeight: "500",
                                        fontSize: "14px"
                                    }}
                                >
                                    Enable ({enabledCount})
                                </button>
                                <button
                                    onClick={() => setFilterStatus("disable")}
                                    style={{
                                        background: filterStatus === "disable" ? "#616161" : "#f6f6f7",
                                        color: filterStatus === "disable" ? "#fff" : "#000",
                                        border: "none",
                                        padding: "8px 16px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontWeight: "500",
                                        fontSize: "14px"
                                    }}
                                >
                                    Disable ({disabledCount})
                                </button>
                                {selectedLabels.length > 0 && (
                                    <button
                                        onClick={handleBulkDelete}
                                        style={{
                                            background: "#D82C0D",
                                            color: "#fff",
                                            border: "none",
                                            padding: "8px 16px",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontWeight: "500",
                                            fontSize: "14px"
                                        }}
                                    >
                                        Delete ({selectedLabels.length})
                                    </button>
                                )}
                            </div>

                            {selectedLabels.length > 0 && (
                                <button
                                    onClick={handleSelectAll}
                                    style={{
                                        background: "transparent",
                                        border: "1px solid #c9cccf",
                                        padding: "6px 12px",
                                        borderRadius: "6px",
                                        cursor: "pointer",
                                        fontSize: "13px"
                                    }}
                                >
                                    {selectedLabels.length === filteredLabels.length ? "Deselect All" : "Select All"}
                                </button>
                            )}
                        </div>

                        {/* Table */}
                        <div style={{ overflowX: "auto" }}>
                            <table style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead>
                                    <tr style={{ borderBottom: "1px solid #e1e3e5", background: "#fafbfb" }}>
                                        <th style={{ padding: "12px 16px", textAlign: "left", width: "50px" }}>
                                            <Checkbox
                                                checked={selectedLabels.length === filteredLabels.length && filteredLabels.length > 0}
                                                onChange={handleSelectAll}
                                            />
                                        </th>
                                        <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>Product</th>
                                        <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>Name</th>
                                        <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>Label</th>
                                        <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "600", fontSize: "13px" }}>Status</th>
                                        <th style={{ padding: "12px 16px", textAlign: "center", fontWeight: "600", fontSize: "13px" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLabels.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#8c9196" }}>
                                                No labels found. Create your first label to get started!
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredLabels.map((label) => (
                                            <tr key={label.id} style={{ borderBottom: "1px solid #e1e3e5" }}>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <Checkbox
                                                        checked={selectedLabels.includes(label.id)}
                                                        onChange={() => handleSelectLabel(label.id)}
                                                    />
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <div style={{
                                                        width: "60px",
                                                        height: "60px",
                                                        background: "#e5e5e5",
                                                        borderRadius: "8px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}>
                                                        {label.labelType === "TEXT" ? (
                                                            <span style={{ fontSize: "10px", color: "#666" }}>Product</span>
                                                        ) : (
                                                            <img
                                                                src={label.labelContent}
                                                                alt="Product"
                                                                style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "8px" }}
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: "12px 16px", fontSize: "14px" }}>
                                                    {label.labelType === "TEXT" ? label.labelContent : "Image Label"}
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <div style={{
                                                        width: "60px",
                                                        height: "40px",
                                                        background: "#e5e5e5",
                                                        borderRadius: "6px",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center"
                                                    }}>
                                                        {label.labelType === "TEXT" ? (
                                                            <span style={{
                                                                fontSize: "11px",
                                                                fontWeight: "bold",
                                                                background: "#000",
                                                                color: "#fff",
                                                                padding: "4px 8px",
                                                                borderRadius: "4px"
                                                            }}>
                                                                {label.labelContent}
                                                            </span>
                                                        ) : (
                                                            <img
                                                                src={label.labelContent}
                                                                alt="Label"
                                                                style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: "4px" }}
                                                            />
                                                        )}
                                                    </div>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <button
                                                        onClick={() => handleToggleStatus(label.id)}
                                                        style={{
                                                            background: label.isActive ? "#D4F4DD" : "#FFF4C4",
                                                            color: label.isActive ? "#108043" : "#916A00",
                                                            border: "none",
                                                            padding: "6px 12px",
                                                            borderRadius: "6px",
                                                            cursor: "pointer",
                                                            fontSize: "12px",
                                                            fontWeight: "600",
                                                            display: "flex",
                                                            alignItems: "center",
                                                            gap: "6px"
                                                        }}
                                                    >
                                                        <span style={{ fontSize: "16px" }}>●</span>
                                                        {label.isActive ? "Enable" : "Disable"}
                                                    </button>
                                                </td>
                                                <td style={{ padding: "12px 16px" }}>
                                                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                                                        <Link to={`/app/preferences?edit=${label.id}`}>
                                                            <button style={{
                                                                background: "transparent",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                padding: "8px",
                                                                borderRadius: "6px"
                                                            }}>
                                                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                    <path d="M14.5 2.5L17.5 5.5L7.5 15.5H4.5V12.5L14.5 2.5Z" stroke="#303030" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            </button>
                                                        </Link>
                                                        <button
                                                            onClick={() => handleDelete(label.id)}
                                                            style={{
                                                                background: "transparent",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                padding: "8px",
                                                                borderRadius: "6px"
                                                            }}
                                                        >
                                                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                                                <path d="M3 5H17M8 9V15M12 9V15M4 5L5 17C5 17.5304 5.21071 18.0391 5.58579 18.4142C5.96086 18.7893 6.46957 19 7 19H13C13.5304 19 14.0391 18.7893 14.4142 18.4142C14.7893 18.0391 15 17.5304 15 17L16 5M7 5V3C7 2.73478 7.10536 2.48043 7.29289 2.29289C7.48043 2.10536 7.73478 2 8 2H12C12.2652 2 12.5196 2.10536 12.7071 2.29289C12.8946 2.48043 13 2.73478 13 3V5" stroke="#D82C0D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}
