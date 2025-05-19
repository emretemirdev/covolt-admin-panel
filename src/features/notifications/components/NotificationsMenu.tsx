import { useState } from 'react';
import { Menu, Indicator, ActionIcon, Text, Box, Divider, useMantineTheme } from '@mantine/core';
import { IconBellRinging, IconMessage, IconCalendarEvent, IconAlertCircle, IconDots } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

// Bildirim tipi
interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: React.ReactNode;
  color: string;
}

interface NotificationsMenuProps {
  items?: NotificationItem[];
}

export function NotificationsMenu({ 
  items = [
    { 
      id: 1, 
      title: 'Yeni Mesaj', 
      message: 'Ahmet Yılmaz size bir mesaj gönderdi', 
      time: '10 dk önce',
      icon: <IconMessage size="1.2rem" />,
      color: 'blue' 
    },
    { 
      id: 2, 
      title: 'Toplantı Hatırlatması', 
      message: 'Ekip toplantısı 30 dakika içinde başlayacak', 
      time: '30 dk önce',
      icon: <IconCalendarEvent size="1.2rem" />,
      color: 'green' 
    },
    { 
      id: 3, 
      title: 'Sistem Uyarısı', 
      message: 'Sunucu bakımı yarın 02:00-04:00 arasında yapılacak', 
      time: '2 saat önce',
      icon: <IconAlertCircle size="1.2rem" />,
      color: 'orange' 
    }
  ]
}: NotificationsMenuProps) {
  const [opened, setOpened] = useState(false);
  const navigate = useNavigate();
  const theme = useMantineTheme();

  return (
    <Menu 
      position="bottom-end" 
      width={320}
      opened={opened}
      onChange={setOpened}
    >
      <Menu.Target>
        <Indicator color="red" size={10} offset={4} disabled={items.length === 0}>
          <ActionIcon variant="default" size="lg" aria-label="Bildirimler">
            <IconBellRinging size="1.2rem" stroke={1.5} />
          </ActionIcon>
        </Indicator>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label fw={500}>Bildirimler ({items.length})</Menu.Label>
        {items.map((item) => (
          <Menu.Item
            key={item.id}
            leftSection={
              <Box style={{ color: theme.colors[item.color][6] }}>
                {item.icon}
              </Box>
            }
          >
            <div>
              <Text size="sm" fw={500}>{item.title}</Text>
              <Text size="xs" c="dimmed">{item.message}</Text>
              <Text size="xs" c="dimmed" fs="italic" mt={4}>{item.time}</Text>
            </div>
          </Menu.Item>
        ))}
        <Divider my="xs" />
        <Menu.Item 
          leftSection={<IconDots size="1rem" />}
          onClick={() => navigate('/dashboard/notifications')}
        >
          Tüm bildirimleri görüntüle
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
