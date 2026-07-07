-- ============================================================================
-- OGHOTEL — Migration 002 : Seed des 3 plans d'abonnement
-- ============================================================================
-- PRD §9 : Formules tarifaires annuelles en FCFA
--   ESSENTIEL  : 30 000 FCFA/an — 1 établissement, 1 utilisateur
--   PRIVILEGE  : 50 000 FCFA/an — 1 établissement, 3 utilisateurs, +modules
--   PREMIUM    : 75 000 FCFA/an — multi-établissements, utilisateurs illimités
--
-- Idempotent : on conflict (name) do nothing — peut être rejoué sans risque.
-- ============================================================================

insert into public.plans (
    name,
    price_fcfa,
    duration_days,
    max_users,
    max_establishments,
    features,
    description,
    is_active
) values
-- --------------------------------------------------------------------------
-- ESSENTIEL — 30 000 FCFA/an
-- --------------------------------------------------------------------------
(
    'ESSENTIEL',
    30000,
    365,
    1,
    1,
    '{
        "chambres": true,
        "reservations": true,
        "clients": true,
        "paiements": true,
        "facturation": true,
        "rapports": true,
        "depenses": "limite",
        "personnel": false,
        "menage": false,
        "maintenance": false,
        "export_csv": false,
        "export_pdf": false,
        "multi_etablissement": false,
        "support_prioritaire": false,
        "assistance_dediee": false
    }'::jsonb,
    'Petite résidence, auberge, petit hôtel — 1 établissement, 1 utilisateur Admin. Chambres, réservations, clients, paiements, facturation simple, statistiques de base.',
    true
),
-- --------------------------------------------------------------------------
-- PRIVILEGE — 50 000 FCFA/an
-- --------------------------------------------------------------------------
(
    'PRIVILEGE',
    50000,
    365,
    3,
    1,
    '{
        "chambres": true,
        "reservations": true,
        "clients": true,
        "paiements": true,
        "facturation": true,
        "rapports": true,
        "rapports_avances": true,
        "depenses": true,
        "personnel": true,
        "menage": true,
        "maintenance": true,
        "export_csv": true,
        "export_pdf": true,
        "multi_etablissement": false,
        "support_prioritaire": true,
        "assistance_dediee": false
    }'::jsonb,
    'Hôtel ou résidence de taille moyenne — jusqu''à 3 comptes personnel. Tout Essentiel + dépenses, ménage, maintenance, rapports avancés, exports CSV/PDF, support prioritaire.',
    true
),
-- --------------------------------------------------------------------------
-- PREMIUM — 75 000 FCFA/an
-- --------------------------------------------------------------------------
(
    'PREMIUM',
    75000,
    365,
    null,
    null,
    '{
        "chambres": true,
        "reservations": true,
        "clients": true,
        "paiements": true,
        "facturation": true,
        "rapports": true,
        "rapports_avances": true,
        "depenses": true,
        "personnel": true,
        "menage": true,
        "maintenance": true,
        "export_csv": true,
        "export_pdf": true,
        "export_comptable": true,
        "multi_etablissement": true,
        "support_prioritaire": true,
        "assistance_dediee": true
    }'::jsonb,
    'Groupe, grande résidence, multi-sites — utilisateurs illimités, multi-établissements, exports comptables avancés, assistance dédiée.',
    true
)
on conflict (name) do nothing;

-- ============================================================================
-- Vérification
-- ============================================================================
select name, price_fcfa, duration_days, max_users, max_establishments, is_active
from public.plans
order by price_fcfa asc;

-- ============================================================================
-- FIN — 3 plans insérés (ou déjà présents).
-- ============================================================================
