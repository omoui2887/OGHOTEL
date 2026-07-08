"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  Download,
  Inbox,
  ChevronLeft,
  ChevronRight,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  EXPENSE_CATEGORY_LABELS,
  EXPENSE_CATEGORY_OPTIONS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_METHOD_OPTIONS,
  expensesToCSV,
  type Expense,
  type ExpenseCategory,
} from "@/lib/hotel/expenses";
import { formatFCFA, formatDate } from "@/lib/utils";

type Props = {
  expenses: Expense[];
  total: number;
  totalAmount: number;
  byCategory: { category: string; total: number; count: number }[];
  page: number;
  totalPages: number;
  initialCategory: string;
  initialDateFrom: string;
  initialDateTo: string;
  canEdit: boolean;
  canDelete: boolean;
};

export function ExpensesList({
  expenses,
  total,
  totalAmount,
  byCategory,
  page,
  totalPages,
  initialCategory,
  initialDateFrom,
  initialDateTo,
  canEdit,
  canDelete,
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [category, setCategory] = React.useState(initialCategory);
  const [dateFrom, setDateFrom] = React.useState(initialDateFrom);
  const [dateTo, setDateTo] = React.useState(initialDateTo);
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<Expense | null>(null);
  const [deleting, setDeleting] = React.useState<Expense | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form state
  const [formCategory, setFormCategory] = React.useState<string>("");
  const [formAmount, setFormAmount] = React.useState("");
  const [formDate, setFormDate] = React.useState(
    new Date().toISOString().split("T")[0]
  );
  const [formMethod, setFormMethod] = React.useState("");
  const [formDescription, setFormDescription] = React.useState("");

  const updateUrl = React.useCallback(
    (params: {
      category: string;
      dateFrom: string;
      dateTo: string;
      page: number;
    }) => {
      const sp = new URLSearchParams();
      if (params.category && params.category !== "all")
        sp.set("category", params.category);
      if (params.dateFrom) sp.set("date_from", params.dateFrom);
      if (params.dateTo) sp.set("date_to", params.dateTo);
      if (params.page > 1) sp.set("page", String(params.page));
      const qs = sp.toString();
      router.push(`/app/expenses${qs ? "?" + qs : ""}`);
    },
    [router]
  );

  React.useEffect(() => {
    const t = setTimeout(() => {
      updateUrl({ category, dateFrom, dateTo, page: 1 });
    }, 400);
    return () => clearTimeout(t);
  }, [category, dateFrom, dateTo, updateUrl]);

  function goToPage(p: number) {
    if (p < 1 || p > totalPages) return;
    updateUrl({ category, dateFrom, dateTo, page: p });
  }

  function openCreate() {
    setEditing(null);
    setFormCategory("");
    setFormAmount("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormMethod("");
    setFormDescription("");
    setShowForm(true);
  }

  function openEdit(expense: Expense) {
    setEditing(expense);
    setFormCategory(expense.category);
    setFormAmount(String(expense.amount));
    setFormDate(expense.expense_date);
    setFormMethod(expense.payment_method ?? "");
    setFormDescription(expense.description ?? "");
    setShowForm(true);
  }

  async function handleSave() {
    if (!formCategory || !formAmount || !formDate) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }
    setIsLoading(true);
    try {
      const body = {
        category: formCategory,
        amount: Number(formAmount),
        expense_date: formDate,
        payment_method: formMethod || undefined,
        description: formDescription || undefined,
      };

      const url = editing
        ? `/api/hotel/expenses/${editing.id}`
        : "/api/hotel/expenses";
      const method = editing ? "PATCH" : "POST";

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

      toast.success(editing ? "Dépense modifiée" : "Dépense enregistrée");
      setShowForm(false);
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/expenses/${deleting.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur");
        return;
      }
      toast.success("Dépense supprimée");
      setDeleting(null);
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  function handleExportCSV() {
    if (expenses.length === 0) {
      toast.error("Aucune dépense à exporter");
      return;
    }
    const csv = expensesToCSV(expenses);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `depenses-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Export CSV téléchargé");
  }

  return (
    <div className="space-y-4">
      {/* Résumé */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/15 text-destructive">
              <TrendingDown className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total (filtre actif)</p>
              <p className="text-xl font-bold text-destructive">
                {formatFCFA(totalAmount)}
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <Inbox className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Nombre de dépenses</p>
              <p className="text-xl font-bold">{total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="mb-2 text-xs text-muted-foreground">Par catégorie</p>
            <div className="space-y-1">
              {byCategory.slice(0, 3).map((c) => (
                <div key={c.category} className="flex justify-between text-xs">
                  <span className="text-muted-foreground">
                    {EXPENSE_CATEGORY_LABELS[c.category as ExpenseCategory] ?? c.category}
                  </span>
                  <span className="font-medium">{formatFCFA(c.total)}</span>
                </div>
              ))}
              {byCategory.length > 3 && (
                <p className="text-xs text-muted-foreground">
                  +{byCategory.length - 3} autres
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres + actions */}
      <Card>
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {EXPENSE_CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full sm:w-[150px]"
              placeholder="Du"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full sm:w-[150px]"
              placeholder="Au"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            {canEdit && (
              <Button onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Dépense
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Liste */}
      {expenses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <TrendingDown className="mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm font-medium text-muted-foreground">
              Aucune dépense
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              {canEdit
                ? "Enregistrez votre première dépense"
                : "Les dépenses apparaîtront ici"}
            </p>
            {canEdit && (
              <Button className="mt-4" onClick={openCreate}>
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une dépense
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-muted/30">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Catégorie</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Description</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Montant</th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">Moyen</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map((e) => {
                    const catOption = EXPENSE_CATEGORY_OPTIONS.find(
                      (c) => c.value === e.category
                    );
                    return (
                      <tr
                        key={e.id}
                        className="border-b border-border/50 transition-colors hover:bg-muted/20"
                      >
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatDate(e.expense_date)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">
                            {catOption?.icon} {EXPENSE_CATEGORY_LABELS[e.category] ?? e.category}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 max-w-xs truncate text-muted-foreground">
                          {e.description ?? "—"}
                        </td>
                        <td className="px-4 py-3 font-bold text-destructive">
                          {formatFCFA(e.amount)}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {e.payment_method
                            ? PAYMENT_METHOD_LABELS[e.payment_method] ?? e.payment_method
                            : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {canEdit && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEdit(e)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            )}
                            {canDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => setDeleting(e)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} sur {totalPages}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog formulaire */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier la dépense" : "Nouvelle dépense"}
            </DialogTitle>
            <DialogDescription>
              {editing
                ? "Modifiez les informations de cette dépense."
                : "Enregistrez une nouvelle dépense pour votre établissement."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Catégorie <span className="text-destructive">*</span>
                </Label>
                <Select value={formCategory} onValueChange={setFormCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.icon} {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="exp-amount">
                  Montant (FCFA) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="exp-amount"
                  type="number"
                  min={1}
                  step={500}
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="exp-date">
                  Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="exp-date"
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Moyen de paiement</Label>
                <Select value={formMethod} onValueChange={setFormMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHOD_OPTIONS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="exp-desc">Description</Label>
              <Textarea
                id="exp-desc"
                rows={2}
                placeholder="Détails de la dépense..."
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading || !formCategory || !formAmount || !formDate}
              >
                {isLoading ? "Enregistrement..." : editing ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog suppression */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette dépense ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer la dépense de{" "}
              {formatFCFA(deleting?.amount ?? 0)} ({EXPENSE_CATEGORY_LABELS[deleting?.category as ExpenseCategory] ?? ""}) ?
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isLoading}
            >
              {isLoading ? "Suppression…" : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
