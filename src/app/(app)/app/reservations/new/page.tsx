import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentProfile } from "@/lib/auth";
import { getRooms } from "@/lib/hotel/rooms-server";
import { getGuests } from "@/lib/hotel/guests-server";
import { ReservationForm } from "@/components/hotel/reservation-form";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Nouvelle réservation",
};

export default async function NewReservationPage() {
  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Nouvelle réservation</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  const [rooms, guestsResult] = await Promise.all([
    getRooms(profile.establishment_id),
    getGuests(profile.establishment_id, { pageSize: 100 }),
  ]);

  const canEdit = ["hotel_admin", "manager", "receptionist"].includes(profile.role);

  if (!canEdit) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Nouvelle réservation</h1>
        <p className="text-sm text-destructive">
          Vous n'avez pas la permission de créer des réservations.
        </p>
      </div>
    );
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

      <ReservationForm rooms={rooms} guests={guestsResult.guests} />
    </div>
  );
}
