import {
  Title,
  SimpleGrid,
  Container,
  useMantineTheme,
  Space
} from '@mantine/core';
import {
  IconUsers,
  IconDeviceAnalytics,
  IconGauge,
  IconCoin
} from '@tabler/icons-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { StatsCard } from '../components/StatsCard';
import { PerformanceChart } from '../components/PerformanceChart';
import { SummaryStats } from '../components/SummaryStats';
import { AuthDebugger } from '../../auth/components/AuthDebugger';
import { ApiTester } from '../../auth/components/ApiTester';

// Ana dashboard sayfası
export function DashboardPage() {
  const theme = useMantineTheme();

  // Örnek istatistik verileri
  const stats = [
    { title: 'Aktif Kullanıcılar', value: '1,294', diff: 12, icon: <IconUsers size="1.5rem" color={theme.colors.blue[6]} /> },
    { title: 'Gelir', value: '₺5,432', diff: 8, icon: <IconCoin size="1.5rem" color={theme.colors.green[6]} /> },
    { title: 'Trafik', value: '2,543', diff: -4, icon: <IconDeviceAnalytics size="1.5rem" color={theme.colors.orange[6]} /> },
    { title: 'Performans', value: '86%', diff: 7, icon: <IconGauge size="1.5rem" color={theme.colors.cyan[6]} /> },
  ];

  return (
    <DashboardLayout>
      <Container size="lg" py="xl">
        <Title order={2} mb="xl">Dashboard</Title>

        <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
          {stats.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              diff={stat.diff}
              icon={stat.icon}
            />
          ))}
        </SimpleGrid>

        <SimpleGrid cols={{ base: 1, sm: 2 }} mt="xl">
          <PerformanceChart />
          <SummaryStats />
        </SimpleGrid>

        <Space h="xl" />

        {/* Yetkilendirme Debugger */}
        <AuthDebugger />

        <Space h="xl" />

        {/* API Tester */}
        <ApiTester />
      </Container>
    </DashboardLayout>
  );
}
