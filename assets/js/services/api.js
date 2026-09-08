/* ─── GOOGLE APPS SCRIPT API SERVICE ─── */
import { CONFIG } from '../config.js';
import { normTicket } from '../utils/formatters.js';

export async function callScript(payload, options = {}) {
  const { retries = 2, timeoutMs = 15000 } = options;
  const action = payload.action || "get";

  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      let response;
      if (action === "get") {
        const url = CONFIG.SCRIPT_URL + "?action=get&t=" + Date.now();
        response = await fetch(url, { method: "GET", redirect: "follow", cache: "no-store", signal: controller.signal });
      } else {
        response = await fetch(CONFIG.SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "text/plain;charset=utf-8" },
          body: JSON.stringify(payload),
          redirect: "follow",
          signal: controller.signal
        });
      }

      clearTimeout(timer);
      const text = await response.text();
      try {
        return JSON.parse(text);
      } catch (err) {
        throw new Error("Format respons server tidak valid");
      }
    } catch (err) {
      clearTimeout(timer);
      lastError = err.name === 'AbortError'
        ? new Error("Koneksi server timeout (terlalu lama)")
        : err;

      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
      }
    }
  }

  throw lastError;
}

export async function fetchTickets() {
  const json = await callScript({ action: "get" });
  if (!json.success) throw new Error(json.error || "Gagal mengambil data tiket");
  return (json.data || []).map(normTicket);
}

export async function saveTicket(ticketData, editID = null) {
  const payload = editID
    ? { action: "update", ID: editID, ...ticketData }
    : { action: "create", ...ticketData };
  const result = await callScript(payload);
  if (!result.success) throw new Error(result.error || "Gagal menyimpan tiket");
  return result;
}

export async function deleteTicket(ticketID) {
  const result = await callScript({ action: "delete", ID: ticketID });
  if (!result.success) throw new Error(result.error || "Gagal menghapus tiket");
  return result;
}
