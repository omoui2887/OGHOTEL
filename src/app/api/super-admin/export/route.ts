import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

/**
 * GET /api/super-admin/export?type=prospects|clients|payments|revenue
 * Exporte des données Super Admin en XLSX.
 * 🔒 super_admin uniquement.
 */

function toXLSX(headers: string[], rows: (string | number | null)[][], sheetName: string = "Export"): ArrayBuffer {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  return XLSX.write(wb, { type: "array", bookType: "xlsx" }) as ArrayBuffer;
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const adminClient = createSupabaseAdminClient();
    const { data: profile } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "super_admin" || !profile.is_active) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") ?? "prospects";
    const today = new Date().toISOString().split("T")[0];

    let buffer: ArrayBuffer;
    let filename: string;

    if (type === "prospects") {
      const { data } = await adminClient
        .from("leads")
        .select("full_name, business_name, business_type, city, rooms_count, phone, email, status, desired_plan:plans(name), created_at")
        .order("created_at", { ascending: false });

      buffer = toXLSX(
        ["Nom", "Structure", "Type", "Ville", "Chambres", "Téléphone", "Email", "Statut", "Formule souhaitée", "Date"],
        (data ?? []).map((l: any) => [l.full_name, l.business_name, l.business_type, l.city, l.rooms_count, l.phone, l.email, l.status, l.desired_plan?.name ?? "", l.created_at?.slice(0, 10)]),
        "Prospects"
      );
      filename = `oghotel-prospects-${today}.xlsx`;
    }
    else if (type === "clients") {
      const { data } = await adminClient
        .from("establishments")
        .select("name, type, owner_name, email, phone, city, subscription_status, subscription_start, subscription_end, plan:plans(name)")
        .order("created_at", { ascending: false });

      buffer = toXLSX(
        ["Établissement", "Type", "Gérant", "Email", "Téléphone", "Ville", "Statut abonnement", "Début", "Fin", "Formule"],
        (data ?? []).map((e: any) => [e.name, e.type, e.owner_name, e.email, e.phone, e.city, e.subscription_status, e.subscription_start, e.subscription_end, e.plan?.name ?? ""]),
        "Clients"
      );
      filename = `oghotel-clients-${today}.xlsx`;
    }
    else if (type === "payments") {
      const { data } = await adminClient
        .from("subscription_payments")
        .select("amount_fcfa, payment_method, transaction_reference, status, paid_at, validated_by, plan:plans(name), lead:leads(full_name), establishment:establishments(name)")
        .order("created_at", { ascending: false });

      buffer = toXLSX(
        ["Montant FCFA", "Moyen", "Référence", "Statut", "Date paiement", "Validé par", "Formule", "Prospect", "Établissement"],
        (data ?? []).map((p: any) => [p.amount_fcfa, p.payment_method, p.transaction_reference, p.status, p.paid_at?.slice(0, 10), p.validated_by, p.plan?.name ?? "", p.lead?.full_name ?? "", p.establishment?.name ?? ""]),
        "Paiements SaaS"
      );
      filename = `oghotel-paiements-saas-${today}.xlsx`;
    }
    else if (type === "revenue") {
      const { data } = await adminClient
        .from("subscription_payments")
        .select("amount_fcfa, payment_method, status, paid_at, plan:plans(name)")
        .eq("status", "validated")
        .order("paid_at", { ascending: true });

      const monthMap = new Map<string, { revenue: number; count: number }>();
      (data ?? []).forEach((p: any) => {
        const month = p.paid_at?.slice(0, 7) ?? "—";
        if (!monthMap.has(month)) monthMap.set(month, { revenue: 0, count: 0 });
        const e = monthMap.get(month)!;
        e.revenue += p.amount_fcfa || 0;
        e.count += 1;
      });

      buffer = toXLSX(
        ["Mois", "Revenu FCFA", "Nombre paiements"],
        Array.from(monthMap.entries()).map(([month, v]) => [month, v.revenue, v.count]),
        "Revenus"
      );
      filename = `oghotel-revenus-${today}.xlsx`;
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
    console.error("Erreur export super-admin:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
