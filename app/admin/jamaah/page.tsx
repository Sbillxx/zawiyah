import AdminJamaah from './AdminJamaah';
import { getAllJamaah, getAllZawiyah, checkDbConnection, type Jamaah, type Zawiyah } from '@/lib/data/ssot';
import { getSessionUser } from '@/lib/auth';
import DatabaseErrorView from '@/app/components/DatabaseErrorView';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: Promise<{ offline?: string }>;
}

export default async function JamaahPage(props: Props) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isOfflineRequested = searchParams?.offline === 'true';

  const conn = await checkDbConnection();

  if (!conn.isConnected && !isOfflineRequested) {
    return (
      <DatabaseErrorView
        error={conn.error || 'Tidak dapat terhubung ke server basis data'}
        returnUrl="/admin/jamaah"
        allowOfflineBypass={true}
      />
    );
  }

  // Check current session
  const currentUser = await getSessionUser();
  const targetZawiyahId =
    currentUser?.role === 'ADMIN_ZAWIYAH' && currentUser.zawiyah_id
      ? currentUser.zawiyah_id
      : undefined;

  const isFallbackMode = !conn.isConnected || isOfflineRequested;
  let jamaahList: Jamaah[] = [];
  let zawiyahList: Zawiyah[] = [];

  try {
    jamaahList = await getAllJamaah(isFallbackMode, targetZawiyahId);
    zawiyahList = await getAllZawiyah(isFallbackMode);
  } catch (err: any) {
    console.warn('MySQL load error in JamaahPage, fallback:', err?.message);
    jamaahList = await getAllJamaah(true, targetZawiyahId);
    zawiyahList = await getAllZawiyah(true);
  }

  return (
    <AdminJamaah
      jamaahList={jamaahList}
      zawiyahList={zawiyahList}
      currentUser={currentUser}
    />
  );
}
