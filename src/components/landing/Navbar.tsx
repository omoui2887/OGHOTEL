"use client";

import * as React from "react";
import Link from "next/link";
import { Menu, ArrowRight, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

/**
 * Barre de navigation premium — atterrissage public OGHOTEL.
 * Fond bleu marine (#0B1F3A) translucide + blur (glassmorphism).
 * Ombre ajoutée au scroll (window.scrollY > 20).
 */

const NAV_LINKS = [
  { href: "#features", label: "Fonctionnalités" },
  { href: "#how", label: "Comment ça marche" },
  { href: "#pricing", label: "Tarifs" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" },
] as const;

const WHATSAPP_URL = "https://wa.me/2250576103277";

export function Navbar() {
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b border-white/10 bg-[#0B1F3A]/80 backdrop-blur-xl transition-shadow duration-300",
        scrolled && "shadow-lg shadow-black/30"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:h-20">
        {/* ---------------------------------------------------------------- */}
        {/* Logo + badge                                                     */}
        {/* ---------------------------------------------------------------- */}
        <Link href="/" prefetch className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#D4A843] text-sm font-bold text-[#0B1F3A]">
            OG
          </span>
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight text-white">
              OGHOTEL
            </span>
            <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
              SaaS hôtelier ivoirien
            </span>
          </span>
        </Link>

        {/* ---------------------------------------------------------------- */}
        {/* Navigation desktop                                               */}
        {/* ---------------------------------------------------------------- */}
        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-300 transition-colors hover:text-white"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* ---------------------------------------------------------------- */}
        {/* Actions desktop                                                  */}
        {/* ---------------------------------------------------------------- */}
        <div className="hidden items-center gap-2 lg:flex">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="text-slate-200 hover:bg-white/10 hover:text-white"
          >
            <Link href="/login" prefetch>
              Connexion
            </Link>
          </Button>
          <Button
            asChild
            size="sm"
            className="bg-[#D4A843] text-[#0B1F3A] hover:bg-[#c39636] hover:text-[#0B1F3A]"
          >
            <a href="#lead-form">
              Demander une activation
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </a>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Contacter sur WhatsApp"
            className="text-slate-200 hover:bg-white/10 hover:text-white"
          >
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
            </a>
          </Button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Mobile — WhatsApp + hamburger                                    */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center gap-1 lg:hidden">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Contacter sur WhatsApp"
            className="text-slate-200 hover:bg-white/10 hover:text-white"
          >
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-5 w-5" />
            </a>
          </Button>

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
                className="w-[300px] border-white/10 bg-[#0B1F3A] text-white"
                aria-describedby={undefined}
              >
                <SheetTitle className="text-lg text-white">OGHOTEL</SheetTitle>
                <span className="mt-1 block text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
                  SaaS hôtelier ivoirien
                </span>

                <nav className="mt-6 flex flex-col gap-1">
                  {NAV_LINKS.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <a
                        href={link.href}
                        className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                      >
                        {link.label}
                      </a>
                    </SheetClose>
                  ))}

                  <div className="my-2 h-px bg-white/10" />

                  <SheetClose asChild>
                    <Link
                      href="/login"
                      prefetch
                      className="rounded-md px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      Connexion
                    </Link>
                  </SheetClose>

                  <SheetClose asChild>
                    <Button
                      asChild
                      className="mt-2 bg-[#D4A843] text-[#0B1F3A] hover:bg-[#c39636] hover:text-[#0B1F3A]"
                    >
                      <a href="#lead-form">
                        Demander une activation
                        <ArrowRight className="ml-1.5 h-4 w-4" />
                      </a>
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
