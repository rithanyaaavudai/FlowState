import React from 'react';
import {
  Routes,
  Route,
  Navigate,
  BrowserRouter,
  useInRouterContext,
} from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/layout/Navbar';
import ErrorHandler from './components/layout/ErrorHandler';
import NotificationStack from './components/layout/NotificationStack';
import Login from './components/layout/Login';
import Dashboard from './components/dashboard/Dashboard';
import FocusSessionList from './components/focusSession/FocusSessionList';
import FocusBlockList from './components/focusBlock/FocusBlockList';
import CoachRecommendationList from './components/coachRecommendation/CoachRecommendationList';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, token, user } = useSelector(
    (state) => state.auth || {}
  );
  const storedToken =
    localStorage.getItem('flowstate_access_token') ||
    localStorage.getItem('token');

  const isAuth = isAuthenticated || !!token || !!user || !!storedToken;

  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  const { isAuthenticated, token, user } = useSelector(
    (state) => state.auth || {}
  );
  const storedToken =
    localStorage.getItem('flowstate_access_token') ||
    localStorage.getItem('token');
  const isAuth = isAuthenticated || !!token || !!user || !!storedToken;

  return (
    <div className="app-container">
      <Navbar />
      <NotificationStack />
      <main className="main-content">
        <Routes>
          <Route
            path="/login"
            element={isAuth ? <Navigate to="/" replace /> : <Login />}
          />
          <Route
            path="/register"
            element={
              isAuth ? <Navigate to="/" replace /> : <Login initialRegister={true} />
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/sessions"
            element={
              <ProtectedRoute>
                <FocusSessionList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/blocks"
            element={
              <ProtectedRoute>
                <FocusBlockList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/focus-blocks"
            element={
              <ProtectedRoute>
                <FocusBlockList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute>
                <CoachRecommendationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<Navigate to={isAuth ? '/' : '/login'} replace />}
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
