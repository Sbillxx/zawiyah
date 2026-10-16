import { NextResponse } from 'next/server';
import { findUserForAuth, recordAuditLog } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'zawiyah-super-secret-key-idrisiyyah-2025-v1'
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    // 1. Query user from MySQL database
    const user = await findUserForAuth(username);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Username tidak ditemukan di database.' },
        { status: 401 }
      );
    }

    if (user.status !== 'Aktif') {
      return NextResponse.json(
        { success: false, message: 'Akun Anda sedang dinonaktifkan.' },
        { status: 403 }
      );
    }

    // 2. Verify password with bcrypt
    const isPasswordValid = await bcrypt.compare(String(password), user.password_hash);
    if (!isPasswordValid) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi tidak sesuai.' },
        { status: 401 }
      );
    }

    // 3. Create JWT Session
    const token = await new SignJWT({
      id: user.id,
      username: user.username,
      nama_lengkap: user.nama_lengkap,
      email: user.email,
      role: user.role,
      zawiyah_id: user.zawiyah_id,
      divisi_id: user.divisi_id,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(SECRET_KEY);

    // 4. Set HttpOnly Cookie
    const cookieStore = await cookies();
    cookieStore.set('zawiyah_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    // 5. Audit Log in MySQL
    await recordAuditLog(
      user.id,
      user.username,
      'LOGIN',
      'users',
      `Login berhasil dari role: ${user.role} (${user.nama_lengkap})`
    );

    return NextResponse.json({
      success: true,
      message: 'Login berhasil.',
      user: {
        id: user.id,
        username: user.username,
        nama_lengkap: user.nama_lengkap,
        email: user.email,
        role: user.role,
        zawiyah_id: user.zawiyah_id,
        divisi_id: user.divisi_id,
      },
    });
  } catch (error: any) {
    console.error('API Login Error:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server saat login: ' + error.message },
      { status: 500 }
    );
  }
}
