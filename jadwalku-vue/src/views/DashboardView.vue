<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getSessionUser, logout } from '../stores/session'
import { supabase } from '../utils/supabase'
import { buildSuggestions, matchAgenda, splitMatch } from '../utils/searchSuggest'
import '../assets/css/dashboard.css'

const router = useRouter()
const currentUser = ref('')
const userAvatar = ref(null)
const agendas = ref([])
const isLoading = ref(true)

const activeTab = ref('dashboard')
const showLogoutModal = ref(false)

const modalState = ref({
  show: false,
  title: '',
  message: '',
  type: 'info'
})

function showNotification(titleText, messageText, typeStyle = 'info') {
  modalState.value = {
    show: true,
    title: titleText,
    message: messageText,
    type: typeStyle
  }
}

function closeNotification() {
  modalState.value.show = false
}

const showDetailModal = ref(false)
const selectedAgendaDetail = ref(null)

const showDeleteConfirmModal = ref(false)
const agendaToDeleteId = ref(null)

function openAgendaDetail(item) {
  selectedAgendaDetail.value = item
  showDetailModal.value = true
}

function closeAgendaDetail() {
  showDetailModal.value = false
  selectedAgendaDetail.value = null
}

function confirmDeleteAgenda(item) {
  agendaToDeleteId.value = item.id
  showDeleteConfirmModal.value = true
}

async function executeDeleteAgenda() {
  if (!agendaToDeleteId.value) return
  
  try {
    const { error } = await supabase.from('agendas').delete().eq('id', agendaToDeleteId.value)
    if (error) throw error

    agendas.value = agendas.value.filter(item => item.id !== agendaToDeleteId.value)
    showDeleteConfirmModal.value = false
    showDetailModal.value = false
    showNotification('Berhasil!', 'Agenda berhasil dihapus dari sistem.', 'success')
  } catch (err) {
    console.error('Gagal menghapus agenda:', err.message)
    showNotification('Gagal', 'Terjadi kesalahan saat menghapus agenda.', 'error')
  } finally {
    agendaToDeleteId.value = null
  }
}

const dismissedNotifs = ref([])

function markAsCompleted(agendaKey) {
  const cleanKey = String(agendaKey)
  if (cleanKey && !dismissedNotifs.value.includes(cleanKey)) {
    dismissedNotifs.value = [...dismissedNotifs.value, cleanKey]
    if (currentUser.value) {
      localStorage.setItem(`dismissedNotifs_${currentUser.value}`, JSON.stringify(dismissedNotifs.value))
    }
  }
  showNotification('Berhasil! 👍', 'Agenda telah dikonfirmasi dan tidak akan diingatkan lagi.', 'success')
}

function editAgenda(item) {
  router.push(`/tambah-jadwal?edit=${item.id}`)
}

function editConflictAgenda(timeStr, dateStr) {
  const targetAgenda = agendas.value.find(item => item.date === dateStr && item.time === timeStr)
  if (targetAgenda) {
    router.push(`/tambah-jadwal?edit=${targetAgenda.id}`)
  } else {
    router.push('/tambah-jadwal')
  }
}

const years = ref(['2026', '2027', '2028'])
const selectedYear = ref('2026')
const showAddYearModal = ref(false)
const newYearValue = ref('')

const monthsList = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']

function formatAgendaMonth(dateStr) {
  if (!dateStr) return 'Bulan'
  const parts = dateStr.split('-')
  if (parts.length === 3) {
    const monthNum = parseInt(parts[1], 10) - 1
    return shortMonths[monthNum] || 'Bulan'
  }
  return 'Bulan'
}

const realNow = new Date()
const currentMonthIndex = ref(realNow.getMonth())
selectedYear.value = String(realNow.getFullYear())
if (!years.value.includes(selectedYear.value)) {
  years.value.push(selectedYear.value)
}

const isTransitioning = ref(false)

const currentMonthYear = computed(() => {
  return `${monthsList[currentMonthIndex.value]} ${selectedYear.value}`
})

function triggerMonthTransition(callback) {
  isTransitioning.value = true
  setTimeout(() => {
    callback()
    isTransitioning.value = false
  }, 250)
}

function nextMonth() {
  triggerMonthTransition(() => {
    if (currentMonthIndex.value < 11) {
      currentMonthIndex.value++
    } else {
      currentMonthIndex.value = 0
      const nextY = (parseInt(selectedYear.value) + 1).toString()
      if (years.value.includes(nextY)) {
        selectedYear.value = nextY
      }
    }
  })
}

function prevMonth() {
  triggerMonthTransition(() => {
    if (currentMonthIndex.value > 0) {
      currentMonthIndex.value--
    } else {
      currentMonthIndex.value = 11
      const prevY = (parseInt(selectedYear.value) - 1).toString()
      if (years.value.includes(prevY)) {
        selectedYear.value = prevY
      }
    }
  })
}

function goToToday() {
  triggerMonthTransition(() => {
    const now = new Date()
    currentMonthIndex.value = now.getMonth()
    selectedYear.value = String(now.getFullYear())
    if (!years.value.includes(selectedYear.value)) {
      years.value.push(selectedYear.value)
    }
  })
}

const selectedCategoryFilter = ref(null)

