// Logika pencarian & saran (autocomplete) untuk kotak cari di Dashboard.
// Murni (tanpa Vue/Supabase) supaya mudah diuji.

const norm = (s) => String(s ?? '').toLowerCase()

// 0 = diawali ketikan, 1 = awal kata, 2 = hanya mengandung, -1 = tidak cocok
function rank(text, q) {
  const t = norm(text)
  const i = t.indexOf(q)
  if (i < 0) return -1
  if (i === 0) return 0
  return /[^a-z0-9]/i.test(t[i - 1]) ? 1 : 2
}

// Apakah satu agenda cocok dengan kata kunci? (judul, lokasi, kategori, dosen/penanggung jawab)
export function matchAgenda(item, query) {
  const q = norm(query).trim()
  if (!q) return true
  return [item.title, item.location, item.category, item.person_in_charge].some((v) => norm(v).includes(q))
}

// Saran sejak huruf pertama. Judul yang diawali ketikan Anda diurutkan paling atas.
export function buildSuggestions(agendas, query, limit = 7) {
  const q = norm(query).trim()
  if (!q) return []

  const found = new Map()
  const add = (text, kind, rk, extra = {}) => {
    const key = `${kind}|${norm(text)}`
    const cur = found.get(key)
    if (!cur) found.set(key, { text, kind, rank: rk, jumlah: 1, ...extra })
    else {
      cur.jumlah += 1
      cur.rank = Math.min(cur.rank, rk)
      if (extra.date && (!cur.date || extra.date < cur.date)) Object.assign(cur, extra)
    }
  }

  for (const a of agendas) {
    let r = rank(a.title, q)
    if (r >= 0) add(a.title, 'agenda', r, { date: a.date, time: a.time })
    r = rank(a.location, q)
    if (r >= 0) add(a.location, 'lokasi', r + 3)
    r = rank(a.person_in_charge, q)
    if (r >= 0) add(a.person_in_charge, 'dosen', r + 3)
    r = rank(a.category, q)
    if (r >= 0) add(a.category, 'kategori', r + 1)
  }

  return [...found.values()]
    .sort((a, b) => a.rank - b.rank || b.jumlah - a.jumlah || a.text.localeCompare(b.text))
    .slice(0, limit)
    .map((s) => ({
      ...s,
      meta:
        s.kind === 'agenda' ? (s.jumlah > 1 ? `${s.jumlah} jadwal • mulai ${s.date}` : `${s.date} • ${s.time || '-'}`)
        : s.kind === 'lokasi' ? `Lokasi • ${s.jumlah} jadwal`
        : s.kind === 'dosen' ? `Dosen / penanggung jawab • ${s.jumlah} jadwal`
        : `Kategori • ${s.jumlah} jadwal`,
    }))
}

// Pecah teks menjadi [sebelum, cocok, sesudah] agar bagian yang diketik bisa ditebalkan tanpa v-html
export function splitMatch(text, query) {
  const q = norm(query).trim()
  const i = q ? norm(text).indexOf(q) : -1
  if (i < 0) return { before: String(text ?? ''), match: '', after: '' }
  return { before: text.slice(0, i), match: text.slice(i, i + q.length), after: text.slice(i + q.length) }
}