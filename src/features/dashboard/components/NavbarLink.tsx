import { Group, Text, UnstyledButton, useMantineTheme } from '@mantine/core';

// Navbar link tipi
interface NavbarLinkProps {
  icon: React.FC<any>;
  label: string;
  active?: boolean;
  onClick?(): void;
}

// Navbar link bileşeni
export function NavbarLink({ icon: Icon, label, active, onClick }: NavbarLinkProps) {
  const theme = useMantineTheme();
  
  return (
    <UnstyledButton
      onClick={onClick}
      style={{
        display: 'block',
        width: '100%',
        padding: theme.spacing.xs,
        borderRadius: theme.radius.sm,
        color: theme.colors.dark[0],
        backgroundColor: active
          ? theme.colors.blue[7]
          : 'transparent',
        '&:hover': {
          backgroundColor: theme.colors.dark[6],
        },
      }}
    >
      <Group>
        <Icon size="1.2rem" stroke={1.5} />
        <Text size="sm">{label}</Text>
      </Group>
    </UnstyledButton>
  );
}
