import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { getRooms } from "@/lib/hotel/rooms-server";
import { getGuests } from "@/lib/hotel/guests-server";
import { ReservationForm } from "@/components/hotel/reservation-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Nouvelle réservation",
};

export default async function NewReservationPage() {
  let profile = null;
  try {
    profile = await getCurrentProfile();
  } catch {
    // En cas d'erreur d'auth, on affiche un fallback
  }

  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/app/reservations" aria-label="Retour">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Nouvelle réservation</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun établissement associé à votre compte.
              Déconnectez-vous puis reconnectez-vous.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const canEdit = ["hotel_admin", "manager", "receptionist"].includes(profile.role);

  if (!canEdit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/app/reservations" aria-label="Retour">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Nouvelle réservation</h1>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-destructive">
              Vous n'avez pas la permission de créer des réservations.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch rooms et guests avec try-catch
  let rooms: any[] = [];
  let guests: any[] = [];

  try {
    const [roomsResult, guestsResult] = await Promise.all([
      getRooms(profile.establishment_id),
      getGuests(profile.establishment_id, { pageSize: 100 }),
    ]);
    rooms = roomsResult;
    guests = guestsResult.guests;
  } catch (err) {
    console.error("Erreur chargement données réservation:", err);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/app/reservations" aria-label="Retour">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Nouvelle réservation
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Créez une réservation. La disponibilité de la chambre est vérifiée
            automatiquement.
          </p>
        </div>
      </div>

      <ReservationForm rooms={rooms} guests={guests} />
    </div>
  );
}
