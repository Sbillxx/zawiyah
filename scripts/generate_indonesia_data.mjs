import indonesiaMap from '@svg-maps/indonesia';
import fs from 'fs';

const provinces = indonesiaMap.locations.map(loc => ({
  id: loc.id,
  name: loc.name,
  path: loc.path
}));

// Real Zawiyah Nodes across Indonesia
// Centered around Tasikmalaya (epicenter / pusat) and extending to branches
const zawiyahNodes = [
  // Pusat & Priangan Timur
  {
    id: 'ZW-001',
    nama: 'Zawiyah Pusat Tasikmalaya',
    kota: 'Tasikmalaya',
    provinsi: 'Jawa Barat',
    tipe: 'Pusat',
    jamaah: 961,
    pengurus: 'K.H. Ahmad Noer & Pengurus Pusat',
    x: 226,
    y: 252,
    klaster: 'Priangan Timur (Pusat Tarekat)',
    deskripsi: 'Pusat kemursyidan, Pesantren Pagendingan, dan majelis dzikir utama.'
  },
  {
    id: 'ZW-002',
    nama: 'Zawiyah Salopa Kabupaten Tasikmalaya',
    kota: 'Tasikmalaya',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 438,
    pengurus: 'Ust. Pengurus Salopa',
    x: 224,
    y: 255,
    klaster: 'Priangan Timur (Pusat Tarekat)',
    deskripsi: 'Basis pembinaan jamaah wilayah Tasikmalaya Selatan dan majelis dzikir berkala.'
  },
  {
    id: 'ZW-003',
    nama: 'Zawiyah Tamansari Kota Tasikmalaya',
    kota: 'Tasikmalaya',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 301,
    pengurus: 'Ust. Pengurus Tamansari',
    x: 227,
    y: 253,
    klaster: 'Priangan Timur (Pusat Tarekat)',
    deskripsi: 'Pemberdayaan sosial jamaah perkotaan dan kajian tafsir rutin.'
  },
  {
    id: 'ZW-005',
    nama: 'Zawiyah Purbaratu Kota Tasikmalaya',
    kota: 'Tasikmalaya',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 258,
    pengurus: 'Ust. Pengurus Purbaratu',
    x: 228,
    y: 251,
    klaster: 'Priangan Timur (Pusat Tarekat)',
    deskripsi: 'Kaderisasi santri madrasah diniyah dan gerakan infaq shadaqah.'
  },
  {
    id: 'ZW-006',
    nama: 'Zawiyah Ciawi-Jamanis Kab. Tasikmalaya',
    kota: 'Tasikmalaya',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 257,
    pengurus: 'Ust. Pengurus Ciawi',
    x: 225,
    y: 248,
    klaster: 'Priangan Timur (Pusat Tarekat)',
    deskripsi: 'Halaqah dzikir jalur Tasikmalaya utara menuju perbatasan Ciamis.'
  },
  {
    id: 'ZW-008',
    nama: 'Zawiyah Ciamis',
    kota: 'Ciamis',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 154,
    pengurus: 'Ust. Pengurus Ciamis',
    x: 231,
    y: 251,
    klaster: 'Priangan Timur (Pusat Tarekat)',
    deskripsi: 'Sentra dakwah Kabupaten Ciamis dengan pembinaan pemuda dan majelis taklim.'
  },
  {
    id: 'ZW-014',
    nama: 'Zawiyah Pangandaran',
    kota: 'Pangandaran',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 102,
    pengurus: 'Ust. Pengurus Pangandaran',
    x: 233,
    y: 258,
    klaster: 'Priangan Timur (Pusat Tarekat)',
    deskripsi: 'Pemberdayaan ekonomi nelayan jamaah dan dakwah pesisir.'
  },
  {
    id: 'ZW-015',
    nama: 'Zawiyah Garut',
    kota: 'Garut',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 40,
    pengurus: 'Ust. Pengurus Garut',
    x: 220,
    y: 252,
    klaster: 'Priangan Timur (Pusat Tarekat)',
    deskripsi: 'Jaringan majelis dzikir Priangan barat daya.'
  },

  // Pantura & Koridor Industri
  {
    id: 'ZW-004',
    nama: 'Zawiyah Karawang',
    kota: 'Karawang',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 260,
    pengurus: 'Ust. Pengurus Karawang',
    x: 206,
    y: 235,
    klaster: 'Pantura & Kawasan Industri',
    deskripsi: 'Sentra dakwah buruh industri, kajian ba’da maghrib, dan koperasi syariah.'
  },
  {
    id: 'ZW-016',
    nama: 'Zawiyah Cikampek',
    kota: 'Cikampek',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 78,
    pengurus: 'Ust. Pengurus Cikampek',
    x: 210,
    y: 236,
    klaster: 'Pantura & Kawasan Industri',
    deskripsi: 'Simpul penghubung transportasi darat jalur pantura dan majelis dzikir.'
  },
  {
    id: 'ZW-017',
    nama: 'Zawiyah Subang',
    kota: 'Subang',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 56,
    pengurus: 'Ust. Pengurus Subang',
    x: 215,
    y: 237,
    klaster: 'Pantura & Kawasan Industri',
    deskripsi: 'Pembinaan jamaah pedesaan agraris dan pengajian rutinan.'
  },
  {
    id: 'ZW-018',
    nama: 'Zawiyah Purwakarta',
    kota: 'Purwakarta',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 40,
    pengurus: 'Ust. Pengurus Purwakarta',
    x: 209,
    y: 240,
    klaster: 'Pantura & Kawasan Industri',
    deskripsi: 'Majelis dzikir malam Jum’at dan santunan yatim piatu.'
  },

  // Megapolitan Jabodetabek & Banten
  {
    id: 'ZW-009',
    nama: 'Zawiyah Tanjungsari Bogor',
    kota: 'Bogor',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 143,
    pengurus: 'Ust. Pengurus Bogor',
    x: 198,
    y: 242,
    klaster: 'Megapolitan Jabodetabek',
    deskripsi: 'Pusat koordinasi dakwah wilayah Bogor dan sentra perkebunan jamaah.'
  },
  {
    id: 'ZW-010',
    nama: 'Zawiyah Tangerang',
    kota: 'Tangerang',
    provinsi: 'Banten',
    tipe: 'Cabang',
    jamaah: 135,
    pengurus: 'Ust. Pengurus Tangerang',
    x: 188,
    y: 237,
    klaster: 'Megapolitan Jabodetabek',
    deskripsi: 'Sentra donatur Agnia Care Banten dan majelis taklim profesional perkotaan.'
  },
  {
    id: 'ZW-019',
    nama: 'Zawiyah Jakarta Timur & Pusat',
    kota: 'Jakarta',
    provinsi: 'DKI Jakarta',
    tipe: 'Cabang',
    jamaah: 22,
    pengurus: 'Ust. Pengurus Jakarta',
    x: 195,
    y: 235,
    klaster: 'Megapolitan Jabodetabek',
    deskripsi: 'Halaqah pengusaha muslim dan koordinasi program kemitraan nasional.'
  },
  {
    id: 'ZW-020',
    nama: 'Zawiyah Bekasi & Cikarang',
    kota: 'Bekasi',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 55,
    pengurus: 'Ust. Pengurus Bekasi',
    x: 201,
    y: 235,
    klaster: 'Megapolitan Jabodetabek',
    deskripsi: 'Majelis taklim keluarga muda dan kajian fiqih muamalah.'
  },

  // Bandung Raya
  {
    id: 'ZW-013',
    nama: 'Zawiyah Bandung Raya',
    kota: 'Bandung',
    provinsi: 'Jawa Barat',
    tipe: 'Cabang',
    jamaah: 73,
    pengurus: 'Ust. Pengurus Bandung',
    x: 213,
    y: 246,
    klaster: 'Bandung Raya & Priangan Barat',
    deskripsi: 'Sentra dakwah mahasiswa kampus, intelektual, dan pembinaan pemuda.'
  },

  // Jawa Tengah & DIY
  {
    id: 'ZW-021',
    nama: 'Zawiyah Jawa Tengah & DIY',
    kota: 'Semarang',
    provinsi: 'Jawa Tengah',
    tipe: 'Perwakilan',
    jamaah: 134,
    pengurus: 'Ust. Pengurus Jateng',
    x: 260,
    y: 250,
    klaster: 'Jawa Tengah & DI Yogyakarta',
    deskripsi: 'Koordinasi perwakilan cabang Semarang, Solo, dan Yogyakarta.'
  },

  // Jawa Timur & Luar Jawa
  {
    id: 'ZW-022',
    nama: 'Zawiyah Jawa Timur',
    kota: 'Surabaya',
    provinsi: 'Jawa Timur',
    tipe: 'Perwakilan',
    jamaah: 85,
    pengurus: 'Ust. Pengurus Jatim',
    x: 315,
    y: 252,
    klaster: 'Jawa Timur & Indonesia Timur',
    deskripsi: 'Jaringan silaturahmi jamaah tapal kuda dan Jawa Timur.'
  },
  {
    id: 'ZW-023',
    nama: 'Zawiyah Perwakilan Sumatera (Lampung & Medan)',
    kota: 'Lampung',
    provinsi: 'Lampung',
    tipe: 'Perwakilan',
    jamaah: 68,
    pengurus: 'Ust. Pengurus Sumatera',
    x: 165,
    y: 212,
    klaster: 'Sumatera & Luar Pulau',
    deskripsi: 'Simpul dakwah lintas selat Sunda, pembinaan transmigran jamaah, dan Agnia Care.'
  },
  {
    id: 'ZW-024',
    nama: 'Zawiyah Perwakilan Kalimantan (Balikpapan & Pontianak)',
    kota: 'Balikpapan',
    provinsi: 'Kalimantan Timur',
    tipe: 'Perwakilan',
    jamaah: 45,
    pengurus: 'Ust. Pengurus Kalimantan',
    x: 367,
    y: 135,
    klaster: 'Sumatera & Luar Pulau',
    deskripsi: 'Majelis dzikir perwakilan pulau Kalimantan dan dakwah perantau.'
  },
  {
    id: 'ZW-025',
    nama: 'Zawiyah Perwakilan Sulawesi (Makassar)',
    kota: 'Makassar',
    provinsi: 'Sulawesi Selatan',
    tipe: 'Perwakilan',
    jamaah: 32,
    pengurus: 'Ust. Pengurus Makassar',
    x: 439,
    y: 215,
    klaster: 'Sumatera & Luar Pulau',
    deskripsi: 'Jaringan dakwah Indonesia bagian timur.'
  },
  {
    id: 'ZW-026',
    nama: 'Zawiyah Perwakilan Nusa Tenggara (Lombok)',
    kota: 'Mataram',
    provinsi: 'Nusa Tenggara Barat',
    tipe: 'Perwakilan',
    jamaah: 28,
    pengurus: 'Ust. Pengurus Lombok',
    x: 387,
    y: 275,
    klaster: 'Jawa Timur & Indonesia Timur',
    deskripsi: 'Halaqah dzikir dan pembinaan santri kepulauan Nusa Tenggara.'
  }
];

