document.addEventListener('DOMContentLoaded', () => {

    // Helper Navigasi Smooth Pudar
    function smoothNavigateTo(url) {
        document.body.classList.add('page-fade-out');
        setTimeout(() => {
            window.location.href = url;
        }, 250);
    }

    const btnAddAnother = document.getElementById('btnAddAnother');
    const btnGoToCalendar = document.getElementById('btnGoToCalendar');
    const btnDownloadSummary = document.getElementById('btnDownloadSummary');
    const btnShareClass = document.getElementById('btnShareClass');

    // Tombol "+ Tambah Agenda Lain"
    if (btnAddAnother) {
        btnAddAnother.addEventListener('click', () => {
            smoothNavigateTo('tambahjadwal.html');
        });
    }

    // Tombol "Lihat di Kalender"
    if (btnGoToCalendar) {
        btnGoToCalendar.addEventListener('click', () => {
            smoothNavigateTo('dashboard.html');
        });
    }

    // Tombol "Unduh Ringkasan"
    if (btnDownloadSummary) {
        btnDownloadSummary.addEventListener('click', () => {
            alert('Mengunduh ringkasan jadwal dalam format PDF...');
        });
    }

    // Tombol "Bagikan ke Teman Kelas"
    if (btnShareClass) {
        btnShareClass.addEventListener('click', () => {
            navigator.clipboard.writeText(window.location.href);
            alert('Tautan ringkasan jadwal berhasil disalin ke clipboard!');
        });
    }
});