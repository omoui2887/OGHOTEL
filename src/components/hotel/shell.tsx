"use client";

import * as React from "react";
import { HotelSidebar } from "@/components/hotel/sidebar";
import { HotelTopbar } from "@/components/hotel/topbar";

type HotelShellProps = {
  profile: {
    full_name: string | null;
    email: string;
    role: string;
  } | null;
  establishmentName: string | null;
  features?: Record<string, boolean>;
  children: React.ReactNode;
};

export function HotelShell({
  profile,
  establishmentName,
  features,
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
      />

      <div className="flex min-h-screen flex-col md:pl-64">
        <HotelTopbar
          profile={profile}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
