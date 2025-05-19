import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import axiosInstance from '../../../shared/api/axiosInstance';
import { notifications } from '@mantine/notifications';

interface AuthorizationState {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  isLoading: boolean;
  error: string | null;
  refreshAuthorities: () => Promise<void>;
  roles: string[];
  permissions: string[];
}

// Backend'in döndürdüğü yanıt yapısı - SQL tablosundan gelen veriler
interface UserAuthorities {
  // Herhangi bir yapıyı kabul et
  [key: string]: any;
}

export function useAuthorization(): AuthorizationState {
  const { isAuthenticated, user } = useAuth();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Rol ve izinleri almak için fonksiyon
  const fetchUserAuthorities = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setPermissions([]);
      setRoles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Backend'in yeni endpoint'ini kullan
      const response = await axiosInstance.get<UserAuthorities>('/api/auth/user-authorities');

      // API yanıtını logla
      console.log('API Yanıtı (useAuthorization):', response.data);
      console.log('API Yanıtı (JSON):', JSON.stringify(response.data, null, 2));

      // SQL tablosundan gelen yanıtı analiz et
      console.log('SQL yanıt yapısı analizi:');

      // Yanıt bir dizi mi?
      if (Array.isArray(response.data)) {
        console.log('Yanıt bir dizi, uzunluk:', response.data.length);

        // Dizinin ilk elemanını incele
        if (response.data.length > 0) {
          const firstItem = response.data[0];
          console.log('İlk eleman:', firstItem);
          console.log('İlk eleman türü:', typeof firstItem);

          // Eğer ilk eleman bir nesne ise, alanlarını incele
          if (typeof firstItem === 'object' && firstItem !== null) {
            console.log('İlk elemanın alanları:');
            for (const key in firstItem) {
              console.log(`- ${key}: ${typeof firstItem[key]}`);
            }
          }
        }
      }
      // Yanıt bir nesne mi?
      else if (typeof response.data === 'object' && response.data !== null) {
        console.log('Yanıt bir nesne');

        // Tüm üst seviye anahtarları kontrol et
        for (const key in response.data) {
          const value = response.data[key];
          const type = Array.isArray(value) ? 'array' : typeof value;
          console.log(`- ${key}: ${type}`);

          // Eğer değer bir nesne ise, içindeki anahtarları da kontrol et
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            for (const subKey in value) {
              const subValue = value[subKey];
              const subType = Array.isArray(subValue) ? 'array' : typeof subValue;
              console.log(`  - ${key}.${subKey}: ${subType}`);
            }
          }
        }
      } else {
        console.log('Yanıt bir nesne veya dizi değil:', typeof response.data);
      }

      // API yanıtından izinleri ve rolleri ayarla - farklı yapıları kontrol et
      let fetchedPermissions: string[] = [];
      let fetchedRoles: string[] = [];

      const data = response.data;

      // SQL tablosundan gelen verileri işle
      if (Array.isArray(data)) {
        // Eğer yanıt doğrudan bir dizi ise
        console.log('Yanıt doğrudan bir dizi:', data);

        // Dizi içeriğini kontrol et
        if (data.length > 0) {
          // İlk elemanın yapısına bak
          const firstItem = data[0];
          console.log('Dizinin ilk elemanı:', firstItem);

          // Eğer dizi elemanları string ise
          if (typeof firstItem === 'string') {
            // İçeriğine göre rol veya izin olarak değerlendir
            if (firstItem.startsWith('ROLE_')) {
              fetchedRoles = data as string[];
            } else {
              fetchedPermissions = data as string[];
            }
          }
          // Eğer dizi elemanları nesne ise (SQL tablosundan gelen satırlar)
          else if (typeof firstItem === 'object' && firstItem !== null) {
            // Nesne alanlarını kontrol et
            console.log('SQL tablosu satırları işleniyor...');

            // Roller ve izinler için ayrı diziler oluştur
            const roles: string[] = [];
            const permissions: string[] = [];

            // Her bir satırı işle
            for (const row of data) {
              // Rol alanı kontrolü
              if (row.role_name) {
                roles.push(row.role_name);
              } else if (row.roleName) {
                roles.push(row.roleName);
              } else if (row.role) {
                roles.push(row.role);
              }

              // İzin alanı kontrolü
              if (row.permission_name) {
                permissions.push(row.permission_name);
              } else if (row.permissionName) {
                permissions.push(row.permissionName);
              } else if (row.permission) {
                permissions.push(row.permission);
              }
            }

            // Tekrarlanan değerleri kaldır
            fetchedRoles = [...new Set(roles)];
            fetchedPermissions = [...new Set(permissions)];

            console.log('SQL tablosundan çıkarılan roller:', fetchedRoles);
            console.log('SQL tablosundan çıkarılan izinler:', fetchedPermissions);
          }
        }
      }
      else {
        // Nesne olarak yanıt
        const dataObj = data as Record<string, any>;

        // permissions kontrolü
        if (dataObj.permissions && Array.isArray(dataObj.permissions)) {
          fetchedPermissions = dataObj.permissions;
        }
        else if (dataObj.authorities && dataObj.authorities.permissions && Array.isArray(dataObj.authorities.permissions)) {
          fetchedPermissions = dataObj.authorities.permissions;
        }
        else if (dataObj.data && dataObj.data.permissions && Array.isArray(dataObj.data.permissions)) {
          fetchedPermissions = dataObj.data.permissions;
        }
        else if (dataObj.userAuthorities && dataObj.userAuthorities.permissions && Array.isArray(dataObj.userAuthorities.permissions)) {
          fetchedPermissions = dataObj.userAuthorities.permissions;
        }

        // roles kontrolü
        if (dataObj.roles && Array.isArray(dataObj.roles)) {
          fetchedRoles = dataObj.roles;
        }
        else if (dataObj.authorities && dataObj.authorities.roles && Array.isArray(dataObj.authorities.roles)) {
          fetchedRoles = dataObj.authorities.roles;
        }
        else if (dataObj.data && dataObj.data.roles && Array.isArray(dataObj.data.roles)) {
          fetchedRoles = dataObj.data.roles;
        }
        else if (dataObj.userAuthorities && dataObj.userAuthorities.roles && Array.isArray(dataObj.userAuthorities.roles)) {
          fetchedRoles = dataObj.userAuthorities.roles;
        }
      }

      // Eğer hala bulunamadıysa, tüm alanları dolaşarak dizi olan herhangi bir alanı kontrol et
      if (fetchedPermissions.length === 0 || fetchedRoles.length === 0) {
        console.log('Standart yapıda permissions/roles bulunamadı, tüm alanları kontrol ediyorum...');

        // Tüm alanları dolaş
        const dataObj = data as Record<string, any>;
        for (const key in dataObj) {
          const value = dataObj[key];

          // Eğer değer bir dizi ise
          if (Array.isArray(value)) {
            console.log(`Dizi alanı bulundu: ${key}`, value);

            // Eğer dizi elemanları string ise ve permissions/roles ile ilgili görünüyorsa
            if (value.length > 0 && typeof value[0] === 'string') {
              if (key.toLowerCase().includes('permission') && fetchedPermissions.length === 0) {
                fetchedPermissions = value;
                console.log('Permissions olarak kullanılıyor:', value);
              } else if (key.toLowerCase().includes('role') && fetchedRoles.length === 0) {
                fetchedRoles = value;
                console.log('Roles olarak kullanılıyor:', value);
              }
            }
          }
          // Eğer değer bir nesne ise, içindeki dizileri kontrol et
          else if (value && typeof value === 'object') {
            const valueObj = value as Record<string, any>;
            for (const subKey in valueObj) {
              const subValue = valueObj[subKey];

              if (Array.isArray(subValue)) {
                console.log(`İç dizi alanı bulundu: ${key}.${subKey}`, subValue);

                if (subValue.length > 0 && typeof subValue[0] === 'string') {
                  if (subKey.toLowerCase().includes('permission') && fetchedPermissions.length === 0) {
                    fetchedPermissions = subValue;
                    console.log('Permissions olarak kullanılıyor:', subValue);
                  } else if (subKey.toLowerCase().includes('role') && fetchedRoles.length === 0) {
                    fetchedRoles = subValue;
                    console.log('Roles olarak kullanılıyor:', subValue);
                  }
                }
              }
            }
          }
        }
      }

      console.log('Çekilen izinler:', fetchedPermissions);
      console.log('Çekilen roller:', fetchedRoles);

      // State'i güncelle
      setPermissions(fetchedPermissions);
      setRoles(fetchedRoles);

      // LocalStorage'a da kaydet (rehberde önerildiği gibi)
      localStorage.setItem('userRoles', JSON.stringify(fetchedRoles));
      localStorage.setItem('userPermissions', JSON.stringify(fetchedPermissions));

      setError(null);
    } catch (err: any) {
      console.error('Yetkilendirme bilgileri alınamadı:', err);

      // LocalStorage'dan mevcut değerleri almayı dene
      try {
        const storedRoles = localStorage.getItem('userRoles');
        const storedPermissions = localStorage.getItem('userPermissions');

        if (storedRoles) setRoles(JSON.parse(storedRoles));
        if (storedPermissions) setPermissions(JSON.parse(storedPermissions));
      } catch (storageError) {
        console.error('LocalStorage\'dan rol ve izinler alınamadı:', storageError);
      }

      // 403 hatası için sessizce devam et
      if (err.response?.status === 403) {
        // Boş dizileri ayarla, böylece map fonksiyonu çağrıldığında hata oluşmaz
        if (!roles.length) setRoles([]);
        if (!permissions.length) setPermissions([]);

        // Sadece geliştirme ortamında bildirim göster
        if (import.meta.env.DEV) {
          notifications.show({
            title: 'Yetkilendirme Bilgisi',
            message: 'Kullanıcı yetkileri alınamadı. Önbelleğe alınmış izinler kullanılıyor.',
            color: 'yellow',
            autoClose: 5000,
          });
        }
      } else {
        setError('Yetkilendirme bilgileri alınamadı');

        // Kullanıcıya bildirim göster
        notifications.show({
          title: 'Yetkilendirme Hatası',
          message: 'Rol ve izin bilgileri alınamadı. Lütfen daha sonra tekrar deneyin.',
          color: 'red',
          autoClose: 5000,
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // İlk yükleme ve kullanıcı değişikliklerinde rol ve izinleri al
  useEffect(() => {
    fetchUserAuthorities();

    // Periyodik olarak rol ve izinleri güncelle (her 30 dakikada bir)
    const intervalId = setInterval(() => {
      fetchUserAuthorities();
    }, 30 * 60 * 1000); // 30 dakika

    return () => clearInterval(intervalId);
  }, [fetchUserAuthorities]);

  // Belirli bir izne sahip olup olmadığını kontrol et
  const hasPermission = useCallback((permission: string): boolean => {
    console.log(`hasPermission check for: "${permission}"`);
    console.log('Available permissions:', permissions);
    const result = permissions.includes(permission);
    console.log(`Permission "${permission}" check result:`, result);
    return result;
  }, [permissions]);

  // Belirli bir role sahip olup olmadığını kontrol et
  const hasRole = useCallback((role: string): boolean => {
    // Role_ prefix'i ekle (eğer yoksa)
    const roleWithPrefix = role.startsWith('ROLE_') ? role : `ROLE_${role}`;
    console.log(`hasRole check for: "${role}" (as "${roleWithPrefix}")`);
    console.log('Available roles:', roles);
    const result = roles.includes(roleWithPrefix);
    console.log(`Role "${roleWithPrefix}" check result:`, result);
    return result;
  }, [roles]);

  // Rol ve izinleri manuel olarak yenilemek için dışa açılan fonksiyon
  const refreshAuthorities = async (): Promise<void> => {
    await fetchUserAuthorities();
  };

  return {
    hasPermission,
    hasRole,
    isLoading,
    error,
    refreshAuthorities,
    roles,
    permissions
  };
}

