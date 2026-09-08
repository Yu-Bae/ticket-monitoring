/* ─── MAIN APPLICATION CONTROLLER ─── */
import { CONFIG } from './config.js';
import { state } from './state.js';
import { fetchTickets, saveTicket, deleteTicket } from './services/api.js';
import { getTodayLocal, formatDateTimeNow, fmtDate, escapeHtml, bPriority, bStatus, bSistem } from './utils/formatters.js';
import { exportExcel, exportCSV } from './utils/exports.js';
import { showToast } from './components/toast.js';
import { showDetailModal, closeModal, showConfirmDeleteModal, closeConfirmModal, openShareOverlay, closeShareOverlay } from './components/modal.js';
import { getPaginatedData, renderPageButtons } from './components/pagination.js';
import { renderCharts } from './components/charts.js';

// DOM Selectors
const tableBody        = document.getElementById("tableBody");
const searchEl         = document.getElementById("search");
const fSistemEl        = document.getElementById("fSistem");
const fUrutTanggalEl   = document.getElementById("fUrutTanggal");
const rowsPerPageEl    = document.getElementById("rowsPerPage");
const paginationInfoEl = document.getElementById("paginationInfo");
const pageButtonsEl    = document.getElementById("pageButtons");
const firstPageBtn     = document.getElementById("firstPageBtn");
const prevPageBtn      = document.getElementById("prevPageBtn");
const nextPageBtn      = document.getElementById("nextPageBtn");
const lastPageBtn      = document.getElementById("lastPageBtn");
const lastUpdateTextEl = document.getElementById("lastUpdateText");
const darkModeBtn      = document.getElementById("darkModeBtn");
const fStatusFormEl    = document.getElementById("fStatusForm");
const submitBtn        = document.getElementById("submitBtn");
const form             = document.getElementById("ticketForm");

const statusChecks = () => Array.from(document.querySelectorAll(".status-check"));

/* Theme & Layout Functions */
export function toggleDarkMode() {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  localStorage.setItem(CONFIG.LOCAL_STORAGE_THEME_KEY, isDark ? "1" : "0");
  updateDarkModeButton();
  if (document.getElementById("page-statistik")?.classList.contains("active")) {
    renderCharts(state.tickets);
  }
}

function loadDarkMode() {
  if (localStorage.getItem(CONFIG.LOCAL_STORAGE_THEME_KEY) === "1") {
    document.body.classList.add("dark-mode");
  }
  updateDarkModeButton();
}

function updateDarkModeButton() {
  if (!darkModeBtn) return;
  const isDark = document.body.classList.contains("dark-mode");
  darkModeBtn.innerHTML = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
}

export function toggleSidebar() {
  if (window.innerWidth <= 860) {
    document.body.classList.toggle("sidebar-open");
  } else {
    document.body.classList.toggle("sidebar-collapsed");
  }
}

export function closeSidebarMobile() {
  document.body.classList.remove("sidebar-open");
}

export function showPage(name) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
  document.getElementById("page-" + name)?.classList.add("active");
  document.getElementById("nav-" + name)?.classList.add("active");
  if (name === "statistik") renderCharts(state.tickets);
}

/* Multi-select Dropdown Handler */
function updateStatusButtonLabel() {
  const selected = statusChecks().filter(ch => ch.checked).map(ch => ch.value);
  state.selectedStatuses = selected;
  const labelEl = document.getElementById("statusBtnLabel");
  if (!labelEl) return;
  if (!selected.length) labelEl.textContent = "Semua Status";
  else if (selected.length === 1) labelEl.textContent = selected[0];
  else labelEl.textContent = `${selected.length} Status Dipilih`;
}

export function toggleStatusDropdown() {
  document.getElementById("statusMulti")?.classList.toggle("open");
}

export function closeStatusDropdown() {
  document.getElementById("statusMulti")?.classList.remove("open");
}

