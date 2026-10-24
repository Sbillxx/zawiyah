import { NextResponse } from 'next/server';
import { getAllJamaah, createJamaah, updateJamaah, deleteJamaah } from '@/lib/db';
import { verifySuperAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');
    const allowOffline = searchParams.get('offline') === 'true';

    let data = await getAllJamaah(allowOffline);
    if (limit) {
      data = data.slice(0, parseInt(limit, 10));
    }
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
        { success: false, message: auth.error || 'Akses ditolak.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    if (!body.nama || !body.nama.trim()) {
      return NextResponse.json(
        { success: false, message: 'Nama jamaah wajib diisi.' },
        { status: 400 }
      );
    }

    const newJamaah = await createJamaah(body, {
      id: auth.user.id,
      username: auth.user.username,
    });

    return NextResponse.json({
      success: true,
      message: `Jamaah ${newJamaah.nama} (${newJamaah.id}) berhasil ditambahkan.`,
      data: newJamaah,
    });
  } catch (error: any) {
    console.error('Error creating jamaah:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal menambahkan jamaah.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await verifySuperAdmin();
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
        { success: false, message: 'ID jamaah wajib disertakan.' },
        { status: 400 }
      );
    }

    await updateJamaah(id, updateData, {
      id: auth.user.id,
      username: auth.user.username,
    });

    return NextResponse.json({
      success: true,
      message: `Data jamaah (${id}) berhasil diperbarui.`,
    });
  } catch (error: any) {
    console.error('Error updating jamaah:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memperbarui data jamaah.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = await verifySuperAdmin();
    if (!auth.authorized || !auth.user) {
      return NextResponse.json(
        { success: false, message: auth.error || 'Akses ditolak.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const hardDelete = searchParams.get('hard') === 'true';

    if (!id) {
      return NextResponse.json(
        { success: false, message: 'Parameter ID jamaah wajib disertakan.' },
        { status: 400 }
      );
    }

    await deleteJamaah(id, !hardDelete, {
      id: auth.user.id,
      username: auth.user.username,
    });

    return NextResponse.json({
      success: true,
      message: `Jamaah (${id}) berhasil ${hardDelete ? 'dihapus permanen' : 'dinonaktifkan'}.`,
    });
  } catch (error: any) {
    console.error('Error deleting jamaah:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Gagal memproses penghapusan jamaah.' },
      { status: 500 }
    );
  }
}
