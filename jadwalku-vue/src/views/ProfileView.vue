<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getSessionUser } from '../stores/session'
import { supabase } from '../utils/supabase'
import '../assets/css/profile.css'

const router = useRouter()
const currentUserEmail = ref('')
const isLoading = ref(false)
const isUploading = ref(false)

// State Profil Akademik & Profesional
const profileData = ref({
  name: '',
  nim: '',
  faculty: '',
  major: '',
  semester: 'Semester 1',
  bio: '',
  avatar_url: null
})

// State Modal Notifikasi
const modalState = ref({
  show: false,
  title: '',
  message: '',
  type: 'info'
})

function showNotification(titleText, messageText, typeStyle = 'info') {
  modalState.value = { show: true, title: titleText, message: messageText, type: typeStyle }
}

function closeNotification() {
  modalState.value.show = false
}

onMounted(async () => {
  const userEmail = getSessionUser()
  if (!userEmail) {
    router.push('/login')
    return
  }
  currentUserEmail.value = userEmail
  await fetchUserProfile()
})

// Mengambil data pengguna dari Supabase
async function fetchUserProfile() {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('users')
      .select('name, nim, faculty, major, semester, bio, avatar_url')
      .eq('email', currentUserEmail.value)
      .single()

    if (error) throw error

    if (data) {
      profileData.value = {
        name: data.name || '',
        nim: data.nim || '',
        faculty: data.faculty || '',
        major: data.major || '',
        semester: data.semester || 'Semester 1',
        bio: data.bio || '',
        avatar_url: data.avatar_url || null
      }
    }
  } catch (err) {
    console.error('Gagal memuat profil:', err.message)
  } finally {
    isLoading.value = false
  }
}

// Inisial untuk placeholder avatar jika belum ada foto
const userInitial = computed(() => {
  if (profileData.value.name) return profileData.value.name.charAt(0).toUpperCase()
  return currentUserEmail.value.charAt(0).toUpperCase()
})

// FUNGSI UPLOAD FOTO PROFIL KE SUPABASE STORAGE
async function handleAvatarUpload(event) {
  const file = event.target.files[0]
  if (!file) return

  // Validasi ukuran (Max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    showNotification('Ukuran Terlalu Besar', 'Foto profil tidak boleh lebih dari 2MB.', 'error')
    return
  }

  isUploading.value = true
  try {
    // Generate nama file unik agar tidak bentrok
    const fileExt = file.name.split('.').pop()
    const fileName = `avatar-${Date.now()}.${fileExt}`
    const filePath = `${currentUserEmail.value}/${fileName}`

    // 1. Upload file ke bucket 'avatars' di Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true })

    if (uploadError) throw uploadError

    // 2. Dapatkan URL publik dari gambar yang baru diupload
    const { data: publicUrlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath)

    // 3. Simpan URL tersebut ke state dan perbarui tabel users
    profileData.value.avatar_url = publicUrlData.publicUrl

    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: profileData.value.avatar_url })
      .eq('email', currentUserEmail.value)

    if (updateError) throw updateError

    showNotification('Berhasil', 'Foto profil berhasil diperbarui!', 'success')
  } catch (err) {
    console.error('Gagal mengunggah foto:', err.message)
    showNotification('Gagal Unggah', 'Terjadi kesalahan saat mengunggah foto. Pastikan Anda memiliki bucket "avatars" di Supabase.', 'error')
  } finally {
    isUploading.value = false
  }
}

// FUNGSI SIMPAN PERUBAHAN DATA DIRI
async function saveProfile() {
  if (!profileData.value.name.trim()) {
    showNotification('Peringatan', 'Nama Lengkap tidak boleh kosong.', 'warning')
    return
  }

  isLoading.value = true
  try {
    const { error } = await supabase
      .from('users')
      .update({
        name: profileData.value.name,
        nim: profileData.value.nim,
        faculty: profileData.value.faculty,
        major: profileData.value.major,
        semester: profileData.value.semester,
        bio: profileData.value.bio
      })
      .eq('email', currentUserEmail.value)

    if (error) throw error

    showNotification('Tersimpan!', 'Profil akademik Anda berhasil diperbarui.', 'success')
  } catch (err) {
    console.error('Gagal menyimpan profil:', err.message)
    showNotification('Gagal', 'Terjadi kesalahan saat menyimpan data profil.', 'error')
  } finally {
    isLoading.value = false
  }
}

