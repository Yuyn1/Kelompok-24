<script setup>
import { computed } from 'vue'
import { agendaDetails } from '../../stores/agenda'
import { formatTanggalPanjang } from '../../utils/format'

const props = defineProps({
  event: { type: Object, required: true },
})
const emit = defineEmits(['close', 'delete', 'edit'])

const detail = computed(() => agendaDetails[props.event.detailKey] || {
  kategori: props.event.kategori,
  judul: props.event.nama,
  kode: '',
  waktu: props.event.time,
  lokasi: props.event.lokasi,
  dosen: '-',
  pengulangan: 'Tidak ada',
  pengingat: '-',
  catatan: 'Belum ada catatan.',
  statusSafe: true,
  statusJudul: 'Tidak ada konflik jadwal',
  statusSub: 'Slot sebelum dan sesudah memiliki jeda yang cukup.',
})

const tanggal = computed(() => formatTanggalPanjang(props.event.date))
</script>

<template>
  <div id="modalDetailAgenda" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-card modal-detail-card" role="dialog" aria-modal="true">
      <div class="modal-detail-header">
        <div class="modal-header-top">
          <span class="badge-category">{{ detail.kategori }}</span>
          <button type="button" class="btn-close-circle" aria-label="Tutup" @click="emit('close')">✕</button>
        </div>
        <h3>{{ detail.judul }}</h3>
        <p>{{ detail.kode }}</p>
      </div>

      <div class="modal-detail-body">
        <div class="detail-grid-two">
          <div class="detail-box">
            <div class="detail-box-icon">📅</div>
            <div>
              <span class="detail-label">Tanggal</span>
              <div class="detail-value">{{ tanggal }}</div>
            </div>
          </div>
          <div class="detail-box">
            <div class="detail-box-icon">🕒</div>
            <div>
              <span class="detail-label">Waktu</span>
              <div class="detail-value">{{ detail.waktu }}</div>
            </div>
          </div>
        </div>

        <div class="detail-info-list">
          <div class="detail-info-item">
            <span class="info-icon">📍</span>
            <div>
              <span class="info-label">Lokasi</span>
              <div class="info-value">{{ detail.lokasi }}</div>
            </div>
          </div>
          <div class="detail-info-item">
            <span class="info-icon">👤</span>
            <div>
              <span class="info-label">Dosen pengampu / Penanggung Jawab</span>
              <div class="info-value">{{ detail.dosen }}</div>
            </div>
          </div>
          <div class="detail-info-item">
            <span class="info-icon">🔄</span>
            <div>
              <span class="info-label">Pengulangan</span>
              <div class="info-value">{{ detail.pengulangan }}</div>
            </div>
          </div>
          <div class="detail-info-item">
            <span class="info-icon">🔔</span>
            <div>
              <span class="info-label">Pengingat</span>
              <div class="info-value">{{ detail.pengingat }}</div>
            </div>
          </div>
        </div>

        <div class="detail-note-box">
          <span class="note-title">CATATAN KELAS</span>
          <p>{{ detail.catatan }}</p>
        </div>

        <div class="detail-status-box" :class="detail.statusSafe ? 'status-safe' : 'status-warning'">
          <span class="status-icon">{{ detail.statusSafe ? '🛡️' : '⚠️' }}</span>
          <div>
            <strong>{{ detail.statusJudul }}</strong>
            <p>{{ detail.statusSub }}</p>
          </div>
        </div>
      </div>

      <div class="modal-detail-footer">
        <button type="button" class="btn-ghost-danger" @click="emit('delete')">🗑️ Hapus Agenda</button>
        <div class="footer-right-btns">
          <button type="button" class="btn-outline" @click="emit('close')">Tutup</button>
          <button type="button" class="btn-primary" @click="emit('edit')">✏️ Edit Jadwal</button>
        </div>
      </div>
    </div>
  </div>
</template>
