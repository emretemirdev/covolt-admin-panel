import { Paper, Title, Text, SimpleGrid, useMantineTheme, rem, Box } from '@mantine/core';

interface SummaryItem {
  title: string;
  value: string;
}

interface SummaryStatsProps {
  title?: string;
  description?: string;
  items?: SummaryItem[];
}

export function SummaryStats({ 
  title = 'Özet Bilgiler', 
  description = 'Sistem durumu ve önemli metrikler',
  items = [
    { title: 'Toplam Kullanıcı', value: '3,456' },
    { title: 'Aktif Oturum', value: '832' },
    { title: 'Tamamlanan İşlem', value: '1,257' },
    { title: 'Ortalama Süre', value: '24 dk' },
  ]
}: SummaryStatsProps) {
  const theme = useMantineTheme();

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={3} mb="md" fw={700}>{title}</Title>
      <Text size="sm" c="dimmed" mb="md">
        {description}
      </Text>
      <SimpleGrid cols={2} spacing="md">
        {items.map((item) => (
          <Box
            key={item.title}
            display="flex"
            style={{
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              borderRadius: theme.radius.md,
              height: rem(90),
              backgroundColor: theme.white,
              transition: 'box-shadow 150ms ease, transform 100ms ease',
            }}

              
          >
            <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
              {item.title}
            </Text>
            <Text fw={700} size="xl">
              {item.value}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
    </Paper>
  );
}



