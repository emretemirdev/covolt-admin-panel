// src/App.tsx

import { Button, Title } from '@mantine/core';
// React Router DOM bileşenlerini import edin
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Sayfa componentlerini import edin
import { LoginPage } from './pages/LoginPage'; // LoginPage componentiniz
// Ana uygulama veya dashboard sayfası için bir component import etmeniz gerekebilir
// import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './app/router/ProtectedRoute'; // Korumalı Rota componentiniz

// AuthProvider'ı import edin
import { AuthProvider } from './features/auth/provider/AuthProvider';

// Ana uygulama component'i
function App() {
  return (
    // 1. Uygulamanızı BrowserRouter ile sarmalayın
    <BrowserRouter>
        {/* 2. AuthProvider'ı, auth contextine ihtiyacı olan rotaları sarmalayacak şekilde yerleştirin */}
        {/* Genellikle tüm rotaları sarmalar */}
        <AuthProvider>
            {/* 3. Rota tanımlarını Routes bileşeni içine ekleyin */}
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
                            <div style={{ padding: '20px', textAlign: 'center' }}>
                                <Title order={1}>Covolt Admin Paneli</Title>
                                <p>Hoş geldiniz!</p>
                                <Button m="md">Örnek Buton</Button>
                            </div>
                        </ProtectedRoute>
                    }
                />

                {/*
                // Örnek: Başka bir korumalı rota
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            // <SettingsPage /> // Ayarlar sayfası componentiniz
                        </ProtectedRoute>
                    }
                />
                */}

                {/* Tanımlanmayan yollar için dashboard'a yönlendir */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />

            </Routes>
        </AuthProvider>
    </BrowserRouter>
  );
}

export default App;