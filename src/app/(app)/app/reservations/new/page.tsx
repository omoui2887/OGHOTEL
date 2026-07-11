import { redirect } from "next/navigation";

/**
 * Page redirigée vers la liste des réservations avec ouverture automatique
 * de la modale "Nouvelle Réservation" (wizard 3 étapes).
 *
 * L'ancien formulaire multi-sections a été remplacé par le wizard modal
 * inspiré du modèle OGHOTEL (cf. ReservationWizardDialog).
 */
export default function NewReservationPage() {
  redirect("/app/reservations?new=1");
}
