import { redirect } from "next/navigation";

/**
 * /app → redirige vers /app/dashboard.
 */
export default function AppIndex() {
  redirect("/app/dashboard");
}
