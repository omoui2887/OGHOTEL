"use client";

import * as React from "react";

/**
 * Hook de scroll reveal — révèle les éléments quand ils entrent dans le viewport.
 *
 * Usage:
 * const ref = useScrollReveal<HTMLDivElement>();
 * return <div ref={ref} className="scroll-reveal">...</div>;
 *
 * Le CSS associé (dans globals.css):
 * .scroll-reveal { opacity: 0; transform: translateY(24px); transition: all 0.6s ease-out; }
 * .scroll-reveal.revealed { opacity: 1; transform: translateY(0); }
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options?: { threshold?: number; rootMargin?: string }
) {
  const ref = React.useRef<T>(null);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect prefers-reduced-motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          observer.disconnect();
        }
      },
      {
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? "0px 0px -60px 0px",
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [options?.threshold, options?.rootMargin]);

  return { ref, revealed };
}

/**
 * Variantes de délai pour les staggered entrances.
 * Usage: style={{ transitionDelay: revealed ? `${index * 80}ms` : "0ms" }}
 */
export const STAGGER_DELAYS = [0, 80, 160, 240, 320, 400, 480, 560] as const;
