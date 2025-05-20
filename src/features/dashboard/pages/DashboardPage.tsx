import { useState, useEffect } from 'react';
import {
  Title,
  SimpleGrid,
  Container,
  useMantineTheme,
  Space,
  Loader,
  Center
} from '@mantine/core';
import {
  IconBuildingSkyscraper,
  IconDeviceAnalytics,
  IconGauge,
  IconCoin,
  IconUsers,
  IconAlertTriangle,
  IconClock
} from '@tabler/icons-react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { StatsCard } from '../components/StatsCard';
import { PerformanceChart } from '../components/PerformanceChart';
import { SummaryStats } from '../components/SummaryStats';
import { AuthDebugger } from '../../auth/components/AuthDebugger';
import { ApiTester } from '../../auth/components/ApiTester';
import { getCompanyStatistics } from '../../admin/api/companyApi';

// Ana dashboard sayfası
export function DashboardPage() {
  const theme = useMantineTheme();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [companyStats, setCompanyStats] = useState({
    totalCompanies: 0,
    activeCompanies: 0,
    suspendedCompanies: 0,
    pendingVerificationCompanies: 0,
    growthRate: 0
  });

  // Şirket istatistiklerini yükle
  useEffect(() => {
    const loadCompanyStats = async () => {
      try {
        setLoading(true);
        const stats = await getCompanyStatistics();
        setCompanyStats(stats);
        setError(null);
      } catch (err) {
        console.error('Şirket istatistikleri yüklenirken hata:', err);
        setError('Şirket istatistikleri yüklenirken bir hata oluştu.');
      } finally {
        setLoading(false);
      }
    };

    loadCompanyStats();
  }, []);

  // İstatistik kartları için veri
  const stats = [
    {
      title: 'Aktif Şirketler',
      value: companyStats.activeCompanies.toLocaleString(),
      diff: companyStats.growthRate,
      icon: <IconBuildingSkyscraper size="1.5rem" color={theme.colors.blue[6]} />
    },
    {
      title: 'Toplam Şirketler',
      value: companyStats.totalCompanies.toLocaleString(),
      diff: Math.floor(companyStats.growthRate / 2),
      icon: <IconCoin size="1.5rem" color={theme.colors.green[6]} />
    },
    {
      title: 'Askıya Alınmış',
      value: companyStats.suspendedCompanies.toLocaleString(),
      diff: -Math.floor(Math.random() * 5) - 1,
      icon: <IconAlertTriangle size="1.5rem" color={theme.colors.orange[6]} />
    },
    {
      title: 'Doğrulama Bekleyen',
      value: companyStats.pendingVerificationCompanies.toLocaleString(),
      diff: Math.floor(Math.random() * 10),
      icon: <IconClock size="1.5rem" color={theme.colors.cyan[6]} />
    },
  ];

  return (
    <DashboardLayout>
      <Container size="lg" py="xl">
        <Title order={2} mb="xl">Dashboard</Title>

        {loading ? (
          <Center my="xl">
            <Loader size="lg" />
          </Center>
        ) : error ? (
          <Center my="xl">
            <Title order={3} color="red">{error}</Title>
          </Center>
        ) : (
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
        )}

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
