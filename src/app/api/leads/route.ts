import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const leadSchema = z.object({
  full_name: z.string().min(2, "Le nom est requis"),
  email: z.string().min(1, "L'email est requis").email("Email invalide"),
  phone: z.string().min(6, "Le téléphone est requis"),
  hotel_name: z.string().min(2, "Le nom de l'établissement est requis"),
  business_type: z.enum(["hotel", "residence", "auberge", "autre"]),
  desired_plan: z.enum(["essentiel", "privilege", "premium", "indecis"]),
  message: z.string().max(2000).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
});

/**
 * POST /api/leads
 * Endpoint public : un prospect (non authentifié) soumet ses coordonnées
 * depuis la landing page. La politique RLS Supabase autorise l'INSERT public
 * sur la table `leads`. En cas d'absence de configuration Supabase, on renvoie
 * 503 pour que le frontend affiche un message d'erreur clair.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON invalide" }, { status: 400 });
  }

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
    supabase = await createSupabaseServerClient();
  } catch {
    // Supabase non configuré en local — on renvoie 503.
    return NextResponse.json(
      {
        error:
          "Service de leads non configuré. Contactez-nous directement par WhatsApp ou email.",
      },
      { status: 503 }
    );
  }

  const { error } = await supabase.from("leads").insert({
    full_name: data.full_name,
    email: data.email,
    phone: data.phone,
    hotel_name: data.hotel_name,
    business_type: data.business_type,
    desired_plan: data.desired_plan,
    message: data.message ?? null,
    source: data.source ?? "landing",
    status: "new",
  });

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
}
