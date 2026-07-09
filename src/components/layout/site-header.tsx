"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ArrowRight, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { NAV_LINKS, APP_NAME } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a1929]/90 backdrop-blur supports-[backdrop-filter]:bg-[#0a1929]/75">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" prefetch className="flex items-center gap-2 font-semibold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-500 text-sm font-bold text-white">
            OG
          </span>
          <span className="text-lg tracking-tight text-white">{APP_NAME}</span>
        </Link>

        {/* Nav desktop */}
        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Actions desktop */}
        <div className="hidden items-center gap-2 md:flex">
          <Button asChild variant="ghost" size="sm" className="text-slate-200 hover:bg-white/10 hover:text-white">
            <Link href="/activation" prefetch>
              <KeyRound className="mr-1.5 h-4 w-4" />
              Activer mon compte
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="text-slate-200 hover:bg-white/10 hover:text-white">
            <Link href="/login" prefetch>Connexion</Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            <Link href="/#contact">
              Essai Gratuit
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-1 md:hidden">
          {mounted ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Ouvrir le menu"
                  className="text-slate-200 hover:bg-white/10 hover:text-white"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[280px] border-white/10 bg-[#0a1929] text-white"
                aria-describedby={undefined}
              >
                <SheetTitle className="text-lg text-white">{APP_NAME}</SheetTitle>
                <nav className="mt-6 flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          "rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                  <div className="my-2 h-px bg-white/10" />
                  <SheetClose asChild>
                    <Link
                      href="/login"
                      className="rounded-md px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Connexion
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Link
                      href="/activation"
                      className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-orange-400 transition-colors hover:bg-white/10"
                    >
                      <KeyRound className="h-4 w-4" />
                      Activer mon compte
                    </Link>
                  </SheetClose>
                  <SheetClose asChild>
                    <Button
                      asChild
                      className="mt-2 bg-orange-500 text-white hover:bg-orange-600"
                    >
                      <Link href="/#contact">
                        Essai Gratuit
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </SheetClose>
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Ouvrir le menu"
              disabled
              className="text-slate-200"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
