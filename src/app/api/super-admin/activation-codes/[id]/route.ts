import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { updateCodeStatus } from "@/lib/super-admin/activation-codes-server";
import { z } from "zod";

/**
 * PATCH /api/super-admin/activation-codes/[id]
 * Marque un code comme envoyé ou annulé.
 *
 * Body: { status: "sent" | "cancelled" }
 *
 * 🔒 super_admin uniquement.
 */

const updateSchema = z.object({
  status: z.enum(["sent", "cancelled"], {
    error: "Action invalide (sent ou cancelled)",
  }),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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
      return NextResponse.json(
        { error: "Accès refusé — super_admin requis" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const result = await updateCodeStatus(id, parsed.data.status, user.id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Impossible de mettre à jour le code" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        parsed.data.status === "sent"
          ? "Code marqué comme envoyé"
          : "Code annulé",
    });
  } catch (err) {
    console.error("Erreur PATCH /api/super-admin/activation-codes/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
