import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Masuk — Portal Zawiyah Idrisiyyah',
  description: 'Portal akses manajemen kejamaahan dan cabang Zawiyah Idrisiyyah',
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
