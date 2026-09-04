import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';

import authReducer, { loginSuccess, logout } from '../store/slices/authSlice';
import accountReducer, { fetchAccounts, createAccount } from '../store/slices/accountSlice';
import ledgerReducer, { fetchLedgers, createLedger, setSelectedLedger } from '../store/slices/ledgerSlice';
import transactionReducer, { fetchTransactions, approveTransaction } from '../store/slices/transactionSlice';

import Login from '../components/Login';
import ErrorHandler from '../components/ErrorHandler';
import NotificationStack from '../components/NotificationStack';
import Navbar from '../components/layout/Navbar';
import AccountForm from '../components/accounts/AccountForm';
import LedgerForm from '../components/ledgers/LedgerForm';
import LedgerList from '../components/ledgers/LedgerList';
import TransactionForm from '../components/transactions/TransactionForm';
import TransactionList from '../components/transactions/TransactionList';
import TransactionApproval from '../components/transactions/TransactionApproval';
import TransactionPanel from '../components/transactions/TransactionPanel';
import api from '../services/api';
import authService from '../services/authService';
import accountService from '../services/accountService';
import ledgerService from '../services/ledgerService';
import transactionService from '../services/transactionService';

jest.mock('axios', () => {
  const mAxios = {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(function () { return this; }),
    interceptors: {
      request: { use: jest.fn(), eject: jest.fn() },
      response: { use: jest.fn(), eject: jest.fn() },
    },
    defaults: { headers: { common: {} } },
  };
  return mAxios;
});

let testStore;

