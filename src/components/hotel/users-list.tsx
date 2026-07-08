"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Plus, Pencil, Trash2, Power, KeyRound, Eye, EyeOff,
  Loader2, Save, X, AlertCircle, Check, Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ROLE_LABELS, ROLE_DESCRIPTIONS, ROLE_OPTIONS,
  PERMISSIONS_MATRIX, type StaffUser,
} from "@/lib/hotel/users";
import type { UserRole } from "@/types";
import { formatDate } from "@/lib/utils";

type Props = {
  users: StaffUser[];
  planLimits: {
    max_users: number | null;
    current_users: number;
    can_create: boolean;
    remaining: number | null;
  };
  currentUserId: string;
};

export function UsersList({ users, planLimits, currentUserId }: Props) {
  const router = useRouter();
  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState<StaffUser | null>(null);
  const [resetTarget, setResetTarget] = React.useState<StaffUser | null>(null);
  const [deleting, setDeleting] = React.useState<StaffUser | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Form state
  const [formEmail, setFormEmail] = React.useState("");
  const [formPassword, setFormPassword] = React.useState("");
  const [formName, setFormName] = React.useState("");
  const [formPhone, setFormPhone] = React.useState("");
  const [formRole, setFormRole] = React.useState<string>("");
  const [showPassword, setShowPassword] = React.useState(false);

  // Reset password state
  const [newPassword, setNewPassword] = React.useState("");
  const [showNewPassword, setShowNewPassword] = React.useState(false);

  // Edit state
  const [editRole, setEditRole] = React.useState<string>("");
  const [editName, setEditName] = React.useState("");
  const [editPhone, setEditPhone] = React.useState("");

  function openCreate() {
    setEditing(null);
    setFormEmail(""); setFormPassword(""); setFormName("");
    setFormPhone(""); setFormRole(""); setShowPassword(false);
    setShowForm(true);
  }

  function openEdit(user: StaffUser) {
    setEditing(user);
    setEditRole(user.role);
    setEditName(user.full_name ?? "");
    setEditPhone(user.phone ?? "");
    setShowForm(true);
  }

  async function handleCreate() {
    if (!formEmail || !formPassword || !formName || !formRole) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/hotel/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formEmail, password: formPassword,
          full_name: formName, phone: formPhone || undefined, role: formRole,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      toast.success(data.message);
      setShowForm(false);
      router.refresh();
    } catch { toast.error("Erreur réseau"); }
    finally { setIsLoading(false); }
  }

  async function handleEdit() {
    if (!editing) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/users/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editRole, full_name: editName, phone: editPhone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      toast.success("Utilisateur modifié");
      setShowForm(false);
      router.refresh();
    } catch { toast.error("Erreur réseau"); }
    finally { setIsLoading(false); }
  }

  async function toggleActive(user: StaffUser) {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      toast.success(user.is_active ? "Compte désactivé" : "Compte activé");
      router.refresh();
    } catch { toast.error("Erreur réseau"); }
    finally { setIsLoading(false); }
  }

  async function handleResetPassword() {
    if (!resetTarget || !newPassword) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/users/${resetTarget.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ new_password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      toast.success(data.message);
      setResetTarget(null);
      setNewPassword("");
    } catch { toast.error("Erreur réseau"); }
    finally { setIsLoading(false); }
  }

  async function handleDelete() {
    if (!deleting) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/hotel/users/${deleting.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error ?? "Erreur"); return; }
      toast.success("Utilisateur supprimé");
      setDeleting(null);
      router.refresh();
    } catch { toast.error("Erreur réseau"); }
    finally { setIsLoading(false); }
  }

  return (
    <div className="space-y-6">
      {/* Limite du plan */}
      <Card>
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium">Limite d'utilisateurs</p>
              <p className="text-2xl font-bold">
                {planLimits.current_users}
                {planLimits.max_users !== null ? ` / ${planLimits.max_users}` : " (illimité)"}
              </p>
            </div>
          </div>
          {planLimits.can_create ? (
            <Button onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          ) : (
            <Badge variant="destructive" className="text-sm">
              <AlertCircle className="mr-1 h-4 w-4" />
              Limite atteinte
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Liste des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Personnel de l'établissement</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border bg-muted/30">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium text-muted-foreground">Nom</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Rôle</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Statut</th>
                  <th className="px-4 py-3 font-medium text-muted-foreground">Créé le</th>
                  <th className="px-4 py-3 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20">
                    <td className="px-4 py-3">
                      <p className="font-medium">{u.full_name ?? "—"}</p>
                      {u.phone && <p className="text-xs text-muted-foreground">{u.phone}</p>}
                      {u.id === currentUserId && (
                        <Badge variant="outline" className="mt-1 text-xs">Vous</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={u.role === "hotel_admin" ? "default" : "secondary"}>
                        {ROLE_LABELS[u.role] ?? u.role}
                      </Badge>
                      {u.must_change_password && (
                        <p className="mt-0.5 text-xs text-amber-500">Mot de passe à changer</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={u.is_active ? "success" : "destructive"}>
                        {u.is_active ? "Actif" : "Désactivé"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {formatDate(u.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => openEdit(u)}
                          title="Modifier"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8"
                          onClick={() => setResetTarget(u)}
                          title="Réinitialiser mot de passe"
                        >
                          <KeyRound className="h-3.5 w-3.5" />
                        </Button>
                        {u.id !== currentUserId && (
                          <>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => toggleActive(u)}
                              title={u.is_active ? "Désactiver" : "Activer"}
                            >
                              <Power className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8"
                              onClick={() => setDeleting(u)}
                              title="Supprimer"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Matrice des permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Permissions par rôle</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left font-medium text-muted-foreground">Module</th>
                {(["hotel_admin", "manager", "receptionist", "accountant", "housekeeping", "maintenance"] as UserRole[]).map((r) => (
                  <th key={r} className="px-3 py-2 text-center font-medium text-xs">
                    {ROLE_LABELS[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS_MATRIX.map((row, idx) => (
                <tr key={row.module} className={idx % 2 === 0 ? "bg-muted/20" : ""}>
                  <td className="px-3 py-2 text-muted-foreground">{row.module}</td>
                  {(["hotel_admin", "manager", "receptionist", "accountant", "housekeeping", "maintenance"] as UserRole[]).map((r) => (
                    <td key={r} className="px-3 py-2 text-center">
                      {row.roles[r] ? (
                        <Check className="mx-auto h-4 w-4 text-emerald-500" />
                      ) : (
                        <X className="mx-auto h-4 w-4 text-muted-foreground/30" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Dialog création/modification */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier l'utilisateur" : "Nouvel employé"}</DialogTitle>
            <DialogDescription>
              {editing
                ? `Modifiez les informations de ${editing.full_name ?? editing.email}`
                : "Créez un compte pour un membre du personnel. Il devra changer son mot de passe à la première connexion."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {!editing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="u-email">Email <span className="text-destructive">*</span></Label>
                  <Input id="u-email" type="email" placeholder="employe@exemple.ci"
                    value={formEmail} onChange={(e) => setFormEmail(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-password">Mot de passe temporaire <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input id="u-password" type={showPassword ? "text" : "password"} placeholder="••••••••"
                      value={formPassword} onChange={(e) => setFormPassword(e.target.value)} className="pr-10" />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground">8+ caractères, majuscule, minuscule, chiffre</p>
                </div>
              </>
            )}

            {editing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="e-name">Nom complet</Label>
                  <Input id="e-name" value={editName} onChange={(e) => setEditName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="e-phone">Téléphone</Label>
                  <Input id="e-phone" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                </div>
              </>
            )}

            {!editing && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="u-name">Nom complet <span className="text-destructive">*</span></Label>
                  <Input id="u-name" placeholder="Ex : Awa Koné"
                    value={formName} onChange={(e) => setFormName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="u-phone">Téléphone (optionnel)</Label>
                  <Input id="u-phone" placeholder="+225 07 00 00 00 00"
                    value={formPhone} onChange={(e) => setFormPhone(e.target.value)} />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Rôle <span className="text-destructive">*</span></Label>
              <Select value={editing ? editRole : formRole}
                onValueChange={(v) => editing ? setEditRole(v) : setFormRole(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionnez un rôle..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label} — {ROLE_DESCRIPTIONS[r.value]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button onClick={editing ? handleEdit : handleCreate} disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                {editing ? "Enregistrer" : "Créer le compte"}
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog réinitialisation mot de passe */}
      <Dialog open={!!resetTarget} onOpenChange={(v) => !v && setResetTarget(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Réinitialiser le mot de passe</DialogTitle>
            <DialogDescription>
              Définissez un nouveau mot de passe pour {resetTarget?.full_name ?? resetTarget?.email}.
              L'utilisateur devra le changer à sa prochaine connexion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="np">Nouveau mot de passe</Label>
              <div className="relative">
                <Input id="np" type={showNewPassword ? "text" : "password"} placeholder="••••••••"
                  value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="pr-10" />
                <button type="button" onClick={() => setShowNewPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">8+ caractères, majuscule, minuscule, chiffre</p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setResetTarget(null)}>Annuler</Button>
              <Button onClick={handleResetPassword} disabled={isLoading || !newPassword}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                Réinitialiser
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog suppression */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer le compte de {deleting?.full_name ?? deleting?.email} ?
              Cette action est irréversible. L'utilisateur ne pourra plus se connecter.
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
