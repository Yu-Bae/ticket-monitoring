/* ─── FORMATTER & UTILITY HELPERS ─── */

export function getTodayLocal() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatDateTimeNow() {
  const d = new Date();
  const date = `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`;
  const time = `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}`;
  return `${date} ${time}`;
}

export function toInput(s) {
  if (!s) return "";
  s = String(s).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  if (/^\d{4}-\d{2}-\d{2}T/.test(s)) {
    const d = new Date(s);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth()+1).padStart(2,"0");
      const day = String(d.getDate()).padStart(2,"0");
      return `${y}-${m}-${day}`;
    }
  }
  const mm = { jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12" };
  const m = s.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/i);
  if (m) return `${m[3]}-${mm[m[2].toLowerCase()]||"01"}-${m[1].padStart(2,"0")}`;
  return s;
}

export function fmtDate(s) {
  const d = toInput(s);
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const p = d.split("-");
    return `${p[2]}-${p[1]}-${p[0]}`;
  }
  return "-";
}

export function getDateValue(dateStr) {
  const v = toInput(dateStr);
  const d = new Date(v);
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

export function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#039;");
}

export const bPriority = v => ({
  High:   `<span class="badge p-high"><span class="bdot"></span>High</span>`,
  Medium: `<span class="badge p-med"><span class="bdot"></span>Medium</span>`,
  Low:    `<span class="badge p-low"><span class="bdot"></span>Low</span>`
}[v] || `<span class="badge p-low"><span class="bdot"></span>Low</span>`);

export const bStatus = v => v === "DONE"
  ? `<span class="badge s-done"><span class="bdot"></span>DONE</span>`
  : v === "On Process"
    ? `<span class="badge s-proc"><span class="bdot"></span>On Process</span>`
    : v === "Hold"
      ? `<span class="badge s-hold"><span class="bdot"></span>Hold</span>`
      : `<span class="badge s-check"><span class="bdot"></span>On Checking</span>`;

export const bSistem = v => v === "DMS"
  ? `<span class="badge sys-dms">DMS</span>`
  : `<span class="badge sys-nd6">ND6</span>`;

export function normTicket(item) {
  const stMap = s => {
    const v = (s || "").trim().toLowerCase();
    if (v === "done") return "DONE";
    if (v === "hold") return "Hold";
    if (v === "on process") return "On Process";
    return "On Checking";
  };
  return {
    ID:           String(item.ID || item.id || "").trim(),
    tanggal:      toInput(item.Tanggal || item.tanggal || ""),
    notiket:      String(item.NoTiket || item.notiket || ""),
    keluhan:      String(item.Keluhan || item.keluhan || ""),
    sistem:       String(item.Sistem || item.sistem || "ND6"),
    penyelesaian: String(item.Penyelesaian || item.penyelesaian || ""),
    pic:          String(item.PIC || item.pic || ""),
    priority:     String(item.Priority || item.priority || "Low"),
    status:       stMap(item.Status || item.status || ""),
  };
}
