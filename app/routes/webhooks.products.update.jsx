import { shopifyApp } from "~/shopify.server";

export const action = shopifyApp.webhooks.process;