/* Skeleton Loader & UI Update */
function showSkeletonLoading(rowCount = 10) {
  if (!tableBody) return;
  tableBody.innerHTML = "";
  for (let i = 0; i < rowCount; i++) {
    tableBody.innerHTML += `
      <tr class="skeleton-row">
        <td><div class="skeleton" style="width:24px"></div></td>
        <td><div class="skeleton" style="width:84px"></div></td>
        <td><div class="skeleton" style="width:110px"></div></td>
        <td><div class="skeleton" style="width:220px"></div></td>
        <td><div class="skeleton" style="width:60px"></div></td>
        <td><div class="skeleton" style="width:90px"></div></td>
        <td><div class="skeleton" style="width:75px"></div></td>
        <td><div class="skeleton" style="width:95px"></div></td>
        <td><div class="skeleton" style="width:90px"></div></td>
      </tr>`;
  }
}

function updateStats() {
  const total = state.tickets.length;
  const cChecking = state.tickets.filter(t => t.status === "On Checking").length;
  const cProcess  = state.tickets.filter(t => t.status === "On Process").length;
  const cHold     = state.tickets.filter(t => t.status === "Hold").length;
  const cDone     = state.tickets.filter(t => t.status === "DONE").length;

  document.getElementById("sTotal").textContent    = total;
  document.getElementById("sChecking").textContent = cChecking;
  document.getElementById("sProcess").textContent  = cProcess;
  document.getElementById("sHold").textContent     = cHold;
  document.getElementById("sDone").textContent        = cDone;

  const pct = v => total > 0 ? (v / total * 100).toFixed(1) + "%" : "0%";
  document.getElementById("bTotal").style.width    = "100%";
  document.getElementById("bChecking").style.width = pct(cChecking);
  document.getElementById("bProcess").style.width  = pct(cProcess);
  document.getElementById("bHold").style.width     = pct(cHold);
  document.getElementById("bDone").style.width     = pct(cDone);
}

export function render() {
  const filtered = state.getFilteredTickets();
  const pageResult = getPaginatedData(filtered, state.currentPage, state.rowsPerPage);
  state.currentPage = pageResult.safePage || state.currentPage;
  const paginated = pageResult.data;

  if (!filtered.length) {
    tableBody.innerHTML = `<tr><td colspan="9"><div class="empty">
      <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M8 15h8M9 9h.01M15 9h.01"/></svg>
      <h3>Tidak Ada Tiket Ditemukan</h3>
      <p>Coba sesuaikan kata kunci pencarian atau reset filter</p>
    </div></td></tr>`;
  } else {
    tableBody.innerHTML = paginated.map((t, i) => {
      const idx = state.tickets.indexOf(t);
      const number = state.rowsPerPage === "all" ? i + 1 : ((state.currentPage - 1) * state.rowsPerPage) + i + 1;
      const klhn = (t.keluhan || "").length > 55 ? t.keluhan.substring(0, 55) + "…" : t.keluhan || "-";

      return `<tr>
        <td style="color:var(--text-sub);font-size:12px;font-family:var(--font-mono);">${number}</td>
        <td class="date-cell">${fmtDate(t.tanggal)}</td>
        <td><span class="notiket-cell">${escapeHtml(t.notiket || "-")}</span></td>
        <td class="keluhan-cell" title="${escapeHtml(t.keluhan || "")}">${escapeHtml(klhn)}</td>
        <td>${bSistem(t.sistem)}</td>
        <td style="font-size:13.5px;font-weight:500;">${escapeHtml(t.pic || "-")}</td>
        <td>${bPriority(t.priority)}</td>
        <td>${bStatus(t.status)}</td>
        <td>
          <div class="acts">
            <button class="icon-btn ib-view" data-action="detail" data-index="${idx}" title="Detail Tiket">
              <svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg>
            </button>
            <button class="icon-btn ib-edit" data-action="edit" data-index="${idx}" title="Edit Tiket" ${!t.ID ? "disabled" : ""}>
              <svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
            </button>
            <button class="icon-btn ib-del" data-action="delete" data-index="${idx}" title="Hapus Tiket" ${!t.ID ? "disabled" : ""}>
              <svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
            </button>
          </div>
        </td>
      </tr>`;
    }).join("");
  }

  // Update Pagination Controls
  if (state.rowsPerPage === "all") {
    paginationInfoEl.textContent = `Menampilkan semua ${filtered.length} data`;
    renderPageButtons(pageButtonsEl, 1, 1, "all", goToPage);
    if (firstPageBtn) firstPageBtn.disabled = true;
    prevPageBtn.disabled = true;
    nextPageBtn.disabled = true;
    if (lastPageBtn) lastPageBtn.disabled = true;
  } else {
    paginationInfoEl.textContent = filtered.length
      ? `Menampilkan ${pageResult.startIndex}–${pageResult.endIndex} dari ${filtered.length} data`
      : "Menampilkan 0 data";
    renderPageButtons(pageButtonsEl, state.currentPage, pageResult.totalPages, state.rowsPerPage, goToPage);
    if (firstPageBtn) firstPageBtn.disabled = state.currentPage <= 1;
    prevPageBtn.disabled = state.currentPage <= 1;
    nextPageBtn.disabled = state.currentPage >= pageResult.totalPages || filtered.length === 0;
    if (lastPageBtn) lastPageBtn.disabled = state.currentPage >= pageResult.totalPages || filtered.length === 0;
  }

  updateStats();
}

