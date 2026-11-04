import AdminDonatur from './AdminDonatur';
import { getAllDonatur, checkDbConnection } from '@/lib/data/ssot';
import DatabaseErrorView from '@/app/components/DatabaseErrorView';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: Promise<{ offline?: string }>;
}

export default async function DonaturPage(props: Props) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isOfflineRequested = searchParams?.offline === 'true';

  const conn = await checkDbConnection();

  if (!conn.isConnected && !isOfflineRequested) {
    return (
      <DatabaseErrorView
        error={conn.error || 'Tidak dapat terhubung ke server basis data'}
        returnUrl="/admin/donatur"
        allowOfflineBypass={true}
      />
    );
  }

  const donaturList = await getAllDonatur();

  return <AdminDonatur donaturList={donaturList} />;
}