// Connecting Arcs emanating from epicenter Tasikmalaya (x: 226, y: 252)
const epicenter = { x: 226, y: 252 };
const corridorArcs = [
  // To Priangan hubs
  { id: 'arc-ciamis', fromName: 'Tasikmalaya', toName: 'Ciamis', d: 'M 226,252 Q 228,249 231,251' },
  { id: 'arc-pangandaran', fromName: 'Tasikmalaya', toName: 'Pangandaran', d: 'M 226,252 Q 230,256 233,258' },
  { id: 'arc-garut', fromName: 'Tasikmalaya', toName: 'Garut', d: 'M 226,252 Q 223,251 220,252' },
  // To Bandung
  { id: 'arc-bandung', fromName: 'Tasikmalaya', toName: 'Bandung', d: 'M 226,252 Q 220,248 213,246' },
  // To Pantura & Karawang
  { id: 'arc-karawang', fromName: 'Tasikmalaya', toName: 'Karawang', d: 'M 226,252 Q 212,240 206,235' },
  // To Jabodetabek
  { id: 'arc-bogor', fromName: 'Tasikmalaya', toName: 'Bogor', d: 'M 226,252 Q 208,245 198,242' },
  { id: 'arc-tangerang', fromName: 'Tasikmalaya', toName: 'Tangerang', d: 'M 226,252 Q 204,240 188,237' },
  { id: 'arc-jakarta', fromName: 'Tasikmalaya', toName: 'Jakarta', d: 'M 226,252 Q 208,238 195,235' },
  // To Jawa Tengah
  { id: 'arc-jateng', fromName: 'Tasikmalaya', toName: 'Semarang', d: 'M 226,252 Q 242,246 260,250' },
  // To Jawa Timur
  { id: 'arc-jatim', fromName: 'Tasikmalaya', toName: 'Surabaya', d: 'M 226,252 Q 270,242 315,252' },
  // To Sumatera / Lampung
  { id: 'arc-sumatera', fromName: 'Tasikmalaya', toName: 'Lampung', d: 'M 226,252 Q 190,225 165,212' },
  // To Kalimantan
  { id: 'arc-kalimantan', fromName: 'Tasikmalaya', toName: 'Kalimantan', d: 'M 226,252 Q 300,180 367,135' },
  // To Sulawesi
  { id: 'arc-sulawesi', fromName: 'Tasikmalaya', toName: 'Sulawesi', d: 'M 226,252 Q 330,220 439,215' },
  // To Nusa Tenggara / Bali
  { id: 'arc-nusatenggara', fromName: 'Tasikmalaya', toName: 'Lombok', d: 'M 226,252 Q 310,270 387,275' }
];

