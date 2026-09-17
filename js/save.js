// js/save.js
// ============================================================================
// [SAVE] LOCALSTORAGE PERSISTENT DATA MANAGER
// ============================================================================
const SAVE = {
  STORAGE_KEY: 'verdant100.v1',
  data: {
    v: 1,
    set: { vol: 8, crt: 1, ghost: 0, vib: 1 },
    rec: {},
    per: {}
  },

  init() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.v === 1) {
          this.data = Object.assign(this.data, parsed);
        }
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  },

  commit() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
    } catch (e) {
      console.warn('LocalStorage write failed:', e);
    }
  },

  setScore(cartId, score, extra = null) {
    cartId = String(cartId);
    const existing = this.data.rec[cartId] || { s: 0, t: 0 };
    if (score > existing.s || existing.s === 0) {
      existing.s = score;
      if (extra) existing.x = extra;
      this.data.rec[cartId] = existing;
      this.commit();
      return true;
    }
    return false;
  },

  getScore(cartId) {
    cartId = String(cartId);
    return this.data.rec[cartId] ? this.data.rec[cartId].s : 0;
  },

  addPlayTime(cartId, seconds) {
    cartId = String(cartId);
    const existing = this.data.rec[cartId] || { s: 0, t: 0 };
    existing.t = (existing.t || 0) + (seconds | 0);
    this.data.rec[cartId] = existing;
    this.commit();
  },

  setPersistent(cartId, obj) {
    this.data.per[String(cartId)] = obj;
    this.commit();
  },

  getPersistent(cartId) {
    return this.data.per[String(cartId)] || null;
  },

  exportString() {
    return btoa(JSON.stringify(this.data));
  },

  importString(str) {
    try {
      const obj = JSON.parse(atob(str));
      if (obj && obj.v === 1) {
        this.data = obj;
        this.commit();
        return true;
      }
    } catch (e) {
      console.error('Import failed:', e);
    }
    return false;
  },

  reset() {
    this.data = {
      v: 1,
      set: { vol: 8, crt: 1, ghost: 0, vib: 1 },
      rec: {},
      per: {}
    };
    this.commit();
  }
};
SAVE.init();
