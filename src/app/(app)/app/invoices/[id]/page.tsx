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

  const invoice = await getInvoiceById(id, profile.establishment_id);

  if (!invoice) {
    notFound();
  }

  const canCancel = profile.role === "hotel_admin" || profile.role === "manager";

  return <PrintableInvoice invoice={invoice} canCancel={canCancel} />;
}
