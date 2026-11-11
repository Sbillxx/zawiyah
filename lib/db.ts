import bcrypt from 'bcryptjs';
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
  is_ketua_zawiyah?: boolean;
  ketua_di_zawiyah_id?: string | null;
  ketua_di_zawiyah_nama?: string | null;
}

export interface Zawiyah {
  id: string;
  nama: string;
  tipe: string;
  kota: string;
  pengurus: string;
  ketua_zawiyah?: string;
  ketua_jamaah_id?: string | null;
  no_telp_ketua?: string;
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
  currentZawiyah?: Zawiyah | null;
  isScopedZawiyah?: boolean;
}

export interface UserAccount {
  id: number;
  username: string;
  nama_lengkap: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN_EKSEKUTIF' | 'ADMIN_ZAWIYAH' | 'ADMIN_DIVISI' | string;
  zawiyah_id: string | null;
  jamaah_id?: string | null;
  divisi_id: string | null;
  is_password_default?: number;
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
  host: process.env.MYSQL_HOST || process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.MYSQL_PORT || process.env.DB_PORT || '3306', 10),
  user: process.env.MYSQL_USER || process.env.DB_USER || 'root',
  password: process.env.MYSQL_PASSWORD || process.env.DB_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'dashboard_zawiyah',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 8000,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: (process.env.MYSQL_SSL === 'true' || process.env.DB_SSL === 'true') ? { rejectUnauthorized: false } : undefined,
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
  { id: 3, username: 'admin_karawang', nama_lengkap: 'Ust. Asep Saepudin, S.Pd.I. (Ketua Zawiyah Karawang)', email: 'karawang@idrisiyyah.org', role: 'ADMIN_ZAWIYAH', zawiyah_id: 'ZW-004', divisi_id: null, status: 'Aktif' },
  { id: 4, username: 'admin_agnia', nama_lengkap: 'Admin Agnia Care', email: 'agnia@idrisiyyah.org', role: 'ADMIN_DIVISI', zawiyah_id: null, divisi_id: 'div_sosial', status: 'Aktif' },
];

export const FALLBACK_ZAWIYAH: Zawiyah[] = [
  { id: 'ZW-001', nama: 'Zawiyah Pusat Tasikmalaya', tipe: 'Pusat', kota: 'Tasikmalaya', pengurus: 'Syekh Muhammad Fathurahman, M.Ag.', ketua_zawiyah: 'Syekh Muhammad Fathurahman, M.Ag.', no_telp_ketua: '081223456789', jamaah: 961, status: 'Aktif' },
  { id: 'ZW-023', nama: 'Zawiyah Utama Jakarta', tipe: 'Utama', kota: 'Jakarta', pengurus: 'Ust. H. Ahmad Dahlan', ketua_zawiyah: 'Ust. H. Ahmad Dahlan', no_telp_ketua: '081387654321', jamaah: 20, status: 'Aktif' },
  { id: 'ZW-002', nama: 'Zawiyah Salopa Kabupaten Tasikmalaya', tipe: 'Cabang', kota: 'Tasikmalaya', pengurus: 'Ust. Pengurus (Salopa Kabupaten Tasikmalaya)', ketua_zawiyah: 'Ust. Pengurus (Salopa Kabupaten Tasikmalaya)', no_telp_ketua: '0812XXXXXXXX', jamaah: 438, status: 'Aktif' },
  { id: 'ZW-003', nama: 'Zawiyah Tamansari Kota Tasikmalaya', tipe: 'Cabang', kota: 'Tasikmalaya', pengurus: 'Ust. Pengurus (Tamansari Kota Tasikmalaya)', ketua_zawiyah: 'Ust. Pengurus (Tamansari Kota Tasikmalaya)', no_telp_ketua: '0812XXXXXXXX', jamaah: 300, status: 'Aktif' },
  { id: 'ZW-004', nama: 'Zawiyah Karawang', tipe: 'Cabang', kota: 'Karawang', pengurus: 'Ust. Abdul Muyhi', ketua_zawiyah: 'Ust. Abdul Muyhi', no_telp_ketua: '', jamaah: 260, status: 'Aktif' },
  { id: 'ZW-005', nama: 'Zawiyah Purbaratu Kota Tasikmalaya', tipe: 'Cabang', kota: 'Tasikmalaya', pengurus: 'Ust. Pengurus (Purbaratu Kota Tasikmalaya)', ketua_zawiyah: 'Ust. Pengurus (Purbaratu Kota Tasikmalaya)', no_telp_ketua: '0812XXXXXXXX', jamaah: 258, status: 'Aktif' },
];

