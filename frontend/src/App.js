import React, { useState } from 'react';
import {
  Routes,
  Route,
  Navigate,
  BrowserRouter,
  useInRouterContext,
} from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/layout/Navbar';
import ErrorHandler from './components/ErrorHandler';
import NotificationStack from './components/NotificationStack';
import Login from './components/Login';
import AccountForm from './components/accounts/AccountForm';
import LedgerForm from './components/ledgers/LedgerForm';
import LedgerList from './components/ledgers/LedgerList';
import TransactionList from './components/transactions/TransactionList';
import TransactionApproval from './components/transactions/TransactionApproval';
import TransactionPanel from './components/transactions/TransactionPanel';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated: reduxAuth, token: reduxToken, user } = useSelector(
    (state) => state.auth || {}
  );
  const storedToken =
    localStorage.getItem('token') ||
    localStorage.getItem('jwt') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('flowstate_access_token');

  const isAuth = reduxAuth || !!reduxToken || !!user || !!storedToken;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const TransactionsPage = () => {
  const { role: reduxRole, user } = useSelector((state) => state.auth || {});
  const role =
    reduxRole ||
    user?.role ||
    localStorage.getItem('role') ||
    localStorage.getItem('flowstate_role') ||
    '';
  const isTreasurer =
    typeof role === 'string' && role.toUpperCase() === 'TREASURER';

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="page-container transactions-page">
      <div className="page-header">
        <div>
          <h2>Transaction Orchestration</h2>
          <p className="page-subtitle">
            Create, audit, and authorize transactional ledger movements
          </p>
        </div>
      </div>

      <TransactionPanel
        onTransactionCreated={() => setRefreshKey((k) => k + 1)}
      />

      {isTreasurer && (
        <TransactionApproval
          transaction={selectedTransaction}
          onApproved={() => {
            setSelectedTransaction(null);
            setRefreshKey((k) => k + 1);
          }}
        />
      )}

      <TransactionList
        key={refreshKey}
        onSelectTransaction={(trx) => setSelectedTransaction(trx)}
      />
    </div>
  );
};

const LedgersPage = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="page-container ledgers-page">
      <div className="page-header">
        <div>
          <h2>Ledger Directory</h2>
          <p className="page-subtitle">
            Manage double-entry balance sheets and asset vaults
          </p>
        </div>
      </div>

      <div className="form-row">
        <LedgerForm onSaved={() => setRefreshKey((k) => k + 1)} />
      </div>

      <LedgerList key={refreshKey} />
    </div>
  );
};

const AccountsPage = () => {
  const [, setRefreshKey] = useState(0);

  return (
    <div className="page-container accounts-page">
      <div className="page-header">
        <div>
          <h2>Account Management</h2>
          <p className="page-subtitle">
            Configure custody accounts, savings, and settlement lines
          </p>
        </div>
      </div>

      <AccountForm onAccountCreated={() => setRefreshKey((k) => k + 1)} />
    </div>
  );
};

const AppContent = () => {
  const { isAuthenticated, token } = useSelector((state) => state.auth || {});
  const storedToken =
    localStorage.getItem('token') ||
    localStorage.getItem('jwt') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('flowstate_access_token');
  const isAuth = isAuthenticated || !!token || !!storedToken;

  return (
    <div className="app-container">
      <Navbar />
      <NotificationStack />
      <main className="main-content">
        <Routes>
          <Route
            path="/login"
            element={
              isAuth ? <Navigate to="/transactions" replace /> : <Login />
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <TransactionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ledgers"
            element={
              <ProtectedRoute>
                <LedgersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/accounts"
            element={
              <ProtectedRoute>
                <AccountsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/"
            element={
              <Navigate to={isAuth ? '/transactions' : '/login'} replace />
            }
          />
          <Route
            path="*"
            element={
              <Navigate to={isAuth ? '/transactions' : '/login'} replace />
            }
          />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  const inRouter = useInRouterContext();
  const content = (
    <ErrorHandler>
      <AppContent />
    </ErrorHandler>
  );

  if (inRouter) {
    return content;
  }
  return <BrowserRouter>{content}</BrowserRouter>;
}

export default App;