const agendasInActiveMonth = computed(() => {
  const monthNum = String(currentMonthIndex.value + 1).padStart(2, '0')
  return agendas.value.filter(item => {
    if (!item.date) return false
    const [y, m] = item.date.split('-')
    return y === selectedYear.value && m === monthNum
  })
})

const totalAgendaBulanIni = computed(() => {
  return agendasInActiveMonth.value.length
})

const totalTugasMendekat = computed(() => {
  return agendasInActiveMonth.value.filter(i => i.category === 'Tugas').length
})

const scheduleDensity = computed(() => {
  const count = agendasInActiveMonth.value.length
  const tugasCount = totalTugasMendekat.value

  if (count === 0) {
    return { 
      label: 'Senggang 🟢', 
      statusText: 'Senggang', 
      desc: 'Jadwalmu sangat longgar bulan ini! Waktu yang sempurna untuk me-recharge energi, membaca buku baru, atau merapikan catatan.' 
    }
  } else if (count <= 3) {
    return { 
      label: 'Ringan 🟢', 
      statusText: 'Santai', 
      desc: 'Ritme akademikmu sangat santai. Pertahankan kebiasaan baik ini dan cicil tugas kecil agar tidak menumpuk.' 
    }
  } else if (count <= 7) {
    if (tugasCount >= 2) {
      return { 
        label: 'Stabil 🟡', 
        statusText: 'Fokus Tugas', 
        desc: 'Ada beberapa tugas menumpuk bulan ini. Alokasikan waktu khusus di akhir pekan untuk menyelesaikannya tepat waktu.' 
      }
    }
    return { 
      label: 'Sedang 🟡', 
      statusText: 'Stabil', 
      desc: 'Jadwalmu stabil dan terkendali. Tetap jaga konsistensi belajar dan manfaatkan waktu luang untuk istirahat.' 
    }
  } else {
    return { 
      label: 'Padat 🔴', 
      statusText: 'Sibuk', 
      desc: 'Wah, jadwalmu sangat padat bulan ini! Prioritaskan kegiatan yang paling mendesak dan jangan lupa jaga kesehatan fisik serta mentalmu.' 
    }
  }
})

const automatedNotifications = computed(() => {
  const list = []
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  const timeSlots = {}
  agendas.value.forEach(item => {
    const key = `${item.date}-${item.time}`
    if (!timeSlots[key]) timeSlots[key] = []
    timeSlots[key].push(item)
  })

  Object.entries(timeSlots).forEach(([key, items]) => {
    const notifId = `conflict-${key}`
    if (items.length > 1) {
      const titles = items.map(i => `"${i.title}"`).join(' dan ')
      list.push({
        id: notifId,
        agendaKey: notifId,
        isConflict: true,
        conflictTime: items[0].time,
        conflictDate: items[0].date,
        type: 'conflict',
        icon: '⚠️',
        title: 'Jadwal Bentrok!',
        desc: `Agenda ${titles} bertabrakan pada tanggal ${items[0].date} pukul ${items[0].time}. Harap edit salah satu jadwal.`,
        timeInfo: `${items[0].date} • ${items[0].time}`
      })
    }
  })

  agendas.value.forEach(item => {
    if (!item.date || !item.time) return

    if (dismissedNotifs.value.includes(String(item.id))) return

    const missedId = `missed-${item.id}`
    const reminderId = `reminder-${item.id}`

    if (item.date < todayStr || (item.date === todayStr && item.time < currentHourMin)) {
      list.push({
        id: missedId,
        agendaKey: String(item.id),
        isConflict: false,
        type: 'missed',
        icon: '⏳',
        title: 'Agenda Terlewat',
        desc: `"${item.title}" pada tanggal ${item.date} (${item.time}) telah terlewat.`,
        timeInfo: `${item.date} • ${item.time}`
      })
    } 
    else if (item.date === todayStr) {
      list.push({
        id: reminderId,
        agendaKey: String(item.id),
        isConflict: false,
        type: 'reminder',
        icon: '🔔',
        title: `Pengingat: ${item.reminder || 'Agenda Hari Ini'}`,
        desc: `"${item.title}" akan dimulai hari ini pukul ${item.time} di ${item.location || 'Lokasi umum'}.`,
        timeInfo: `Hari ini • ${item.time}`
      })
    }
  })

  return list
})

onMounted(async () => {
  const user = getSessionUser()
  if (!user) {
    router.push('/login')
    return
  }
  currentUser.value = user
  
  const savedDismissed = localStorage.getItem(`dismissedNotifs_${user}`)
  if (savedDismissed) {
    try {
      dismissedNotifs.value = JSON.parse(savedDismissed)
    } catch (e) {
      console.error('Gagal membaca notifikasi tersimpan', e)
    }
  }
  
  await fetchUserProfile(user)
  await fetchAgendas(user)
})

async function fetchUserProfile(identifier) {
  try {
    let query = supabase.from('users').select('*')
    if (identifier.includes('@')) {
      query = query.eq('email', identifier)
    } else {
      query = query.eq('name', identifier)
    }

    const { data, error } = await query.maybeSingle()
    if (error) return

    if (data) {
      if (data.years) {
        years.value = JSON.parse(data.years)
        if (data.active_year && years.value.includes(data.active_year)) {
          selectedYear.value = data.active_year
        }
      }
      if (data.avatar_url) {
        userAvatar.value = data.avatar_url
      }
    }
  } catch (err) {
    console.error('Gagal memuat profil user:', err.message)
  }
}

