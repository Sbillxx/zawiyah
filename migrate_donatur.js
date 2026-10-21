const fs = require('fs');
const mysql = require('mysql2/promise');

async function runMigration() {
  console.log('🚀 Starting Migration: Donatur_kantor kanwakil jawa barat.xls -> MySQL dashboard_zawiyah');

  const conn = await mysql.createConnection({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'dashboard_zawiyah',
  });

  console.log('✅ Connected to MySQL database:', 'dashboard_zawiyah');

  // 1. Create table `donatur` if not exists
  console.log('📦 Step 1: Ensuring table `donatur` exists...');
  await conn.query(`
    CREATE TABLE IF NOT EXISTS donatur (
      id VARCHAR(50) NOT NULL PRIMARY KEY,
      no_urut INT NULL,
      nama VARCHAR(255) NOT NULL,
      jenis_kelamin VARCHAR(50) NOT NULL DEFAULT 'Lainnya / Lembaga',
      kategori_donatur ENUM('Perorangan', 'Lembaga / Usaha') NOT NULL DEFAULT 'Perorangan',
      telepon VARCHAR(100) NULL,
      email VARCHAR(255) NULL,
      ktp VARCHAR(100) NULL,
      alamat TEXT NULL,
      zawiyah_id VARCHAR(50) NULL,
      zawiyah_nama VARCHAR(255) NULL,
      parent_donatur VARCHAR(255) NULL,
      pekerjaan VARCHAR(100) NULL,
      kantor_wilayah VARCHAR(100) NOT NULL DEFAULT 'Kanwakil Jawa Barat',
      jamaah_id VARCHAR(50) NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'Aktif',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      KEY idx_zawiyah_id (zawiyah_id),
      KEY idx_jamaah_id (jamaah_id),
      KEY idx_nama (nama),
      CONSTRAINT donatur_ibfk_zawiyah FOREIGN KEY (zawiyah_id) REFERENCES zawiyah (id) ON DELETE SET NULL,
      CONSTRAINT donatur_ibfk_jamaah FOREIGN KEY (jamaah_id) REFERENCES jamaah (id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
  `);
  console.log('✅ Table `donatur` ready.');

  // 2. Fetch reference data for zawiyah and jamaah
  const [allZawiyah] = await conn.query('SELECT id, nama, kota FROM zawiyah');
  const [allJamaah] = await conn.query('SELECT id, nama, telepon, ktp, zawiyah_id, agnia_care FROM jamaah');

  // 3. Read and parse donatur_clean.json
  const raw = fs.readFileSync('donatur_clean.json', 'utf-8').replace(/^\uFEFF/, '');
  const rawDonors = JSON.parse(raw);
  console.log(`📄 Step 2: Loaded ${rawDonors.length} records from Excel extraction.`);

  let insertedCount = 0;
  let updatedCount = 0;
  let peroranganCount = 0;
  let lembagaCount = 0;
  let matchedJamaahCount = 0;
  const updatedJamaahIds = new Set();

  for (const r of rawDonors) {
    const id = (r['ID Donatur'] || '').replace(/^'/, '').trim();
    const no = parseInt(r['No'] || '0', 10);
    const nama = (r['Nama Donatur'] || '').trim();
    const jkRaw = (r['Jenis Kelamin'] || '').trim().toLowerCase();

    // Determine category and gender
    let jenisKelamin = 'Laki-laki';
    let kategori = 'Perorangan';

    const businessKeywords = ['apotek', 'bakso', 'cell', 'toko', 'bengkel', 'cv', 'pt', 'klinik', 'koperasi'];
    const isBusiness = businessKeywords.some(kw => nama.toLowerCase().includes(kw));

    if (isBusiness) {
      jenisKelamin = 'Lainnya / Lembaga';
      kategori = 'Lembaga / Usaha';
      lembagaCount++;
    } else if (jkRaw === 'p') {
      jenisKelamin = 'Perempuan';
      peroranganCount++;
    } else if (jkRaw === 'l') {
      jenisKelamin = 'Laki-laki';
      peroranganCount++;
    } else {
      jenisKelamin = 'Lainnya / Lembaga';
      peroranganCount++;
    }

    // Phone cleanup
    let phoneRaw = (r['HP'] || '').replace(/^'/, '').replace(/[^0-9]/g, '');
    let telepon = null;
    if (phoneRaw.startsWith('62')) {
      telepon = '+' + phoneRaw;
    } else if (phoneRaw.startsWith('0')) {
      telepon = '+62' + phoneRaw.slice(1);
    } else if (phoneRaw.length >= 8) {
      telepon = '+62' + phoneRaw;
    }

    // Email
    const email = (r['Email'] || '').trim() || null;

    // KTP
    const ktpRaw = (r['KTP'] || '').replace(/^'/, '').replace(/[^0-9]/g, '');
    const ktp = ktpRaw.length >= 10 ? ktpRaw : null;

    // Alamat
    const alamat = (r['Alamat'] || '').trim().replace(/\s+/g, ' ') || null;

    // Zawiyah mapping
    const zawiyahRaw = (r['Zawiyah'] || '').trim();
    let zawiyahId = null;
    let zawiyahNama = null;

    if (zawiyahRaw.toLowerCase() === 'pusat') {
      zawiyahId = 'ZW-001';
      zawiyahNama = 'Zawiyah Pusat Tasikmalaya';
    } else if (zawiyahRaw.toLowerCase().includes('tamansari')) {
      zawiyahId = 'ZW-003';
      zawiyahNama = 'Zawiyah Tamansari Kota Tasikmalaya';
    } else if (zawiyahRaw.toLowerCase().includes('ciawi')) {
      zawiyahId = 'ZW-006';
      zawiyahNama = 'Zawiyah Ciawi-Jamanis Kabupaten Tasikmalaya';
    } else if (zawiyahRaw.toLowerCase().includes('pangandaran')) {
      zawiyahId = 'ZW-013';
      zawiyahNama = 'Zawiyah Padaherang Pangandaran';
    } else if (zawiyahRaw.toLowerCase().includes('rajapolah')) {
      zawiyahId = null;
      zawiyahNama = 'Zawiyah Rajapolah Tasikmalaya';
    } else if (alamat) {
      const alamatLower = alamat.toLowerCase();
      if (alamatLower.includes('karawang')) {
        zawiyahId = 'ZW-004';
        zawiyahNama = 'Zawiyah Karawang';
      } else if (alamatLower.includes('cirebon')) {
        const cz = allZawiyah.find(z => z.nama.toLowerCase().includes('cirebon'));
        if (cz) { zawiyahId = cz.id; zawiyahNama = cz.nama; }
      } else if (alamatLower.includes('tasikmalaya') || alamatLower.includes('cisayong')) {
        zawiyahId = 'ZW-001';
        zawiyahNama = 'Zawiyah Pusat Tasikmalaya';
      }
    }

    const parentDonatur = (r['Parent Donatur'] || '').trim() || null;
    const pekerjaan = (r['Pekerjaan'] || '').trim() || null;
    const kantor = (r['Kantor'] || '').trim() || 'Kanwakil Jawa Barat';

    // Cross-match with jamaah
    let matchedJamaah = null;
    if (ktp) {
      matchedJamaah = allJamaah.find(j => j.ktp && j.ktp.replace(/[^0-9]/g, '') === ktp);
    }
    if (!matchedJamaah && telepon) {
      const pDigits = telepon.replace(/[^0-9]/g, '').slice(-8);
      matchedJamaah = allJamaah.find(j => j.telepon && j.telepon.replace(/[^0-9]/g, '').endsWith(pDigits));
    }
    if (!matchedJamaah && nama.length > 3 && !isBusiness) {
      matchedJamaah = allJamaah.find(j => j.nama.trim().toLowerCase() === nama.toLowerCase());
    }

    const jamaahId = matchedJamaah ? matchedJamaah.id : null;
    if (matchedJamaah) {
      matchedJamaahCount++;
      updatedJamaahIds.add(matchedJamaah.id);

      // Update jamaah to ensure agnia_care = 'Ya' and enrich missing attributes
      const updates = ["agnia_care = 'Ya'"];
      const updateParams = [];

      if (!matchedJamaah.telepon && telepon) {
        updates.push('telepon = ?');
        updateParams.push(telepon);
      }
      if (!matchedJamaah.ktp && ktp) {
        updates.push('ktp = ?');
        updateParams.push(ktp);
      }

      const sqlUpdate = `UPDATE jamaah SET ${updates.join(', ')} WHERE id = ?`;
      updateParams.push(matchedJamaah.id);
      await conn.query(sqlUpdate, updateParams);
    }

    // Insert or update donatur table
    const [res] = await conn.query(`
      INSERT INTO donatur (
        id, no_urut, nama, jenis_kelamin, kategori_donatur, telepon, email,
        ktp, alamat, zawiyah_id, zawiyah_nama, parent_donatur, pekerjaan,
        kantor_wilayah, jamaah_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Aktif')
      ON DUPLICATE KEY UPDATE
        no_urut = VALUES(no_urut),
        nama = VALUES(nama),
        jenis_kelamin = VALUES(jenis_kelamin),
        kategori_donatur = VALUES(kategori_donatur),
        telepon = VALUES(telepon),
        email = VALUES(email),
        ktp = VALUES(ktp),
        alamat = VALUES(alamat),
        zawiyah_id = VALUES(zawiyah_id),
        zawiyah_nama = VALUES(zawiyah_nama),
        parent_donatur = VALUES(parent_donatur),
        pekerjaan = VALUES(pekerjaan),
        kantor_wilayah = VALUES(kantor_wilayah),
        jamaah_id = VALUES(jamaah_id),
        status = 'Aktif'
    `, [
      id, no, nama, jenisKelamin, kategori, telepon, email,
      ktp, alamat, zawiyahId, zawiyahNama, parentDonatur, pekerjaan,
      kantor, jamaahId
    ]);

    if (res.affectedRows === 1) {
      insertedCount++;
    } else {
      updatedCount++;
    }
  }

  // 4. Record in audit_logs
  try {
    await conn.query(`
      INSERT INTO audit_logs (username, action, target_table, detail)
      VALUES (?, ?, ?, ?)
    `, [
      'system',
      'MIGRATION',
      'donatur',
      `Migrasi data file "Donatur_kantor kanwakil jawa barat.xls": Total ${rawDonors.length} donatur berhasil disimpan, ${updatedJamaahIds.size} jamaah terhubung dengan status Agnia Care aktif.`
    ]);
    console.log('✅ Audit log recorded.');
  } catch (err) {
    console.warn('⚠️ Could not record audit log:', err.message);
  }

  console.log('\n=============================================');
  console.log('🎉 MIGRASI SELESAI DENGAN SUKSES!');
  console.log('=============================================');
  console.log(`• Total Donatur di Excel     : ${rawDonors.length}`);
  console.log(`• Berhasil Disimpan ke DB     : ${rawDonors.length}`);
  console.log(`• Kategori Perorangan         : ${peroranganCount}`);
  console.log(`• Kategori Lembaga / Usaha    : ${lembagaCount}`);
  console.log(`• Terhubung ke Master Jamaah  : ${updatedJamaahIds.size} jiwa`);
  console.log(`• Status Agnia Care Updated   : ${updatedJamaahIds.size} jamaah`);
  console.log('=============================================\n');

  // Verify by querying count from donatur table
  const [[cnt]] = await conn.query('SELECT COUNT(*) as total FROM donatur');
  console.log('🔍 Verifikasi DB - Total rows in table `donatur`:', cnt.total);

  await conn.end();
}

runMigration().catch(err => {
  console.error('❌ Migration Error:', err);
  process.exit(1);
});
