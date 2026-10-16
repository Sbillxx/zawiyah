import AdminZawiyah from './AdminZawiyah';
import { getAllZawiyah, checkDbConnection } from '@/lib/data/ssot';
import DatabaseErrorView from '@/app/components/DatabaseErrorView';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: Promise<{ offline?: string }>;
}

export default async function ZawiyahPage(props: Props) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isOfflineRequested = searchParams?.offline === 'true';

  const conn = await checkDbConnection();

  if (!conn.isConnected && !isOfflineRequested) {
    return (
      <DatabaseErrorView
        error={conn.error || 'Tidak dapat terhubung ke MySQL 127.0.0.1:3306 (dashboard_zawiyah)'}
        returnUrl="/admin/zawiyah"
        allowOfflineBypass={true}
      />
    );
  }

  const isFallbackMode = !conn.isConnected || isOfflineRequested;
  const zawiyahList = await getAllZawiyah(isFallbackMode);

  return <AdminZawiyah zawiyahList={zawiyahList} />;
}
