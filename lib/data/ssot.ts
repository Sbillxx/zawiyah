import {
  getAllJamaah as getAllJamaahDb,
  getAllZawiyah as getAllZawiyahDb,
  getDashboardStats as getDashboardStatsDb,
  getUsersList as getUsersListDb,
  getAllDonatur as getAllDonaturDb,
  checkDbConnection as checkDbConnectionDb,
  FALLBACK_STATS,
  FALLBACK_ZAWIYAH,
  FALLBACK_USERS,
  type Jamaah,
  type Zawiyah,
  type DashboardStats,
  type UserAccount,
  type Donatur,
} from '../db';

export type { Jamaah, Zawiyah, DashboardStats, UserAccount, Donatur };

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

export async function getAllDonatur(): Promise<Donatur[]> {
  return await getAllDonaturDb();
}

export { FALLBACK_STATS, FALLBACK_ZAWIYAH, FALLBACK_USERS };
