import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const Navbar = ({ onOpenApproval }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { role: reduxRole, user, isAuthenticated } = useSelector(
    (state) => state.auth || {}
  );

  const role =
    reduxRole ||
    user?.role ||
    localStorage.getItem('role') ||
    localStorage.getItem('flowstate_role') ||
    '';

  const isTreasurer =
    typeof role === 'string' && role.toUpperCase() === 'TREASURER';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('jwt');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('organizationId');
    localStorage.removeItem('flowstate_access_token');
    localStorage.removeItem('flowstate_refresh_token');
    localStorage.removeItem('flowstate_user_id');
    localStorage.removeItem('flowstate_username');
    localStorage.removeItem('flowstate_full_name');
    localStorage.removeItem('flowstate_role');

    dispatch(logout());
    navigate('/login');
  };

  const handleApproveClick = () => {
    if (onOpenApproval) {
      onOpenApproval();
    } else {
      navigate('/transactions');
    }
  };

  return (
    <nav className="navbar" role="navigation">
      <div className="nav-brand">
        <NavLink to="/transactions" className="brand-link">
          <span className="brand-logo-icon">◈</span>
          <span className="brand-title">VaultFlow ORCHESTRATOR</span>
        </NavLink>
      </div>

      <div className="nav-links">
        <NavLink
          to="/transactions"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          Transactions
        </NavLink>
        <NavLink
          to="/ledgers"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          Ledgers
        </NavLink>
        <NavLink
          to="/accounts"
          className={({ isActive }) =>
            isActive ? 'nav-link active' : 'nav-link'
          }
        >
          Accounts
        </NavLink>

        {isTreasurer && (
          <button
            type="button"
            className="action-btn approve-nav-btn"
            onClick={handleApproveClick}
          >
            Approve Transaction
          </button>
        )}
      </div>

      <div className="nav-user-controls">
        {role && (
          <span className={`role-badge ${role.toLowerCase()}`}>
            {role}
          </span>
        )}
        {(isAuthenticated || role || localStorage.getItem('token') || localStorage.getItem('flowstate_access_token')) && (
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
