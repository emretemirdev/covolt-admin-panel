import React from 'react';
import { Container, Title, Text, Button, Group, rem } from '@mantine/core';
import { IconAlertTriangle, IconHome } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export function UnauthorizedPage() {
  const navigate = useNavigate();

  return (
    <Container py={rem(80)}>
      <div style={{ textAlign: 'center', marginBottom: 30 }}>
        <IconAlertTriangle size={60} color="orange" />
      </div>
      <Title ta="center" fw={900} fz={34} mb="md">
        Erişim Yetkisi Yok
      </Title>
      <Text c="dimmed" size="lg" ta="center">
        Bu sayfaya erişim için gerekli yetkilere sahip değilsiniz. 
        Eğer bu bir hata olduğunu düşünüyorsanız, lütfen sistem yöneticisiyle iletişime geçin.
      </Text>
      <Group justify="center" mt="xl">
        <Button 
          leftSection={<IconHome size={18} />} 
          size="md" 
          onClick={() => navigate('/dashboard')}
        >
          Ana Sayfaya Dön
        </Button>
      </Group>
    </Container>
  );
}
