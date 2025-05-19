import { Avatar, Box, Group, Text, UnstyledButton, useMantineTheme, rem } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { IconSettings } from '@tabler/icons-react';

export function UserProfile() {
  const { user } = useAuth();
  const theme = useMantineTheme();
  const navigate = useNavigate();

  return (
    <Box
      style={{
        paddingTop: theme.spacing.sm,
        borderTop: `${rem(1)} solid ${theme.colors.dark[4]}`,
      }}
    >
      <UnstyledButton
        style={{
          display: 'block',
          width: '100%',
          padding: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          color: theme.colors.dark[0],
        }}
      >
        <Group>
          <Avatar
            src={null}
            alt={user?.username || 'Kullanıcı'}
            radius="xl"
            color="blue"
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box style={{ flex: 1 }}>
            <Text size="sm" fw={500}>
              {user?.username || 'Kullanıcı'}
            </Text>
            <Text c="dimmed" size="xs">
              {user?.email || 'kullanici@ornek.com'}
            </Text>
          </Box>
        </Group>
      </UnstyledButton>

      <UnstyledButton
        onClick={() => navigate('/dashboard/settings')}
        style={{
          display: 'block',
          width: '100%',
          padding: theme.spacing.xs,
          borderRadius: theme.radius.sm,
          color: theme.colors.dark[0],
          marginTop: theme.spacing.sm,
        }}
      >
        <Group>
          <IconSettings size="1.2rem" stroke={1.5} />
          <Text size="sm">Ayarlar</Text>
        </Group>
      </UnstyledButton>
    </Box>
  );
}
