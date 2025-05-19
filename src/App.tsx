// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sayfa bileşenlerini import edin
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './features/dashboard/pages/DashboardPage';
import { RolesPage } from './features/admin/pages/RolesPage';
import { PermissionsPage } from './features/admin/pages/PermissionsPage';
import { ProtectedRoute } from './app/router/ProtectedRoute';

// AuthProvider'ı import edin
import { AuthProvider } from './features/auth/provider/AuthProvider';

// Ana uygulama bileşeni
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Ana sayfa - giriş yapılmamışsa login'e yönlendir */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Login sayfası */}
          <Route path="/login" element={<LoginPage />} />

          {/* Dashboard - korumalı rota */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Dashboard alt sayfaları */}
          <Route
            path="/dashboard/stats"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/users"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/settings"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Platform Admin sayfaları */}
          <Route
            path="/dashboard/roles"
            element={
              <ProtectedRoute>
                <RolesPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/permissions"
            element={
              <ProtectedRoute>
                <PermissionsPage />
              </ProtectedRoute>
            }
          />

          {/* Tanımlanmayan yollar için dashboard'a yönlendir */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;