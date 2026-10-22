import mysql from 'mysql2/promise';

export interface Jamaah {
  id: string;
  nama: string;
  zawiyah: string;
  jenisKelamin: string;
  statusPernikahan: string;
  tempatLahir: string;
  tanggalLahir: string;
  email: string;
  telepon: string;
  ktp: string;
  kk: string;
  alamat: string;
  pekerjaan: string;
  koperasi: string;
  agniaCare: string;
  status: string;
}

export interface Zawiyah {
  id: string;
  nama: string;
  tipe: string;
  kota: string;
  pengurus: string;
  jamaah: number;
  status?: string;
}

export interface Donatur {
  id: string;
  no_urut: number;
  nama: string;
  jenis_kelamin: string;
  kategori_donatur: 'Perorangan' | 'Lembaga / Usaha' | string;
  telepon: string | null;
  email: string | null;
  ktp: string | null;
  alamat: string | null;
  zawiyah_id: string | null;
  zawiyah_nama: string | null;
  parent_donatur: string | null;
  pekerjaan: string | null;
  kantor_wilayah: string;
  jamaah_id: string | null;
  status: string;
  created_at?: string;
}

export interface DashboardStats {
  totalJamaah: number;
  totalZawiyah: number;
  totalAgniaCare: number;
  totalLaki: number;
  totalPerempuan: number;
  totalKoperasi: number;
  totalAktif: number;
  totalDonatur?: number;
  topZawiyah: Zawiyah[];
  topPekerjaan: { label: string; count: number }[];
  pctLaki: number;
  pctPerempuan: number;
  pctAgniaCare: string;
  pctKoperasi: string;
}

export interface UserAccount {
  id: number;
  username: string;
  nama_lengkap: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN_EKSEKUTIF' | 'ADMIN_ZAWIYAH' | 'ADMIN_DIVISI' | string;
  zawiyah_id: string | null;
  divisi_id: string | null;
  status: string;
  created_at?: string;
}

export interface UserWithPassword extends UserAccount {
  password_hash: string;
}

// ----------------------------------------------------
// Custom Database Connection Error
// ----------------------------------------------------
export class DatabaseConnectionError extends Error {
  public code: string;
  public details: string;

  constructor(
    message = 'Tidak dapat terhubung ke server database MySQL (127.0.0.1:3306).',
    code = 'ECONNREFUSED',
    details = ''
  ) {
    super(message);
    this.name = 'DatabaseConnectionError';
    this.code = code;
    this.details = details;
  }
}

// ----------------------------------------------------
// 1. MySQL Pool Connection (phpMyAdmin / dashboard_zawiyah)
// ----------------------------------------------------
export const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'dashboard_zawiyah',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 8000,
  ssl: process.env.MYSQL_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

// Quick connection healthcheck
export async function checkDbConnection(): Promise<{ isConnected: boolean; error?: string }> {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return { isConnected: true };
  } catch (error: any) {
    return {
      isConnected: false,
      error: error?.message || 'Koneksi ke port 3306 gagal. Pastikan MySQL di XAMPP aktif.',
    };
  }
}

// ----------------------------------------------------
// 2. Safe Fallback Snapshot Data (For Offline Demo Mode)
// ----------------------------------------------------
export const FALLBACK_USERS: UserAccount[] = [
  { id: 1, username: 'superadmin', nama_lengkap: 'Super Admin Yayasan', email: 'admin@idrisiyyah.org', role: 'SUPER_ADMIN', zawiyah_id: null, divisi_id: null, status: 'Aktif' },
  { id: 2, username: 'eksekutif', nama_lengkap: 'BPH / Pimpinan Yayasan', email: 'pimpinan@idrisiyyah.org', role: 'ADMIN_EKSEKUTIF', zawiyah_id: null, divisi_id: null, status: 'Aktif' },
  { id: 3, username: 'admin_karawang', nama_lengkap: 'Ketua Zawiyah Karawang', email: 'karawang@idrisiyyah.org', role: 'ADMIN_ZAWIYAH', zawiyah_id: 'ZW-004', divisi_id: null, status: 'Aktif' },
  { id: 4, username: 'admin_agnia', nama_lengkap: 'Admin Agnia Care', email: 'agnia@idrisiyyah.org', role: 'ADMIN_DIVISI', zawiyah_id: null, divisi_id: 'div_sosial', status: 'Aktif' },
];

export const FALLBACK_ZAWIYAH: Zawiyah[] = [
  { id: 'ZW-001', nama: 'Zawiyah Pusat Tasikmalaya', tipe: 'Pusat', kota: 'Tasikmalaya', pengurus: 'Ust. Pengurus (Pusat Tasikmalaya)', jamaah: 946, status: 'Aktif' },
  { id: 'ZW-002', nama: 'Zawiyah Salopa Kabupaten Tasikmalaya', tipe: 'Cabang', kota: 'Tasikmalaya', pengurus: 'Ust. Pengurus (Salopa Kabupaten Tasikmalaya)', jamaah: 438, status: 'Aktif' },
  { id: 'ZW-003', nama: 'Zawiyah Tamansari Kota Tasikmalaya', tipe: 'Cabang', kota: 'Tasikmalaya', pengurus: 'Ust. Pengurus (Tamansari Kota Tasikmalaya)', jamaah: 300, status: 'Aktif' },
  { id: 'ZW-004', nama: 'Zawiyah Karawang', tipe: 'Cabang', kota: 'Karawang', pengurus: 'Ust. Pengurus (Karawang)', jamaah: 285, status: 'Aktif' },
  { id: 'ZW-005', nama: 'Zawiyah Bandung Raya', tipe: 'Cabang', kota: 'Bandung', pengurus: 'Ust. Pengurus (Bandung)', jamaah: 240, status: 'Aktif' },
];

