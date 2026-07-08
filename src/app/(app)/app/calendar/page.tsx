import { getCurrentProfile } from "@/lib/auth";
import {
  getCalendarData,
  getTodayArrivalsDepartures,
  getRoomTypesForCalendar,
} from "@/lib/hotel/calendar-server";
import { CalendarView } from "@/components/hotel/calendar-view";

export const metadata = {
  title: "Calendrier",
};

type SearchParams = Promise<{
  date?: string;
}>;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const today = new Date().toISOString().split("T")[0];
  const dateStr = sp.date ?? today;

  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Calendrier</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  // Calculer la plage de dates (mois courant + marge pour la vue mois)
  const date = new Date(dateStr + "T00:00:00.000Z");
  const firstOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
  const lastOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);

  const startDate = new Date(firstOfMonth);
  startDate.setDate(startDate.getDate() - 7);
  const endDate = new Date(lastOfMonth);
  endDate.setDate(endDate.getDate() + 7);

  const [calendarData, todayData, roomTypes] = await Promise.all([
    getCalendarData(
      profile.establishment_id,
      startDate.toISOString().split("T")[0],
      endDate.toISOString().split("T")[0]
    ),
    getTodayArrivalsDepartures(profile.establishment_id),
    getRoomTypesForCalendar(profile.establishment_id),
  ]);

  const canEdit = ["hotel_admin", "manager", "receptionist"].includes(
    profile.role
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Calendrier
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Visualisez la disponibilité de vos chambres. Cliquez sur une
          réservation pour voir le détail.
        </p>
      </div>

      <CalendarView
        rooms={calendarData.rooms}
        reservations={calendarData.reservations}
        arrivals={todayData.arrivals}
        departures={todayData.departures}
        roomTypes={roomTypes}
        initialDate={dateStr}
        canEdit={canEdit}
      />
    </div>
  );
}