export const FALLBACK_STATS: DashboardStats = {
  totalJamaah: 4309,
  totalZawiyah: 86,
  totalAgniaCare: 384,
  totalLaki: 2150,
  totalPerempuan: 2059,
  totalKoperasi: 512,
  totalAktif: 4309,
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
export async function getAllJamaah(allowFallback = false, zawiyahId?: string): Promise<Jamaah[]> {
  try {
    let sql = `
      SELECT
        id,
        nama,
        COALESCE(zawiyah_id, '') as zawiyahId,
        COALESCE(zawiyah_nama, '') as zawiyah,
        CASE 
          WHEN UPPER(TRIM(COALESCE(jenis_kelamin, ''))) IN ('P', 'PEREMPUAN', 'WANITA') THEN 'Perempuan'
          ELSE 'Laki-laki'
        END as jenisKelamin,
        COALESCE(status_pernikahan, '') as statusPernikahan,
        COALESCE(tempat_lahir, '') as tempatLahir,
        COALESCE(tanggal_lahir, '') as tanggalLahir,
        COALESCE(email, '') as email,
        COALESCE(telepon, '') as telepon,
        COALESCE(ktp, '') as ktp,
        COALESCE(kk, '') as kk,
        COALESCE(alamat, '') as alamat,
        CASE WHEN COALESCE(pekerjaan, '') IN ('', '0') THEN 'Lainnya' ELSE pekerjaan END as pekerjaan,
        COALESCE(koperasi, 'Tidak') as koperasi,
        COALESCE(agnia_care, 'Tidak') as agniaCare,
        COALESCE(status, 'Aktif') as status
      FROM jamaah
    `;
    const params: any[] = [];
    if (zawiyahId) {
      sql += ` WHERE zawiyah_id = ? OR zawiyah_nama = (SELECT nama FROM zawiyah WHERE id = ? LIMIT 1)`;
      params.push(zawiyahId, zawiyahId);
    }
    sql += ` ORDER BY id ASC`;
    const [rows]: any = await pool.query(sql, params);
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
        COALESCE(ketua_zawiyah, pengurus, '') as ketua_zawiyah,
        COALESCE(ketua_jamaah_id, '') as ketua_jamaah_id,
        COALESCE(no_telp_ketua, '') as no_telp_ketua,
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
export async function getDashboardStats(allowFallback = false, zawiyahId?: string): Promise<DashboardStats> {
  try {
    if (zawiyahId) {
      // Scoped stats for a specific zawiyah (Ketua Zawiyah / Admin Zawiyah)
      const [zRows]: any = await pool.query(
        'SELECT id, nama, tipe, kota, pengurus, COALESCE(ketua_zawiyah, pengurus, "") as ketua_zawiyah, COALESCE(no_telp_ketua, "") as no_telp_ketua, CAST(jamaah AS UNSIGNED) as jamaah, "Aktif" as status FROM zawiyah WHERE id = ? OR nama = ? LIMIT 1',
        [zawiyahId, zawiyahId]
      );
      const currentZawiyah: Zawiyah | null = zRows && zRows.length > 0 ? zRows[0] : null;
      const zawiyahNama = currentZawiyah?.nama || zawiyahId;

      const [totalJamaahRows]: any = await pool.query('SELECT COUNT(*) as count FROM jamaah WHERE zawiyah_id = ? OR zawiyah_nama = ?', [zawiyahId, zawiyahNama]);
      const [totalAgniaRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE (zawiyah_id = ? OR zawiyah_nama = ?) AND agnia_care = 'Ya'", [zawiyahId, zawiyahNama]);
      const [totalLakiRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE (zawiyah_id = ? OR zawiyah_nama = ?) AND (jenis_kelamin IN ('Laki-laki', 'L', 'laki-laki', 'l') OR jenis_kelamin LIKE 'Laki%')", [zawiyahId, zawiyahNama]);
      const [totalPerempuanRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE (zawiyah_id = ? OR zawiyah_nama = ?) AND (jenis_kelamin IN ('Perempuan', 'P', 'perempuan', 'p') OR jenis_kelamin LIKE 'Perem%')", [zawiyahId, zawiyahNama]);
      const [totalKoperasiRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE (zawiyah_id = ? OR zawiyah_nama = ?) AND koperasi LIKE 'Ya%'", [zawiyahId, zawiyahNama]);
      const [totalAktifRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE (zawiyah_id = ? OR zawiyah_nama = ?) AND status = 'Aktif'", [zawiyahId, zawiyahNama]);

      const [topPekerjaanRows]: any = await pool.query(`
        SELECT
          pekerjaan as label,
          COUNT(*) as count
        FROM jamaah
        WHERE (zawiyah_id = ? OR zawiyah_nama = ?) AND pekerjaan IS NOT NULL AND TRIM(pekerjaan) != '' AND TRIM(pekerjaan) != '0'
        GROUP BY pekerjaan
        ORDER BY count DESC
        LIMIT 6
      `, [zawiyahId, zawiyahNama]);

      let totalDonatur = 0;
      try {
        const [totalDonaturRows]: any = await pool.query('SELECT COUNT(*) as count FROM donatur WHERE zawiyah_id = ? OR zawiyah_nama = ?', [zawiyahId, zawiyahNama]);
        totalDonatur = Number(totalDonaturRows[0]?.count) || 0;
      } catch {
        // ignore
      }

      const totalJamaah = Number(totalJamaahRows[0]?.count) || currentZawiyah?.jamaah || 0;
      const totalAgniaCare = Number(totalAgniaRows[0]?.count) || 0;
      const totalLaki = Number(totalLakiRows[0]?.count) || 0;
      const totalPerempuan = Number(totalPerempuanRows[0]?.count) || 0;
      const totalKoperasi = Number(totalKoperasiRows[0]?.count) || 0;
      const totalAktif = Number(totalAktifRows[0]?.count) || totalJamaah;

      const pctLaki = totalJamaah > 0 ? Math.round((totalLaki / totalJamaah) * 100) : 50;
      const pctPerempuan = totalJamaah > 0 ? Math.round((totalPerempuan / totalJamaah) * 100) : 50;
      const pctAgniaCare = totalJamaah > 0 ? ((totalAgniaCare / totalJamaah) * 100).toFixed(1) : '0';
      const pctKoperasi = totalJamaah > 0 ? ((totalKoperasi / totalJamaah) * 100).toFixed(1) : '0';

      return {
        totalJamaah,
        totalZawiyah: 1,
        totalAgniaCare,
        totalLaki,
        totalPerempuan,
        totalKoperasi,
        totalAktif,
        totalDonatur,
        topZawiyah: currentZawiyah ? [currentZawiyah] : [],
        topPekerjaan: topPekerjaanRows as { label: string; count: number }[],
        pctLaki,
        pctPerempuan,
        pctAgniaCare,
        pctKoperasi,
        currentZawiyah,
        isScopedZawiyah: true,
      };
    }

    const [totalJamaahRows]: any = await pool.query('SELECT COUNT(*) as count FROM jamaah');
    const [totalZawiyahRows]: any = await pool.query('SELECT COUNT(*) as count FROM zawiyah');
    const [totalAgniaRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE agnia_care = 'Ya'");
    const [totalLakiRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE (jenis_kelamin IN ('Laki-laki', 'L', 'laki-laki', 'l') OR jenis_kelamin LIKE 'Laki%')");
    const [totalPerempuanRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE (jenis_kelamin IN ('Perempuan', 'P', 'perempuan', 'p') OR jenis_kelamin LIKE 'Perem%')");
    const [totalKoperasiRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE koperasi LIKE 'Ya%'");
    const [totalAktifRows]: any = await pool.query("SELECT COUNT(*) as count FROM jamaah WHERE status = 'Aktif'");

    const [topZawiyahRows]: any = await pool.query(`
      SELECT
        id,
        nama,
        tipe,
        kota,
        pengurus,
        COALESCE(ketua_zawiyah, pengurus, '') as ketua_zawiyah,
        COALESCE(no_telp_ketua, '') as no_telp_ketua,
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
      WHERE pekerjaan IS NOT NULL AND TRIM(pekerjaan) != '' AND TRIM(pekerjaan) != '0'
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
      isScopedZawiyah: false,
    };
  } catch (error: any) {
    console.warn('MySQL unavailable, returning fallback stats snapshot:', error?.message);
    return FALLBACK_STATS;
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

// ----------------------------------------------------
// 8. Jamaah Mutation Functions (CRUD for Super Admin)
// ----------------------------------------------------
export async function getNextJamaahId(): Promise<string> {
  try {
    const [rows]: any = await pool.query(
      "SELECT id FROM jamaah WHERE id LIKE 'MBR%' ORDER BY id DESC LIMIT 1"
    );
    if (rows && rows.length > 0) {
      const lastId = rows[0].id;
      const match = lastId.match(/MBR(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `MBR${String(nextNum).padStart(6, '0')}`;
      }
    }
  } catch (err) {
    console.warn('getNextJamaahId query error:', err);
  }
  return `MBR${Date.now().toString().slice(-6)}`;
}

export async function createJamaah(
  data: Partial<Jamaah> & { nama: string },
  auditUser?: { id: number; username: string }
): Promise<Jamaah> {
  const id = data.id?.trim() || (await getNextJamaahId());
  const nama = data.nama.trim();
  const jenisKelamin = data.jenisKelamin || 'Laki-laki';
  const statusPernikahan = data.statusPernikahan || 'Menikah';
  const tempatLahir = data.tempatLahir || '';
  const tanggalLahir = data.tanggalLahir || '';
  const email = data.email?.trim() || null;
  const telepon = data.telepon?.trim() || '';
  const ktp = data.ktp?.trim() || '';
  const kk = data.kk?.trim() || '';
  const alamat = data.alamat?.trim() || '';
  const pekerjaan = data.pekerjaan?.trim() || 'Lainnya';
  const koperasi = data.koperasi || 'Tidak';
  const agniaCare = data.agniaCare || 'Tidak';
  const status = data.status || 'Aktif';

  // Resolve zawiyah_id and zawiyah_nama
  let zawiyahNama = data.zawiyah?.trim() || 'Zawiyah Pusat Tasikmalaya';
  let zawiyahId: string | null = null;
  try {
    const [zRows]: any = await pool.query(
      'SELECT id, nama FROM zawiyah WHERE nama = ? OR id = ? LIMIT 1',
      [zawiyahNama, zawiyahNama]
    );
    if (zRows && zRows.length > 0) {
      zawiyahId = zRows[0].id;
      zawiyahNama = zRows[0].nama;
    }
  } catch (err) {
    console.warn('Zawiyah lookup warning:', err);
  }

  await pool.query(
    `INSERT INTO jamaah (
      id, nama, zawiyah_id, zawiyah_nama, jenis_kelamin, status_pernikahan,
      tempat_lahir, tanggal_lahir, email, telepon, ktp, kk, alamat,
      pekerjaan, koperasi, agnia_care, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      nama,
      zawiyahId,
      zawiyahNama,
      jenisKelamin,
      statusPernikahan,
      tempatLahir,
      tanggalLahir,
      email,
      telepon,
      ktp,
      kk,
      alamat,
      pekerjaan,
      koperasi,
      agniaCare,
      status,
    ]
  );

  // Sync zawiyah member count if linked
  if (zawiyahId) {
    try {
      await pool.query(
        `UPDATE zawiyah SET jamaah = (SELECT COUNT(*) FROM jamaah WHERE zawiyah_id = ? AND status = 'Aktif') WHERE id = ?`,
        [zawiyahId, zawiyahId]
      );
    } catch (err) {
      console.warn('Sync zawiyah count warning:', err);
    }
  }

  // Audit Log
  if (auditUser) {
    await recordAuditLog(
      auditUser.id,
      auditUser.username,
      'CREATE_JAMAAH',
      'jamaah',
      `Menambahkan jamaah baru: ${nama} (${id}) di ${zawiyahNama}`
    );
  }

  return {
    id,
    nama,
    zawiyah: zawiyahNama,
    jenisKelamin,
    statusPernikahan,
    tempatLahir,
    tanggalLahir,
    email: email || '',
    telepon,
    ktp,
    kk,
    alamat,
    pekerjaan,
    koperasi,
    agniaCare,
    status,
  };
}

export async function updateJamaah(
  id: string,
  data: Partial<Jamaah>,
  auditUser?: { id: number; username: string }
): Promise<boolean> {
  const [existing]: any = await pool.query('SELECT * FROM jamaah WHERE id = ? LIMIT 1', [id]);
  if (!existing || existing.length === 0) {
    throw new Error(`Jamaah dengan ID ${id} tidak ditemukan.`);
  }

  const current = existing[0];

  // Resolve zawiyah if updated
  let zawiyahId = current.zawiyah_id;
  let zawiyahNama = current.zawiyah_nama;
  if (data.zawiyah !== undefined) {
    zawiyahNama = data.zawiyah.trim();
    try {
      const [zRows]: any = await pool.query(
        'SELECT id, nama FROM zawiyah WHERE nama = ? OR id = ? LIMIT 1',
        [zawiyahNama, zawiyahNama]
      );
      if (zRows && zRows.length > 0) {
        zawiyahId = zRows[0].id;
        zawiyahNama = zRows[0].nama;
      }
    } catch (err) {
      console.warn('Zawiyah lookup warning on update:', err);
    }
  }

  const nama = data.nama !== undefined ? data.nama.trim() : current.nama;
  const jenisKelamin = data.jenisKelamin !== undefined ? data.jenisKelamin : current.jenis_kelamin;
  const statusPernikahan = data.statusPernikahan !== undefined ? data.statusPernikahan : current.status_pernikahan;
  const tempatLahir = data.tempatLahir !== undefined ? data.tempatLahir : current.tempat_lahir;
  const tanggalLahir = data.tanggalLahir !== undefined ? data.tanggalLahir : current.tanggal_lahir;
  const email = data.email !== undefined ? (data.email?.trim() || null) : current.email;
  const telepon = data.telepon !== undefined ? data.telepon.trim() : current.telepon;
  const ktp = data.ktp !== undefined ? data.ktp.trim() : current.ktp;
  const kk = data.kk !== undefined ? data.kk.trim() : current.kk;
  const alamat = data.alamat !== undefined ? data.alamat.trim() : current.alamat;
  const pekerjaan = data.pekerjaan !== undefined ? data.pekerjaan.trim() : current.pekerjaan;
  const koperasi = data.koperasi !== undefined ? data.koperasi : current.koperasi;
  const agniaCare = data.agniaCare !== undefined ? data.agniaCare : current.agnia_care;
  const status = data.status !== undefined ? data.status : current.status;

  await pool.query(
    `UPDATE jamaah SET
      nama = ?, zawiyah_id = ?, zawiyah_nama = ?, jenis_kelamin = ?, status_pernikahan = ?,
      tempat_lahir = ?, tanggal_lahir = ?, email = ?, telepon = ?, ktp = ?, kk = ?,
      alamat = ?, pekerjaan = ?, koperasi = ?, agnia_care = ?, status = ?
    WHERE id = ?`,
    [
      nama,
      zawiyahId,
      zawiyahNama,
      jenisKelamin,
      statusPernikahan,
      tempatLahir,
      tanggalLahir,
      email,
      telepon,
      ktp,
      kk,
      alamat,
      pekerjaan,
      koperasi,
      agniaCare,
      status,
      id,
    ]
  );

  // Sync zawiyah member counts if zawiyah changed
  if (current.zawiyah_id && current.zawiyah_id !== zawiyahId) {
    try {
      await pool.query(
        `UPDATE zawiyah SET jamaah = (SELECT COUNT(*) FROM jamaah WHERE zawiyah_id = ? AND status = 'Aktif') WHERE id = ?`,
        [current.zawiyah_id, current.zawiyah_id]
      );
    } catch (err) {
      console.warn('Sync old zawiyah count warning:', err);
    }
  }
  if (zawiyahId) {
    try {
      await pool.query(
        `UPDATE zawiyah SET jamaah = (SELECT COUNT(*) FROM jamaah WHERE zawiyah_id = ? AND status = 'Aktif') WHERE id = ?`,
        [zawiyahId, zawiyahId]
      );
    } catch (err) {
      console.warn('Sync new zawiyah count warning:', err);
    }
  }

  // Audit Log
  if (auditUser) {
    await recordAuditLog(
      auditUser.id,
      auditUser.username,
      'UPDATE_JAMAAH',
      'jamaah',
      `Memperbarui data jamaah: ${nama} (${id})`
    );
  }

  return true;
}

export async function deleteJamaah(
  id: string,
  softDelete = true,
  auditUser?: { id: number; username: string }
): Promise<boolean> {
  const [existing]: any = await pool.query('SELECT id, nama, zawiyah_id FROM jamaah WHERE id = ? LIMIT 1', [id]);
  if (!existing || existing.length === 0) {
    throw new Error(`Jamaah dengan ID ${id} tidak ditemukan.`);
  }

  const jamaah = existing[0];

  if (softDelete) {
    await pool.query("UPDATE jamaah SET status = 'Nonaktif' WHERE id = ?", [id]);
  } else {
    await pool.query('DELETE FROM jamaah WHERE id = ?', [id]);
  }

  // Sync zawiyah member count
  if (jamaah.zawiyah_id) {
    try {
      await pool.query(
        `UPDATE zawiyah SET jamaah = (SELECT COUNT(*) FROM jamaah WHERE zawiyah_id = ? AND status = 'Aktif') WHERE id = ?`,
        [jamaah.zawiyah_id, jamaah.zawiyah_id]
      );
    } catch (err) {
      console.warn('Sync zawiyah count warning on delete:', err);
    }
  }

  // Audit Log
  if (auditUser) {
    await recordAuditLog(
      auditUser.id,
      auditUser.username,
      softDelete ? 'DEACTIVATE_JAMAAH' : 'DELETE_JAMAAH',
      'jamaah',
      `${softDelete ? 'Menonaktifkan' : 'Menghapus permanen'} jamaah: ${jamaah.nama} (${id})`
    );
  }

  return true;
}

// ----------------------------------------------------
// 9. Zawiyah Mutation Functions (CRUD for Super Admin)
// ----------------------------------------------------
export async function getNextZawiyahId(): Promise<string> {
  try {
    const [rows]: any = await pool.query(
      "SELECT id FROM zawiyah WHERE id LIKE 'ZW-%' ORDER BY id DESC LIMIT 1"
    );
    if (rows && rows.length > 0) {
      const match = rows[0].id.match(/ZW-(\d+)/);
      if (match) {
        const nextNum = parseInt(match[1], 10) + 1;
        return `ZW-${String(nextNum).padStart(3, '0')}`;
      }
    }
  } catch (err) {
    console.warn('getNextZawiyahId query error:', err);
  }
  return `ZW-${Date.now().toString().slice(-4)}`;
}

export async function createZawiyah(
  data: { nama: string; tipe?: string; kota: string; pengurus?: string; ketua_zawiyah?: string; no_telp_ketua?: string },
  auditUser?: { id: number; username: string }
): Promise<Zawiyah> {
  const id = await getNextZawiyahId();
  const nama = data.nama.trim();
  const tipe = data.tipe || 'Cabang';
  const kota = data.kota.trim();
  const ketuaZawiyah = data.ketua_zawiyah?.trim() || `Ust. Ketua (${nama})`;
  const pengurus = data.pengurus?.trim() || ketuaZawiyah;
  const noTelpKetua = data.no_telp_ketua?.trim() || '';

  await pool.query(
    'INSERT INTO zawiyah (id, nama, tipe, kota, pengurus, ketua_zawiyah, no_telp_ketua, jamaah) VALUES (?, ?, ?, ?, ?, ?, ?, 0)',
    [id, nama, tipe, kota, pengurus, ketuaZawiyah, noTelpKetua]
  );

  if (auditUser) {
    await recordAuditLog(
      auditUser.id,
      auditUser.username,
      'CREATE_ZAWIYAH',
      'zawiyah',
      `Menambahkan zawiyah baru: ${nama} (${id}) di kota ${kota}`
    );
  }

  return {
    id,
    nama,
    tipe,
    kota,
    pengurus,
    ketua_zawiyah: ketuaZawiyah,
    no_telp_ketua: noTelpKetua,
    jamaah: 0,
    status: 'Aktif',
  };
}

export async function updateZawiyah(
  id: string,
  data: Partial<Zawiyah>,
  auditUser?: { id: number; username: string }
): Promise<boolean> {
  const [existing]: any = await pool.query('SELECT * FROM zawiyah WHERE id = ? LIMIT 1', [id]);
  if (!existing || existing.length === 0) {
    throw new Error(`Zawiyah dengan ID ${id} tidak ditemukan.`);
  }

  const current = existing[0];
  const nama = data.nama !== undefined ? data.nama.trim() : current.nama;
  const tipe = data.tipe !== undefined ? data.tipe.trim() : current.tipe;
  const kota = data.kota !== undefined ? data.kota.trim() : current.kota;
  const ketuaZawiyah = data.ketua_zawiyah !== undefined ? data.ketua_zawiyah.trim() : (current.ketua_zawiyah || current.pengurus);
  const pengurus = data.pengurus !== undefined ? data.pengurus.trim() : ketuaZawiyah;
  const noTelpKetua = data.no_telp_ketua !== undefined ? data.no_telp_ketua.trim() : (current.no_telp_ketua || '');

  await pool.query(
    'UPDATE zawiyah SET nama = ?, tipe = ?, kota = ?, pengurus = ?, ketua_zawiyah = ?, no_telp_ketua = ? WHERE id = ?',
    [nama, tipe, kota, pengurus, ketuaZawiyah, noTelpKetua, id]
  );

  // If zawiyah name changed, keep zawiyah_nama in table jamaah in sync!
  if (nama !== current.nama) {
    try {
      await pool.query('UPDATE jamaah SET zawiyah_nama = ? WHERE zawiyah_id = ?', [nama, id]);
    } catch (err) {
      console.warn('Sync jamaah zawiyah_nama warning:', err);
    }
  }

  if (auditUser) {
    await recordAuditLog(
      auditUser.id,
      auditUser.username,
      'UPDATE_ZAWIYAH',
      'zawiyah',
      `Memperbarui data zawiyah: ${nama} (${id})`
    );
  }

  return true;
}

export async function deleteZawiyah(
  id: string,
  auditUser?: { id: number; username: string }
): Promise<boolean> {
  const [existing]: any = await pool.query('SELECT id, nama FROM zawiyah WHERE id = ? LIMIT 1', [id]);
  if (!existing || existing.length === 0) {
    throw new Error(`Zawiyah dengan ID ${id} tidak ditemukan.`);
  }

  const zawiyah = existing[0];

  // Detach jamaah foreign keys first to prevent FK constraint violation
  await pool.query('UPDATE jamaah SET zawiyah_id = NULL WHERE zawiyah_id = ?', [id]);
  await pool.query('DELETE FROM zawiyah WHERE id = ?', [id]);

  if (auditUser) {
    await recordAuditLog(
      auditUser.id,
      auditUser.username,
      'DELETE_ZAWIYAH',
      'zawiyah',
      `Menghapus zawiyah: ${zawiyah.nama} (${id})`
    );
  }

  return true;
}



// ----------------------------------------------------
// 10. Ketua Zawiyah Management & Delegation Functions
// ----------------------------------------------------
export async function assignKetuaZawiyah(
  zawiyahId: string,
  jamaahId: string,
  auditUser?: { id: number; username: string }
): Promise<{
  zawiyah: Zawiyah;
  jamaah: Jamaah;
  account: { username: string; defaultPassword?: string; isNewAccount: boolean };
}> {
  // 1. Fetch jamaah
  const [jRows]: any = await pool.query(
    'SELECT * FROM jamaah WHERE id = ? LIMIT 1',
    [jamaahId]
  );
  if (!jRows || jRows.length === 0) {
    throw new Error(`Jamaah dengan ID ${jamaahId} tidak ditemukan.`);
  }
  const jamaah = jRows[0];

  // 2. Fetch zawiyah
  const [zRows]: any = await pool.query(
    'SELECT * FROM zawiyah WHERE id = ? LIMIT 1',
    [zawiyahId]
  );
  if (!zRows || zRows.length === 0) {
    throw new Error(`Zawiyah dengan ID ${zawiyahId} tidak ditemukan.`);
  }
  const zawiyah = zRows[0];

  // 3. Update zawiyah table
  await pool.query(
    `UPDATE zawiyah 
     SET ketua_jamaah_id = ?, 
         ketua_zawiyah = ?, 
         no_telp_ketua = ?, 
         pengurus = ?
     WHERE id = ?`,
    [jamaah.id, jamaah.nama, jamaah.telepon || '', jamaah.nama, zawiyah.id]
  );

  // 4. Update jamaah table (flagging as ketua zawiyah, allowing one-to-many)
  await pool.query(
    `UPDATE jamaah 
     SET is_ketua_zawiyah = 1,
         ketua_di_zawiyah_id = ?,
         ketua_di_zawiyah_nama = ?
     WHERE id = ?`,
    [zawiyah.id, zawiyah.nama, jamaah.id]
  );

  // 5. Provision or update user account in users table
  const defaultPasswordPlain = 'bismillah123';
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(defaultPasswordPlain, salt);

  // Check if user already exists for this jamaah or for this zawiyah
  const [existingUsers]: any = await pool.query(
    'SELECT * FROM users WHERE jamaah_id = ? OR (role = "ADMIN_ZAWIYAH" AND zawiyah_id = ?) LIMIT 1',
    [jamaah.id, zawiyah.id]
  );

  let username = '';
  let isNewAccount = false;

  if (existingUsers && existingUsers.length > 0) {
    const u = existingUsers[0];
    username = u.username;
    await pool.query(
      `UPDATE users 
       SET nama_lengkap = ?,
           zawiyah_id = ?,
           jamaah_id = ?,
           role = 'ADMIN_ZAWIYAH',
           status = 'Aktif'
       WHERE id = ?`,
      [`${jamaah.nama} (Ketua ${zawiyah.nama})`, zawiyah.id, jamaah.id, u.id]
    );
  } else {
    isNewAccount = true;
    const cleanKota = zawiyah.kota.toLowerCase().replace(/[^a-z0-9]/g, '');
    let baseUsername = `ketua_${cleanKota}`;
    username = baseUsername;

    const [uCheck]: any = await pool.query('SELECT id FROM users WHERE username = ? LIMIT 1', [username]);
    if (uCheck && uCheck.length > 0) {
      username = `${baseUsername}_${Math.floor(100 + Math.random() * 900)}`;
    }

    const email = jamaah.email?.trim() || `${username}@idrisiyyah.org`;

    await pool.query(
      `INSERT INTO users (username, nama_lengkap, email, password_hash, role, zawiyah_id, jamaah_id, is_password_default, status)
       VALUES (?, ?, ?, ?, 'ADMIN_ZAWIYAH', ?, ?, 1, 'Aktif')`,
      [username, `${jamaah.nama} (Ketua ${zawiyah.nama})`, email, passwordHash, zawiyah.id, jamaah.id]
    );
  }

  // 6. Record audit log
  if (auditUser) {
    await recordAuditLog(
      auditUser.id,
      auditUser.username,
      'ASSIGN_KETUA_ZAWIYAH',
      'zawiyah',
      `Menunjuk ${jamaah.nama} (${jamaah.id}) sebagai Ketua ${zawiyah.nama} (${zawiyah.id}) dengan akun @${username}`
    );
  }

  return {
    zawiyah: {
      id: zawiyah.id,
      nama: zawiyah.nama,
      tipe: zawiyah.tipe,
      kota: zawiyah.kota,
      pengurus: jamaah.nama,
      ketua_zawiyah: jamaah.nama,
      ketua_jamaah_id: jamaah.id,
      no_telp_ketua: jamaah.telepon || '',
      jamaah: zawiyah.jamaah,
      status: 'Aktif',
    },
    jamaah: {
      id: jamaah.id,
      nama: jamaah.nama,
      zawiyah: jamaah.zawiyah_nama || '',
      jenisKelamin: jamaah.jenis_kelamin,
      statusPernikahan: jamaah.status_pernikahan,
      tempatLahir: jamaah.tempat_lahir,
      tanggalLahir: jamaah.tanggal_lahir,
      email: jamaah.email,
      telepon: jamaah.telepon,
      ktp: jamaah.ktp,
      kk: jamaah.kk,
      alamat: jamaah.alamat,
      pekerjaan: jamaah.pekerjaan,
      koperasi: jamaah.koperasi,
      agniaCare: jamaah.agnia_care,
      status: jamaah.status,
    },
    account: {
      username,
      defaultPassword: isNewAccount ? defaultPasswordPlain : undefined,
      isNewAccount,
    },
  };
}

export async function searchJamaahForKetua(query: string, limit = 20): Promise<Jamaah[]> {
  try {
    const q = `%${query.trim()}%`;
    const [rows]: any = await pool.query(
      `SELECT
        id,
        nama,
        COALESCE(zawiyah_id, '') as zawiyah_id,
        COALESCE(zawiyah_nama, '') as zawiyah,
        CASE 
          WHEN UPPER(TRIM(COALESCE(jenis_kelamin, ''))) IN ('P', 'PEREMPUAN', 'WANITA') THEN 'Perempuan'
          ELSE 'Laki-laki'
        END as jenisKelamin,
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
        COALESCE(status, 'Aktif') as status,
        COALESCE(is_ketua_zawiyah, 0) as is_ketua_zawiyah,
        COALESCE(ketua_di_zawiyah_nama, '') as ketua_di_zawiyah_nama
      FROM jamaah
      WHERE nama LIKE ? OR id LIKE ? OR telepon LIKE ? OR alamat LIKE ?
      ORDER BY nama ASC
      LIMIT ?`,
      [q, q, q, q, limit]
    );
    return rows as Jamaah[];
  } catch (error: any) {
    console.warn('searchJamaahForKetua error:', error?.message);
    return [];
  }
}

export async function updateUserCredentials(
  userId: number,
  currentPassword: string,
  newPassword?: string,
  newUsername?: string,
  newNoTelp?: string
): Promise<{ success: boolean; message: string }> {
  const [rows]: any = await pool.query(
    'SELECT id, username, password_hash, role, zawiyah_id, jamaah_id FROM users WHERE id = ? LIMIT 1',
    [userId]
  );
  if (!rows || rows.length === 0) {
    throw new Error('Pengguna tidak ditemukan.');
  }
  const user = rows[0];

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isValid) {
    throw new Error('Kata sandi saat ini tidak sesuai.');
  }

  // Update username if requested and different
  if (newUsername && newUsername.trim() && newUsername.trim() !== user.username) {
    const cleanUsername = newUsername.trim().toLowerCase();
    const [exist]: any = await pool.query(
      'SELECT id FROM users WHERE username = ? AND id != ? LIMIT 1',
      [cleanUsername, userId]
    );
    if (exist && exist.length > 0) {
      throw new Error(`Username "${cleanUsername}" sudah digunakan oleh akun lain.`);
    }
    await pool.query('UPDATE users SET username = ? WHERE id = ?', [cleanUsername, userId]);
  }

  // Update password if requested
  if (newPassword && newPassword.trim()) {
    if (newPassword.trim().length < 6) {
      throw new Error('Kata sandi baru minimal 6 karakter.');
    }
    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword.trim(), salt);
    await pool.query('UPDATE users SET password_hash = ?, is_password_default = 0 WHERE id = ?', [newHash, userId]);
  }

  // Update telephone in zawiyah and jamaah if provided
  if (newNoTelp && newNoTelp.trim()) {
    if (user.zawiyah_id) {
      await pool.query('UPDATE zawiyah SET no_telp_ketua = ? WHERE id = ?', [newNoTelp.trim(), user.zawiyah_id]);
    }
    if (user.jamaah_id) {
      await pool.query('UPDATE jamaah SET telepon = ? WHERE id = ?', [newNoTelp.trim(), user.jamaah_id]);
    }
  }

  return { success: true, message: 'Kredensial dan profil akun berhasil diperbarui.' };
}
