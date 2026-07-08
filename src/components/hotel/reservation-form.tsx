"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, X, Search, UserPlus, AlertCircle, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GuestFormDialog } from "@/components/hotel/guest-form-dialog";
import {
  RESERVATION_SOURCE_OPTIONS,
  calculateNights,
  type Reservation,
} from "@/lib/hotel/reservations";
import type { Room } from "@/lib/hotel/rooms";
import type { Guest } from "@/lib/hotel/guests";
import { formatFCFA } from "@/lib/utils";

const schema = z.object({
  guest_id: z.string().uuid("Veuillez sélectionner un client"),
  room_id: z.string().uuid("Veuillez sélectionner une chambre"),
  check_in_date: z.string().min(1, "Date d'arrivée requise"),
  check_out_date: z.string().min(1, "Date de départ requise"),
  adults: z.coerce.number().int().min(1, "Au moins 1 adulte").max(50),
  children: z.coerce.number().int().min(0).max(50),
  rate_amount: z.coerce
    .number({ error: "Tarif invalide" })
    .int("Tarif entier")
    .min(0, "Tarif négatif impossible")
    .max(10000000),
  discount_amount: z.coerce.number().int().min(0).max(10000000).optional().or(z.literal("")),
  paid_amount: z.coerce.number().int().min(0).max(10000000).optional().or(z.literal("")),
  source: z.enum(["direct", "phone", "whatsapp", "agency", "other"]),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

type Props = {
  rooms: Room[];
  guests: Guest[];
  reservation?: Reservation | null;
};

export function ReservationForm({ rooms, guests, reservation }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [guestSearch, setGuestSearch] = React.useState("");
  const [selectedGuestId, setSelectedGuestId] = React.useState(
    reservation?.guest_id ?? ""
  );
  const [showGuestForm, setShowGuestForm] = React.useState(false);
  const [roomId, setRoomId] = React.useState(reservation?.room_id ?? "");
  const [source, setSource] = React.useState(
    reservation?.source ?? "direct"
  );
  const [availability, setAvailability] = React.useState<{
    checking: boolean;
    available: boolean | null;
    conflicts: { id: string; guest_name: string; check_in: string; check_out: string }[];
  }>({ checking: false, available: null, conflicts: [] });
  const [guestsList, setGuestsList] = React.useState(guests);

  const isEdit = !!reservation;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      guest_id: reservation?.guest_id ?? "",
      room_id: reservation?.room_id ?? "",
      check_in_date: reservation?.check_in_date ?? "",
      check_out_date: reservation?.check_out_date ?? "",
      adults: reservation?.adults ?? 1,
      children: reservation?.children ?? 0,
      rate_amount: reservation?.rate_amount ?? 0,
      discount_amount: reservation?.discount_amount ?? 0,
      paid_amount: reservation?.paid_amount ?? 0,
      source: (reservation?.source ?? "direct") as Values["source"],
      notes: reservation?.notes ?? "",
    },
  });

  const checkIn = watch("check_in_date");
  const checkOut = watch("check_out_date");
  const rateAmount = watch("rate_amount") ?? 0;
  const discountAmount = watch("discount_amount") ?? 0;
  const paidAmount = watch("paid_amount") ?? 0;

  // Calculs automatiques
  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const totalAmount = nights > 0 ? rateAmount * nights - (discountAmount || 0) : 0;
  const balanceAmount = totalAmount - (paidAmount || 0);

  // Auto-remplir le tarif quand on sélectionne une chambre
  React.useEffect(() => {
    if (roomId && !isEdit) {
      const room = rooms.find((r) => r.id === roomId);
      if (room) {
        setValue("rate_amount", room.price_per_night);
      }
    }
  }, [roomId, rooms, setValue, isEdit]);

  // Vérifier la disponibilité quand chambre + dates changent
  React.useEffect(() => {
    if (!roomId || !checkIn || !checkOut || nights <= 0) {
      setAvailability({ checking: false, available: null, conflicts: [] });
      return;
    }

    let cancelled = false;
    setAvailability({ checking: true, available: null, conflicts: [] });

    const checkAvailability = async () => {
      try {
        const res = await fetch("/api/hotel/reservations/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            room_id: roomId,
            check_in_date: checkIn,
            check_out_date: checkOut,
            exclude_reservation_id: reservation?.id,
          }),
        });

        const data = await res.json();

        if (!cancelled) {
          setAvailability({
            checking: false,
            available: data.available ?? false,
            conflicts: data.conflicts ?? [],
          });
        }
      } catch {
        if (!cancelled) {
          setAvailability({
            checking: false,
            available: null,
            conflicts: [],
          });
        }
      }
    };

    const t = setTimeout(checkAvailability, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [roomId, checkIn, checkOut, nights, reservation?.id]);

  const filteredGuests = guestSearch
    ? guestsList.filter(
        (g) =>
          g.full_name.toLowerCase().includes(guestSearch.toLowerCase()) ||
          g.phone.includes(guestSearch)
      )
    : guestsList.slice(0, 5); // Afficher les 5 premiers par défaut

  const selectedRoom = rooms.find((r) => r.id === roomId);

  const onSubmit = async (values: Values) => {
    // Vérifier la disponibilité avant soumission
    if (!isEdit && availability.available === false) {
      toast.error("Cette chambre n'est pas disponible pour ces dates");
      return;
    }

    setIsLoading(true);
    try {
      const body = {
        ...values,
        discount_amount: Number(values.discount_amount) || 0,
        paid_amount: Number(values.paid_amount) || 0,
      };

      const url = reservation
        ? `/api/hotel/reservations/${reservation.id}`
        : "/api/hotel/reservations";
      const method = reservation ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }

      toast.success(reservation ? "Réservation modifiée" : "Réservation créée");
      router.push("/app/reservations");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Client */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Client</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowGuestForm(true)}
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Nouveau client
              </Button>
            </div>

            {selectedGuestId ? (
              <div className="flex items-center justify-between rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">
                    {guestsList.find((g) => g.id === selectedGuestId)?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {guestsList.find((g) => g.id === selectedGuestId)?.phone}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedGuestId("");
                    setValue("guest_id", "");
                  }}
                >
                  Changer
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un client (nom ou téléphone)..."
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                {filteredGuests.length > 0 && (
                  <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-border p-1">
                    {filteredGuests.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => {
                          setSelectedGuestId(g.id);
                          setValue("guest_id", g.id, { shouldValidate: true });
                          setGuestSearch("");
                        }}
                        className="flex w-full items-center justify-between rounded px-3 py-2 text-left text-sm transition-colors hover:bg-muted"
                      >
                        <div>
                          <p className="font-medium">{g.full_name}</p>
                          <p className="text-xs text-muted-foreground">{g.phone}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {errors.guest_id && (
                  <p className="text-xs text-destructive">{errors.guest_id.message}</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section Chambre + Dates */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold">Chambre & Dates</h3>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Chambre */}
              <div className="space-y-2">
                <Label>
                  Chambre <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={roomId}
                  onValueChange={(v) => {
                    setRoomId(v);
                    setValue("room_id", v, { shouldValidate: true });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rooms
                      .filter((r) => r.status !== "inactive")
                      .map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.room_number} — {r.room_type_name ?? "—"} —{" "}
                          {formatFCFA(r.price_per_night)}/nuit
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.room_id && (
                  <p className="text-xs text-destructive">{errors.room_id.message}</p>
                )}
              </div>

              {/* Source */}
              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={source}
                  onValueChange={(v) => {
                    setSource(v as Values["source"]);
                    setValue("source", v as Values["source"]);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RESERVATION_SOURCE_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Arrivée */}
              <div className="space-y-2">
                <Label htmlFor="check_in_date">
                  Arrivée <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="check_in_date"
                  type="date"
                  {...register("check_in_date")}
                />
                {errors.check_in_date && (
                  <p className="text-xs text-destructive">{errors.check_in_date.message}</p>
                )}
              </div>

              {/* Départ */}
              <div className="space-y-2">
                <Label htmlFor="check_out_date">
                  Départ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="check_out_date"
                  type="date"
                  {...register("check_out_date")}
                />
                {errors.check_out_date && (
                  <p className="text-xs text-destructive">{errors.check_out_date.message}</p>
                )}
              </div>
            </div>

            {/* Indicateur disponibilité */}
            {roomId && checkIn && checkOut && nights > 0 && (
              <div className="rounded-lg border border-border p-3">
                {availability.checking ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Vérification de la disponibilité...
                  </p>
                ) : availability.available === true ? (
                  <p className="flex items-center gap-2 text-sm text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" />
                    Chambre disponible pour {nights} nuit{nights > 1 ? "s" : ""}
                  </p>
                ) : availability.available === false ? (
                  <div className="text-sm text-destructive">
                    <p className="flex items-center gap-2 font-medium">
                      <AlertCircle className="h-4 w-4" />
                      Chambre non disponible
                    </p>
                    <p className="mt-1 text-xs">
                      Conflit avec :{" "}
                      {availability.conflicts
                        .map((c) => `${c.guest_name} (${c.check_in} → ${c.check_out})`)
                        .join(", ")}
                    </p>
                  </div>
                ) : null}
              </div>
            )}

            {nights <= 0 && checkIn && checkOut && (
              <p className="text-xs text-destructive">
                La date de départ doit être après la date d'arrivée
              </p>
            )}
          </CardContent>
        </Card>

        {/* Section Tarifs */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold">Tarifs & Paiement</h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rate_amount">
                  Tarif/nuit (FCFA) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rate_amount"
                  type="number"
                  min={0}
                  step={1000}
                  {...register("rate_amount")}
                />
                {errors.rate_amount && (
                  <p className="text-xs text-destructive">{errors.rate_amount.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="adults">Adultes</Label>
                <Input
                  id="adults"
                  type="number"
                  min={1}
                  max={50}
                  {...register("adults")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="children">Enfants</Label>
                <Input
                  id="children"
                  type="number"
                  min={0}
                  max={50}
                  {...register("children")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="discount_amount">Remise (FCFA)</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  min={0}
                  step={1000}
                  {...register("discount_amount")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paid_amount">Acompte payé (FCFA)</Label>
                <Input
                  id="paid_amount"
                  type="number"
                  min={0}
                  step={1000}
                  {...register("paid_amount")}
                />
              </div>
            </div>

            {/* Récapitulatif */}
            {nights > 0 && (
              <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4">
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nuits</p>
                    <p className="font-bold text-lg">{nights}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="font-bold text-lg text-primary">{formatFCFA(totalAmount)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Acompte</p>
                    <p className="font-bold text-lg">{formatFCFA(paidAmount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Solde</p>
                    <p className={`font-bold text-lg ${balanceAmount > 0 ? "text-destructive" : "text-emerald-600"}`}>
                      {formatFCFA(balanceAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes">Notes (optionnel)</Label>
          <Textarea
            id="notes"
            rows={2}
            placeholder="Informations sur la réservation..."
            {...register("notes")}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={
              isLoading ||
              (!isEdit && availability.available === false) ||
              availability.checking
            }
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {isEdit ? "Enregistrer" : "Créer la réservation"}
          </Button>
        </div>
      </form>

      {/* Dialog création rapide client */}
      <GuestFormDialog
        open={showGuestForm}
        onOpenChange={setShowGuestForm}
        guest={null}
      />
    </div>
  );
}
