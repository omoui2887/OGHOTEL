"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LEAD_STATUS_OPTIONS } from "@/lib/super-admin/leads";
import type { Lead } from "@/lib/super-admin/leads";

type Props = {
  lead: Lead;
};

export function LeadDetailEditor({ lead }: Props) {
  const router = useRouter();
  const [status, setStatus] = React.useState(lead.status);
  const [notes, setNotes] = React.useState(lead.internal_notes ?? "");
  const [isSavingStatus, setIsSavingStatus] = React.useState(false);
  const [isSavingNotes, setIsSavingNotes] = React.useState(false);

  const statusChanged = status !== lead.status;
  const notesChanged = notes !== (lead.internal_notes ?? "");

  async function saveStatus() {
    if (!statusChanged) return;
    setIsSavingStatus(true);
    try {
      const res = await fetch(`/api/super-admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de la mise à jour");
        return;
      }
      toast.success("Statut mis à jour");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSavingStatus(false);
    }
  }

  async function saveNotes() {
    if (!notesChanged) return;
    setIsSavingNotes(true);
    try {
      const res = await fetch(`/api/super-admin/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ internal_notes: notes }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Erreur lors de l'enregistrement");
        return;
      }
      toast.success("Notes enregistrées");
      router.refresh();
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsSavingNotes(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Statut */}
      <div className="space-y-2">
        <Label htmlFor="status">Statut du prospect</Label>
        <div className="flex gap-2">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status" className="flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={saveStatus}
            disabled={!statusChanged || isSavingStatus}
          >
            {isSavingStatus ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Enregistrer
          </Button>
        </div>
      </div>

      {/* Notes internes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes internes</Label>
        <Textarea
          id="notes"
          rows={6}
          placeholder="Notes visibles uniquement par le Super Admin..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Ces notes ne sont visibles que par le Super Admin, jamais par le prospect.
        </p>
        <Button
          onClick={saveNotes}
          disabled={!notesChanged || isSavingNotes}
          variant="outline"
        >
          {isSavingNotes ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Enregistrer les notes
        </Button>
      </div>
    </div>
  );
}
