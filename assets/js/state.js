/* ─── CENTRAL APPLICATION STATE ─── */
import { CONFIG } from './config.js';
import { getDateValue } from './utils/formatters.js';

class AppState {
  constructor() {
    this.tickets = [];
    this.editID = null;
    this.busy = false;
    this.currentPage = 1;
    this.rowsPerPage = CONFIG.DEFAULT_ROWS_PER_PAGE;
    this.searchQuery = "";
    this.selectedSystem = "";
    this.selectedStatuses = [];
    this.sortDateOrder = "newest";
    this.isInitialLoad = true;
    this.autoRefreshTimer = null;
  }

  setTickets(tickets, updateCache = true) {
    this.tickets = tickets;
    if (updateCache && Array.isArray(tickets)) {
      this.saveCache(tickets);
    }
  }

  saveCache(data = this.tickets) {
    try {
      localStorage.setItem(CONFIG.LOCAL_STORAGE_DATA_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Gagal menyimpan data tiket ke localStorage cache", e);
    }
  }

  loadCache() {
    try {
      const raw = localStorage.getItem(CONFIG.LOCAL_STORAGE_DATA_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : null;
    } catch (e) {
      console.warn("Gagal membaca cache tiket dari localStorage", e);
      return null;
    }
  }

  getFilteredTickets() {
    const q = this.searchQuery.toLowerCase().trim();
    const fs = this.selectedSystem;
    const sortOrder = this.sortDateOrder;
    const selectedStatuses = this.selectedStatuses;

    const filtered = this.tickets.filter(t =>
      (!q || [t.notiket, t.keluhan, t.pic].some(v => (v || "").toLowerCase().includes(q))) &&
      (!fs || t.sistem === fs) &&
      (!selectedStatuses.length || selectedStatuses.includes(t.status))
    );

    filtered.sort((a, b) => {
      const da = getDateValue(a.tanggal);
      const db = getDateValue(b.tanggal);
      return sortOrder === "oldest" ? da - db : db - da;
    });

    return filtered;
  }

  resetPagination() {
    this.currentPage = 1;
  }

  resetFilters() {
    this.searchQuery = "";
    this.selectedSystem = "";
    this.selectedStatuses = [];
    this.sortDateOrder = "newest";
    this.rowsPerPage = CONFIG.DEFAULT_ROWS_PER_PAGE;
    this.resetPagination();
  }
}

export const state = new AppState();
