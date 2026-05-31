import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Livre d'Or",
    template: "%s | Livre d'Or",
  },
  description:
    "Partagez vos messages et découvrez ce que les visiteurs ont écrit dans notre livre d'or.",
  keywords: ["livre d'or", 'guestbook', 'messages', 'visiteurs'],
  authors: [{ name: 'Guestbook Team' }],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    title: "Livre d'Or",
    description: "Partagez vos messages dans notre livre d'or.",
    siteName: "Livre d'Or",
  },
};

import ThemeToggle from '@/components/ui/ThemeToggle';
import ThemeInitializer from '@/components/ui/ThemeInitializer';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeInitializer />
        <ThemeToggle className="fixed top-4 right-4 z-50" />
        {children}
      </body>
    </html>
  );
}
