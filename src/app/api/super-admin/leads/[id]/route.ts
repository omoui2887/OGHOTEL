import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

/**
 * PATCH /api/super-admin/leads/[id]
 *
 * Met à jour le statut et/ou les notes internes d'un prospect.
 * Log l'activité dans activity_logs.
 *
 * 🔒 Sécurité :
 * - Vérifie que l'utilisateur est connecté
 * - Vérifie que l'utilisateur est super_admin (via profil)
 * - Utilise le client admin (service_role) pour bypass RLS
 * - Le client admin ne sort JAMAIS du serveur
 *
 * Body : { status?: string, internal_notes?: string }
 */

const updateSchema = z.object({
  status: z
    .enum(["new", "contacted", "negotiating", "won", "lost"])
    .optional(),
  internal_notes: z.string().max(5000, "Notes trop longues").optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params;

    // Vérifier l'authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Vérifier le rôle super_admin
    const adminClient = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (profileError || !profile || profile.role !== "super_admin" || !profile.is_active) {
      return NextResponse.json(
        { error: "Accès refusé — super_admin requis" },
        { status: 403 }
      );
    }

    // Valider le body
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const { status, internal_notes } = parsed.data;

    // Récupérer le lead actuel (pour old_status dans le log)
    const { data: currentLead, error: fetchError } = await adminClient
      .from("leads")
      .select("status, internal_notes")
      .eq("id", leadId)
      .single();

    if (fetchError || !currentLead) {
      return NextResponse.json(
        { error: "Prospect introuvable" },
        { status: 404 }
      );
    }

    // Préparer l'update
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (status !== undefined) {
      updateData.status = status;
    }
    if (internal_notes !== undefined) {
      updateData.internal_notes = internal_notes;
    }

    const { error: updateError } = await adminClient
      .from("leads")
      .update(updateData)
      .eq("id", leadId);

    if (updateError) {
      console.error("Erreur update lead:", updateError);
      return NextResponse.json(
        { error: "Impossible de mettre à jour le prospect" },
        { status: 500 }
      );
    }

    // Log l'activité appropriée
    const logs: { action: string; metadata: Record<string, unknown> }[] = [];
    if (status !== undefined && status !== currentLead.status) {
      logs.push({
        action: "lead_status_changed",
        metadata: {
          old_status: currentLead.status,
          new_status: status,
        },
      });
    }
    if (internal_notes !== undefined && internal_notes !== currentLead.internal_notes) {
      logs.push({
        action: "lead_notes_updated",
        metadata: { action_detail: "Notes internes mises à jour" },
      });
    }

    // Insérer les logs
    for (const log of logs) {
      await adminClient.from("activity_logs").insert({
        establishment_id: null,
        user_id: user.id,
        action: log.action,
        entity_type: "lead",
        entity_id: leadId,
        metadata: log.metadata,
      });
    }

    return NextResponse.json({
      success: true,
      message: "Prospect mis à jour",
      logs_count: logs.length,
    });
  } catch (err) {
    console.error("Erreur PATCH /api/super-admin/leads/[id]:", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
