const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'frontend/src/App.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Replace the root variables to be more modern and bright or a highly polished dark mode.
const newVars = `
:root {
  --bg-navy-dark: #0b0f19;
  --bg-navy-card: #131b2c;
  --bg-navy-input: #1a2333;
  --bg-navy-hover: #1f2937;
  --border-subtle: #2d3748;
  --border-focus: #3b82f6;

  --accent-cyan: #3b82f6;
  --accent-purple: #8b5cf6;
  --accent-gradient: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  --accent-gradient-hover: linear-gradient(135deg, #2563eb 0%, #7c3aed 100%);

  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;

  --success-bg: rgba(16, 185, 129, 0.1);
  --success-border: #10b981;
  --success-text: #10b981;

  --warning-bg: rgba(245, 158, 11, 0.1);
  --warning-border: #f59e0b;
  --warning-text: #f59e0b;

  --error-bg: rgba(239, 68, 68, 0.1);
  --error-border: #ef4444;
  --error-text: #ef4444;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  
  --shadow-card: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.15);
  --transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  
  --sidebar-width: 280px;
}
`;

css = css.replace(/:root\s*\{[\s\S]*?--transition:[^}]*\n\}/, newVars);

// Update some other structural CSS classes if needed.
// We will just append new utility classes that we can use.
css += `

/* Modern Overrides */
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  letter-spacing: -0.01em;
}

.login-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-navy-dark);
}

/* Split Layout for Login */
.login-split-left {
  flex: 1;
  display: none;
  background: var(--bg-navy-card);
  position: relative;
  overflow: hidden;
  align-items: center;
  justify-content: center;
  border-right: 1px solid var(--border-subtle);
}

@media (min-width: 1024px) {
  .login-split-left {
    display: flex;
  }
}

.login-split-right {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.login-brand-art {
  text-align: center;
  z-index: 10;
}

.login-brand-art h1 {
  font-size: 3rem;
  font-weight: 800;
  background: var(--accent-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
}

.login-brand-art p {
  color: var(--text-secondary);
  font-size: 1.125rem;
  max-width: 400px;
  margin: 0 auto;
}

.login-card {
  width: 100%;
  max-width: 480px;
  background: var(--bg-navy-card);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-xl);
  padding: 3rem;
  box-shadow: var(--shadow-card);
}

.input-with-icon {
  position: relative;
}

.input-with-icon input {
  padding-left: 2.75rem;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-muted);
  width: 1.25rem;
  height: 1.25rem;
}

.app-layout {
  display: flex;
  min-height: 100vh;
}

.app-sidebar {
  width: var(--sidebar-width);
  background: var(--bg-navy-card);
  border-right: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 50;
}

.app-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

@media (max-width: 1024px) {
  .app-sidebar {
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .app-sidebar.open {
    transform: translateX(0);
  }
  .app-main {
    margin-left: 0;
  }
}

.sidebar-header {
  height: 72px;
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  border-bottom: 1px solid var(--border-subtle);
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--text-secondary);
  text-decoration: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  transition: var(--transition);
}

.sidebar-link:hover {
  background: var(--bg-navy-hover);
  color: var(--text-primary);
}

.sidebar-link.active {
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-cyan);
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid var(--border-subtle);
}

.app-header {
  height: 72px;
  background: rgba(11, 15, 25, 0.8);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-subtle);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  position: sticky;
  top: 0;
  z-index: 40;
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  background: rgba(59, 130, 246, 0.1);
  color: var(--accent-cyan);
}

.stat-card {
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-glow);
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  transition: var(--transition);
  cursor: pointer;
  border: none;
}

.empty-state-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--bg-navy-card);
  border: 1px dashed var(--border-subtle);
  border-radius: var(--radius-lg);
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  color: var(--text-muted);
  margin-bottom: 1.5rem;
}

.empty-state-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.empty-state-desc {
  color: var(--text-secondary);
  max-width: 400px;
  margin-bottom: 1.5rem;
}
`;

fs.writeFileSync(cssPath, css);
console.log('App.css updated successfully.');
