"use client";

import * as React from "react";
import { SuperAdminSidebar } from "@/components/super-admin/sidebar";
import { SuperAdminTopbar } from "@/components/super-admin/topbar";

type SuperAdminShellProps = {
  profile: {
    full_name: string | null;
    email: string;
    role: string;
  } | null;
  children: React.ReactNode;
};

export function SuperAdminShell({ profile, children }: SuperAdminShellProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <SuperAdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Contenu principal, décalé sur desktop pour la sidebar fixe */}
      <div className="flex min-h-screen flex-col md:pl-64">
        <SuperAdminTopbar
          profile={profile}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
