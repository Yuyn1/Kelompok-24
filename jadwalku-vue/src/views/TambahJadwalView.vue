<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getSessionUser } from '../stores/session'
import { supabase } from '../utils/supabase'
import '../assets/css/base.css'
import '../assets/css/tambahjadwal.css'

const router = useRouter()
const route = useRoute()
const currentUser = getSessionUser()

const currentStep = ref(1)

// State Mode Edit
const isEditMode = ref(false)
const editId = ref(null)

// State Form Tambah/Edit Agenda
const title = ref('')
const category = ref('Kuliah')
const date = ref('')
const time = ref('')
const endTime = ref('')
const location = ref('')
const personInCharge = ref('')
const description = ref('')
const repeatType = ref('Tidak diulang')
const repeatEndDate = ref('') 
const reminder = ref('30 menit sebelumnya')
const isLoading = ref(false)

const modalState = ref({
  show: false,
  title: '',
  message: '',
  type: 'info'
})

function showAlert(titleText, messageText, typeStyle = 'info') {
  modalState.value = {
    show: true,
    title: titleText,
    message: messageText,
    type: typeStyle
  }
}

function closeModal() {
  modalState.value.show = false
  if (modalState.value.type === 'success') {
    router.push('/dashboard')
  }
}

const existingAgendas = ref([])

onMounted(async () => {
  if (!currentUser) {
    router.push('/login')
    return
  }

  // Cek apakah parameter edit tersedia di URL
  if (route.query.edit) {
    isEditMode.value = true
    editId.value = route.query.edit
    await fetchAgendaForEdit(editId.value)
  }

  // Tarik data existing agenda untuk mengecek bentrok
  const { data } = await supabase
    .from('agendas')
    .select('date, time, end_time, title')
    .eq('user_email', currentUser)
  
  if (data) {
    existingAgendas.value = data
  }
})

// Fungsi memuat data lama jika dalam mode edit
async function fetchAgendaForEdit(id) {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('agendas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    if (data) {
      title.value = data.title || ''
      category.value = data.category || 'Kuliah'
      date.value = data.date || ''
      time.value = data.time || ''
      endTime.value = data.end_time || ''
      location.value = data.location || ''
      personInCharge.value = data.person_in_charge || ''
      description.value = data.description || ''
      repeatType.value = data.repeat_type || 'Tidak diulang'
      reminder.value = data.reminder || '30 menit sebelumnya'
    }
  } catch (err) {
    console.error('Gagal memuat data edit:', err.message)
    showAlert('Error', 'Gagal memuat data jadwal yang ingin diedit.', 'error')
  } finally {
    isLoading.value = false
  }
}

function getTimeDifferenceInHours(time1, time2) {
  const [h1, m1] = time1.split(':').map(Number)
  const [h2, m2] = time2.split(':').map(Number)
  const minutes1 = h1 * 60 + m1
  const minutes2 = h2 * 60 + m2
  return Math.abs(minutes1 - minutes2) / 60
}

const conflictCheckResult = computed(() => {
  if (!date.value || !time.value) {
    return { status: 'safe', label: 'Aman', message: 'Sistem memvalidasi jadwal secara real-time.' }
  }

  for (const item of existingAgendas.value) {
    // Abaikan jika pengecekan bentrok mengenai agenda itu sendiri saat proses edit
    if (isEditMode.value && item.title === title.value && item.time === time.value) {
      continue
    }

    if (item.date === date.value) {
      const existingTime = item.time
      const diffHours = getTimeDifferenceInHours(time.value, existingTime)

      if (diffHours <= 1) {
        return { 
          status: 'conflict', 
          label: 'BENTROK!', 
          message: `Bentrok langsung dengan agenda "${item.title}" pada pukul ${existingTime}!` 
        }
      } else if (diffHours < 2) {
        return { 
          status: 'warning', 
          label: 'Resiko Bentrok', 
          message: `Jarak terlalu dekat (${diffHours.toFixed(1)} jam) dengan agenda "${item.title}" (${existingTime}).` 
        }
      }
    }
  }

  return { status: 'safe', label: 'Aman', message: 'Tidak ada jadwal lain yang berdekatan pada tanggal ini.' }
})