const regionalClusters = [
  {
    nama: 'Priangan Timur (Pusat Tarekat)',
    singkatan: 'Priangan Timur',
    totalCabang: 16,
    totalJamaah: 3026,
    pusatWilayah: 'Tasikmalaya, Ciamis & Pangandaran',
    deskripsi: 'Basis utama Tarekat Idrisiyyah dengan Pesantren Pagendingan, Masjid Al-Fattah, dan jaringan halaqah dzikir terpadat di Indonesia.',
    highlightZawiyah: ['Zawiyah Pusat Tasikmalaya (961 Jamaah)', 'Zawiyah Salopa (438 Jamaah)', 'Zawiyah Tamansari (301 Jamaah)', 'Zawiyah Ciamis (154 Jamaah)'],
    donaturAgnia: 285
  },
  {
    nama: 'Megapolitan Jabodetabek & Banten',
    singkatan: 'Jabodetabek & Banten',
    totalCabang: 16,
    totalJamaah: 449,
    pusatWilayah: 'Bogor, Tangerang, Jakarta & Bekasi',
    deskripsi: 'Pusat jejaring profesional muslim, korporasi donatur Agnia Care Kanwakil Jawa Barat, dan pembinaan keluarga perkotaan.',
    highlightZawiyah: ['Zawiyah Tanjungsari Bogor (143 Jamaah)', 'Zawiyah Tangerang (135 Jamaah)', 'Zawiyah Bekasi (55 Jamaah)', 'Zawiyah Jakarta (22 Jamaah)'],
    donaturAgnia: 146
  },
  {
    nama: 'Pantura & Kawasan Industri',
    singkatan: 'Pantura & Industri',
    totalCabang: 4,
    totalJamaah: 434,
    pusatWilayah: 'Karawang, Cikampek & Subang',
    deskripsi: 'Kawasan pemberdayaan ekonomi karyawan industri, koperasi jamaah syariah, serta majelis taklim ba’da kerja.',
    highlightZawiyah: ['Zawiyah Karawang (260 Jamaah)', 'Zawiyah Cikampek (78 Jamaah)', 'Zawiyah Subang (56 Jamaah)', 'Zawiyah Purwakarta (40 Jamaah)'],
    donaturAgnia: 48
  },
  {
    nama: 'Jawa Tengah & DI Yogyakarta',
    singkatan: 'Jateng & DIY',
    totalCabang: 7,
    totalJamaah: 134,
    pusatWilayah: 'Semarang, Solo & Yogyakarta',
    deskripsi: 'Simpul pembinaan tradisi keilmuan pesantren salafiah, kajian tasawuf, dan ukhuwah kejamaahan Jawa Tengah.',
    highlightZawiyah: ['Zawiyah Perwakilan Semarang', 'Zawiyah Solo Raya', 'Zawiyah D.I. Yogyakarta'],
    donaturAgnia: 22
  },
  {
    nama: 'Bandung Raya & Priangan Barat',
    singkatan: 'Bandung Raya',
    totalCabang: 4,
    totalJamaah: 120,
    pusatWilayah: 'Kota Bandung & sekitarnya',
    deskripsi: 'Pusat gerakan kaderisasi pemuda milenial, dakwah kampus, dan kajian keagamaan kontemporer.',
    highlightZawiyah: ['Zawiyah Bandung Raya (73 Jamaah)', 'Zawiyah Cimahi', 'Zawiyah Sukabumi'],
    donaturAgnia: 18
  },
  {
    nama: 'Jawa Timur & Indonesia Timur',
    singkatan: 'Jatim & Timur',
    totalCabang: 6,
    totalJamaah: 145,
    pusatWilayah: 'Surabaya, Malang, Lombok & Makassar',
    deskripsi: 'Jaringan zawiyah pesisir timur nusantara dan simpul perwakilan Sulawesi serta Nusa Tenggara.',
    highlightZawiyah: ['Zawiyah Jawa Timur (Surabaya)', 'Zawiyah Mataram Lombok', 'Zawiyah Makassar'],
    donaturAgnia: 15
  },
  {
    nama: 'Sumatera & Kalimantan',
    singkatan: 'Luar Pulau',
    totalCabang: 5,
    totalJamaah: 113,
    pusatWilayah: 'Lampung, Medan, Balikpapan & Pontianak',
    deskripsi: 'Perwakilan dakwah diaspora jamaah transmigran, perkebunan kelapa sawit, dan pertambangan.',
    highlightZawiyah: ['Zawiyah Lampung', 'Zawiyah Medan', 'Zawiyah Balikpapan'],
    donaturAgnia: 12
  }
];

