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
import UserManagement from './components/admin/UserManagement';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminSessions from './components/admin/AdminSessions';
import AdminAnalytics from './components/admin/AdminAnalytics';
import AdminDistractions from './components/admin/AdminDistractions';
import AdminFocusBlocks from './components/admin/AdminFocusBlocks';
import AdminRecommendations from './components/admin/AdminRecommendations';
import './App.css';

const ProtectedRoute = ({ children, allowedRoles }) => {
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

  const role = user?.role || localStorage.getItem('flowstate_role') || '';

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
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
                {(() => {
                  const role = user?.role || localStorage.getItem('flowstate_role') || '';
                  if (role === 'PLATFORM_ADMIN') {
                    return <Navigate to="/admin/dashboard" replace />;
                  }
                  return <Dashboard />;
                })()}
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
              <ProtectedRoute allowedRoles={['PRACTITIONER', 'PLATFORM_ADMIN']}>
                <FocusBlockList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/focus-blocks"
            element={
              <ProtectedRoute allowedRoles={['PRACTITIONER', 'PLATFORM_ADMIN']}>
                <FocusBlockList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedRoute allowedRoles={['FLOW_COACH', 'PLATFORM_ADMIN', 'PRACTITIONER']}>
                <CoachRecommendationList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                <Navigate to="/admin/dashboard" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/sessions"
            element={
              <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                <AdminSessions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                <AdminAnalytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/distractions"
            element={
              <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                <AdminDistractions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/focus-blocks"
            element={
              <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                <AdminFocusBlocks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/recommendations"
            element={
              <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                <AdminRecommendations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['PLATFORM_ADMIN']}>
                <UserManagement />
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
