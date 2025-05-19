import { useState } from 'react';
import {
  AppShell,
  Burger,
  Text,
  Group,
  ActionIcon,
  Stack,
  TextInput
} from '@mantine/core';
import {
  IconHome,
  IconGauge,
  IconUser,
  IconAdjustments,
  IconSun,
  IconMoon,
  IconSearch
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { notifications } from '@mantine/notifications';
import { NavbarLink } from '../components/NavbarLink';
import { UserProfile } from '../../users/components/UserProfile';
import { UserMenu } from '../../users/components/UserMenu';
import { useTheme } from '../../../shared/providers/ThemeProvider';
import type { ReactNode } from 'react';

// Ana layout bileşeni
interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [opened, setOpened] = useState(false);
  const [active, setActive] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { colorScheme, toggleColorScheme } = useTheme();
  const isDark = colorScheme === 'dark';

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Burada arama işlemi yapılabilir
      notifications.show({
        title: 'Arama',
        message: `"${searchQuery}" için arama yapılıyor...`,
        color: 'blue',
        autoClose: 2000,
      });
      // Örnek: navigate(`/dashboard/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Navbar linkleri
  const navbarLinks = [
    { icon: IconHome, label: 'Ana Sayfa', path: '/dashboard' },
    { icon: IconGauge, label: 'İstatistikler', path: '/dashboard/stats' },
    { icon: IconUser, label: 'Kullanıcılar', path: '/dashboard/users' },
    { icon: IconUser, label: 'Rol Yönetimi', path: '/dashboard/roles' },
    { icon: IconAdjustments, label: 'İzin Yönetimi', path: '/dashboard/permissions' },
    { icon: IconAdjustments, label: 'Ayarlar', path: '/dashboard/settings' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header p="md">
        <Group justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={() => setOpened((o) => !o)}
              hiddenFrom="sm"
              size="sm"
            />
            <Text fw={700} size="lg">Covolt Admin Panel</Text>
          </Group>

          <TextInput
            placeholder="Ara..."
            leftSection={<IconSearch size="1rem" />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.currentTarget.value)}
            onKeyDown={handleSearch}
            style={{ width: '300px' }}
            visibleFrom="sm"
          />

          <Group>
            <ActionIcon
              variant="default"
              size="lg"
              onClick={toggleColorScheme}
              aria-label="Tema Değiştir"
            >
              {isDark ? <IconSun size="1.2rem" stroke={1.5} /> : <IconMoon size="1.2rem" stroke={1.5} />}
            </ActionIcon>


            <UserMenu />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          <Stack gap="xs">
            {navbarLinks.map((link, index) => (
              <NavbarLink
                key={link.label}
                icon={link.icon}
                label={link.label}
                active={index === active && active < navbarLinks.length}
                onClick={() => {
                  setActive(index);
                  navigate(link.path);
                  setOpened(false);
                }}
              />
            ))}
          </Stack>
        </AppShell.Section>



        <AppShell.Section>
          <UserProfile />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
