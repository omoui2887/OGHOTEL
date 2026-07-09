"use client";

import { Download, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ExportType = {
  value: string;
  label: string;
  url: string;
};

const SUPER_ADMIN_EXPORTS: ExportType[] = [
  { value: "prospects", label: "Prospects", url: "/api/super-admin/export?type=prospects" },
  { value: "clients", label: "Clients", url: "/api/super-admin/export?type=clients" },
  { value: "payments", label: "Paiements SaaS", url: "/api/super-admin/export?type=payments" },
  { value: "revenue", label: "Revenus par période", url: "/api/super-admin/export?type=revenue" },
];

const HOTEL_EXPORTS: ExportType[] = [
  { value: "reservations", label: "Réservations", url: "/api/hotel/export?type=reservations" },
  { value: "payments", label: "Paiements", url: "/api/hotel/export?type=payments" },
  { value: "expenses", label: "Dépenses", url: "/api/hotel/export?type=expenses" },
  { value: "reports", label: "Rapport complet", url: "/api/hotel/export?type=reports" },
  { value: "logo", label: "Logo (image)", url: "/api/hotel/export?type=logo" },
];

type Props = {
  scope: "super-admin" | "hotel";
};

export function ExportButton({ scope }: Props) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [selected, setSelected] = React.useState("");

  const exports = scope === "super-admin" ? SUPER_ADMIN_EXPORTS : HOTEL_EXPORTS;

  async function handleExport() {
    if (!selected) {
      toast.error("Veuillez sélectionner un type d'export");
      return;
    }
    const exportItem = exports.find((e) => e.value === selected);
    if (!exportItem) return;

    setIsLoading(true);
    try {
      const res = await fetch(exportItem.url);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error ?? "Erreur lors de l'export");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="(.+)"/);
      link.download = filenameMatch ? filenameMatch[1] : `oghotel-export-${Date.now()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success("Export téléchargé");
      setSelected("");
    } catch {
      toast.error("Erreur réseau");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selected} onValueChange={setSelected}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Exporter..." />
        </SelectTrigger>
        <SelectContent>
          {exports.map((e) => (
            <SelectItem key={e.value} value={e.value}>
              {e.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={isLoading || !selected}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : selected === "logo" ? (
          <ImageIcon className="mr-2 h-4 w-4" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        {selected === "logo" ? "Image" : "XLSX"}
      </Button>
    </div>
  );
}
