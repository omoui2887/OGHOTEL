-- ============================================================================
-- OGHOTEL — Test d'isolation RLS entre deux établissements
-- ============================================================================
-- Ce script est AUTONOME : il crée ses propres données de test, vérifie
-- l'isolation multi-tenant, puis nettoie tout à la fin.
--
-- ⚠️  À exécuter dans Supabase SQL Editor en mode "Run" normal.
-- ⚠️  Le script utilise des blocs begin/commit pour simuler différentes
--     sessions utilisateur via set local request.jwt.claims.
--
-- PRÉ-REQUIS :
--   - Migrations 001 (schéma), 002 (plans), 003 (RLS) déjà exécutées
--   - Migration 004 (seed super_admin) déjà exécutée (recommandé)
-- ============================================================================


-- ============================================================================
-- ÉTAPE 1 — CRÉATION DES DONNÉES DE TEST
-- ============================================================================
-- Exécuté en tant que postgres (bypass RLS).
-- On crée :
--   - 2 establishments (Hotel A, Hotel B)
--   - 1 room_type par établissement
--   - 2 rooms par établissement
--   - 2 profils hotel_admin (un par établissement) avec des UUIDs générés
-- ============================================================================

-- Cleanup préalable (au cas où le script aurait été joué avant)
delete from public.profiles            where email like '%@test-rls.oghotel';
delete from public.rooms               where room_number like 'TEST-RLS-%';
delete from public.room_types          where name like 'TEST-RLS-%';
delete from public.establishments      where name like 'TEST-RLS-%';

-- Récupérer l'ID du plan ESSENTIEL (requis par establishments)
do $$
declare
    v_plan_id uuid;
begin
    select id into v_plan_id from public.plans where name = 'ESSENTIEL' limit 1;
    if v_plan_id is null then
        raise exception 'Plan ESSENTIEL introuvable. Exécutez 002_seed_plans.sql d''abord.';
    end if;
end $$;

-- Créer 2 establishments (postgres bypass RLS)
insert into public.establishments (name, type, owner_name, city, plan_id, subscription_status, subscription_start, subscription_end, currency)
values
    ('TEST-RLS Hotel A', 'hotel', 'Gérant A', 'Abidjan',
     (select id from public.plans where name = 'ESSENTIEL'),
     'active', current_date, current_date + interval '365 days', 'XOF'),
    ('TEST-RLS Hotel B', 'hotel', 'Gérant B', 'Bouaké',
     (select id from public.plans where name = 'ESSENTIEL'),
     'active', current_date, current_date + interval '365 days', 'XOF');

-- Stocker les IDs des 2 establishments dans des variables \gset
select id as hotel_a_id, 'a' as dummy from public.establishments where name = 'TEST-RLS Hotel A' \gset
select id as hotel_b_id, 'b' as dummy from public.establishments where name = 'TEST-RLS Hotel B' \gset

-- Créer 1 room_type par établissement
insert into public.room_types (establishment_id, name, default_price, capacity, description, is_active)
values
    (:'hotel_a_id', 'TEST-RLS Standard A', 15000, 2, 'Chambre standard test RLS A', true),
    (:'hotel_b_id', 'TEST-RLS Standard B', 15000, 2, 'Chambre standard test RLS B', true);

select id as room_type_a_id from public.room_types where name = 'TEST-RLS Standard A' \gset
select id as room_type_b_id from public.room_types where name = 'TEST-RLS Standard B' \gset

-- Créer 2 rooms par établissement
insert into public.rooms (establishment_id, room_type_id, room_number, floor, capacity, price_per_night, status)
values
    (:'hotel_a_id', :'room_type_a_id', 'TEST-RLS-A-101', '1', 2, 15000, 'available'),
    (:'hotel_a_id', :'room_type_a_id', 'TEST-RLS-A-102', '1', 2, 15000, 'available'),
    (:'hotel_b_id', :'room_type_b_id', 'TEST-RLS-B-201', '2', 2, 15000, 'available'),
    (:'hotel_b_id', :'room_type_b_id', 'TEST-RLS-B-202', '2', 2, 15000, 'available');

