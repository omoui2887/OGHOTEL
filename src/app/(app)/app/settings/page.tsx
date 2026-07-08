import { getCurrentProfile } from "@/lib/auth";
import { getEstablishmentSettings } from "@/lib/hotel/settings-server";
import { SettingsForm } from "@/components/hotel/settings-form";

export const metadata = {
  title: "Paramètres",
};

export default async function SettingsPage() {
  const profile = await getCurrentProfile();
  if (!profile || !profile.establishment_id) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-sm text-muted-foreground">Aucun établissement associé.</p>
      </div>
    );
  }

  const settings = await getEstablishmentSettings(profile.establishment_id);

  if (!settings) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Paramètres</h1>
        <p className="text-sm text-muted-foreground">
          Impossible de charger les paramètres.
        </p>
      </div>
    );
  }

  // hotel_admin et manager peuvent modifier
  const canEdit = profile.role === "hotel_admin" || profile.role === "manager";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          Paramètres
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Gérez les informations de votre établissement, les paramètres du séjour
          et consultez votre abonnement OGHOTEL.
        </p>
      </div>

      <SettingsForm settings={settings} canEdit={canEdit} />
    </div>
  );
}
