-- ============================================================================
-- OGHOTEL — Migration 001 : Schéma SQL initial
-- SaaS multi-tenant de gestion hôtelière — Côte d'Ivoire
-- ============================================================================
-- Ce fichier crée les 16 tables métier du PRD §13.
-- Les politiques RLS seront ajoutées dans 003_rls_policies.sql (étape suivante).
--
-- Compatible : PostgreSQL 15+ (Supabase)
-- Convention : UUID PK, timestamptz, integer pour montants FCFA (pas de décimales)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Extensions
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";    -- gen_random_uuid()
create extension if not exists "uuid-ossp";   -- uuid_generate_v4() (compat)

-- ----------------------------------------------------------------------------
-- 1. PROFILES  (PRD §13.1)
-- ----------------------------------------------------------------------------
-- Profil utilisateur lié à auth.users (Supabase Auth).
-- La FK establishment_id est ajoutée APRÈS la création de establishments.
create table if not exists public.profiles (
    id                    uuid primary key references auth.users(id) on delete cascade,
    full_name             text,
    phone                 text,
    role                  text not null default 'receptionist'
        check (role in ('super_admin','hotel_admin','manager','receptionist','accountant','housekeeping','maintenance')),
    establishment_id      uuid,
    must_change_password  boolean not null default false,
    is_active             boolean not null default true,
    created_at            timestamptz not null default now(),
    updated_at            timestamptz not null default now()
);

comment on table  public.profiles is 'Profils utilisateurs liés à Supabase Auth (PRD §13.1)';
comment on column public.profiles.role is 'super_admin | hotel_admin | manager | receptionist | accountant | housekeeping | maintenance';
comment on column public.profiles.establishment_id is 'Null pour super_admin ; sinon rattaché à un établissement';

