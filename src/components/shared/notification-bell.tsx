"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Users, CreditCard, Clock, Ticket, LogIn, LogOut, Sparkles, Wrench, AlertCircle, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { Notification } from "@/lib/notifications";

const ICON_MAP: Record<string, typeof Bell> = {
  "users": Users,
  "credit-card": CreditCard,
  "clock": Clock,
  "ticket": Ticket,
  "log-in": LogIn,
  "log-out": LogOut,
  "sparkles": Sparkles,
  "wrench": Wrench,
  "alert-circle": AlertCircle,
};

const SEVERITY_COLORS: Record<string, string> = {
  info: "bg-blue-500/15 text-blue-400",
  warning: "bg-amber-500/15 text-amber-400",
  danger: "bg-destructive/15 text-destructive",
  success: "bg-emerald-500/15 text-emerald-700",
};

const SEVERITY_DOT: Record<string, string> = {
  info: "bg-blue-500",
  warning: "bg-amber-500",
  danger: "bg-destructive",
  success: "bg-emerald-500",
};

type Props = {
  notifications: Notification[];
  unreadCount: number;
};

export function NotificationBell({ notifications, unreadCount }: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b border-border p-3">
          <h3 className="text-sm font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} non lue{unreadCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="mx-auto mb-2 h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">Aucune notification</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">Tout est à jour !</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((n) => {
              const Icon = ICON_MAP[n.icon] ?? Bell;
              return (
                <Link
                  key={n.id}
                  href={n.action_url ?? "#"}
                  onClick={() => setOpen(false)}
                  className="flex items-start gap-3 border-b border-border/50 p-3 transition-colors hover:bg-muted/30"
                >
                  <div className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                    SEVERITY_COLORS[n.severity] ?? SEVERITY_COLORS.info
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className={cn("h-1.5 w-1.5 rounded-full", SEVERITY_DOT[n.severity] ?? SEVERITY_DOT.info)} />
                      <p className="text-sm font-medium truncate">{n.title}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                      {n.description}
                    </p>
                    {n.action_label && (
                      <p className="mt-1 text-xs font-medium text-primary flex items-center gap-0.5">
                        {n.action_label}
                        <ChevronRight className="h-3 w-3" />
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
