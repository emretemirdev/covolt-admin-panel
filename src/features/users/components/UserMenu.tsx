import { Menu, ActionIcon, Avatar, Divider } from '@mantine/core';
import { IconUser, IconSettings, IconLogout } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/hooks/useAuth';
import { notifications } from '@mantine/notifications';
import { IconCheck } from '@tabler/icons-react';

export function UserMenu() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    
    // Çıkış bildirimi göster
    notifications.show({
      title: 'Çıkış Yapıldı',
      message: 'Başarıyla çıkış yaptınız. Güvenli bir şekilde oturumunuz sonlandırıldı.',
      color: 'blue',
      icon: <IconCheck size="1.1rem" />,
      autoClose: 3000,
    });
    
    navigate('/login');
  };

  return (
    <Menu position="bottom-end" width={200}>
      <Menu.Target>
        <ActionIcon variant="default" size="lg" aria-label="Profil">
          <Avatar
            size="sm"
            src={null}
            color="blue"
            radius="xl"
          >
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </Avatar>
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>Profil</Menu.Label>
        <Menu.Item leftSection={<IconUser size="1rem" />} onClick={() => navigate('/dashboard/profile')}>
          Profilim
        </Menu.Item>
        <Menu.Item leftSection={<IconSettings size="1rem" />} onClick={() => navigate('/dashboard/settings')}>
          Ayarlar
        </Menu.Item>
        <Divider my="xs" />
        <Menu.Item 
          leftSection={<IconLogout size="1rem" />} 
          color="red"
          onClick={handleLogout}
        >
          Çıkış Yap
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
