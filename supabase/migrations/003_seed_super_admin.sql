-- ============================================================================
-- OGHOTEL — Migration 003 : Seed du profil Super Admin
-- ============================================================================
-- Crée le profil super_admin pour l'utilisateur déjà créé dans Supabase Auth.
--
-- ⚠️  Pré-requis :
--   - Le user Supabase Auth existe déjà (email: ogouromain@gmail.com)
--   - Son ID Auth est : 8ddc4ac8-060b-4c30-914c-91e496d09def
--   - Migration 001 (schéma) déjà exécutée
--
-- ⚠️  Sécurité :
--   - must_change_password = true → le Super Admin devra changer son mot de
--     passe à la première connexion (PRD §8.2.1 + §20.7).
--   - establishment_id = null → le Super Admin n'est pas rattaché à un
--     établissement (PRD §5.1 + §14.5).
--
-- Idempotent : on conflict (id) do nothing — peut être rejoué sans risque.
-- ============================================================================

insert into public.profiles (
    id,
    full_name,
    phone,
    role,
    establishment_id,
    must_change_password,
    is_active
) values (
    '8ddc4ac8-060b-4c30-914c-91e496d09def',
    'Super Admin OGHOTEL',
    '+225057610327',
    'super_admin',
    null,
    true,
    true
)
on conflict (id) do nothing;

-- ============================================================================
-- Vérification
-- ============================================================================
select id, full_name, role, establishment_id, must_change_password, is_active
from public.profiles
where role = 'super_admin';

-- ============================================================================
-- FIN — Profil Super Admin créé.
-- ============================================================================
