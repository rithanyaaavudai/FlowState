import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createAccount } from '../../store/slices/accountSlice';
import accountService from '../../services/accountService';

const ACCOUNT_TYPES = [
  'SAVINGS',
  'CHECKING',
  'INVESTMENT',
  'PAYROLL',
  'LOAN',
];

const AccountForm = ({ onAccountCreated }) => {
  const dispatch = useDispatch();
  const [accountName, setAccountName] = useState('');
  const [accountType, setAccountType] = useState('SAVINGS');
  const [interestRate, setInterestRate] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountName.trim()) {
      setIsError(true);
      setStatusMessage('Account Name is required');
      return;
    }

    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    const payload = {
      name: accountName.trim(),
      accountName: accountName.trim(),
      type: accountType,
      accountType: accountType,
      ...(accountType === 'SAVINGS' && interestRate !== ''
        ? { interestRate: parseFloat(interestRate) || 0 }
        : {}),
    };

    try {
      if (dispatch) {
        await dispatch(createAccount(payload)).unwrap();
      } else {
        await accountService.createAccount(payload);
      }
      setIsError(false);
      setStatusMessage('Account Created Successfully');
      setAccountName('');
      setInterestRate('');
      if (onAccountCreated) {
        onAccountCreated();
      }
    } catch (err) {
      setIsError(true);
      const msg =
        err.message ||
        (typeof err === 'string' ? err : 'Failed to create account');
      setStatusMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-card account-form-card">
      <div className="card-header">
        <h3>Create New Account</h3>
        <p className="card-subtitle">
          Configure ledger accounts for routing & custody
        </p>
      </div>

      {statusMessage && (
        <div
          className={`alert ${isError ? 'error-alert' : 'success-alert'}`}
          role="alert"
        >
          {statusMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="account-form">
        <div className="form-group">
          <label htmlFor="account-name">Account Name</label>
          <input
            id="account-name"
            type="text"
            placeholder="Account Name"
            value={accountName}
            onChange={(e) => setAccountName(e.target.value)}
            required
          />
        </div>

        <div className="preview-container">
          <span className="preview-label">Live Preview:</span>
          <div
            data-testid="account-name-preview"
            className="account-preview-box"
          >
            {accountName || 'No name specified'}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="account-type">Account Type</label>
          <select
            id="account-type"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
          >
            {ACCOUNT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {accountType === 'SAVINGS' && (
          <div className="form-group">
            <label htmlFor="interest-rate">Interest Rate</label>
            <input
              id="interest-rate"
              type="number"
              step="0.01"
              placeholder="Interest Rate"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
            />
          </div>
        )}

        <button
          type="submit"
          className="primary-btn submit-btn"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Account'}
        </button>
      </form>
    </div>
  );
};

export default AccountForm;