-- Créer 2 profils hotel_admin (UUIDs générés à la volée)
-- ⚠️  Ces profils n'ont PAS de user Auth correspondant, mais pour le test RLS
--     ce n'est pas grave : auth.uid() renvoie le sub du JWT, pas une vérif de table.
insert into public.profiles (id, full_name, phone, role, establishment_id, must_change_password, is_active)
values
    (gen_random_uuid(), 'Hotel Admin A (test)', '+225000000001', 'hotel_admin', :'hotel_a_id', false, true),
    (gen_random_uuid(), 'Hotel Admin B (test)', '+225000000002', 'hotel_admin', :'hotel_b_id', false, true);

-- Récupérer les UUIDs des profils créés
select id as user_a_id from public.profiles where full_name = 'Hotel Admin A (test)' \gset
select id as user_b_id from public.profiles where full_name = 'Hotel Admin B (test)' \gset

-- Afficher un récapitulatif
\echo '=============================================================================='
\echo 'DONNÉES DE TEST CRÉÉES :'
\echo '=============================================================================='
select
    'Hotel A' as hotel,
    :'hotel_a_id'::text as establishment_id,
    :'user_a_id'::text as hotel_admin_id
union all
select
    'Hotel B',
    :'hotel_b_id'::text,
    :'user_b_id'::text;

select
    e.name as establishment,
    r.room_number,
    r.status
from public.establishments e
join public.rooms r on r.establishment_id = e.id
where e.name like 'TEST-RLS-%'
order by e.name, r.room_number;


-- ============================================================================
-- ÉTAPE 2 — TESTS D'ISOLATION RLS
-- ============================================================================
-- On simule la session de chaque user avec set local request.jwt.claims.
-- set local est limité à la transaction courante (begin/commit).
-- ============================================================================

\echo ''
\echo '=============================================================================='
\echo 'TEST 1 — User A ne voit QUE les chambres de l''Hotel A'
\echo '=============================================================================='
begin;
    set local request.jwt.claims = json_build_object(
        'sub', :'user_a_id'::text,
        'role', 'authenticated'
    )::text;

    select 'User A voit ces chambres :' as info;
    select room_number, establishment_id = :'hotel_a_id' as is_hotel_a
    from public.rooms
    order by room_number;

    -- Compter les chambres de l'Hotel B visibles par User A
    select
        (select count(*) from public.rooms) as total_visible,
        (select count(*) from public.rooms where establishment_id = :'hotel_a_id') as hotel_a_visible,
        (select count(*) from public.rooms where establishment_id = :'hotel_b_id') as hotel_b_visible;
    -- ✅ Attendu : total = 2, hotel_a = 2, hotel_b = 0
commit;

\echo ''
\echo '=============================================================================='
\echo 'TEST 2 — User B ne voit QUE les chambres de l''Hotel B'
\echo '=============================================================================='
begin;
    set local request.jwt.claims = json_build_object(
        'sub', :'user_b_id'::text,
        'role', 'authenticated'
    )::text;

    select 'User B voit ces chambres :' as info;
    select room_number, establishment_id = :'hotel_b_id' as is_hotel_b
    from public.rooms
    order by room_number;

    select
        (select count(*) from public.rooms) as total_visible,
        (select count(*) from public.rooms where establishment_id = :'hotel_b_id') as hotel_b_visible,
        (select count(*) from public.rooms where establishment_id = :'hotel_a_id') as hotel_a_visible;
    -- ✅ Attendu : total = 2, hotel_b = 2, hotel_a = 0
commit;


\echo ''
\echo '=============================================================================='
\echo 'TEST 3 — User A tente d''INSÉRER une chambre dans l''Hotel B → doit ÉCHOUER'
\echo '=============================================================================='
begin;
    set local request.jwt.claims = json_build_object(
        'sub', :'user_a_id'::text,
        'role', 'authenticated'
    )::text;

    -- Cette insertion DOIT échouer avec "new row violates row-level security policy"
    insert into public.rooms (establishment_id, room_type_id, room_number, floor, capacity, price_per_night, status)
    values (:'hotel_b_id', :'room_type_b_id', 'TEST-RLS-HACK', '9', 1, 99999, 'available');
    -- ❌ Attendu : ERROR: new row violates row-level security policy for table "rooms"
