import { NextRequest, NextResponse } from 'next/server';
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
        },
      },
    );

    const data = (await resBackend.json()) as ApiResponse<AuthTokenDTO>;

    const response = NextResponse.json(data, {
      status: resBackend.status,
    });

    // ❌ échec refresh → on clean proprement
    if (!resBackend.ok || !data.success) {
      response.cookies.set('auth_session', '', { maxAge: 0 });
      response.cookies.set('refreshToken', '', { maxAge: 0 });
      return response;
    }

    // ✅ IMPORTANT : gestion correcte des cookies
    const setCookie = resBackend.headers.get('set-cookie');

    if (setCookie) {
      // Next.js ne gère pas bien les multi-cookies dans headers
      // donc on évite de forward brut
      response.headers.append('set-cookie', setCookie);
    }

    return response;
  } catch (error) {
    console.error('BFF Refresh error:', error);

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