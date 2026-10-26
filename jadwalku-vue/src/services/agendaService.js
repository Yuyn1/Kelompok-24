// Layanan agenda: logika Tambah Jadwal (CREATE) ke tabel public.agendas di Supabase.
// File ini sengaja berdiri sendiri (tidak mengubah stores/agenda.js milik Anda).
import { supabase } from '../utils/supabase'
import { getSessionUser } from '../stores/session'

// ---------------- Konstanta ----------------
export const KATEGORI_UI = ['Perkuliahan', 'Organisasi', 'Tugas & Ujian']
// Nilai di kolom `category` mengikuti yang dipakai Dashboard Anda
const KATEGORI_DB = { 'Perkuliahan': 'Kuliah', 'Organisasi': 'Organisasi', 'Tugas & Ujian': 'Tugas' }

export const PENGULANGAN = ['Tidak diulang', 'Setiap minggu', 'Dwi-mingguan']
export const HARI = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] // indeks = Date.getDay()
export const PENGINGAT = ['15 menit sebelumnya', '30 menit sebelumnya', '1 jam sebelumnya', '1 hari sebelumnya', 'Tanpa pengingat']
export const MAKS_PERTEMUAN = 60

const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']

// ---------------- Tanggal & jam ----------------
const pad = (n) => String(n).padStart(2, '0')
const isIso = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s || '')
const parse = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d) }

export const toIso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
export const hariIni = () => toIso(new Date())
export const addDays = (iso, n) => { const d = parse(iso); return toIso(new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)) }
export const hariIndex = (iso) => parse(iso).getDay()

export function formatTanggalPanjang(iso) {
  if (!isIso(iso)) return '-'
  const d = parse(iso)
  return `${HARI[d.getDay()]}, ${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`
}

export function formatTanggalPendek(iso) {
  if (!isIso(iso)) return '-'
  const d = parse(iso)
  return `${d.getDate()} ${BULAN[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`
}

export const jamTitik = (t) => (t || '').replace(':', '.')

