import { NextResponse } from 'next/server';
import { searchJamaahForKetua } from '@/lib/db';
import { verifySuperAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const auth = await verifySuperAdmin();
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, message: 'Hanya admin yang berhak mencari data jamaah.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const data = await searchJamaahForKetua(query, limit);

    return NextResponse.json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error: any) {
    console.error('Error searching jamaah:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal mencari data jamaah.' },
      { status: 500 }
    );
  }
}

