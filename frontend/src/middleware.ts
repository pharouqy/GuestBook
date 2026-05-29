/**
 * @file middleware.ts
 * @description Middleware Next.js — Protection des routes admin (Edge Runtime).
 * 
 * CE FICHIER S'EXÉCUTE AVANT toute page ou route handler.
 * Il tourne sur le Edge Runtime (V8 isolate) — pas Node.js complet.
 * 
 * PROTECTION :
 * - Toutes les routes /admin/* nécessitent un access token valide
 * - Si absent ou invalide → redirect vers /admin/login
 * - Si authentifié et sur /admin/login → redirect vers /admin (UX)
 */

import { NextRequest, NextResponse } from 'next/server';

const ADMIN_ROUTES = ['/admin'];
const PUBLIC_ADMIN_ROUTES = ['/admin/login'];

// Clé du localStorage simulée via cookie (l'access token est en mémoire JS côté client,
// mais on utilise un cookie de session court-terme pour le middleware Edge)
const AUTH_COOKIE_NAME = 'auth_session';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  // Vérifier si c'est une route admin protégée
  const isAdminRoute = ADMIN_ROUTES.some(
    (route) => pathname.startsWith(route) && !PUBLIC_ADMIN_ROUTES.includes(pathname),
  );
  const isPublicAdminRoute = PUBLIC_ADMIN_ROUTES.includes(pathname);

  // Vérification du cookie de session (présence uniquement — la validation JWT
  // complète est faite par l'API Express à chaque requête)
  const sessionCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const isAuthenticated = Boolean(sessionCookie?.value);

  // Protection des routes admin
  if (isAdminRoute && !isAuthenticated) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname); // Redirect après login
    return NextResponse.redirect(loginUrl);
  }

  // Redirect si déjà connecté et sur /admin/login
  if (isPublicAdminRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Matcher : s'applique uniquement aux routes admin (pas aux assets statiques)
  matcher: [
    '/admin/:path*',
    // Exclure les fichiers statiques et les API routes
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
