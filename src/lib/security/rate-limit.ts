import "server-only";

/**
 * Rate limiting simple en mémoire (par IP).
 *
 * Adapté à Vercel serverless : chaque instance garde son propre compteur.
 * Pour une protection plus robuste en production, envisager Upstash Redis
 * (distributed rate limiting). Mais pour un SaaS à échelle modérée, ce
 * rate limiting in-memory suffit à bloquer les attaques basiques.
 *
 * Stratégie : sliding window approximée (on garde les timestamps récents).
 */

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

// Nettoyer les entrées expirées toutes les 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key);
    }
  }
}

/**
 * Vérifie si une requête est autorisée selon le rate limit.
 *
 * @param identifier - IP ou combinaison IP+route
 * @param maxRequests - Nombre max de requêtes dans la fenêtre
 * @param windowMs - Fenêtre en millisecondes
 * @returns { allowed: boolean; retryAfter: number } — retryAfter en secondes
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; retryAfter: number } {
  cleanup();

  const now = Date.now();
  const entry = store.get(identifier);

  if (!entry || entry.resetAt < now) {
    // Première requête ou fenêtre expirée
    store.set(identifier, {
      count: 1,
      resetAt: now + windowMs,
    });
    return { allowed: true, retryAfter: 0 };
  }

  entry.count++;

  if (entry.count > maxRequests) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  return { allowed: true, retryAfter: 0 };
}

/**
 * Extrait l'IP du client depuis les headers (Vercel / proxy).
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }
  return "unknown";
}

/**
 * Presets de rate limiting par type de route.
 */
export const RATE_LIMITS = {
  // Routes publiques (landing, activation) — anti-spam
  leadForm: { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5/heure
  activationVerify: { maxRequests: 10, windowMs: 60 * 60 * 1000 }, // 10/heure
  activationRegister: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3/heure
  signIn: { maxRequests: 10, windowMs: 15 * 60 * 1000 }, // 10/15min (anti brute-force)
} as const;
