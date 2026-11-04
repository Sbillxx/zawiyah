import { NextResponse } from 'next/server';
import { updateUserCredentials } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Sesi telah kedaluwarsa. Silakan login kembali.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { currentPassword, newPassword, newUsername, newNoTelp } = body;

    if (!currentPassword) {
      return NextResponse.json(
        { success: false, message: 'Kata sandi saat ini wajib diisi untuk verifikasi keamanan.' },
        { status: 400 }
      );
    }

    const result = await updateUserCredentials(
      user.id,
      currentPassword,
      newPassword,
      newUsername,
      newNoTelp
    );

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    console.error('Error changing credentials:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Gagal memperbarui kredensial akun.',
      },
      { status: 400 }
    );
  }
}

