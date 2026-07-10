"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CreditCard,
  Ticket,
  Package,
  BarChart3,
  ScrollText,
  Settings,
  Hotel,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { href: "/super-admin/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
  { href: "/super-admin/leads", label: "Prospects", icon: Users },
  { href: "/super-admin/clients", label: "Clients", icon: Building2 },
  { href: "/super-admin/payments", label: "Paiements SaaS", icon: CreditCard },
  { href: "/super-admin/activation-codes", label: "Codes d'activation", icon: Ticket },
  { href: "/super-admin/plans", label: "Formules", icon: Package },
  { href: "/super-admin/reports", label: "Rapports", icon: BarChart3 },
  { href: "/super-admin/logs", label: "Journal", icon: ScrollText },
  { href: "/super-admin/settings", label: "Paramètres", icon: Settings },
];

export function SuperAdminSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // Prefetch au survol pour rendre la navigation quasi-instantanée.
  const handleHoverPrefetch = React.useCallback(
    (href: string) => {
      try {
        router.prefetch(href);
      } catch {
        // noop
      }
    },
    [router]
  );

  return (
    <>
      {/* Overlay mobile */}
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
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link
            href="/super-admin/dashboard"
            prefetch
            className="flex items-center gap-2 font-semibold"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Hotel className="h-5 w-5" />
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-bold">{APP_NAME}</span>
              <span className="text-xs text-muted-foreground">Super Admin</span>
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

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
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
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground/70 hover:bg-sidebar-accent hover:text-foreground"
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} {APP_NAME}
          </p>
          <p className="text-xs text-muted-foreground">Abidjan, Côte d'Ivoire</p>
        </div>
      </aside>
    </>
  );
}
