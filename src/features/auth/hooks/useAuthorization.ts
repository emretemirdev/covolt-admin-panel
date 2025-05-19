import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import axiosInstance from '../../../shared/api/axiosInstance';
import { notifications } from '@mantine/notifications';

interface AuthorizationState {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuthorization(): AuthorizationState {
  const { isAuthenticated, user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      if (!isAuthenticated || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // Kullanıcının izinlerini ve rollerini almak için API isteği
        const response = await axiosInstance.get('/api/v1/users/me/permissions');
        
        // API yanıtından izinleri ve rolleri ayarla
        setPermissions(response.data.permissions || []);
        setRoles(response.data.roles || []);
        setError(null);
      } catch (err: any) {
        console.error('Yetkilendirme bilgileri alınamadı:', err);
        
        // 403 hatası için sessizce devam et, kullanıcı izinleri boş kalacak
        if (err.response?.status === 403) {
          // Boş izin ve rol dizileri ile devam et
          setPermissions([]);
          setRoles([]);
          // Opsiyonel: Sadece geliştirme ortamında bildirim göster
          if (import.meta.env.DEV) {
            notifications.show({
              title: 'Yetkilendirme Bilgisi',
              message: 'Yetkilendirme bilgileri alınamadı. Varsayılan izinler kullanılıyor.',
              color: 'yellow',
              autoClose: 5000,
            });
          }
        } else {
          setError('Yetkilendirme bilgileri alınamadı');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserPermissions();
  }, [isAuthenticated, user]);

  // Belirli bir izne sahip olup olmadığını kontrol et
  const hasPermission = (permission: string): boolean => {
    return permissions.includes(permission);
  };

  // Belirli bir role sahip olup olmadığını kontrol et
  const hasRole = (role: string): boolean => {
    // Role_ prefix'i ekle (eğer yoksa)
    const roleWithPrefix = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    return roles.includes(roleWithPrefix);
  };

  return { hasPermission, hasRole, isLoading, error };
}

