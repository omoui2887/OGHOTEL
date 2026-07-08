import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";
import { updatePlan } from "@/lib/super-admin/plans-server";
import { z } from "zod";

/**
 * PATCH /api/super-admin/plans/[id]
 *
 * Met à jour un plan tarifaire.
 *
 * 🔒 Sécurité :
 * - Vérifie que l'utilisateur est connecté
 * - Vérifie que l'utilisateur est super_admin
 * - Utilise le client admin (service_role) pour bypass RLS
 *
 * Body (tous les champs sont optionnels) :
 * {
 *   price_fcfa?: number,
 *   description?: string,
 *   is_active?: boolean,
 *   max_users?: number | null,
 *   max_establishments?: number | null,
 *   features?: PlanFeatures
 * }
 */

const featuresSchema = z.object({}).passthrough();

const updateSchema = z.object({
  price_fcfa: z
    .number()
    .int("Le prix doit être un entier")
    .min(0, "Le prix ne peut pas être négatif")
    .max(10000000, "Le prix est trop élevé")
    .optional(),
  description: z.string().max(2000, "Description trop longue").optional(),
  is_active: z.boolean().optional(),
  max_users: z
    .number()
    .int("Doit être un entier")
    .min(1, "Doit être au moins 1")
    .max(1000, "Valeur trop élevée")
    .nullable()
    .optional(),
  max_establishments: z
    .number()
    .int("Doit être un entier")
    .min(1, "Doit être au moins 1")
    .max(1000, "Valeur trop élevée")
    .nullable()
    .optional(),
  features: featuresSchema.optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Vérifier l'authentification
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Vérifier le rôle super_admin
    const adminClient = createSupabaseAdminClient();
    const { data: profile, error: profileError } = await adminClient
      .from("profiles")
      .select("role, is_active")
      .eq("id", user.id)
      .single();

    if (
      profileError ||
      !profile ||
      profile.role !== "super_admin" ||
      !profile.is_active
    ) {
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

    // Mettre à jour
    const result = await updatePlan(id, parsed.data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Impossible de mettre à jour le plan" },
        { status: 500 }
      );
    }

    // Log l'activité
    await adminClient.from("activity_logs").insert({
      establishment_id: null,
      user_id: user.id,
      action: "plan_updated",
      entity_type: "plan",
      entity_id: id,
      metadata: { updated_fields: Object.keys(parsed.data) },
    });

    return NextResponse.json({
      success: true,
      message: "Plan mis à jour",
    });
  } catch (err) {
    console.error("Erreur PATCH /api/super-admin/plans/[id]:", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
