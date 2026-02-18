import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { DashboardLayout } from './layouts/DashboardLayout';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { ResetPassword } from './pages/auth/ResetPassword';
import { Home } from './pages/dashboard/Home';
import { MyNotes } from './pages/dashboard/MyNotes';
import { CreateNote } from './pages/dashboard/CreateNote';
import { SingleNote } from './pages/dashboard/SingleNote';
import { Account } from './pages/dashboard/Account';
import { RoutePath } from './types';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Routes */}
            <Route path={RoutePath.LOGIN} element={<SignIn />} />
            <Route path={RoutePath.SIGNUP} element={<SignUp />} />
            <Route path={RoutePath.RESET_PASSWORD} element={<ResetPassword />} />

            {/* Dashboard Layout (Shared by Guest and Auth users) */}
            <Route element={<DashboardLayout />}>
              {/* Public Home Page (Handles both Guest and Auth states internally) */}
              <Route path={RoutePath.HOME} element={<Home />} />
              
              {/* Protected Routes - Redirect to Login if Guest */}
              <Route path={RoutePath.NOTES} element={<ProtectedRoute><MyNotes /></ProtectedRoute>} />
              <Route path={RoutePath.CREATE_NOTE} element={<ProtectedRoute><CreateNote /></ProtectedRoute>} />
              <Route path={RoutePath.EDIT_NOTE} element={<ProtectedRoute><CreateNote /></ProtectedRoute>} />
              <Route path={RoutePath.NOTE_DETAIL} element={<ProtectedRoute><SingleNote /></ProtectedRoute>} />
              <Route path={RoutePath.ACCOUNT} element={<ProtectedRoute><Account /></ProtectedRoute>} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to={RoutePath.HOME} replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;