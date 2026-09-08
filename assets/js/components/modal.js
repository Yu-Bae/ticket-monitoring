/* ─── MODAL DIALOGS COMPONENT ─── */
import { fmtDate, escapeHtml, bPriority, bStatus, bSistem, formatDateTimeNow } from '../utils/formatters.js';

export function showDetailModal(ticket) {
  if (!ticket) return;
  document.getElementById("dNoTiket").textContent = ticket.notiket || "-";
  document.getElementById("dTanggal").textContent = fmtDate(ticket.tanggal);
  document.getElementById("dSistem").innerHTML = bSistem(ticket.sistem);
  document.getElementById("dPic").textContent = ticket.pic || "-";
  document.getElementById("dPriority").innerHTML = bPriority(ticket.priority);
  document.getElementById("dStatus").innerHTML = bStatus(ticket.status);
  document.getElementById("dKeluhan").textContent = ticket.keluhan || "-";
  document.getElementById("dPenyelesaian").textContent = ticket.penyelesaian || "-";
  document.getElementById("detailModal").classList.add("show");
}

export function closeModal() {
  const modal = document.getElementById("detailModal");
  if (modal) modal.classList.remove("show");
}

export function showConfirmDeleteModal(ticket, onConfirmCallback) {
  if (!ticket || !ticket.ID) return;
  const msgEl = document.getElementById("confirmModalMsg");
  const confirmModal = document.getElementById("confirmModal");
  const deleteBtn = document.getElementById("confirmDeleteBtn");

  if (msgEl) {
    msgEl.textContent = `Hapus tiket "${ticket.notiket}" (${ticket.pic})? Aksi ini tidak dapat dibatalkan.`;
  }

  const handleConfirm = async () => {
    deleteBtn.removeEventListener("click", handleConfirm);
    closeConfirmModal();
    if (onConfirmCallback) await onConfirmCallback(ticket);
  };

  deleteBtn.replaceWith(deleteBtn.cloneNode(true));
  const newDeleteBtn = document.getElementById("confirmDeleteBtn");
  newDeleteBtn.addEventListener("click", handleConfirm);

  if (confirmModal) confirmModal.classList.add("show");
}

export function closeConfirmModal() {
  const modal = document.getElementById("confirmModal");
  if (modal) modal.classList.remove("show");
}

export function buildShareReportHtml(filteredTickets, selectedSystem, selectedStatuses, searchValue, sortDateStr) {
  const countChecking = filteredTickets.filter(t => t.status === "On Checking").length;
  const countProcess  = filteredTickets.filter(t => t.status === "On Process").length;
  const countHold     = filteredTickets.filter(t => t.status === "Hold").length;
  const countDone     = filteredTickets.filter(t => t.status === "DONE").length;

  const chips = [];
  chips.push(`<span class="report-chip">Waktu Cetak: ${escapeHtml(formatDateTimeNow())}</span>`);
  chips.push(`<span class="report-chip">Total: ${filteredTickets.length} tiket</span>`);
  chips.push(`<span class="report-chip">Sistem: ${escapeHtml(selectedSystem || "Semua")}</span>`);
  chips.push(`<span class="report-chip">Status: ${escapeHtml(selectedStatuses.length ? selectedStatuses.join(", ") : "Semua")}</span>`);
  chips.push(`<span class="report-chip">Urut: ${escapeHtml(sortDateStr)}</span>`);
  if (searchValue) chips.push(`<span class="report-chip">Cari: ${escapeHtml(searchValue)}</span>`);

  const rows = filteredTickets.length
    ? filteredTickets.map((t, i) => `
      <tr>
        <td class="share-no">${i + 1}</td>
        <td class="date-cell">${escapeHtml(fmtDate(t.tanggal))}</td>
        <td><span class="share-ticket-code">${escapeHtml(t.notiket || "-")}</span></td>
        <td>${bSistem(t.sistem)}</td>
        <td>${escapeHtml(t.pic || "-")}</td>
        <td>${bPriority(t.priority)}</td>
        <td>${bStatus(t.status)}</td>
        <td style="white-space:normal;word-break:break-word;">${escapeHtml(t.keluhan || "-")}</td>
        <td style="white-space:normal;word-break:break-word;">${escapeHtml((t.penyelesaian || "").trim() || "-")}</td>
      </tr>`).join("")
    : "";

  return `
    <div class="report-header">
      <div class="report-title">
        <h1>Laporan Monitoring Tiket</h1>
        <p>Laporan detail tiket berdasarkan filter aktif. Cocok untuk dokumentasi &amp; ekspor PDF.</p>
      </div>
      <div class="report-meta">
        <div class="report-meta-card"><small>Tanggal Laporan</small><strong>${escapeHtml(formatDateTimeNow())}</strong></div>
        <div class="report-meta-card"><small>Total Tiket</small><strong>${filteredTickets.length}</strong></div>
      </div>
    </div>
    <div class="report-chip-wrap">${chips.join("")}</div>
    <div class="report-stats">
      <div class="report-stat blue"><small>Total</small><strong>${filteredTickets.length}</strong></div>
      <div class="report-stat sky"><small>On Checking</small><strong>${countChecking}</strong></div>
      <div class="report-stat amber"><small>On Process</small><strong>${countProcess}</strong></div>
      <div class="report-stat gray"><small>Hold</small><strong>${countHold}</strong></div>
      <div class="report-stat green"><small>DONE</small><strong>${countDone}</strong></div>
    </div>
    ${filteredTickets.length
      ? `<div class="share-table-wrap">
           <table class="share-report-table">
             <thead><tr>
               <th style="width:4%">#</th>
               <th style="width:9%">Tanggal</th>
               <th style="width:11%">No Tiket</th>
               <th style="width:7%">Sistem</th>
               <th style="width:10%">PIC</th>
               <th style="width:8%">Priority</th>
               <th style="width:10%">Status</th>
               <th style="width:21%">Keluhan</th>
               <th style="width:20%">Penyelesaian</th>
             </tr></thead>
             <tbody>${rows}</tbody>
           </table>
         </div>`
      : `<div class="share-report-empty" style="padding:40px;text-align:center;"><h3>Tidak Ada Tiket Terfilter</h3></div>`
    }`;
}

export function openShareOverlay(filteredTickets, selectedSystem, selectedStatuses, searchValue, sortDateStr) {
  const contentEl = document.getElementById("shareContent");
  const overlayEl = document.getElementById("shareOverlay");
  if (!contentEl || !overlayEl) return;

  contentEl.innerHTML = buildShareReportHtml(filteredTickets, selectedSystem, selectedStatuses, searchValue, sortDateStr);
  overlayEl.classList.add("show");
  document.body.style.overflow = "hidden";
}

export function closeShareOverlay() {
  const overlayEl = document.getElementById("shareOverlay");
  if (overlayEl) {
    overlayEl.classList.remove("show");
    document.body.style.overflow = "";
  }
}
