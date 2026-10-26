// Mengembalikan inisial nama secara aman untuk avatar
export function userInitials() {
  const name = localStorage.getItem('currentUser') || 'M'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
}

// Mendapatkan nama user yang sedang aktif
export function getSessionUser() {
  return localStorage.getItem('currentUser') || 'Mahasiswa'
}

// Kompatibilitas untuk displayName
export const displayName = {
  get value() {
    return localStorage.getItem('currentUser') || 'Mahasiswa'
  },
  toString() {
    return localStorage.getItem('currentUser') || 'Mahasiswa'
  }
}

// Fungsi saat login berhasil
export function login(name) {
  localStorage.setItem('currentUser', name)
}

// Fungsi saat logout
export function logout() {
  localStorage.removeItem('currentUser')
}