export const FALLBACK_STATS: DashboardStats = {
  totalJamaah: 4209,
  totalZawiyah: 86,
  totalAgniaCare: 384,
  totalLaki: 2150,
  totalPerempuan: 2059,
  totalKoperasi: 512,
  totalAktif: 4209,
  topZawiyah: FALLBACK_ZAWIYAH,
  topPekerjaan: [
    { label: 'Wirausaha / Pedagang', count: 1240 },
    { label: 'Karyawan Swasta', count: 980 },
    { label: 'PNS / Guru / Dosen', count: 560 },
    { label: 'Petani / Peternak', count: 480 },
    { label: 'Ibu Rumah Tangga', count: 420 },
    { label: 'Lainnya', count: 529 },
  ],
  pctLaki: 51,
  pctPerempuan: 49,
  pctAgniaCare: '9.1',
  pctKoperasi: '12.2',
};

// ----------------------------------------------------
// 3. User Accounts (from MySQL table `users`)
// ----------------------------------------------------
export async function getUsersList(allowFallback = false): Promise<UserAccount[]> {
  try {
    const [rows]: any = await pool.query(`
      SELECT id, username, nama_lengkap, email, role, zawiyah_id, divisi_id, status, created_at
      FROM users
      ORDER BY id ASC
    `);
    return rows as UserAccount[];
  } catch (error: any) {
    if (allowFallback) {
      console.warn('MySQL unavailable, returning fallback users snapshot:', error?.message);
      return FALLBACK_USERS;
    }
    throw new DatabaseConnectionError(
      'Gagal mengambil daftar pengguna: Server MySQL tidak dapat dihubungi.',
      error?.code || 'ECONNREFUSED',
      error?.message
    );
  }
}

export async function findUserForAuth(username: string): Promise<UserWithPassword | null> {
  try {
    const [rows]: any = await pool.query(
      'SELECT id, username, nama_lengkap, email, password_hash, role, zawiyah_id, divisi_id, status FROM users WHERE username = ? LIMIT 1',
      [username.trim()]
    );
    if (rows && rows.length > 0) {
      return rows[0] as UserWithPassword;
    }
    return null;
  } catch (error: any) {
    throw new DatabaseConnectionError(
      'Server database MySQL sedang offline. Silakan nyalakan MySQL di XAMPP.',
      error?.code || 'ECONNREFUSED',
      error?.message
    );
  }
}

export async function recordAuditLog(
  userId: number,
  username: string,
  action: string,
  targetTable: string,
  detail: string,
  ipAddress?: string | null
) {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, username, action, target_table, detail, ip_address) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, username, action, targetTable, detail, ipAddress || null]
    );
  } catch (error) {
    console.warn('Audit log write error (non-fatal):', error);
  }
}

// ----------------------------------------------------
// 4. Jamaah Queries
// ----------------------------------------------------
export async function getAllJamaah(allowFallback = false): Promise<Jamaah[]> {
  try {
    const [rows]: any = await pool.query(`
      SELECT
        id,
        nama,
        COALESCE(zawiyah_nama, '') as zawiyah,
        COALESCE(jenis_kelamin, 'Laki-laki') as jenisKelamin,
        COALESCE(status_pernikahan, '') as statusPernikahan,
        COALESCE(tempat_lahir, '') as tempatLahir,
        COALESCE(tanggal_lahir, '') as tanggalLahir,
        COALESCE(email, '') as email,
        COALESCE(telepon, '') as telepon,
        COALESCE(ktp, '') as ktp,
        COALESCE(kk, '') as kk,
        COALESCE(alamat, '') as alamat,
        COALESCE(pekerjaan, 'Lainnya') as pekerjaan,
        COALESCE(koperasi, 'Tidak') as koperasi,
        COALESCE(agnia_care, 'Tidak') as agniaCare,
        COALESCE(status, 'Aktif') as status
      FROM jamaah
      ORDER BY id ASC
    `);
    return rows as Jamaah[];
  } catch (error: any) {
    if (allowFallback) {
      console.warn('MySQL unavailable, returning fallback jamaah list');
      return [];
    }
    throw new DatabaseConnectionError(
      'Gagal mengambil data jamaah: Server MySQL (dashboard_zawiyah) tidak merespons.',
      error?.code || 'ECONNREFUSED',
      error?.message
    );
  }
}

