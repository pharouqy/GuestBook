/**
 * @file app/(admin)/admin/page.tsx
 * @description Dashboard admin — liste de tous les messages à modérer.
 * 
 * SERVER COMPONENT pour le SEO et l'en-tête de page.
 * Renders the AdminDashboard Client Component for all dynamic moderation actions.
 */

import type { Metadata } from 'next';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const metadata: Metadata = {
  title: 'Dashboard Admin',
};

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl animate-fade-in">
        <AdminDashboard />
      </div>
    </div>
  );
}
