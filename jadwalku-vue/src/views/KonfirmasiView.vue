<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { displayName, userInitials } from '../stores/session'
import * as svc from '../services/agendaService'
// Pastikan path dan nama file CSS-nya sesuai dengan yang ada di folder proyek
import '../assets/css/base.css'
import '../assets/css/tambahjadwal.css'

const router = useRouter()

// Data hasil penyimpanan terakhir (dibuat oleh halaman Tambah Jadwal)
const agenda = svc.recallSaved()
if (!agenda) router.replace('/dashboard')

const berikutnya = ref(null)
onMounted(async () => {
  try { berikutnya.value = await svc.agendaBerikutnya() } catch { /* kotak "Berikutnya" disembunyikan */ }
})

const berulang = computed(() => agenda && agenda.pengulangan !== 'Tidak diulang')
const hariNama = computed(() => (agenda ? String(agenda.hari || '').replace(/^Setiap\s+/i, '') : ''))
const kode = computed(() => (agenda ? `JDW-${agenda.tanggalPertama.slice(0, 4)}-${String(agenda.seriId).slice(0, 8).toUpperCase()}` : ''))
const waktu = computed(() => (agenda ? `${svc.jamTitik(agenda.waktuMulai)}–${svc.jamTitik(agenda.waktuSelesai)} WIB` : ''))

const pengulangan = computed(() => {
  if (!agenda) return { title: '', sub: '' }
  if (!berulang.value) return { title: 'Tidak berulang', sub: `Hanya pada ${svc.formatTanggalPendek(agenda.tanggalPertama)}` }
  const title = agenda.pengulangan === 'Dwi-mingguan' ? `Berulang dua minggu sekali pada hari ${hariNama.value}` : `Berulang setiap ${hariNama.value}`
  return { title, sub: `${agenda.jumlah} pertemuan hingga ${svc.formatTanggalPendek(agenda.tanggalTerakhir)}` }
})

function downloadSummary() {
  alert('Mengunduh ringkasan jadwal dalam format PDF...')
}

async function shareClass() {
  try {
    await navigator.clipboard.writeText(window.location.href)
    alert('Tautan ringkasan jadwal berhasil disalin ke clipboard!')
  } catch {
    alert('Tautan tidak dapat disalin otomatis. Salin dari bilah alamat browser.')
  }
}
</script>

<template>
  <div v-if="agenda" class="page-konfirmasi">
    <header class="top-navbar">
      <div class="nav-left">
        <div class="brand-logo">
          <span class="logo-icon">📅</span>
          <span class="logo-text">JadwalKu</span>
        </div>
      </div>
      <div class="nav-center">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input type="text" placeholder="Cari agenda atau mata kuliah">
        </div>
      </div>
      <div class="nav-right">
        <button type="button" class="icon-btn" aria-label="Notifikasi">🔔</button>
        <div class="user-profile">
          <div class="avatar">{{ userInitials }}</div>
          <div class="user-info">
            <span class="user-name">{{ displayName }}</span>
            <span class="user-dept">Teknik Informatika</span>
          </div>
        </div>
        <button type="button" class="btn-add-another" @click="router.push('/tambah-jadwal')">+ Tambah Agenda Lain</button>
      </div>
    </header>

    <main class="page-container">
      <div class="success-header">
        <div class="check-circle">✓</div>
        <h1>Jadwal berhasil disimpan</h1>
        <p>
          {{ agenda.nama }} sudah ditambahkan
          {{ agenda.konflik ? `dan memiliki ${agenda.konflik} bentrok dengan agenda lain.` : 'dan tidak memiliki konflik dengan agenda lain.' }}
        </p>
      </div>

      <div class="confirmation-grid">
        <section class="summary-card">
          <div class="summary-card-header">
            <div>
              <span class="summary-badge-label">RINGKASAN JADWAL</span>
              <h2>{{ kode }}</h2>
            </div>
            <span class="status-confirmed-pill">🛡️ Terkonfirmasi</span>
          </div>

          <div class="summary-card-body">
            <div class="course-info-box">
              <div class="course-icon">📖</div>
              <div class="course-details">
                <span class="course-category">{{ agenda.kategori.toUpperCase() }}</span>
                <h3>{{ agenda.nama }}</h3>
                <p>{{ agenda.penanggungJawab || 'Tanpa penanggung jawab' }}</p>
              </div>
            </div>

            <div class="info-three-grid">
              <div class="info-tile">
                <span class="tile-icon">📅</span>
                <div>
                  <span class="tile-label">Hari &amp; tanggal</span>
                  <strong>{{ svc.formatTanggalPanjang(agenda.tanggalPertama) }}</strong>
                </div>
              </div>
              <div class="info-tile">
                <span class="tile-icon">🕒</span>
                <div>
                  <span class="tile-label">Waktu</span>
                  <strong>{{ waktu }}</strong>
                </div>
              </div>
              <div class="info-tile">
                <span class="tile-icon">📍</span>
                <div>
                  <span class="tile-label">Lokasi</span>
                  <strong>{{ agenda.lokasi || 'Belum ditentukan' }}</strong>
                </div>
              </div>
            </div>

            <div class="repeat-reminder-box">
              <div class="repeat-left">
                <span class="box-icon">🔄</span>
                <div>
                  <strong>{{ pengulangan.title }}</strong>
                  <small>{{ pengulangan.sub }}</small>
                </div>
              </div>
              <div class="reminder-right">
                <span class="bell-icon">🔔</span>
                <span>{{ agenda.pengingat }}</span>
              </div>
            </div>

            <div class="conflict-safe-box" :class="{ warn: agenda.konflik }">
              <span class="safe-icon">{{ agenda.konflik ? '⚠️' : '🛡️' }}</span>
              <div>
                <strong>{{ agenda.konflik ? `${agenda.konflik} bentrok terdeteksi` : 'Pemeriksaan konflik selesai' }}</strong>
                <p v-if="agenda.konflik">Agenda tetap tersimpan. Periksa kalender untuk menyesuaikan jadwal yang bertabrakan.</p>
                <p v-else>Semua {{ agenda.jumlah }} pertemuan aman dari bentrok dengan agenda lain.</p>
              </div>
            </div>
          </div>
        </section>

        <aside class="action-sidebar">
          <div class="action-card">
            <h3>Apa selanjutnya?</h3>
            <p class="action-subtitle">Kalender Anda sudah diperbarui dan siap digunakan.</p>

            <div class="action-buttons-group">
              <button type="button" class="btn-primary-action" @click="router.push('/dashboard')">📅 Lihat di Kalender</button>
              <button type="button" class="btn-outline-action" @click="downloadSummary">📥 Unduh Ringkasan</button>
              <button type="button" class="btn-outline-action" @click="shareClass">🔗 Bagikan ke Teman Kelas</button>
            </div>

            <div v-if="berikutnya" class="next-agenda-box">
              <div class="next-header">
                <span class="next-icon">🔔</span>
                <span class="next-title">Berikutnya</span>
              </div>
              <h4>{{ berikutnya.title }}</h4>
              <p class="next-time">{{ svc.formatTanggalPendek(berikutnya.date) }} • {{ svc.jamTitik(berikutnya.time) }}{{ berikutnya.end_time ? `–${svc.jamTitik(berikutnya.end_time)}` : '' }}</p>
              <span v-if="berikutnya.location" class="next-location">{{ berikutnya.location }}</span>
            </div>

            <div class="sync-footer-note">
              <span>☁️ Tersimpan di Supabase</span>
            </div>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>
