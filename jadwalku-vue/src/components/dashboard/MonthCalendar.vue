<script setup>
import { ref, computed } from 'vue'
import { monthNames, toIso } from '../../utils/format'
import { TODAY_ISO } from '../../stores/agenda'

const props = defineProps({
  events: { type: Array, default: () => [] },
})
const emit = defineEmits(['select'])

// Bulan awal / tombol "Hari ini" = Oktober 2026 (sesuai data contoh)
const HOME = { year: 2026, month: 9 }

const year = ref(HOME.year)
const month = ref(HOME.month)
const fading = ref(false)

const title = computed(() => `${monthNames[month.value]} ${year.value}`)

const eventsByDate = computed(() => {
  const map = {}
  for (const ev of props.events) (map[ev.date] ||= []).push(ev)
  return map
})

// Susun grid minggu (Senin-Minggu) dari tanggal asli, sehingga hari selalu benar
const weeks = computed(() => {
  const first = new Date(year.value, month.value, 1)
  const offset = (first.getDay() + 6) % 7
  const daysInMonth = new Date(year.value, month.value + 1, 0).getDate()
  const total = Math.ceil((offset + daysInMonth) / 7) * 7

  const cells = []
  for (let i = 0; i < total; i++) {
    const d = new Date(year.value, month.value, 1 - offset + i)
    const iso = toIso(d)
    cells.push({
      iso,
      day: d.getDate(),
      inMonth: d.getMonth() === month.value,
      isToday: iso === TODAY_ISO,
      events: eventsByDate.value[iso] || [],
    })
  }

  const rows = []
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7))
  return rows
})

// Efek pudar singkat saat berganti bulan
function change(apply) {
  fading.value = true
  setTimeout(() => {
    apply()
    fading.value = false
  }, 150)
}

function prev() {
  change(() => {
    if (month.value === 0) { month.value = 11; year.value-- } else month.value--
  })
}

function next() {
  change(() => {
    if (month.value === 11) { month.value = 0; year.value++ } else month.value++
  })
}

function today() {
  change(() => {
    year.value = HOME.year
    month.value = HOME.month
  })
}
</script>

<template>
  <div class="calendar-card-main">
    <div class="cal-main-header">
      <div class="month-navigation">
        <button type="button" class="nav-arrow" aria-label="Bulan sebelumnya" @click="prev">‹</button>
        <h2>{{ title }}</h2>
        <button type="button" class="nav-arrow" aria-label="Bulan berikutnya" @click="next">›</button>
      </div>
      <div class="cal-view-switches">
        <button type="button" class="view-btn" @click="today">Hari ini</button>
        <button type="button" class="view-btn active">Bulan</button>
      </div>
    </div>

    <table class="monthly-table">
      <thead>
        <tr><th>Sen</th><th>Sel</th><th>Rab</th><th>Kam</th><th>Jum</th><th>Sab</th><th>Min</th></tr>
      </thead>
      <tbody id="calendarTableBody" :class="{ 'fade-out': fading }">
        <tr v-for="(week, wi) in weeks" :key="wi" :class="{ 'current-week-row': week.some((c) => c.isToday) }">
          <td v-for="cell in week" :key="cell.iso">
            <span class="date-num" :class="{ 'today-circle': cell.isToday, 'text-muted': !cell.inMonth }">{{ cell.day }}</span>
            <div
              v-for="ev in cell.events"
              :key="ev.id"
              class="event-pill"
              :class="`${ev.pill}-pill`"
              role="button"
              tabindex="0"
              @click="emit('select', ev)"
              @keydown.enter="emit('select', ev)"
            >{{ ev.label }}<br><small>{{ ev.time }}</small></div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
