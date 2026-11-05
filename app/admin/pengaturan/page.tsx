import { redirect } from 'next/navigation';
import AdminPengaturan from './AdminPengaturan';
import { getAllZawiyah, checkDbConnection, type Zawiyah } from '@/lib/data/ssot';
import { getSessionUser } from '@/lib/auth';
import DatabaseErrorView from '@/app/components/DatabaseErrorView';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: Promise<{ offline?: string }>;
}

export default async function PengaturanPage(props: Props) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isOfflineRequested = searchParams?.offline === 'true';

  const currentUser = await getSessionUser();
  if (!currentUser) {
    redirect('/login');
  }

  const conn = await checkDbConnection();
  if (!conn.isConnected && !isOfflineRequested) {
    return (
      <DatabaseErrorView
        error={conn.error || 'Tidak dapat terhubung ke basis data'}
        returnUrl="/admin/pengaturan"
        allowOfflineBypass={true}
      />
    );
  }

  const isFallbackMode = !conn.isConnected || isOfflineRequested;
  let zawiyahList: Zawiyah[] = [];

  try {
    zawiyahList = await getAllZawiyah(isFallbackMode);
  } catch (err: any) {
    console.warn('MySQL load error in PengaturanPage, fallback:', err?.message);
    zawiyahList = await getAllZawiyah(true);
  }

  const activeZawiyah =
    zawiyahList.find((z) => z.id === currentUser.zawiyah_id) ||
    (currentUser.role === 'ADMIN_ZAWIYAH' ? zawiyahList.find((z) => z.id === 'ZW-004') : null) ||
    zawiyahList[0] ||
    null;

  return (
    <AdminPengaturan
      currentUser={currentUser}
      activeZawiyah={activeZawiyah}
      zawiyahList={zawiyahList}
    />
  );
}

