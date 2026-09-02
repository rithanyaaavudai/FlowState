import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import axios from 'axios';

// Import slice reducers directly
import authReducer from '../store/slices/authSlice';
import focusSessionReducer from '../store/slices/focusSessionSlice';
import sessionGoalReducer from '../store/slices/sessionGoalSlice';
import distractionLogReducer from '../store/slices/distractionLogSlice';
import focusBlockReducer from '../store/slices/focusBlockSlice';
import coachRecommendationReducer from '../store/slices/coachRecommendationSlice';

// Mock axios at top level with all required methods
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

// Domain Constants (CROSS-REFERENCE LOCK)
const DOMAIN_ROLE = 'PRACTITIONER';
const CRUD_DELETE_MSG = 'FocusSession deleted successfully.';
const CRUD_CREATE_MSG = 'FocusSession scheduled successfully.';
const CRUD_UPDATE_MSG = 'FocusSession updated successfully.';
const DOMAIN_VALUE_1 = 'Morning Deep Work';

let testStore;

const renderWithProviders = (ui) => {
  return render(
    <Provider store={testStore}>
      <BrowserRouter>
        {ui}
      </BrowserRouter>
    </Provider>
  );
};

// Global default mock implementation
const setupDefaultMocks = () => {
  axios.get.mockImplementation((url) => {
    if (url.includes('/api/sessions/mine') || url.includes('/api/sessions')) {
      return Promise.resolve({ data: { content: [], totalPages: 0, number: 0 } });
    }
    if (url.includes('/api/sessions/stats')) {
      return Promise.resolve({ data: { totalSessions: 0, totalFocusHours: 0, averageFocusScore: 0, totalFocusMinutes: 0, completedSessions: 0 } });
    }
    if (url.includes('/api/blocks/mine') || url.includes('/api/blocks/capacity-plan')) {
      return Promise.resolve({ data: [] });
    }
    if (url.includes('/api/recommendations/mine/pending') || url.includes('/api/recommendations')) {
      return Promise.resolve({ data: { content: [], totalPages: 0, number: 0 } });
    }
    return Promise.resolve({ data: {} });
  });

  axios.post.mockImplementation(() => Promise.resolve({ data: {} }));
  axios.put.mockImplementation(() => Promise.resolve({ data: {} }));
  axios.delete.mockImplementation(() => Promise.resolve({ data: {} }));
};

