<script setup>
// v-model:tab dan v-model:semester menghubungkan sidebar dengan DashboardView
const tab = defineModel('tab', { type: String, required: true })
const semester = defineModel('semester', { type: String, required: true })
const emit = defineEmits(['navigate', 'logout'])

const menu = [
  { key: 'ringkasan', icon: '📁', label: 'Ringkasan' },
  { key: 'kalender', icon: '📅', label: 'Kalender' },
  { key: 'agenda', icon: '📋', label: 'Daftar Agenda' },
  { key: 'notifikasi', icon: '🔔', label: 'Notifikasi' },
]

const semesters = [
  { value: '5', label: 'Semester 5' },
  { value: 'all', label: 'Semua Semester' },
  ...[1, 2, 3, 4, 6, 7, 8].map((n) => ({ value: String(n), label: `Semester ${n}` })),
]

const categories = [
  { dot: 'purple', label: 'Perkuliahan', count: 6 },
  { dot: 'blue', label: 'Organisasi', count: 3 },
  { dot: 'green', label: 'Tugas & Ujian', count: 4 },
]

function select(key) {
  tab.value = key
  emit('navigate')
}
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-brand">
      <div class="brand-icon">📅</div>
      <span class="brand-name">JadwalKu</span>
    </div>

    <ul class="sidebar-menu">
      <li v-for="item in menu" :key="item.key">
        <a
          href="#"
          class="menu-item"
          :class="{ active: tab === item.key }"
          @click.prevent="select(item.key)"
        ><span class="icon">{{ item.icon }}</span> {{ item.label }}</a>
      </li>
    </ul>

    <div class="semester-filter-container">
      <label for="selectSemester" style="font-size: 11px; font-weight: 700; color: #94A3B8; letter-spacing: 0.5px; display: block; margin-bottom: 6px;">FILTER SEMESTER</label>
      <select id="selectSemester" v-model="semester" class="semester-select">
        <option v-for="s in semesters" :key="s.value" :value="s.value">{{ s.label }}</option>
      </select>
    </div>

    <div class="sidebar-section-title">KATEGORI</div>
    <ul class="category-list">
      <li v-for="c in categories" :key="c.label">
        <span class="dot" :class="c.dot"></span> {{ c.label }} <span class="count">{{ c.count }}</span>
      </li>
    </ul>

    <div style="padding: 0 8px; margin-top: auto;">
      <button type="button" class="btn-logout-sidebar" @click="emit('logout')">🚪 Keluar (Logout)</button>
    </div>

    <div class="sidebar-conflict-box" style="margin-top: 12px;">
      <div class="conflict-icon">✨</div>
      <div class="conflict-title">Deteksi bentrok aktif</div>
      <div class="conflict-desc">JadwalKu memeriksa setiap agenda sebelum disimpan.</div>
    </div>
  </aside>
</template>
