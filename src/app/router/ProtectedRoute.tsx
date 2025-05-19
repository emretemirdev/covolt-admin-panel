import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth/hooks/useAuth';
import { useAuthorization } from '../../features/auth/hooks/useAuthorization';
import { Center, Loader } from '@mantine/core';
import type { ReactNode } from 'react';

interface ProtectedRouteProps {
  children: ReactNode;
  permission?: string;
  role?: string;
}

export const ProtectedRoute = ({ children, permission, role }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { hasPermission, hasRole, isLoading: authzLoading, roles, permissions } = useAuthorization();
  const location = useLocation();

  const isLoading = authLoading || authzLoading;

  if (isLoading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader />
      </Center>
    );
  }

  // Eğer kullanıcı giriş yapmamışsa login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Eğer rol veya izin kontrolü gerekiyorsa
  console.log('ProtectedRoute - Checking access:');
  console.log('- Role required:', role);
  console.log('- Permission required:', permission);

  // Rol kontrolü
  const roleCheck = role ? hasRole(role) : false;
  console.log('- Has role:', roleCheck);

  // İzin kontrolü
  const permissionCheck = permission ? hasPermission(permission) : false;
  console.log('- Has permission:', permissionCheck);

  // Hiçbir kontrol gerekli değilse
  const noCheckRequired = !role && !permission;
  console.log('- No check required:', noCheckRequired);

  // Rol veya izin kontrolü başarılı ise veya hiçbir kontrol gerekli değilse erişime izin ver
  const hasAccess = roleCheck || permissionCheck || noCheckRequired;
  console.log('- Has access:', hasAccess);

  // Kullanıcının rollerini ve izinlerini logla
  console.log('- User roles:', roles);
  console.log('- User permissions:', permissions);

  if (!hasAccess) {
    // Erişim yoksa, yetkisiz sayfasına yönlendir
    console.log('Access denied, redirecting to /unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  // Kullanıcı giriş yapmış ve gerekli izinlere sahipse içeriği göster
  return <>{children}</>;
};
