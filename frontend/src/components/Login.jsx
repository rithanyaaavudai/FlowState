import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import { loginSuccess } from '../store/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { error: reduxError } = useSelector((state) => state.auth || {});

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const data = await authService.login({
        email,
        password,
        username: email,
      });

      const token =
        data.token || data.jwt || data.accessToken || data.bearerToken;
      const role = data.role || (data.user && data.user.role) || 'AUDITOR';
      const userId =
        data.userId ||
        (data.user && data.user.userId) ||
        (data.user && data.user.id) ||
        data.id ||
        '1';
      const organizationId =
        data.organizationId ||
        (data.user && data.user.organizationId) ||
        'ORG-001';
      const fullName =
        data.fullName || (data.user && data.user.fullName) || '';

      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('jwt', token);
        localStorage.setItem('flowstate_access_token', token);
      }
      if (role) {
        localStorage.setItem('role', role);
        localStorage.setItem('flowstate_role', role);
      }
      if (userId) {
        localStorage.setItem('userId', String(userId));
        localStorage.setItem('flowstate_user_id', String(userId));
      }
      if (organizationId) {
        localStorage.setItem('organizationId', String(organizationId));
      }
      if (fullName) {
        localStorage.setItem('flowstate_full_name', fullName);
      }

      dispatch(
        loginSuccess({
          token,
          jwt: token,
          accessToken: token,
          role,
          userId,
          organizationId,
          fullName,
          user: {
            token,
            role,
            userId,
            organizationId,
            fullName,
            ...(data.user || {}),
          },
          ...data,
        })
      );

      navigate('/transactions');
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Invalid credentials. Please try again.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="brand-badge">VaultFlow</div>
          <h2>Sign In to Orchestrator</h2>
          <p className="login-subtitle">
            Secure Ledger & Transaction Management
          </p>
        </div>

        {(errorMessage || reduxError) && (
          <div className="alert error-alert" role="alert">
            {errorMessage || reduxError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="Enter your username / Email (e.g. auditor@vaultflow.io)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password / Enter your secure account password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="primary-btn submit-btn"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
