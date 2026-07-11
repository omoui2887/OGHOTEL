"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Save, X, Zap, Calendar, UserPlus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  RESERVATION_SOURCE_OPTIONS, calculateNights,
} from "@/lib/hotel/reservations";
import type { Room } from "@/lib/hotel/rooms";
import type { Guest } from "@/lib/hotel/guests";
import { formatFCFA, cn } from "@/lib/utils";
import { GuestFormDialog } from "@/components/hotel/guest-form-dialog";

const schema = z.object({
  guest_id: z.string().uuid("Veuillez sélectionner un client"),
  room_id: z.string().uuid("Veuillez sélectionner une chambre"),
  check_in_date: z.string().min(1, "Date d'arrivée requise"),
  check_out_date: z.string().min(1, "Date de départ requise"),
  adults: z.coerce.number().int().min(1, "Au moins 1 adulte").max(50),
  children: z.coerce.number().int().min(0).max(50),
  rate_amount: z.coerce.number({ error: "Tarif invalide" }).int().min(0).max(10000000),
  discount_amount: z.coerce.number().int().min(0).max(10000000).optional().or(z.literal("")),
  paid_amount: z.coerce.number().int().min(0).max(10000000).optional().or(z.literal("")),
  source: z.enum(["direct", "phone", "whatsapp", "agency", "other"]),
  notes: z.string().max(2000).optional().or(z.literal("")),
});

type Values = z.infer<typeof schema>;

type Props = {
  rooms: Room[];
  guests: Guest[];
};

