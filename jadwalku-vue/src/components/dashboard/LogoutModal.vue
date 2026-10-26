<script setup>
const emit = defineEmits(['cancel', 'confirm'])
</script>

<template>
  <div class="modal-overlay" @click.self="emit('cancel')">
    <div class="modal-card" role="dialog" aria-modal="true" style="text-align: center; max-width: 380px; padding: 28px 24px;">
      <div style="width: 52px; height: 52px; background: #FEF2F2; color: #DC2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; margin: 0 auto 16px auto;">
        🚪
      </div>
      <h3 style="font-size: 18px; font-weight: 700; color: #0F172A; margin-bottom: 8px;">Konfirmasi Keluar</h3>
      <p style="font-size: 13px; color: #64748B; margin-bottom: 24px; line-height: 1.5;">
        Apakah Anda yakin ingin keluar dari akun <strong>JadwalKu</strong>? Anda perlu login kembali untuk mengakses halaman ini.
      </p>
      <div style="display: flex; gap: 12px; justify-content: center;">
        <button type="button" class="btn-outline" style="flex: 1; padding: 10px;" @click="emit('cancel')">Batal</button>
        <button type="button" class="btn-primary" style="flex: 1; padding: 10px; background-color: #DC2626; border-color: #DC2626;" @click="emit('confirm')">Ya, Keluar</button>
      </div>
    </div>
  </div>
</template>
