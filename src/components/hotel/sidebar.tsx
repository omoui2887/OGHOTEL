"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BedDouble,
  CalendarCheck,
  Users,
  Wallet,
  Receipt,
  TrendingDown,
  Sparkles,
  Wrench,
  BarChart3,
  Settings,
  Hotel,
  X,
  UserCog,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { canAccessModule } from "@/lib/roles";
import type { UserRole } from "@/types";

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
};

const ALL_NAV_ITEMS: NavItem[] = [
  { href: "/app/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/app/rooms", label: "Chambres", icon: BedDouble },
  { href: "/app/calendar", label: "Calendrier", icon: CalendarCheck },
  { href: "/app/reservations", label: "Réservations", icon: CalendarCheck },
  { href: "/app/guests", label: "Clients", icon: Users },
  { href: "/app/payments", label: "Paiements", icon: Wallet },
  { href: "/app/invoices", label: "Factures", icon: Receipt },
  { href: "/app/expenses", label: "Dépenses", icon: TrendingDown },
  { href: "/app/housekeeping", label: "Ménage", icon: Sparkles },
  { href: "/app/maintenance", label: "Maintenance", icon: Wrench },
  { href: "/app/reports", label: "Rapports", icon: BarChart3 },
  { href: "/app/users", label: "Personnel", icon: UserCog },
  { href: "/app/settings", label: "Paramètres", icon: Settings },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
  establishmentName: string | null;
  features?: Record<string, boolean>;
  role?: UserRole | null;
};

export function HotelSidebar({
  open,
  onClose,
  establishmentName,
  features,
  role,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Prefetch au survol pour les pages les plus visitées — donne une
  // sensation de navigation instantanée (le JS + RSC payload est déjà
  // chargé avant le clic).
  const handleHoverPrefetch = React.useCallback(
    (href: string) => {
      try {
        router.prefetch(href);
      } catch {
        // noop — prefetch best-effort, ne doit jamais casser le hover
      }
    },
    [router]
  );

  // Filtrer les modules selon :
  // 1. Le rôle (ROLE_NAV_PERMISSIONS) — un housekeeping ne voit que Ménage
  // 2. Les features du plan — un plan Essentiel masque Dépenses/Ménage/etc.
  const navItems = ALL_NAV_ITEMS.filter((item) => {
    // 1. Check rôle (sauf dashboard qui est toujours visible)
    if (item.href !== "/app/dashboard" && !canAccessModule(role, item.href)) {
      return false;
    }

    // 2. Check features du plan
    if (item.href === "/app/dashboard") return true;
    if (item.href === "/app/rooms") return features?.chambres !== false;
    if (item.href === "/app/calendar" || item.href === "/app/reservations")
      return features?.reservations !== false;
    if (item.href === "/app/guests") return features?.clients !== false;
    if (item.href === "/app/payments") return features?.paiements !== false;
    if (item.href === "/app/invoices") return features?.facturation !== false;
    if (item.href === "/app/expenses") return features?.depenses === true;
    if (item.href === "/app/housekeeping") return features?.menage === true;
    if (item.href === "/app/maintenance") return features?.maintenance === true;
    if (item.href === "/app/reports") return features?.rapports !== false;
    if (item.href === "/app/users") return features?.personnel === true;
    if (item.href === "/app/settings") return true;
    return true;
  });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link
            href="/app/dashboard"
            prefetch
            className="flex items-center gap-2 font-semibold"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hotel className="h-5 w-5" />
            </span>
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate text-sm font-bold">
                {establishmentName ?? "Mon hôtel"}
              </span>
              <span className="text-xs text-muted-foreground">OGHOTEL</span>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-sidebar-foreground"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                onClick={onClose}
                onMouseEnter={() => handleHoverPrefetch(item.href)}
                onFocus={() => handleHoverPrefetch(item.href)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors active:scale-[0.98]",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} OGHOTEL
          </p>
          <p className="text-xs text-muted-foreground">Abidjan, Côte d'Ivoire</p>
        </div>
      </aside>
    </>
  );
}
