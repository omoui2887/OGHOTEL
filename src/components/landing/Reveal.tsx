"use client";

import * as React from "react";
import { useScrollReveal } from "@/hooks/use-scroll-reveal";
import { cn } from "@/lib/utils";

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  /** Délai en ms pour l'effet staggered (0 = pas de délai) */
  delay?: number;
  /** Direction de l'animation */
  direction?: "up" | "left" | "right" | "scale";
};

/**
 * Composant Reveal — enveloppe un contenu et le révèle au scroll.
 *
 * Usage:
 * <Reveal>
 *   <Card>...</Card>
 * </Reveal>
 *
 * <Reveal delay={160} direction="up">
 *   <Card>...</Card>
 * </Reveal>
 */
export function Reveal({
  children,
  className,
  delay = 0,
  direction = "up",
}: RevealProps) {
  const { ref, revealed } = useScrollReveal();

  const initialClasses: Record<string, string> = {
    up: "translate-y-8",
    left: "-translate-x-8",
    right: "translate-x-8",
    scale: "scale-95",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "transition-all duration-700 ease-out will-change-transform",
        revealed
          ? "translate-x-0 translate-y-0 scale-100 opacity-100"
          : cn("opacity-0", initialClasses[direction]),
        className
      )}
      style={{ transitionDelay: revealed ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
