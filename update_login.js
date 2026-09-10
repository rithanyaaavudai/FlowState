const fs = require('fs');
const path = require('path');

const loginPath = path.join(__dirname, 'frontend/src/components/layout/Login.jsx');
let content = fs.readFileSync(loginPath, 'utf8');

// Replace imports
content = content.replace(
  "import { login, register, clearAuthError } from '../../store/slices/authSlice';",
  "import { login, register, clearAuthError } from '../../store/slices/authSlice';\nimport { User, Lock, Mail, ChevronRight, Activity, Zap } from 'lucide-react';"
);

// Replace return block
const newReturn = `  return (
    <div className="login-container">
      <div className="login-split-left">
        <div className="login-brand-art">
          <Activity size={80} color="var(--accent-cyan)" style={{ marginBottom: '1.5rem', opacity: 0.8 }} />
          <h1>FlowState</h1>
          <p>Optimize your deep work, track your focus, and achieve peak productivity.</p>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, rgba(59,130,246,0.1) 0%, transparent 60%)', pointerEvents: 'none' }}></div>
      </div>
      
      <div className="login-split-right">
        <div className="login-card">
          <div className="login-header" style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              {isRegistering ? 'Create an Account' : 'Welcome Back'}
            </h2>
            <p className="login-subtitle" style={{ color: 'var(--text-secondary)' }}>
              {isRegistering
                ? 'Join to optimize your deep work & focus habits'
                : 'Sign in to continue to your dashboard'}
            </p>
          </div>

          {error && <div className="error-banner" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Zap size={18} /> {error}</div>}
          {successMsg && !isRegistering && (
            <div className="success-banner" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-text)', padding: '12px', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', border: '1px solid var(--success-border)' }}>
              {successMsg}
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLoginSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={18} />
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
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn primary-btn submit-btn"
                disabled={loading}
                style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
              >
                {loading ? 'Authenticating...' : 'Sign In'}
                <ChevronRight size={18} />
              </button>

              <div className="toggle-container" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn link-btn toggle-auth-btn"
                  onClick={toggleMode}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Don't have an account? <span style={{ color: 'var(--accent-cyan)' }}>Register here</span>
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="register-form">
              <div className="form-group">
                <label htmlFor="reg-username">Username</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={18} />
                  <input
                    id="reg-username"
                    name="reg-username"
                    type="text"
                    placeholder="Choose a username"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Email</label>
                <div className="input-with-icon">
                  <Mail className="input-icon" size={18} />
                  <input
                    id="reg-email"
                    name="reg-email"
                    type="email"
                    placeholder="name@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="reg-fullname">Full Name</label>
                <input
                  id="reg-fullname"
                  name="reg-fullname"
                  type="text"
                  placeholder="John Doe"
                  value={regFullname}
                  onChange={(e) => setRegFullname(e.target.value)}
                  required
                />
                {regFullname && !isFullNameValid && (
                  <small className="error-text" style={{color: 'var(--error-text)', display: 'block', marginTop: '5px'}}>
                    Must contain only alphabetic characters and spaces.
                  </small>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    id="reg-password"
                    name="reg-password"
                    type="password"
                    placeholder="Create a strong password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                  />
                </div>
                {regPassword && (
                  <div className="password-requirements" style={{fontSize: '0.8rem', marginTop: '8px', padding: '8px', background: 'var(--bg-navy-input)', borderRadius: 'var(--radius-sm)'}}>
                    <div style={{ color: passwordReqs.length ? 'var(--success-text)' : 'var(--text-muted)' }}>• At least 8 characters</div>
                    <div style={{ color: passwordReqs.uppercase ? 'var(--success-text)' : 'var(--text-muted)' }}>• One uppercase letter</div>
                    <div style={{ color: passwordReqs.lowercase ? 'var(--success-text)' : 'var(--text-muted)' }}>• One lowercase letter</div>
                    <div style={{ color: passwordReqs.number ? 'var(--success-text)' : 'var(--text-muted)' }}>• One number</div>
                    <div style={{ color: passwordReqs.special ? 'var(--success-text)' : 'var(--text-muted)' }}>• One special character</div>
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
                  <option value="PRACTITIONER">Practitioner</option>
                  <option value="FLOW_COACH">Flow Coach</option>
                  <option value="PLATFORM_ADMIN">Platform Admin</option>
                </select>
              </div>

              <button
                type="submit"
                className="btn primary-btn submit-btn"
                disabled={loading || !isFormValid}
                style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}
              >
                {loading ? 'Creating account...' : 'Create Account'}
                <ChevronRight size={18} />
              </button>

              <div className="toggle-container" style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                <button
                  type="button"
                  className="btn link-btn toggle-auth-btn"
                  onClick={toggleMode}
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Already have an account? <span style={{ color: 'var(--accent-cyan)' }}>Sign In</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;`;

// Replace the return
content = content.replace(/return \([\s\S]*?\n\};\n\nexport default Login;/g, newReturn);

fs.writeFileSync(loginPath, content);
console.log('Login.jsx updated successfully.');
