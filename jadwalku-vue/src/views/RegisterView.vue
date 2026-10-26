<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../utils/supabase'
import '../assets/css/login.css'     // Menggunakan gaya dasar login
import '../assets/css/register.css' // Mengimpor CSS modal terpisah

const router = useRouter()

const name = ref('')
const email = ref('')
const password = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
const showSuccessModal = ref(false)

async function handleRegister() {
  const inputName = name.value.trim()
  const inputEmail = email.value.trim()
  const inputPassword = password.value.trim()

  isLoading.value = true
  errorMessage.value = ''

  try {
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', inputEmail)
      .single()

    if (existingUser) {
      errorMessage.value = 'Email ini sudah terdaftar. Silakan langsung masuk.'
      isLoading.value = false
      return
    }

    const { error } = await supabase
      .from('users')
      .insert([{ name: inputName, email: inputEmail, password: inputPassword }])

    if (error) throw error

    isLoading.value = false
    showSuccessModal.value = true

  } catch (err) {
    console.error('Gagal mendaftar:', err.message)
    errorMessage.value = 'Terjadi kesalahan saat mendaftar. Silakan coba lagi.'
    isLoading.value = false
  }
}

function closeModalAndRedirect() {
  showSuccessModal.value = false
  router.push('/login')
}
</script>

<template>
  <div class="page-login">
    <!-- SISI KIRI: BRANDING -->
    <div class="left-panel">
      <div class="brand">
        <div class="brand-icon">📅</div>
        <div class="brand-name">JadwalKu</div>
      </div>

      <div class="left-content">
        <div class="badge">✨ Bergabung dengan JadwalKu</div>
        <h1>Atur jadwal akademikmu dengan lebih mudah dan cerdas.</h1>
        <p>Buat akun dalam hitungan detik dan nikmati pengelolaan jadwal tanpa bentrok.</p>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <span>Pendaftaran instan dan mandiri</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <span>Sinkronisasi data langsung ke database</span>
          </div>
        </div>
      </div>

      <div class="testimonial-box">
        <p class="testimonial-text">"Sangat membantu merapikan jadwal kuliah dan organisasi dalam satu platform."</p>
        <div class="testimonial-author">Mahasiswa Aktif</div>
      </div>
    </div>

    <!-- SISI KANAN: FORM REGISTER -->
    <div class="right-panel">
      <div class="login-card">
        <div class="mobile-brand">
          <div class="brand-icon">📅</div>
          <div class="brand-name">JadwalKu</div>
        </div>

        <div class="login-header">
          <div class="login-subtitle">Pendaftaran Akun Baru</div>
          <h2>Buat akun mahasiswa</h2>
          <p>Masukkan data diri Anda untuk mulai menggunakan kalender akademik.</p>
        </div>

        <div v-if="errorMessage" class="error-alert" role="alert">
          <div class="error-icon">⚠️</div>
          <div>
            <div class="error-title">Pendaftaran Gagal</div>
            <div class="error-desc">{{ errorMessage }}</div>
          </div>
        </div>

        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label class="form-label" for="name">Nama Lengkap</label>
            <input
              id="name"
              v-model="name"
              type="text"
              class="form-input"
              placeholder="Masukkan Nama Anda"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              placeholder="nama@email.com"
              required
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Kata Sandi</label>
            <input
              id="password"
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Buat kata sandi baru"
              required
            >
          </div>

          <button type="submit" class="btn-submit" :disabled="isLoading">
            <span>➔</span> {{ isLoading ? 'Mendaftarkan akun...' : 'Daftar Sekarang' }}
          </button>

          <div style="text-align: center; margin-top: 16px; font-size: 13px; color: #64748B;">
            Sudah punya akun? 
            <router-link to="/login" style="color: #2563EB; font-weight: 600; text-decoration: none;">Masuk di sini</router-link>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL SUKSES KUSTOM -->
    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal-card">
        <div class="modal-icon-container">🎉</div>
        <h3>Pendaftaran Berhasil!</h3>
        <p>Akunmu sudah terdaftar di sistem. Silakan masuk menggunakan email dan kata sandi yang baru saja dibuat.</p>
        <div class="modal-actions">
          <button type="button" class="btn-primary" @click="closeModalAndRedirect">
            Masuk Sekarang
          </button>
        </div>
      </div>
    </div>
  </div>
</template>