import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { isSafeUrl } from "@/lib/security/url";
import * as XLSX from "xlsx";

/**
 * GET /api/hotel/export?type=reservations|payments|expenses|reports|logo
 *
 * Exporte des données Admin Hôtel en XLSX.
 * 🔒 Filtrage par establishment_id.
 */

function toXLSX(headers: string[], rows: (string | number | null)[][], sheetName: string = "Export"): ArrayBuffer {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

export async function GET(request: NextRequest) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "reservations";
    const today = new Date().toISOString().split("T")[0];

    const allowedRoles = {
      reservations: ["hotel_admin", "manager", "receptionist"],
      payments: ["hotel_admin", "manager", "receptionist", "accountant"],
      expenses: ["hotel_admin", "manager", "accountant"],
      reports: ["hotel_admin", "manager", "accountant"],
    };

    // Export logo (tous les rôles)
    if (type === "logo") {
      const supabase = createSupabaseAdminClient();
      const { data: est } = await supabase
        .from("establishments")
        .select("logo_url, name")
        .eq("id", profile.establishment_id)
        .single();

      if (!est?.logo_url) {
        return NextResponse.json({ error: "Aucun logo configuré" }, { status: 404 });
      }

      // 🔒 Sécurité SSRF : valider l'URL avant de la fetch côté serveur.
      // Empêche l'accès au réseau interne (169.254.169.254, localhost, IPs privées).
      if (!isSafeUrl(est.logo_url)) {
        return NextResponse.json(
          { error: "URL du logo non autorisée (doit être HTTPS et publique)" },
          { status: 400 }
        );
      }

      // Télécharger l'image depuis l'URL
      try {
        const imgRes = await fetch(est.logo_url);
        if (!imgRes.ok) {
          return NextResponse.json({ error: "Logo inaccessible" }, { status: 404 });
        }
        const blob = await imgRes.blob();
        const ext = est.logo_url.split(".").pop()?.split("?")[0]?.toLowerCase() || "png";
        const filename = `logo-${est.name?.replace(/\s+/g, "-").toLowerCase() || "oghotel"}.${ext}`;
        return new NextResponse(blob, {
          headers: {
            "Content-Type": imgRes.headers.get("Content-Type") || "image/png",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      } catch {
        return NextResponse.json({ error: "Impossible de télécharger le logo" }, { status: 500 });
      }
    }

    const roles = allowedRoles[type as keyof typeof allowedRoles];
    if (!roles || !roles.includes(profile.role as any)) {
      return NextResponse.json({ error: "Permission refusée" }, { status: 403 });
    }

    const supabase = createSupabaseAdminClient();
    const estId = profile.establishment_id;
    let buffer: ArrayBuffer;
    let filename: string;

    if (type === "reservations") {
      const { data } = await supabase
        .from("reservations")
        .select("check_in_date, check_out_date, nights, adults, children, rate_amount, discount_amount, total_amount, paid_amount, balance_amount, status, source, notes, guest:guests(full_name, phone), room:rooms(room_number)")
        .eq("establishment_id", estId)
        .order("check_in_date", { ascending: false });

      buffer = toXLSX(
        ["Arrivée", "Départ", "Nuits", "Adultes", "Enfants", "Tarif/nuit", "Remise", "Total", "Payé", "Solde", "Statut", "Source", "Client", "Téléphone", "Chambre", "Notes"],
        (data ?? []).map((r: any) => [r.check_in_date, r.check_out_date, r.nights, r.adults, r.children, r.rate_amount, r.discount_amount, r.total_amount, r.paid_amount, r.balance_amount, r.status, r.source, r.guest?.full_name, r.guest?.phone, r.room?.room_number, r.notes]),
        "Réservations"
      );
      filename = `oghotel-reservations-${today}.xlsx`;
    }
    else if (type === "payments") {
      const { data } = await supabase
        .from("stay_payments")
        .select("amount, method, reference, payment_date, notes, reservation:reservations(guest:guests(full_name), room:rooms(room_number))")
        .eq("establishment_id", estId)
        .order("payment_date", { ascending: false });

      buffer = toXLSX(
        ["Montant FCFA", "Moyen", "Référence", "Date", "Client", "Chambre", "Notes"],
        (data ?? []).map((p: any) => [p.amount, p.method, p.reference, p.payment_date?.slice(0, 16).replace("T", " "), p.reservation?.guest?.full_name, p.reservation?.room?.room_number, p.notes]),
        "Paiements"
      );
      filename = `oghotel-paiements-${today}.xlsx`;
    }
    else if (type === "expenses") {
      const { data } = await supabase
        .from("expenses")
        .select("category, amount, expense_date, payment_method, description")
        .eq("establishment_id", estId)
        .order("expense_date", { ascending: false });

      buffer = toXLSX(
        ["Catégorie", "Montant FCFA", "Date", "Moyen paiement", "Description"],
        (data ?? []).map((e: any) => [e.category, e.amount, e.expense_date, e.payment_method, e.description]),
        "Dépenses"
      );
      filename = `oghotel-depenses-${today}.xlsx`;
    }
    else if (type === "reports") {
      const { data: payments } = await supabase
        .from("stay_payments").select("amount, payment_date")
        .eq("establishment_id", estId);
      const { data: expenses } = await supabase
        .from("expenses").select("amount, expense_date, category")
        .eq("establishment_id", estId);

      const totalRevenue = (payments ?? []).reduce((s: number, p: any) => s + p.amount, 0);
      const totalExpenses = (expenses ?? []).reduce((s: number, e: any) => s + e.amount, 0);

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

      buffer = toXLSX(["Section", "Valeur"], rows, "Rapport");
      filename = `oghotel-rapport-${today}.xlsx`;
    }
    else {
      return NextResponse.json({ error: "Type d'export invalide" }, { status: 400 });
    }

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Erreur export hotel:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
