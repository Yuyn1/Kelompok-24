// ==========================================
// 1. SETUP AKUN & NAVIGATION (SPA)
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    // Load nama pengguna
    const currentUser = localStorage.getItem('currentUser') || 'Alya Nirmala';
    const userNameDisplay = document.getElementById('userNameDisplay');
    const greetingName = document.getElementById('greetingName');
    const userAvatar = document.getElementById('userAvatar');

    if (userNameDisplay) userNameDisplay.textContent = currentUser;
    if (greetingName) greetingName.textContent = currentUser.toUpperCase();
    if (userAvatar) userAvatar.textContent = currentUser.substring(0, 2).toUpperCase();

    // Navigasi Sidebar SPA
    const menuItems = document.querySelectorAll('.sidebar-menu .menu-item');
    const sections = document.querySelectorAll('.dashboard-body > div');

    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            menuItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');

            const targetId = item.getAttribute('data-target');
            sections.forEach(sec => {
                sec.style.display = (sec.id === targetId) ? 'block' : 'none';
            });
        });
    });

    // Render Kalender Pertama Kali
    renderCalendar();
});

// ==========================================
// HELPER NAVIGASI SMOOTH
// ==========================================
function smoothNavigateTo(url) {
    document.body.classList.add('page-fade-out');
    setTimeout(() => {
        window.location.href = url;
    }, 250); // Menunggu animasi CSS fade-out (250ms)
}

// ==========================================
// 2. MODAL KONFIRMASI LOGOUT
// ==========================================
const modalLogout = document.getElementById('modalLogout');
const btnLogout = document.getElementById('btnLogout');
const btnCancelLogout = document.getElementById('btnCancelLogout');
const btnConfirmLogout = document.getElementById('btnConfirmLogout');

if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
        e.preventDefault();
        modalLogout.style.display = 'flex';
    });
}

if (btnCancelLogout) {
    btnCancelLogout.addEventListener('click', () => {
        modalLogout.style.display = 'none';
    });
}

if (btnConfirmLogout) {
    btnConfirmLogout.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        smoothNavigateTo('login.html'); // Navigasi smooth ke login
    });
}

// ==========================================
// 3. NAVIGASI KE HALAMAN TAMBAH JADWAL
// ==========================================
const openModalBtn = document.getElementById('openModalBtn');
const openModalBtn2 = document.getElementById('openModalBtn2');

if (openModalBtn) {
    openModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        smoothNavigateTo('tambahjadwal.html'); // Navigasi smooth ke tambahjadwal.html
    });
}

if (openModalBtn2) {
    openModalBtn2.addEventListener('click', (e) => {
        e.preventDefault();
        smoothNavigateTo('tambahjadwal.html');
    });
}

// ==========================================
// 4. LOGIKA HAPUS NOTIFIKASI
// ==========================================
const closeNotifBtns = document.querySelectorAll('.btn-close-notif');
closeNotifBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        const notifCard = this.closest('.notif-card');
        if (notifCard) {
            notifCard.style.transition = "opacity 0.3s ease";
            notifCard.style.opacity = "0";
            setTimeout(() => {
                notifCard.style.display = 'none';
            }, 300);
        }
    });
});

// ==========================================
// 5. LOGIKA KALENDER DINAMIS & NAVIGASI BULAN
// ==========================================
const monthNames = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

let currentMonthIndex = 9; // Indeks 9 = Oktober
let currentYear = 2026;

const currentMonthTitle = document.getElementById('currentMonthTitle');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const calendarTableBody = document.getElementById('calendarTableBody');

