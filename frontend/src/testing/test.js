import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import store from '../store';
import { setCredentials, logout } from '../store/slices/authSlice';
import Login from '../components/layout/Login';
import ErrorHandler from '../components/layout/ErrorHandler';
import Dashboard from '../components/dashboard/Dashboard';

describe('Frontend Integration Tests', () => {
  test('T10 - Redux: Verifies auth state updates', () => {
    store.dispatch(
      setCredentials({
        token: 'mock-token-123',
        user: {
          id: 'user-1',
          username: 'john_doe',
          fullName: 'John Doe',
          role: 'PRACTITIONER',
        },
      })
    );

    const state = store.getState().auth;
    expect(state.token).toBe('mock-token-123');
    expect(state.username).toBe('john_doe');
    expect(state.fullName).toBe('John Doe');
    expect(state.role).toBe('PRACTITIONER');
    expect(state.user).toBeDefined();

    store.dispatch(logout());
    const loggedOutState = store.getState().auth;
    expect(loggedOutState.token).toBeNull();
    expect(loggedOutState.user).toBeNull();
  });

  test('T12 - Login: Input fields should have correct placeholders', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <Login />
        </MemoryRouter>
      </Provider>
    );

    const usernameInput = screen.getByPlaceholderText(/username/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    expect(usernameInput).toBeInDocument();
    expect(passwordInput).toBeInDocument();
  });

  test('T13 - Feedback: Displays error message when operation fails', () => {
    render(
      <Provider store={store}>
        <MemoryRouter>
          <ErrorHandler error="Operation failed due to network error" />
        </MemoryRouter>
      </Provider>
    );

    const errorMessage = screen.getByText(/Operation failed due to network error/i);
    expect(errorMessage).toBeInDocument();
  });

  test('T30 - Home: Welcome logic', () => {
    store.dispatch(
      setCredentials({
        token: 'token-456',
        user: {
          id: 'user-2',
          username: 'jane_doe',
          fullName: 'Jane Doe',
          role: 'PRACTITIONER',
        },
      })
    );

    render(
      <Provider store={store}>
        <MemoryRouter>
          <Dashboard />
        </MemoryRouter>
      </Provider>
    );

    const welcomeElement = screen.getByText(/Welcome, Jane Doe!/i);
    expect(welcomeElement).toBeInDocument();
  });
});
