import { NextResponse } from 'next/server';
import { getUsersList, pool, FALLBACK_USERS } from '@/lib/db';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await getUsersList(false);
    return NextResponse.json({
      success: true,
      database: 'MySQL (dashboard_zawiyah)',
      isOffline: false,
      total: users.length,
      users,
    });
  } catch (error: any) {
    // When MySQL is offline, return fallback snapshot so client UI still functions gracefully
    return NextResponse.json({
      success: true,
      database: 'Offline Snapshot',
      isOffline: true,
      error: error.message,
      total: FALLBACK_USERS.length,
      users: FALLBACK_USERS,
    });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, nama_lengkap, email, password, role, zawiyah_id, divisi_id } = body;

    if (!username || !password || !nama_lengkap || !role) {
      return NextResponse.json(
        { success: false, message: 'Username, password, nama lengkap, dan role wajib diisi.' },
        { status: 400 }
      );
    }

    // Check duplicate
    const [existing]: any = await pool.query('SELECT id FROM users WHERE username = ?', [username.trim()]);
    if (existing && existing.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Username sudah digunakan.' },
        { status: 409 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const [result]: any = await pool.query(
      `INSERT INTO users (username, nama_lengkap, email, password_hash, role, zawiyah_id, divisi_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Aktif')`,
      [username.trim(), nama_lengkap.trim(), email?.trim() || null, passwordHash, role, zawiyah_id || null, divisi_id || null]
    );

    return NextResponse.json({
      success: true,
      message: 'Akun berhasil ditambahkan ke database MySQL.',
      userId: result.insertId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Gagal membuat akun. Pastikan MySQL di XAMPP aktif: ' + error.message },
      { status: 500 }
    );
  }
}
