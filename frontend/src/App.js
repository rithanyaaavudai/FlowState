import React from 'react';
import { Routes, Route, Navigate, BrowserRouter, useInRouterContext } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './components/layout/Navbar';
import ErrorHandler from './components/layout/ErrorHandler';
import Login from './components/layout/Login';
import Dashboard from './components/dashboard/Dashboard';
import FocusSessionList from './components/focusSession/FocusSessionList';
import FocusBlockList from './components/focusBlock/FocusBlockList';
import CoachRecommendationList from './components/coachRecommendation/CoachRecommendationList';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, token } = useSelector((state) => state.auth || {});
  const storedToken = localStorage.getItem('flowstate_access_token');

  if (!user && !token && !storedToken) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <div className="app-container">
      <Navbar />
      <ErrorHandler />
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

function App() {
  const inRouter = useInRouterContext();
  if (inRouter) {
    return <AppContent />;
  }
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
