// IndexedDB wrapper for project CRUD — connects to 'specProject' / 'projects' store
const DB_NAME = 'specProject'
const STORE = 'projects'

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = (e) => e.target.result.createObjectStore(STORE, { keyPath: 'id' })
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror = (e) => reject(e.target.error)
  })
}

async function tx(mode, fn) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const store = db.transaction(STORE, mode).objectStore(STORE)
    const req = fn(store)
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export const dbGetAll = () => tx('readonly', (s) => s.getAll())
export const dbGet    = (id) => tx('readonly', (s) => s.get(id))
export const dbSave   = (project) => tx('readwrite', (s) => s.put(project))
export const dbDelete = (id) => tx('readwrite', (s) => s.delete(id))
