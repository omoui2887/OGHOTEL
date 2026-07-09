"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loader2,
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  Calendar,
  UserPlus,
  Search,
  Zap,
  Hotel,
  UserCircle2,
  CheckCircle2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RESERVATION_SOURCE_OPTIONS,
  calculateNights,
} from "@/lib/hotel/reservations";
import type { Room } from "@/lib/hotel/rooms";
import type { Guest } from "@/lib/hotel/guests";
import { formatFCFA, cn, formatDate } from "@/lib/utils";
import { NewClientForm } from "./new-client-form";

type Mode = "reservation" | "walk-in";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: Mode;
  rooms: Room[];
  guests: Guest[];
};

type MiniGuest = {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
};

export function ReservationWizardDialog({
  open,
  onOpenChange,
  mode,
  rooms,
  guests,
}: Props) {
  const router = useRouter();
  const isWalkIn = mode === "walk-in";
  const totalSteps = isWalkIn ? 2 : 3;

  const [step, setStep] = React.useState(1);
  const [isLoading, setIsLoading] = React.useState(false);

  // Client
  const [guestMode, setGuestMode] = React.useState<"search" | "new">("search");
  const [guestSearch, setGuestSearch] = React.useState("");
  const [selectedGuest, setSelectedGuest] = React.useState<MiniGuest | null>(null);
  const [guestsList, setGuestsList] = React.useState<MiniGuest[]>(
    guests.map((g) => ({
      id: g.id,
      full_name: g.full_name,
      phone: g.phone,
      email: g.email,
    }))
  );

  // Détails séjour
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const todayStr = today.toISOString().split("T")[0];
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const [roomId, setRoomId] = React.useState("");
  const [checkInDate, setCheckInDate] = React.useState(
    isWalkIn ? todayStr : ""
  );
  const [checkOutDate, setCheckOutDate] = React.useState(
    isWalkIn ? tomorrowStr : ""
  );
  const [adults, setAdults] = React.useState(1);
  const [children, setChildren] = React.useState(0);
  const [rateAmount, setRateAmount] = React.useState(0);
  const [discountAmount, setDiscountAmount] = React.useState(0);
  const [paidAmount, setPaidAmount] = React.useState(0);
  const [source, setSource] = React.useState<"direct" | "phone" | "whatsapp" | "agency" | "other">(
    isWalkIn ? "direct" : "direct"
  );
  const [notes, setNotes] = React.useState("");

  // Reset quand on ouvre / change de mode
  React.useEffect(() => {
    if (open) {
      setStep(1);
      setGuestMode("search");
      setGuestSearch("");
      setSelectedGuest(null);
      setRoomId("");
      setCheckInDate(isWalkIn ? todayStr : "");
      setCheckOutDate(isWalkIn ? tomorrowStr : "");
      setAdults(1);
      setChildren(0);
      setRateAmount(0);
      setDiscountAmount(0);
      setPaidAmount(0);
      setSource(isWalkIn ? "direct" : "direct");
      setNotes("");
    }
  }, [open, mode]);

  // Auto-remplir le tarif quand on choisit une chambre
  React.useEffect(() => {
    if (roomId) {
      const r = rooms.find((x) => x.id === roomId);
      if (r) setRateAmount(r.price_per_night);
    }
  }, [roomId, rooms]);

  const availableRooms = rooms.filter((r) => r.status !== "inactive");
  const filteredGuests = guestSearch
    ? guestsList.filter(
        (g) =>
          g.full_name.toLowerCase().includes(guestSearch.toLowerCase()) ||
          g.phone.includes(guestSearch)
      )
    : guestsList.slice(0, 6);

  const nights =
    checkInDate && checkOutDate ? calculateNights(checkInDate, checkOutDate) : 0;
  const totalAmount = nights > 0 ? rateAmount * nights - (discountAmount || 0) : 0;
  const balanceAmount = totalAmount - (paidAmount || 0);

  const stepLabels = isWalkIn
    ? ["Client", "Chambre"]
    : ["Client", "Détails", "Validation"];

  function handleNext() {
    // Validation step 1
    if (step === 1 && !selectedGuest) {
      toast.error("Veuillez sélectionner ou créer un client");
      return;
    }
    // Validation step 2
    if (step === 2) {
      if (!roomId) {
        toast.error("Veuillez sélectionner une chambre");
        return;
      }
      if (!checkInDate || !checkOutDate) {
        toast.error("Veuillez renseigner les dates d'arrivée et de départ");
        return;
      }
      if (nights <= 0) {
        toast.error("La date de départ doit être après la date d'arrivée");
        return;
      }
      if (rateAmount <= 0) {
        toast.error("Le tarif par nuit doit être supérieur à 0");
        return;
      }
    }
    if (step < totalSteps) setStep(step + 1);
  }

  function handlePrev() {
    if (step > 1) setStep(step - 1);
  }

  async function handleConfirm() {
    if (!selectedGuest || !roomId) {
      toast.error("Informations manquantes");
      return;
    }
    setIsLoading(true);
    try {
      const body = {
        guest_id: selectedGuest.id,
        room_id: roomId,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        adults,
        children,
        rate_amount: rateAmount,
        discount_amount: discountAmount || 0,
        paid_amount: paidAmount || 0,
        source,
        notes,
      };

      // Étape 1 : créer la réservation (status = "confirmed" par défaut)
      const res = await fetch("/api/hotel/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }

      const reservationId = data.id;

      // Étape 2 (walk-in uniquement) : effectuer le check-in immédiat
      // La réservation passe à "checked_in", la chambre à "occupied", log activité.
      if (isWalkIn && reservationId) {
        const checkInBody: Record<string, unknown> = {
          reservation_id: reservationId,
        };
        // Si un acompte a été saisi, on l'enregistre avec le check-in
        if (paidAmount > 0) {
          checkInBody.payment = {
            amount: paidAmount,
            method: "cash",
          };
        }
        const checkInRes = await fetch("/api/hotel/check-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkInBody),
        });
        const checkInData = await checkInRes.json();
        if (!checkInRes.ok) {
          // La réservation est créée mais le check-in a échoué — on informe l'utilisateur
          toast.warning(
            `Réservation créée mais le check-in automatique a échoué : ${checkInData.error ?? "erreur"}. Effectuez le check-in manuellement.`
          );
        } else {
          toast.success("Séjour enregistré — client arrivé et installé");
        }
      } else {
        toast.success("Réservation créée avec succès");
      }

      onOpenChange(false);
      router.push("/app/reservations");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  const selectedRoom = rooms.find((r) => r.id === roomId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                  isWalkIn
                    ? "bg-orange-500/15 text-orange-600"
                    : "bg-primary/15 text-primary"
                )}
              >
                {isWalkIn ? <Zap className="h-5 w-5" /> : <Calendar className="h-5 w-5" />}
              </div>
              <div>
                <DialogTitle className="text-lg font-bold">
                  {isWalkIn ? "Enregistrement Direct (Walk-In)" : "Nouvelle Réservation"}
                </DialogTitle>
                <DialogDescription className="mt-0.5">
                  {isWalkIn
                    ? "Client sans réservation — enregistrement et attribution de chambre immédiats"
                    : "Créez une réservation en 3 étapes"}
                </DialogDescription>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* Stepper */}
        <div className="flex items-center justify-center gap-2 py-2">
          {stepLabels.map((label, i) => {
            const stepNum = i + 1;
            const isActive = stepNum === step;
            const isDone = stepNum < step;
            return (
              <React.Fragment key={label}>
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all",
                      isActive &&
                        "bg-primary text-primary-foreground shadow-md ring-4 ring-primary/15",
                      isDone && "bg-primary/80 text-primary-foreground",
                      !isActive && !isDone && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium transition-colors",
                      isActive
                        ? "text-primary"
                        : isDone
                        ? "text-primary/70"
                        : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </div>
                {i < stepLabels.length - 1 && (
                  <div
                    className={cn(
                      "mx-1 h-0.5 w-12 rounded-full transition-colors sm:w-20",
                      stepNum < step ? "bg-primary/60" : "bg-border"
                    )}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Bannière arrivée (walk-in uniquement) */}
        {isWalkIn && (
          <div className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm">
            <Calendar className="h-4 w-4 shrink-0 text-orange-600" />
            <span className="text-orange-800 dark:text-orange-200">
              Arrivée :{" "}
              <span className="font-semibold">Aujourd&apos;hui ({formatDate(todayStr)})</span>{" "}
              — Check-in automatique
            </span>
          </div>
        )}

        {/* === ÉTAPE 1 : CLIENT === */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold">
                {isWalkIn ? "Informations du Client" : "Choix du Client"}
              </h3>
              {guestMode === "search" && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setGuestMode("new")}
                  className="border-primary/40 text-primary hover:bg-primary/5"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Nouveau Client
                </Button>
              )}
            </div>

            {/* Client sélectionné */}
            {selectedGuest ? (
              <div className="flex items-center justify-between rounded-xl border-2 border-primary/40 bg-primary/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <UserCircle2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedGuest.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedGuest.phone}
                      {selectedGuest.email ? ` · ${selectedGuest.email}` : ""}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedGuest(null);
                    setGuestMode("search");
                  }}
                >
                  Changer
                </Button>
              </div>
            ) : guestMode === "new" ? (
              <NewClientForm
                compact
                onCreated={(g) => {
                  setGuestsList((prev) => [g, ...prev]);
                  setSelectedGuest(g);
                  setGuestMode("search");
                }}
                onCancel={() => setGuestMode("search")}
              />
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un client existant par nom, téléphone..."
                    value={guestSearch}
                    onChange={(e) => setGuestSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>

                {filteredGuests.length > 0 ? (
                  <div className="max-h-72 space-y-1 overflow-y-auto rounded-lg border border-border p-1">
                    {filteredGuests.map((g) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGuest(g)}
                        className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground">
                          <UserCircle2 className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{g.full_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {g.phone}
                            {g.email ? ` · ${g.email}` : ""}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-lg border border-dashed border-border bg-muted/20 py-6 text-center text-xs text-muted-foreground">
                    {guestSearch
                      ? "Aucun client trouvé. Créez un nouveau client."
                      : "Tapez un nom ou numéro de téléphone pour rechercher un client"}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* === ÉTAPE 2 : CHAMBRE / DÉTAILS === */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">
              {isWalkIn ? "Attribution de la Chambre" : "Détails du Séjour"}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>
                  Chambre <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={roomId}
                  onValueChange={(v) => setRoomId(v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une chambre" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRooms.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.room_number} — {r.room_type_name ?? "—"} —{" "}
                        {formatFCFA(r.price_per_night)}/nuit
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Source</Label>
                <Select
                  value={source}
                  onValueChange={(v) =>
                    setSource(v as typeof source)
                  }
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
              <div className="space-y-1.5">
                <Label htmlFor="check_in_date">
                  Arrivée <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="check_in_date"
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  disabled={isWalkIn}
                />
                {isWalkIn && (
                  <p className="text-xs text-muted-foreground">
                    Verrouillé en walk-in (aujourd&apos;hui)
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="check_out_date">
                  Départ <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="check_out_date"
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-center text-sm">
                <span className="font-semibold">{nights}</span>{" "}
                nuit{nights > 1 ? "s" : ""} · Du{" "}
                <span className="font-medium">{formatDate(checkInDate)}</span> au{" "}
                <span className="font-medium">{formatDate(checkOutDate)}</span>
              </div>
            )}
            {checkInDate && checkOutDate && nights <= 0 && (
              <p className="text-xs text-destructive">
                La date de départ doit être après la date d&apos;arrivée
              </p>
            )}

            {/* Tarifs */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="rate_amount">
                  Tarif/nuit (FCFA) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="rate_amount"
                  type="number"
                  min={0}
                  step={1000}
                  value={rateAmount}
                  onChange={(e) => setRateAmount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="adults">Adultes</Label>
                <Input
                  id="adults"
                  type="number"
                  min={1}
                  max={50}
                  value={adults}
                  onChange={(e) => setAdults(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="children">Enfants</Label>
                <Input
                  id="children"
                  type="number"
                  min={0}
                  max={50}
                  value={children}
                  onChange={(e) => setChildren(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="discount_amount">Remise (FCFA)</Label>
                <Input
                  id="discount_amount"
                  type="number"
                  min={0}
                  step={1000}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="paid_amount">Acompte payé (FCFA)</Label>
                <Input
                  id="paid_amount"
                  type="number"
                  min={0}
                  step={1000}
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(Number(e.target.value))}
                />
              </div>
            </div>

            {nights > 0 && (
              <div className="rounded-lg border-2 border-primary/30 bg-primary/5 p-3">
                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Nuits</p>
                    <p className="text-lg font-bold">{nights}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Total</p>
                    <p className="text-lg font-bold text-primary">
                      {formatFCFA(totalAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Acompte</p>
                    <p className="text-lg font-bold text-emerald-600">
                      {formatFCFA(paidAmount || 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Solde</p>
                    <p
                      className={cn(
                        "text-lg font-bold",
                        balanceAmount > 0
                          ? "text-destructive"
                          : "text-emerald-600"
                      )}
                    >
                      {formatFCFA(balanceAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                rows={2}
                placeholder="Informations sur la réservation..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* === ÉTAPE 3 : VALIDATION (réservation uniquement) === */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-semibold">Validation</h3>

            <div className="space-y-3">
              {/* Client */}
              <div className="rounded-xl border border-border p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <UserCircle2 className="h-3.5 w-3.5" /> Client
                </div>
                {selectedGuest ? (
                  <div>
                    <p className="font-semibold">{selectedGuest.full_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedGuest.phone}
                      {selectedGuest.email ? ` · ${selectedGuest.email}` : ""}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-destructive">Aucun client</p>
                )}
              </div>

              {/* Séjour */}
              <div className="rounded-xl border border-border p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <Hotel className="h-3.5 w-3.5" /> Séjour
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground">Chambre</p>
                    <p className="font-medium">
                      {selectedRoom?.room_number ?? "—"} ·{" "}
                      {selectedRoom?.room_type_name ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Source</p>
                    <p className="font-medium capitalize">{source}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Arrivée</p>
                    <p className="font-medium">{formatDate(checkInDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Départ</p>
                    <p className="font-medium">{formatDate(checkOutDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Occupation</p>
                    <p className="font-medium">
                      {adults} adulte{adults > 1 ? "s" : ""}
                      {children > 0 ? ` · ${children} enfant${children > 1 ? "s" : ""}` : ""}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Nuits</p>
                    <p className="font-medium">{nights}</p>
                  </div>
                </div>
              </div>

              {/* Tarifs */}
              <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Récapitulatif
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {rateAmount} FCFA × {nights} nuit{nights > 1 ? "s" : ""}
                    </span>
                    <span className="font-medium">
                      {formatFCFA(rateAmount * nights)}
                    </span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Remise</span>
                      <span className="font-medium">-{formatFCFA(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-primary/20 pt-1.5 text-base">
                    <span className="font-semibold">Total</span>
                    <span className="font-bold text-primary">
                      {formatFCFA(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Acompte versé</span>
                    <span className="font-medium text-emerald-600">
                      {formatFCFA(paidAmount || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Solde à régler</span>
                    <span
                      className={cn(
                        "font-bold",
                        balanceAmount > 0 ? "text-destructive" : "text-emerald-600"
                      )}
                    >
                      {formatFCFA(balanceAmount)}
                    </span>
                  </div>
                </div>
              </div>

              {notes && (
                <div className="rounded-xl border border-border p-4">
                  <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Notes
                  </div>
                  <p className="text-sm">{notes}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions footer */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            <X className="mr-2 h-4 w-4" />
            Annuler
          </Button>

          <div className="flex items-center gap-2">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrev}
                disabled={isLoading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Précédent
              </Button>
            )}

            {step < totalSteps ? (
              <Button
                type="button"
                onClick={handleNext}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Suivant
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                )}
                {isWalkIn
                  ? "Confirmer l'arrivée"
                  : "Confirmer la réservation"}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
