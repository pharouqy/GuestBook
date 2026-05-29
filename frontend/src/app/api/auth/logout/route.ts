/**
 * @file api/auth/logout/route.ts
 * @description BFF Route Handler pour la déconnexion admin.
 * 
 * Appelle le logout sur le backend pour détruire le cookie de refresh,
 * et nettoie les cookies locaux du navigateur client (auth_session, refreshToken).
 */

import { NextRequest, NextResponse } from 'next/server';
import { splitCookiesString } from 'set-cookie-parser';

const API_URL = process.env['API_URL'] ?? 'http://localhost:4000';
const API_VERSION = 'v1';

export async function POST(request: NextRequest) {
  try {
    const cookiesHeader = request.headers.get('cookie') ?? '';

    // Déconnexion sur le backend Express
    const resBackend = await fetch(`${API_URL}/api/${API_VERSION}/auth/logout`, {
      method: 'POST',
      headers: {
        cookie: cookiesHeader,
      },
    });

    const response = NextResponse.json({ success: true, message: 'Déconnexion réussie' });

    // Nettoyage local des cookies côté client Next.js
    response.cookies.delete('auth_session');

    // Propager la suppression des cookies du backend (qui propage clearCookie)
    const setCookieHeader = resBackend.headers.get('set-cookie');
    if (setCookieHeader) {
      for (const cookie of splitCookiesString(setCookieHeader)) {
        response.headers.append('Set-Cookie', cookie);
      }
    } else {
      response.cookies.set('refreshToken', '', { maxAge: 0, path: '/api/auth' });
    }

    return response;
  } catch (error) {
    console.error('BFF Logout error:', error);
    // Force la déconnexion locale même en cas d'erreur de communication backend
    const response = NextResponse.json(
      { success: true, message: 'Déconnexion locale forcée' },
      { status: 200 },
    );
    response.cookies.delete('auth_session');
    response.cookies.set('refreshToken', '', { maxAge: 0, path: '/api/auth' });
    return response;
  }
}
