import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const allowOffline = searchParams.get('offline') === 'true';

    // Check if logged in user has a specific zawiyah assigned
    const user = await getSessionUser();
    let targetZawiyahId = searchParams.get('zawiyah_id') || undefined;
    if (user?.role === 'ADMIN_ZAWIYAH' && user.zawiyah_id) {
      targetZawiyahId = user.zawiyah_id;
    }

    const stats = await getDashboardStats(allowOffline, targetZawiyahId);
    return NextResponse.json({
      success: true,
      database: 'MySQL (dashboard_zawiyah)',
      scopedZawiyahId: targetZawiyahId || null,
      stats,
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
