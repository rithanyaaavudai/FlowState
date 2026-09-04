import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import api from '../../services/api';
import { approveTransaction } from '../../store/slices/transactionSlice';

const TransactionApproval = ({ transaction, onApproved }) => {
  const dispatch = useDispatch();
  const { role: reduxRole, user } = useSelector((state) => state.auth || {});

  const currentRole =
    reduxRole ||
    user?.role ||
    localStorage.getItem('role') ||
    localStorage.getItem('flowstate_role') ||
    '';

  const isTreasurer =
    typeof currentRole === 'string' &&
    currentRole.toUpperCase() === 'TREASURER';

  const [inputTxId, setInputTxId] = useState(
    transaction?.id || transaction?.transactionId || ''
  );
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const txIdToApprove =
    transaction?.id || transaction?.transactionId || inputTxId;

  const handleApprove = async () => {
    if (!isTreasurer) {
      setIsError(true);
      setStatusMessage('Access Denied: Only TREASURER role can approve transactions.');
      return;
    }

    if (!txIdToApprove) {
      setIsError(true);
      setStatusMessage('Please specify a Transaction ID to approve.');
      return;
    }

    setLoading(true);
    setStatusMessage('');
    setIsError(false);

    try {
      // Send Axios PUT request with transaction ID and { status: "APPROVED" }
      const response = await api.put(`/transactions/${txIdToApprove}`, {
        status: 'APPROVED',
      });

      if (dispatch) {
        dispatch(approveTransaction(txIdToApprove));
      }

      setIsError(false);
      setStatusMessage(`Transaction ${txIdToApprove} Approved Successfully.`);
      if (onApproved) {
        onApproved(response.data || { id: txIdToApprove, status: 'APPROVED' });
      }
    } catch (err) {
      setIsError(true);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Failed to approve transaction.';
      setStatusMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!isTreasurer) {
    return (
      <div className="card approval-card unauthorized-card">
        <div className="card-header">
          <h3>Transaction Approval</h3>
        </div>
        <div className="alert warning-alert" role="alert">
          Approval actions are restricted to the <strong>TREASURER</strong> role. Current role: {currentRole || 'Guest'}.
        </div>
      </div>
    );
  }

  return (
    <div className="card approval-card">
      <div className="card-header">
        <h3>Transaction Approval</h3>
        <p className="card-subtitle">
          Execute treasurer sign-off for pending ledger entries
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

      <div className="approval-content">
        {!transaction && (
          <div className="form-group">
            <label htmlFor="tx-id-input">Transaction ID</label>
            <input
              id="tx-id-input"
              type="text"
              placeholder="e.g. 101 or TRX-001"
              value={inputTxId}
              onChange={(e) => setInputTxId(e.target.value)}
            />
          </div>
        )}

        {transaction && (
          <div className="transaction-summary-box">
            <p>
              <strong>ID:</strong> {transaction.id}
            </p>
            <p>
              <strong>Reference:</strong>{' '}
              {transaction.reference || transaction.referenceId || 'N/A'}
            </p>
            <p>
              <strong>Amount:</strong> ${transaction.amount}
            </p>
            <p>
              <strong>Current Status:</strong> {transaction.status || 'PENDING'}
            </p>
          </div>
        )}

        <button
          type="button"
          className="primary-btn approve-btn"
          disabled={loading || !txIdToApprove}
          onClick={handleApprove}
        >
          {loading ? 'Approving...' : 'Approve'}
        </button>
      </div>
    </div>
  );
};

export default TransactionApproval;