// '08:00' | '08.00' | '08:00 WIB' -> menit sejak 00.00 (null bila tidak terbaca)
export function keMenit(t) {
  const m = String(t || '').match(/(\d{1,2})[.:](\d{2})/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}

// ---------------- Formulir & draf ----------------
export function defaultForm() {
  const mulai = hariIni()
  return {
    nama: '',
    kategori: 'Perkuliahan',
    penanggungJawab: '',
    tanggalMulai: mulai,
    tanggalSelesai: addDays(mulai, 7 * 15),
    waktuMulai: '08:00',
    waktuSelesai: '09:40',
    pengulangan: 'Tidak diulang',
    hari: `Setiap ${HARI[hariIndex(mulai)]}`,
    lokasi: '',
    pengingat: '30 menit sebelumnya',
  }
}

const DRAFT_KEY = 'jadwalku:draft-v2'
const SAVED_KEY = 'jadwalku:lastSaved-v2'

export function loadDraft() {
  try {
    return { ...defaultForm(), ...(JSON.parse(localStorage.getItem(DRAFT_KEY)) || {}) }
  } catch { return defaultForm() }
}
export const saveDraft = (f) => { try { localStorage.setItem(DRAFT_KEY, JSON.stringify(f)) } catch { /* abaikan */ } }
export const clearDraft = () => { try { localStorage.removeItem(DRAFT_KEY) } catch { /* abaikan */ } }

export function rememberSaved(obj) {
  try { sessionStorage.setItem(SAVED_KEY, JSON.stringify(obj)) } catch { /* abaikan */ }
}
export function recallSaved() {
  try { return JSON.parse(sessionStorage.getItem(SAVED_KEY)) } catch { return null }
}

// ---------------- Pertemuan & validasi (fungsi murni) ----------------
// Satu baris database = satu pertemuan, sama seperti cara Dashboard membaca agenda.
export function buatTanggal(f) {
  if (!isIso(f.tanggalMulai)) return []
  if (f.pengulangan === 'Tidak diulang') return [f.tanggalMulai]
  if (!isIso(f.tanggalSelesai)) return []

  const step = f.pengulangan === 'Dwi-mingguan' ? 14 : 7
  const dow = HARI.indexOf(String(f.hari || '').replace(/^Setiap\s+/i, ''))
  if (dow < 0) return []

  const geser = (dow - hariIndex(f.tanggalMulai) + 7) % 7 // pertemuan pertama = hari terpilih pada/setelah tanggal mulai
  const out = []
  for (let d = addDays(f.tanggalMulai, geser); d <= f.tanggalSelesai && out.length < MAKS_PERTEMUAN; d = addDays(d, step)) out.push(d)
  return out
}

export function validasiLangkah(step, f) {
  if (step === 1) {
    if (!f.nama.trim()) return 'Nama agenda wajib diisi.'
    if (!KATEGORI_UI.includes(f.kategori)) return 'Pilih kategori agenda.'
  }
  if (step === 2) {
    if (!isIso(f.tanggalMulai)) return 'Tanggal mulai wajib diisi.'
    if (!f.waktuMulai || !f.waktuSelesai) return 'Waktu mulai dan selesai wajib diisi.'
    if (f.waktuSelesai <= f.waktuMulai) return 'Waktu selesai harus setelah waktu mulai.'
    if (f.pengulangan !== 'Tidak diulang') {
      if (!isIso(f.tanggalSelesai)) return 'Tanggal selesai wajib diisi untuk agenda berulang.'
      if (f.tanggalSelesai < f.tanggalMulai) return 'Tanggal selesai tidak boleh sebelum tanggal mulai.'
      const t = buatTanggal(f)
      if (!t.length) return 'Tidak ada pertemuan pada hari yang dipilih di rentang tanggal ini.'
      if (t.length >= MAKS_PERTEMUAN && addDays(t[t.length - 1], f.pengulangan === 'Dwi-mingguan' ? 14 : 7) <= f.tanggalSelesai) {
        return `Maksimal ${MAKS_PERTEMUAN} pertemuan sekali simpan. Persempit tanggal selesai.`
      }
    }
  }
  return ''
}

export function validasiSemua(f) {
  return validasiLangkah(1, f) || validasiLangkah(2, f)
}

// Bentrok = tanggal sama dan rentang jam saling tumpang tindih.
// Agenda lama tanpa jam selesai dianggap berdurasi 60 menit.
export function hitungBentrok(existing, tanggalList, mulai, selesai) {
  const dates = new Set(tanggalList)
  const a1 = keMenit(mulai)
  const a2 = keMenit(selesai)
  if (a1 == null || a2 == null) return []

  const out = []
  for (const r of existing) {
    if (!dates.has(r.date)) continue
    const s = keMenit(r.time)
    if (s == null) continue
    const e = keMenit(r.end_time) ?? s + 60
    if (a1 < e && s < a2) out.push({ date: r.date, title: r.title, time: r.time, end_time: r.end_time || '' })
  }
  return out.sort((x, y) => x.date.localeCompare(y.date))
}

// ---------------- Database ----------------
// Pemilik agenda = nilai yang sama dengan yang dipakai Dashboard untuk memuat agenda.
export const pemilik = () => getSessionUser() || null

function pesanError(error) {
  const m = error?.message || ''
  const code = error?.code || ''
  if (code === '42501' || /row-level security/i.test(m)) {
    return 'Ditolak oleh Row Level Security. Jalankan BAGIAN 2 pada sql/01_agendas_create.sql di SQL Editor Supabase.'
  }
  if (code === '42703' || code === 'PGRST204' || /column .* does not exist|could not find the .* column/i.test(m)) {
    return 'Kolom di tabel agendas belum lengkap. Jalankan BAGIAN 1 pada sql/01_agendas_create.sql di SQL Editor Supabase.'
  }
  if (code === '23502') return `Ada kolom wajib yang kosong di database: ${m}`
  if (/failed to fetch|networkerror|load failed/i.test(m)) return 'Tidak dapat terhubung ke Supabase. Periksa koneksi internet dan isi .env.'
  return m || 'Terjadi kesalahan pada database.'
}

export async function cekBentrokDb(f) {
  const email = pemilik()
  const tanggal = buatTanggal(f)
  if (!email || !tanggal.length || !supabase) return []

  const { data, error } = await supabase
    .from('agendas')
    .select('title, date, time, end_time')
    .eq('user_email', email)
    .gte('date', tanggal[0])
    .lte('date', tanggal[tanggal.length - 1])
  if (error) throw new Error(pesanError(error))
  return hitungBentrok(data || [], tanggal, f.waktuMulai, f.waktuSelesai)
}

function uuid() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

// CREATE: menyimpan semua pertemuan sekaligus dalam satu permintaan (semua berhasil atau semua gagal)
export async function createAgendas(f) {
  const err = validasiSemua(f)
  if (err) throw new Error(err)

  const email = pemilik()
  if (!email) throw new Error('Sesi login tidak ditemukan. Silakan masuk kembali.')
  if (!supabase) throw new Error('Koneksi Supabase belum tersedia (cek src/utils/supabase.js dan .env).')

  const tanggal = buatTanggal(f)
  const seriId = uuid()
  const rows = tanggal.map((date) => ({
    user_email: email,
    title: f.nama.trim(),
    category: KATEGORI_DB[f.kategori],
    date,
    time: f.waktuMulai,
    end_time: f.waktuSelesai,
    location: f.lokasi.trim() || null,
    person_in_charge: f.penanggungJawab.trim() || null,
    repeat_type: f.pengulangan,
    reminder: f.pengingat,
    series_id: seriId,
  }))

  const { data, error } = await supabase.from('agendas').insert(rows).select('id, date')
  if (error) throw new Error(pesanError(error))
  return { rows: data || [], seriId, tanggal }
}

// Agenda terdekat berikutnya (untuk kotak "Berikutnya" di halaman konfirmasi)
export async function agendaBerikutnya() {
  const email = pemilik()
  if (!email || !supabase) return null
  const now = new Date()
  const { data, error } = await supabase
    .from('agendas')
    .select('title, date, time, end_time, location')
    .eq('user_email', email)
    .gte('date', toIso(now))
    .order('date', { ascending: true })
    .order('time', { ascending: true })
    .limit(10)
  if (error || !data) return null
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const today = toIso(now)
  return data.find((r) => r.date > today || (keMenit(r.end_time || r.time) ?? 0) >= nowMin) || null
}
