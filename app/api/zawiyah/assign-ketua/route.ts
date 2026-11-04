import { NextResponse } from 'next/server';
import { assignKetuaZawiyah } from '@/lib/db';
import { verifySuperAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const auth = await verifySuperAdmin();
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        {
          success: false,
          message: auth.error || 'Akses ditolak. Hanya Super Admin / MK yang dapat menunjuk Ketua Zawiyah.',
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { zawiyah_id, jamaah_id } = body;

    if (!zawiyah_id || !jamaah_id) {
      return NextResponse.json(
        {
          success: false,
          message: 'Parameter zawiyah_id dan jamaah_id wajib disertakan.',
        },
        { status: 400 }
      );
    }

    const result = await assignKetuaZawiyah(zawiyah_id, jamaah_id, {
      id: auth.user.id,
      username: auth.user.username,
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil menunjuk ${result.jamaah.nama} sebagai Ketua ${result.zawiyah.nama}.`,
      data: result,
    });
  } catch (error: any) {
    console.error('Error assigning ketua zawiyah:', error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || 'Gagal menunjuk Ketua Zawiyah.',
      },
      { status: 500 }
    );
  }
}

