import React, { useState, useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { createTransaction } from '../../store/slices/transactionSlice';
import api from '../../services/api';

const TransactionForm = ({ onTransactionCreated }) => {
  const dispatch = useDispatch();

  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');
  const [referenceId, setReferenceId] = useState('');
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSuccessMessage('');
    setWarningMessage('');
    setErrorMessage('');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Validate missing accounts
    if (!source || !source.trim() || !target || !target.trim()) {
      setWarningMessage('Account not selected');
      return;
    }

    // Prepare payload containing amount, source, target
    const numericAmount = parseFloat(amount) || Number(amount) || 0;
    const payload = {
      amount: numericAmount,
      source: source.trim(),
      target: target.trim(),
    };

    setLoading(true);

    try {
      // Send transaction request using Axios
      const response = await api.post('/transactions', payload);
      const data = response.data;

      if (dispatch) {
        dispatch({
          type: 'transactions/createTransaction/fulfilled',
          payload: data || payload,
        });
      }

      setSuccessMessage('Transaction Logged Successfully');
      setAmount('');
      setSource('');
      setTarget('');
      setReferenceId('');

      // Auto dismiss after 3 seconds
      timerRef.current = setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      if (onTransactionCreated) {
        onTransactionCreated(data);
      }
    } catch (err) {
      if (err.response && err.response.status === 500) {
        setErrorMessage('Unable to process transaction. Please try again.');
      } else {
        const msg =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Unable to process transaction. Please try again.';
        setErrorMessage(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card form-card transaction-form-card">
      <div className="card-header">
        <h3>Post New Transaction</h3>
        <p className="card-subtitle">
          Double-entry ledger debit & credit instruction
        </p>
      </div>

      {successMessage && (
        <div
          data-testid="success-alert"
          className="alert success-alert"
          role="alert"
        >
          {successMessage}
        </div>
      )}

      {warningMessage && (
        <div
          data-testid="warning-alert"
          className="alert warning-alert"
          role="alert"
        >
          {warningMessage}
        </div>
      )}

      {errorMessage && (
        <div
          data-testid="error-alert"
          className="alert error-alert"
          role="alert"
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            borderColor: '#ef4444',
            color: '#fca5a5',
          }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="transaction-form">
        <div className="form-group">
          <label htmlFor="transaction-amount">Transaction Amount</label>
          <input
            id="transaction-amount"
            type="number"
            step="0.01"
            placeholder="Transaction Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="source-account">Source Account Reference</label>
            <input
              id="source-account"
              type="text"
              placeholder="Source Account Reference"
              value={source}
              onChange={(e) => setSource(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="target-account">Target Account Reference</label>
            <input
              id="target-account"
              type="text"
              placeholder="Target Account Reference"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="system-reference">System Reference ID</label>
          <input
            id="system-reference"
            type="text"
            placeholder="e.g. TRX-2026-ARC-00441"
            value={referenceId}
            onChange={(e) => setReferenceId(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="primary-btn submit-btn"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Transaction'}
        </button>
      </form>
    </div>
  );
};

export default TransactionForm;