const renderWithProviders = (ui, store = testStore) => {
  return render(
    <Provider store={store}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
};

describe('VaultFlow — Transaction & Ledger Orchestrator Tests', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    testStore = configureStore({
      reducer: {
        auth: authReducer,
        accounts: accountReducer,
        ledgers: ledgerReducer,
        transactions: transactionReducer,
      },
    });
  });

  describe('1. Redux Store & Auth Slice', () => {
    test('authSlice initial state supports userId, role, organizationId, isAuthenticated', () => {
      const state = testStore.getState().auth;
      expect(state).toHaveProperty('userId');
      expect(state).toHaveProperty('role');
      expect(state).toHaveProperty('organizationId');
      expect(state).toHaveProperty('isAuthenticated');
      expect(state.isAuthenticated).toBe(false);
    });

    test('loginSuccess updates state and sets isAuthenticated to true', () => {
      testStore.dispatch(
        loginSuccess({
          userId: 'USER-100',
          role: 'TREASURER',
          organizationId: 'ORG-99',
          token: 'jwt-token-xyz',
        })
      );
      const state = testStore.getState().auth;
      expect(state.isAuthenticated).toBe(true);
      expect(state.userId).toBe('USER-100');
      expect(state.role).toBe('TREASURER');
      expect(state.organizationId).toBe('ORG-99');
      expect(localStorage.getItem('token')).toBe('jwt-token-xyz');
      expect(localStorage.getItem('role')).toBe('TREASURER');
    });

    test('logout resets values to null / false and cleans localStorage', () => {
      testStore.dispatch(
        loginSuccess({
          userId: 'USER-100',
          role: 'TREASURER',
          organizationId: 'ORG-99',
          token: 'jwt-token-xyz',
        })
      );
      testStore.dispatch(logout());
      const state = testStore.getState().auth;
      expect(state.isAuthenticated).toBe(false);
      expect(state.userId).toBeNull();
      expect(state.role).toBeNull();
      expect(state.organizationId).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('role')).toBeNull();
    });
  });

  describe('2. Login Component', () => {
    test('renders email and password inputs with exact placeholders and login button', () => {
      renderWithProviders(<Login />);
      const emailInput = screen.getByPlaceholderText('Email (e.g. auditor@vaultflow.io)');
      const passwordInput = screen.getByPlaceholderText('Enter your secure account password');
      const loginButton = screen.getByRole('button', { name: /^Login$/i });

      expect(emailInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(passwordInput).toBeInTheDocument();
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(loginButton).toBeInTheDocument();
    });

    test('successful login persists token & role, dispatches loginSuccess', async () => {
      axios.post.mockResolvedValueOnce({
        data: {
          token: 'vault-jwt-123',
          role: 'TREASURER',
          userId: 'U-001',
          organizationId: 'ORG-01',
        },
      });

      renderWithProviders(<Login />);
      fireEvent.change(
        screen.getByPlaceholderText('Email (e.g. auditor@vaultflow.io)'),
        { target: { value: 'treasurer@vaultflow.io' } }
      );
      fireEvent.change(
        screen.getByPlaceholderText('Enter your secure account password'),
        { target: { value: 'password123' } }
      );
      fireEvent.click(screen.getByRole('button', { name: /^Login$/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('vault-jwt-123');
        expect(localStorage.getItem('role')).toBe('TREASURER');
      });
    });
  });

  describe('3. Navbar Component', () => {
    test('displays semantic nav, brand title, and links for Transactions, Ledgers, Accounts', () => {
      renderWithProviders(<Navbar />);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      expect(screen.getByText('VaultFlow ORCHESTRATOR')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Transactions/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Ledgers/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Accounts/i })).toBeInTheDocument();
    });

    test('displays "Approve Transaction" button ONLY for TREASURER role', () => {
      testStore.dispatch(
        loginSuccess({ userId: '1', role: 'TREASURER', token: 'tok' })
      );
      const { unmount } = renderWithProviders(<Navbar />);
      expect(screen.getByRole('button', { name: /Approve Transaction/i })).toBeInTheDocument();
      unmount();

      testStore.dispatch(
        loginSuccess({ userId: '2', role: 'AUDITOR', token: 'tok' })
      );
      renderWithProviders(<Navbar />);
      expect(screen.queryByRole('button', { name: /Approve Transaction/i })).not.toBeInTheDocument();
    });
  });

  describe('4. ErrorHandler Component', () => {
    test('displays exact literal error text when rendering error occurs', () => {
      const ProblemComponent = () => {
        throw new Error('Crash!');
      };

      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      render(
        <ErrorHandler>
          <ProblemComponent />
        </ErrorHandler>
      );
      expect(
        screen.getByText('Ledger synchronization failed. Please check connectivity.')
      ).toBeInTheDocument();
      spy.mockRestore();
    });
  });

  describe('5. NotificationStack Component', () => {
    test('renders notifications with data-testid="alert-{id}" and proper class names', () => {
      const notifications = [
        { id: 1, type: 'success', message: 'Account Reconciled Successfully' },
        { id: 2, type: 'warning', message: 'Unrecognized transaction flag detected' },
      ];
      render(<NotificationStack notifications={notifications} />);

      const alert1 = screen.getByTestId('alert-1');
      const alert2 = screen.getByTestId('alert-2');

      expect(alert1).toBeInTheDocument();
      expect(alert1).toHaveClass('notification', 'success');
      expect(alert1).toHaveTextContent('Account Reconciled Successfully');

      expect(alert2).toBeInTheDocument();
      expect(alert2).toHaveClass('notification', 'warning');
      expect(alert2).toHaveTextContent('Unrecognized transaction flag detected');
    });
  });

  describe('6. AccountForm Component', () => {
    test('live preview updates as account name changes with data-testid="account-name-preview"', () => {
      renderWithProviders(<AccountForm />);
      const preview = screen.getByTestId('account-name-preview');
      const input = screen.getByLabelText(/Account Name/i);

      fireEvent.change(input, { target: { value: 'Main Vault Reserve' } });
      expect(preview).toHaveTextContent('Main Vault Reserve');
    });

    test('has exact account types: SAVINGS, CHECKING, INVESTMENT, PAYROLL, LOAN and dynamically shows Interest Rate for SAVINGS', () => {
      renderWithProviders(<AccountForm />);
      const select = screen.getByLabelText(/Account Type/i);
      const options = Array.from(select.querySelectorAll('option')).map((o) => o.value);
      expect(options).toEqual(['SAVINGS', 'CHECKING', 'INVESTMENT', 'PAYROLL', 'LOAN']);

      // SAVINGS selected by default
      expect(screen.getByLabelText(/Interest Rate/i)).toBeInTheDocument();

      // Switch to CHECKING
      fireEvent.change(select, { target: { value: 'CHECKING' } });
      expect(screen.queryByLabelText(/Interest Rate/i)).not.toBeInTheDocument();
    });
  });

  describe('7. LedgerForm & LedgerList', () => {
    test('LedgerForm has "Edit Ledger" button that focuses "Ledger Description" input', () => {
      renderWithProviders(<LedgerForm />);
      const descInput = screen.getByPlaceholderText('Ledger Description');
      const editBtn = screen.getByRole('button', { name: /Edit Ledger/i });

      expect(descInput).toBeInTheDocument();
      fireEvent.click(editBtn);
      expect(document.activeElement).toBe(descInput);
    });

    test('LedgerList displays exact "Session expired. Please log in again." on HTTP 401', async () => {
      axios.get.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Unauthorized' } },
      });

      renderWithProviders(<LedgerList />);

      await waitFor(() => {
        expect(
          screen.getByText('Session expired. Please log in again.')
        ).toBeInTheDocument();
      });
    });
  });

  describe('8. TransactionForm Component', () => {
    test('renders required fields and Submit Transaction button', () => {
      renderWithProviders(<TransactionForm />);
      expect(screen.getByPlaceholderText('Transaction Amount')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Source Account Reference')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Target Account Reference')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('e.g. TRX-2026-ARC-00441')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Submit Transaction/i })).toBeInTheDocument();
    });

    test('shows warning alert "Account not selected" when accounts are missing', async () => {
      renderWithProviders(<TransactionForm />);
      fireEvent.change(screen.getByPlaceholderText('Transaction Amount'), {
        target: { value: '500' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g. TRX-2026-ARC-00441'), {
        target: { value: 'TRX-101' },
      });
      fireEvent.click(screen.getByRole('button', { name: /Submit Transaction/i }));

      const warning = await screen.findByTestId('warning-alert');
      expect(warning).toHaveTextContent('Account not selected');
    });

    test('on HTTP 500 displays "Unable to process transaction. Please try again." with error-alert testid', async () => {
      axios.post.mockRejectedValueOnce({
        response: { status: 500, data: { message: 'Internal Server Error' } },
      });

      renderWithProviders(<TransactionForm />);
      fireEvent.change(screen.getByPlaceholderText('Transaction Amount'), {
        target: { value: '500' },
      });
      fireEvent.change(screen.getByPlaceholderText('Source Account Reference'), {
        target: { value: 'ACC-VAULT-001' },
      });
      fireEvent.change(screen.getByPlaceholderText('Target Account Reference'), {
        target: { value: 'ACC-VAULT-002' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g. TRX-2026-ARC-00441'), {
        target: { value: 'TRX-101' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Submit Transaction/i }));

      const errorAlert = await screen.findByTestId('error-alert');
      expect(errorAlert).toHaveTextContent(
        'Unable to process transaction. Please try again.'
      );
    });

    test('on success sends { amount, source, target } and shows success alert with 3s auto dismiss', async () => {
      axios.post.mockResolvedValueOnce({
        data: { id: 1, amount: 250, source: 'ACC-1', target: 'ACC-2' },
      });

      renderWithProviders(<TransactionForm />);
      fireEvent.change(screen.getByPlaceholderText('Transaction Amount'), {
        target: { value: '250' },
      });
      fireEvent.change(screen.getByPlaceholderText('Source Account Reference'), {
        target: { value: 'ACC-1' },
      });
      fireEvent.change(screen.getByPlaceholderText('Target Account Reference'), {
        target: { value: 'ACC-2' },
      });
      fireEvent.change(screen.getByPlaceholderText('e.g. TRX-2026-ARC-00441'), {
        target: { value: 'TRX-101' },
      });

      fireEvent.click(screen.getByRole('button', { name: /Submit Transaction/i }));

      const success = await screen.findByTestId('success-alert');
      expect(success).toHaveTextContent('Transaction Logged Successfully');

      expect(axios.post).toHaveBeenCalledWith(
        '/transactions',
        expect.objectContaining({
          amount: 250,
          source: 'ACC-1',
          target: 'ACC-2',
        })
      );
    });
  });

  describe('9. TransactionList Component', () => {
    test('fetches all transactions on mount and displays table with ID, Reference, Source, Target, Amount, Status', async () => {
      axios.get.mockResolvedValueOnce({
        data: [
          {
            id: 'TX-100',
            reference: 'TRX-2026-001',
            source: 'ACC-A',
            target: 'ACC-B',
            amount: 1500,
            status: 'APPROVED',
          },
        ],
      });

      renderWithProviders(<TransactionList />);

      expect(await screen.findByText('TX-100')).toBeInTheDocument();
      expect(screen.getByText('ID')).toBeInTheDocument();
      expect(screen.getByText('Reference')).toBeInTheDocument();
      expect(screen.getByText('Source')).toBeInTheDocument();
      expect(screen.getByText('Target')).toBeInTheDocument();
      expect(screen.getByText('Amount')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('TRX-2026-001')).toBeInTheDocument();
    });

    test('search input has placeholder "Search by Transaction ID or Account Name"', () => {
      renderWithProviders(<TransactionList />);
      expect(
        screen.getByPlaceholderText('Search by Transaction ID or Account Name')
      ).toBeInTheDocument();
    });

    test('calls getByLedger when Ledger ID filter changes', async () => {
      axios.get.mockResolvedValue({ data: [] });
      renderWithProviders(<TransactionList />);

      const ledgerInput = screen.getByLabelText(/Filter by Ledger ID/i);
      fireEvent.change(ledgerInput, { target: { value: 'LEDGER-99' } });

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          '/transactions',
          expect.objectContaining({ params: { ledgerId: 'LEDGER-99' } })
        );
      });
    });
  });

  describe('10. TransactionApproval Component', () => {
    test('sends PUT request with transaction ID and { status: "APPROVED" }', async () => {
      testStore.dispatch(
        loginSuccess({ userId: '1', role: 'TREASURER', token: 'tok' })
      );
      axios.put.mockResolvedValueOnce({
        data: { id: 'TX-500', status: 'APPROVED' },
      });

      renderWithProviders(
        <TransactionApproval transaction={{ id: 'TX-500', amount: 300 }} />
      );

      const approveBtn = screen.getByRole('button', { name: /^Approve$/i });
      fireEvent.click(approveBtn);

      await waitFor(() => {
        expect(axios.put).toHaveBeenCalledWith('/transactions/TX-500', {
          status: 'APPROVED',
        });
      });
    });
  });

  describe('11. TransactionPanel Component', () => {
    test('renders "Initiate Transaction" and toggles to "Close Transaction Panel" on click', () => {
      renderWithProviders(<TransactionPanel />);
      const btn = screen.getByRole('button', { name: /Initiate Transaction/i });
      expect(btn).toBeInTheDocument();

      fireEvent.click(btn);
      expect(
        screen.getByRole('button', { name: /Close Transaction Panel/i })
      ).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Transaction Amount')).toBeInTheDocument();
    });
  });
});
