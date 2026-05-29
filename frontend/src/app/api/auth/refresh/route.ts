import { NextRequest, NextResponse } from 'next/server';
import { splitCookiesString } from 'set-cookie-parser';
import type { ApiResponse, AuthTokenDTO } from '@guestbook/shared';

const API_URL = process.env.API_URL ?? 'http://localhost:4000';
const API_VERSION = 'v1';

export async function POST(request: NextRequest) {
  try {
    const cookie = request.headers.get('cookie') ?? '';

    const resBackend = await fetch(
      `${API_URL}/api/${API_VERSION}/auth/refresh`,
      {
        method: 'POST',
        headers: {
          cookie,
          // Assure-toi que le content-type est correct si le backend l'exige
          'Content-Type': 'application/json',
        },
      },
    );

    const data = (await resBackend.json()) as ApiResponse<AuthTokenDTO>;

    const response = NextResponse.json(data, {
      status: resBackend.status,
    });

    // ❌ Refresh échoué → nettoyage des cookies
    if (!resBackend.ok || !data.success) {
      response.cookies.set('auth_session', '', { maxAge: 0, path: '/' });
      response.cookies.set('refreshToken', '', { maxAge: 0, path: '/api/auth' });
      return response;
    }

    // ✅ Forward propre des cookies du backend vers le client
    const setCookieHeader = resBackend.headers.get('set-cookie');

    if (setCookieHeader) {
      const cookies = splitCookiesString(setCookieHeader);
      for (const c of cookies) {
        response.headers.append('Set-Cookie', c);
      }
    }

    return response;
  } catch (error) {
    console.error('[BFF /refresh] Erreur interne:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Erreur BFF interne lors du rafraîchissement',
        },
      },
      { status: 500 },
    );
  }
}
