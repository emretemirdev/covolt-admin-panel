import { Card, Group, Text, useMantineTheme } from '@mantine/core';
import { IconArrowUpRight, IconArrowDownRight } from '@tabler/icons-react';

// İstatistik kartı bileşeni props tipi
interface StatsCardProps {
  title: string;
  value: string;
  diff: number;
  icon: React.ReactNode;
}

export function StatsCard({ title, value, diff, icon }: StatsCardProps) {
  const theme = useMantineTheme();
  const DiffIcon = diff > 0 ? IconArrowUpRight : IconArrowDownRight;
  const diffColor = diff > 0 ? 'teal' : 'red';

  return (
    <Card withBorder p="md" radius="md">
      <Group justify="space-between">
        <Text size="xs" c="dimmed" fw={700} tt="uppercase">
          {title}
        </Text>
        {icon}
      </Group>

      <Group justify="space-between" mt="md">
        <Text size="xl" fw={700}>
          {value}
        </Text>
        <Group gap="xs">
          <Text c={diffColor} fw={700}>
            {diff > 0 ? '+' : ''}{diff}%
          </Text>
          <DiffIcon size="1rem" color={theme.colors[diffColor][6]} />
        </Group>
      </Group>

      <Text size="xs" c="dimmed" mt="md">
        Son 24 saatteki değişim
      </Text>
    </Card>
  );
}
