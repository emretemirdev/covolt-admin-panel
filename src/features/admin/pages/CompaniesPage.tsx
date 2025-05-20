import { Title, Container, Group, Button, Space } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { DashboardLayout } from '../../dashboard/layouts/DashboardLayout';
import { CompaniesTable } from '../components/CompaniesTable';
import { ApiTester } from '../components/ApiTester';

export function CompaniesPage() {
  return (
    <DashboardLayout>
      <Container size="xl">
        <Group position="apart" mb="lg">
          <Title order={2}>Şirket Yönetimi</Title>
          <Button leftSection={<IconPlus size="1rem" />}>Yeni Şirket</Button>
        </Group>
        
        <CompaniesTable />
        
        <Space h="xl" />
        
        {/* Geliştirme aşamasında API tester'ı göster */}
        <ApiTester />
      </Container>
    </DashboardLayout>
  );
}
