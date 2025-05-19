import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth'; // Auth hook'umuzun doğru yolunu belirtin
import { Center, Loader } from '@mantine/core'; // Yükleme göstergesi için
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth(); // Auth durumunu ve yükleme durumunu al
  const location = useLocation(); // Kullanıcının gitmek istediği mevcut konumu al


  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  // Eğer kullanıcı giriş yapmamışsa (isAuthenticated false ise)
  if (!isAuthenticated) {
    // Kullanıcıyı /login sayfasına yönlendir.
    // 'state={{ from: location }}' ile kullanıcının gitmek istediği orijinal sayfanın
    // bilgisini login sayfasına taşıyoruz. Böylece başarılı login sonrası oraya geri dönebilir.
    // 'replace' prop'u, tarayıcı geçmişinde /login sayfasının bir önceki sayfanın yerine geçmesini sağlar.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Eğer kullanıcı giriş yapmışsa (isAuthenticated true ise)
  // İstenen iç içe route'ları (child routes) render et.
  return <>{children}</>;
};