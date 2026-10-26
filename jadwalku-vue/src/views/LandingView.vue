<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import '../assets/css/landing.css'

const navLinks = [
  { id: 'beranda', label: 'Beranda' },
  { id: 'fitur', label: 'Fitur' },
  { id: 'carakerja', label: 'Cara Kerja' },
  { id: 'kampus', label: 'Untuk Kampus' },
]

const features = [
  { icon: '🛡️', title: 'Deteksi bentrok otomatis', desc: 'Dapatkan peringatan sebelum kelas, rapat, atau bimbingan saling tumpang tindih.' },
  { icon: '📅', title: 'Semua agenda di satu tempat', desc: 'Gabungkan perkuliahan, organisasi, tugas, dan ujian dalam kalender yang mudah dipindai.' },
  { icon: '🔔', title: 'Pengingat yang relevan', desc: 'Prioritaskan tenggat penting tanpa terganggu notifikasi yang tidak dibutuhkan.' },
]

const steps = [
  { icon: '➀', title: 'Masuk dengan Email Kampus', desc: 'Gunakan akun mahasiswa yang valid untuk mengakses sistem kalender.' },
  { icon: '➁', title: 'Sinkronisasi Jadwal', desc: 'Masukkan jadwal kuliah, tugas, atau kegiatan organisasi ke dalam sistem.' },
  { icon: '➂', title: 'Nikmati Kuliah Tanpa Bentrok', desc: 'Sistem otomatis mendeteksi jadwal yang tumpang tindih agar kamu bisa fokus.' },
]

// ==========================================
// MENGGUNAKAN TANGGAL REFERENSI OKTOBER 2026
// ==========================================
const titleMingguIni = computed(() => {
  return '📅 Minggu ini, 12–18 Oktober'
})

const weekDays = computed(() => {
  return [
    { name: 'SEN', num: 12, today: false, events: [{ title: 'Pemrograman Web', time: '08.00' }, { title: 'Basis Data', time: '13.00' }] },
    // Hari Selasa tanggal 13 ditandai today: true agar kotak dan bulatan birunya aktif
    { name: 'SEL', num: 13, today: true, events: [{ title: 'Praktikum UI/UX', time: '10.00', blue: true }] },
    { name: 'RAB', num: 14, today: false, events: [{ title: 'Bimbingan TA', time: '09.00' }, { title: 'Rapat BEM', time: '15.30' }] },
    { name: 'KAM', num: 15, today: false, events: [{ title: 'Sistem Cerdas', time: '08.00' }] },
    { name: 'JUM', num: 16, today: false, events: [{ title: 'Kuis Jaringan', time: '13.00' }] }
  ]
})

// ==========================================
// SCROLL SPY NAVBAR
// ==========================================
const activeId = ref('beranda')

function updateActive() {
  const y = window.scrollY + 120
  let current = navLinks[0].id
  for (const { id } of navLinks) {
    const el = document.getElementById(id)
    if (el && el.offsetTop <= y) current = id
  }
  activeId.value = current
}

onMounted(() => {
  window.addEventListener('scroll', updateActive, { passive: true })
  updateActive()
})
onBeforeUnmount(() => window.removeEventListener('scroll', updateActive))
</script>

