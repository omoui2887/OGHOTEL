import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

/**
 * GET /api/hotel/export?type=reservations|payments|expenses|reports
 *
 * Exporte des données Admin Hôtel en CSV.
 * 🔒 hotel_admin, manager, accountant, receptionist selon le type.
 * 🔒 Filtrage par establishment_id.
 */

function toCSV(headers: string[], rows: (string | number | null)[][]): string {
  const csv = [
    headers.map((h) => `"${h}"`).join(","),
    ...rows.map((r) => r.map((c) => `"${c ?? ""}"`).join(",")),
  ].join("\n");
  return "\uFEFF" + csv;
}

export async function GET(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Permissions par type d'export
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "reservations";
    const today = new Date().toISOString().split("T")[0];

    const allowedRoles = {
      reservations: ["hotel_admin", "manager", "receptionist"],
      payments: ["hotel_admin", "manager", "receptionist", "accountant"],
      expenses: ["hotel_admin", "manager", "accountant"],
      reports: ["hotel_admin", "manager", "accountant"],
    };

    const roles = allowedRoles[type as keyof typeof allowedRoles];
    if (!roles || !roles.includes(profile.role as any)) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();
    const estId = profile.establishment_id;
    let csv = "";
    let filename = "";

    if (type === "reservations") {
      const { data } = await supabase
        .from("reservations")
        .select("check_in_date, check_out_date, nights, adults, children, rate_amount, discount_amount, total_amount, paid_amount, balance_amount, status, source, notes, guest:guests(full_name, phone), room:rooms(room_number)")
        .eq("establishment_id", estId)
        .order("check_in_date", { ascending: false });

      csv = toCSV(
        ["Arrivée", "Départ", "Nuits", "Adultes", "Enfants", "Tarif/nuit", "Remise", "Total", "Payé", "Solde", "Statut", "Source", "Client", "Téléphone", "Chambre", "Notes"],
        (data ?? []).map((r: any) => [r.check_in_date, r.check_out_date, r.nights, r.adults, r.children, r.rate_amount, r.discount_amount, r.total_amount, r.paid_amount, r.balance_amount, r.status, r.source, r.guest?.full_name, r.guest?.phone, r.room?.room_number, r.notes])
      );
      filename = `oghotel-reservations-${today}.csv`;
    }
    else if (type === "payments") {
      const { data } = await supabase
        .from("stay_payments")
        .select("amount, method, reference, payment_date, notes, reservation:reservations(guest:guests(full_name), room:rooms(room_number))")
        .eq("establishment_id", estId)
        .order("payment_date", { ascending: false });

      csv = toCSV(
        ["Montant FCFA", "Moyen", "Référence", "Date", "Client", "Chambre", "Notes"],
        (data ?? []).map((p: any) => [p.amount, p.method, p.reference, p.payment_date?.slice(0, 16).replace("T", " "), p.reservation?.guest?.full_name, p.reservation?.room?.room_number, p.notes])
      );
      filename = `oghotel-paiements-${today}.csv`;
    }
    else if (type === "expenses") {
      const { data } = await supabase
        .from("expenses")
        .select("category, amount, expense_date, payment_method, description")
        .eq("establishment_id", estId)
        .order("expense_date", { ascending: false });

      csv = toCSV(
        ["Catégorie", "Montant FCFA", "Date", "Moyen paiement", "Description"],
        (data ?? []).map((e: any) => [e.category, e.amount, e.expense_date, e.payment_method, e.description])
      );
      filename = `oghotel-depenses-${today}.csv`;
    }
    else if (type === "reports") {
      // Rapport complet : recettes + dépenses + résultat net
      const { data: payments } = await supabase
        .from("stay_payments")
        .select("amount, payment_date")
        .eq("establishment_id", estId);
      const { data: expenses } = await supabase
        .from("expenses")
        .select("amount, expense_date, category")
        .eq("establishment_id", estId);

      const totalRevenue = (payments ?? []).reduce((s: number, p: any) => s + p.amount, 0);
      const totalExpenses = (expenses ?? []).reduce((s: number, e: any) => s + e.amount, 0);

      // Dépenses par catégorie
      const catMap = new Map<string, number>();
      (expenses ?? []).forEach((e: any) => {
        catMap.set(e.category, (catMap.get(e.category) || 0) + e.amount);
      });

      const rows: (string | number)[][] = [
        ["RAPPORT OGHOTEL", ""],
        ["Date export", today],
        ["", ""],
        ["INDICATEUR", "VALEUR"],
        ["Total recettes (FCFA)", totalRevenue],
        ["Total dépenses (FCFA)", totalExpenses],
        ["Résultat net (FCFA)", totalRevenue - totalExpenses],
        ["", ""],
        ["DÉPENSES PAR CATÉGORIE", ""],
        ["Catégorie", "Montant FCFA"],
      ];
      catMap.forEach((amount, category) => rows.push([category, amount]));

      csv = toCSV(["Section", "Valeur"], rows);
      filename = `oghotel-rapport-${today}.csv`;
    }
    else {
      return NextResponse.json({ error: "Type d'export invalide" }, { status: 400 });
    }

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Erreur export hotel:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