commit;


\echo ''
\echo '=============================================================================='
\echo 'TEST 4 — User A tente de LIRE les guests de l''Hotel B → doit retourner 0'
\echo '=============================================================================='
begin;
    set local request.jwt.claims = json_build_object(
        'sub', :'user_a_id'::text,
        'role', 'authenticated'
    )::text;

    select count(*) as guests_visibles_dans_hotel_b
    from public.guests
    where establishment_id = :'hotel_b_id';
    -- ✅ Attendu : 0 (même s'il y avait des guests dans l'Hotel B)
commit;


\echo ''
\echo '=============================================================================='
\echo 'TEST 5 — Un user non authentifié (anon) ne peut PAS lire les codes d''activation'
\echo '=============================================================================='
begin;
    set local role to anon;

    select count(*) as codes_visibles_par_anon
    from public.activation_codes;
    -- ✅ Attendu : 0 (RLS bloque la lecture publique)
commit;


\echo ''
\echo '=============================================================================='
\echo 'TEST 6 — Un user non authentifié (anon) PEUT insérer un lead (landing page)'
\echo '=============================================================================='
begin;
    set local role to anon;

    insert into public.leads (full_name, business_name, business_type, city, rooms_count, phone, email, message, status)
    values ('Prospect Test', 'Hôtel Test', 'hotel', 'Yamoussoukro', 10, '+2250700000000', 'prospect@test.ci', 'Test landing page', 'new');

    select 'Lead inséré avec succès par anon ✅' as resultat;
commit;

-- Vérifier que le lead a bien été créé
select id, full_name, status from public.leads where email = 'prospect@test.ci';


\echo ''
\echo '=============================================================================='
\echo 'TEST 7 — Le super_admin voit TOUTES les chambres de TOUS les établissements'
\echo '=============================================================================='
begin;
    set local request.jwt.claims = json_build_object(
        'sub', '8ddc4ac8-060b-4c30-914c-91e496d09def',
        'role', 'authenticated'
    )::text;

    select
        e.name as establishment,
        count(r.id) as total_rooms
    from public.establishments e
    left join public.rooms r on r.establishment_id = e.id
    where e.name like 'TEST-RLS-%'
    group by e.name
    order by e.name;
    -- ✅ Attendu : Hotel A = 2, Hotel B = 2 (super_admin voit tout)
commit;


-- ============================================================================
-- ÉTAPE 3 — NETTOYAGE
-- ============================================================================
\echo ''
\echo '=============================================================================='
\echo 'NETTOYAGE — suppression des données de test'
\echo '=============================================================================='

-- Supprimer les profils de test (postgres bypass RLS)
delete from public.profiles where full_name like '%(test)%';

-- Supprimer les rooms de test
delete from public.rooms where room_number like 'TEST-RLS-%';

-- Supprimer les room_types de test
delete from public.room_types where name like 'TEST-RLS-%';

-- Supprimer les establishments de test
delete from public.establishments where name like 'TEST-RLS-%';

-- Supprimer le lead de test
delete from public.leads where email = 'prospect@test.ci';

select 'Nettoyage terminé ✅' as status;
select count(*) as remaining_test_data
from (
    select 1 from public.establishments where name like 'TEST-RLS-%'
    union all
    select 1 from public.rooms where room_number like 'TEST-RLS-%'
    union all
    select 1 from public.profiles where full_name like '%(test)%'
    union all
    select 1 from public.leads where email = 'prospect@test.ci'
) as x;
-- ✅ Attendu : 0 (toutes les données de test sont supprimées)


\echo ''
\echo '=============================================================================='
\echo 'FIN DU SCRIPT DE TEST RLS'
\echo '=============================================================================='