async function fetchAgendas(email) {
  isLoading.value = true
  try {
    const { data, error } = await supabase
      .from('agendas')
      .select('*')
      .eq('user_email', email)
      .order('date', { ascending: true })

    if (error) throw error
    if (data) {
      agendas.value = data
    }
  } catch (err) {
    console.error('Gagal memuat agenda dari database:', err.message)
  } finally {
    isLoading.value = false
  }
}

async function addYear() {
  const trimmedYear = newYearValue.value.trim()
  if (trimmedYear !== '' && !years.value.includes(trimmedYear)) {
    years.value.push(trimmedYear)
    selectedYear.value = trimmedYear
    try {
      await supabase
        .from('users')
        .update({ 
          years: JSON.stringify(years.value),
          active_year: trimmedYear 
        })
        .eq('email', currentUser.value)
    } catch (e) {
      console.log('Gagal menyimpan tahun baru:', e.message)
    }
    newYearValue.value = ''
    showAddYearModal.value = false
  }
}

async function handleYearChange(event) {
  const val = event.target.value
  selectedYear.value = val
  try {
    await supabase
      .from('users')
      .update({ active_year: val })
      .eq('email', currentUser.value)
  } catch (e) {
    console.log('Gagal memperbarui active year:', e.message)
  }
}

function filterByCategory(categoryName) {
  if (selectedCategoryFilter.value === categoryName) {
    selectedCategoryFilter.value = null
  } else {
    selectedCategoryFilter.value = categoryName
  }
}

const filteredAgendas = computed(() => {
  if (!selectedCategoryFilter.value) {
    return agendas.value
  }
  return agendas.value.filter(item => item.category === selectedCategoryFilter.value)
})

// ===== PENCARIAN DENGAN SARAN =====
const SUGGEST_ICON = { agenda: '📖', lokasi: '📍', dosen: '👤', kategori: '🏷️' }

const searchInput = ref('')   // isi kotak cari (berubah tiap ketikan)
const searchQuery = ref('')   // kata kunci yang diterapkan ke Daftar Agenda
const searchOpen = ref(false) // dropdown saran terbuka?
const searchActive = ref(-1)  // saran yang sedang disorot (panah atas/bawah)

const suggestions = computed(() => buildSuggestions(agendas.value, searchInput.value))
const searchedAgendas = computed(() =>
  filteredAgendas.value.filter(item => matchAgenda(item, searchQuery.value))
)

const part = (text) => splitMatch(text, searchInput.value)

function onSearchInput() {
  searchActive.value = -1
  searchOpen.value = searchInput.value.trim().length > 0
  // Di tab Daftar Agenda, hasil ikut berubah saat mengetik
  if (activeTab.value === 'agenda') searchQuery.value = searchInput.value.trim()
}

function applySearch(text) {
  const value = String(text).trim()
  searchInput.value = value
  searchQuery.value = value
  searchOpen.value = false
  searchActive.value = -1
  if (value) activeTab.value = 'agenda'
}

function pickSuggestion(s) {
  applySearch(s.text)
}

function onSearchEnter() {
  const s = suggestions.value[searchActive.value]
  applySearch(s ? s.text : searchInput.value)
}

function moveSearch(delta) {
  const n = suggestions.value.length
  if (!n) return
  searchOpen.value = true
  searchActive.value = (searchActive.value + delta + n) % n
}

function clearSearch() {
  searchInput.value = ''
  searchQuery.value = ''
  searchOpen.value = false
  searchActive.value = -1
}

function onSearchFocus() {
  if (searchInput.value.trim()) searchOpen.value = true
}

function onSearchBlur() {
  // jeda singkat agar klik pada saran sempat diproses
  setTimeout(() => { searchOpen.value = false }, 150)
}

function getAgendasForDate(dayNumber) {
  const formattedDay = String(dayNumber).padStart(2, '0')
  const monthNum = String(currentMonthIndex.value + 1).padStart(2, '0')
  const targetDateStr = `${selectedYear.value}-${monthNum}-${formattedDay}`
  return filteredAgendas.value.filter(item => item.date === targetDateStr)
}

function isToday(dayNumber) {
  const now = new Date()
  return (
    dayNumber === now.getDate() &&
    currentMonthIndex.value === now.getMonth() &&
    parseInt(selectedYear.value) === now.getFullYear()
  )
}

const conflictStatus = computed(() => {
  if (agendas.value.length < 2) {
    return { hasConflict: false, message: 'Tidak ada jadwal yang bertabrakan di akun ini.' }
  }

  const timeSlotCount = {}
  for (const item of agendas.value) {
    const key = `${item.date}-${item.time}`
    timeSlotCount[key] = (timeSlotCount[key] || 0) + 1
    if (timeSlotCount[key] > 1) {
      return { 
        hasConflict: true, 
        message: `Terdeteksi bentrok pada tanggal ${item.date} pukul ${item.time}!` 
      }
    }
  }

  return { hasConflict: false, message: 'Tidak ada jadwal yang bertabrakan di akun ini.' }
})

function confirmLogout() {
  showLogoutModal.value = true
}

function executeLogout() {
  logout()
  router.push('/login')
}

function cancelLogout() {
  showLogoutModal.value = false
}
</script>

