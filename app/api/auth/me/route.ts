import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import { SECRET_KEY } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('zawiyah_session')?.value;

    if (!token) {
      return NextResponse.json({ success: false, user: null }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);

    return NextResponse.json({
      success: true,
      user: {
        id: payload.id,
        username: payload.username,
        nama_lengkap: payload.nama_lengkap,
        email: payload.email,
        role: payload.role,
        zawiyah_id: payload.zawiyah_id,
        divisi_id: payload.divisi_id,
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, user: null }, { status: 401 });
  }
}
