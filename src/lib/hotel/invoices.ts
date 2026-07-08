/**
 * Types et constantes pour les factures et reçus.
 * Safe côté client.
 */

export type InvoiceType = "invoice" | "receipt";

export type InvoiceStatus = "draft" | "issued" | "paid" | "cancelled";

export type Invoice = {
  id: string;
  establishment_id: string;
  establishment_name: string | null;
  establishment_address: string | null;
  establishment_city: string | null;
  establishment_phone: string | null;
  establishment_email: string | null;
  establishment_logo_url: string | null;
  reservation_id: string | null;
  guest_id: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  guest_nationality: string | null;
  room_number: string | null;
  room_type_name: string | null;
  check_in_date: string | null;
  check_out_date: string | null;
  nights: number | null;
  rate_amount: number | null;
  discount_amount: number | null;
  total_amount: number;
  paid_amount: number | null;
  balance_amount: number | null;
  invoice_number: string;
  type: InvoiceType;
  status: InvoiceStatus;
  pdf_url: string | null;
  issued_at: string | null;
  created_by: string | null;
  created_at: string;
  payments: {
    id: string;
    amount: number;
    method: string;
    payment_date: string;
    reference: string | null;
  }[];
};

export const INVOICE_STATUS_LABELS: Record<
  InvoiceStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline" | "success";
  }
> = {
  draft: { label: "Brouillon", variant: "outline" },
  issued: { label: "Émise", variant: "default" },
  paid: { label: "Payée", variant: "success" },
  cancelled: { label: "Annulée", variant: "destructive" },
};

export const INVOICE_TYPE_LABELS: Record<InvoiceType, string> = {
  invoice: "Facture",
  receipt: "Reçu",
};