<template>
  <div class="page-dashboard">
    <div class="app-container">
      
      <!-- SIDEBAR KIRI -->
      <aside class="sidebar">
        <div>
          <div class="sidebar-brand">
            <span class="brand-icon">📅</span>
            <span class="brand-name">JadwalKu</span>
          </div>

          <ul class="sidebar-menu">
            <li>
              <a href="#" class="menu-item" :class="{ active: activeTab === 'dashboard' }" @click.prevent="activeTab = 'dashboard'">
                <span>📊</span> Dashboard
              </a>
            </li>
            <li>
              <a href="#" class="menu-item" :class="{ active: activeTab === 'agenda' }" @click.prevent="activeTab = 'agenda'">
                <span>📋</span> Agenda Kuliah
              </a>
            </li>
            <li>
              <a href="#" class="menu-item" :class="{ active: activeTab === 'notifikasi' }" @click.prevent="activeTab = 'notifikasi'" style="position: relative;">
                <span>🔔</span> Notifikasi
                <span v-if="automatedNotifications.length > 0" style="position: absolute; right: 12px; background: #EF4444; color: #FFFFFF; font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 10px;">
                  {{ automatedNotifications.length }}
                </span>
              </a>
            </li>
            <li>
              <router-link to="/profil" class="menu-item">
                <span>⚙️</span> Pengaturan Profil
              </router-link>
            </li>
          </ul>

          <div class="sidebar-section-title" style="display: flex; justify-content: space-between; align-items: center;">
            <span>TAHUN AKADEMIK</span>
            <button 
              @click="showAddYearModal = true" 
              style="background: none; border: none; color: #60A5FA; cursor: pointer; font-size: 11px; font-weight: 600;"
            >
              + Tambah
            </button>
          </div>
          <div class="sidebar-filter">
            <select :value="selectedYear" @change="handleYearChange" class="semester-select">
              <option v-for="yr in years" :key="yr" :value="yr">Tahun {{ yr }}</option>
            </select>
          </div>

          <div class="sidebar-section-title" style="display: flex; justify-content: space-between; align-items: center;">
            <span>KATEGORI FILTER</span>
            <button 
              v-if="selectedCategoryFilter" 
              @click="selectedCategoryFilter = null" 
              style="background: none; border: none; color: #F87171; cursor: pointer; font-size: 10px; font-weight: 600;"
            >
              Reset
            </button>
          </div>
          <ul class="category-list">
            <li 
              @click="filterByCategory('Kuliah')" 
              class="category-hover-item"
              :style="selectedCategoryFilter === 'Kuliah' ? 'background: #1E293B; padding: 6px 8px; border-radius: 6px; border-left: 3px solid #8B5CF6; cursor: pointer;' : 'padding: 6px 8px; cursor: pointer; border-radius: 6px;'"
            >
              <span class="dot purple"></span> Kuliah
              <span class="count">{{ agendas.filter(i => i.category === 'Kuliah').length }}</span>
            </li>
            <li 
              @click="filterByCategory('Organisasi')" 
              class="category-hover-item"
              :style="selectedCategoryFilter === 'Organisasi' ? 'background: #1E293B; padding: 6px 8px; border-radius: 6px; border-left: 3px solid #3B82F6; cursor: pointer;' : 'padding: 6px 8px; cursor: pointer; border-radius: 6px;'"
            >
              <span class="dot blue"></span> Organisasi
              <span class="count">{{ agendas.filter(i => i.category === 'Organisasi').length }}</span>
            </li>
            <li 
              @click="filterByCategory('Tugas')" 
              class="category-hover-item"
              :style="selectedCategoryFilter === 'Tugas' ? 'background: #1E293B; padding: 6px 8px; border-radius: 6px; border-left: 3px solid #10B981; cursor: pointer;' : 'padding: 6px 8px; cursor: pointer; border-radius: 6px;'"
            >
              <span class="dot green"></span> Tugas
              <span class="count">{{ agendas.filter(i => i.category === 'Tugas').length }}</span>
            </li>
          </ul>
        </div>

        <div>
          <div 
            class="sidebar-conflict-box" 
            :style="conflictStatus.hasConflict ? 'margin-top: 24px; background-color: #7F1D1D; border-color: #991B1B;' : 'margin-top: 24px;'"
          >
            <div class="conflict-title" :style="conflictStatus.hasConflict ? 'color: #FEE2E2;' : ''">
              {{ conflictStatus.hasConflict ? '⚠️ Peringatan Bentrok!' : '⚡ Status Konflik' }}
            </div>
            <div class="conflict-desc" :style="conflictStatus.hasConflict ? 'color: #FECACA;' : ''">
              {{ conflictStatus.message }}
            </div>
          </div>

          <div class="sidebar-footer" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #1E293B;">
            <div class="user-profile" style="margin-bottom: 12px;">
              <div class="user-avatar" style="overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <img v-if="userAvatar" :src="userAvatar" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
                <span v-else>{{ currentUser.charAt(0).toUpperCase() || 'M' }}</span>
              </div>
              <div>
                <div class="user-name" style="color: #FFFFFF;">{{ currentUser || 'Mahasiswa' }}</div>
                <div class="user-role">Akun Aktif</div>
              </div>
            </div>
            <button class="btn-logout-sidebar" @click="confirmLogout">Keluar</button>
          </div>
        </div>
      </aside>

      <!-- KONTEN UTAMA -->
      <main class="main-content">
        <header class="top-navbar">
          <div class="search-container">
            <span class="search-icon">🔍</span>
            <input
              v-model="searchInput"
              type="text"
              class="search-input"
              placeholder="Cari agenda atau mata kuliah..."
              autocomplete="off"
              role="combobox"
              aria-autocomplete="list"
              :aria-expanded="searchOpen && suggestions.length > 0"
              @input="onSearchInput"
              @focus="onSearchFocus"
              @blur="onSearchBlur"
              @keydown.down.prevent="moveSearch(1)"
              @keydown.up.prevent="moveSearch(-1)"
              @keydown.enter.prevent="onSearchEnter"
              @keydown.esc="searchOpen = false"
            >
            <button v-if="searchInput" type="button" class="search-clear" aria-label="Hapus pencarian" @mousedown.prevent="clearSearch">✕</button>

            <ul v-if="searchOpen && suggestions.length" class="search-suggest" role="listbox">
              <li
                v-for="(s, i) in suggestions"
                :key="s.kind + s.text"
                class="suggest-item"
                :class="{ active: i === searchActive }"
                role="option"
                @mousedown.prevent="pickSuggestion(s)"
                @mouseenter="searchActive = i"
              >
                <span class="suggest-icon">{{ SUGGEST_ICON[s.kind] }}</span>
                <span class="suggest-text">
                  <span class="suggest-main">{{ part(s.text).before }}<mark v-if="part(s.text).match">{{ part(s.text).match }}</mark>{{ part(s.text).after }}</span>
                  <small>{{ s.meta }}</small>
                </span>
              </li>
            </ul>
            <div v-else-if="searchOpen && searchInput.trim()" class="search-suggest search-empty">
              Tidak ada agenda yang cocok dengan “{{ searchInput.trim() }}”.
            </div>
          </div>
          <div class="user-nav-actions">
            <button class="notif-btn" @click="activeTab = 'notifikasi'" title="Notifikasi" style="position: relative;">
              🔔
              <span v-if="automatedNotifications.length > 0" style="position: absolute; top: 4px; right: 4px; width: 8px; height: 8px; background: #EF4444; border-radius: 50%;"></span>
            </button>
            <div class="user-profile">
              <div class="user-avatar" style="overflow: hidden; display: flex; align-items: center; justify-content: center;">
                <img v-if="userAvatar" :src="userAvatar" alt="Avatar" style="width: 100%; height: 100%; object-fit: cover;" />
                <span v-else>{{ currentUser.charAt(0).toUpperCase() || 'M' }}</span>
              </div>
              <div>
                <div class="user-name">{{ currentUser || 'Mahasiswa' }}</div>
                <div class="user-role">Mahasiswa Aktif</div>
              </div>
            </div>
          </div>
        </header>

        <div class="dashboard-body">
          
          <!-- TAB 1: DASHBOARD UTAMA -->
          <div v-if="activeTab === 'dashboard'" class="content-section">
            <div class="welcome-banner">
              <div>
                <div class="welcome-sub">
                  TAHUN AKTIF: {{ selectedYear }} 
                  <span v-if="selectedCategoryFilter" style="color: #2563EB; font-weight: 700;"> | Filter: {{ selectedCategoryFilter }}</span>
                </div>
                <h1>Dashboard Akademik</h1>
                <p>Kelola jadwal kuliah, organisasi, dan tugasmu dengan lancar.</p>
              </div>
              <div class="action-buttons">
                <router-link to="/tambah-jadwal" class="btn-primary" style="text-decoration: none; display: inline-flex; align-items: center;">+ Tambah Agenda</router-link>
              </div>
            </div>

            <div class="stats-row">
              <div class="stat-card">
                <div class="stat-icon purple-bg">📅</div>
                <div>
                  <div class="stat-num">{{ totalAgendaBulanIni }}</div>
                  <div class="stat-label">Agenda Bulan Ini</div>
                </div>
                <span class="stat-badge purple-text">Aktif</span>
              </div>

              <div class="stat-card">
                <div class="stat-icon orange-bg">📋</div>
                <div>
                  <div class="stat-num">{{ totalTugasMendekat }}</div>
                  <div class="stat-label">Tugas / Ujian Mendekat</div>
                </div>
                <span class="stat-badge orange-text">Segera</span>
              </div>

              <div class="stat-card">
                <div class="stat-icon green-bg">⚡</div>
                <div>
                  <div class="stat-num" style="font-size: 16px; margin-top: 4px;">{{ scheduleDensity.label }}</div>
                  <div class="stat-label">Kepadatan Jadwal</div>
                </div>
                <span class="stat-badge green-text">{{ scheduleDensity.statusText }}</span>
              </div>
            </div>

            <!-- CALENDAR LAYOUT GRID -->
            <div class="calendar-layout-grid">
              
              <div class="calendar-card-main">
                <div class="cal-main-header">
                  <div class="month-navigation">
                    <button class="nav-arrow" @click="prevMonth" title="Bulan Sebelumnya">&lt;</button>
                    <h2>{{ currentMonthYear }}</h2>
                    <button class="nav-arrow" @click="nextMonth" title="Bulan Selanjutnya">&gt;</button>
                  </div>
                  <div class="cal-view-switches">
                    <button class="view-btn active" @click="goToToday">Hari Ini</button>
                    <button class="view-btn" @click="activeTab = 'agenda'">Daftar</button>
                  </div>
                </div>

                <div v-if="isLoading" style="text-align: center; padding: 40px; color: #64748B;">
                  Memuat kalender dari database Supabase...
                </div>

                <div v-else>
                  <div v-if="selectedCategoryFilter" style="background: #EFF6FF; border: 1px solid #BFDBFE; padding: 8px 12px; border-radius: 8px; font-size: 12px; color: #1E40AF; margin-bottom: 12px;">
                    Menampilkan kategori: <strong>{{ selectedCategoryFilter }}</strong> ({{ filteredAgendas.length }} agenda ditemukan)
                  </div>

                  <table class="monthly-table" :class="{ 'calendar-fade-transition': isTransitioning }">
                    <thead>
                      <tr>
                        <th>Sen</th>
                        <th>Sel</th>
                        <th>Rab</th>
                        <th>Kam</th>
                        <th>Jum</th>
                        <th>Sab</th>
                        <th>Min</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td v-for="d in [1,2,3,4,5,6,7]" :key="d">
                          <span class="date-num" :class="{ 'today-circle': isToday(d) }">{{ d }}</span>
                          <div v-for="item in getAgendasForDate(d)" :key="item.id" class="event-pill blue-pill" @click="openAgendaDetail(item)" style="cursor: pointer;" title="Klik untuk lihat detail">
                            {{ item.title }}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td v-for="d in [8,9,10,11,12,13,14]" :key="d">
                          <span class="date-num" :class="{ 'today-circle': isToday(d) }">{{ d }}</span>
                          <div v-for="item in getAgendasForDate(d)" :key="item.id" class="event-pill blue-pill" @click="openAgendaDetail(item)" style="cursor: pointer;" title="Klik untuk lihat detail">
                            {{ item.title }}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td v-for="d in [15,16,17,18,19,20,21]" :key="d">
                          <span class="date-num" :class="{ 'today-circle': isToday(d) }">{{ d }}</span>
                          <div v-for="item in getAgendasForDate(d)" :key="item.id" class="event-pill blue-pill" @click="openAgendaDetail(item)" style="cursor: pointer;" title="Klik untuk lihat detail">
                            {{ item.title }}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td v-for="d in [22,23,24,25,26,27,28]" :key="d">
                          <span class="date-num" :class="{ 'today-circle': isToday(d) }">{{ d }}</span>
                          <div v-for="item in getAgendasForDate(d)" :key="item.id" class="event-pill blue-pill" @click="openAgendaDetail(item)" style="cursor: pointer;" title="Klik untuk lihat detail">
                            {{ item.title }}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td v-for="d in [29,30,31]" :key="d">
                          <span class="date-num" :class="{ 'today-circle': isToday(d) }">{{ d }}</span>
                          <div v-for="item in getAgendasForDate(d)" :key="item.id" class="event-pill blue-pill" @click="openAgendaDetail(item)" style="cursor: pointer;" title="Klik untuk lihat detail">
                            {{ item.title }}
                          </div>
                        </td>
                        <td><span class="date-num text-muted">-</span></td>
                        <td><span class="date-num text-muted">-</span></td>
                        <td><span class="date-num text-muted">-</span></td>
                        <td><span class="date-num text-muted">-</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- SISI KANAN -->
              <div class="right-sidebar-panel">
                <div class="upcoming-header">
                  <h3>Agenda Terdekat</h3>
                  <span class="badge-count">{{ filteredAgendas.length }}</span>
                </div>

                <div v-if="filteredAgendas.length === 0" style="font-size: 12px; color: #64748B; padding: 10px 0;">
                  Belum ada agenda terdekat.
                </div>

                <div v-else>
                  <div v-for="item in filteredAgendas.slice(0, 3)" :key="item.id" class="upcoming-item" @click="openAgendaDetail(item)" style="cursor: pointer;">
                    <div class="up-date">
                      {{ item.date.split('-')[2] }}<br><small>{{ formatAgendaMonth(item.date) }}</small>
                    </div>
                    <div>
                      <div class="up-title">{{ item.title }}</div>
                      <div class="up-location">{{ item.time }} • {{ item.location || 'Lokasi umum' }}</div>
                    </div>
                  </div>
                </div>

                <div class="ai-suggestion-box">
                  <div class="ai-title">✨ Saran JadwalKu</div>
                  <div class="ai-desc">{{ scheduleDensity.desc }}</div>
                </div>
              </div>

            </div>
          </div>

          <!-- TAB 2: AGENDA -->
          <div v-if="activeTab === 'agenda'" class="content-section">
            <div class="welcome-banner">
              <div>
                <div class="welcome-sub">MANAJEMEN DATABASE</div>
                <h1>Daftar Seluruh Agenda</h1>
                <p>Berikut adalah jadwal yang tersimpan di akun privat Anda.</p>
              </div>
            </div>

            <div v-if="searchQuery" class="search-chip">
              Hasil untuk “<strong>{{ searchQuery }}</strong>” • {{ searchedAgendas.length }} agenda
              <button type="button" @click="clearSearch">✕ Hapus pencarian</button>
            </div>

            <div class="calendar-card-main">
              <div v-if="searchedAgendas.length === 0" style="text-align: center; padding: 40px; color: #64748B;">
                {{ searchQuery ? 'Tidak ada agenda yang cocok dengan pencarian Anda.' : 'Belum ada agenda tersimpan.' }}
              </div>
              <div v-else style="display: flex; flex-direction: column; gap: 12px;">
                <div v-for="item in searchedAgendas" :key="item.id" @click="openAgendaDetail(item)" style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; padding: 16px; border-radius: 10px; border: 1px solid #E2E8F0; cursor: pointer;" title="Klik untuk lihat detail">
                  <div>
                    <div style="font-weight: 700; font-size: 15px; color: #0F172A;">{{ item.title }}</div>
                    <div style="font-size: 13px; color: #64748B;">📍 {{ item.location || '-' }} • ⏰ {{ item.time }} • Kategori: {{ item.category }}</div>
                  </div>
                  <div>
                    <span class="event-pill blue-pill">{{ item.date }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: NOTIFIKASI OTOMATIS -->
          <div v-if="activeTab === 'notifikasi'" class="content-section">
            <div class="welcome-banner">
              <div>
                <div class="welcome-sub">PUSAT INFORMASI</div>
                <h1>Notifikasi & Pengingat Otomatis</h1>
                <p>Pantau pengingat detail jadwal, agenda terlewat, serta peringatan konflik secara real-time.</p>
              </div>
            </div>

            <div class="calendar-card-main" style="padding: 24px;">
              <div v-if="automatedNotifications.length === 0" style="text-align: center; padding: 40px; color: #64748B;">
                🎉 Tidak ada pemberitahuan atau peringatan saat ini. Semua jadwal aman!
              </div>

              <div v-else style="display: flex; flex-direction: column; gap: 12px;">
                <div 
                  v-for="notif in automatedNotifications" 
                  :key="notif.id" 
                  style="display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; padding: 16px; border-radius: 10px; border: 1px solid;"
                  :style="notif.type === 'conflict' ? 'background: #FEF2F2; border-color: #FCA5A5;' : notif.type === 'missed' ? 'background: #FFFBEB; border-color: #FDE68A;' : 'background: #EFF6FF; border-color: #BFDBFE;'"
                >
                  <div style="display: flex; align-items: flex-start; gap: 14px; flex: 1;">
                    <span style="font-size: 26px;">{{ notif.icon }}</span>
                    <div style="flex: 1;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                        <strong :style="notif.type === 'conflict' ? 'color: #991B1B;' : notif.type === 'missed' ? 'color: #92400E;' : 'color: #1E40AF;'" style="font-size: 15px;">
                          {{ notif.title }}
                        </strong>
                        <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px;" :style="notif.type === 'conflict' ? 'background: #FEE2E2; color: #991B1B;' : notif.type === 'missed' ? 'background: #FEF3C7; color: #92400E;' : 'background: #DBEAFE; color: #1E40AF;'">
                          {{ notif.timeInfo }}
                        </span>
                      </div>
                      <p style="font-size: 13px; color: #334155; margin: 0; line-height: 1.4;">{{ notif.desc }}</p>
                    </div>
                  </div>

                  <div style="display: flex; align-items: center;">
                    <button 
                      v-if="notif.isConflict"
                      type="button" 
                      @click="editConflictAgenda(notif.conflictTime, notif.conflictDate)" 
                      style="padding: 8px 14px; background: #DC2626; color: #FFFFFF; font-size: 12px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: background 0.2s;"
                      title="Edit jadwal yang bentrok"
                    >
                      ✏️ Edit Jadwal
                    </button>

                    <button 
                      v-else
                      type="button" 
                      @click="markAsCompleted(notif.agendaKey)" 
                      style="padding: 8px 14px; background: #10B981; color: #FFFFFF; font-size: 12px; font-weight: 600; border: none; border-radius: 8px; cursor: pointer; white-space: nowrap; transition: background 0.2s;"
                      title="Konfirmasi selesai agar tidak diingatkan lagi"
                    >
                      ✓ Selesai
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

    </div>

    <!-- MODAL DETAIL AGENDA -->
    <div v-if="showDetailModal" class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px);">
      <div class="modal-card" style="background: #FFFFFF; width: 100%; max-width: 440px; padding: 28px 24px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);">
        
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 18px; border-bottom: 1px solid #E2E8F0; padding-bottom: 12px;">
          <div style="display: flex; flex-direction: column; align-items: flex-start;">
            <span style="font-size: 11px; font-weight: 700; color: #2563EB; background: #EFF6FF; padding: 3px 8px; border-radius: 6px; margin-bottom: 6px; display: inline-block;">{{ selectedAgendaDetail?.category }}</span>
            <h3 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0; line-height: 1.3; text-align: left;">{{ selectedAgendaDetail?.title }}</h3>
          </div>
          <button @click="closeAgendaDetail" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #64748B; padding: 4px;">✕</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 10px; font-size: 13px; color: #334155; margin-bottom: 20px;">
          
          <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; padding: 10px 14px; border-radius: 8px; border: 1px solid #F1F5F9;">
            <span style="color: #64748B;">📅 Tanggal</span>
            <strong style="color: #0F172A;">{{ selectedAgendaDetail?.date }}</strong>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; padding: 10px 14px; border-radius: 8px; border: 1px solid #F1F5F9;">
            <span style="color: #64748B;">⏰ Waktu</span>
            <strong style="color: #0F172A;">{{ selectedAgendaDetail?.time }} {{ selectedAgendaDetail?.end_time ? 's.d. ' + selectedAgendaDetail?.end_time : '' }}</strong>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; padding: 10px 14px; border-radius: 8px; border: 1px solid #F1F5F9;">
            <span style="color: #64748B;">📍 Lokasi</span>
            <strong style="color: #0F172A;">{{ selectedAgendaDetail?.location || '-' }}</strong>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; padding: 10px 14px; border-radius: 8px; border: 1px solid #F1F5F9;">
            <span style="color: #64748B;">👨‍🏫 Penanggung Jawab</span>
            <strong style="color: #0F172A;">{{ selectedAgendaDetail?.person_in_charge || '-' }}</strong>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; padding: 10px 14px; border-radius: 8px; border: 1px solid #F1F5F9;">
            <span style="color: #64748B;">🔁 Pengulangan</span>
            <strong style="color: #0F172A;">{{ selectedAgendaDetail?.repeat_type || 'Tidak diulang' }}</strong>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; padding: 10px 14px; border-radius: 8px; border: 1px solid #F1F5F9;">
            <span style="color: #64748B;">🔔 Pengingat</span>
            <strong style="color: #0F172A;">{{ selectedAgendaDetail?.reminder || '-' }}</strong>
          </div>

          <div style="background: #F8FAFC; padding: 12px 14px; border-radius: 8px; border: 1px solid #F1F5F9; text-align: left;">
            <span style="color: #64748B; display: block; margin-bottom: 4px; font-weight: 500;">📝 Catatan / Deskripsi</span>
            <div style="color: #0F172A; font-weight: normal; word-break: break-word; line-height: 1.5;">
              {{ selectedAgendaDetail?.description || 'Tidak ada catatan.' }}
            </div>
          </div>

        </div>

        <div style="display: flex; gap: 8px;">
          <button 
            type="button" 
            class="btn-action-delete"
            @click="confirmDeleteAgenda(selectedAgendaDetail)"
          >
            🗑️ Hapus
          </button>
          
          <button 
            type="button" 
            class="btn-action-edit"
            @click="editAgenda(selectedAgendaDetail)"
          >
            ✏️ Edit
          </button>

          <button 
            type="button" 
            class="btn-action-close"
            @click="closeAgendaDetail"
          >
            Tutup
          </button>
        </div>

      </div>
    </div>

    <!-- MODAL KONFIRMASI HAPUS -->
    <div v-if="showDeleteConfirmModal" class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999; backdrop-filter: blur(4px);">
      <div class="modal-card" style="background: #FFFFFF; width: 100%; max-width: 380px; padding: 28px 24px; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1); text-align: center;">
        
        <div style="font-size: 42px; margin-bottom: 12px;">🗑️</div>
        <h3 style="font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">Hapus Agenda?</h3>
        <p style="font-size: 13px; color: #64748B; line-height: 1.5; margin-bottom: 24px;">Apakah Anda yakin ingin menghapus agenda ini dari sistem?</p>
        
        <div style="display: flex; gap: 10px;">
          <button 
            type="button" 
            class="btn-outline" 
            style="flex: 1; padding: 10px; font-size: 13px; font-weight: 600; border-radius: 8px; cursor: pointer;" 
            @click="showDeleteConfirmModal = false"
          >
            Batal
          </button>
          <button 
            type="button" 
            style="flex: 1; padding: 10px; font-size: 13px; font-weight: 600; border-radius: 8px; cursor: pointer; background-color: #DC2626; color: #FFFFFF; border: none;" 
            @click="executeDeleteAgenda"
          >
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL NOTIFIKASI KUSTOM ELEGAN -->
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
            @click="closeNotification"
          >
            OK, Mengerti
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL TAMBAH TAHUN BARU -->
    <div v-if="showAddYearModal" class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div class="modal-card" style="background: #FFFFFF; width: 100%; max-width: 380px; padding: 28px 24px; border-radius: 16px;">
        <h3 style="font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">Tambah Tahun Baru</h3>
        <input type="text" v-model="newYearValue" class="search-input" style="margin-bottom: 20px; width: 100%; box-sizing: border-box;" placeholder="Tahun baru (misal: 2029)..." @keyup.enter="addYear">
        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn-outline" style="flex: 1; padding: 10px;" @click="showAddYearModal = false">Batal</button>
          <button type="button" class="btn-primary" style="flex: 1; padding: 10px;" @click="addYear">Simpan</button>
        </div>
      </div>
    </div>

    <!-- MODAL LOGOUT -->
    <div v-if="showLogoutModal" class="modal-overlay" style="position: fixed; inset: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 9999;">
      <div class="modal-card" style="background: #FFFFFF; width: 100%; max-width: 380px; padding: 28px 24px; border-radius: 16px; text-align: center;">
        <div style="font-size: 42px; margin-bottom: 12px;">⚠️</div>
        <h3 style="font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">Keluar dari Akun?</h3>
        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn-outline" style="flex: 1; padding: 10px;" @click="cancelLogout">Batal</button>
          <button type="button" class="btn-primary" style="flex: 1; padding: 10px; background-color: #DC2626;" @click="executeLogout">Ya, Keluar</button>
        </div>
      </div>
    </div>

  </div>
</template>