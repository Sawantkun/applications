import { redirect } from "react-router";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }) => {
  await authenticate.admin(request);
  return redirect("/app/labels");
};

export default function AppIndexRedirect() {
  return null;
}
