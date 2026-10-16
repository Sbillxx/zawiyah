import {
  getAllJamaah as getAllJamaahDb,
  getAllZawiyah as getAllZawiyahDb,
  getDashboardStats as getDashboardStatsDb,
  getUsersList as getUsersListDb,
  checkDbConnection as checkDbConnectionDb,
  FALLBACK_STATS,
  FALLBACK_ZAWIYAH,
  FALLBACK_USERS,
  type Jamaah,
  type Zawiyah,
  type DashboardStats,
  type UserAccount,
} from '../db';

export type { Jamaah, Zawiyah, DashboardStats, UserAccount };

export async function checkDbConnection() {
  return await checkDbConnectionDb();
}

/**
 * Single Source of Truth — Sourced directly from MySQL (dashboard_zawiyah)
 */
export async function getAllJamaah(allowFallback = false): Promise<Jamaah[]> {
  return await getAllJamaahDb(allowFallback);
}

export async function getAllZawiyah(allowFallback = false): Promise<Zawiyah[]> {
  return await getAllZawiyahDb(allowFallback);
}

export async function getDashboardStats(allowFallback = false): Promise<DashboardStats> {
  return await getDashboardStatsDb(allowFallback);
}

export async function getUsersList(allowFallback = false): Promise<UserAccount[]> {
  return await getUsersListDb(allowFallback);
}

export { FALLBACK_STATS, FALLBACK_ZAWIYAH, FALLBACK_USERS };
