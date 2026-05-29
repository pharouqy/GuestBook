/**
 * @file api/auth/login/route.ts
 * @description BFF Route Handler pour la connexion admin.
 * 
 * Reçoit les credentials en clair, les envoie au backend Express,
 * récupère et propage le cookie refreshToken (HttpOnly), et définit
 * le cookie auth_session pour le Middleware Next.js Edge.
 */

import { NextRequest, NextResponse } from 'next/server';
import type { ApiResponse, AuthTokenDTO } from '@guestbook/shared';

const API_URL = process.env['API_URL'] ?? 'http://localhost:4000';
const API_VERSION = 'v1';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const resBackend = await fetch(`${API_URL}/api/${API_VERSION}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = (await resBackend.json()) as ApiResponse<AuthTokenDTO>;

    if (!resBackend.ok || !data.success) {
      return NextResponse.json(data, { status: resBackend.status });
    }

    const response = NextResponse.json(data, { status: 200 });

    // Transmettre le cookie refreshToken reçu du backend vers le client
    const setCookieHeader = resBackend.headers.get('set-cookie');
    if (setCookieHeader) {
      response.headers.set('set-cookie', setCookieHeader);
    }

    // Définir le cookie de session court terme pour le Middleware Next.js
    response.cookies.set('auth_session', 'true', {
      httpOnly: false, // Accessible par le Edge Middleware
      secure: process.env['NODE_ENV'] === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60, // 7 jours (calqué sur le Refresh Token)
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('BFF Login error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur BFF interne lors de la connexion',
        },
      },
      { status: 500 },
    );
  }
}