-- ----------------------------------------------------------------------------
-- 2. PLANS  (PRD §13.2)
-- ----------------------------------------------------------------------------
create table if not exists public.plans (
    id                  uuid primary key default gen_random_uuid(),
    name                text not null unique
        check (name in ('ESSENTIEL','PRIVILEGE','PREMIUM')),
    price_fcfa          integer not null check (price_fcfa >= 0),
    duration_days       integer not null default 365 check (duration_days > 0),
    max_users           integer,   -- null = illimité
    max_establishments  integer,   -- null = illimité
    features            jsonb not null default '{}'::jsonb,
    description         text,
    is_active           boolean not null default true,
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

comment on table public.plans is 'Formules d abonnement annuel (PRD §9 / §13.2)';
comment on column public.plans.features is 'JSON : drapeaux de fonctionnalités par formule (feature gating)';

-- ----------------------------------------------------------------------------
-- 3. LEADS  (PRD §13.3) — prospects venant de la landing page
-- ----------------------------------------------------------------------------
create table if not exists public.leads (
    id                uuid primary key default gen_random_uuid(),
    full_name         text not null,
    business_name     text not null,
    business_type     text not null
        check (business_type in ('hotel','residence','auberge','other')),
    city              text,
    rooms_count       integer check (rooms_count is null or rooms_count >= 0),
    phone             text not null,
    email             text,
    desired_plan_id   uuid references public.plans(id) on delete set null,
    message           text,
    status            text not null default 'new'
        check (status in ('new','contacted','negotiating','won','lost')),
    internal_notes    text,
    created_at        timestamptz not null default now(),
    updated_at        timestamptz not null default now()
);

comment on table public.leads is 'Prospects (demandes landing page) — PRD §13.3';

-- ----------------------------------------------------------------------------
-- 4. ESTABLISHMENTS  (PRD §13.4)
-- ----------------------------------------------------------------------------
create table if not exists public.establishments (
    id                  uuid primary key default gen_random_uuid(),
    name                text not null,
    type                text not null
        check (type in ('hotel','residence','auberge','other')),
    owner_name          text,
    email               text,
    phone               text,
    city                text,
    address             text,
    logo_url            text,
    plan_id             uuid references public.plans(id) on delete set null,
    subscription_status text not null default 'active'
        check (subscription_status in ('active','expiring','expired','suspended','trial')),
    subscription_start  date,
    subscription_end    date,
    timezone            text not null default 'Africa/Abidjan',
    currency            text not null default 'XOF',   -- FCFA (ISO 4217)
    created_at          timestamptz not null default now(),
    updated_at          timestamptz not null default now()
);

comment on table public.establishments is 'Établissements clients (hôtels, résidences, auberges) — PRD §13.4';

-- Maintenant on peut ajouter la FK profiles.establishment_id → establishments.id
alter table public.profiles
    add constraint fk_profiles_establishment
    foreign key (establishment_id) references public.establishments(id) on delete set null;

-- ----------------------------------------------------------------------------
-- 5. SUBSCRIPTION_PAYMENTS  (PRD §13.6) — paiements SaaS
-- ----------------------------------------------------------------------------
create table if not exists public.subscription_payments (
    id                    uuid primary key default gen_random_uuid(),
    lead_id               uuid references public.leads(id) on delete set null,
    establishment_id      uuid references public.establishments(id) on delete set null,
    plan_id               uuid not null references public.plans(id) on delete restrict,
    amount_fcfa           integer not null check (amount_fcfa >= 0),
    payment_method        text not null
        check (payment_method in ('orange','mtn','moov','wave','cash','card','transfer')),
    transaction_reference text,
    status                text not null default 'pending'
        check (status in ('pending','validated','rejected','refunded')),
    paid_at               timestamptz,
    validated_by          uuid references public.profiles(id) on delete set null,
    note                  text,
    created_at            timestamptz not null default now(),
    updated_at            timestamptz not null default now()
);

comment on table public.subscription_payments is 'Paiements SaaS (abonnements annuels) — PRD §13.6';

-- ----------------------------------------------------------------------------
-- 6. ACTIVATION_CODES  (PRD §13.5)
-- ----------------------------------------------------------------------------
create table if not exists public.activation_codes (
    id               uuid primary key default gen_random_uuid(),
    code             text not null unique,
    lead_id          uuid references public.leads(id) on delete set null,
    establishment_id uuid references public.establishments(id) on delete set null,
    plan_id          uuid not null references public.plans(id) on delete restrict,
    payment_id       uuid references public.subscription_payments(id) on delete set null,
    amount_fcfa      integer not null check (amount_fcfa >= 0),
    status           text not null default 'generated'
        check (status in ('generated','sent','used','expired','cancelled')),
    expires_at       timestamptz not null,
    used_at          timestamptz,
    created_by       uuid not null references public.profiles(id) on delete restrict,
    created_at       timestamptz not null default now()
);

comment on table public.activation_codes is 'Codes d activation uniques, à usage unique — PRD §13.5';

-- ----------------------------------------------------------------------------
-- 7. ROOM_TYPES  (PRD §13.7)
-- ----------------------------------------------------------------------------
create table if not exists public.room_types (
    id               uuid primary key default gen_random_uuid(),
    establishment_id uuid not null references public.establishments(id) on delete cascade,
    name             text not null,
    default_price    integer not null check (default_price >= 0),
    capacity         integer not null default 1 check (capacity > 0),
    description      text,
    photos           jsonb not null default '[]'::jsonb,
    is_active        boolean not null default true,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

comment on table public.room_types is 'Types de chambres par établissement — PRD §13.7';

-- ----------------------------------------------------------------------------
-- 8. ROOMS  (PRD §13.8)
-- ----------------------------------------------------------------------------
create table if not exists public.rooms (
    id               uuid primary key default gen_random_uuid(),
    establishment_id uuid not null references public.establishments(id) on delete cascade,
    room_type_id     uuid not null references public.room_types(id) on delete restrict,
    room_number      text not null,
    floor            text,
    capacity         integer not null default 1 check (capacity > 0),
    price_per_night  integer not null check (price_per_night >= 0),
    half_day_price   integer check (half_day_price is null or half_day_price >= 0),
    status           text not null default 'available'
        check (status in ('available','reserved','occupied','cleaning','maintenance','inactive')),
    amenities        jsonb not null default '[]'::jsonb,
    photos           jsonb not null default '[]'::jsonb,
    notes            text,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

comment on table public.rooms is 'Chambres des établissements — PRD §13.8';

-- Une chambre est unique par établissement + numéro (anti-doublon)
create unique index if not exists uq_rooms_establishment_number
    on public.rooms(establishment_id, room_number);

-- ----------------------------------------------------------------------------
-- 9. GUESTS  (PRD §13.9) — clients hébergés (CRM basique)
-- ----------------------------------------------------------------------------
create table if not exists public.guests (
    id               uuid primary key default gen_random_uuid(),
    establishment_id uuid not null references public.establishments(id) on delete cascade,
    full_name        text not null,
    phone            text,
    email            text,
    nationality      text,
    id_type          text
        check (id_type is null or id_type in ('cni','passport','permit','other')),
    id_number        text,
    address          text,
    notes            text,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

comment on table public.guests is 'Clients hébergés (CRM basique) — PRD §13.9';

-- ----------------------------------------------------------------------------
-- 10. RESERVATIONS  (PRD §13.10)
-- ----------------------------------------------------------------------------
create table if not exists public.reservations (
    id               uuid primary key default gen_random_uuid(),
    establishment_id uuid not null references public.establishments(id) on delete cascade,
    guest_id         uuid not null references public.guests(id) on delete restrict,
    room_id          uuid not null references public.rooms(id) on delete restrict,
    check_in_date    date not null,
    check_out_date   date not null,
    nights           integer not null check (nights > 0),
    adults           integer not null default 1 check (adults >= 0),
    children         integer not null default 0 check (children >= 0),
    rate_amount      integer not null check (rate_amount >= 0),
    discount_amount  integer not null default 0 check (discount_amount >= 0),
    total_amount     integer not null check (total_amount >= 0),
    paid_amount      integer not null default 0 check (paid_amount >= 0),
    balance_amount   integer not null default 0 check (balance_amount >= 0),
    status           text not null default 'pending'
        check (status in ('pending','confirmed','checked_in','checked_out','cancelled','no_show')),
    source           text not null default 'direct'
        check (source in ('direct','phone','whatsapp','agency','other')),
    notes            text,
    created_by       uuid references public.profiles(id) on delete set null,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

-- Contrainte métier : la date de départ doit être postérieure à l'arrivée.
alter table public.reservations
    add constraint chk_reservations_dates
    check (check_out_date > check_in_date);

comment on table public.reservations is 'Réservations de chambres — PRD §13.10';

-- ----------------------------------------------------------------------------
-- 11. STAY_PAYMENTS  (PRD §13.11)
-- ----------------------------------------------------------------------------
create table if not exists public.stay_payments (
    id               uuid primary key default gen_random_uuid(),
    establishment_id uuid not null references public.establishments(id) on delete cascade,
    reservation_id   uuid not null references public.reservations(id) on delete cascade,
    amount           integer not null check (amount >= 0),
    method           text not null
        check (method in ('cash','orange','mtn','moov','wave','card','transfer')),
    reference        text,
    payment_date     timestamptz not null default now(),
    received_by      uuid references public.profiles(id) on delete set null,
    notes            text,
    created_at       timestamptz not null default now()
);

comment on table public.stay_payments is 'Paiements de séjours (liés à une réservation) — PRD §13.11';

-- ----------------------------------------------------------------------------
-- 12. INVOICES  (PRD §13.12)
-- ----------------------------------------------------------------------------
create table if not exists public.invoices (
    id               uuid primary key default gen_random_uuid(),
    establishment_id uuid not null references public.establishments(id) on delete cascade,
    reservation_id   uuid references public.reservations(id) on delete set null,
    guest_id         uuid references public.guests(id) on delete set null,
    invoice_number   text not null,
    type             text not null
        check (type in ('invoice','receipt')),
    amount           integer not null check (amount >= 0),
    status           text not null default 'draft'
        check (status in ('draft','issued','paid','cancelled')),
    pdf_url          text,
    issued_at        timestamptz,
    created_by       uuid references public.profiles(id) on delete set null,
    created_at       timestamptz not null default now()
);

-- Numéro de facture unique par établissement
create unique index if not exists uq_invoices_establishment_number
    on public.invoices(establishment_id, invoice_number);

comment on table public.invoices is 'Factures et reçus — PRD §13.12';

-- ----------------------------------------------------------------------------
-- 13. EXPENSES  (PRD §13.13)
-- ----------------------------------------------------------------------------
create table if not exists public.expenses (
    id               uuid primary key default gen_random_uuid(),
    establishment_id uuid not null references public.establishments(id) on delete cascade,
    category         text not null
        check (category in ('salaire','electricite','eau','internet','maintenance','fournitures','carburant','nettoyage','autre')),
    amount           integer not null check (amount >= 0),
    expense_date     date not null,
    payment_method   text
        check (payment_method is null or payment_method in ('cash','orange','mtn','moov','wave','card','transfer')),
    description      text,
    attachment_url   text,
    created_by       uuid references public.profiles(id) on delete set null,
    created_at       timestamptz not null default now()
);

comment on table public.expenses is 'Dépenses des établissements — PRD §13.13';

-- ----------------------------------------------------------------------------
-- 14. HOUSEKEEPING_TASKS  (PRD §13.14)
-- ----------------------------------------------------------------------------
create table if not exists public.housekeeping_tasks (
    id               uuid primary key default gen_random_uuid(),
    establishment_id uuid not null references public.establishments(id) on delete cascade,
    room_id          uuid not null references public.rooms(id) on delete cascade,
    assigned_to      uuid references public.profiles(id) on delete set null,
    status           text not null default 'dirty'
        check (status in ('dirty','in_progress','clean','inspected')),
    notes            text,
    created_at       timestamptz not null default now(),
    completed_at     timestamptz
);

comment on table public.housekeeping_tasks is 'Tâches de ménage par chambre — PRD §13.14';

-- ----------------------------------------------------------------------------
-- 15. MAINTENANCE_TICKETS  (PRD §13.15)
-- ----------------------------------------------------------------------------
create table if not exists public.maintenance_tickets (
    id               uuid primary key default gen_random_uuid(),
    establishment_id uuid not null references public.establishments(id) on delete cascade,
    room_id          uuid references public.rooms(id) on delete set null,
    title            text not null,
    description      text,
    priority         text not null default 'normal'
        check (priority in ('low','normal','urgent')),
    status           text not null default 'open'
        check (status in ('open','in_progress','resolved')),
    cost             integer not null default 0 check (cost >= 0),
    assigned_to      uuid references public.profiles(id) on delete set null,
    created_by       uuid not null references public.profiles(id) on delete restrict,
    resolved_at      timestamptz,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

comment on table public.maintenance_tickets is 'Tickets de maintenance — PRD §13.15';

-- ----------------------------------------------------------------------------
-- 16. ACTIVITY_LOGS  (PRD §13.16)
-- ----------------------------------------------------------------------------
create table if not exists public.activity_logs (
    id               uuid primary key default gen_random_uuid(),
    establishment_id uuid references public.establishments(id) on delete cascade,
    user_id          uuid not null references public.profiles(id) on delete cascade,
    action           text not null,
    entity_type      text,
    entity_id        uuid,
    metadata         jsonb not null default '{}'::jsonb,
    created_at       timestamptz not null default now()
);

comment on table public.activity_logs is 'Journal d activité (audit) — PRD §13.16';

-- ============================================================================
-- INDEX (performance)
-- ============================================================================
create index if not exists idx_profiles_role                on public.profiles(role);
create index if not exists idx_profiles_establishment       on public.profiles(establishment_id);
create index if not exists idx_leads_status                 on public.leads(status);
create index if not exists idx_leads_desired_plan           on public.leads(desired_plan_id);
create index if not exists idx_leads_created_at             on public.leads(created_at desc);
create index if not exists idx_establishments_plan          on public.establishments(plan_id);
create index if not exists idx_establishments_sub_status    on public.establishments(subscription_status);
create index if not exists idx_subscription_payments_lead   on public.subscription_payments(lead_id);
create index if not exists idx_subscription_payments_est    on public.subscription_payments(establishment_id);
create index if not exists idx_subscription_payments_status on public.subscription_payments(status);
create index if not exists idx_activation_codes_code        on public.activation_codes(code);
create index if not exists idx_activation_codes_lead        on public.activation_codes(lead_id);
create index if not exists idx_activation_codes_status      on public.activation_codes(status);
create index if not exists idx_room_types_establishment     on public.room_types(establishment_id);
create index if not exists idx_rooms_establishment          on public.rooms(establishment_id);
create index if not exists idx_rooms_room_type              on public.rooms(room_type_id);
create index if not exists idx_rooms_status                 on public.rooms(status);
create index if not exists idx_guests_establishment         on public.guests(establishment_id);
create index if not exists idx_guests_phone                 on public.guests(phone);
create index if not exists idx_reservations_establishment   on public.reservations(establishment_id);
create index if not exists idx_reservations_guest           on public.reservations(guest_id);
create index if not exists idx_reservations_room            on public.reservations(room_id);
create index if not exists idx_reservations_status          on public.reservations(status);
create index if not exists idx_reservations_check_in        on public.reservations(check_in_date);
create index if not exists idx_reservations_check_out       on public.reservations(check_out_date);
create index if not exists idx_stay_payments_reservation    on public.stay_payments(reservation_id);
create index if not exists idx_stay_payments_establishment  on public.stay_payments(establishment_id);
create index if not exists idx_invoices_establishment       on public.invoices(establishment_id);
create index if not exists idx_invoices_reservation         on public.invoices(reservation_id);
create index if not exists idx_expenses_establishment       on public.expenses(establishment_id);
create index if not exists idx_expenses_category            on public.expenses(category);
create index if not exists idx_expenses_date                on public.expenses(expense_date);
create index if not exists idx_housekeeping_establishment   on public.housekeeping_tasks(establishment_id);
create index if not exists idx_housekeeping_room            on public.housekeeping_tasks(room_id);
create index if not exists idx_housekeeping_status          on public.housekeeping_tasks(status);
create index if not exists idx_maintenance_establishment    on public.maintenance_tickets(establishment_id);
create index if not exists idx_maintenance_room             on public.maintenance_tickets(room_id);
create index if not exists idx_maintenance_status           on public.maintenance_tickets(status);
create index if not exists idx_activity_logs_establishment  on public.activity_logs(establishment_id);
create index if not exists idx_activity_logs_user           on public.activity_logs(user_id);
create index if not exists idx_activity_logs_created_at     on public.activity_logs(created_at desc);

-- ============================================================================
-- TRIGGER : updated_at automatique
-- ============================================================================
-- Met à jour updated_at sur chaque UPDATE des tables concernées.
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

do $$
declare
    t text;
    tables_with_updated_at text[] := array[
        'profiles','plans','leads','establishments','subscription_payments',
        'room_types','rooms','guests','reservations','maintenance_tickets'
    ];
begin
    foreach t in array tables_with_updated_at loop
        execute format(
            'drop trigger if exists set_updated_at on public.%I;
             create trigger set_updated_at before update on public.%I
             for each row execute function public.handle_updated_at();',
            t, t
        );
    end loop;
end $$;

-- ============================================================================
-- FIN — Schéma OGHOTEL prêt.
-- ============================================================================
