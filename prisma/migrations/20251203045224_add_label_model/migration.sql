/*
  Warnings:

  - You are about to drop the `WebhookPayload` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WebhookPayload";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Label" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "labelType" TEXT NOT NULL,
    "labelContent" TEXT NOT NULL,
    "position" TEXT NOT NULL DEFAULT 'TOP_LEFT',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "hoverEffect" BOOLEAN NOT NULL DEFAULT false,
    "showOnProductPages" BOOLEAN NOT NULL DEFAULT true,
    "showOnCollectionPages" BOOLEAN NOT NULL DEFAULT false,
    "showOnSearchPages" BOOLEAN NOT NULL DEFAULT false,
    "showOnHomePage" BOOLEAN NOT NULL DEFAULT false,
    "showOnCartPage" BOOLEAN NOT NULL DEFAULT false,
    "showOnOtherPages" BOOLEAN NOT NULL DEFAULT false,
    "selectedProductId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
