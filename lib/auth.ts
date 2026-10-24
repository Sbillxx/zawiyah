import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'zawiyah-super-secret-key-idrisiyyah-2025-v1'
);

export interface SessionUser {
  id: number;
  username: string;
  nama_lengkap: string;
  email: string;
  role: string;
  zawiyah_id?: string | null;
  divisi_id?: string | null;
}

/**
 * Retrieve current authenticated session from httpOnly cookie 'zawiyah_session'
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('zawiyah_session')?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      id: Number(payload.id),
      username: String(payload.username || ''),
      nama_lengkap: String(payload.nama_lengkap || ''),
      email: String(payload.email || ''),
      role: String(payload.role || ''),
      zawiyah_id: (payload.zawiyah_id as string) || null,
      divisi_id: (payload.divisi_id as string) || null,
    };
  } catch {
    return null;
  }
}

/**
 * Verify if the caller is authorized as Super Admin (or has valid admin role)
 */
export async function verifySuperAdmin(): Promise<{
  authorized: boolean;
  user: SessionUser | null;
  error?: string;
}> {
  const user = await getSessionUser();

  // If no session exists in development, fallback to default superadmin for smooth local dev
  if (!user) {
    if (process.env.NODE_ENV !== 'production') {
      return {
        authorized: true,
        user: {
          id: 1,
          username: 'superadmin',
          nama_lengkap: 'Super Admin Yayasan (Dev)',
          email: 'admin@idrisiyyah.org',
          role: 'SUPER_ADMIN',
          zawiyah_id: null,
          divisi_id: null,
        },
      };
    }
    return {
      authorized: false,
      user: null,
      error: 'Anda belum login atau sesi telah kedaluwarsa.',
    };
  }

  if (user.role !== 'SUPER_ADMIN') {
    return {
      authorized: false,
      user,
      error: 'Hanya Super Admin yang berhak melakukan operasi ini.',
    };
  }

  return { authorized: true, user };
}
