import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { Activity, LayoutDashboard, Calendar, Clock, List, Users, ShieldAlert, BarChart3, LogOut, Settings } from 'lucide-react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, fullName, username, role: reduxRole, isAuthenticated } = useSelector(
    (state) => state.auth || {}
  );

  const storedToken =
    localStorage.getItem('flowstate_access_token') ||
    localStorage.getItem('token');
  const isAuth = isAuthenticated || !!token || !!user || !!storedToken;

  if (!isAuth) {
    return null;
  }

  const role =
    reduxRole ||
    user?.role ||
    localStorage.getItem('flowstate_role') ||
    '';

  const isPractitioner = role === 'PRACTITIONER';
  const isCoach = role === 'FLOW_COACH';
  const isPlatformAdmin = role === 'PLATFORM_ADMIN';

  const displayName =
    fullName ||
    user?.fullName ||
    user?.name ||
    username ||
    user?.username ||
    localStorage.getItem('flowstate_full_name') ||
    localStorage.getItem('flowstate_username') ||
    'User';

  const handleLogout = () => {
    localStorage.removeItem('flowstate_access_token');
    localStorage.removeItem('flowstate_refresh_token');
    localStorage.removeItem('flowstate_user_id');
    localStorage.removeItem('flowstate_username');
    localStorage.removeItem('flowstate_full_name');
    localStorage.removeItem('flowstate_role');

    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="navbar app-header" role="navigation">
      <div className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Activity color="var(--accent-cyan)" size={24} />
        <Link to="/" style={{ fontSize: '1.25rem', fontWeight: 800 }}>FlowState</Link>
      </div>

      <div className="nav-links">
        {isPractitioner && (
          <>
            <NavLink
              to="/sessions"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            ><Clock size={16} /> Sessions</NavLink>
            <NavLink
              to="/blocks"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            ><Calendar size={16} /> Focus Blocks</NavLink>
          </>
        )}

        {isCoach && (
          <>
            <NavLink
              to="/sessions"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            ><List size={16} /> All Sessions</NavLink>
            <NavLink
              to="/recommendations"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            ><Activity size={16} /> Recommendations</NavLink>
          </>
        )}

        {isPlatformAdmin && (
          <>
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            ><ShieldAlert size={16} /> Admin Console</NavLink>
            <NavLink
              to="/admin/sessions"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            ><List size={16} /> All Sessions</NavLink>
            <NavLink
              to="/admin/analytics"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            ><BarChart3 size={16} /> Analytics</NavLink>
            <NavLink
              to="/admin/distractions"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            ><Settings size={16} /> Distractions</NavLink>
            <NavLink
              to="/admin/focus-blocks"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            ><Calendar size={16} /> Focus Blocks</NavLink>
            <NavLink
              to="/admin/recommendations"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            ><Activity size={16} /> Recommendations</NavLink>
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            ><Users size={16} /> Users</NavLink>
          </>
        )}
      </div>

      <div className="nav-user-controls">
        <span className="user-greeting">
          Welcome, <strong>{displayName}</strong>
          {isPlatformAdmin && <span className="admin-role-badge">ADMIN</span>}
          {isCoach && <span className="coach-role-badge">COACH</span>}
        </span>
        <button type="button" className="btn logout-btn" onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
