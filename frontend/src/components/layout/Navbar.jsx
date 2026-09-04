import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

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
  const isAdmin = role === 'PLATFORM_ADMIN';

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
    <nav className="navbar" role="navigation">
      <div className="navbar-brand">
        <Link to="/">FlowState</Link>
      </div>

      <div className="nav-links">
        {isPractitioner && (
          <>
            <NavLink
              to="/sessions"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Sessions
            </NavLink>
            <NavLink
              to="/blocks"
              className={({ isActive }) =>
                isActive ? 'nav-link active' : 'nav-link'
              }
            >
              Focus Blocks
            </NavLink>
          </>
        )}

        {(isCoach || isAdmin) && (
          <NavLink
            to="/sessions"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            All Sessions
          </NavLink>
        )}

        {isCoach && (
          <NavLink
            to="/recommendations"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
          >
            Recommendations
          </NavLink>
        )}
      </div>

      <div className="nav-user-controls">
        <span className="user-greeting">Welcome back, {displayName}!</span>
        <button
          type="button"
          className="btn logout-btn"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
