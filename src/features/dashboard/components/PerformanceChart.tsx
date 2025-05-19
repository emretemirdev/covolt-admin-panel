import { Paper, Title, Text, Center, RingProgress, useMantineTheme } from '@mantine/core';

interface PerformanceChartProps {
  title?: string;
  description?: string;
}

export function PerformanceChart({ 
  title = 'Haftalık Performans', 
  description = 'Son 7 günün performans metrikleri' 
}: PerformanceChartProps) {
  const theme = useMantineTheme();

  return (
    <Paper withBorder p="md" radius="md">
      <Title order={3} mb="md" fw={700}>{title}</Title>
      <Text size="sm" c="dimmed" mb="md">
        {description}
      </Text>
      <Center>
        <RingProgress
          size={200}
          thickness={16}
          sections={[
            { value: 40, color: theme.colors.blue[6], tooltip: 'Tamamlanan Görevler' },
            { value: 25, color: theme.colors.orange[6], tooltip: 'Devam Eden Görevler' },
            { value: 15, color: theme.colors.green[6], tooltip: 'Yeni Görevler' },
          ]}
          label={
            <div>
              <Text ta="center" fz="lg" fw={700}>
                80%
              </Text>
              <Text ta="center" fz="xs" c="dimmed">
                Tamamlanma
              </Text>
            </div>
          }
        />
      </Center>
    </Paper>
  );
}
