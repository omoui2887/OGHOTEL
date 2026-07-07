import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match toutes les requêtes sauf :
     * - les fichiers statiques (_next/static, _next/image, favicon, logo, robots)
     * - les fichiers publics avec extensions courantes
     */
    "/((?!_next/static|_next/image|favicon.ico|logo.svg|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
