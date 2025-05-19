// src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sayfa bileşenlerini import edin
import { LoginPage } from './pages/LoginPage';
import { UnauthorizedPage } from './pages/UnauthorizedPage';
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

          {/* Yetkisiz erişim sayfası */}
          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          {/* Dashboard - korumalı rota */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />

          {/* Rol yönetimi sayfası - MANAGE_ROLES izni veya PLATFORM_ADMIN rolü gerektirir */}
          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute
                permission="MANAGE_ROLES"
                role="PLATFORM_ADMIN"
              >
                <RolesPage />
              </ProtectedRoute>
            }
          />

          {/* İzin yönetimi sayfası - MANAGE_PERMISSIONS izni veya PLATFORM_ADMIN rolü gerektirir */}
          <Route
            path="/admin/permissions"
            element={
              <ProtectedRoute
                permission="MANAGE_PERMISSIONS"
                role="PLATFORM_ADMIN"
              >
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


