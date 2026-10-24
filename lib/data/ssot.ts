import {
  getAllJamaah as getAllJamaahDb,
  getAllZawiyah as getAllZawiyahDb,
  getDashboardStats as getDashboardStatsDb,
  getUsersList as getUsersListDb,
  getAllDonatur as getAllDonaturDb,
  checkDbConnection as checkDbConnectionDb,
  createJamaah as createJamaahDb,
  updateJamaah as updateJamaahDb,
  deleteJamaah as deleteJamaahDb,
  createZawiyah as createZawiyahDb,
  updateZawiyah as updateZawiyahDb,
  deleteZawiyah as deleteZawiyahDb,
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

export async function createJamaah(data: Partial<Jamaah> & { nama: string }, auditUser?: { id: number; username: string }) {
  return await createJamaahDb(data, auditUser);
}

export async function updateJamaah(id: string, data: Partial<Jamaah>, auditUser?: { id: number; username: string }) {
  return await updateJamaahDb(id, data, auditUser);
}

export async function deleteJamaah(id: string, softDelete = true, auditUser?: { id: number; username: string }) {
  return await deleteJamaahDb(id, softDelete, auditUser);
}

export async function getAllZawiyah(allowFallback = false): Promise<Zawiyah[]> {
  return await getAllZawiyahDb(allowFallback);
}

export async function createZawiyah(data: { nama: string; tipe?: string; kota: string; pengurus?: string }, auditUser?: { id: number; username: string }) {
  return await createZawiyahDb(data, auditUser);
}

export async function updateZawiyah(id: string, data: Partial<Zawiyah>, auditUser?: { id: number; username: string }) {
  return await updateZawiyahDb(id, data, auditUser);
}

export async function deleteZawiyah(id: string, auditUser?: { id: number; username: string }) {
  return await deleteZawiyahDb(id, auditUser);
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

