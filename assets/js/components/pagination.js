/* ─── PAGINATION CONTROLLER COMPONENT ─── */

export function getPaginatedData(items, currentPage, rowsPerPage) {
  if (rowsPerPage === "all") {
    return {
      data: items,
      totalPages: 1,
      startIndex: items.length ? 1 : 0,
      endIndex: items.length
    };
  }

  const totalPages = Math.max(1, Math.ceil(items.length / rowsPerPage));
  let safePage = currentPage;
  if (safePage > totalPages) safePage = totalPages;
  if (safePage < 1) safePage = 1;

  const start = (safePage - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  return {
    data: items.slice(start, end),
    totalPages,
    startIndex: items.length ? start + 1 : 0,
    endIndex: Math.min(end, items.length),
    safePage
  };
}

export function renderPageButtons(pageButtonsEl, currentPage, totalPages, rowsPerPage, onGoToPage) {
  if (!pageButtonsEl) return;

  if (rowsPerPage === "all" || totalPages <= 1) {
    pageButtonsEl.innerHTML = `<span class="page-number">${rowsPerPage === "all" ? "All" : "1"}</span>`;
    return;
  }

  const maxButtons = 5;
  let start = Math.max(1, currentPage - 2);
  let end = Math.min(totalPages, start + maxButtons - 1);
  if (end - start + 1 < maxButtons) start = Math.max(1, end - maxButtons + 1);

  pageButtonsEl.innerHTML = "";
  for (let i = start; i <= end; i++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `page-btn ${i === currentPage ? "active-page" : ""}`;
    btn.textContent = String(i);
    btn.addEventListener("click", () => onGoToPage(i));
    pageButtonsEl.appendChild(btn);
  }
}
