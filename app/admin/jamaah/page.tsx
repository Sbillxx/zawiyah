import AdminJamaah from './AdminJamaah';
import { getAllJamaah, getAllZawiyah, checkDbConnection } from '@/lib/data/ssot';
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

  const isFallbackMode = !conn.isConnected || isOfflineRequested;
  const jamaahList = await getAllJamaah(isFallbackMode);
  const zawiyahList = await getAllZawiyah(isFallbackMode);

  return <AdminJamaah jamaahList={jamaahList} zawiyahList={zawiyahList} />;
}