function goToPage(page) {
  state.currentPage = page;
  render();
}

/* Data Load & Actions */
export async function loadTickets(options = {}) {
  const { silent = false, keepPage = false } = options;
  const syncBtn = document.getElementById("syncBtn");
  if (syncBtn) syncBtn.classList.add("spinning");

  // Stale-While-Revalidate: render cache immediately if available
  const hasLoadedTickets = state.tickets && state.tickets.length > 0;
  if (!hasLoadedTickets) {
    const cachedData = state.loadCache();
    if (cachedData) {
      state.setTickets(cachedData, false);
      render();
    } else if (!silent) {
      showSkeletonLoading(state.rowsPerPage === "all" ? 10 : Math.min(Number(state.rowsPerPage) || 10, 10));
    }
  }

  try {
    const data = await fetchTickets();

    state.setTickets(data, true);
    if (!keepPage) state.resetPagination();
    render();

    const nowStr = formatDateTimeNow();
    if (lastUpdateTextEl) lastUpdateTextEl.textContent = `Last sync: ${nowStr}`;
    const lastSyncTextEl = document.getElementById("lastSyncText");
    if (lastSyncTextEl) lastSyncTextEl.textContent = `Last sync: ${nowStr}`;

    if (!silent || state.isInitialLoad) showToast(`${data.length} tiket berhasil dimuat`, "info");
    state.isInitialLoad = false;
  } catch (err) {
    console.error(err);
    if (state.tickets.length > 0) {
      showToast("Gagal memperbarui live data, menampilkan cache data: " + err.message, "warning");
    } else {
      if (!silent && tableBody) tableBody.innerHTML = `<tr><td class="loading-td" colspan="9">⚠ Gagal memuat data: ${err.message}</td></tr>`;
      showToast("Gagal memuat: " + err.message, "error");
    }
  } finally {
    if (syncBtn) syncBtn.classList.remove("spinning");
  }
}

export function openAddForm() {
  resetForm();
  const fTitle = document.getElementById("formTitle");
  if (fTitle) fTitle.textContent = "Tambah Tiket Baru";
  const fSub = document.getElementById("formSubtitle");
  if (fSub) fSub.textContent = "Isi formulir lengkap di bawah ini untuk mendaftarkan tiket baru";
  showPage("tambah");
}

export function editTicket(i) {
  const t = state.tickets[i];
  if (!t || !t.ID) { showToast("ID tiket tidak ditemukan!", "error"); return; }
  state.editID = t.ID;
  const fTanggalEl = document.getElementById("fTanggal");
  if (fTanggalEl) fTanggalEl.value = t.tanggal || "";
  const fNoTiketEl = document.getElementById("fNoTiket");
  if (fNoTiketEl) fNoTiketEl.value = t.notiket || "";
  const fKeluhanEl = document.getElementById("fKeluhan");
  if (fKeluhanEl) fKeluhanEl.value = t.keluhan || "";
  const fSistemFormEl = document.getElementById("fSistemForm");
  if (fSistemFormEl) fSistemFormEl.value = t.sistem || "ND6";
  const fPenyelesaianEl = document.getElementById("fPenyelesaian");
  if (fPenyelesaianEl) fPenyelesaianEl.value = t.penyelesaian || "";
  const fPicEl = document.getElementById("fPic");
  if (fPicEl) fPicEl.value = t.pic || "";
  const fPriorityEl = document.getElementById("fPriority");
  if (fPriorityEl) fPriorityEl.value = t.priority || "Low";
  if (fStatusFormEl) fStatusFormEl.value = t.status || "On Checking";
  const fTitle = document.getElementById("formTitle");
  if (fTitle) fTitle.textContent = "Edit Tiket";
  const fSub = document.getElementById("formSubtitle");
  if (fSub) fSub.textContent = `Mengubah data tiket: ${t.notiket}`;
  if (submitBtn) submitBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg> Update Tiket`;
  showPage("tambah");
}

export function resetForm() {
  if (form) form.reset();
  state.editID = null;
  const fTanggalEl = document.getElementById("fTanggal");
  if (fTanggalEl) fTanggalEl.value = getTodayLocal();
  const fSistemFormEl = document.getElementById("fSistemForm");
  if (fSistemFormEl) fSistemFormEl.value = "ND6";
  const fPriorityEl = document.getElementById("fPriority");
  if (fPriorityEl) fPriorityEl.value = "Low";
  if (fStatusFormEl) fStatusFormEl.value = "On Checking";
  if (submitBtn) submitBtn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg> Simpan Tiket`;
}

