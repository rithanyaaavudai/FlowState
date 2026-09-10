import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { login, register, clearAuthError } from '../../store/slices/authSlice';
import { User, Lock, Mail, ChevronRight, Activity, Zap } from 'lucide-react';

const Login = ({ initialRegister = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, token, loading, error } = useSelector(
    (state) => state.auth || {}
  );

  const [isRegistering, setIsRegistering] = useState(
    initialRegister || location.pathname === '/register'
  );

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regFullname, setRegFullname] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('PRACTITIONER');

  const [successMsg, setSuccessMsg] = useState('');

  const isFullNameValid = regFullname.trim() !== '' && /^[a-zA-Z\s]+$/.test(regFullname);
  const passwordReqs = {
    length: regPassword.length >= 8,
    uppercase: /[A-Z]/.test(regPassword),
    lowercase: /[a-z]/.test(regPassword),
    number: /\d/.test(regPassword),
    special: /[^A-Za-z0-9]/.test(regPassword),
  };
  const isPasswordValid = Object.values(passwordReqs).every(Boolean);
  const isFormValid = regUsername && regEmail && isFullNameValid && isPasswordValid && regRole;

  const storedToken =
    localStorage.getItem('flowstate_access_token') ||
    localStorage.getItem('token');
  const isAuth = isAuthenticated || !!token || !!user || !!storedToken;

  useEffect(() => {
    if (isAuth) {
      navigate('/', { replace: true });
    }
  }, [isAuth, navigate]);

  useEffect(() => {
    if (location.pathname === '/register') {
      setIsRegistering(true);
    } else if (location.pathname === '/login') {
      setIsRegistering(false);
    }
  }, [location.pathname]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(login({ username, password }));
    if (login.fulfilled.match(res)) {
      navigate('/', { replace: true });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    const res = await dispatch(
      register({
        username: regUsername,
        email: regEmail,
        fullName: regFullname,
        password: regPassword,
        role: regRole,
      })
    );
    if (register.fulfilled.match(res)) {
      setIsRegistering(false);
      setUsername(regUsername);
      setPassword('');
      setRegPassword('');
      setSuccessMsg('Registration successful! You can now log in.');
      navigate('/login', { replace: true });
    }
  };

  const toggleMode = () => {
    dispatch(clearAuthError());
    const nextMode = !isRegistering;
    setIsRegistering(nextMode);
    navigate(nextMode ? '/register' : '/login');
  };

  return (
    <div className="login-container">
      <div className="login-card modal-card">
        <div className="login-header">
          <div className="navbar-brand brand-badge">FlowState</div>
          <h2>{isRegistering ? 'Create an Account' : 'Sign In to FlowState'}</h2>
          <p className="login-subtitle">
            {isRegistering
              ? 'Join to optimize your deep work & focus habits'
              : 'Maximize your productivity & focus sessions'}
          </p>
        </div>

        {error && <div className="error-banner">{error}</div>}
        {successMsg && !isRegistering && (
          <div className="success-banner" style={{backgroundColor: '#d4edda', color: '#155724', padding: '10px', borderRadius: '4px', marginBottom: '15px'}}>
            {successMsg}
          </div>
        )}

        {!isRegistering ? (
          <form onSubmit={handleLoginSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn primary-btn submit-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>

            <div className="toggle-container">
              <button
                type="button"
                className="btn link-btn toggle-auth-btn"
                onClick={toggleMode}
              >
                Don't have an account? Register
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="register-form">
            <div className="form-group">
              <label htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                name="reg-username"
                type="text"
                placeholder="Enter your username"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                required
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                name="reg-email"
                type="email"
                placeholder="Enter your email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-fullname">Full Name</label>
              <input
                id="reg-fullname"
                name="reg-fullname"
                type="text"
                placeholder="Enter your full name"
                value={regFullname}
                onChange={(e) => setRegFullname(e.target.value)}
                required
              />
              {regFullname && !isFullNameValid && (
                <small className="error-text" style={{color: 'red', display: 'block', marginTop: '5px'}}>
                  Full name must contain only alphabetic characters and spaces.
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                name="reg-password"
                type="password"
                placeholder="Enter your password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
              {regPassword && (
                <div className="password-requirements" style={{fontSize: '0.85em', marginTop: '5px'}}>
                  <p style={{margin: '0', color: passwordReqs.length ? 'green' : 'red'}}>• At least 8 characters</p>
                  <p style={{margin: '0', color: passwordReqs.uppercase ? 'green' : 'red'}}>• One uppercase letter</p>
                  <p style={{margin: '0', color: passwordReqs.lowercase ? 'green' : 'red'}}>• One lowercase letter</p>
                  <p style={{margin: '0', color: passwordReqs.number ? 'green' : 'red'}}>• One number</p>
                  <p style={{margin: '0', color: passwordReqs.special ? 'green' : 'red'}}>• One special character</p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="reg-role">Role</label>
              <select
                id="reg-role"
                name="reg-role"
                value={regRole}
                onChange={(e) => setRegRole(e.target.value)}
                required
              >
                <option value="PRACTITIONER">PRACTITIONER</option>
                <option value="FLOW_COACH">FLOW_COACH</option>
                <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
              </select>
            </div>

            <button
              type="submit"
              className="btn primary-btn submit-btn"
              disabled={loading || !isFormValid}
            >
              {loading ? 'Registering...' : 'Register'}
            </button>

            <div className="toggle-container">
              <button
                type="button"
                className="btn link-btn toggle-auth-btn"
                onClick={toggleMode}
              >
                Already have an account? Login
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
