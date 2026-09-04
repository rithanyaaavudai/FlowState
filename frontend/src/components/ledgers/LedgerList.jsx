import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ledgerService from '../../services/ledgerService';
import { setSelectedLedger } from '../../store/slices/ledgerSlice';
import { logout } from '../../store/slices/authSlice';

const LedgerList = () => {
  const dispatch = useDispatch();
  const selectedLedgerId = useSelector(
    (state) => state.ledgers?.selectedLedgerId
  );

  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize] = useState(5);

  const fetchLedgerData = useCallback(async () => {
    setLoading(true);
    setErrorText('');

    try {
      const response = await ledgerService.getLedgers({
        page,
        size: pageSize,
      });

      if (Array.isArray(response)) {
        setLedgers(response);
        setTotalPages(Math.max(1, Math.ceil(response.length / pageSize)));
      } else if (response && response.content) {
        setLedgers(response.content);
        setTotalPages(response.totalPages || 1);
      } else {
        setLedgers([]);
        setTotalPages(1);
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('jwt');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        localStorage.removeItem('organizationId');
        localStorage.removeItem('flowstate_access_token');
        localStorage.removeItem('flowstate_role');

        dispatch(logout());
        setErrorText('Session expired. Please log in again.');
      } else {
        setErrorText(
          err.response?.data?.message ||
            err.message ||
            'Failed to load ledgers.'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, dispatch]);

  useEffect(() => {
    fetchLedgerData();
  }, [fetchLedgerData]);

  const handleSelect = (ledgerId) => {
    dispatch(setSelectedLedger(ledgerId));
  };

  return (
    <div className="card table-card ledger-list-card">
      <div className="card-header">
        <div>
          <h3>Ledger Registry</h3>
          <p className="card-subtitle">
            Partitioned transactional balance sheets
          </p>
        </div>
        <button
          type="button"
          className="secondary-btn refresh-btn"
          onClick={fetchLedgerData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {errorText && (
        <div className="alert error-alert" role="alert">
          {errorText}
        </div>
      )}

      {loading && ledgers.length === 0 ? (
        <div className="loading-state" data-testid="loader">
          Loading ledgers...
        </div>
      ) : ledgers.length === 0 ? (
        <div className="empty-state">No ledgers found.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Ledger ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Currency</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ledgers.map((ledger) => {
                const id = ledger.id || ledger.ledgerId;
                const isSelected = String(selectedLedgerId) === String(id);
                return (
                  <tr
                    key={id}
                    className={isSelected ? 'selected-row' : ''}
                  >
                    <td className="monospace-id">{id}</td>
                    <td>
                      <strong>{ledger.name || 'Unnamed Ledger'}</strong>
                    </td>
                    <td>{ledger.description || '—'}</td>
                    <td>
                      <span className="currency-pill">
                        {ledger.currency || 'USD'}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className={`select-btn ${
                          isSelected ? 'selected' : ''
                        }`}
                        onClick={() => handleSelect(id)}
                      >
                        {isSelected ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className="pagination-bar">
        <button
          type="button"
          className="pagination-btn"
          disabled={page <= 0 || loading}
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
        >
          &larr; Previous
        </button>
        <span className="pagination-info">
          Page {page + 1} of {Math.max(1, totalPages)}
        </span>
        <button
          type="button"
          className="pagination-btn"
          disabled={page + 1 >= totalPages || loading}
          onClick={() => setPage((prev) => prev + 1)}
        >
          Next &rarr;
        </button>
      </div>
    </div>
  );
};

export default LedgerList;
