/**
 * Types et constantes pour les types de chambres.
 * Safe côté client.
 */

export type RoomType = {
  id: string;
  establishment_id: string;
  name: string;
  default_price: number;
  capacity: number;
  description: string | null;
  photos: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Stats
  rooms_count?: number;
};

export const COMMON_ROOM_TYPE_NAMES = [
  "Simple",
  "Double",
  "Suite",
  "Studio",
  "Appartement",
  "VIP",
  "Familiale",
  "Standard",
] as const;
