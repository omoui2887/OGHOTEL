import { redirect } from "next/navigation";

/**
 * /super-admin → redirige vers /super-admin/dashboard.
 */
export default function SuperAdminIndex() {
  redirect("/super-admin/dashboard");
}
