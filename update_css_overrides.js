const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend/src/App.css');
let css = fs.readFileSync(cssPath, 'utf8');

css += `
/* Override Navbar to be modern */
.navbar {
  background: rgba(19, 27, 44, 0.75) !important;
  backdrop-filter: blur(16px) !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  padding: 1rem 2rem !important;
}

.nav-links {
  gap: 0.5rem !important;
}

.nav-link {
  display: flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  padding: 0.6rem 1rem !important;
  border-radius: var(--radius-sm) !important;
  transition: var(--transition) !important;
}

.nav-link:hover {
  background: var(--bg-navy-hover) !important;
}

.nav-link.active {
  background: rgba(59, 130, 246, 0.15) !important;
  color: var(--accent-cyan) !important;
  border: none !important;
}

.stat-card {
  background: var(--bg-navy-card) !important;
  border: 1px solid var(--border-subtle) !important;
  box-shadow: var(--shadow-card) !important;
  border-radius: var(--radius-lg) !important;
  padding: 1.5rem !important;
}

.stat-value {
  font-size: 2.25rem !important;
  font-weight: 800 !important;
  background: var(--accent-gradient) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
}

.dashboard-grid {
  gap: 2rem !important;
  margin-top: 2rem !important;
}

.dashboard-chart-card, .recent-activity-card {
  background: var(--bg-navy-card) !important;
  border: 1px solid var(--border-subtle) !important;
  box-shadow: var(--shadow-card) !important;
  border-radius: var(--radius-xl) !important;
  padding: 2rem !important;
}

.activity-item {
  background: transparent !important;
  border: none !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  border-radius: 0 !important;
  padding: 1rem 0 !important;
}

.activity-item:last-child {
  border-bottom: none !important;
}

.sessions-table th {
  background: var(--bg-navy-hover) !important;
  color: var(--text-secondary) !important;
  font-weight: 600 !important;
  text-transform: uppercase !important;
  font-size: 0.75rem !important;
  letter-spacing: 0.05em !important;
  padding: 1rem 1.5rem !important;
}

.sessions-table td {
  padding: 1rem 1.5rem !important;
  border-bottom: 1px solid var(--border-subtle) !important;
  color: var(--text-primary) !important;
}

.sessions-table tbody tr {
  transition: background-color 0.2s !important;
}

.sessions-table tbody tr:hover {
  background-color: rgba(255, 255, 255, 0.02) !important;
}

.btn {
  border-radius: var(--radius-sm) !important;
  font-weight: 600 !important;
  padding: 0.6rem 1.25rem !important;
  display: inline-flex !important;
  align-items: center !important;
  gap: 0.5rem !important;
  transition: all 0.2s !important;
}

.primary-btn {
  background: var(--accent-gradient) !important;
  color: white !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
}

.primary-btn:hover {
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4) !important;
  transform: translateY(-1px) !important;
}

.secondary-btn {
  background: var(--bg-navy-input) !important;
  border: 1px solid var(--border-subtle) !important;
}

.secondary-btn:hover {
  background: var(--bg-navy-hover) !important;
}

.form-group label {
  margin-bottom: 0.5rem !important;
  display: block !important;
  color: var(--text-secondary) !important;
}

input, select, textarea {
  background: var(--bg-navy-input) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-md) !important;
  color: var(--text-primary) !important;
  padding: 0.85rem 1rem !important;
  transition: all 0.2s !important;
}

input:focus, select:focus, textarea:focus {
  border-color: var(--border-focus) !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2) !important;
}

.modal-card, .error-modal-card {
  background: var(--bg-navy-card) !important;
  border: 1px solid var(--border-subtle) !important;
  border-radius: var(--radius-xl) !important;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5) !important;
}

.type-badge, .status-badge, .priority-badge {
  padding: 0.25rem 0.75rem !important;
  border-radius: 9999px !important;
  font-size: 0.75rem !important;
  font-weight: 600 !important;
  letter-spacing: 0.025em !important;
}
`;

fs.writeFileSync(cssPath, css);
console.log('App.css updated with modern overrides.');
