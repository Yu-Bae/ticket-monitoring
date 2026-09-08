/* ─── FILE EXPORTER UTILITIES (EXCEL & CSV) ─── */
import { fmtDate, getTodayLocal } from './formatters.js';
import { showToast } from '../components/toast.js';

export function exportExcel(tickets) {
  if (!tickets.length) {
    showToast("Tidak ada data tiket untuk diunduh", "info");
    return;
  }
  const rows = [["ID", "Tanggal", "No Tiket", "Keluhan", "Sistem", "Penyelesaian", "PIC", "Priority", "Status"]];
  tickets.forEach(t => rows.push([t.ID, fmtDate(t.tanggal), t.notiket, t.keluhan, t.sistem, t.penyelesaian, t.pic, t.priority, t.status]));
  
  const ws = window.XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [14, 14, 18, 45, 10, 45, 18, 12, 16].map(w => ({ wch: w }));
  const wb = window.XLSX.utils.book_new();
  window.XLSX.utils.book_append_sheet(wb, ws, "Tiket");
  window.XLSX.writeFile(wb, `ticket-monitoring-${getTodayLocal()}.xlsx`);
  showToast("File Excel berhasil diunduh!", "success");
}

export function exportCSV(tickets) {
  if (!tickets.length) {
    showToast("Tidak ada data tiket untuk diunduh", "info");
    return;
  }
  const esc = v => `"${String(v||"").replace(/"/g,'""')}"`;
  const lines = [["ID", "Tanggal", "No Tiket", "Keluhan", "Sistem", "Penyelesaian", "PIC", "Priority", "Status"].map(esc).join(",")];
  tickets.forEach(t => lines.push([t.ID, fmtDate(t.tanggal), t.notiket, t.keluhan, t.sistem, t.penyelesaian, t.pic, t.priority, t.status].map(esc).join(",")));
  
  const blob = new Blob([lines.join("\r\n")], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `ticket-monitoring-${getTodayLocal()}.csv`;
  a.click();
  URL.revokeObjectURL(a.href);
  showToast("File CSV berhasil diunduh!", "success");
}
