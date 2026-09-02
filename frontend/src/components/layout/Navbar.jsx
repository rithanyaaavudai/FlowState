import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, fullName } = useSelector((state) => state.auth);

  if (!user && !token) {
    return null;
  }

  const role = user?.role || localStorage.getItem('flowstate_role') || '';
  const displayName = fullName || user?.fullName || user?.username || localStorage.getItem('flowstate_full_name') || 'User';

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
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/">FlowState</Link>
        </div>

        <ul className="navbar-links">
          {role === 'PRACTITIONER' && (
            <>
              <li>
                <Link to="/sessions">Sessions</Link>
              </li>
              <li>
                <Link to="/focus-blocks">Focus Blocks</Link>
              </li>
            </>
          )}

          {(role === 'FLOW_COACH' || role === 'PLATFORM_ADMIN') && (
            <li>
              <Link to="/sessions">All Sessions</Link>
            </li>
          )}

          {role === 'FLOW_COACH' && (
            <li>
              <Link to="/recommendations">Recommendations</Link>
            </li>
          )}
        </ul>

        <div className="navbar-user">
          <span className="user-greeting">Welcome back, {displayName}!</span>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
