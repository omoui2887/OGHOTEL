"use client";

import * as React from "react";
import { HotelSidebar } from "@/components/hotel/sidebar";
import { HotelTopbar } from "@/components/hotel/topbar";

import type { Notification } from "@/lib/notifications";
import type { UserRole } from "@/types";

type HotelShellProps = {
  profile: {
    full_name: string | null;
    email: string;
    role: UserRole;
  } | null;
  establishmentName: string | null;
  features?: Record<string, boolean>;
  notifications?: Notification[];
  unreadCount?: number;
  children: React.ReactNode;
};

export function HotelShell({
  profile,
  establishmentName,
  features,
  notifications = [],
  unreadCount = 0,
  children,
}: HotelShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <HotelSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        establishmentName={establishmentName}
        features={features}
        role={profile?.role ?? null}
      />

      <div className="flex min-h-screen flex-col md:pl-64">
        <HotelTopbar
          profile={profile}
          onMenuClick={() => setSidebarOpen(true)}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
