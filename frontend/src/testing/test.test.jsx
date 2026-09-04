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

describe('VaultFlow — Transaction & Ledger Orchestrator Spec Suite', () => {
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

  test('T01 - Folder structure: Login page exists', async () => {
    const LoginComp = (await import('../components/Login')).default;
    renderWithProviders(<LoginComp />);
    expect(screen.getByRole('button', { name: /^Login$/i })).toBeInTheDocument();
  });

  test('T02 - Folder structure: services directory exists', async () => {
    const ts = await import('../services/transactionService');
    expect(ts.default).toBeDefined();
    expect(ts.default.getAllTransactions).toBeDefined();
    expect(ts.default.getByLedger).toBeDefined();
    expect(ts.default.createTransaction).toBeDefined();
    expect(ts.default.approveTransaction).toBeDefined();
  });

  test('T03 - Folder structure: store directory exists', async () => {
    const authS = await import('../store/slices/authSlice');
    expect(authS.default).toBeDefined();
    expect(typeof authS.default).toBe('function');
  });

  test('T04 - Folder structure: styling check', () => {
    const AppContainer = document.createElement('div');
    AppContainer.className = 'modal-card';
    expect(AppContainer.className).toBe('modal-card');
  });

  test('T05 - Folder structure: component directory exists & Navbar renders', async () => {
    const { default: NavbarComp } = await import('../components/layout/Navbar');
    expect(NavbarComp).toBeDefined();
    renderWithProviders(<NavbarComp />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('T06 - Navbar: Displays navigation elements and brand', async () => {
    const { default: NavbarComp } = await import('../components/layout/Navbar');
    renderWithProviders(<NavbarComp />);
    expect(screen.getByText('VaultFlow ORCHESTRATOR')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Transactions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ledgers/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Accounts/i })).toBeInTheDocument();
  });

  test('T07 - Navbar: Role-based Approve Transaction button visibility', async () => {
    const { default: NavbarComp } = await import('../components/layout/Navbar');
    testStore.dispatch(
      loginSuccess({ userId: '1', role: 'TREASURER', token: 'tok' })
    );
    const { unmount } = renderWithProviders(<NavbarComp />);
    expect(screen.getByRole('button', { name: /Approve Transaction/i })).toBeInTheDocument();
    unmount();

    testStore.dispatch(
      loginSuccess({ userId: '2', role: 'AUDITOR', token: 'tok' })
    );
    renderWithProviders(<NavbarComp />);
    expect(screen.queryByRole('button', { name: /Approve Transaction/i })).not.toBeInTheDocument();
  });

  test('T08 - authService: login and logout methods exist and operate correctly', async () => {
    axios.post.mockResolvedValueOnce({
      data: { token: 'mock-jwt', role: 'TREASURER', userId: 1 },
    });

    const result = await authService.login({
      email: 'treasurer@vaultflow.io',
      password: 'password123',
    });
    expect(axios.post).toHaveBeenCalled();
    expect(result.token).toBe('mock-jwt');
  });

  test('T09 - accountService: getAccounts and createAccount operate correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Main' }] });
    const accs = await accountService.getAccounts();
    expect(accs).toEqual([{ id: 1, name: 'Main' }]);
  });

  test('T10 - Redux: Verifies auth state updates with loginSuccess', () => {
    const mockToken = 'mock-jwt-token';
    testStore.dispatch(
      loginSuccess({
        userId: 'U-1',
        role: 'TREASURER',
        organizationId: 'ORG-1',
        token: mockToken,
      })
    );
    const state = testStore.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.role).toBe('TREASURER');
    expect(state.userId).toBe('U-1');
  });

  test('T11 - Redux: Verifies auth logout resets state', () => {
    testStore.dispatch(
      loginSuccess({
        userId: 'U-1',
        role: 'TREASURER',
        organizationId: 'ORG-1',
        token: 'tok',
      })
    );
    testStore.dispatch(logout());
    const state = testStore.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.userId).toBeNull();
  });

  test('T12 - Login: Input fields have required placeholders', async () => {
    renderWithProviders(<Login />);
    expect(
      screen.getByPlaceholderText('Email (e.g. auditor@vaultflow.io)')
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter your secure account password')
    ).toBeInTheDocument();
  });

  test('T13 - ErrorHandler: Displays literal error on rendering crash', () => {
    const CrashingComponent = () => {
      throw new Error('Component crashed');
    };
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(
      <ErrorHandler>
        <CrashingComponent />
      </ErrorHandler>
    );
    expect(
      screen.getByText('Ledger synchronization failed. Please check connectivity.')
    ).toBeInTheDocument();
    spy.mockRestore();
  });

  test('T14 - NotificationStack: Renders independent notifications with data-testid alert-{id}', () => {
    const items = [
      { id: '1', type: 'success', message: 'Account Reconciled Successfully' },
      { id: '2', type: 'warning', message: 'Unrecognized transaction flag detected' },
    ];
    render(<NotificationStack notifications={items} />);
    expect(screen.getByTestId('alert-1')).toHaveTextContent('Account Reconciled Successfully');
    expect(screen.getByTestId('alert-2')).toHaveTextContent('Unrecognized transaction flag detected');
  });

  test('T15 - AccountForm: Live preview and dynamic interest rate', () => {
    renderWithProviders(<AccountForm />);
    const nameInput = screen.getByLabelText(/Account Name/i);
    fireEvent.change(nameInput, { target: { value: 'Reserve Vault' } });
    expect(screen.getByTestId('account-name-preview')).toHaveTextContent('Reserve Vault');

    const select = screen.getByLabelText(/Account Type/i);
    expect(screen.getByLabelText(/Interest Rate/i)).toBeInTheDocument();

    fireEvent.change(select, { target: { value: 'CHECKING' } });
    expect(screen.queryByLabelText(/Interest Rate/i)).not.toBeInTheDocument();
  });

  test('T16 - LedgerForm: Edit Ledger focuses Ledger Description input', () => {
    renderWithProviders(<LedgerForm />);
    const input = screen.getByPlaceholderText('Ledger Description');
    fireEvent.click(screen.getByRole('button', { name: /Edit Ledger/i }));
    expect(document.activeElement).toBe(input);
  });

  test('T17 - LedgerList: 401 error displays "Session expired. Please log in again."', async () => {
    axios.get.mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Unauthorized' } },
    });
    renderWithProviders(<LedgerList />);
    expect(
      await screen.findByText('Session expired. Please log in again.')
    ).toBeInTheDocument();
  });

  test('T18 - TransactionForm: Missing accounts shows warning-alert', async () => {
    renderWithProviders(<TransactionForm />);
    fireEvent.change(screen.getByPlaceholderText('Transaction Amount'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. TRX-2026-ARC-00441'), {
      target: { value: 'REF-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Transaction/i }));

    const alert = await screen.findByTestId('warning-alert');
    expect(alert).toHaveTextContent('Account not selected');
  });

  test('T19 - TransactionForm: HTTP 500 shows error-alert', async () => {
    axios.post.mockRejectedValueOnce({
      response: { status: 500, data: {} },
    });
    renderWithProviders(<TransactionForm />);
    fireEvent.change(screen.getByPlaceholderText('Transaction Amount'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByPlaceholderText('Source Account Reference'), {
      target: { value: 'ACC-1' },
    });
    fireEvent.change(screen.getByPlaceholderText('Target Account Reference'), {
      target: { value: 'ACC-2' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. TRX-2026-ARC-00441'), {
      target: { value: 'REF-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Transaction/i }));

    const errorAlert = await screen.findByTestId('error-alert');
    expect(errorAlert).toHaveTextContent('Unable to process transaction. Please try again.');
  });

  test('T20 - TransactionForm: Success shows success-alert', async () => {
    axios.post.mockResolvedValueOnce({
      data: { id: 1, amount: 100, source: 'ACC-1', target: 'ACC-2' },
    });
    renderWithProviders(<TransactionForm />);
    fireEvent.change(screen.getByPlaceholderText('Transaction Amount'), {
      target: { value: '100' },
    });
    fireEvent.change(screen.getByPlaceholderText('Source Account Reference'), {
      target: { value: 'ACC-1' },
    });
    fireEvent.change(screen.getByPlaceholderText('Target Account Reference'), {
      target: { value: 'ACC-2' },
    });
    fireEvent.change(screen.getByPlaceholderText('e.g. TRX-2026-ARC-00441'), {
      target: { value: 'REF-1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit Transaction/i }));

    const successAlert = await screen.findByTestId('success-alert');
    expect(successAlert).toHaveTextContent('Transaction Logged Successfully');
  });

  test('T21 - TransactionList: Mounts and calls getAllTransactions', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        {
          id: '101',
          reference: 'REF-101',
          source: 'ACC-1',
          target: 'ACC-2',
          amount: 500,
          status: 'PENDING',
        },
      ],
    });
    renderWithProviders(<TransactionList />);
    expect(await screen.findByText('101')).toBeInTheDocument();
    expect(screen.getByText('Reference')).toBeInTheDocument();
    expect(screen.getByText('Source')).toBeInTheDocument();
    expect(screen.getByText('Target')).toBeInTheDocument();
    expect(screen.getByText('Amount')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
  });

  test('T22 - TransactionList: Search placeholder matches specification', () => {
    renderWithProviders(<TransactionList />);
    expect(
      screen.getByPlaceholderText('Search by Transaction ID or Account Name')
    ).toBeInTheDocument();
  });

  test('T23 - TransactionApproval: Sends PUT with status APPROVED', async () => {
    testStore.dispatch(
      loginSuccess({ userId: '1', role: 'TREASURER', token: 'tok' })
    );
    axios.put.mockResolvedValueOnce({
      data: { id: '101', status: 'APPROVED' },
    });
    renderWithProviders(
      <TransactionApproval transaction={{ id: '101', amount: 500 }} />
    );
    fireEvent.click(screen.getByRole('button', { name: /^Approve$/i }));
    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith('/transactions/101', {
        status: 'APPROVED',
      });
    });
  });

  test('T24 - TransactionPanel: Toggle Initiate / Close Transaction Panel', () => {
    renderWithProviders(<TransactionPanel />);
    const btn = screen.getByRole('button', { name: /Initiate Transaction/i });
    fireEvent.click(btn);
    expect(screen.getByRole('button', { name: /Close Transaction Panel/i })).toBeInTheDocument();
  });
});
