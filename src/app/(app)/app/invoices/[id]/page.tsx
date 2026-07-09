import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { getInvoiceById } from "@/lib/hotel/invoices-server";
import { PrintableInvoice } from "@/components/hotel/printable-invoice";

export const metadata = {
  title: "Facture",
};

type Params = Promise<{ id: string }>;

export default async function InvoiceDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const profile = await getCurrentProfile();

  if (!profile || !profile.establishment_id) {
    notFound();
  }

  // Fetch défensif : si Supabase mal configuré, on affiche notFound au lieu
  // de planter via l'error boundary global.
  let invoice: Awaited<ReturnType<typeof getInvoiceById>> = null;
  try {
    invoice = await getInvoiceById(id, profile.establishment_id);
  } catch (err) {
    console.error("Erreur chargement facture:", err);
  }

  if (!invoice) {
    notFound();
  }

  const canCancel = profile.role === "hotel_admin" || profile.role === "manager";

  return <PrintableInvoice invoice={invoice} canCancel={canCancel} />;
}
