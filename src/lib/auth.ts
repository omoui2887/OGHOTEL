import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types";

/**
 * Helpers d'authentification côté serveur.
 *
 * Tous ces helpers sont "défensifs" : si Supabase n'est pas configuré
 * (ex : sandbox sans .env.local) ou si la table `profiles` n'existe pas
 * encore, ils retournent `null` au lieu de planter.
 *
 * La table `profiles` sera créée à l'étape 4 (base de données).
 * Voir PRD §13.1 pour le schéma.
 */

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  establishment_id: string | null;
  must_change_password: boolean;
  is_active: boolean;
  created_at: string;
};

/**
 * Récupère l'utilisateur Supabase Auth connecté.
 * Retourne `null` si non connecté ou si Supabase n'est pas configuré.
 */
export async function getCurrentUser() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Récupère le profil complet de l'utilisateur connecté.
 *
 * Le profil est lu dans la table `profiles` (PRD §13.1).
 * Si la table n'existe pas encore ou si l'utilisateur n'a pas de profil,
 * retourne `null`.
 */
export async function getCurrentProfile(): Promise<Profile | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      email: user.email ?? "",
    } as Profile;
  } catch {
    return null;
  }
}

/**
 * Vérifie qu'un utilisateur est connecté, sinon redirige vers /login.
 * Retourne toujours un utilisateur valide (jamais null).
 */
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Vérifie qu'un utilisateur connecté a un profil, sinon redirige vers /login.
 * Retourne toujours un profil valide (jamais null).
 */
export async function requireProfile(): Promise<Profile> {
  const profile = await getCurrentProfile();
  if (!profile) {
    redirect("/login");
  }
  return profile;
}

/**
 * Vérifie que le profil connecté a l'un des rôles autorisés.
 * Sinon redirige vers /unauthorized.
 */
export async function requireRole(roles: UserRole | UserRole[]): Promise<Profile> {
  const profile = await requireProfile();
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(profile.role)) {
    redirect("/unauthorized");
  }
  return profile;
}

/** Raccourci : exige le rôle super_admin. */
export async function requireSuperAdmin(): Promise<Profile> {
  return requireRole("super_admin");
}

/** Raccourci : exige un rôle établissement (hotel_admin ou staff). */
export async function requireHotelUser(): Promise<Profile> {
  return requireRole([
    "hotel_admin",
    "manager",
    "receptionist",
    "accountant",
    "housekeeping",
    "maintenance",
  ]);
}

/**
 * Vérifie qu'un utilisateur est connecté ET actif.
 * Un compte désactivé (is_active = false) est traité comme déconnecté.
 */
export async function getCurrentActiveProfile(): Promise<Profile | null> {
  const profile = await getCurrentProfile();
  if (!profile || !profile.is_active) return null;
  return profile;
}
