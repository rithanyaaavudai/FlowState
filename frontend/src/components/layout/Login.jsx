import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { login, register, clearAuthError } from '../../store/slices/authSlice';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [regData, setRegData] = useState({
    username: '',
    email: '',
    fullName: '',
    password: '',
    role: 'PRACTITIONER',
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { user, token, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user || token) {
      navigate('/');
    }
  }, [user, token, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    dispatch(login(loginData));
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    dispatch(register(regData));
  };

  const toggleMode = () => {
    dispatch(clearAuthError());
    setIsRegistering(!isRegistering);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isRegistering ? 'Create an Account' : 'Welcome to FlowState'}</h2>

        {error && <div className="error-banner">{error}</div>}

        {!isRegistering ? (
          <form onSubmit={handleLoginSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn primary-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="toggle-auth">
              <span>Don't have an account? </span>
              <button type="button" className="link-btn" onClick={toggleMode}>
                Register
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="reg-username">Username</label>
              <input
                type="text"
                id="reg-username"
                name="username"
                value={regData.username}
                onChange={(e) => setRegData({ ...regData, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                type="email"
                id="reg-email"
                name="email"
                value={regData.email}
                onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-fullname">Full Name</label>
              <input
                type="text"
                id="reg-fullname"
                name="fullName"
                value={regData.fullName}
                onChange={(e) => setRegData({ ...regData, fullName: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input
                type="password"
                id="reg-password"
                name="password"
                value={regData.password}
                onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-role">Role</label>
              <select
                id="reg-role"
                name="role"
                value={regData.role}
                onChange={(e) => setRegData({ ...regData, role: e.target.value })}
                required
              >
                <option value="PRACTITIONER">PRACTITIONER</option>
                <option value="FLOW_COACH">FLOW_COACH</option>
              </select>
            </div>

            <button type="submit" className="btn primary-btn" disabled={loading}>
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="toggle-auth">
              <span>Already have an account? </span>
              <button type="button" className="link-btn" onClick={toggleMode}>
                Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
