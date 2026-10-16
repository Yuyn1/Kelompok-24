// ==========================================
// 1. DATA DUMMY AKUN (Simulasi Database)
// ==========================================
const registeredUsers = [
    { email: "nadia@kampus.ac.id", password: "password123", name: "Nadia" },
    { email: "budi@kampus.ac.id", password: "password456", name: "Budi" }
];

// ==========================================
// 2. DOM ELEMENTS
// ==========================================
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const rememberCheckbox = document.getElementById('remember');
const errorAlert = document.getElementById('errorAlert');
const passwordErrorText = document.getElementById('passwordErrorText');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');

// ==========================================
// 3. CEK SESI SAAT HALAMAN DIBUKA
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
        emailInput.value = rememberedEmail;
        rememberCheckbox.checked = true;
    }
});

// ==========================================
// 4. EVENT HANDLERS & LOGIC
// ==========================================

function handleTogglePassword() {
    const isPassword = passwordInput.getAttribute('type') === 'password';
    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
    togglePassword.textContent = isPassword ? '🔒' : '👁️';
}

function handleLogin(e) {
    e.preventDefault();

    const inputEmail = emailInput.value.trim();
    const inputPassword = passwordInput.value.trim();

    const foundUser = registeredUsers.find(
        (user) => user.email === inputEmail && user.password === inputPassword
    );

    if (foundUser) {
        hideErrorState();

        if (rememberCheckbox.checked) {
            localStorage.setItem('rememberedEmail', foundUser.email);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        // Simpan sesi aktif
        localStorage.setItem('currentUser', foundUser.name);

        // Langsung arahkan ke halaman dashboard
        window.location.href = "dashboard.html";
    } else {
        showErrorState();
    }
}

function showErrorState() {
    if (errorAlert) errorAlert.style.display = 'flex';
    if (emailInput) emailInput.classList.add('error');
    if (passwordInput) passwordInput.classList.add('error');
    if (passwordErrorText) {
        passwordErrorText.style.display = 'block';
        passwordErrorText.textContent = "⚠️ Periksa kembali email atau kata sandi Anda.";
    }
    if (passwordInput) {
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function hideErrorState() {
    if (errorAlert) errorAlert.style.display = 'none';
    if (emailInput) emailInput.classList.remove('error');
    if (passwordInput) passwordInput.classList.remove('error');
    if (passwordErrorText) passwordErrorText.style.display = 'none';
}

function handleForgotPassword(e) {
    e.preventDefault();
    const emailInputted = prompt("Masukkan email kampus yang terdaftar untuk pemulihan kata sandi:");
    if (!emailInputted) return;

    const userExist = registeredUsers.find(user => user.email === emailInputted.trim());

    if (userExist) {
        const newPassword = prompt(`Email terdaftar atas nama ${userExist.name}.\n\nMasukkan kata sandi baru Anda:`);
        if (newPassword && newPassword.trim() !== "") {
            userExist.password = newPassword.trim();
            alert("Kata sandi berhasil diubah! Silakan login kembali.");
        } else {
            alert("Perubahan kata sandi dibatalkan.");
        }
    } else {
        alert("Email tidak ditemukan dalam sistem database kami.");
    }
}

// ==========================================
// 5. EVENT LISTENERS SETUP
// ==========================================
if (togglePassword) togglePassword.addEventListener('click', handleTogglePassword);
if (loginForm) loginForm.addEventListener('submit', handleLogin);
if (emailInput) emailInput.addEventListener('input', hideErrorState);
if (passwordInput) passwordInput.addEventListener('input', hideErrorState);
if (forgotPasswordLink) forgotPasswordLink.addEventListener('click', handleForgotPassword);