export function handleFilterChange() {
  state.searchQuery = searchEl ? searchEl.value : "";
  state.selectedSystem = fSistemEl ? fSistemEl.value : "";
  state.sortDateOrder = fUrutTanggalEl ? fUrutTanggalEl.value : "newest";
  state.resetPagination();
  render();
}

export function resetFilters() {
  if (searchEl) searchEl.value = "";
  if (fSistemEl) fSistemEl.value = "";
  if (fUrutTanggalEl) fUrutTanggalEl.value = "newest";
  if (rowsPerPageEl) rowsPerPageEl.value = "10";
  statusChecks().forEach(ch => ch.checked = false);
  state.resetFilters();
  updateStatusButtonLabel();
  closeStatusDropdown();
  render();
  showToast("Filter berhasil direset", "info");
}

export function handleShareView() {
  const filtered = state.getFilteredTickets();
  const sortDateStr = (fUrutTanggalEl && fUrutTanggalEl.value === "oldest") ? "Terlama ke Terbaru" : "Terbaru ke Terlama";
  openShareOverlay(filtered, fSistemEl ? fSistemEl.value : "", state.selectedStatuses, searchEl ? searchEl.value.trim() : "", sortDateStr);
}

export function openViewPage() {
  const filtered = state.getFilteredTickets();
  localStorage.setItem(CONFIG.LOCAL_STORAGE_DATA_KEY, JSON.stringify(filtered));
  window.open("./view.html", "_blank");
}

export async function copyTextToClipboard(text, successMsg = "Berhasil disalin ke clipboard!") {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showToast(successMsg, "success");
      return;
    }
  } catch (e) {
    console.warn("Clipboard API call failed, attempting textarea fallback", e);
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);

    if (ok) {
      showToast(successMsg, "success");
    } else {
      throw new Error("execCommand failed");
    }
  } catch (err) {
    console.error("Copy failed", err);
    showToast("Gagal menyalin otomatis ke clipboard", "error");
  }
}

export async function copyActiveSummary() {
  const filtered = state.getFilteredTickets();
  const selectedStatuses = state.selectedStatuses;
  const selectedSystem = (fSistemEl && fSistemEl.value) || "Semua";
  const searchValue = searchEl ? searchEl.value.trim() : "";
  const sortDate = (fUrutTanggalEl && fUrutTanggalEl.value === "oldest") ? "Terlama ke Terbaru" : "Terbaru ke Terlama";

  let summary = `📋 LAPORAN TIKET MONITORING\n`;
  summary += `Waktu: ${formatDateTimeNow()}\n`;
  summary += `Sistem: ${selectedSystem}\n`;
  summary += `Status: ${selectedStatuses.length ? selectedStatuses.join(", ") : "Semua"}\n`;
  summary += `Urutan: ${sortDate}\n`;
  if (searchValue) summary += `Pencarian: "${searchValue}"\n`;
  summary += `Total: ${filtered.length} tiket\n\n`;

  if (!filtered.length) {
    summary += `Tidak ada tiket ditemukan.`;
  } else {
    summary += filtered.map((t, i) =>
      `${i + 1}. [${t.notiket || "-"}] ${t.status || "-"} | ${t.sistem || "-"} | PIC: ${t.pic || "-"} | ${t.keluhan || "-"}`
    ).join("\n");
  }

  await copyTextToClipboard(summary, "Summary berhasil disalin ke clipboard!");
}

