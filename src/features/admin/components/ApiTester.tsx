import { useState, useEffect } from 'react';
import { Button, Paper, Title, Text, Code, Group, Stack, Alert, TextInput } from '@mantine/core';
import { IconRefresh, IconAlertCircle, IconSend } from '@tabler/icons-react';
import axiosInstance from '../../../shared/api/axiosInstance';
import { useAuthorization } from '../../../features/auth/hooks/useAuthorization';

export function ApiTester() {
  const [apiUrl, setApiUrl] = useState<string>('/api/v1/platform-admin/companies');
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { roles, permissions } = useAuthorization();

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axiosInstance.get(apiUrl);
      setApiResponse(response.data);
      console.log('API Yanıtı (Ham):', response.data);
      console.log('API Yanıtı (JSON):', JSON.stringify(response.data, null, 2));

      // Yanıt yapısını analiz et
      console.log('Yanıt yapısı analizi:');

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
              console.log(`- ${key}: ${typeof firstItem[key]} = ${firstItem[key]}`);
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

          // Eğer değer bir dizi ise ve içinde eleman varsa
          if (Array.isArray(value) && value.length > 0) {
            console.log(`  ${key} dizisinin ilk elemanı:`, value[0]);

            // Eğer ilk eleman bir nesne ise, alanlarını incele
            if (typeof value[0] === 'object' && value[0] !== null) {
              console.log(`  ${key} dizisinin ilk elemanının alanları:`);
              for (const subKey in value[0]) {
                console.log(`  - ${subKey}: ${typeof value[0][subKey]} = ${value[0][subKey]}`);
              }
            }
          }

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
    } catch (err: any) {
      console.error('API Hatası:', err);
      setError(err.message || 'API isteği başarısız oldu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper p="md" withBorder>
      <Title order={3} mb="md">API Tester</Title>

      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
          {error}
        </Alert>
      )}

      <Stack spacing="md">
        <div>
          <Text fw={700}>Kullanıcı Rolleri:</Text>
          <Code block>{JSON.stringify(roles, null, 2)}</Code>
        </div>

        <div>
          <Text fw={700}>Kullanıcı İzinleri:</Text>
          <Code block>{JSON.stringify(permissions, null, 2)}</Code>
        </div>

        <TextInput
          label="API URL"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.currentTarget.value)}
          placeholder="/api/v1/platform-admin/companies"
        />

        <Group>
          <Button
            leftSection={<IconSend size="1rem" />}
            onClick={fetchData}
            loading={loading}
          >
            API İsteği Yap
          </Button>

          <Button
            leftSection={<IconRefresh size="1rem" />}
            variant="outline"
            onClick={() => setApiResponse(null)}
          >
            Temizle
          </Button>
        </Group>

        {apiResponse && (
          <>
            <div>
              <Text fw={700}>API Yanıtı (Ham):</Text>
              <Code block>{JSON.stringify(apiResponse, null, 2)}</Code>
            </div>

            <div>
              <Text fw={700}>API Yanıtı (Analiz):</Text>
              <Code block>
                {typeof apiResponse === 'object' && apiResponse !== null
                  ? Object.keys(apiResponse).map(key => {
                      const value = apiResponse[key];
                      const type = Array.isArray(value) ? 'array' : typeof value;
                      return `${key}: ${type}\n`;
                    }).join('')
                  : `Tür: ${typeof apiResponse}`
                }
              </Code>
            </div>
          </>
        )}
      </Stack>
    </Paper>
  );
}
