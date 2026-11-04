import type { Metadata } from 'next';
import { AdminBottomNav } from '@/app/components/AdminBottomNav';
import { getSessionUser } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Portal Admin — Zawiyah Idrisiyyah',
  description: 'Dashboard manajemen kejamaahan Zawiyah Idrisiyyah',
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getSessionUser();

  return (
    <>
      {children}
      <AdminBottomNav initialUser={currentUser} />
    </>
  );
}