function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  })
}

function nextStep() {
  if (currentStep.value === 1) {
    if (!title.value.trim()) {
      showAlert('Perhatian', 'Mohon isi Judul Agenda / Mata Kuliah terlebih dahulu!', 'error')
      return
    }
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    if (!date.value || !time.value) {
      showAlert('Perhatian', 'Mohon lengkapi Tanggal dan Waktu Mulai agenda!', 'error')
      return
    }
    currentStep.value = 3
  }
}

function prevStep() {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

const progressPercentage = computed(() => {
  if (currentStep.value === 1) return '33%'
  if (currentStep.value === 2) return '66%'
  return '100%'
})

function generateRecurringDates(startDateStr, repeatMode, endDateStr) {
  const dates = [startDateStr]
  if (repeatMode === 'Tidak diulang' || !endDateStr) {
    return dates
  }

  let currentDate = new Date(startDateStr)
  const endDate = new Date(endDateStr)

  while (true) {
    if (repeatMode === 'Setiap Minggu') {
      currentDate.setDate(currentDate.getDate() + 7)
    } else if (repeatMode === 'Setiap Bulan') {
      currentDate.setMonth(currentDate.getMonth() + 1)
    } else {
      break
    }

    if (currentDate > endDate) {
      break
    }

    const yyyy = currentDate.getFullYear()
    const mm = String(currentDate.getMonth() + 1).padStart(2, '0')
    const dd = String(currentDate.getDate()).padStart(2, '0')
    dates.push(`${yyyy}-${mm}-${dd}`)
  }

  return dates
}

async function handleAddAgenda() {
  isLoading.value = true
  try {
    if (isEditMode.value) {
      // PROSES UPDATE JIKA MODE EDIT
      const payload = {
        title: title.value,
        category: category.value,
        date: date.value,
        time: time.value,
        end_time: endTime.value || null,
        location: location.value,
        person_in_charge: personInCharge.value,
        description: description.value,
        repeat_type: repeatType.value,
        reminder: reminder.value
      }

      const { error } = await supabase.from('agendas').update(payload).eq('id', editId.value)
      if (error) throw error
      showAlert('Berhasil!', 'Perubahan agenda berhasil disimpan!', 'success')

    } else {
      // PROSES INSERT JIKA TAMBAH BARU
      const seriesId = repeatType.value !== 'Tidak diulang' ? generateUUID() : null
      const targetDates = generateRecurringDates(date.value, repeatType.value, repeatEndDate.value)

      const payload = targetDates.map(targetDate => ({
        user_email: currentUser,
        title: title.value,
        category: category.value,
        date: targetDate,
        time: time.value,
        end_time: endTime.value || null,
        location: location.value,
        person_in_charge: personInCharge.value,
        description: description.value,
        repeat_type: repeatType.value,
        reminder: reminder.value,
        series_id: seriesId
      }))

      const { error } = await supabase.from('agendas').insert(payload)
      if (error) throw error
      showAlert('Berhasil!', `Agenda berhasil ditambahkan sebanyak ${targetDates.length} pertemuan rutin ke kalender!`, 'success')
    }

  } catch (err) {
    console.error('Gagal menyimpan agenda:', err.message)
    showAlert('Gagal', 'Terjadi kesalahan saat menyimpan agenda ke database.', 'error')
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="page-tambah">
    
    <header class="top-navbar">
      <div class="brand-logo">
        <span>📅</span>
        <span>JadwalKu</span>
      </div>
      <div class="nav-right">
        <button type="button" class="btn-close-form" @click="router.push('/dashboard')">
          ✕ Tutup Formulir
        </button>
      </div>
    </header>

    <div class="form-container">
      
      <!-- SIDEBAR STEPPER -->
      <aside class="stepper-sidebar">
        <div class="badge-pill-header">
          <span>Formulir Akademik</span>
        </div>
        <h2>{{ isEditMode ? 'Edit Agenda' : 'Tambah Agenda' }}</h2>
        <p class="sidebar-subtitle">{{ isEditMode ? 'Perbarui informasi jadwal ini untuk disinkronkan.' : 'Lengkapi informasi jadwal baru untuk disinkronkan ke kalender privat akunmu.' }}</p>
        
        <ul class="stepper-list">
          <li class="step-item" :class="{ active: currentStep === 1, completed: currentStep > 1 }">
            <div class="step-icon">1</div>
            <div class="step-text">
              <strong>Detail Agenda</strong>
              <small>Informasi utama</small>
            </div>
          </li>
          
          <li class="step-item" :class="{ active: currentStep === 2, completed: currentStep > 2 }">
            <div class="step-icon">2</div>
            <div class="step-text">
              <strong>Waktu & Tempat</strong>
              <small>Jadwal & lokasi</small>
            </div>
          </li>

          <li class="step-item" :class="{ active: currentStep === 3 }">
            <div class="step-icon">3</div>
            <div class="step-text">
              <strong>Selesai</strong>
              <small>Simpan ke database</small>
            </div>
          </li>
        </ul>

        <div class="progress-box">
          <div class="progress-label">
            <span>Status Pengisian</span>
            <strong>Langkah {{ currentStep }} dari 3</strong>
          </div>
          <div class="progress-bar-bg">
            <div class="progress-bar-fill" :style="{ width: progressPercentage }"></div>
          </div>
        </div>
      </aside>

      <!-- KARTU FORMULIR -->
      <main class="form-content-card">
        
        <!-- LANGKAH 1 -->
        <div v-if="currentStep === 1">
          <div class="form-card-header">
            <div>
              <span class="step-badge">LANGKAH 1 DARI 3</span>
              <h1>{{ isEditMode ? 'Edit Detail Agenda' : 'Detail Agenda' }}</h1>
              <p>Masukkan judul, kategori, penanggung jawab, dan catatan.</p>
            </div>
            <div class="autosave-badge">🔒 Privat Akun</div>
          </div>

          <div class="form-group">
            <label>Judul Agenda / Mata Kuliah *</label>
            <div class="input-with-icon">
              <span class="input-icon">📚</span>
              <input type="text" v-model="title" placeholder="Contoh: Pemrograman Web" required />
            </div>
          </div>

          <div class="form-grid-two">
            <div class="form-group">
              <label>Kategori *</label>
              <div class="input-with-icon">
                <span class="input-icon">🏷️</span>
                <select v-model="category">
                  <option value="Kuliah">Kuliah</option>
                  <option value="Organisasi">Organisasi</option>
                  <option value="Tugas">Tugas</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label>Pengulangan</label>
              <div class="input-with-icon">
                <span class="input-icon">🔁</span>
                <select v-model="repeatType" :disabled="isEditMode">
                  <option value="Tidak diulang">Tidak diulang</option>
                  <option value="Setiap Minggu">Setiap Minggu</option>
                  <option value="Setiap Bulan">Setiap Bulan</option>
                </select>
              </div>
              <small v-if="isEditMode" style="color: #64748B; font-size: 11px; margin-top: 4px;">Pola pengulangan tidak dapat diubah pada mode Edit.</small>
            </div>
          </div>

          <!-- INPUT TAMBAHAN: BATAS AKHIR PERULANGAN (DISEMBUNYIKAN SAAT EDIT) -->
          <div class="form-group" v-if="repeatType !== 'Tidak diulang' && !isEditMode">
            <label>Berakhir Sampai Tanggal *</label>
            <div class="input-with-icon">
              <span class="input-icon">📅</span>
              <input type="date" v-model="repeatEndDate" :required="repeatType !== 'Tidak diulang'" />
            </div>
            <small style="color: #64748B; font-size: 11px; margin-top: 4px; display: block;">Agenda akan otomatis diulang berkala sampai batas tanggal ini.</small>
          </div>

          <div class="form-group">
            <label>Penanggung Jawab / Dosen (Person in Charge)</label>
            <div class="input-with-icon">
              <span class="input-icon">👨‍🏫</span>
              <input type="text" v-model="personInCharge" placeholder="Contoh: Dr. Rina Kurniawan, M.Kom." />
            </div>
          </div>

          <div class="form-group">
            <label>Catatan / Deskripsi</label>
            <div class="input-with-icon">
              <textarea v-model="description" rows="3" placeholder="Tambahkan catatan penting..." style="width: 100%; padding: 10px 12px 10px 36px; border: 1px solid #CBD5E1; border-radius: 8px; font-size: 13px; outline: none;"></textarea>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-outline" @click="router.push('/dashboard')">Batal</button>
            <div class="action-right">
              <button type="button" class="btn-primary" @click="nextStep">Lanjut ke Waktu & Tempat ➔</button>
            </div>
          </div>
        </div>

        <!-- LANGKAH 2 -->
        <div v-if="currentStep === 2">
          <div class="form-card-header">
            <div>
              <span class="step-badge">LANGKAH 2 DARI 3</span>
              <h1>Waktu & Tempat</h1>
              <p>Tentukan tanggal awal, jam mulai, jam selesai, dan lokasi.</p>
            </div>
            <div class="autosave-badge">🔒 Privat Akun</div>
          </div>

          <div class="form-group">
            <label>Tanggal Mulai *</label>
            <div class="input-with-icon">
              <span class="input-icon">📅</span>
              <input type="date" v-model="date" required />
            </div>
          </div>

          <div class="form-grid-two">
            <div class="form-group">
              <label>Waktu Mulai *</label>
              <div class="input-with-icon">
                <span class="input-icon">⏰</span>
                <input type="time" v-model="time" required />
              </div>
            </div>

            <div class="form-group">
              <label>Waktu Selesai</label>
              <div class="input-with-icon">
                <span class="input-icon">⏱️</span>
                <input type="time" v-model="endTime" />
              </div>
            </div>
          </div>

          <div class="form-grid-two">
            <div class="form-group">
              <label>Lokasi / Ruangan</label>
              <div class="input-with-icon">
                <span class="input-icon">📍</span>
                <input type="text" v-model="location" placeholder="Contoh: Lab Komputer 3" />
              </div>
            </div>

            <div class="form-group">
              <label>Pengingat (Reminder)</label>
              <div class="input-with-icon">
                <span class="input-icon">🔔</span>
                <select v-model="reminder">
                  <option value="30 menit sebelumnya">30 menit sebelumnya</option>
                  <option value="1 jam sebelumnya">1 jam sebelumnya</option>
                  <option value="Tidak ada">Tidak ada</option>
                </select>
              </div>
            </div>
          </div>

          <div 
            class="buffer-info-box" 
            :style="conflictCheckResult.status === 'conflict' ? 'background-color: #FEF2F2; border-color: #FCA5A5;' : conflictCheckResult.status === 'warning' ? 'background-color: #FEFCE8; border-color: #FEF08A;' : ''"
          >
            <div class="buffer-left">
              <span class="buffer-icon">⚡</span>
              <div>
                <strong :style="conflictCheckResult.status === 'conflict' ? 'color: #991B1B;' : conflictCheckResult.status === 'warning' ? 'color: #854D0E;' : ''">
                  Pengecekan Konflik Otomatis
                </strong>
                <p :style="conflictCheckResult.status === 'conflict' ? 'color: #B91C1C;' : conflictCheckResult.status === 'warning' ? 'color: #A16207;' : ''">
                  {{ conflictCheckResult.message }}
                </p>
              </div>
            </div>
            <span 
              :class="{
                'badge-status-safe': conflictCheckResult.status === 'safe',
                'badge-status-warn': conflictCheckResult.status === 'conflict'
              }"
              :style="conflictCheckResult.status === 'warning' ? 'background-color: #FEF08A; color: #854D0E; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 20px; white-space: nowrap;' : ''"
            >
              {{ conflictCheckResult.label }}
            </span>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-outline" @click="prevStep">← Kembali</button>
            <div class="action-right">
              <button type="button" class="btn-primary" @click="nextStep">Tinjau & Selesai ➔</button>
            </div>
          </div>
        </div>

        <!-- LANGKAH 3 -->
        <div v-if="currentStep === 3">
          <div class="form-card-header">
            <div>
              <span class="step-badge">LANGKAH 3 DARI 3</span>
              <h1>Konfirmasi & Selesai</h1>
              <p>Periksa kembali ringkasan agenda sebelum disimpan ke database.</p>
            </div>
            <div class="autosave-badge">🔒 Siap Simpan</div>
          </div>

          <div class="review-list">
            <div class="review-row">
              <span>Judul Agenda</span>
              <strong>{{ title }}</strong>
            </div>
            <div class="review-row">
              <span>Kategori</span>
              <strong>{{ category }}</strong>
            </div>
            <div class="review-row">
              <span>Pola Pengulangan</span>
              <strong>{{ repeatType }} <span v-if="repeatEndDate && !isEditMode">(s.d. {{ repeatEndDate }})</span></strong>
            </div>
            <div class="review-row">
              <span>Waktu Pertemuan</span>
              <strong>{{ date }} ({{ time }} - {{ endTime || 'Selesai' }})</strong>
            </div>
            <div class="review-row">
              <span>Lokasi</span>
              <strong>{{ location || '-' }}</strong>
            </div>
            <div class="review-row">
              <span>Penanggung Jawab</span>
              <strong>{{ personInCharge || '-' }}</strong>
            </div>
            <div class="review-row">
              <span>Catatan</span>
              <strong>{{ description || '-' }}</strong>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn-outline" @click="prevStep">← Kembali</button>
            <div class="action-right">
              <button type="button" class="btn-primary" @click="handleAddAgenda" :disabled="isLoading">
                {{ isLoading ? 'Menyimpan...' : (isEditMode ? '💾 Simpan Perubahan' : '💾 Simpan Jadwal Rutin') }}
              </button>
            </div>
          </div>
        </div>

      </main>

    </div>

    <!-- CUSTOM MODAL NOTIFIKASI ELEGAN -->
    <div v-if="modalState.show" class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px);">
      <div class="modal-card" style="background: #FFFFFF; width: 100%; max-width: 380px; padding: 28px 24px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); text-align: center;">
        
        <div style="display: flex; justify-content: center; margin-bottom: 16px;">
          <div v-if="modalState.type === 'success'" style="width: 52px; height: 52px; background: #DCFCE7; color: #16A34A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            ✓
          </div>
          <div v-else-if="modalState.type === 'error'" style="width: 52px; height: 52px; background: #FEE2E2; color: #DC2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            ✕
          </div>
          <div v-else style="width: 52px; height: 52px; background: #FEF3C7; color: #D97706; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px;">
            !
          </div>
        </div>

        <h3 style="font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">{{ modalState.title }}</h3>
        <p style="font-size: 13px; color: #64748B; line-height: 1.5; margin-bottom: 24px;">{{ modalState.message }}</p>
        
        <div style="display: flex; gap: 10px;">
          <button 
            type="button" 
            class="btn-primary" 
            style="width: 100%; padding: 11px; font-size: 14px; font-weight: 600; border-radius: 8px; cursor: pointer;" 
            @click="closeModal"
          >
            OK, Mengerti
          </button>
        </div>
      </div>
    </div>

  </div>
</template>