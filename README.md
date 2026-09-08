# 🎫 Ticket Monitoring System — Enterprise Architecture (v2.0)

A modern, highly responsive, enterprise-grade Ticket Monitoring Web Application designed for **ND6 & DMS Systems**. Built with a modular folder structure, custom CSS variables, ES6 JavaScript modules, real-time Chart.js analytics, custom modal dialogs, and Google Apps Script Web App integration.

---

## 📁 Folder Structure

```
d:/Aplikasi Monitoring/
├── assets/
│   ├── css/
│   │   ├── variables.css      # Design tokens, theme colors (Light/Dark Mode)
│   │   ├── base.css           # Core typography, resets, ambient glow, scrollbars
│   │   ├── sidebar.css        # Glassmorphic sidebar navigation & mobile drawer
│   │   ├── components.css     # KPI cards, buttons, status badges, forms, multi-select
│   │   ├── table.css          # Data table styling, sticky header, pagination, skeleton loader
│   │   ├── modal.css          # Modal dialogs (Detail view, Delete confirmation, Share view)
│   │   └── main.css           # Main CSS aggregator file importing all CSS modules
│   ├── js/
│   │   ├── config.js          # API endpoints, auto-sync intervals, app settings
│   │   ├── utils/
│   │   │   ├── formatters.js  # Date/time formatting, XSS sanitization, badge generators
│   │   │   └── exports.js     # Excel (.xlsx) and CSV file exporter functions
│   │   ├── services/
│   │   │   └── api.js         # Google Apps Script Web App service layer
│   │   ├── components/
│   │   │   ├── toast.js       # Toast notification alert manager
│   │   │   ├── modal.js       # Modal lifecycle handlers & printable report builder
│   │   │   ├── pagination.js  # Table pagination engine
│   │   │   └── charts.js      # Chart.js analytics engine with Dark Mode support
│   │   ├── state.js           # Central application state manager
│   │   └── app.js             # Application entry point & DOM event handlers
│   └── img/
│       └── logo-tsm.png       # Brand logo asset
├── index.html                 # Main Dashboard Portal
├── view.html                  # Standalone Public Ticket Viewer
├── package.json               # Development scripts & package config
└── README.md                  # System Documentation
```

---

## 🚀 Key Features

1. **Modular Enterprise Architecture**: Fully separated CSS design modules and ES6 JS modules.
2. **Dynamic Dark / Light Mode**: Instant theme switching with `localStorage` persistence.
3. **Interactive KPI Stat Cards**: Total, On Checking, On Process, Hold, and DONE metrics with visual percentage progress bars.
4. **Multi-Select Filtering & Search**: Multi-checkbox status dropdown, system filter (ND6 / DMS), real-time search, and date sorting.
5. **Chart.js Analytics**: Visual Doughnut and Rounded Bar charts tracking status distributions, priority levels, system share, and monthly trends.
6. **Custom Glass Dialogs**: Safety confirmation modals for deleting tickets, full detail viewer, and printable share report viewer.
7. **Multi-Format Export**: Download full or filtered ticket datasets to Excel (`.xlsx`) or CSV (`.csv`), or copy summaries to clipboard.
8. **Real-time Auto Refresh**: Background sync every 60 seconds with active page visibility detection.

---

## 🛠️ Getting Started

### Local Development Server

Run the development server using Python:

```bash
npm start
# or
python -m http.server 8080
```

Then open your browser and navigate to `http://localhost:8080/index.html`.

---

## 🔗 Backend API Integration

The application connects to Google Apps Script Web App:

- **GET Action**: `?action=get` - Fetches all ticket rows.
- **POST Create Action**: `{ action: "create", ...ticketData }` - Creates a new ticket.
- **POST Update Action**: `{ action: "update", ID: id, ...ticketData }` - Updates an existing ticket.
- **POST Delete Action**: `{ action: "delete", ID: id }` - Deletes a ticket by ID.

---

## 📄 License

Distributed under the **MIT License**. Created for TSMK & TMJA Monitoring.
