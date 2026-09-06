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

  // Delete User Confirmation Modal state
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState('');
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteModalError, setDeleteModalError] = useState('');

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
      setTimeout(() => setSuccessMessage(''), 3500);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update role');
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await userService.toggleUserStatus(userId);
      setSuccessMessage('User status updated successfully.');
      setTimeout(() => setSuccessMessage(''), 3500);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to update status');
    }
  };

  const openDeleteModal = (targetUser) => {
    setUserToDelete(targetUser);
    setDeleteConfirmationInput('');
    setDeleteModalError('');
  };

  const closeDeleteModal = () => {
    setUserToDelete(null);
    setDeleteConfirmationInput('');
    setDeleteModalError('');
    setDeleteSubmitting(false);
  };

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (!userToDelete) return;
    if (deleteConfirmationInput.trim().toUpperCase() !== 'DELETE') {
      setDeleteModalError('Please type DELETE to confirm permanent deletion.');
      return;
    }

    setDeleteSubmitting(true);
    setDeleteModalError('');
    try {
      await userService.deleteUser(userToDelete.id);
      setSuccessMessage(`User "${userToDelete.username}" deleted successfully.`);
      closeDeleteModal();
      setTimeout(() => setSuccessMessage(''), 3500);
      loadUsers();
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message || 'Failed to delete user';
      setDeleteModalError(errMsg);
    } finally {
      setDeleteSubmitting(false);
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
      setTimeout(() => setSuccessMessage(''), 3500);
      loadUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || err.message || 'Failed to create user');
    } finally {
      setFormSubmitting(false);
    }
  };

  const currentUserId = user?.id || user?.userId || localStorage.getItem('flowstate_userId');

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
      {error && (
        <div className="alert error" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError(null)}
            style={{ background: 'transparent', border: 'none', color: 'inherit', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            &times;
          </button>
        </div>
      )}

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
                const isSelf = currentUserId && String(u.id) === String(currentUserId);
                return (
                  <tr key={u.id}>
                    <td className="session-title">
                      {u.username}
                      {isSelf && (
                        <span
                          style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.75rem',
                            padding: '0.15rem 0.4rem',
                            borderRadius: '4px',
                            background: 'rgba(59, 130, 246, 0.2)',
                            color: '#60a5fa',
                            fontWeight: 'normal',
                          }}
                        >
                          You
                        </span>
                      )}
                    </td>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>
                      <select
                        value={u.role}
                        disabled={isSelf}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="role-select"
                        style={{
                          background: 'var(--bg-navy-input)',
                          color: 'var(--text-primary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0.25rem 0.5rem',
                          fontSize: '0.85rem',
                          opacity: isSelf ? 0.6 : 1,
                          cursor: isSelf ? 'not-allowed' : 'pointer',
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
                      {isSelf ? (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                          Current User
                        </span>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="btn action-btn edit-btn"
                            onClick={() => handleToggleStatus(u.id)}
                            title={u.isActive ? 'Deactivate this account' : 'Activate this account'}
                          >
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            className="btn action-btn delete-btn"
                            onClick={() => openDeleteModal(u)}
                            title="Permanently delete user"
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

      {userToDelete && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3 style={{ color: '#ef4444' }}>Permanent Deletion</h3>
              <button
                type="button"
                className="close-btn"
                onClick={closeDeleteModal}
                disabled={deleteSubmitting}
              >
                &times;
              </button>
            </div>

            {deleteModalError && <div className="error-banner">{deleteModalError}</div>}

            <div style={{ padding: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.5' }}>
              <p>
                You are about to permanently delete account <strong>{userToDelete.username}</strong> ({userToDelete.email}).
              </p>
              <div
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  borderLeft: '3px solid #ef4444',
                  padding: '0.75rem',
                  borderRadius: '4px',
                  margin: '1rem 0',
                  color: 'var(--text-primary)',
                  fontSize: '0.85rem',
                }}
              >
                <strong>Important Policy:</strong> Users with historical focus sessions cannot be deleted to preserve platform telemetry and audit logs. If deletion fails, please use <strong>Deactivate</strong> instead.
              </div>
              <p>
                To confirm permanent deletion, please type <strong>DELETE</strong> below:
              </p>
            </div>

            <form onSubmit={handleConfirmDelete}>
              <div className="form-group">
                <input
                  type="text"
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirmationInput}
                  onChange={(e) => setDeleteConfirmationInput(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn secondary-btn"
                  onClick={closeDeleteModal}
                  disabled={deleteSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn action-btn delete-btn"
                  disabled={deleteSubmitting || deleteConfirmationInput.trim().toUpperCase() !== 'DELETE'}
                  style={{
                    opacity: deleteConfirmationInput.trim().toUpperCase() === 'DELETE' ? 1 : 0.5,
                    cursor: deleteConfirmationInput.trim().toUpperCase() === 'DELETE' ? 'pointer' : 'not-allowed',
                  }}
                >
                  {deleteSubmitting ? 'Deleting...' : 'Delete Permanently'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default UserManagement;