export async function copyWhatsAppFormat() {
  const filtered = state.getFilteredTickets();
  const todayStr = formatDateTimeNow().split(" ")[0];
  const activeCases = filtered.filter(t => t.status === "On Checking" || t.status === "On Process");
  const countChecking = filtered.filter(t => t.status === "On Checking").length;
  const countProcess  = filtered.filter(t => t.status === "On Process").length;
  const countHold     = filtered.filter(t => t.status === "Hold").length;
  const countDone     = filtered.filter(t => t.status === "DONE").length;

  let text = `*Dear All,*\n`;
  text += `*Update Pengerjaan Monitoring Tiket ND6 & DMS*\n`;
  text += `📅 *${todayStr}*\n\n`;
  text += `🔗 *Berikut Link Akses Online Monitoring Tiket Case:*\nhttps://yu-bae.github.io/ticket-monitoring/view.html\n\n`;
  text += `📊 *Ringkasan Status Tiket (${filtered.length} Total):*\n`;
  text += `• On Checking: ${countChecking}\n`;
  text += `• On Process: ${countProcess}\n`;
  text += `• Hold: ${countHold}\n`;
  text += `• DONE: ${countDone}\n\n`;
  text += `📌 *Tambahan Report Harian Case (On Process & On Checking):*\n`;

  if (activeCases.length > 0) {
    activeCases.forEach((t, i) => {
      text += `${i + 1}. [${t.notiket || "-"}] ${t.sistem} | PIC: ${t.pic || "-"} | Status: ${t.status}\n   • Keluhan: ${t.keluhan || "-"}\n`;
    });
  } else {
    text += `Tidak ada case aktif (On Process / On Checking) hari ini.\n`;
  }

  await copyTextToClipboard(text, "Format WhatsApp berhasil disalin! Tinggal Paste di WA.");
}

