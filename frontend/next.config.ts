import type { NextConfig } from 'next';

const API_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:4000';
const API_VERSION = process.env.API_VERSION ?? 'v1';

const nextConfig: NextConfig = {
  // Rewrites : le frontend proxifie les appels API vers le backend Express
  // En production, le backend est derrière ce proxy — jamais exposé directement
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: `${API_URL}/api/${API_VERSION}/:path*`,
      },
    ];
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Optimisations
  compress: true,
  poweredByHeader: false, // Masque "X-Powered-By: Next.js" (sécurité par obscurité)

  // TypeScript et ESLint stricts en CI
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
