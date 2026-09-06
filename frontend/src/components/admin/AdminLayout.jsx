import React from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

const AdminLayout = ({ children }) => {
  const location = useLocation();

  const navItems = [
    { path: '/admin/dashboard', label: 'Platform Overview', icon: '📊' },
    { path: '/admin/sessions', label: 'Focus Sessions', icon: '⏱️' },
    { path: '/admin/analytics', label: 'Platform Analytics', icon: '📈' },
    { path: '/admin/distractions', label: 'Distraction Insights', icon: '⚡' },
    { path: '/admin/focus-blocks', label: 'Focus Blocks', icon: '🛡️' },
    { path: '/admin/recommendations', label: 'Recommendations', icon: '💡' },
    { path: '/admin/users', label: 'User Management', icon: '👥' },
  ];

  return (
    <div className="admin-container">
      <div className="admin-header-banner">
        <div className="admin-banner-left">
          <div className="admin-banner-badge">PLATFORM ADMIN CONSOLE</div>
          <h1 className="admin-banner-title">FlowState System Administration</h1>
          <p className="admin-banner-subtitle">
            Platform-wide visibility, system health monitoring, cross-practitioner session oversight, and access governance.
          </p>
        </div>
      </div>

      <nav className="admin-tab-nav" aria-label="Admin Sections">
        {navItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path === '/admin/dashboard' && (location.pathname === '/admin' || location.pathname === '/admin/'));
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`admin-tab-link ${isActive ? 'active' : ''}`}
            >
              <span className="admin-tab-icon">{item.icon}</span>
              <span className="admin-tab-text">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="admin-content-area">
        {children || <Outlet />}
      </div>
    </div>
  );
};

export default AdminLayout;
