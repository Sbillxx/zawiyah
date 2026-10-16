import { NextResponse } from 'next/server';
import { getAllZawiyah } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const allowOffline = searchParams.get('offline') === 'true';

    const data = await getAllZawiyah(allowOffline);
    return NextResponse.json({
      success: true,
      database: 'MySQL (dashboard_zawiyah)',
      total: data.length,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        isDatabaseOffline: true,
        hint: 'Nyalakan modul MySQL di XAMPP Control Panel.',
      },
      { status: 503 }
    );
  }
}
