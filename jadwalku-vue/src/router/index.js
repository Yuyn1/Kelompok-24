import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import RegisterView from '../views/RegisterView.vue'
import TambahJadwalView from '../views/TambahJadwalView.vue'
import KonfirmasiView from '../views/KonfirmasiView.vue'
import ProfileView from '../views/ProfileView.vue'


const routes = [
  { path: '/', name: 'Landing', component: LandingView },
  { path: '/login', name: 'Login', component: LoginView },
  { path: '/register', component: RegisterView },
  { path: '/dashboard', name: 'Dashboard', component: DashboardView },
  { path: '/tambah-jadwal', name: 'TambahJadwal', component: TambahJadwalView },
  { path: '/konfirmasi', name: 'Konfirmasi', component: KonfirmasiView },
  { path: '/profil', name: 'Profil', component: ProfileView }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router