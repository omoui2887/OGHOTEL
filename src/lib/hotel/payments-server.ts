import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { StayPayment, PaymentMethod } from "./payments";

/**
 * CRUD des paiements séjour — SERVEUR UNIQUEMENT.
 *
 * 🔒 Filtrage par establishment_id.
 * ⚠️ À chaque paiement, met à jour paid_amount et balance_amount de la réservation.
 */

export async function getStayPayments(
  establishmentId: string,
  filters: {
    search?: string;
    method?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    pageSize?: number;
  } = {}
): Promise<{
  payments: StayPayment[];
  total: number;
  totalAmount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}> {
  const supabase = createSupabaseAdminClient();
  const { search, method, date_from, date_to, page = 1, pageSize = 10 } = filters;

  let query = supabase
    .from("stay_payments")
    .select(
      `
      id, establishment_id, reservation_id, amount, method, reference,
      payment_date, received_by, notes, created_at,
      reservation:reservations(guest_id, room_id, guest:guests(full_name, phone), room:rooms(room_number))
    `,
      { count: "exact" }
    )
    .eq("establishment_id", establishmentId);

  if (method && method !== "all") {
    query = query.eq("method", method);
  }

  if (date_from) {
    query = query.gte("payment_date", date_from + "T00:00:00.000Z");
  }

  if (date_to) {
    query = query.lte("payment_date", date_to + "T23:59:59.999Z");
  }

  // Recherche par nom de client
  if (search && search.trim()) {
    // On ne peut pas filtrer sur la jointure directement, donc on récupère
    // tous les paiements puis on filtre (pour petits volumes c'est OK)
    // Pour de gros volumes, il faudrait une sous-requête
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await query
    .order("payment_date", { ascending: false })
    .range(from, to);

  if (error || !data) {
    return { payments: [], total: 0, totalAmount: 0, page, pageSize, totalPages: 0 };
  }

  let payments: StayPayment[] = (data as any[]).map((p) => ({
    id: p.id,
    establishment_id: p.establishment_id,
    reservation_id: p.reservation_id,
    guest_name: p.reservation?.guest?.full_name ?? null,
    guest_phone: p.reservation?.guest?.phone ?? null,
    room_number: p.reservation?.room?.room_number ?? null,
    amount: p.amount,
    method: p.method,
    reference: p.reference,
    payment_date: p.payment_date,
    received_by: p.received_by,
    notes: p.notes,
    created_at: p.created_at,
  }));

  // Filtre par recherche côté applicatif
  if (search && search.trim()) {
    const s = search.trim().toLowerCase();
    payments = payments.filter(
      (p) =>
        p.guest_name?.toLowerCase().includes(s) ||
        p.guest_phone?.includes(s) ||
        p.reference?.toLowerCase().includes(s)
    );
  }

  // Calculer le montant total (sur la page courante)
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

  return {
    payments,
    total: count ?? 0,
    totalAmount,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function createStayPayment(
  establishmentId: string,
  userId: string,
  input: {
    reservation_id: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    notes?: string;
  }
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // 1. Vérifier la réservation
  const { data: reservation, error: resErr } = await supabase
    .from("reservations")
    .select("id, status, total_amount, paid_amount, balance_amount")
    .eq("id", input.reservation_id)
    .eq("establishment_id", establishmentId)
    .single();

  if (resErr || !reservation) {
    return { success: false, error: "Réservation introuvable" };
  }

  // 2. Vérifier que le paiement ne dépasse pas le solde (sauf si frais supplémentaires)
  // On autorise un léger dépassement pour les frais supplémentaires
  // Mais on bloque si le montant dépasse 2x le solde (sécurité anti-erreur)
  if (input.amount > reservation.balance_amount * 2 && reservation.balance_amount > 0) {
    return {
      success: false,
      error: `Le montant (${input.amount} FCFA) dépasse largement le solde restant (${reservation.balance_amount} FCFA). Vérifiez le montant.`,
    };
  }

  // 3. Insérer le paiement
  const { data, error } = await supabase
    .from("stay_payments")
    .insert({
      establishment_id: establishmentId,
      reservation_id: input.reservation_id,
      amount: input.amount,
      method: input.method,
      reference: input.reference?.trim() || null,
      payment_date: new Date().toISOString(),
      received_by: userId,
      notes: input.notes?.trim() || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[payments] createStayPayment failed:", error.message);
    return { success: false, error: "Une erreur est survenue. Réessayez ou contactez le support." };
  }

  // 4. Mettre à jour paid_amount et balance_amount de la réservation
  const newPaidAmount = reservation.paid_amount + input.amount;
  const newBalanceAmount = reservation.total_amount - newPaidAmount;

  await supabase
    .from("reservations")
    .update({
      paid_amount: newPaidAmount,
      balance_amount: newBalanceAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.reservation_id);

  // 5. Log
  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "stay_payment_created",
    entity_type: "stay_payment",
    entity_id: data.id,
    metadata: {
      reservation_id: input.reservation_id,
      amount: input.amount,
      method: input.method,
      new_balance: newBalanceAmount,
    },
  });

  return { success: true, id: data.id };
}

/**
 * Récupère les paiements d'une réservation spécifique.
 */
export async function getPaymentsByReservation(
  reservationId: string,
  establishmentId: string
): Promise<StayPayment[]> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("stay_payments")
    .select(
      `
      id, establishment_id, reservation_id, amount, method, reference,
      payment_date, received_by, notes, created_at,
      reservation:reservations(guest:guests(full_name, phone), room:rooms(room_number))
    `
    )
    .eq("reservation_id", reservationId)
    .eq("establishment_id", establishmentId)
    .order("payment_date", { ascending: false });

  if (error || !data) return [];

  return (data as any[]).map((p) => ({
    id: p.id,
    establishment_id: p.establishment_id,
    reservation_id: p.reservation_id,
    guest_name: p.reservation?.guest?.full_name ?? null,
    guest_phone: p.reservation?.guest?.phone ?? null,
    room_number: p.reservation?.room?.room_number ?? null,
    amount: p.amount,
    method: p.method,
    reference: p.reference,
    payment_date: p.payment_date,
    received_by: p.received_by,
    notes: p.notes,
    created_at: p.created_at,
  }));
}
