import React, { useState, useEffect, useCallback } from 'react';
import transactionService from '../../services/transactionService';

const TransactionList = ({ onSelectTransaction }) => {
  const [transactions, setTransactions] = useState([]);
  const [ledgerId, setLedgerId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTransactions = useCallback(async (currentLedgerId) => {
    setLoading(true);
    setError(null);
    try {
      let data;
      if (currentLedgerId && currentLedgerId.trim() !== '') {
        data = await transactionService.getByLedger(currentLedgerId.trim());
      } else {
        data = await transactionService.getAllTransactions();
      }

      if (Array.isArray(data)) {
        setTransactions(data);
      } else if (data && data.content) {
        setTransactions(data.content);
      } else {
        setTransactions([]);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to load transactions.'
      );
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mount effect: call getAllTransactions
  useEffect(() => {
    fetchTransactions('');
  }, [fetchTransactions]);

  // Ledger ID filter change effect
  const handleLedgerChange = (e) => {
    const newLedgerId = e.target.value;
    setLedgerId(newLedgerId);
    fetchTransactions(newLedgerId);
  };

  const filteredTransactions = transactions.filter((trx) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const id = String(trx.id || '').toLowerCase();
    const ref = String(
      trx.reference || trx.referenceId || trx.systemReference || ''
    ).toLowerCase();
    const src = String(trx.source || trx.sourceAccount || '').toLowerCase();
    const tgt = String(trx.target || trx.targetAccount || '').toLowerCase();
    return (
      id.includes(term) ||
      ref.includes(term) ||
      src.includes(term) ||
      tgt.includes(term)
    );
  });

  return (
    <div className="card table-card transaction-list-card">
      <div className="card-header">
        <div>
          <h3>Transaction Audit Log</h3>
          <p className="card-subtitle">
            Synchronized journal of financial entries
          </p>
        </div>
      </div>

      <div className="filter-controls-bar">
        <div className="filter-field">
          <label htmlFor="ledger-filter">Filter by Ledger ID</label>
          <input
            id="ledger-filter"
            type="text"
            placeholder="Enter Ledger ID (e.g. LEDGER-01)"
            value={ledgerId}
            onChange={handleLedgerChange}
          />
        </div>

        <div className="filter-field search-field">
          <label htmlFor="search-trx">Search</label>
          <input
            id="search-trx"
            type="text"
            placeholder="Search by Transaction ID or Account Name"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {error && (
        <div className="alert error-alert" role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="loading-state" data-testid="loader">
          Loading transactions...
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="empty-state">No transactions found.</div>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Reference</th>
                <th>Source</th>
                <th>Target</th>
                <th>Amount</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((trx) => {
                const id = trx.id || trx.transactionId || '—';
                const reference =
                  trx.reference ||
                  trx.referenceId ||
                  trx.systemReference ||
                  'TRX-REF-' + id;
                const source = trx.source || trx.sourceAccount || '—';
                const target = trx.target || trx.targetAccount || '—';
                const amountVal =
                  typeof trx.amount === 'number'
                    ? trx.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })
                    : trx.amount || '0.00';
                const status = trx.status || 'PENDING';

                return (
                  <tr
                    key={id}
                    onClick={() => onSelectTransaction && onSelectTransaction(trx)}
                    style={{ cursor: onSelectTransaction ? 'pointer' : 'default' }}
                  >
                    <td className="monospace-id">{id}</td>
                    <td className="reference-cell">{reference}</td>
                    <td>{source}</td>
                    <td>{target}</td>
                    <td className="amount-cell">${amountVal}</td>
                    <td>
                      <span
                        className={`status-badge status-${status.toLowerCase()}`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TransactionList;