// ----------------------------------------------------
// 5. Zawiyah Queries
// ----------------------------------------------------
export async function getAllZawiyah(allowFallback = false): Promise<Zawiyah[]> {
  try {
    const [rows]: any = await pool.query(`
      SELECT
        id,
        nama,
        tipe,
        kota,
        pengurus,
        CAST(jamaah AS UNSIGNED) as jamaah,
        'Aktif' as status
      FROM zawiyah
      ORDER BY jamaah DESC
    `);
    return rows as Zawiyah[];
  } catch (error: any) {
    if (allowFallback) {
      console.warn('MySQL unavailable, returning fallback zawiyah list');
      return FALLBACK_ZAWIYAH;
    }
    throw new DatabaseConnectionError(
      'Gagal mengambil data zawiyah: Server MySQL (dashboard_zawiyah) tidak merespons.',
      error?.code || 'ECONNREFUSED',
      error?.message
    );
  }
}

// ----------------------------------------------------
// 6. Dashboard Stats
// ----------------------------------------------------
export async function getDashboardStats(allowFallback = false): Promise<DashboardStats> {
  try {
    const [totalJamaahRows]: any = await pool.query('SELECT COUNT(*) as count FROM jamaah');
    const [totalZawiyahRows]: any = await pool.query('SELECT COUNT(*) as count FROM zawiyah');
    const [totalAgniaRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE agnia_care = 'Ya'");
    const [totalLakiRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE jenis_kelamin = 'Laki-laki'");
    const [totalPerempuanRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE jenis_kelamin = 'Perempuan'");
    const [totalKoperasiRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE koperasi LIKE 'Ya%'");
    const [totalAktifRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE status = 'Aktif'");

    const [topZawiyahRows]: any = await pool.query(`
      SELECT
        id,
        nama,
        tipe,
        kota,
        pengurus,
        CAST(jamaah AS UNSIGNED) as jamaah,
        'Aktif' as status
      FROM zawiyah
      ORDER BY jamaah DESC
      LIMIT 5
    `);

    const [topPekerjaanRows]: any = await pool.query(`
      SELECT
        pekerjaan as label,
        COUNT(*) as count
      FROM jamaah
      WHERE pekerjaan IS NOT NULL AND TRIM(pekerjaan) != ''
      GROUP BY pekerjaan
      ORDER BY count DESC
      LIMIT 6
    `);

    const totalJamaah = Number(totalJamaahRows[0]?.count) || 1;
    const totalZawiyah = Number(totalZawiyahRows[0]?.count) || 0;
    const totalAgniaCare = Number(totalAgniaRows[0]?.count) || 0;
    const totalLaki = Number(totalLakiRows[0]?.count) || 0;
    const totalPerempuan = Number(totalPerempuanRows[0]?.count) || 0;
    const totalKoperasi = Number(totalKoperasiRows[0]?.count) || 0;
    const totalAktif = Number(totalAktifRows[0]?.count) || 0;

    let totalDonatur = 0;
    try {
      const [totalDonaturRows]: any = await pool.query('SELECT COUNT(*) as count FROM donatur');
      totalDonatur = Number(totalDonaturRows[0]?.count) || 0;
    } catch {
      // ignore if table doesn't exist in fallback
    }

    const pctLaki = Math.round((totalLaki / totalJamaah) * 100);
    const pctPerempuan = Math.round((totalPerempuan / totalJamaah) * 100);
    const pctAgniaCare = ((totalAgniaCare / totalJamaah) * 100).toFixed(1);
    const pctKoperasi = ((totalKoperasi / totalJamaah) * 100).toFixed(1);

    return {
      totalJamaah,
      totalZawiyah,
      totalAgniaCare,
      totalLaki,
      totalPerempuan,
      totalKoperasi,
      totalAktif,
      totalDonatur,
      topZawiyah: topZawiyahRows as Zawiyah[],
      topPekerjaan: topPekerjaanRows as { label: string; count: number }[],
      pctLaki,
      pctPerempuan,
      pctAgniaCare,
      pctKoperasi,
    };
  } catch (error: any) {
    if (allowFallback) {
      console.warn('MySQL unavailable, returning fallback stats:', error?.message);
      return FALLBACK_STATS;
    }
    throw new DatabaseConnectionError(
      'Gagal menghitung statistik: Server MySQL (dashboard_zawiyah) tidak merespons.',
      error?.code || 'ECONNREFUSED',
      error?.message
    );
  }
}

// ----------------------------------------------------
// 7. Donatur Queries (Kanwakil Jawa Barat / Agnia Care)
// ----------------------------------------------------
export async function getAllDonatur(): Promise<Donatur[]> {
  try {
    const [rows]: any = await pool.query(`
      SELECT
        id,
        no_urut,
        nama,
        jenis_kelamin,
        kategori_donatur,
        telepon,
        email,
        ktp,
        alamat,
        zawiyah_id,
        zawiyah_nama,
        parent_donatur,
        pekerjaan,
        kantor_wilayah,
        jamaah_id,
        status,
        created_at
      FROM donatur
      ORDER BY no_urut ASC
    `);
    return rows as Donatur[];
  } catch (error: any) {
    console.warn('Gagal mengambil data donatur dari MySQL:', error?.message);
    return [];
  }
}

