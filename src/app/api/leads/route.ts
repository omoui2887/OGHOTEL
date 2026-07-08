import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

const leadSchema = z.object({
  full_name: z.string().min(2, "Le nom est requis"),
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  phone: z.string().min(6, "Le téléphone est requis"),
  hotel_name: z.string().min(2, "Le nom de l'établissement est requis"),
  business_type: z.enum(["hotel", "residence", "auberge", "autre"]),
  desired_plan: z.enum(["essentiel", "privilege", "premium", "indecis"]),
  message: z.string().max(2000).optional().nullable(),
});

/**
 * POST /api/leads
 * Endpoint public : un prospect soumet ses coordonnées depuis la landing page.
 * Utilise le client admin (service_role) car la RLS peut ne pas être configurée.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0];
      return NextResponse.json(
        { error: firstError?.message ?? "Données invalides" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    let supabase;
    try {
      supabase = createSupabaseAdminClient();
    } catch {
      return NextResponse.json(
        { error: "Service non configuré. Veuillez réessayer plus tard." },
        { status: 503 }
      );
    }

    // Mapper desired_plan vers desired_plan_id (UUID du plan)
    const PLAN_NAME_MAP: Record<string, string> = {
      essentiel: "ESSENTIEL",
      privilege: "PRIVILEGE",
      premium: "PREMIUM",
    };

    let desired_plan_id: string | null = null;
    const planName = PLAN_NAME_MAP[data.desired_plan];
    if (planName) {
      const { data: plan } = await supabase
        .from("plans")
        .select("id")
        .eq("name", planName)
        .eq("is_active", true)
        .single();
      if (plan) desired_plan_id = plan.id;
    }

    // Insérer dans la table leads (schéma PRD §13.3)
    const insertData: Record<string, unknown> = {
      full_name: data.full_name,
      email: data.email,
      phone: data.phone,
      business_name: data.hotel_name, // colonne dans le schéma SQL
      business_type: data.business_type,
      message: data.message ?? null,
      status: "new",
    };

    if (desired_plan_id) {
      insertData.desired_plan_id = desired_plan_id;
    }

    const { error } = await supabase.from("leads").insert(insertData);

    if (error) {
      console.error("[/api/leads] Supabase insert error:", error.message);
      return NextResponse.json(
        { error: "Impossible d'enregistrer votre demande pour le moment." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, message: "Demande enregistrée. Nous vous contactons sous 24h." },
      { status: 201 }
    );
  } catch (err) {
    console.error("[/api/leads] Unexpected error:", err);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
