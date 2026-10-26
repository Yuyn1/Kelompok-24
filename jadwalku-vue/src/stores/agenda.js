import { ref } from 'vue'

// "Hari ini" pada data contoh (sesuai tampilan mockup)
export const TODAY_ISO = '2026-10-14'

// Daftar agenda dipakai bersama oleh kalender dan tabel Daftar Agenda
export const events = ref([
  { id: 1, date: '2026-10-02', label: 'Pemrograman', nama: 'Pemrograman', kategori: 'Perkuliahan', pill: 'purple', time: '08.00', lokasi: 'Ruang Kelas 1.1', detailKey: 'pemrograman' },
  { id: 2, date: '2026-10-04', label: 'Rapat BEM', nama: 'Rapat BEM', kategori: 'Organisasi', pill: 'purple', time: '15.30', lokasi: 'Ruang Rapat Ormawa', detailKey: 'rapat bem' },
  { id: 3, date: '2026-10-08', label: 'Basis Data', nama: 'Basis Data', kategori: 'Perkuliahan', pill: 'blue', time: '10.00', lokasi: 'Ruang Lab 2.1', detailKey: 'basis data' },
  { id: 4, date: '2026-10-10', label: 'Deadline Tugas', nama: 'Deadline Tugas', kategori: 'Tugas & Ujian', pill: 'green', time: '23.59', lokasi: 'Portal E-Learning', detailKey: 'deadline tugas' },
  { id: 5, date: '2026-10-14', label: 'Pemrograman', nama: 'Mata Kuliah Pemrograman Web', kategori: 'Perkuliahan', pill: 'blue', time: '08.00', lokasi: 'Ruang Lab 3.2', detailKey: 'pemrograman' },
  { id: 6, date: '2026-10-14', label: 'Rapat BEM', nama: 'Rapat Organisasi BEM', kategori: 'Organisasi', pill: 'purple', time: '15.30', lokasi: 'Sekretariat BEM', detailKey: 'rapat bem' },
  { id: 7, date: '2026-10-16', label: 'Presentasi', nama: 'Presentasi', kategori: 'Tugas & Ujian', pill: 'orange', time: '09.00', lokasi: 'Ruang Seminar A', detailKey: 'presentasi' },
  { id: 8, date: '2026-10-18', label: 'Rapat BEM', nama: 'Rapat BEM', kategori: 'Organisasi', pill: 'purple', time: '15.30', lokasi: 'Sekretariat BEM', detailKey: 'rapat bem' },
])

// Keterangan lengkap untuk modal detail (tanggal diambil dari agenda yang diklik)
export const agendaDetails = {
  'pemrograman': {
    kategori: '📖 Perkuliahan',
    judul: 'Mata Kuliah Pemrograman Web',
    kode: 'IF305 • Kelas A • 3 SKS',
    waktu: '08.00–09.40 WIB',
    lokasi: 'Lab Komputer 3.2, Gedung Informatika',
    dosen: 'Dr. Rina Kurniawati, M.Kom.',
    pengulangan: 'Setiap Rabu hingga 16 Desember 2026',
    pengingat: '30 menit sebelum kelas',
    catatan: 'Bawa laptop dan pastikan Node.js versi terbaru sudah terpasang untuk praktikum React.',
    statusSafe: true,
    statusJudul: 'Tidak ada konflik jadwal',
    statusSub: 'Slot sebelum dan sesudah kelas memiliki jeda yang cukup.',
  },
  'rapat bem': {
    kategori: '🏛️ Organisasi',
    judul: 'Rapat Organisasi BEM',
    kode: 'ORG01 • Departemen Kestari',
    waktu: '15.30–17.00 WIB',
    lokasi: 'Ruang Sekretariat BEM Lt. 2',
    dosen: 'Ketua BEM / Sekjen',
    pengulangan: 'Dwi-mingguan',
    pengingat: '1 jam sebelum kegiatan',
    catatan: 'Pembahasan evaluasi program kerja bulan Oktober dan persiapan agenda pekan depan.',
    statusSafe: false,
    statusJudul: 'Peringatan Bentrok Waktu',
    statusSub: 'Jadwal berdekatan dengan jam praktikum laboratorium.',
  },
  'basis data': {
    kategori: '📖 Perkuliahan',
    judul: 'Mata Kuliah Basis Data',
    kode: 'IF201 • Kelas B • 3 SKS',
    waktu: '10.00–11.40 WIB',
    lokasi: 'Ruang Teori 204, Gedung B',
    dosen: 'Ir. Ahmad Fauzi, M.T.',
    pengulangan: 'Setiap Rabu',
    pengingat: '15 menit sebelum kelas',
    catatan: 'Pelajari konsep ERD dan Normalisasi database SQL.',
    statusSafe: true,
    statusJudul: 'Tidak ada konflik jadwal',
    statusSub: 'Slot sebelum dan sesudah kelas memiliki jeda yang cukup.',
  },
  'deadline tugas': {
    kategori: '📝 Tugas & Ujian',
    judul: 'Deadline Tugas Akhir Praktikum',
    kode: 'TGS03 • Individu',
    waktu: '23.59 WIB',
    lokasi: 'Portal LMS Kampus',
    dosen: 'Tim Asisten Laboratorium',
    pengulangan: 'Tidak ada',
    pengingat: '2 jam sebelum deadline',
    catatan: 'Unggah berkas ZIP source code dan laporan PDF sesuai standar format penugasan.',
    statusSafe: true,
    statusJudul: 'Tugas Jatuh Tempo',
    statusSub: 'Pastikan file sudah terunggah sebelum pukul 23.59 WIB.',
  },
  'presentasi': {
    kategori: '📝 Tugas & Ujian',
    judul: 'Presentasi Proyek Kelompok',
    kode: 'PRJ02 • Kelompok 4',
    waktu: '09.00–11.00 WIB',
    lokasi: 'Ruang Seminar Utama',
    dosen: 'Dosen Penguji & Asisten',
    pengulangan: 'Tidak ada',
    pengingat: '45 menit sebelum acara',
    catatan: 'Siapkan slide presentasi dan prototipe web interaktif yang siap didemokan.',
    statusSafe: true,
    statusJudul: 'Tidak ada konflik jadwal',
    statusSub: 'Slot ruangan sudah terkonfirmasi.',
  },
}

// ----- Formulir Tambah Jadwal: draf & hasil simpan terakhir -----
const DRAFT_KEY = 'jadwalku:draft'
const SAVED_KEY = 'jadwalku:lastSaved'

export const defaultForm = () => ({
  nama: 'Mata Kuliah Pemrograman Web',
  kategori: 'Perkuliahan',
  penanggungJawab: 'Dr. Rina Kurniawati, M.Kom.',
  tanggalMulai: 'Rabu, 21 Oktober 2026',
  tanggalSelesai: 'Rabu, 16 Desember 2026',
  waktuMulai: '08.00 WIB',
  waktuSelesai: '09.40 WIB',
  pengulangan: 'Setiap minggu',
  hari: 'Setiap Rabu',
  lokasi: 'Lab Komputer 3.2, Gedung Informatika',
  pengingat: '30 menit sebelumnya',
})

function readJson(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function writeJson(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch { /* abaikan */ }
}

export const loadDraft = () => ({ ...defaultForm(), ...(readJson(DRAFT_KEY) || {}) })
export const saveDraft = (form) => writeJson(DRAFT_KEY, form)
export const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY) } catch { /* abaikan */ } }

export const saveLastAgenda = (form) => writeJson(SAVED_KEY, form)
export const loadLastAgenda = () => ({ ...defaultForm(), ...(readJson(SAVED_KEY) || {}) })