export function ReservationForm({ rooms, guests }: Props) {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [guestSearch, setGuestSearch] = React.useState("");
  const [selectedGuestId, setSelectedGuestId] = React.useState("");
  const [showGuestForm, setShowGuestForm] = React.useState(false);
  const [roomId, setRoomId] = React.useState("");
  const [source, setSource] = React.useState("direct");
  const [isWalkIn, setIsWalkIn] = React.useState(false);
  const [guestsList, setGuestsList] = React.useState(guests);

  const {
    register, handleSubmit, setValue, watch,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      guest_id: "", room_id: "", check_in_date: "", check_out_date: "",
      adults: 1, children: 0, rate_amount: 0,
      discount_amount: 0, paid_amount: 0,
      source: "direct", notes: "",
    },
  });

  const checkIn = watch("check_in_date");
  const checkOut = watch("check_out_date");
  const rateAmount = watch("rate_amount") ?? 0;
  const discountAmount = watch("discount_amount") ?? 0;
  const paidAmount = watch("paid_amount") ?? 0;

  // Walk-in : pré-remplir les dates avec aujourd'hui
  React.useEffect(() => {
    if (isWalkIn) {
      const today = new Date().toISOString().split("T")[0];
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setValue("check_in_date", today);
      setValue("check_out_date", tomorrow.toISOString().split("T")[0]);
      setSource("direct");
      setValue("source", "direct");
    }
  }, [isWalkIn, setValue]);

  const nights = checkIn && checkOut ? calculateNights(checkIn, checkOut) : 0;
  const totalAmount = nights > 0 ? rateAmount * nights - (discountAmount || 0) : 0;
  const balanceAmount = totalAmount - (paidAmount || 0);

  React.useEffect(() => {
    if (roomId && !isWalkIn) {
      const room = rooms.find((r) => r.id === roomId);
      if (room) setValue("rate_amount", room.price_per_night);
    }
  }, [roomId, rooms, setValue, isWalkIn]);

  const availableRooms = rooms.filter((r) => r.status !== "inactive");
  const filteredGuests = guestSearch
    ? guestsList.filter((g) =>
        g.full_name.toLowerCase().includes(guestSearch.toLowerCase()) ||
        g.phone.includes(guestSearch)
      )
    : guestsList.slice(0, 5);

  const onSubmit = async (values: Values) => {
    setIsLoading(true);
    try {
      const body = {
        ...values,
        discount_amount: Number(values.discount_amount) || 0,
        paid_amount: Number(values.paid_amount) || 0,
      };
      const res = await fetch("/api/hotel/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      toast.success("Réservation créée");
      router.push("/app/reservations");
      router.refresh();
    } catch { toast.error("Erreur réseau"); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-6">
      {/* Toggle Walk-in vs Réservation */}
      <Card className={cn(
        "border-2 transition-all",
        isWalkIn ? "border-orange-500/40 bg-orange-500/5" : "border-primary/20 bg-primary/5"
      )}>
        <CardContent className="p-4">
          <p className="mb-3 text-sm font-medium text-muted-foreground">
            Type de réservation
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setIsWalkIn(false)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                !isWalkIn
                  ? "border-primary bg-primary/10 shadow-md"
                  : "border-border hover:border-primary/30 hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                !isWalkIn ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Réservation</p>
                <p className="text-xs text-muted-foreground">Client pour un jour futur</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setIsWalkIn(true)}
              className={cn(
                "flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all",
                isWalkIn
                  ? "border-orange-500 bg-orange-500/10 shadow-md"
                  : "border-border hover:border-orange-500/30 hover:bg-muted/50"
              )}
            >
              <div className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg transition-colors",
                isWalkIn ? "bg-orange-500 text-white" : "bg-muted text-muted-foreground"
              )}>
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">Présent à la réception</p>
                <p className="text-xs text-muted-foreground">Check-in immédiat (walk-in)</p>
              </div>
            </button>
          </div>
          {isWalkIn && (
            <div className="mt-3 flex items-center gap-2 rounded-lg bg-orange-500/10 p-2 text-xs text-orange-700 dark:text-orange-300">
              <Zap className="h-3.5 w-3.5" />
              <span>Mode walk-in activé : dates pré-remplies (aujourd'hui → demain), source "direct".</span>
            </div>
          )}
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Section Client */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Client</h3>
              <Button type="button" variant="outline" size="sm" onClick={() => setShowGuestForm(true)}>
                <UserPlus className="mr-2 h-4 w-4" />Nouveau client
              </Button>
            </div>

            {selectedGuestId ? (
              <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
                <div>
                  <p className="font-medium">
                    {guestsList.find((g) => g.id === selectedGuestId)?.full_name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {guestsList.find((g) => g.id === selectedGuestId)?.phone}
                  </p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => {
                  setSelectedGuestId("");
                  setValue("guest_id", "");
                }}>
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
                {errors.guest_id && <p className="text-xs text-destructive">{errors.guest_id.message}</p>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Section Chambre & Dates */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold">Chambre & Dates</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Chambre <span className="text-destructive">*</span></Label>
                <Select value={roomId} onValueChange={(v) => { setRoomId(v); setValue("room_id", v, { shouldValidate: true }); }}>
                  <SelectTrigger><SelectValue placeholder="Sélectionnez..." /></SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.room_number} — {r.room_type_name ?? "—"} — {formatFCFA(r.price_per_night)}/nuit
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.room_id && <p className="text-xs text-destructive">{errors.room_id.message}</p>}
              </div>
              <div className="space-y-2">
                <Label>Source</Label>
                <Select value={source} onValueChange={(v) => { setSource(v); setValue("source", v as Values["source"]); }}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RESERVATION_SOURCE_OPTIONS.map((s) => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="check_in_date">Arrivée <span className="text-destructive">*</span></Label>
                <Input id="check_in_date" type="date" {...register("check_in_date")} />
                {errors.check_in_date && <p className="text-xs text-destructive">{errors.check_in_date.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="check_out_date">Départ <span className="text-destructive">*</span></Label>
                <Input id="check_out_date" type="date" {...register("check_out_date")} />
                {errors.check_out_date && <p className="text-xs text-destructive">{errors.check_out_date.message}</p>}
              </div>
            </div>
            {nights > 0 && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-2 text-sm text-center">
                <span className="font-medium">{nuits}</span> nuit{nights > 1 ? "s" : ""} ·
                Du <span className="font-medium">{checkIn}</span> au <span className="font-medium">{checkOut}</span>
              </div>
            )}
            {nights <= 0 && checkIn && checkOut && (
              <p className="text-xs text-destructive">La date de départ doit être après la date d'arrivée</p>
            )}
          </CardContent>
        </Card>

        {/* Section Tarifs */}
        <Card>
          <CardContent className="space-y-4 p-5">
            <h3 className="font-semibold">Tarifs & Paiement</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="rate_amount">Tarif/nuit (FCFA) <span className="text-destructive">*</span></Label>
                <Input id="rate_amount" type="number" min={0} step={1000} {...register("rate_amount")} />
                {errors.rate_amount && <p className="text-xs text-destructive">{errors.rate_amount.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="adults">Adultes</Label>
                <Input id="adults" type="number" min={1} max={50} {...register("adults")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="children">Enfants</Label>
                <Input id="children" type="number" min={0} max={50} {...register("children")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="discount_amount">Remise (FCFA)</Label>
                <Input id="discount_amount" type="number" min={0} step={1000} {...register("discount_amount")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paid_amount">Acompte payé (FCFA)</Label>
                <Input id="paid_amount" type="number" min={0} step={1000} {...register("paid_amount")} />
              </div>
            </div>
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
                    <p className="font-bold text-lg text-emerald-600">{formatFCFA(paidAmount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Solde</p>
                    <p className={cn("font-bold text-lg", balanceAmount > 0 ? "text-destructive" : "text-emerald-600")}>
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
          <Textarea id="notes" rows={2} placeholder="Informations sur la réservation..." {...register("notes")} />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />Annuler
          </Button>
          <Button type="submit" disabled={isLoading} size="lg"
            className={cn(
              "transition-all hover:scale-105 shadow-lg",
              isWalkIn ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-primary text-primary-foreground"
            )}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isWalkIn ? "Créer et enregistrer le séjour" : "Créer la réservation"}
          </Button>
        </div>
      </form>

      <GuestFormDialog open={showGuestForm} onOpenChange={setShowGuestForm} guest={null} />
    </div>
  );
}
