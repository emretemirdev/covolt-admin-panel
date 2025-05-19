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
  LoadingOverlay,
  Paper,
  Alert
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useForm } from '@mantine/form';
import { IconEdit, IconTrash, IconPlus, IconCheck, IconX, IconAlertCircle } from '@tabler/icons-react';
import { DashboardLayout } from '../../dashboard/layouts/DashboardLayout';
import { getAllPermissions, createPermission, updatePermission, deletePermission } from '../api/permissionApi';
import { useAuthorization } from '../../auth/hooks/useAuthorization';
import type { Permission, PermissionRequestDto } from '../types';

export function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpened, setModalOpened] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [deleteModalOpened, setDeleteModalOpened] = useState(false);
  const [permissionToDelete, setPermissionToDelete] = useState<Permission | null>(null);

  // Yetkilendirme kontrolü
  const { hasPermission, isLoading: authLoading } = useAuthorization();

  const form = useForm<PermissionRequestDto>({
    initialValues: {
      name: '',
      description: '',
    },
    validate: {
      name: (value) => (value.trim().length < 3 ? 'İzin adı en az 3 karakter olmalıdır' : null),
      description: (value) => (value.trim().length < 5 ? 'Açıklama en az 5 karakter olmalıdır' : null),
    },
  });

  // İzinleri yükle
  const loadPermissions = async () => {
    setLoading(true);
    try {
      const data = await getAllPermissions();
      setPermissions(data);
    } catch (error: any) {
      console.error('İzinleri yükleme hatası:', error);

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
          message: error.message || 'İzinler yüklenirken bir hata oluştu',
          color: 'red',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPermissions();
  }, []);

  // İzin oluştur veya güncelle
  const handleSubmit = async (values: PermissionRequestDto) => {
    setLoading(true);
    try {
      if (editingPermission) {
        // İzin güncelleme
        await updatePermission(editingPermission.id, values);
        notifications.show({
          title: 'Başarılı',
          message: 'İzin başarıyla güncellendi',
          color: 'green',
          icon: <IconCheck size="1.1rem" />,
        });
      } else {
        // Yeni izin oluşturma
        await createPermission(values);
        notifications.show({
          title: 'Başarılı',
          message: 'İzin başarıyla oluşturuldu',
          color: 'green',
          icon: <IconCheck size="1.1rem" />,
        });
      }
      // Formu sıfırla ve modalı kapat
      form.reset();
      setModalOpened(false);
      setEditingPermission(null);
      // Güncel izinleri yükle
      loadPermissions();
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

  // İzin silme
  const handleDeletePermission = async () => {
    if (!permissionToDelete) return;

    setLoading(true);
    try {
      await deletePermission(permissionToDelete.id);
      notifications.show({
        title: 'Başarılı',
        message: 'İzin başarıyla silindi',
        color: 'green',
        icon: <IconCheck size="1.1rem" />,
      });
      setDeleteModalOpened(false);
      setPermissionToDelete(null);
      // Güncel izinleri yükle
      loadPermissions();
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
  const openEditModal = (permission: Permission) => {
    setEditingPermission(permission);
    form.setValues({
      name: permission.name,
      description: permission.description,
    });
    setModalOpened(true);
  };

  // Yeni izin modalını aç
  const openNewPermissionModal = () => {
    setEditingPermission(null);
    form.reset();
    setModalOpened(true);
  };

  // Silme modalını aç
  const openDeleteModal = (permission: Permission) => {
    setPermissionToDelete(permission);
    setDeleteModalOpened(true);
  };

  // Yetkilendirme kontrolü
  const hasManagePermissionsPermission = hasPermission('MANAGE_PERMISSIONS');
  const isLoading = loading || authLoading;

  return (
    <DashboardLayout>
      <Container size="lg" py="xl">
        <LoadingOverlay visible={isLoading} />

        {!hasManagePermissionsPermission && !authLoading && (
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
          <Title order={2}>Platform Admin - İzin Yönetimi</Title>
          {hasManagePermissionsPermission && (
            <Button
              leftSection={<IconPlus size="1rem" />}
              onClick={openNewPermissionModal}
            >
              Yeni İzin Ekle
            </Button>
          )}
        </Group>

        <Paper withBorder p="md" radius="md">
          {permissions.length === 0 ? (
            <Text ta="center" c="dimmed" py="xl">
              Henüz izin bulunmuyor. Yeni bir izin ekleyin.
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>İzin Adı</th>
                  <th>Açıklama</th>
                  <th style={{ width: 120 }}>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((permission) => (
                  <tr key={permission.id}>
                    <td>{permission.name}</td>
                    <td>{permission.description}</td>
                    <td>
                      <Group gap="xs" justify="flex-end">
                        <ActionIcon color="blue" onClick={() => openEditModal(permission)}>
                          <IconEdit size="1rem" />
                        </ActionIcon>
                        <ActionIcon color="red" onClick={() => openDeleteModal(permission)}>
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

        {/* İzin Oluşturma/Düzenleme Modalı */}
        <Modal
          opened={modalOpened}
          onClose={() => setModalOpened(false)}
          title={editingPermission ? "İzni Düzenle" : "Yeni İzin Oluştur"}
          size="lg"
        >
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="İzin Adı"
              placeholder="İzin adını girin"
              required
              mb="md"
              {...form.getInputProps('name')}
            />
            <Textarea
              label="Açıklama"
              placeholder="İzin açıklamasını girin"
              required
              mb="xl"
              minRows={3}
              {...form.getInputProps('description')}
            />
            <Group justify="flex-end">
              <Button variant="outline" onClick={() => setModalOpened(false)}>
                İptal
              </Button>
              <Button type="submit">
                {editingPermission ? "Güncelle" : "Oluştur"}
              </Button>
            </Group>
          </form>
        </Modal>

        {/* İzin Silme Onay Modalı */}
        <Modal
          opened={deleteModalOpened}
          onClose={() => setDeleteModalOpened(false)}
          title="İzni Sil"
          size="sm"
        >
          <Text mb="lg">
            <strong>{permissionToDelete?.name}</strong> iznini silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </Text>
          <Group justify="flex-end">
            <Button variant="outline" onClick={() => setDeleteModalOpened(false)}>
              İptal
            </Button>
            <Button color="red" onClick={handleDeletePermission}>
              Sil
            </Button>
          </Group>
        </Modal>
      </Container>
    </DashboardLayout>
  );
}
