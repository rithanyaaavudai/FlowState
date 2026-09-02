import React from 'react';
import { Link, useNavigate, useInRouterContext } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const SafeLink = ({ to, children, ...props }) => {
  const inRouter = useInRouterContext();
  if (inRouter) {
    return <Link to={to} {...props}>{children}</Link>;
  }
  return <a href={to} {...props}>{children}</a>;
};

const Navbar = () => {
  const dispatch = useDispatch();
  const inRouter = useInRouterContext();
  
  let navigate = () => {};
  if (inRouter) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    navigate = useNavigate();
  }

  const { user, token, fullName } = useSelector((state) => state.auth || {});

  if (!user && !token) {
    return null;
  }

  const role = user?.role || localStorage.getItem('flowstate_role') || '';
  const displayName =
    fullName ||
    user?.fullName ||
    user?.name ||
    user?.username ||
    localStorage.getItem('flowstate_full_name') ||
    'User';

  const handleLogout = () => {
    localStorage.removeItem('flowstate_access_token');
    localStorage.removeItem('flowstate_refresh_token');
    localStorage.removeItem('flowstate_user_id');
    localStorage.removeItem('flowstate_username');
    localStorage.removeItem('flowstate_full_name');
    localStorage.removeItem('flowstate_role');

    dispatch(logout());
    if (inRouter && navigate) {
      navigate('/login');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <SafeLink to="/">FlowState</SafeLink>
        </div>

        <ul className="navbar-links">
          {role === 'PRACTITIONER' && (
            <>
              <li>
                <SafeLink to="/sessions">Sessions</SafeLink>
              </li>
              <li>
                <SafeLink to="/focus-blocks">Focus Blocks</SafeLink>
              </li>
            </>
          )}

          {(role === 'FLOW_COACH' || role === 'PLATFORM_ADMIN') && (
            <li>
              <SafeLink to="/sessions">All Sessions</SafeLink>
            </li>
          )}

          {role === 'FLOW_COACH' && (
            <li>
              <SafeLink to="/recommendations">Recommendations</SafeLink>
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
