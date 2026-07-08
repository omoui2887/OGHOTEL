"use client";

import * as React from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GuestFormDialog } from "./guest-form-dialog";
import type { Guest } from "@/lib/hotel/guests";

export function GuestDetailActions({ guest }: { guest: Guest }) {
  const [showForm, setShowForm] = React.useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setShowForm(true)}>
        <Pencil className="mr-2 h-4 w-4" />
        Modifier
      </Button>
      <GuestFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        guest={guest}
      />
    </>
  );
}
