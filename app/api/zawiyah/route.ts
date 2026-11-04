import { NextResponse } from 'next/server';
import { getAllZawiyah, createZawiyah, updateZawiyah, deleteZawiyah } from '@/lib/db';
import { verifySuperAdmin, verifyAdminAuth } from '@/lib/auth';

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
        hint: 'Nyalakan modul MySQL di XAMPP / periksa koneksi TiDB Cloud.',
      },
      { status: 503 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await verifySuperAdmin();
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Akses ditolak. Hanya Super Admin yang dapat menambah cabang baru.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.nama || !body.nama.trim() || !body.kota || !body.kota.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama cabang dan kota wajib diisi.' },
        { status: 400 }
      );
    }

    const newZawiyah = await createZawiyah(body, {
      id: auth.user.id,
      username: auth.user.username,
    });

    return NextResponse.json({
      success: true,
      message: `Zawiyah ${newZawiyah.nama} (${newZawiyah.id}) berhasil ditambahkan.`,
      data: newZawiyah,
    });
  } catch (error: any) {
    console.error('Error creating zawiyah:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menambahkan cabang zawiyah.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Akses ditolak.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID zawiyah wajib disertakan.' },
        { status: 400 }
      );
    }

    // Admin Zawiyah can update their own branch details (e.g. ketua zawiyah & contact)
    if (auth.isAdminZawiyah && auth.user.zawiyah_id !== id) {
      return NextResponse.json(
        { success: false, message: 'Anda hanya memiliki izin memperbarui profil zawiyah binaan Anda sendiri.' },
        { status: 403 }
      );
    }

    await updateZawiyah(id, updateData, {
      id: auth.user.id,
      username: auth.user.username,
    });

    return NextResponse.json({
      success: true,
      message: `Data cabang zawiyah (${id}) berhasil diperbarui.`,
    });
  } catch (error: any) {
    console.error('Error updating zawiyah:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui data zawiyah.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifySuperAdmin();
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Akses ditolak. Hanya Super Admin yang berhak menghapus cabang.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Parameter ID zawiyah wajib disertakan.' },
        { status: 400 }
      );
    }

    await deleteZawiyah(id, {
      id: auth.user.id,
      username: auth.user.username,
    });

    return NextResponse.json({
      success: true,
      message: `Cabang zawiyah (${id}) berhasil dihapus.`,
    });
  } catch (error: any) {
    console.error('Error deleting zawiyah:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menghapus cabang zawiyah.' },
      { status: 500 }
    );
  }
}