const fileContent = `// Authentic Republic of Indonesia Map Data for SAJADA
// Sourced from official administrative boundaries & active database SSOT

export interface ProvinceGeoData {
  id: string;
  name: string;
  path: string;
}

export interface ZawiyahMapNode {
  id: string;
  nama: string;
  kota: string;
  provinsi: string;
  tipe: 'Pusat' | 'Cabang' | 'Perwakilan';
  jamaah: number;
  pengurus: string;
  x: number;
  y: number;
  klaster: string;
  deskripsi: string;
}

export interface CorridorArc {
  id: string;
  fromName: string;
  toName: string;
  d: string;
}

export interface RegionalCluster {
  nama: string;
  singkatan: string;
  totalCabang: number;
  totalJamaah: number;
  pusatWilayah: string;
  deskripsi: string;
  highlightZawiyah: string[];
  donaturAgnia: number;
}

export const MAP_DIMENSIONS = {
  viewBox: '0 29 793 288',
  width: 793,
  height: 288,
};

export const INDONESIA_PROVINCES: ProvinceGeoData[] = ${JSON.stringify(provinces, null, 2)};

export const ZAWIYAH_NODES: ZawiyahMapNode[] = ${JSON.stringify(zawiyahNodes, null, 2)};

export const CORRIDOR_ARCS: CorridorArc[] = ${JSON.stringify(corridorArcs, null, 2)};

export const REGIONAL_CLUSTERS: RegionalCluster[] = ${JSON.stringify(regionalClusters, null, 2)};
`;

fs.writeFileSync('app/data/indonesiaMapData.ts', fileContent);
console.log('Successfully written app/data/indonesiaMapData.ts');