<template>
  <div class="page-landing">
    <!-- NAVBAR -->
    <nav class="navbar">
      <div class="nav-brand">
        <div class="brand-icon">📅</div>
        <span class="brand-title">JadwalKu</span>
      </div>
      <div class="nav-links">
        <a
          v-for="link in navLinks"
          :key="link.id"
          :href="`#${link.id}`"
          class="nav-link"
          :class="{ active: activeId === link.id }"
        >{{ link.label }}</a>
      </div>
      <div class="nav-actions">
        <router-link to="/login" class="btn-primary">Mulai Sekarang ➔</router-link>
      </div>
    </nav>

    <!-- 1. BERANDA -->
    <header id="beranda" class="hero-section">
      <div class="hero-left">
        <div class="hero-badge"><span>✨</span> Dirancang untuk ritme mahasiswa</div>
        <h1>Jadwal kuliah rapi. Fokus belajar kembali.</h1>
        <p class="hero-desc">JadwalKu menyatukan kalender akademik Anda dan memberi peringatan cerdas saat agenda berpotensi bertabrakan.</p>

        <div class="hero-buttons">
          <router-link to="/login" class="btn-primary btn-large">Buat Kalender Saya</router-link>
          <a href="#carakerja" class="btn-outline btn-large">Lihat Cara Kerja</a>
        </div>

        <div class="hero-social-proof">
          <div class="avatar-group">
            <span class="avatar" style="background-color: #2563EB;">AN</span>
            <span class="avatar" style="background-color: #7C3AED;">RP</span>
            <span class="avatar" style="background-color: #059669;">DS</span>
          </div>
          <span class="proof-text"><strong>2.400+ mahasiswa</strong> mengatur minggu mereka</span>
        </div>
      </div>

      <div class="hero-right">
        <div class="calendar-preview-card">
          <div class="calendar-header-card">
            <div class="cal-title">{{ titleMingguIni }}</div>
            <div class="cal-status">✓ Tidak ada bentrok</div>
          </div>

          <div class="calendar-grid">
            <div v-for="day in weekDays" :key="day.num" class="cal-col" :class="{ today: day.today }">
              <div class="day-name">{{ day.name }}</div>
              <div v-if="day.today" class="day-num today-badge-circle">{{ day.num }}</div>
              <div v-else class="day-num">{{ day.num }}</div>

              <div v-for="ev in day.events" :key="ev.title" class="cal-event" :class="{ 'blue-bg': ev.blue }">
                <div class="ev-title">{{ ev.title }}</div>
                <div class="ev-time">{{ ev.time }}</div>
              </div>
            </div>
          </div>

          <div class="cal-footer-alert">
            <span>✨</span>
            <span>Rabu paling padat. Sisakan jeda 30 menit sebelum Rapat BEM.</span>
          </div>
        </div>
      </div>
    </header>

    <!-- 2. FITUR -->
    <section id="fitur" class="features-section">
      <div class="section-subtitle">LEBIH TENANG SETIAP MINGGU</div>
      <h2 class="section-title">Satu kalender untuk seluruh kehidupan kampus</h2>
      <p class="section-note">Mulai dalam hitungan menit. Tidak perlu kartu kredit atau integrasi rumit.</p>

      <div class="features-grid">
        <div v-for="f in features" :key="f.title" class="feature-card">
          <div class="feat-icon-box">{{ f.icon }}</div>
          <h3>{{ f.title }}</h3>
          <p>{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 3. CARA KERJA -->
    <section id="carakerja" class="features-section" style="background-color: #FFFFFF; border-top: 1px solid #E2E8F0; border-bottom: 1px solid #E2E8F0;">
      <div class="section-subtitle">LANGKAH MUDAH</div>
      <h2 class="section-title">Bagaimana JadwalKu bekerja untuk Anda?</h2>
      <p class="section-note">Hanya butuh 3 langkah sederhana untuk merapikan jadwal akademikmu.</p>

      <div class="features-grid">
        <div v-for="s in steps" :key="s.title" class="feature-card">
          <div class="feat-icon-box" style="font-size: 24px; font-family: 'Inter', sans-serif; color: #2563EB;">{{ s.icon }}</div>
          <h3>{{ s.title }}</h3>
          <p>{{ s.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 4. UNTUK KAMPUS -->
    <section id="kampus" class="features-section">
      <div class="section-subtitle">KOLABORASI INSTITUSI</div>
      <h2 class="section-title">Solusi khusus untuk Organisasi &amp; Kampus</h2>
      <p class="section-note">Bantu seluruh mahasiswa dan dosen terhubung dalam satu ekosistem jadwal terpadu.</p>

      <div class="features-grid">
        <div class="feature-card" style="grid-column: span 3; text-align: center; padding: 48px 40px; background: linear-gradient(135deg, #F8FAFC 0%, #EFF6FF 100%); border: 1px solid #E2E8F0;">
          <p style="font-size: 16px; color: #334155; line-height: 1.7; max-width: 800px; margin: 0 auto 24px auto;">
            JadwalKu hadir sebagai jembatan digital yang menyelaraskan ritme akademik antara mahasiswa, dosen, dan pihak rektorat. Dengan sistem sinkronisasi kurikulum terpusat, pengumuman fakultas real-time, serta pemantauan beban studi yang transparan, institusi Anda dapat menciptakan lingkungan kampus yang lebih terstruktur, minim konflik jadwal, dan mendorong produktivitas belajar mengajar secara menyeluruh.
          </p>
          <router-link to="/login" class="btn-primary">Hubungi Tim Kami ➔</router-link>
        </div>
      </div>
    </section>
  </div>
</template>