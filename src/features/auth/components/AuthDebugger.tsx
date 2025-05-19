import { useState, useEffect } from 'react';
import { Button, Paper, Title, Text, Code, Group, Stack, Alert } from '@mantine/core';
import { IconRefresh, IconAlertCircle } from '@tabler/icons-react';
import axiosInstance from '../../../shared/api/axiosInstance';
import { useAuth } from '../hooks/useAuth';
import { useAuthorization } from '../hooks/useAuthorization';

// Backend'in döndürdüğü yanıt yapısı - SQL tablosundan gelen veriler
interface UserAuthorities {
  // Herhangi bir yapıyı kabul et
  [key: string]: any;
}

export function AuthDebugger() {
  const { isAuthenticated, user } = useAuth();
  const { roles, permissions, refreshAuthorities } = useAuthorization();
  const [apiResponse, setApiResponse] = useState<UserAuthorities | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAuthorities = async () => {
    if (!isAuthenticated) {
      setError('Kullanıcı giriş yapmamış');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get<UserAuthorities>('/api/auth/user-authorities');
      setApiResponse(response.data);
      console.log('API Yanıtı (AuthDebugger):', response.data);
      console.log('API Yanıtı (JSON):', JSON.stringify(response.data, null, 2));

      // Yanıt yapısını analiz et
      const data = response.data;
      console.log('Yanıt yapısı analizi:');

      // Tüm üst seviye anahtarları kontrol et
      for (const key in data) {
        const value = data[key];
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

      // Hook'u da yenile
      await refreshAuthorities();
    } catch (err: any) {
      console.error('API Hatası:', err);
      setError(err.message || 'Yetkilendirme bilgileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAuthorities();
    }
  }, [isAuthenticated]);

  return (
    <Paper p="md" withBorder>
      <Title order={3} mb="md">Yetkilendirme Debugger</Title>

      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
          {error}
        </Alert>
      )}

      <Group mb="md">
        <Button
          leftSection={<IconRefresh size="1rem" />}
          onClick={fetchAuthorities}
          loading={loading}
        >
          Yetkileri Yenile
        </Button>
      </Group>

      <Stack>
        <div>
          <Text fw={700}>Kullanıcı:</Text>
          <Code block>{JSON.stringify(user, null, 2)}</Code>
        </div>

        <div>
          <Text fw={700}>Hook'tan Gelen Roller:</Text>
          <Code block>{JSON.stringify(roles, null, 2)}</Code>
        </div>

        <div>
          <Text fw={700}>Hook'tan Gelen İzinler:</Text>
          <Code block>{JSON.stringify(permissions, null, 2)}</Code>
        </div>

        <div>
          <Text fw={700}>API Yanıtı (Ham):</Text>
          <Code block>{JSON.stringify(apiResponse, null, 2)}</Code>
        </div>

        <div>
          <Text fw={700}>API Yanıtı (Analiz):</Text>
          <Code block>
            {apiResponse ? Object.keys(apiResponse).map(key => {
              const value = apiResponse[key];
              const type = Array.isArray(value) ? 'array' : typeof value;
              return `${key}: ${type}\n`;
            }).join('') : 'Veri yok'}
          </Code>
        </div>
      </Stack>
    </Paper>
  );
}
