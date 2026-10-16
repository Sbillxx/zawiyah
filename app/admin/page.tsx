import AdminDashboard from './AdminDashboard';
import { getDashboardStats, getAllZawiyah, getUsersList, checkDbConnection } from '@/lib/data/ssot';
import DatabaseErrorView from '../components/DatabaseErrorView';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: Promise<{ offline?: string }>;
}

export default async function AdminPage(props: Props) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isOfflineRequested = searchParams?.offline === 'true';

  // 1. Health check MySQL connection
  const conn = await checkDbConnection();

  // If DB is offline and user hasn't explicitly chosen offline mode, render DatabaseErrorView
  if (!conn.isConnected && !isOfflineRequested) {
    return (
      <DatabaseErrorView
        error={conn.error || 'Tidak dapat terhubung ke MySQL 127.0.0.1:3306 (dashboard_zawiyah)'}
        returnUrl="/admin"
        allowOfflineBypass={true}
      />
    );
  }

  // 2. Load data (safely using fallback snapshot if offline)
  const isFallbackMode = !conn.isConnected || isOfflineRequested;
  const stats = await getDashboardStats(isFallbackMode);
  const zawiyahList = await getAllZawiyah(isFallbackMode);
  const usersList = await getUsersList(isFallbackMode);

  return (
    <AdminDashboard
      stats={stats}
      zawiyahList={zawiyahList}
      usersList={usersList}
      isOfflineMode={isFallbackMode}
    />
  );
}
