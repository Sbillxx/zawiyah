import AdminDashboard from './AdminDashboard';
import { getDashboardStats, getAllZawiyah, checkDbConnection, type DashboardStats, type Zawiyah } from '@/lib/data/ssot';
import { getSessionUser } from '@/lib/auth';
import DatabaseErrorView from '../components/DatabaseErrorView';

export const dynamic = 'force-dynamic';

interface Props {
  searchParams?: Promise<{ offline?: string }>;
}

export default async function AdminPage(props: Props) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isOfflineRequested = searchParams?.offline === 'true';

  // 1. Health check database connection
  const conn = await checkDbConnection();

  // If DB is offline and user hasn't explicitly chosen offline mode, render DatabaseErrorView
  if (!conn.isConnected && !isOfflineRequested) {
    return (
      <DatabaseErrorView
        error={conn.error || 'Tidak dapat terhubung ke server basis data MySQL (dashboard_zawiyah)'}
        returnUrl="/admin"
        allowOfflineBypass={true}
      />
    );
  }

  // 2. Check current session
  const currentUser = await getSessionUser();
  const targetZawiyahId =
    currentUser?.role === 'ADMIN_ZAWIYAH' && currentUser.zawiyah_id
      ? currentUser.zawiyah_id
      : undefined;

  // 3. Load data with fail-safe resilience
  const isFallbackMode = !conn.isConnected || isOfflineRequested;
  let stats: DashboardStats;
  let zawiyahList: Zawiyah[] = [];
  let isOffline = isFallbackMode;

  try {
    stats = await getDashboardStats(isFallbackMode, targetZawiyahId);
    zawiyahList = await getAllZawiyah(isFallbackMode);
  } catch (err: any) {
    console.warn('MySQL load error in AdminPage, safely using fallback snapshot:', err?.message);
    stats = await getDashboardStats(true, targetZawiyahId);
    zawiyahList = await getAllZawiyah(true);
    isOffline = true;
  }

  return (
    <AdminDashboard
      stats={stats}
      zawiyahList={zawiyahList}
      currentUser={currentUser}
      isOfflineMode={isOffline}
    />
  );
}
