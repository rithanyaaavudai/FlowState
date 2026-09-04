import React, { useState, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { createLedger } from '../../store/slices/ledgerSlice';
import ledgerService from '../../services/ledgerService';

const LedgerForm = ({ ledger, onSaved }) => {
  const dispatch = useDispatch();
  const descriptionInputRef = useRef(null);

  const [ledgerName, setLedgerName] = useState(ledger?.name || '');
  const [description, setDescription] = useState(ledger?.description || '');
  const [currency, setCurrency] = useState(ledger?.currency || 'USD');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleEditClick = () => {
    if (descriptionInputRef.current) {
      descriptionInputRef.current.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setIsError(false);

    const payload = {
      name: ledgerName,
      description,
      currency,
    };

    try {
      if (dispatch) {
        await dispatch(createLedger(payload)).unwrap();
      } else {
        await ledgerService.createLedger(payload);
      }
      setMessage('Ledger saved successfully');
      setLedgerName('');
      setDescription('');
      if (onSaved) onSaved();
    } catch (err) {
      setIsError(true);
      setMessage(err.message || 'Failed to save ledger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-card ledger-form-card">
      <div className="card-header">
        <div className="header-actions-row">
          <div>
            <h3>Ledger Configuration</h3>
            <p className="card-subtitle">
              Maintain immutable double-entry ledger structures
            </p>
          </div>
          <button
            type="button"
            className="secondary-btn edit-ledger-btn"
            onClick={handleEditClick}
          >
            Edit Ledger
          </button>
        </div>
      </div>

      {message && (
        <div
          className={`alert ${isError ? 'error-alert' : 'success-alert'}`}
          role="alert"
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="ledger-form">
        <div className="form-group">
          <label htmlFor="ledger-name">Ledger Name</label>
          <input
            id="ledger-name"
            type="text"
            placeholder="Ledger Name"
            value={ledgerName}
            onChange={(e) => setLedgerName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="ledger-description">Ledger Description</label>
          <input
            id="ledger-description"
            ref={descriptionInputRef}
            type="text"
            placeholder="Ledger Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="ledger-currency">Base Currency</label>
          <select
            id="ledger-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
            <option value="SGD">SGD (S$)</option>
            <option value="JPY">JPY (¥)</option>
          </select>
        </div>

        <button
          type="submit"
          className="primary-btn submit-btn"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Ledger'}
        </button>
      </form>
    </div>
  );
};

export default LedgerForm;