const oktober2026HTML = `
    <tr>
        <td><span class="date-num">29</span></td>
        <td><span class="date-num">30</span></td>
        <td><span class="date-num">1</span></td>
        <td>
            <span class="date-num">2</span>
            <div class="event-pill purple-pill">Pemrograman<br><small>08.00</small></div>
        </td>
        <td><span class="date-num">3</span></td>
        <td>
            <span class="date-num">4</span>
            <div class="event-pill purple-pill">Rapat BEM<br><small>15.30</small></div>
        </td>
        <td><span class="date-num">5</span></td>
    </tr>
    <tr>
        <td><span class="date-num">6</span></td>
        <td><span class="date-num">7</span></td>
        <td>
            <span class="date-num">8</span>
            <div class="event-pill blue-pill">Basis Data<br><small>10.00</small></div>
        </td>
        <td><span class="date-num">9</span></td>
        <td>
            <span class="date-num">10</span>
            <div class="event-pill green-pill">Deadline Tugas<br><small>23.59</small></div>
        </td>
        <td><span class="date-num">11</span></td>
        <td><span class="date-num">12</span></td>
    </tr>
    <tr class="current-week-row">
        <td><span class="date-num">13</span></td>
        <td>
            <span class="date-num today-circle">14</span>
            <div class="event-pill blue-pill">Pemrograman<br><small>08.00</small></div>
        </td>
        <td><span class="date-num">15</span></td>
        <td>
            <span class="date-num">16</span>
            <div class="event-pill orange-pill">Presentasi<br><small>09.00</small></div>
        </td>
        <td><span class="date-num">17</span></td>
        <td>
            <span class="date-num">18</span>
            <div class="event-pill purple-pill">Rapat BEM<br><small>15.30</small></div>
        </td>
        <td><span class="date-num">19</span></td>
    </tr>
    <tr>
        <td><span class="date-num">20</span></td>
        <td><span class="date-num">21</span></td>
        <td><span class="date-num">22</span></td>
        <td><span class="date-num">23</span></td>
        <td><span class="date-num">24</span></td>
        <td><span class="date-num">25</span></td>
        <td><span class="date-num">26</span></td>
    </tr>
    <tr>
        <td><span class="date-num">27</span></td>
        <td><span class="date-num">28</span></td>
        <td><span class="date-num">29</span></td>
        <td><span class="date-num">30</span></td>
        <td><span class="date-num">31</span></td>
        <td><span class="date-num text-muted">1</span></td>
        <td><span class="date-num text-muted">2</span></td>
    </tr>
`;

function renderEmptyCalendar() {
    let html = '';
    let dateCounter = 1;
    const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
    
    let firstDayIndex = new Date(currentYear, currentMonthIndex, 1).getDay();
    firstDayIndex = (firstDayIndex === 0) ? 6 : firstDayIndex - 1;

    for (let i = 0; i < 5; i++) {
        html += '<tr>';
        for (let j = 0; j < 7; j++) {
            const cellIndex = i * 7 + j;
            if (cellIndex < firstDayIndex) {
                html += '<td><span class="date-num text-muted"></span></td>';
            } else if (dateCounter <= daysInMonth) {
                html += `<td><span class="date-num">${dateCounter}</span></td>`;
                dateCounter++;
            } else {
                html += '<td><span class="date-num text-muted"></span></td>';
            }
        }
        html += '</tr>';
    }
    return html;
}

function renderCalendar() {
    const currentMonthTitle = document.getElementById('currentMonthTitle');
    const calendarTableBody = document.getElementById('calendarTableBody');

    if (currentMonthTitle) {
        currentMonthTitle.textContent = `${monthNames[currentMonthIndex]} ${currentYear}`;
    }

    if (calendarTableBody) {
        // Efek pudar sebelum konten diganti
        calendarTableBody.classList.add('fade-out');

        setTimeout(() => {
            if (currentMonthIndex === 9 && currentYear === 2026) {
                calendarTableBody.innerHTML = oktober2026HTML;
            } else {
                calendarTableBody.innerHTML = renderEmptyCalendar();
            }
            // Kembalikan tampilan setelah isi diperbarui
            calendarTableBody.classList.remove('fade-out');
        }, 150);
    }
}

if (prevMonthBtn) {
    prevMonthBtn.addEventListener('click', () => {
        currentMonthIndex--;
        if (currentMonthIndex < 0) {
            currentMonthIndex = 11;
            currentYear--;
        }
        renderCalendar();
    });
}

if (nextMonthBtn) {
    nextMonthBtn.addEventListener('click', () => {
        currentMonthIndex++;
        if (currentMonthIndex > 11) {
            currentMonthIndex = 0;
            currentYear++;
        }
        renderCalendar();
    });
}

