<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../stores/session'
import { supabase } from '../utils/supabase' // Mengimpor koneksi Supabase
import '../assets/css/login.css'

const router = useRouter()

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const hasError = ref(false)
const isLoading = ref(false)

onMounted(() => {
  const remembered = localStorage.getItem('rememberedEmail')
  if (remembered) {
    email.value = remembered
    remember.value = true
  }
})

function clearError() {
  hasError.value = false
}

// Fungsi Login terkoneksi Supabase Database
async function handleLogin() {
  try {
    // Pastikan kueri mengarah langsung ke tabel users dengan benar
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.value)
      .eq('password', password.value)
      .maybeSingle()

    if (error) throw error

    if (data) {
      // Simpan sesi user yang aktif
      login(data.email) // atau data.name sesuai struktur tabelmu
      alert('Login berhasil!')
      router.push('/dashboard')
    } else {
      alert('Email atau kata sandi salah!')
    }
  } catch (err) {
    console.error('Terjadi kesalahan:', err.message)
    alert('Gagal melakukan login.')
  }
}

function handleForgotPassword() {
  alert('Silakan hubungi administrator kampus untuk pemulihan kata sandi.')
}
</script>

<template>
  <div class="page-login">
    <!-- SISI KIRI: BRANDING & FITUR -->
    <div class="left-panel">
      <div class="brand">
        <div class="brand-icon">📅</div>
        <div class="brand-name">JadwalKu</div>
      </div>

      <div class="left-content">
        <div class="badge">✨ Kalender akademik pintar</div>
        <h1>Kuliah lebih teratur, tanpa jadwal bertabrakan.</h1>
        <p>Susun perkuliahan, rapat organisasi, dan tenggat tugas dalam satu kalender yang otomatis mendeteksi konflik.</p>

        <div class="feature-list">
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <span>Deteksi konflik sebelum agenda disimpan</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <span>Ringkasan beban akademik mingguan</span>
          </div>
          <div class="feature-item">
            <div class="feature-icon">✓</div>
            <span>Pengingat tugas dan ujian tepat waktu</span>
          </div>
        </div>
      </div>

      <div class="testimonial-box">
        <p class="testimonial-text">"JadwalKu membantu saya menghindari rapat BEM yang bersamaan dengan kelas praktikum."</p>
        <div class="testimonial-author">Nadia • Mahasiswa Sistem Informasi</div>
      </div>
    </div>

    <!-- SISI KANAN: FORM LOGIN -->
    <div class="right-panel">
      <div class="login-card">
        <div class="mobile-brand">
          <div class="brand-icon">📅</div>
          <div class="brand-name">JadwalKu</div>
        </div>

        <div class="login-header">
          <div class="login-subtitle">Selamat datang kembali</div>
          <h2>Masuk ke akun mahasiswa</h2>
          <p>Gunakan email terdaftar untuk melanjutkan ke kalender akademik Anda.</p>
        </div>

        <div v-if="hasError" class="error-alert" role="alert">
          <div class="error-icon">⚠️</div>
          <div>
            <div class="error-title">Email atau kata sandi belum tepat</div>
            <div class="error-desc">Periksa kembali email dan kata sandi, lalu coba lagi.</div>
          </div>
        </div>

        <form @submit.prevent="handleLogin">
          <div class="form-group">
            <label class="form-label" for="email">Email</label>
            <input
              id="email"
              v-model="email"
              type="email"
              class="form-input"
              :class="{ error: hasError }"
              placeholder="Masukkan Email (cth: nama@email.com)"
              required
              @input="clearError"
            >
          </div>

          <div class="form-group">
            <label class="form-label" for="password">Kata sandi</label>
            <div class="input-container">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="form-input"
                :class="{ error: hasError }"
                placeholder="Masukkan Password"
                required
                @input="clearError"
              >
              <button
                type="button"
                class="password-toggle"
                :aria-label="showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'"
                @click="showPassword = !showPassword"
              >{{ showPassword ? '🔒' : '👁️' }}</button>
            </div>
            <span v-if="hasError" class="error-helper">⚠️ Periksa kembali email atau kata sandi Anda.</span>
          </div>

          <div class="form-options">
            <label class="remember-me">
              <input v-model="remember" type="checkbox"> Ingat saya
            </label>
            <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">Lupa kata sandi?</a>
          </div>

          <button type="submit" class="btn-submit" :disabled="isLoading">
            <span>➔</span> {{ isLoading ? 'Memeriksa Database...' : 'Masuk ke JadwalKu' }}
          </button>

          <!-- Tautan Tambahan untuk Pindah ke Halaman Daftar -->
          <div style="text-align: center; margin-top: 16px; font-size: 13px; color: #64748B;">
            Belum punya akun? 
            <router-link to="/register" style="color: #2563EB; font-weight: 600; text-decoration: none;">Daftar di sini</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>