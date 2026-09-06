import React, { useState, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import userService from '../../services/userService';
import EmptyState from '../common/EmptyState';
import AdminLayout from './AdminLayout';

const UserManagement = () => {
  const { user } = useSelector((state) => state.auth || {});
  const role = user?.role || localStorage.getItem('flowstate_role') || '';
  const isPlatformAdmin = role === 'PLATFORM_ADMIN';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Create User modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('PRACTITIONER');
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isPlatformAdmin) {
      loadUsers();
    }
  }, [isPlatformAdmin, loadUsers]);

  const handleRoleChange = async (userId, targetRole) => {
    try {
      await userService.updateUserRole(userId, targetRole);
      setSuccessMessage('User role updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await userService.toggleUserStatus(userId);
      setSuccessMessage('User status updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await userService.deleteUser(userId);
      setSuccessMessage('User deleted successfully.');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to delete user');
    }
  };

  const handleCreateUserSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSubmitting(true);
    try {
      await userService.createUser({
        username: newUsername,
        email: newEmail,
        fullName: newFullName,
        password: newPassword,
        role: newRole,
      });
      setSuccessMessage('User created successfully.');
      setIsModalOpen(false);
      setNewUsername('');
      setNewEmail('');
      setNewFullName('');
      setNewPassword('');
      setNewRole('PRACTITIONER');
      setTimeout(() => setSuccessMessage(''), 3000);
      loadUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (!isPlatformAdmin) {
    return (
      <div className="page-container">
        <div className="alert error">
          <span>Access Denied: You must be a PLATFORM_ADMIN to view this page.</span>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-page user-management-page">
        <div className="page-header">
        <div>
          <h2>User & RBAC Management</h2>
          <p className="login-subtitle">Manage user roles, platform access, and active accounts</p>
        </div>
        <button className="btn primary-btn" onClick={() => setIsModalOpen(true)}>
          + Create User
        </button>
      </div>

      {successMessage && <div className="alert success">{successMessage}</div>}
      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <div className="loading-spinner">Loading platform users...</div>
      ) : users.length === 0 ? (
        <EmptyState message="No users found" />
      ) : (
        <div className="table-responsive">
          <table className="sessions-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => {
                const isSelf = u.id === (user?.id || user?.userId);
                return (
                  <tr key={u.id}>
                    <td className="session-title">{u.username}</td>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="role-select"
                        style={{
                          background: 'var(--bg-navy-input)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.85rem',
                        }}
                      >
                        <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
                        <option value="FLOW_COACH">FLOW_COACH</option>
                        <option value="PRACTITIONER">PRACTITIONER</option>
                      </select>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          u.isActive ? 'status-completed' : 'status-abandoned'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {!isSelf && (
                        <>
                          <button
                            type="button"
                            className="btn action-btn edit-btn"
                            onClick={() => handleToggleStatus(u.id)}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            className="btn action-btn delete-btn"
                            onClick={() => handleDeleteUser(u.id)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create Platform User</h3>
              <button
                type="button"
                className="close-btn"
                onClick={() => setIsModalOpen(false)}
              >
                &times;
              </button>
            </div>

            {formError && <div className="error-banner">{formError}</div>}

            <form onSubmit={handleCreateUserSubmit}>
              <div className="form-group">
                <label htmlFor="new-username">Username</label>
                <input
                  id="new-username"
                  type="text"
                  placeholder="Enter username"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-email">Email</label>
                <input
                  id="new-email"
                  type="email"
                  placeholder="Enter email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-fullname">Full Name</label>
                <input
                  id="new-fullname"
                  type="text"
                  placeholder="Enter full name"
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-password">Password</label>
                <input
                  id="new-password"
                  type="password"
                  placeholder="Enter temporary password (min 8 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="new-role">Role</label>
                <select
                  id="new-role"
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  required
                >
                  <option value="PLATFORM_ADMIN">PLATFORM_ADMIN</option>
                  <option value="FLOW_COACH">FLOW_COACH</option>
                  <option value="PRACTITIONER">PRACTITIONER</option>
                </select>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary-btn"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn primary-btn"
                  disabled={formSubmitting}
                >
                  {formSubmitting ? 'Creating...' : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
