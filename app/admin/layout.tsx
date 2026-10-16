import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portal Admin — Zawiyah Idrisiyyah',
  description: 'Dashboard manajemen kejamaahan Zawiyah Idrisiyyah',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children;
}
