import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/lib/db';
import { getSessionUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const allowOffline = searchParams.get('offline') === 'true';
    const isGlobal = searchParams.get('global') === 'true';
    const isScoped = searchParams.get('scoped') === 'true';

    // Only scope if explicitly requested via parameter or scoped=true for admin
    let targetZawiyahId = searchParams.get('zawiyah_id') || undefined;
    if (!isGlobal && isScoped && !targetZawiyahId) {
      const user = await getSessionUser();
      if (user?.role === 'ADMIN_ZAWIYAH' && user.zawiyah_id) {
        targetZawiyahId = user.zawiyah_id;
      }
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
