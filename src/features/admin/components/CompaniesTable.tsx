import { useState, useEffect } from 'react';
import {
  Table,
  Group,
  Text,
  ActionIcon,
  Badge,
  Pagination,
  Select,
  TextInput,
  Paper,
  Button,
  Menu,
  Loader,
  Alert
} from '@mantine/core';
import {
  IconEdit,
  IconTrash,
  IconDots,
  IconSearch,
  IconCheck,
  IconX,
  IconAlertCircle
} from '@tabler/icons-react';
import { getCompanies, updateCompanyStatus } from '../api/companyApi';
import { Company, CompaniesResponse } from '../types/company';
import { notifications } from '@mantine/notifications';

export function CompaniesTable() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Sayfalama için state
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  // Filtreleme için state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Sıralama için state
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Şirketleri yükle
  const loadCompanies = async () => {
    setLoading(true);
    setError(null);

    try {
      const sort = `${sortField},${sortDirection}`;
      const response = await getCompanies(page, pageSize, sort);

      // API yanıtını logla
      console.log('API Yanıtı (Ham):', response);
      console.log('API Yanıtı (JSON):', JSON.stringify(response, null, 2));

      // API yanıtını kontrol et
      if (response.content) {
        // Spring Data JPA Pageable yanıtı
        setCompanies(response.content);
        setTotalPages(response.totalPages || 1);
        setTotalItems(response.totalElements || 0);
      } else if (Array.isArray(response)) {
        // Eğer yanıt doğrudan bir dizi ise
        setCompanies(response);
        setTotalPages(1);
        setTotalItems(response.length);
      } else if (response.data && Array.isArray(response.data)) {
        // Eğer yanıt { data: [...] } formatında ise
        setCompanies(response.data);
        setTotalPages(1);
        setTotalItems(response.data.length);
      } else if (response.companies && Array.isArray(response.companies)) {
        // Eğer yanıt { companies: [...] } formatında ise
        setCompanies(response.companies);
        setTotalPages(1);
        setTotalItems(response.companies.length);
      } else if (response.items && Array.isArray(response.items)) {
        // Eğer yanıt { items: [...] } formatında ise
        setCompanies(response.items);
        setTotalPages(1);
        setTotalItems(response.items.length);
      } else {
        console.error('Beklenmeyen API yanıtı:', response);
        setError('Şirket verileri beklenmeyen formatta');
      }
    } catch (err: any) {
      console.error('Şirketler yüklenirken hata:', err);
      setError(err.message || 'Şirketler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Şirket durumunu güncelle
  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await updateCompanyStatus(id, newStatus);

      // Başarılı bildirim göster
      notifications.show({
        title: 'Durum Güncellendi',
        message: 'Şirket durumu başarıyla güncellendi',
        color: 'green',
      });

      // Tabloyu yenile
      loadCompanies();
    } catch (err: any) {
      console.error('Durum güncellenirken hata:', err);

      // Hata bildirimi göster
      notifications.show({
        title: 'Hata',
        message: err.message || 'Şirket durumu güncellenirken bir hata oluştu',
        color: 'red',
      });
    }
  };

  // Sayfa değiştiğinde şirketleri yeniden yükle
  useEffect(() => {
    loadCompanies();
  }, [page, pageSize, sortField, sortDirection]);

  // Durum badge'i için renk belirle
  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'green';
      case 'SUSPENDED':
        return 'red';
      case 'PENDING_VERIFICATION':
        return 'yellow';
      case 'DELETED':
        return 'gray';
      default:
        return 'blue';
    }
  };

  // Sıralama değiştir
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Arama yap
  const handleSearch = () => {
    loadCompanies();
  };

  return (
    <Paper p="md" withBorder>
      {error && (
        <Alert icon={<IconAlertCircle size="1rem" />} color="red" mb="md">
          {error}
        </Alert>
      )}

      <Group mb="md" position="apart">
        <TextInput
          placeholder="Şirket ara..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          rightSection={
            <ActionIcon onClick={handleSearch}>
              <IconSearch size="1rem" />
            </ActionIcon>
          }
          style={{ width: '300px' }}
        />

        <Select
          placeholder="Duruma göre filtrele"
          value={statusFilter}
          onChange={setStatusFilter}
          data={[
            { value: '', label: 'Tümü' },
            { value: 'ACTIVE', label: 'Aktif' },
            { value: 'SUSPENDED', label: 'Askıya Alınmış' },
            { value: 'PENDING_VERIFICATION', label: 'Doğrulama Bekliyor' },
            { value: 'DELETED', label: 'Silinmiş' },
          ]}
          style={{ width: '200px' }}
        />

        <Button onClick={() => loadCompanies()}>Yenile</Button>
      </Group>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <Loader />
        </div>
      ) : (
        <>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('id')}>
                  ID {sortField === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('name')}>
                  Şirket Adı {sortField === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('identifier')}>
                  Tanımlayıcı {sortField === 'identifier' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('contactEmail')}>
                  E-posta {sortField === 'contactEmail' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('contactPhone')}>
                  Telefon {sortField === 'contactPhone' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('status')}>
                  Durum {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('subscriptionPlan')}>
                  Abonelik {sortField === 'subscriptionPlan' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{ cursor: 'pointer' }} onClick={() => handleSort('createdAt')}>
                  Oluşturulma Tarihi {sortField === 'createdAt' && (sortDirection === 'asc' ? '↑' : '↓')}
                </th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {companies.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center' }}>
                    Şirket bulunamadı
                  </td>
                </tr>
              ) : (
                companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.id.substring(0, 8)}...</td>
                    <td>{company.name}</td>
                    <td>{company.identifier || '-'}</td>
                    <td>{company.contactEmail || '-'}</td>
                    <td>{company.contactPhone || '-'}</td>
                    <td>
                      <Badge color={getStatusColor(company.status || '')}>
                        {company.status || 'Bilinmiyor'}
                      </Badge>
                    </td>
                    <td>
                      {company.subscriptionPlan ? (
                        <Badge color={company.subscriptionStatus === 'ACTIVE' ? 'green' : company.subscriptionStatus === 'TRIAL' ? 'blue' : 'gray'}>
                          {company.subscriptionPlan}
                        </Badge>
                      ) : '-'}
                    </td>
                    <td>{company.createdAt ? new Date(company.createdAt).toLocaleDateString() : '-'}</td>
                    <td>
                      <Group spacing={0} position="right">
                        <Menu withinPortal position="bottom-end" shadow="sm">
                          <Menu.Target>
                            <ActionIcon>
                              <IconDots size="1rem" stroke={1.5} />
                            </ActionIcon>
                          </Menu.Target>
                          <Menu.Dropdown>
                            <Menu.Item icon={<IconEdit size="1rem" stroke={1.5} />}>
                              Düzenle
                            </Menu.Item>
                            <Menu.Item
                              icon={<IconCheck size="1rem" stroke={1.5} />}
                              onClick={() => handleStatusChange(company.id, 'ACTIVE')}
                            >
                              Aktif Yap
                            </Menu.Item>
                            <Menu.Item
                              icon={<IconX size="1rem" stroke={1.5} />}
                              onClick={() => handleStatusChange(company.id, 'SUSPENDED', 'Yönetici tarafından askıya alındı')}
                              color="red"
                            >
                              Askıya Al
                            </Menu.Item>
                          </Menu.Dropdown>
                        </Menu>
                      </Group>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>

          <Group position="apart" mt="md">
            <Text size="sm">
              Toplam {totalItems} şirket, {page + 1}/{totalPages} sayfa
            </Text>
            <Pagination
              total={totalPages}
              value={page + 1}
              onChange={(value) => setPage(value - 1)}
            />
          </Group>
        </>
      )}
    </Paper>
  );
}
