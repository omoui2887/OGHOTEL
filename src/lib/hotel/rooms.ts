/**
 * Types et constantes pour les chambres.
 * Safe côté client.
 */

export type RoomStatus =
  | "available"
  | "reserved"
  | "occupied"
  | "cleaning"
  | "maintenance"
  | "inactive";

export type Room = {
  id: string;
  establishment_id: string;
  room_type_id: string;
  room_type_name: string | null;
  room_number: string;
  floor: string | null;
  capacity: number;
  price_per_night: number;
  half_day_price: number | null;
  status: RoomStatus;
  amenities: string[];
  photos: string[];
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export const ROOM_STATUS_LABELS: Record<
  RoomStatus,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" }
> = {
  available: { label: "Disponible", variant: "success" },
  reserved: { label: "Réservée", variant: "warning" },
  occupied: { label: "Occupée", variant: "default" },
  cleaning: { label: "Nettoyage", variant: "secondary" },
  maintenance: { label: "Maintenance", variant: "destructive" },
  inactive: { label: "Inactive", variant: "outline" },
};

export const ROOM_STATUS_OPTIONS: { value: RoomStatus; label: string }[] = [
  { value: "available", label: "Disponible" },
  { value: "reserved", label: "Réservée" },
  { value: "occupied", label: "Occupée" },
  { value: "cleaning", label: "Nettoyage" },
  { value: "maintenance", label: "Maintenance" },
  { value: "inactive", label: "Inactive" },
];

export const COMMON_AMENITIES = [
  "Climatisation",
  "TV",
  "Wi-Fi",
  "Cuisine",
  "Douche",
  "Baignoire",
  "Mini-bar",
  "Coffre-fort",
  "Balcon",
  "Vue",
  "Parking",
  "Petit-déjeuner",
] as const;