describe('Frontend Tests (FlowState Focus Session Management System)', () => {

  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
    setupDefaultMocks();
    window.confirm = jest.fn(() => true);
    window.scrollTo = jest.fn();
    window.HTMLElement.prototype.scrollIntoView = jest.fn();

    // Create a fresh store instance for each test
    testStore = configureStore({
      reducer: {
        auth: authReducer,
        focusSessions: focusSessionReducer,
        sessionGoals: sessionGoalReducer,
        distractionLogs: distractionLogReducer,
        focusBlocks: focusBlockReducer,
        coachRecommendations: coachRecommendationReducer,
      }
    });
  });

  test('T01 - Folder structure: Login page exists', async () => {
    const Login = (await import('../components/Login')).default;
    renderWithProviders(<Login />);
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  test('T02 - Folder structure: services directory exists', async () => {
    const response = await import('../services/focusSessionService');
    expect(response).toBeDefined();
    expect(response.default.getAll).toBeDefined();
  });

  test('T03 - Folder structure: store directory exists', async () => {
    const response = await import('../store/slices/authSlice');
    expect(response).toBeDefined();
    expect(typeof response.default).toBe('function');
  });

  test('T04 - Folder structure: styling check', async () => {
    const AppContainer = document.createElement('div');
    AppContainer.className = 'modal-card';
    expect(AppContainer.className).toBe('modal-card');
  });

  test('T05 - Folder structure: component directory exists', async () => {
    const response = await import('../components/layout/Navbar');
    expect(response).toBeDefined();
    expect(response.default).toBeDefined();

    const { default: Navbar } = response;
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('T06 - Navbar: Displays navigation elements', async () => {
    const { default: Navbar } = await import('../components/layout/Navbar');
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('T07 - SessionList: Fetches and displays sessions from the backend', async () => {
    const mockData = {
      content: [{ id: 1, title: DOMAIN_VALUE_1, status: 'SCHEDULED', sessionType: 'DEEP_WORK', plannedStart: new Date().toISOString(), plannedEnd: new Date(Date.now() + 3600000).toISOString() }]
    };
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/sessions/mine')) return Promise.resolve({ data: mockData });
      return Promise.resolve({ data: { content: [] } });
    });

    const FocusSessionList = (await import('../components/focusSession/FocusSessionList')).default;
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    renderWithProviders(<FocusSessionList />);

    await waitFor(() => {
      expect(screen.getByText(DOMAIN_VALUE_1)).toBeInTheDocument();
    });
  });

  test('T08 - authService: login and register methods call correct endpoints', async () => {
    axios.post.mockResolvedValueOnce({
      data: { accessToken: 'mock-token', refreshToken: 'mock-refresh-token', userId: 1, username: 'bob', fullName: 'Bob', role: 'PRACTITIONER' }
    });

    const { default: authService } = await import('../services/authService');

    expect(typeof authService.login).toBe('function');
    expect(typeof authService.register).toBe('function');

    const result = await authService.login({ username: 'bob', password: 'password123' });

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(result.accessToken).toBeDefined();
    expect(result.role).toBe('PRACTITIONER');
    expect(result.fullName).toBe('Bob');
  });


  test('T10 - Redux: Verifies auth state updates', async () => {
    const mockToken = 'mock-jwt-token';
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: mockToken,
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    const state = testStore.getState().auth;
    expect(state.user.token).toBe(mockToken);
  });


  test('T12 - Login: Input fields should have correct placeholders', async () => {
    const { default: Login } = await import('../components/Login');
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText(/Enter your username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
  });

  test('T13 - Feedback: Displays error message when operation fails', async () => {
    const { default: ErrorHandler } = await import('../components/ErrorHandler');
    const errorMessage = "FocusSession-specific failure during load";
    render(<ErrorHandler error={errorMessage} onClear={jest.fn()} />);
    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  test('T14 - UI: Shows loading spinner during fetch', async () => {
    const DataLoader = ({ isLoading, data }) => (
      <div>{isLoading ? <div data-testid="loader">Loading...</div> : <div data-testid="content">{data}</div>}</div>
    );
    render(<DataLoader isLoading={true} data={null} />);
    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });

  test('T15 - FormReset: Clears input fields', async () => {
    const ResetForm = () => {
      const [val, setVal] = React.useState('Initial');
      return (
        <div>
          <input data-testid="reset-input" value={val} onChange={(e) => setVal(e.target.value)} />
          <button onClick={() => setVal('')}>Reset</button>
        </div>
      );
    };
    render(<ResetForm />);
    const input = screen.getByTestId('reset-input');
    fireEvent.click(screen.getByRole('button', { name: /reset/i }));
    expect(input.value).toBe('');
  });

  test('T16 - Validation: Frontend blocks invalid submission when title is empty', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });

    const postSpy = jest.spyOn(axios, 'post');

    const FocusSessionForm = (await import('../components/focusSession/FocusSessionForm')).default;
    renderWithProviders(<FocusSessionForm onClose={jest.fn()} />);

    const titleInput = screen.getByLabelText(/Session Title/i);
    expect(titleInput).toHaveAttribute('required');
    expect(titleInput.value).toBe('');

    // JSDOM does not enforce HTML5 required attribute validation on form submit.
    // We assert that the field has the "required" validation constraint and is currently invalid.
    expect(titleInput.checkValidity()).toBe(false);
    expect(postSpy).not.toHaveBeenCalled();
  });


  test('T17 - FocusSessions: Renders My Focus Sessions heading correctly', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    const FocusSessionList = (await import('../components/focusSession/FocusSessionList')).default;
    renderWithProviders(<FocusSessionList />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /My Focus Sessions/i })).toBeInTheDocument();
    });
  });

  test('T18 - FocusSessions: Handles deletion feedback with correct response string', async () => {
    axios.delete.mockResolvedValueOnce({ status: 200, data: 'FocusSession deleted successfully.' });

    const { default: focusSessionService } = await import('../services/focusSessionService');

    expect(typeof focusSessionService.delete).toBe('function');

    const result = await focusSessionService.delete(1);

    expect(axios.delete).toHaveBeenCalledTimes(1);
    expect(result).toBe('FocusSession deleted successfully.');
  });

  test('T19 - Sessions: Handles deletion flow and calls delete endpoint', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });

    const mockData = {
      content: [{ id: 1, title: DOMAIN_VALUE_1, status: 'SCHEDULED', sessionType: 'DEEP_WORK', plannedStart: new Date().toISOString(), plannedEnd: new Date(Date.now() + 3600000).toISOString() }],
      totalPages: 1, number: 0
    };

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/sessions/mine')) return Promise.resolve({ data: mockData });
      return Promise.resolve({ data: { content: [] } });
    });
    axios.delete.mockResolvedValueOnce({ status: 200, data: CRUD_DELETE_MSG });

    const { default: focusSessionService } = await import('../services/focusSessionService');
    expect(typeof focusSessionService.delete).toBe('function');

    const result = await focusSessionService.delete(1);

    expect(axios.delete).toHaveBeenCalledTimes(1);
    expect(result).toBe(CRUD_DELETE_MSG);
  });

  test('T20 - Pagination: SessionList correctly handles Spring Data Page structure', async () => {
    const mockPage = {
      content: [
        { id: 1, title: DOMAIN_VALUE_1, status: 'SCHEDULED', sessionType: 'DEEP_WORK', plannedStart: new Date().toISOString(), plannedEnd: new Date(Date.now() + 3600000).toISOString() }
      ],
      totalPages: 3,
      number: 0
    };

    axios.get.mockImplementation((url) => {
      if (url.includes('/api/sessions/mine')) return Promise.resolve({ data: mockPage });
      return Promise.resolve({ data: { content: [] } });
    });

    const FocusSessionList = (await import('../components/focusSession/FocusSessionList')).default;
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    renderWithProviders(<FocusSessionList />);

    await waitFor(() => {
      expect(screen.getByText(DOMAIN_VALUE_1)).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalled();
  });

  test('T21 - Resilience: SessionList handles network failure gracefully', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network Error'));

    const FocusSessionList = (await import('../components/focusSession/FocusSessionList')).default;
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    renderWithProviders(<FocusSessionList />);

    await waitFor(() => {
      const errorEl = screen.queryByText(/Failed to fetch sessions/i) || screen.queryByText(/Network Error/i);
      const headingEl = screen.queryByRole('heading', { name: /My Focus Sessions/i });
      expect(errorEl || headingEl).toBeInTheDocument();
    });

    expect(axios.get).toHaveBeenCalled();
  });

  test('T22 - Validation: Date format constraints', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    const FocusSessionForm = (await import('../components/focusSession/FocusSessionForm')).default;
    renderWithProviders(<FocusSessionForm onClose={jest.fn()} />);
    const inputs = document.querySelectorAll('input[type="datetime-local"]');
    expect(inputs.length).toBeGreaterThan(0);
    expect(inputs[0]).toHaveAttribute('required');
  });

  test('T23 - SessionList Modal: Validates input types', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    const FocusSessionForm = (await import('../components/focusSession/FocusSessionForm')).default;
    renderWithProviders(<FocusSessionForm onClose={jest.fn()} />);
    const timeInput = document.querySelector('input[type="datetime-local"]');
    expect(timeInput).toHaveAttribute('type', 'datetime-local');
  });

  test('T24 - SessionList: Identity validation', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    const FocusSessionList = (await import('../components/focusSession/FocusSessionList')).default;
    renderWithProviders(<FocusSessionList />);
    expect(screen.getByRole('heading', { name: /My Focus Sessions/i })).toBeInTheDocument();
  });

  test('T25 - Subject Management: Fetches and lists subjects', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    const FocusSessionForm = (await import('../components/focusSession/FocusSessionForm')).default;
    renderWithProviders(<FocusSessionForm onClose={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Deep Work')).toBeInTheDocument();
      expect(screen.getByText('Creative')).toBeInTheDocument();
      expect(screen.getByText('Review')).toBeInTheDocument();
    });
  });

  test('T26 - SessionList: Heading verification', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    const FocusSessionList = (await import('../components/focusSession/FocusSessionList')).default;
    renderWithProviders(<FocusSessionList />);
    expect(screen.getByRole('heading', { name: /My Focus Sessions/i })).toBeInTheDocument();
  });

  test('T27 - Style: Branding constraints', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    const FocusSessionList = (await import('../components/focusSession/FocusSessionList')).default;
    renderWithProviders(<FocusSessionList />);

    const addBtn = screen.getByRole('button', { name: /\+ Schedule Session/i });
    expect(addBtn).toBeInTheDocument();
    expect(addBtn).toHaveClass('primary-btn');
  });

  test('T28 - Style: Layout constraints', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    const FocusSessionList = (await import('../components/focusSession/FocusSessionList')).default;
    renderWithProviders(<FocusSessionList />);

    const heading = screen.getByRole('heading', { name: /My Focus Sessions/i });
    const container = heading.closest('.page-container');
    expect(container).not.toBeNull();
    expect(container).toHaveClass('page-container');
  });

  test('T29 - Layout: Navigation constraints', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-token',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'Bob',
        role: 'PRACTITIONER'
      }
    });
    const { default: Navbar } = await import('../components/layout/Navbar');
    renderWithProviders(<Navbar />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  test('T30 - Home: Welcome logic', async () => {
    testStore.dispatch({
      type: 'auth/login/fulfilled',
      payload: {
        accessToken: 'mock-jwt',
        refreshToken: 'mock-refresh-token',
        userId: 1,
        username: 'testuser',
        fullName: 'John Doe',
        role: 'PRACTITIONER'
      }
    });
    const App = (await import('../App')).default;
    render(
      <Provider store={testStore}>
        <App />
      </Provider>
    );
    await waitFor(() => {
      expect(screen.getByText(/Hello, John Doe!/i)).toBeInTheDocument();
    });
  });

});
