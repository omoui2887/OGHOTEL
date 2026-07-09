-- Migration 006 : Contraintes d'unicité pour éviter les races conditions
--
-- 1. Une seule facture ACTIVE (issued/paid) par réservation + type
--    Empêche la génération de doublons si 2 requêtes concurrentes
--    passent le check applicatif (TOCTOU).
-- 2. Exclusion constraint sur les réservations pour empêcher le
--    double-booking au niveau base de données (rattrape la race TOCTOU
--    entre checkRoomAvailability et INSERT).
--
-- ⚠️ PostgreSQL ne supporte pas `ALTER TABLE ... ADD CONSTRAINT ... UNIQUE ... WHERE`
--    (partial unique constraint). Il faut utiliser `CREATE UNIQUE INDEX ... WHERE`.

-- 1. Facture active unique par (réservation, type)
--    Permet plusieurs factures annulées, mais une seule active.
--    Utilise un INDEX partiel (pas une contrainte) car les contraintes UNIQUE
--    partielles ne sont pas supportées en syntaxe ALTER TABLE.
do $$
begin
  if not exists (
    select 1 from pg_indexes where indexname = 'uq_invoices_active_per_reservation_type'
  ) then
    create unique index uq_invoices_active_per_reservation_type
      on public.invoices (reservation_id, type)
      where (status in ('issued', 'paid'));
  end if;
end $$;

-- 2. Anti double-booking : pas de chevauchement de dates pour une même chambre
--    sur des réservations "bloquantes" (pending, confirmed, checked_in).
--    Nécessite l'extension btree_gist pour daterange + uuid.
--    On crée l'extension si elle n'existe pas (idempotent).
create extension if not exists btree_gist;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'no_overlap_reservations'
  ) then
    alter table public.reservations
      add constraint no_overlap_reservations
      exclude using gist (
        room_id with =,
        daterange(check_in_date, check_out_date, '[)') with &&
      )
      where (status in ('pending', 'confirmed', 'checked_in'));
  end if;
end $$;