const todayBtn = document.getElementById('todayBtn');

    if (todayBtn) {
        todayBtn.addEventListener('click', () => {
            currentMonthIndex = 9; // Reset ke Oktober
            currentYear = 2026;   // Reset ke tahun 2026
            renderCalendar();
        });
    }

    // LOGIKA FILTER SEMESTER
    const selectSemester = document.getElementById('selectSemester');

    if (selectSemester) {
        selectSemester.addEventListener('change', (e) => {
            const selectedSemester = e.target.value;
            const calendarTableBody = document.getElementById('calendarTableBody');
            const agendaRows = document.querySelectorAll('#section-agenda table tbody tr');

            if (selectedSemester === '5' || selectedSemester === 'all') {
                // Tampilkan data aktif (Semester 5)
                renderCalendar(); 
                agendaRows.forEach(row => row.style.display = '');
            } else {
                // Kosongkan tampilan jika memilih semester yang belum ada datanya (Semester 1-4, 6-8)
                if (calendarTableBody) {
                    calendarTableBody.innerHTML = renderEmptyCalendar();
                }
                agendaRows.forEach(row => row.style.display = 'none');
            }
        });
    }

    // ==========================================
    // LOGIKA MODAL DETAIL AGENDA
    // ==========================================
    const modalDetailAgenda = document.getElementById('modalDetailAgenda');
    const closeDetailBtn = document.getElementById('closeDetailBtn');
    const btnTutupDetail = document.getElementById('btnTutupDetail');

    // Data Dummy Agenda
    const agendaData = {
        'pemrograman': {
            kategori: '📖 Perkuliahan',
            judul: 'Mata Kuliah Pemrograman Web',
            kode: 'IF305 • Kelas A • 3 SKS',
            tanggal: 'Rabu, 14 Oktober 2026',
            waktu: '08.00–09.40 WIB',
            lokasi: 'Lab Komputer 3.2, Gedung Informatika',
            dosen: 'Dr. Rina Kurniawati, M.Kom.',
            pengulangan: 'Setiap Rabu hingga 16 Desember 2026',
            pengingat: '30 menit sebelum kelas',
            catatan: 'Bawa laptop dan pastikan Node.js versi terbaru sudah terpasang untuk praktikum React.',
            statusSafe: true,
            statusJudul: 'Tidak ada konflik jadwal',
            statusSub: 'Slot sebelum dan sesudah kelas memiliki jeda yang cukup.'
        },
        'rapat bem': {
            kategori: '🏛️ Organisasi',
            judul: 'Rapat Organisasi BEM',
            kode: 'ORG01 • Departemen Kestari',
            tanggal: 'Sabtu, 18 Oktober 2026',
            waktu: '15.30–17.00 WIB',
            lokasi: 'Ruang Sekretariat BEM Lt. 2',
            dosen: 'Ketua BEM / Sekjen',
            pengulangan: 'Dwi-mingguan',
            pengingat: '1 jam sebelum kegiatan',
            catatan: 'Pembahasan evaluasi program kerja bulan Oktober dan persiapan agenda pekan depan.',
            statusSafe: false,
            statusJudul: 'Peringatan Bentrok Waktu',
            statusSub: 'Jadwal berdekatan dengan jam praktikum laboratorium.'
        },
        'basis data': {
            kategori: '📖 Perkuliahan',
            judul: 'Mata Kuliah Basis Data',
            kode: 'IF201 • Kelas B • 3 SKS',
            tanggal: 'Rabu, 8 Oktober 2026',
            waktu: '10.00–11.40 WIB',
            lokasi: 'Ruang Teori 204, Gedung B',
            dosen: 'Ir. Ahmad Fauzi, M.T.',
            pengulangan: 'Setiap Rabu',
            pengingat: '15 menit sebelum kelas',
            catatan: 'Pelajari konsep ERD dan Normalisasi database SQL.',
            statusSafe: true,
            statusJudul: 'Tidak ada konflik jadwal',
            statusSub: 'Slot sebelum dan sesudah kelas memiliki jeda yang cukup.'
        },
        'deadline tugas': {
            kategori: '📝 Tugas & Ujian',
            judul: 'Deadline Tugas Akhir Praktikum',
            kode: 'TGS03 • Individu',
            tanggal: 'Jumat, 10 Oktober 2026',
            waktu: '23.59 WIB',
            lokasi: 'Portal LMS Kampus',
            dosen: 'Tim Asisten Laboratorium',
            pengulangan: 'Tidak ada',
            pengingat: '2 jam sebelum deadline',
            catatan: 'Unggah berkas ZIP source code dan laporan PDF sesuai standar format penugasan.',
            statusSafe: true,
            statusJudul: 'Tugas Jatuh Tempo',
            statusSub: 'Pastikan file sudah terunggah sebelum pukul 23.59 WIB.'
        },
        'presentasi': {
            kategori: '📝 Tugas & Ujian',
            judul: 'Presentasi Proyek Kelompok',
            kode: 'PRJ02 • Kelompok 4',
            tanggal: 'Kamis, 16 Oktober 2026',
            waktu: '09.00–11.00 WIB',
            lokasi: 'Ruang Seminar Utama',
            dosen: 'Dosen Penguji & Asisten',
            pengulangan: 'Tidak ada',
            pengingat: '45 menit sebelum acara',
            catatan: 'Siapkan slide presentasi dan prototipe web interaktif yang siap didemokan.',
            statusSafe: true,
            statusJudul: 'Tidak ada konflik jadwal',
            statusSub: 'Slot ruangan sudah terkonfirmasi.'
        }
    };

    // Tangkap Klik pada Event Pill di Kalender
    const calTableBody = document.getElementById('calendarTableBody');
    if (calTableBody) {
        calTableBody.addEventListener('click', (e) => {
            const pill = e.target.closest('.event-pill');
            if (pill) {
                const textContent = pill.innerText.toLowerCase();
                let selectedKey = 'pemrograman';

                if (textContent.includes('pemrograman')) selectedKey = 'pemrograman';
                else if (textContent.includes('rapat')) selectedKey = 'rapat bem';
                else if (textContent.includes('basis data')) selectedKey = 'basis data';
                else if (textContent.includes('deadline')) selectedKey = 'deadline tugas';
                else if (textContent.includes('presentasi')) selectedKey = 'presentasi';

                const data = agendaData[selectedKey];

                document.getElementById('detailKategori').textContent = data.kategori;
                document.getElementById('detailJudul').textContent = data.judul;
                document.getElementById('detailKode').textContent = data.kode;
                document.getElementById('detailTanggal').textContent = data.tanggal;
                document.getElementById('detailWaktu').textContent = data.waktu;
                document.getElementById('detailLokasi').textContent = data.lokasi;
                document.getElementById('detailDosen').textContent = data.dosen;
                document.getElementById('detailPengulangan').textContent = data.pengulangan;
                document.getElementById('detailPengingat').textContent = data.pengingat;
                document.getElementById('detailCatatan').textContent = data.catatan;

                const statusBox = document.getElementById('detailStatusBox');
                document.getElementById('detailStatusJudul').textContent = data.statusJudul;
                document.getElementById('detailStatusSub').textContent = data.statusSub;

                if (data.statusSafe) {
                    statusBox.className = 'detail-status-box status-safe';
                    statusBox.querySelector('.status-icon').textContent = '🛡️';
                } else {
                    statusBox.className = 'detail-status-box status-warning';
                    statusBox.querySelector('.status-icon').textContent = '⚠️';
                }

                modalDetailAgenda.style.display = 'flex';
            }
        });
    }

    const hideModalDetail = () => {
        if (modalDetailAgenda) modalDetailAgenda.style.display = 'none';
    };

    if (closeDetailBtn) closeDetailBtn.addEventListener('click', hideModalDetail);
    if (btnTutupDetail) btnTutupDetail.addEventListener('click', hideModalDetail);

    window.addEventListener('click', (e) => {
        if (e.target === modalDetailAgenda) hideModalDetail();
    });

// ==========================================
// NAVIGASI MOBILE: SIDEBAR SEBAGAI DRAWER
// ==========================================
(function () {
    const toggle = document.getElementById('menuToggle');
    const backdrop = document.getElementById('sidebarBackdrop');
    const sidebar = document.querySelector('.sidebar');
    if (!toggle || !sidebar) return;

    function setOpen(open) {
        document.body.classList.toggle('sidebar-open', open);
        toggle.setAttribute('aria-expanded', String(open));
    }

    toggle.addEventListener('click', () => {
        setOpen(!document.body.classList.contains('sidebar-open'));
    });

    if (backdrop) backdrop.addEventListener('click', () => setOpen(false));

    // Tutup drawer setelah memilih menu / menekan Keluar
    sidebar.querySelectorAll('.menu-item, #btnLogout').forEach(el => {
        el.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') setOpen(false);
    });

    // Kembali ke layar lebar: pastikan drawer tertutup
    window.matchMedia('(min-width: 901px)').addEventListener('change', (e) => {
        if (e.matches) setOpen(false);
    });
})();
