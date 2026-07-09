import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Invoice } from "./invoices";

/**
 * CRUD des factures et reçus — SERVEUR UNIQUEMENT.
 *
 * 🔒 Filtrage par establishment_id.
 * ⚠️ Une facture annulée reste dans l'historique (jamais supprimée).
 */

export async function getInvoices(
  establishmentId: string,
  filters: {
    search?: string;
    status?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{
  invoices: Invoice[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createSupabaseAdminClient();
  const { search, status, type, page = 1, pageSize = 10 } = filters;

  let query = supabase
    .from("invoices")
    .select(
      `
      id, establishment_id, reservation_id, guest_id, invoice_number, type,
      amount, status, pdf_url, issued_at, created_by, created_at,
      guest:guests(full_name, phone, email, nationality),
      reservation:reservations(
        check_in_date, check_out_date, nights, rate_amount, discount_amount,
        total_amount, paid_amount, balance_amount,
        room:rooms(room_number, room_type:room_types(name))
      ),
      establishment:establishments(name, address, city, phone, email, logo_url)
    `,
      { count: "exact" }
    )
    .eq("establishment_id", establishmentId);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (type && type !== "all") {
    query = query.eq("type", type);
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return { invoices: [], total: 0, page, pageSize, totalPages: 0 };
  }

  let invoices: Invoice[] = (data as any[]).map((inv) => ({
    id: inv.id,
    establishment_id: inv.establishment_id,
    establishment_name: inv.establishment?.name ?? null,
    establishment_address: inv.establishment?.address ?? null,
    establishment_city: inv.establishment?.city ?? null,
    establishment_phone: inv.establishment?.phone ?? null,
    establishment_email: inv.establishment?.email ?? null,
    establishment_logo_url: inv.establishment?.logo_url ?? null,
    reservation_id: inv.reservation_id,
    guest_id: inv.guest_id,
    guest_name: inv.guest?.full_name ?? null,
    guest_phone: inv.guest?.phone ?? null,
    guest_email: inv.guest?.email ?? null,
    guest_nationality: inv.guest?.nationality ?? null,
    room_number: inv.reservation?.room?.room_number ?? null,
    room_type_name: inv.reservation?.room?.room_type?.name ?? null,
    check_in_date: inv.reservation?.check_in_date ?? null,
    check_out_date: inv.reservation?.check_out_date ?? null,
    nights: inv.reservation?.nights ?? null,
    rate_amount: inv.reservation?.rate_amount ?? null,
    discount_amount: inv.reservation?.discount_amount ?? null,
    total_amount: inv.amount,
    paid_amount: inv.reservation?.paid_amount ?? null,
    balance_amount: inv.reservation?.balance_amount ?? null,
    invoice_number: inv.invoice_number,
    type: inv.type,
    status: inv.status,
    pdf_url: inv.pdf_url,
    issued_at: inv.issued_at,
    created_by: inv.created_by,
    created_at: inv.created_at,
    payments: [],
  }));

  // Filtre par recherche (nom client, numéro facture)
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    invoices = invoices.filter(
      (inv) =>
        inv.guest_name?.toLowerCase().includes(s) ||
        inv.invoice_number.toLowerCase().includes(s)
    );
  }

  return {
    invoices,
    total: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getInvoiceById(
  id: string,
  establishmentId: string
): Promise<Invoice | null> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("invoices")
    .select(
      `
      id, establishment_id, reservation_id, guest_id, invoice_number, type,
      amount, status, pdf_url, issued_at, created_by, created_at,
      guest:guests(full_name, phone, email, nationality),
      reservation:reservations(
        check_in_date, check_out_date, nights, rate_amount, discount_amount,
        total_amount, paid_amount, balance_amount,
        room:rooms(room_number, room_type:room_types(name))
      ),
      establishment:establishments(name, address, city, phone, email, logo_url)
    `
    )
    .eq("id", id)
    .eq("establishment_id", establishmentId)
    .single();

  if (error || !data) return null;

  const inv = data as any;

  // Récupérer les paiements liés à la réservation
  let payments: Invoice["payments"] = [];
  if (inv.reservation_id) {
    const { data: paymentsData } = await supabase
      .from("stay_payments")
      .select("id, amount, method, payment_date, reference")
      .eq("reservation_id", inv.reservation_id)
      .eq("establishment_id", establishmentId)
      .order("payment_date", { ascending: true });

    payments = (paymentsData ?? []).map((p: any) => ({
      id: p.id,
      amount: p.amount,
      method: p.method,
      payment_date: p.payment_date,
      reference: p.reference,
    }));
  }

  return {
    id: inv.id,
    establishment_id: inv.establishment_id,
    establishment_name: inv.establishment?.name ?? null,
    establishment_address: inv.establishment?.address ?? null,
    establishment_city: inv.establishment?.city ?? null,
    establishment_phone: inv.establishment?.phone ?? null,
    establishment_email: inv.establishment?.email ?? null,
    establishment_logo_url: inv.establishment?.logo_url ?? null,
    reservation_id: inv.reservation_id,
    guest_id: inv.guest_id,
    guest_name: inv.guest?.full_name ?? null,
    guest_phone: inv.guest?.phone ?? null,
    guest_email: inv.guest?.email ?? null,
    guest_nationality: inv.guest?.nationality ?? null,
    room_number: inv.reservation?.room?.room_number ?? null,
    room_type_name: inv.reservation?.room?.room_type?.name ?? null,
    check_in_date: inv.reservation?.check_in_date ?? null,
    check_out_date: inv.reservation?.check_out_date ?? null,
    nights: inv.reservation?.nights ?? null,
    rate_amount: inv.reservation?.rate_amount ?? null,
    discount_amount: inv.reservation?.discount_amount ?? null,
    total_amount: inv.amount,
    paid_amount: inv.reservation?.paid_amount ?? null,
    balance_amount: inv.reservation?.balance_amount ?? null,
    invoice_number: inv.invoice_number,
    type: inv.type,
    status: inv.status,
    pdf_url: inv.pdf_url,
    issued_at: inv.issued_at,
    created_by: inv.created_by,
    created_at: inv.created_at,
    payments,
  };
}

/**
 * Génère une facture ou un reçu pour une réservation.
 */
export async function generateInvoice(
  establishmentId: string,
  userId: string,
  input: {
    reservation_id: string;
    type: "invoice" | "receipt";
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // 1. Vérifier la réservation
  const { data: reservation, error: resErr } = await supabase
    .from("reservations")
    .select("id, guest_id, total_amount, paid_amount, balance_amount, status")
    .eq("id", input.reservation_id)
    .eq("establishment_id", establishmentId)
    .single();

  if (resErr || !reservation) {
    return { success: false, error: "Réservation introuvable" };
  }

  // 2. Vérifier qu'une facture active n'existe pas déjà
  const { data: existing } = await supabase
    .from("invoices")
    .select("id, invoice_number")
    .eq("reservation_id", input.reservation_id)
    .eq("type", input.type)
    .neq("status", "cancelled")
    .maybeSingle();

  if (existing) {
    return {
      success: false,
      error: `Un ${input.type === "invoice" ? "facture" : "reçu"} existe déjà : ${existing.invoice_number}`,
    };
  }

  // 3. Générer le numéro unique
  const year = new Date().getFullYear();
  const prefix = input.type === "invoice" ? "FAC" : "REC";
  const random = String(Date.now()).slice(-6);
  const invoiceNumber = `${prefix}-${year}-${random}`;

  // 4. Déterminer le statut
  const status =
    reservation.balance_amount <= 0 ? "paid" : "issued";

  // 5. Insérer
  const { data, error } = await supabase
    .from("invoices")
    .insert({
      establishment_id: establishmentId,
      reservation_id: input.reservation_id,
      guest_id: reservation.guest_id,
      invoice_number: invoiceNumber,
      type: input.type,
      amount: reservation.total_amount,
      status,
      issued_at: new Date().toISOString(),
      created_by: userId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[invoices] generateInvoice failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  // 6. Log
  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "invoice_generated",
    entity_type: "invoice",
    entity_id: data.id,
    metadata: {
      invoice_number: invoiceNumber,
      type: input.type,
      amount: reservation.total_amount,
    },
  });

  return { success: true, id: data.id };
}

/**
 * Annule une facture (reste dans l'historique).
 */
export async function cancelInvoice(
  id: string,
  establishmentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase
    .from("invoices")
    .update({ status: "cancelled" })
    .eq("id", id)
    .eq("establishment_id", establishmentId)
    .neq("status", "cancelled"); // ne pas annuler une facture déjà annulée

  if (error) {
    console.error("[invoices] cancelInvoice failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "invoice_cancelled",
    entity_type: "invoice",
    entity_id: id,
  });

  return { success: true };
}
