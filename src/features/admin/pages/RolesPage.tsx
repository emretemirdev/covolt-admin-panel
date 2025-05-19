import { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Table,
  Button,
  Group,
  Text,
  ActionIcon,
  Modal,
  TextInput,
  Textarea,
  MultiSelect,
  LoadingOverlay,
  Badge,
  Paper,
  Alert
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconEdit, IconTrash, IconPlus, IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';
import { DashboardLayout } from '../../dashboard/layouts/DashboardLayout';
import { getAllRoles, createRole, updateRole, deleteRole } from '../api/roleApi';
import { getAllPermissions } from '../api/permissionApi';
import { useAuthorization } from '../../auth/hooks/useAuthorization';
import type { Role, Permission, RoleRequestDto } from '../types';

export function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);

  // Yetkilendirme kontrolü
  const { hasPermission, isLoading: authLoading } = useAuthorization();

  const form = useForm<RoleRequestDto>({
    initialValues: {
      name: '',
      description: '',
      permissionIds: [],
    },
    validate: {
      name: (value) => (value.trim().length < 3 ? 'Rol adı en az 3 karakter olmalıdır' : null),
      description: (value) => (value.trim().length < 5 ? 'Açıklama en az 5 karakter olmalıdır' : null),
    },
  });

  // Rolleri ve izinleri yükle
  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, permissionsData] = await Promise.all([
        getAllRoles(),
        getAllPermissions()
      ]);
      setRoles(rolesData);
      setPermissions(permissionsData);
    } catch (error: any) {
      console.error('Veri yükleme hatası:', error);

      // 403 Forbidden hatası için özel mesaj
      if (error.response?.status === 403) {
        notifications.show({
          title: 'Erişim Reddedildi',
          message: 'Bu sayfaya erişim için gerekli yetkilere sahip değilsiniz. Lütfen sistem yöneticisiyle iletişime geçin.',
          color: 'red',
          autoClose: false,
        });
      } else {
        notifications.show({
          title: 'Hata',
          message: error.message || 'Veriler yüklenirken bir hata oluştu',
          color: 'red',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Rol oluştur veya güncelle
  const handleSubmit = async (values: RoleRequestDto) => {
    setLoading(true);
    try {
      if (editingRole) {
        // Rol güncelleme
        await updateRole(editingRole.id, values);
        notifications.show({
          title: 'Başarılı',
          message: 'Rol başarıyla güncellendi',
          color: 'green',
          icon: <IconCheck size="1.1rem" />,
        });
      } else {
        // Yeni rol oluşturma
        await createRole(values);
        notifications.show({
          title: 'Başarılı',
          message: 'Rol başarıyla oluşturuldu',
          color: 'green',
          icon: <IconCheck size="1.1rem" />,
        });
      }
      // Formu sıfırla ve modalı kapat
      form.reset();
      setModalOpened(false);
      setEditingRole(null);
      // Güncel rolleri yükle
      loadData();
    } catch (error: any) {
      notifications.show({
        title: 'Hata',
        message: error.message,
        color: 'red',
        icon: <IconX size="1.1rem" />,
      });
    } finally {
      setLoading(false);
    }
  };

  // Rol silme
  const handleDeleteRole = async () => {
    if (!roleToDelete) return;

    setLoading(true);
    try {
      await deleteRole(roleToDelete.id);
      notifications.show({
        title: 'Başarılı',
        message: 'Rol başarıyla silindi',
        color: 'green',
        icon: <IconCheck size="1.1rem" />,
      });
      setDeleteModalOpened(false);
      setRoleToDelete(null);
      // Güncel rolleri yükle
      loadData();
    } catch (error: any) {
      notifications.show({
        title: 'Hata',
        message: error.message,
        color: 'red',
        icon: <IconX size="1.1rem" />,
      });
    } finally {
      setLoading(false);
    }
  };

  // Düzenleme modalını aç
  const openEditModal = (role: Role) => {
    setEditingRole(role);
    form.setValues({
      name: role.name.replace('ROLE_', ''), // ROLE_ prefix'ini kaldır
      description: role.description,
      permissionIds: role.permissions.map(p => p.id),
    });
    setModalOpened(true);
  };

  // Yeni rol modalını aç
  const openNewRoleModal = () => {
    setEditingRole(null);
    form.reset();
    setModalOpened(true);
  };

  // Silme modalını aç
  const openDeleteModal = (role: Role) => {
    setRoleToDelete(role);
    setDeleteModalOpened(true);
  };

  // Yetkilendirme kontrolü
  const hasManageRolesPermission = hasPermission('MANAGE_ROLES');
  const isLoading = loading || authLoading;

  return (
    <DashboardLayout>
      <Container size="lg" py="xl">
        <LoadingOverlay visible={isLoading} />

        {!hasManageRolesPermission && !authLoading && (
          <Alert
            icon={<IconAlertCircle size="1rem" />}
            title="Erişim Reddedildi"
            color="red"
            mb="xl"
          >
            Bu sayfaya erişim için gerekli yetkilere sahip değilsiniz. Lütfen sistem yöneticisiyle iletişime geçin.
          </Alert>
        )}

        <Group justify="space-between" mb="xl">
          <Title order={2}>Platform Admin - Rol Yönetimi</Title>
          {hasManageRolesPermission && (
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={openNewRoleModal}
            >
              Yeni Rol Ekle
            </Button>
          )}
        </Group>

        <Paper withBorder p="md" radius="md">
          {roles.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">
              Henüz rol bulunmuyor. Yeni bir rol ekleyin.
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Rol Adı</th>
                  <th>Açıklama</th>
                  <th>İzinler</th>
                  <th style={{ width: 120 }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {roles.map((role) => (
                  <tr key={role.id}>
                    <td>{role.name}</td>
                    <td>{role.description}</td>
                    <td>
                      <Group gap="xs">
                        {role.permissions && role.permissions.length > 0 ? (
                          role.permissions.map(permission => (
                            <Badge key={permission.id} size="sm">
                              {permission.name}
                            </Badge>
                          ))
                        ) : (
                          <Text size="sm" c="dimmed">İzin yok</Text>
                        )}
                      </Group>
                    </td>
                    <td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon color="blue" onClick={() => openEditModal(role)}>
                          <IconEdit size="1rem" />
                        </ActionIcon>
                        <ActionIcon color="red" onClick={() => openDeleteModal(role)}>
                          <IconTrash size="1rem" />
                        </ActionIcon>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Paper>

        {/* Rol Oluşturma/Düzenleme Modalı */}
        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title={editingRole ? "Rolü Düzenle" : "Yeni Rol Oluştur"}
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Rol Adı"
              placeholder="Rol adını girin"
              required
              mb="md"
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Açıklama"
              placeholder="Rol açıklamasını girin"
              required
              mb="md"
              minRows={3}
              {...form.getInputProps('description')}
            />
            <MultiSelect
              label="İzinler"
              placeholder="Rol için izinleri seçin"
              data={permissions.map(p => ({ value: p.id, label: p.name }))}
              mb="xl"
              searchable
              clearable
              {...form.getInputProps('permissionIds')}
            />
            <Group justify="flex-end">
              <Button variant="outline" onClick={() => setModalOpened(false)}>
                İptal
              </Button>
              <Button type="submit">
                {editingRole ? "Güncelle" : "Oluştur"}
              </Button>
            </Group>
          </form>
        </Modal>

        {/* Rol Silme Onay Modalı */}
        <Modal
          opened={deleteModalOpened}
          onClose={() => setDeleteModalOpened(false)}
          title="Rolü Sil"
          size="sm"
        >
          <Text mb="lg">
            <strong>{roleToDelete?.name}</strong> rolünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setDeleteModalOpened(false)}>
              İptal
            </Button>
            <Button color="red" onClick={handleDeleteRole}>
              Sil
            </Button>
          </Group>
        </Modal>
      </Container>
    </DashboardLayout>
  );
}
