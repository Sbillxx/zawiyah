import { redirect } from 'next/navigation';
import AdminZawiyah from './AdminZawiyah';
import { getAllZawiyah, checkDbConnection, type Zawiyah } from '@/lib/data/ssot';
import { getSessionUser } from '@/lib/auth';
import DatabaseErrorView from '@/app/components/DatabaseErrorView';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: Promise<{ offline?: string }>;
}

export default async function ZawiyahPage(props: Props) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isOfflineRequested = searchParams?.offline === 'true';

  const currentUser = await getSessionUser();

  // Ketua / Admin Zawiyah hanya mengelola cabangnya sendiri dari dashboard,
  // tidak memiliki akses ke master data 86 cabang zawiyah se-nusantara.
  if (currentUser?.role === 'ADMIN_ZAWIYAH') {
    redirect('/admin');
  }

  const conn = await checkDbConnection();

  if (!conn.isConnected && !isOfflineRequested) {
    return (
      <DatabaseErrorView
        error={conn.error || 'Tidak dapat terhubung ke server basis data'}
        returnUrl="/admin/zawiyah"
        allowOfflineBypass={true}
      />
    );
  }

  const isFallbackMode = !conn.isConnected || isOfflineRequested;
  let zawiyahList: Zawiyah[] = [];

  try {
    zawiyahList = await getAllZawiyah(isFallbackMode);
  } catch (err: any) {
    console.warn('MySQL load error in ZawiyahPage, fallback:', err?.message);
    zawiyahList = await getAllZawiyah(true);
  }

  return <AdminZawiyah zawiyahList={zawiyahList} currentUser={currentUser} />;
}