/* Event Binders Initialization */
function initEvents() {
  loadDarkMode();
  const fTanggalEl = document.getElementById("fTanggal");
  if (fTanggalEl) fTanggalEl.value = getTodayLocal();
  updateStatusButtonLabel();

  // Search & Filter Events
  searchEl?.addEventListener("input", handleFilterChange);
  fSistemEl?.addEventListener("change", handleFilterChange);
  fUrutTanggalEl?.addEventListener("change", handleFilterChange);
  rowsPerPageEl?.addEventListener("change", function() {
    state.rowsPerPage = this.value === "all" ? "all" : Number(this.value);
    state.resetPagination();
    render();
  });

  statusChecks().forEach(ch => {
    ch.addEventListener("change", () => {
      updateStatusButtonLabel();
      handleFilterChange();
    });
  });

  // Table Delegation Actions
  tableBody?.addEventListener("click", e => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const action = btn.dataset.action;
    const index = Number(btn.dataset.index);
    if (isNaN(index)) return;

    if (action === "detail") {
      showDetailModal(state.tickets[index]);
    } else if (action === "edit") {
      editTicket(index);
    } else if (action === "delete") {
      showConfirmDeleteModal(state.tickets[index], async (ticket) => {
        try {
          await deleteTicket(ticket.ID);
          showToast(`Tiket "${ticket.notiket}" telah dihapus`, "delete");
          await loadTickets();
        } catch (err) {
          showToast(err.message, "error");
        }
      });
    }
  });

  // Pagination Navigation Buttons
  firstPageBtn?.addEventListener("click", () => { state.currentPage = 1; render(); });
  prevPageBtn?.addEventListener("click", () => { if (state.currentPage > 1) { state.currentPage--; render(); } });
  nextPageBtn?.addEventListener("click", () => { state.currentPage++; render(); });
  lastPageBtn?.addEventListener("click", () => {
    const total = state.getFilteredTickets().length;
    state.currentPage = state.rowsPerPage === "all" ? 1 : Math.max(1, Math.ceil(total / state.rowsPerPage));
    render();
  });

  // Form Submit
  form?.addEventListener("submit", async e => {
    e.preventDefault();
    if (state.busy) return;

    const noTiket = document.getElementById("fNoTiket")?.value.trim() || "";
    const keluhan = document.getElementById("fKeluhan")?.value.trim() || "";
    const pic     = document.getElementById("fPic")?.value.trim() || "";

    if (!noTiket) {
      showToast("Nomor Tiket wajib diisi!", "error");
      document.getElementById("fNoTiket")?.focus();
      return;
    }
    if (noTiket.length < 2) {
      showToast("Nomor Tiket minimal 2 karakter!", "error");
      document.getElementById("fNoTiket")?.focus();
      return;
    }
    if (!keluhan) {
      showToast("Keluhan wajib diisi!", "error");
      document.getElementById("fKeluhan")?.focus();
      return;
    }
    if (keluhan.length < 3) {
      showToast("Deskripsi keluhan terlalu pendek!", "error");
      document.getElementById("fKeluhan")?.focus();
      return;
    }
    if (!pic) {
      showToast("Nama PIC wajib diisi!", "error");
      document.getElementById("fPic")?.focus();
      return;
    }

    const data = {
      Tanggal:      document.getElementById("fTanggal")?.value || "",
      NoTiket:      noTiket,
      Keluhan:      keluhan,
      Sistem:       document.getElementById("fSistemForm")?.value || "ND6",
      Penyelesaian: document.getElementById("fPenyelesaian")?.value.trim() || "",
      PIC:          pic,
      Priority:     document.getElementById("fPriority")?.value || "Low",
      Status:       fStatusFormEl ? fStatusFormEl.value : "On Checking",
    };

    state.busy = true;
    submitBtn.disabled = true;
    const origHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `<svg style="animation:spin .7s linear infinite" viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> Menyimpan...`;

    try {
      await saveTicket(data, state.editID);
      showToast(state.editID ? "Tiket berhasil diperbarui!" : "Tiket baru berhasil ditambahkan!", state.editID ? "edit" : "success");
      resetForm();
      await loadTickets();
      showPage("dashboard");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      state.busy = false;
      submitBtn.disabled = false;
      submitBtn.innerHTML = origHTML;
    }
  });

  // Modal Backdrop Click Dismiss
  document.getElementById("detailModal")?.addEventListener("click", e => { if (e.target === e.currentTarget) closeModal(); });
  document.getElementById("confirmModal")?.addEventListener("click", e => { if (e.target === e.currentTarget) closeConfirmModal(); });
  document.getElementById("shareOverlay")?.addEventListener("click", e => { if (e.target === e.currentTarget) closeShareOverlay(); });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") { closeModal(); closeConfirmModal(); closeStatusDropdown(); closeShareOverlay(); }
  });

  document.addEventListener("click", e => {
    const multi = document.getElementById("statusMulti");
    if (multi && !multi.contains(e.target)) closeStatusDropdown();
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (state.autoRefreshTimer) clearInterval(state.autoRefreshTimer);
    } else {
      loadTickets({ silent: true, keepPage: true });
      state.autoRefreshTimer = setInterval(() => loadTickets({ silent: true, keepPage: true }), CONFIG.AUTO_REFRESH_MS);
    }
  });

  // Attach Window Exports for Global In-line Callbacks
  window.toggleDarkMode = toggleDarkMode;
  window.toggleSidebar = toggleSidebar;
  window.closeSidebarMobile = closeSidebarMobile;
  window.showPage = showPage;
  window.openAddForm = openAddForm;
  window.loadTickets = loadTickets;
  window.toggleStatusDropdown = toggleStatusDropdown;
  window.resetFilters = resetFilters;
  window.copyActiveSummary = copyActiveSummary;
  window.copyWhatsAppFormat = copyWhatsAppFormat;
  window.openViewPage = openViewPage;
  window.openShareView = handleShareView;
  window.closeShareView = closeShareOverlay;
  window.printShareView = () => { handleShareView(); window.print(); };
  window.closeModal = closeModal;
  window.closeConfirmModal = closeConfirmModal;
  window.exportExcel = () => exportExcel(state.tickets);
  window.exportCSV = () => exportCSV(state.tickets);
  window.resetForm = resetForm;

  // Initial Load
  loadTickets({ silent: false, keepPage: false });
  state.autoRefreshTimer = setInterval(() => loadTickets({ silent: true, keepPage: true }), CONFIG.AUTO_REFRESH_MS);
}

// Initialize App when DOM Ready or immediately if already loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEvents);
} else {
  initEvents();
}
