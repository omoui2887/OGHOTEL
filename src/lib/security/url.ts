/**
 * Utilitaires de sécurité pour la validation d'URLs.
 *
 * Empêche les attaques SSRF (Server-Side Request Forgery) en restreignant
 * les URLs acceptées à HTTPS + domaines publics (pas d'IPs privées, pas de
 * localhost, pas de metadata cloud).
 */

/**
 * Vérifie qu'une URL est sûre pour un fetch côté serveur.
 *
 * Règles :
 * - Doit être HTTPS (pas http, file, ftp, etc.)
 * - Le hostname ne doit PAS être une IP privée / localhost / metadata
 *
 * @returns true si l'URL est sûre, false sinon
 */
export function isSafeUrl(rawUrl: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return false;
  }

  // Schéma : HTTPS uniquement
  if (parsed.protocol !== "https:") {
    return false;
  }

  const hostname = parsed.hostname.toLowerCase();

  // Bloquer localhost et loopback
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return false;
  }

  // Bloquer metadata cloud (AWS IMDS, GCP, Azure)
  if (hostname === "169.254.169.254" || hostname === "metadata.google.internal") {
    return false;
  }

  // Bloquer les plages d'IPs privées (IPv4)
  const ipMatch = hostname.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (ipMatch) {
    const a = parseInt(ipMatch[1], 10);
    const b = parseInt(ipMatch[2], 10);
    // 10.0.0.0/8
    if (a === 10) return false;
    // 172.16.0.0/12
    if (a === 172 && b >= 16 && b <= 31) return false;
    // 192.168.0.0/16
    if (a === 192 && b === 168) return false;
    // 127.0.0.0/8 (loopback, déjà couvert mais au cas où)
    if (a === 127) return false;
    // 169.254.0.0/16 (link-local, inclut AWS metadata)
    if (a === 169 && b === 254) return false;
    // 0.0.0.0/8
    if (a === 0) return false;
  }

  return true;
}