function goBack() {
  router.push('/dashboard')
}
</script>

<template>
  <div class="page-profil">
    <div class="profil-card">
      
      <div class="profil-header">
        <h1>Profil Mahasiswa</h1>
        <button class="btn-close" @click="goBack">
          ✕ Tutup
        </button>
      </div>

      <!-- FOTO PROFIL (AVATAR) -->
      <div class="avatar-section">
        <label for="avatar-upload" class="avatar-wrapper">
          <!-- Menampilkan Loading Spinner saat upload -->
          <span v-if="isUploading" style="font-size: 14px;">⏳</span>
          
          <!-- Menampilkan Foto jika URL ada -->
          <img v-else-if="profileData.avatar_url" :src="profileData.avatar_url" alt="Foto Profil" class="avatar-image" />
          
          <!-- Menampilkan Inisial jika tidak ada foto -->
          <span v-else>{{ userInitial }}</span>
          
          <div class="avatar-overlay">📷</div>
        </label>
        <label for="avatar-upload" class="upload-text">
          {{ isUploading ? 'Mengunggah...' : 'Ubah foto profil' }}
        </label>
        <input 
          type="file" 
          id="avatar-upload" 
          class="file-input" 
          accept="image/*" 
          @change="handleAvatarUpload"
          :disabled="isUploading"
        />
      </div>

      <!-- FORMULIR DATA DIRI -->
      <form @submit.prevent="saveProfile" class="profil-form">
        
        <div class="form-group">
          <label>Email Kampus / Akun (Tidak dapat diubah)</label>
          <input type="email" :value="currentUserEmail" disabled />
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Nama Lengkap</label>
            <input type="text" v-model="profileData.name" placeholder="Masukkan nama lengkap Anda..." required />
          </div>
          <div class="form-group">
            <label>Nomor Induk Mahasiswa (NIM)</label>
            <input type="text" v-model="profileData.nim" placeholder="Misal: 1234567890" />
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Fakultas</label>
            <input type="text" v-model="profileData.faculty" placeholder="Misal: Fakultas Ilmu Komputer" />
          </div>
          <div class="form-group">
            <label>Program Studi</label>
            <input type="text" v-model="profileData.major" placeholder="Misal: Sistem Informasi" />
          </div>
        </div>

        <div class="form-group">
          <label>Semester Saat Ini</label>
          <select v-model="profileData.semester">
            <option v-for="i in 14" :key="i" :value="`Semester ${i}`">Semester {{ i }}</option>
            <option value="Lulus/Alumni">Lulus / Alumni</option>
          </select>
        </div>

        <div class="form-group">
          <label>Bio Singkat / Tautan LinkedIn</label>
          <textarea v-model="profileData.bio" rows="2" placeholder="Deskripsikan diri Anda atau tempelkan link LinkedIn/Portofolio Anda..."></textarea>
        </div>

        <button type="submit" class="btn-save-profil" :disabled="isLoading">
          <span v-if="isLoading">⏳ Menyimpan...</span>
          <span v-else>💾 Simpan Perubahan</span>
        </button>
      </form>

    </div>

    <!-- MODAL NOTIFIKASI KUSTOM ELEGAN -->
    <div v-if="modalState.show" class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px);">
      <div class="modal-card" style="background: #FFFFFF; width: 100%; max-width: 380px; padding: 28px 24px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); text-align: center;">
        
        <div style="display: flex; justify-content: center; margin-bottom: 16px;">
          <div v-if="modalState.type === 'success'" style="width: 52px; height: 52px; background: #DCFCE7; color: #16A34A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            ✓
          </div>
          <div v-else-if="modalState.type === 'warning'" style="width: 52px; height: 52px; background: #FEF3C7; color: #D97706; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            !
          </div>
          <div v-else style="width: 52px; height: 52px; background: #FEE2E2; color: #DC2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            ✕
          </div>
        </div>

        <h3 style="font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">{{ modalState.title }}</h3>
        <p style="font-size: 13px; color: #64748B; line-height: 1.5; margin-bottom: 24px;">{{ modalState.message }}</p>
        
        <div style="display: flex; gap: 10px;">
          <button 
            type="button" 
            style="width: 100%; padding: 11px; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer; background: #2563EB; color: #FFFFFF; border: none;" 
            @click="closeNotification"
          >
            OK, Mengerti
          </button>
        </div>
      </div>
    </div>

  </div>
</template>