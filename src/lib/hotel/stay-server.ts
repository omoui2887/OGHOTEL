import "server-only";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import type { Reservation } from "@/lib/hotel/reservations";

/**
 * Workflows Check-in et Check-out — SERVEUR UNIQUEMENT.
 *
 * 🔒 Filtrage par establishment_id + permissions par rôle.
 *
 * Check-in :
 * - Passe réservation → checked_in
 * - Passe chambre → occupied
 * - Enregistre acompte si fourni
 * - Log activité
 *
 * Check-out :
 * - Vérifie solde (sauf si hotel_admin/manager force)
 * - Passe réservation → checked_out
 * - Passe chambre → cleaning
 * - Crée tâche ménage automatique
 * - Log activité
 */

export async function getConfirmedArrivals(establishmentId: string): Promise<
  (Reservation & { room_number: string | null })[]
> {
  const supabase = createSupabaseAdminClient();
  const today = new Date().toISOString().split("T")[0];
  const in7Days = new Date();
  in7Days.setDate(in7Days.getDate() + 7);

  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
      id, establishment_id, guest_id, room_id, check_in_date, check_out_date,
      nights, adults, children, rate_amount, discount_amount, total_amount,
      paid_amount, balance_amount, status, source, notes, created_by,
      created_at, updated_at,
      guest:guests(full_name, phone),
      room:rooms(room_number, room_type:room_types(name))
    `
    )
    .eq("establishment_id", establishmentId)
    .eq("status", "confirmed")
    .gte("check_in_date", today)
    .lte("check_in_date", in7Days.toISOString().split("T")[0])
    .order("check_in_date", { ascending: true });

  if (error || !data) return [];

  return (data as any[]).map((r) => ({
    id: r.id,
    establishment_id: r.establishment_id,
    guest_id: r.guest_id,
    guest_name: r.guest?.full_name ?? null,
    guest_phone: r.guest?.phone ?? null,
    room_id: r.room_id,
    room_number: r.room?.room_number ?? null,
    room_type_name: r.room?.room_type?.name ?? null,
    check_in_date: r.check_in_date,
    check_out_date: r.check_out_date,
    nights: r.nights,
    adults: r.adults,
    children: r.children,
    rate_amount: r.rate_amount,
    discount_amount: r.discount_amount,
    total_amount: r.total_amount,
    paid_amount: r.paid_amount,
    balance_amount: r.balance_amount,
    status: r.status,
    source: r.source,
    notes: r.notes,
    created_by: r.created_by,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

export async function getActiveStays(establishmentId: string): Promise<
  (Reservation & { room_number: string | null })[]
> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("reservations")
    .select(
      `
      id, establishment_id, guest_id, room_id, check_in_date, check_out_date,
      nights, adults, children, rate_amount, discount_amount, total_amount,
      paid_amount, balance_amount, status, source, notes, created_by,
      created_at, updated_at,
      guest:guests(full_name, phone),
      room:rooms(room_number, room_type:room_types(name))
    `
    )
    .eq("establishment_id", establishmentId)
    .eq("status", "checked_in")
    .order("check_out_date", { ascending: true });

  if (error || !data) return [];

  return (data as any[]).map((r) => ({
    id: r.id,
    establishment_id: r.establishment_id,
    guest_id: r.guest_id,
    guest_name: r.guest?.full_name ?? null,
    guest_phone: r.guest?.phone ?? null,
    room_id: r.room_id,
    room_number: r.room?.room_number ?? null,
    room_type_name: r.room?.room_type?.name ?? null,
    check_in_date: r.check_in_date,
    check_out_date: r.check_out_date,
    nights: r.nights,
    adults: r.adults,
    children: r.children,
    rate_amount: r.rate_amount,
    discount_amount: r.discount_amount,
    total_amount: r.total_amount,
    paid_amount: r.paid_amount,
    balance_amount: r.balance_amount,
    status: r.status,
    source: r.source,
    notes: r.notes,
    created_by: r.created_by,
    created_at: r.created_at,
    updated_at: r.updated_at,
  }));
}

/**
 * Effectue le check-in d'une réservation.
 */
export async function performCheckIn(
  reservationId: string,
  establishmentId: string,
  userId: string,
  payment?: { amount: number; method: string; reference?: string }
): Promise<{ success: boolean; error?: string }> {
  const supabase = createSupabaseAdminClient();

  // 1. Vérifier la réservation
  const { data: reservation, error: resErr } = await supabase
    .from("reservations")
    .select("id, status, room_id, guest_id, paid_amount, balance_amount, total_amount")
    .eq("id", reservationId)
    .eq("establishment_id", establishmentId)
    .single();

  if (resErr || !reservation) {
    return { success: false, error: "Réservation introuvable" };
  }

  if (reservation.status !== "confirmed") {
    return {
      success: false,
      error: `Check-in impossible : statut actuel = ${reservation.status}`,
    };
  }

  // 2. Enregistrer le paiement si fourni
  let newPaidAmount = reservation.paid_amount;
  if (payment && payment.amount > 0) {
    const { error: payErr } = await supabase.from("stay_payments").insert({
      establishment_id: establishmentId,
      reservation_id: reservationId,
      amount: payment.amount,
      method: payment.method,
      reference: payment.reference || null,
      payment_date: new Date().toISOString(),
      received_by: userId,
    });

    if (payErr) {
      return { success: false, error: "Erreur enregistrement paiement : " + payErr.message };
    }
    newPaidAmount += payment.amount;
  }

  const newBalance = reservation.total_amount - newPaidAmount;

  // 3. Mettre à jour la réservation
  const { error: updateResErr } = await supabase
    .from("reservations")
    .update({
      status: "checked_in",
      paid_amount: newPaidAmount,
      balance_amount: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservationId);

  if (updateResErr) {
    return { success: false, error: updateResErr.message };
  }

  // 4. Mettre à jour le statut de la chambre → occupied
  const { error: roomErr } = await supabase
    .from("rooms")
    .update({ status: "occupied", updated_at: new Date().toISOString() })
    .eq("id", reservation.room_id)
    .eq("establishment_id", establishmentId);

  if (roomErr) {
    console.error("Erreur maj chambre:", roomErr);
  }

  // 5. Log activité
  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "check_in",
    entity_type: "reservation",
    entity_id: reservationId,
    metadata: {
      payment_amount: payment?.amount ?? 0,
      new_balance: newBalance,
    },
  });

  return { success: true };
}

/**
 * Effectue le check-out d'une réservation.
 */
export async function performCheckOut(
  reservationId: string,
  establishmentId: string,
  userId: string,
  options: {
    extraCharges?: number;
    payment?: { amount: number; method: string; reference?: string };
    forceUnpaid?: boolean; // hotel_admin/manager peut forcer
  } = {}
): Promise<{ success: boolean; error?: string; invoiceId?: string }> {
  const supabase = createSupabaseAdminClient();

  // 1. Vérifier la réservation
  const { data: reservation, error: resErr } = await supabase
    .from("reservations")
    .select("id, status, room_id, guest_id, total_amount, paid_amount, balance_amount, rate_amount, discount_amount, nights")
    .eq("id", reservationId)
    .eq("establishment_id", establishmentId)
    .single();

  if (resErr || !reservation) {
    return { success: false, error: "Réservation introuvable" };
  }

  if (reservation.status !== "checked_in") {
    return {
      success: false,
      error: `Check-out impossible : statut actuel = ${reservation.status}`,
    };
  }

  // 2. Ajouter frais supplémentaires si fournis
  let newTotal = reservation.total_amount;
  if (options.extraCharges && options.extraCharges > 0) {
    newTotal = reservation.total_amount + options.extraCharges;
  }

  // 3. Enregistrer le paiement si fourni
  let newPaidAmount = reservation.paid_amount;
  if (options.payment && options.payment.amount > 0) {
    const { error: payErr } = await supabase.from("stay_payments").insert({
      establishment_id: establishmentId,
      reservation_id: reservationId,
      amount: options.payment.amount,
      method: options.payment.method,
      reference: options.payment.reference || null,
      payment_date: new Date().toISOString(),
      received_by: userId,
    });

    if (payErr) {
      return { success: false, error: "Erreur paiement : " + payErr.message };
    }
    newPaidAmount += options.payment.amount;
  }

  const newBalance = newTotal - newPaidAmount;

  // 4. Vérifier le solde
  if (newBalance > 0 && !options.forceUnpaid) {
    return {
      success: false,
      error: `Solde impayé de ${newBalance} FCFA. Encaissez le solde ou demandez à un manager de forcer le check-out.`,
    };
  }

  // 5. Mettre à jour la réservation
  const { error: updateResErr } = await supabase
    .from("reservations")
    .update({
      status: "checked_out",
      total_amount: newTotal,
      paid_amount: newPaidAmount,
      balance_amount: newBalance,
      updated_at: new Date().toISOString(),
    })
    .eq("id", reservationId);

  if (updateResErr) {
    return { success: false, error: updateResErr.message };
  }

  // 6. Mettre à jour le statut de la chambre → cleaning
  const { error: roomErr } = await supabase
    .from("rooms")
    .update({ status: "cleaning", updated_at: new Date().toISOString() })
    .eq("id", reservation.room_id)
    .eq("establishment_id", establishmentId);

  if (roomErr) {
    console.error("Erreur maj chambre:", roomErr);
  }

  // 7. Créer une tâche de ménage automatique
  const { error: housekeepingErr } = await supabase
    .from("housekeeping_tasks")
    .insert({
      establishment_id: establishmentId,
      room_id: reservation.room_id,
      status: "dirty",
      notes: "Ménage automatique après check-out",
    });

  if (housekeepingErr) {
    console.error("Erreur création tâche ménage:", housekeepingErr);
  }

  // 8. Générer une facture
  const invoiceNumber = `FAC-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
  const { data: invoice, error: invoiceErr } = await supabase
    .from("invoices")
    .insert({
      establishment_id: establishmentId,
      reservation_id: reservationId,
      guest_id: reservation.guest_id,
      invoice_number: invoiceNumber,
      type: "invoice",
      amount: newTotal,
      status: newBalance > 0 ? "issued" : "paid",
      issued_at: new Date().toISOString(),
      created_by: userId,
    })
    .select("id")
    .single();

  if (invoiceErr) {
    console.error("Erreur création facture:", invoiceErr);
  }

  // 9. Log activité
  await supabase.from("activity_logs").insert({
    establishment_id: establishmentId,
    user_id: userId,
    action: "check_out",
    entity_type: "reservation",
    entity_id: reservationId,
    metadata: {
      total_amount: newTotal,
      paid_amount: newPaidAmount,
      balance: newBalance,
      extra_charges: options.extraCharges ?? 0,
      invoice_id: invoice?.id,
    },
  });

  return { success: true, invoiceId: invoice?.id };
}
