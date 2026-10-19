# JadwalKu — Kalender Akademik Pintar Mahasiswa

JadwalKu adalah prototipe website kalender akademik yang dirancang untuk membantu mahasiswa mengatur jadwal kuliah, tugas, rapat organisasi, ujian, dan agenda lainnya dalam satu tempat. Proyek ini dikembangkan sebagai bagian dari **Tugas Modul 7: Transformasi Desain Figma ke Prototipe Web Interaktif**.

## Informasi Proyek

- **Kelompok:** 24 Web & UI/UX Developer
- **Desain Figma:** [Wireframe Kalender JadwalKu](https://www.figma.com/design/XNiECTvk3W9LeWSUbqYvlg/Wireframe-Kalender?t=lVJp8u6eekaHByVF-1)
- **Repository GitHub:** [Kelompok-24](https://github.com/Yuyn1/Kelompok-24)
- **Dokumen PRD:** *Tambahkan tautan PDF PRD di sini jika tersedia.*

### Anggota Kelompok

1. Aditya Putra Hertanto
2. Isabella
3. Amelia Nurpuspita Dewi
4. Meytha Reyani Sirayan
5. Dyah Ayu Sri Wulandhari

## Tujuan Proyek

JadwalKu dibuat untuk membantu mahasiswa melihat dan mengatur agenda akademik dengan lebih terorganisasi. Kalender dan daftar agenda menyatukan informasi kegiatan agar pengguna lebih mudah mengetahui jadwal yang akan datang serta mengenali kemungkinan bentrok jadwal.

Pada Modul 7, rancangan antarmuka yang dibuat di Figma diimplementasikan menjadi prototipe web menggunakan HTML, CSS, dan JavaScript.

## Teknologi yang Digunakan

- **HTML** — membangun struktur halaman website.
- **CSS** — mengatur warna, tipografi, tata letak, komponen, dan responsivitas.
- **JavaScript** — menangani interaksi, validasi, navigasi, modal, dan perilaku komponen.
- **Git** — mencatat perubahan kode melalui commit.
- **GitHub** — menyimpan dan membagikan repository proyek.

## Fitur Website

### 1. Landing Page
Halaman awal yang memperkenalkan JadwalKu, manfaat, dan fitur utama website.

### 2. Login
Form login dengan input email dan kata sandi. Implementasi prototipe juga menyediakan interaksi untuk menampilkan atau menyembunyikan kata sandi dan mengingat email apabila opsi tersebut diaktifkan.

> **Catatan:** Login pada prototipe ini menggunakan mekanisme sisi browser dan bukan autentikasi backend untuk penggunaan produksi.

### 3. Dashboard
Halaman utama untuk mengakses ringkasan kegiatan, kalender, daftar agenda, dan notifikasi melalui navigasi dashboard.

### 4. Kalender Akademik
Menampilkan agenda berdasarkan tanggal dan menyediakan navigasi untuk berpindah bulan.

### 5. Detail Jadwal
Pengguna dapat memilih agenda pada kalender untuk membuka modal detail. Informasi dapat mencakup judul, kategori, kode, tanggal, waktu, lokasi, dosen, pengulangan, pengingat, dan catatan sesuai data yang tersedia.

### 6. Daftar Agenda
Menampilkan agenda dalam bentuk daftar atau tabel agar informasi kegiatan mudah dibaca secara berurutan.

### 7. Notifikasi
Menyediakan area pemberitahuan yang dapat ditutup melalui interaksi pada antarmuka.

### 8. Form Tambah Jadwal
Menyediakan tahapan pengisian informasi kegiatan akademik. Validasi dan alur pengiriman perlu diuji pada website untuk memastikan seluruh fungsi berjalan sesuai kebutuhan.

### 9. Halaman Konfirmasi
Menampilkan informasi konfirmasi setelah alur penambahan jadwal. Tampilan konfirmasi tidak dengan sendirinya menjamin bahwa data tersimpan secara permanen.

### 10. Konfirmasi Logout
Menampilkan modal konfirmasi sebelum pengguna melanjutkan tindakan logout.

## Struktur File

Proyek ini memisahkan struktur halaman, tampilan, dan interaksi ke dalam file yang berbeda. Beberapa file utama yang digunakan antara lain:

| File | Kegunaan |
|---|---|
| `dashboard.html` | Struktur halaman dashboard |
| `dashboard.css` | Tampilan dashboard |
| `dashboard.js` | Interaksi dashboard, termasuk navigasi drawer mobile |
| `tambahjadwal.html` | Struktur form tambah jadwal |
| `tambahjadwal.css` | Tampilan form tambah jadwal |
| `konfirmasijadwal.html` | Struktur halaman konfirmasi |
| `konfirmasijadwal.css` | Tampilan halaman konfirmasi |
| `login.html` | Struktur halaman login, jika nama file ini digunakan pada repository |
| `style.css` | Styling halaman login pada struktur proyek |

Nama file lain dapat dilihat langsung di repository. Pastikan nama pada tabel disesuaikan dengan file yang benar-benar ada di dalam proyek.

## Cara Menjalankan Website

1. Clone atau unduh repository ini.
2. Buka folder proyek di Visual Studio Code atau editor kode lain.
3. Pastikan file HTML, CSS, dan JavaScript berada pada struktur folder yang benar.
4. Jalankan halaman awal melalui browser. Untuk pengalaman pengembangan yang lebih praktis, gunakan ekstensi **Live Server** di Visual Studio Code jika tersedia.
5. Coba navigasi halaman dan uji interaksi seperti perpindahan bulan, modal detail jadwal, form, dan konfirmasi logout.

Contoh perintah untuk menyalin repository:

```bash
git clone https://github.com/Yuyn1/Kelompok-24.git
```

Kemudian buka folder hasil clone di editor kode.

## Responsivitas Mobile

Responsivitas diperbaiki agar tampilan JadwalKu lebih nyaman digunakan pada layar desktop, tablet, dan smartphone.

Penyesuaian yang dilakukan meliputi:

- **Landing page:** bagian hero ditumpuk secara vertikal, grid fitur menjadi satu kolom, dan navigasi disesuaikan agar dapat digeser pada layar kecil.
- **Login:** pengaturan tinggi dan overflow disesuaikan agar halaman dapat di-scroll ketika keyboard perangkat muncul; logo ditampilkan di atas form pada layar kecil.
- **Dashboard:** sidebar pada layar kecil menggunakan drawer yang dapat dibuka dari tombol menu dan ditutup melalui backdrop, pemilihan menu, tombol keluar, atau tombol `Esc`.
- **Kalender dan tabel:** kalender tetap menggunakan tujuh kolom; teks agenda yang panjang dipotong dengan elipsis, sedangkan tabel agenda dapat digeser secara horizontal.
- **Modal detail:** tampilan modal disesuaikan menjadi bottom sheet pada layar kecil.
- **Form tambah jadwal:** stepper dipadatkan, kolom input disusun menjadi satu kolom, dan tombol aksi ditumpuk.
- **Halaman konfirmasi:** kartu ringkasan dan panel aksi disusun vertikal.

Aturan responsif diterapkan pada CSS halaman terkait, yaitu `landing.css`, `style.css`, `dashboard.css`, `tambahjadwal.css`, dan `konfirmasijadwal.css`. Perubahan navigasi mobile juga melibatkan `dashboard.html` dan `dashboard.js`.

## Pengujian Fungsionalitas

Pengujian dilakukan dengan mencoba fitur secara langsung melalui browser. Berikut daftar pemeriksaan yang disarankan untuk dokumentasi pengujian:

| No. | Fitur | Pemeriksaan |
|---:|---|---|
| 1 | Landing page | Konten dan tombol tampil dengan benar |
| 2 | Login | Form memberikan respons sesuai input |
| 3 | Validasi login | Pesan kesalahan muncul untuk input yang tidak sesuai |
| 4 | Tampilkan kata sandi | Input dapat ditampilkan/disembunyikan |
| 5 | Navigasi dashboard | Menu membuka bagian yang sesuai |
| 6 | Kalender | Bulan dapat diganti |
| 7 | Detail jadwal | Modal menampilkan informasi agenda yang dipilih |
| 8 | Modal | Modal dapat ditutup dengan cara yang disediakan |
| 9 | Notifikasi | Pemberitahuan dapat ditutup |
| 10 | Form tambah jadwal | Navigasi tahapan dan validasi bekerja sesuai implementasi |
| 11 | Konfirmasi jadwal | Halaman konfirmasi ditampilkan sesuai alur |
| 12 | Logout | Modal konfirmasi muncul dan tindakan mengikuti pilihan pengguna |

**Penting:** tandai hasil pengujian sebagai berhasil hanya setelah fitur benar-benar dicoba. Fitur yang tampak pada antarmuka belum tentu seluruhnya terhubung ke penyimpanan data atau backend.

## Interaktivitas

Interaksi yang menjadi fokus prototipe meliputi:

- Perpindahan bulan pada kalender.
- Membuka dan menutup modal detail agenda.
- Navigasi antarbagiannya pada dashboard.
- Validasi form login.
- Drawer navigasi mobile.
- Modal konfirmasi logout.

Pengujian perlu memastikan bahwa interaksi tersebut benar-benar mengubah tampilan atau keadaan antarmuka sesuai tindakan pengguna.

## Penggunaan AI dalam Pengembangan

AI dapat membantu proses prototyping, seperti menyusun struktur HTML, menyesuaikan CSS, membuat interaksi JavaScript, dan mencari alternatif perbaikan ketika ditemukan kesalahan. Hasil bantuan AI tetap perlu diperiksa dan diuji sebelum digunakan.

Contoh prompt yang relevan untuk dokumentasi:

> Buatkan dashboard kalender akademik mahasiswa menggunakan HTML, CSS, dan JavaScript dengan sidebar navigasi, ringkasan agenda, kalender bulanan, daftar kegiatan, dan notifikasi. Pisahkan struktur, tampilan, dan interaksi agar kode mudah dikelola.

> Tambahkan interaksi pada kalender agar pengguna dapat berpindah bulan dan memilih agenda untuk melihat detail melalui modal. Modal dapat ditutup dengan tombol tutup atau mengeklik area di luar modal.

Gunakan contoh prompt di atas sebagai referensi. Jika laporan perlu membuktikan penggunaan AI, tambahkan prompt asli dan screenshot percakapan yang benar-benar digunakan selama pengerjaan.

## Git dan GitHub

Git digunakan untuk mencatat perubahan kode melalui commit, sedangkan GitHub digunakan untuk menyimpan repository secara online. Gunakan pesan commit yang menjelaskan perubahan sebenarnya, misalnya:

- `Add landing page structure and styling`
- `Implement login form validation`
- `Build academic calendar dashboard`
- `Add schedule detail modal interaction`
- `Improve responsive layout`

Contoh di atas adalah rekomendasi penamaan commit. Riwayat commit aktual dapat dilihat di [repository GitHub Kelompok 24](https://github.com/Yuyn1/Kelompok-24).

## Product Requirements Document (PRD)

PRD JadwalKu menjelaskan permasalahan yang ingin diselesaikan, target pengguna, kebutuhan fungsional, user stories, kriteria keberhasilan, rancangan antarmuka, aturan deteksi bentrok jadwal, spesifikasi teknis, metode pengujian, risiko, prioritas fitur, dan rencana pengembangan.

**Dokumen PRD:** tambahkan tautan PDF PRD kelompok di sini.

## Dokumentasi Visual

Tambahkan screenshot aktual dari website untuk membantu pembaca memahami hasil implementasi. Simpan gambar pada folder seperti `docs/images/`, lalu gunakan tautan relatif Markdown. Contoh:

```markdown
![Landing page JadwalKu](docs/images/landing-page.png)
```

Screenshot yang dapat disertakan:

- Landing page.
- Halaman login.
- Dashboard.
- Kalender dan modal detail agenda.
- Form tambah jadwal.
- Halaman konfirmasi.
- Tampilan mobile.
- Repository dan riwayat commit GitHub.
- Perbandingan desain Figma dengan hasil implementasi.

Pastikan file gambar benar-benar ditambahkan ke repository dan nama file pada Markdown sesuai dengan nama file yang ada.

## Kontribusi Anggota

Lengkapi tabel berikut berdasarkan kontribusi yang benar-benar dilakukan setiap anggota.

| Anggota | Kontribusi |
|---|---|
| Aditya Putra Hertanto | Isi sesuai kontribusi aktual |
| Isabella | Isi sesuai kontribusi aktual |
| Amelia Nurpuspita Dewi | Isi sesuai kontribusi aktual |
| Meytha Reyani Sirayan | Isi sesuai kontribusi aktual |
| Dyah Ayu Sri Wulandhari | Isi sesuai kontribusi aktual |

## Evaluasi dan Pengembangan Selanjutnya

JadwalKu telah dikembangkan sebagai prototipe web interaktif yang menggabungkan tampilan kalender akademik dengan beberapa komponen pengelolaan agenda. Evaluasi akhir perlu melihat kesesuaian tampilan dengan Figma, interaksi yang benar-benar berjalan, responsivitas, dokumentasi, dan keteraturan repository.

Pengembangan lanjutan yang dapat dipertimbangkan:

- Menghubungkan form dan kalender ke penyimpanan data yang persisten.
- Menambahkan autentikasi backend yang aman.
- Memastikan deteksi bentrok jadwal menggunakan logika dan data yang tervalidasi.
- Mengembangkan notifikasi otomatis.
- Melakukan pengujian lebih menyeluruh pada berbagai ukuran layar dan browser.

---

**Proyek:** JadwalKu — Kalender Akademik Pintar Mahasiswa  
**Modul:** 7 — Transformasi Desain Figma ke Prototipe Web Interaktif  
**Kelompok:** 24 Web & UI/UX Developer
