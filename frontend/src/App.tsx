// Main App Component
// Sets up routing and provides authentication context to all pages

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { EventsPage } from './pages/EventsPage';
import { PurchasePage } from './pages/PurchasePage';
import { AdminEventsPage } from './pages/AdminEventsPage';
import { AdminUsersPage } from './pages/AdminUsersPage';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/events" element={<EventsPage />} />

          {/* Protected routes - require authentication */}
          <Route
            path="/purchase/:eventId"
            element={
              <ProtectedRoute>
                <PurchasePage />
              </ProtectedRoute>
            }
          />

          {/* Admin routes - require admin role */}
          <Route
            path="/admin/events"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminEventsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />

          {/* Default redirect to events page */}
          <Route path="/" element={<Navigate to="/events" replace />} />

          {/* 404 fallback */}
          <Route path="*" element={<Navigate to="/events" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
