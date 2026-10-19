document.addEventListener('DOMContentLoaded', () => {
    // Helper fungsi perpindahan halaman secara smooth
    function smoothNavigateTo(url) {
        document.body.classList.add('page-fade-out');
        setTimeout(() => {
            window.location.href = url;
        }, 250);
    }

    // Inisialisasi State Langkah (Multi-Step Logic)
    let currentStep = 2; // Default aktif di Langkah 2 sesuai mockup

    const btnPrevStep = document.getElementById('btnPrevStep');
    const btnNextStep = document.getElementById('btnNextStep');
    const btnSaveDraft = document.getElementById('btnSaveDraft');
    const btnEditStep1 = document.getElementById('btnEditStep1');

    const progressBarFill = document.getElementById('progressBarFill');
    const progressPercentText = document.getElementById('progressPercentText');
    const stepBadgeText = document.getElementById('stepBadgeText');
    const stepTitleText = document.getElementById('stepTitleText');
    const stepSubTitleText = document.getElementById('stepSubTitleText');

    // Data Konfigurasi Konten Setiap Langkah
    const stepConfig = {
        1: {
            percent: "25%",
            badge: "LANGKAH 1 DARI 4",
            title: "Informasi agenda dasar",
            subtitle: "Tentukan nama kegiatan dan kategori agenda akademik.",
            nextBtnText: "Lanjut ke Waktu & Lokasi →"
        },
        2: {
            percent: "50%",
            badge: "LANGKAH 2 DARI 4",
            title: "Tentukan waktu dan lokasi",
            subtitle: "Isi detail pelaksanaan agar pemeriksaan konflik lebih akurat.",
            nextBtnText: "Lanjut ke Pengingat →"
        },
        3: {
            percent: "75%",
            badge: "LANGKAH 3 DARI 4",
            title: "Pengaturan pengingat & notifikasi",
            subtitle: "Atur waktu pengingat agar Anda tidak melewatkan agenda ini.",
            nextBtnText: "Lanjut ke Tinjau & Simpan →"
        },
        4: {
            percent: "100%",
            badge: "LANGKAH 4 DARI 4",
            title: "Tinjau dan simpan agenda",
            subtitle: "Pastikan seluruh informasi sudah sesuai sebelum disimpan.",
            nextBtnText: "Simpan Agenda ✓"
        }
    };

    // Fungsi Update Tampilan Langkah
    function updateStepUI() {
        // Update Sidebar Stepper Active / Completed Class
        for (let i = 1; i <= 4; i++) {
            const stepItem = document.getElementById(`step-nav-${i}`);
            if (stepItem) {
                stepItem.classList.remove('active', 'completed');
                if (i < currentStep) {
                    stepItem.classList.add('completed');
                    stepItem.querySelector('.step-icon').textContent = '✓';
                } else if (i === currentStep) {
                    stepItem.classList.add('active');
                    stepItem.querySelector('.step-icon').textContent = i;
                } else {
                    stepItem.querySelector('.step-icon').textContent = i;
                }
            }
        }

        // Update Progress Bar & Teks Tinjauan
        const config = stepConfig[currentStep];
        if (config) {
            progressBarFill.style.width = config.percent;
            progressPercentText.textContent = config.percent;
            stepBadgeText.textContent = config.badge;
            stepTitleText.textContent = config.title;
            stepSubTitleText.textContent = config.subtitle;
            btnNextStep.textContent = config.nextBtnText;
        }
    }

    // Event Navigasi Langkah Selanjutnya
   if (btnNextStep) {
    btnNextStep.addEventListener('click', () => {
        if (currentStep < 4) {
            currentStep++;
            updateStepUI();
        } else {
            // Mengarahkan ke halaman konfirmasi tersimpan
            smoothNavigateTo('konfirmasijadwal.html');
        }
    });
}

    // Event Navigasi Langkah Sebelumnya
    if (btnPrevStep) {
        btnPrevStep.addEventListener('click', () => {
            if (currentStep > 1) {
                currentStep--;
                updateStepUI();
            } else {
                smoothNavigateTo('dashboard.html');
            }
        });
    }

    // Event Tombol "✕ Tutup Formulir" di Navbar Top
    const btnCloseForm = document.querySelector('.btn-close-form');
    if (btnCloseForm) {
        btnCloseForm.addEventListener('click', (e) => {
            e.preventDefault();
            smoothNavigateTo('dashboard.html');
        });
    }

    // Tombol Ubah dari Langkah 1 Summary
    if (btnEditStep1) {
        btnEditStep1.addEventListener('click', () => {
            currentStep = 1;
            updateStepUI();
        });
    }

    // Simpan Draf Handler
    if (btnSaveDraft) {
        btnSaveDraft.addEventListener('click', () => {
            alert('Draf agenda berhasil disimpan secara lokal.');
        });
    }

    // Jalankan pertama kali saat halaman dimuat
    updateStepUI();
});