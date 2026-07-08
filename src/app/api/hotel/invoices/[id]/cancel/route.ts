import { NextRequest, NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { cancelInvoice } from "@/lib/hotel/invoices-server";

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const profile = await getCurrentProfile();
    if (!profile || !profile.establishment_id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    if (profile.role !== "hotel_admin" && profile.role !== "manager") {
      return NextResponse.json(
        { error: "Seul un Admin Hôtel ou Manager peut annuler une facture" },
        { status: 403 }
      );
    }

    const result = await cancelInvoice(id, profile.establishment_id, profile.id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Facture annulée" });
  } catch (err) {
    console.error("Erreur POST /api/hotel/invoices/[id]/cancel:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
