# JadwalKu (Vue 3 + Vite)

Kalender akademik pintar untuk mahasiswa. Versi Vue dari website JadwalKu, termasuk perbaikan responsif untuk mobile.

## Menjalankan

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # hasil build di folder dist/
npm run preview  # pratinjau hasil build
```

Akun contoh: `alya@kampus.ac.id` / `password123`, `nadia@kampus.ac.id` / `password123`, `budi@kampus.ac.id` / `password456`.

## Struktur

```
src/
├─ main.js, App.vue            # titik masuk + transisi pudar antarhalaman
├─ router/index.js             # / · /login · /dashboard · /tambah-jadwal · /konfirmasi
├─ views/                      # satu file per halaman
├─ components/dashboard/       # AppSidebar, MonthCalendar, AgendaDetailModal, LogoutModal
├─ stores/                     # session.js (login/logout), agenda.js (data agenda & formulir)
├─ utils/format.js             # format tanggal & inisial
└─ assets/css/                 # CSS asli tiap halaman, di-namespace (.page-landing, .page-login, ...)
```

Setiap file CSS di `assets/css/` dibungkus namespace halaman (misalnya `.page-dashboard .sidebar`) supaya
aturan antarhalaman tidak saling bentrok saat semua halaman berjalan dalam satu aplikasi (SPA).

## Catatan

- Deploy ke hosting statis memerlukan fallback ke `index.html` untuk semua rute (router memakai mode history).
- Draf formulir Tambah Jadwal dan hasil simpan terakhir disimpan di `localStorage`.
