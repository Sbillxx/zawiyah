import { NextResponse } from 'next/server';
import { getAllDonatur } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const search = searchParams.get('q')?.toLowerCase();

    let data = await getAllDonatur();

    if (search) {
      data = data.filter(d =>
        d.nama.toLowerCase().includes(search) ||
        d.id.toLowerCase().includes(search) ||
        (d.telepon && d.telepon.includes(search)) ||
        (d.alamat && d.alamat.toLowerCase().includes(search)) ||
        (d.zawiyah_nama && d.zawiyah_nama.toLowerCase().includes(search))
      );
    }

    if (limit) {
      data = data.slice(0, parseInt(limit, 10));
    }

    return NextResponse.json({
      success: true,
      database: 'MySQL (dashboard_zawiyah)',
      kantor_wilayah: 'Kanwakil Jawa Barat',
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
