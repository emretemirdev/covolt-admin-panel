import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthorization } from '../../features/auth/hooks/useAuthorization';

export function MainMenu() {
  const { hasRole, hasPermission } = useAuthorization();
  
  return (
    <nav>
      {/* Temel menü öğeleri - her kullanıcı görebilir */}
      <NavLink to="/dashboard">Ana Sayfa</NavLink>
      <NavLink to="/profile">Profilim</NavLink>
      
      {/* Sadece admin rolüne sahip kullanıcılara göster */}
      {hasRole('ADMIN') && (
        <>
          <NavLink to="/admin/roles">Rol Yönetimi</NavLink>
          <NavLink to="/admin/users">Kullanıcı Yönetimi</NavLink>
        </>
      )}
      
      {/* Sadece belirli izne sahip kullanıcılara göster */}
      {hasPermission('manage:permissions') && (
        <NavLink to="/admin/permissions">İzin Yönetimi</NavLink>
      )}
      
      {/* Sadece belirli izne sahip kullanıcılara göster */}
      {hasPermission('view:reports') && (
        <NavLink to="/reports">Raporlar</NavLink>
      )}
    </nav>
  );
}