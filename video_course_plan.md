# BlackBytt Labels: "How It's Made" Code Walkthrough (Extended Edition)

This course explains the technical implementation of the app in depth.
**Format:** Screen recordings with text overlays.
**Duration:** ~5 minutes per video.
**Style:** Deep dive into code logic followed by visual output.

---

## Video 1: Data Architecture (Prisma & Schema)
**Goal:** Explain how we model the data and handle database connections.

| Time | Visual Action (Screen Recording) | Text Overlay | Zoom Focus |
| :--- | :--- | :--- | :--- |
| 0:00 | Open `prisma/schema.prisma`. | The Blueprint: Prisma Schema | File Explorer |
| 0:30 | Highlight `datasource db`. | SQLite Database | `datasource` block |
| 1:00 | Scroll to `model Session`. | Authentication (Shopify Session) | `Session` model |
| 1:30 | Scroll to `model Label`. | The Core Model: Label | `Label` model |
| 2:00 | Highlight fields: `labelType`, `position`. | Storing Configuration | Fields |
| 2:30 | Highlight `isActive`, `hoverEffect`. | Feature Flags | Boolean fields |
| 3:00 | Highlight `selectedProductId`. | Linking to Shopify Products | `selectedProductId` |
| 3:30 | Open `app/routes/app.labels.jsx`. | Fetching the Data | `loader` function |
| 4:00 | Highlight `prisma.label.findMany`. | Prisma Query in Action | `findMany` call |
| 4:30 | Transition to App: "Labels" Tab. | The Result: Data Table | Full Screen App |

## Video 2: The Dashboard & Navigation (Polaris UI)
**Goal:** Explain the main dashboard structure and Polaris components.

| Time | Visual Action (Screen Recording) | Text Overlay | Zoom Focus |
| :--- | :--- | :--- | :--- |
| 0:00 | Open `app/routes/app._index.jsx`. | Building the Dashboard | File Explorer |
| 0:30 | Highlight imports from `@shopify/polaris`. | Polaris Component Library | Imports |
| 1:00 | Scroll to `loader` function. | Server-Side Loader | `loader` function |
| 1:30 | Highlight `authenticate.admin(request)`. | Verifying the Shop | `authenticate` call |
| 2:00 | Scroll to `StepCard` component. | Reusable UI Components | `StepCard` function |
| 2:30 | Highlight props: `title`, `description`. | Passing Data via Props | Component Props |
| 3:00 | Scroll to `steps` array. | Data-Driven UI | `steps` array |
| 3:30 | Scroll to `Index` component return. | The Layout Structure | `Page`, `BlockStack` |
| 4:00 | Transition to App: Dashboard. | The Result: Clean UI | Full Screen App |
| 4:30 | Hover over cards and buttons. | Interactive Elements | Dashboard Cards |

## Video 3: The Label Editor (State & Logic)
**Goal:** Deep dive into the interactive label creator.

| Time | Visual Action (Screen Recording) | Text Overlay | Zoom Focus |
| :--- | :--- | :--- | :--- |
| 0:00 | Open `app/routes/app.preferences.jsx`. | The Label Editor | File Explorer |
| 0:30 | Scroll to `loader`. | Loading Existing Data | `loader` function |
| 1:00 | Scroll to `useState` hooks. | Managing Local State | `useState` block |
| 1:30 | Highlight `selectedPosition`, `labelType`. | Reactive Variables | State variables |
| 2:00 | Scroll to `POSITIONS` constant. | CSS Positioning Logic | `POSITIONS` array |
| 2:30 | Explain `style` objects (`top`, `left`). | Dynamic Styles | Style objects |
| 3:00 | Scroll to `renderLabelPreview`. | Conditional Rendering | `renderLabelPreview` |
| 3:30 | Highlight `labelType === "TEXT"` check. | Text vs Image Logic | If/Else block |
| 4:00 | Transition to App: "Create Label". | The Result: Live Preview | Full Screen App |
| 4:30 | Change positions and toggle types. | Real-time Updates | Preview Box |

## Video 4: Handling Media & Interactivity
**Goal:** Explain file uploads and hover effects.

| Time | Visual Action (Screen Recording) | Text Overlay | Zoom Focus |
| :--- | :--- | :--- | :--- |
| 0:00 | Open `app/routes/app.preferences.jsx`. | Handling File Uploads | File Explorer |
| 0:30 | Scroll to `DropZone` component. | Polaris DropZone | `DropZone` JSX |
| 1:00 | Highlight `accept="image/..."`. | File Validation | Props |
| 1:30 | Scroll to `handleDropZoneDrop`. | Processing the Drop | Function definition |
| 2:00 | Highlight `FileReader` logic. | Converting to Base64 | `FileReader` code |
| 2:30 | Scroll to `hoverEffect` state. | Interactivity State | `hoverEffect` state |
| 3:00 | Find `transform: scale(1.1)` in styles. | CSS Transform Logic | Style object |
| 3:30 | Transition to App: Upload Image. | The Result: Drag & Drop | Full Screen App |
| 4:00 | Hover over the preview image. | Testing Hover Effect | Preview Image |
| 4:30 | Toggle "Hover Effect" switch. | Dynamic CSS | Toggle Switch |

## Video 5: Data Mutation (Remix Actions)
**Goal:** Explain how we save data to the database.

| Time | Visual Action (Screen Recording) | Text Overlay | Zoom Focus |
| :--- | :--- | :--- | :--- |
| 0:00 | Open `app/routes/app.preferences.jsx`. | Server-Side Mutations | File Explorer |
| 0:30 | Scroll to `export const action`. | The Remix Action | `action` function |
| 1:00 | Highlight `formData.get()`. | Extracting Form Data | `formData` calls |
| 1:30 | Explain boolean conversions. | Data Sanitization | Boolean logic |
| 2:00 | Scroll to `prisma.label.update`. | Updating Records | `update` block |
| 2:30 | Scroll to `prisma.label.create`. | Creating Records | `create` block |
| 3:00 | Scroll to `handleSave` function (client). | Client-Side Trigger | `handleSave` function |
| 3:30 | Highlight `submit(formData)`. | Submitting the Form | `submit` call |
| 4:00 | Transition to App: Click "Save". | The Result: Persistence | Save Button |
| 4:30 | Show Success Banner. | Feedback Loop | Success Banner |

## Video 6: Storefront Integration (The App Embed)
**Goal:** Explain how the label appears on the live store.

| Time | Visual Action (Screen Recording) | Text Overlay | Zoom Focus |
| :--- | :--- | :--- | :--- |
| 0:00 | Open `extensions/theme-extension/blocks/app_embed.liquid`. | The Storefront Embed | File Explorer |
| 0:30 | Highlight `{% schema %}`. | Theme Editor Settings | Schema block |
| 1:00 | Explain `target: "body"`. | Global Injection | Target setting |
| 1:30 | Scroll to `fetchLabel(productId)`. | Fetching Data (AJAX) | `fetchLabel` function |
| 2:00 | Explain the fetch URL. | App Proxy Endpoint | URL string |
| 2:30 | Scroll to `injectLabels()`. | DOM Manipulation | `injectLabels` function |
| 3:00 | Highlight `document.querySelectorAll`. | Finding Products | Query Selector |
| 3:30 | Highlight `document.createElement`. | Creating the Badge | DOM creation |
| 4:00 | Transition to Live Store. | The Result: Live Label | Full Screen Browser |
| 4:30 | Refresh page -> Label appears. | It Works! | Product Card |
