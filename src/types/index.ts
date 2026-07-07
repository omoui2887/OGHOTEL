/**
 * Types globaux partagés de l'application OGHOTEL.
 *
 * Ces types sont volontairement génériques pour l'instant.
 * Ils seront complétés au fur et à mesure des modules (Database Supabase,
 * modèles Prisma, DTOs API, etc.).
 */

/** Rôles utilisateurs — PRD §5. */
export type UserRole =
  | "super_admin"
  | "hotel_admin"
  | "manager"
  | "receptionist"
  | "accountant"
  | "housekeeping"
  | "maintenance";

/** Statuts possibles d'un prospect — PRD §8.2.3. */
export type LeadStatus =
  | "new"
  | "contacted"
  | "negotiating"
  | "won"
  | "lost";

/** Statuts d'un établissement / abonnement — PRD §13.4. */
export type SubscriptionStatus =
  | "active"
  | "expiring"
  | "expired"
  | "suspended"
  | "trial";

/** Statuts d'un code d'activation — PRD §8.2.6. */
export type ActivationCodeStatus =
  | "generated"
  | "sent"
  | "used"
  | "expired"
  | "cancelled";

/** Statuts d'un paiement SaaS — PRD §8.2.5. */
export type SubscriptionPaymentStatus =
  | "pending"
  | "validated"
  | "rejected"
  | "refunded";

/** Statuts d'une chambre — PRD §8.4.3. */
export type RoomStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "cleaning"
  | "maintenance"
  | "inactive";

/** Statuts d'une réservation — PRD §8.4.5. */
export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled"
  | "no_show";

/** Source d'une réservation — PRD §8.4.5. */
export type ReservationSource =
  | "direct"
  | "phone"
  | "whatsapp"
  | "agency"
  | "other";

/** Moyens de paiement acceptés — PRD §8.2.5. */
export type PaymentMethod =
  | "orange"
  | "mtn"
  | "moov"
  | "wave"
  | "cash"
  | "card"
  | "transfer";

/** Types d'établissement — PRD §13.4. */
export type EstablishmentType =
  | "hotel"
  | "residence"
  | "auberge"
  | "other";
