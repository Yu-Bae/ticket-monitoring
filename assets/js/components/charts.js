/* ─── CHART.JS ANALYTICS ENGINE ─── */

let chartInstances = {};

export function renderCharts(tickets) {
  const isDark = document.body.classList.contains("dark-mode");
  const textColor = isDark ? "#cbd5e1" : "#475569";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.06)";
  const P = ["#2563eb", "#0284c7", "#f59e0b", "#059669", "#dc2626", "#7c3aed"];

  const getOptions = (type) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: { family: "Plus Jakarta Sans", size: 12, weight: 600 },
          color: textColor,
          padding: 16,
          usePointStyle: true
        }
      }
    },
    scales: type === "bar" ? {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: textColor, font: { family: "JetBrains Mono", size: 11 } },
        grid: { color: gridColor }
      },
      x: {
        ticks: { color: textColor, font: { family: "Plus Jakarta Sans", size: 12, weight: 600 } },
        grid: { display: false }
      }
    } : {}
  });

  function createOrUpdateChart(id, type, labels, data, colors) {
    const canvas = document.getElementById(id);
    if (!canvas) return;

    if (chartInstances[id]) chartInstances[id].destroy();

    chartInstances[id] = new window.Chart(canvas.getContext("2d"), {
      type,
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colors,
          borderRadius: type === "bar" ? 8 : 0,
          borderWidth: 0
        }]
      },
      options: getOptions(type)
    });
  }

  const getCountByStatus = s => tickets.filter(t => t.status === s).length;
  const getCountByPriority = p => tickets.filter(t => t.priority === p).length;
  const getCountBySystem = s => tickets.filter(t => t.sistem === s).length;

  createOrUpdateChart("cStatus", "doughnut", ["On Checking", "On Process", "Hold", "DONE"], [getCountByStatus("On Checking"), getCountByStatus("On Process"), getCountByStatus("Hold"), getCountByStatus("DONE")], [P[0], P[2], "#64748b", P[3]]);
  createOrUpdateChart("cPriority", "doughnut", ["Low", "Medium", "High"], [getCountByPriority("Low"), getCountByPriority("Medium"), getCountByPriority("High")], [P[3], P[2], P[4]]);
  createOrUpdateChart("cSistem", "bar", ["ND6", "DMS"], [getCountBySystem("ND6"), getCountBySystem("DMS")], [P[0], P[5]]);

  const monthlyCounts = {};
  tickets.forEach(t => {
    if (!t.tanggal) return;
    const [y, m] = t.tanggal.split("-");
    const key = `${y}-${m}`;
    monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
  });

  const sortedMonths = Object.keys(monthlyCounts).sort();
  createOrUpdateChart(
    "cBulan",
    "bar",
    sortedMonths.map(k => { const [y, m] = k.split("-"); return `${m}/${y}`; }),
    sortedMonths.map(k => monthlyCounts[k]),
    sortedMonths.map((_, i) => `hsl(${220 + i * 20}, 75%, 55%)`)
  );
}
