// db.js — Storage layer (IndexedDB)
//
// All data access goes through this module.
// To add a new store or change the schema: bump DB_VERSION and
// handle the migration inside onupgradeneeded.

const DB_NAME    = 'BibleReading';
const DB_VERSION = 1;
const S_SESSIONS = 'sessions';

let _db = null;

// Opens (or returns cached) database connection
async function openDB() {
  if (_db) return _db;
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = e => {
      const db = e.target.result;
      // v1: sessions store, indexed by updatedAt for sorting
      if (!db.objectStoreNames.contains(S_SESSIONS)) {
        const store = db.createObjectStore(S_SESSIONS, { keyPath: 'id' });
        store.createIndex('updatedAt', 'updatedAt');
      }
    };

    req.onsuccess = e => { _db = e.target.result; resolve(_db); };
    req.onerror   = e => reject(e.target.error);
  });
}

function store(mode) {
  return _db.transaction(S_SESSIONS, mode).objectStore(S_SESSIONS);
}

// Public API
const DB = {

  // Returns all sessions sorted newest-first
  async getSessions() {
    await openDB();
    return new Promise((resolve, reject) => {
      const req = store('readonly').getAll();
      req.onsuccess = () =>
        resolve(req.result.sort((a, b) => b.updatedAt - a.updatedAt));
      req.onerror = e => reject(e.target.error);
    });
  },

  // Returns a single session by id
  async getSession(id) {
    await openDB();
    return new Promise((resolve, reject) => {
      const req = store('readonly').get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror   = e => reject(e.target.error);
    });
  },

  // Creates or updates a session (stamps updatedAt)
  async saveSession(session) {
    await openDB();
    session.updatedAt = Date.now();
    return new Promise((resolve, reject) => {
      const req = store('readwrite').put(session);
      req.onsuccess = () => resolve(session);
      req.onerror   = e => reject(e.target.error);
    });
  },

  // Hard-deletes a session
  async deleteSession(id) {
    await openDB();
    return new Promise((resolve, reject) => {
      const req = store('readwrite').delete(id);
      req.onsuccess = () => resolve();
      req.onerror   = e => reject(e.target.error);
    });
  }
};
