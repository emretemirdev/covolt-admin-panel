import axiosInstance from '../../../shared/api/axiosInstance';
import { Company, CompaniesResponse } from '../types/company';

// Şirketleri getiren fonksiyon
export const getCompanies = async (
  page: number = 0,
  size: number = 10,
  sort: string = 'name,asc',
  status?: string,
  name?: string,
  type?: string
): Promise<CompaniesResponse> => {
  try {
    const params: Record<string, any> = {
      page,
      size,
      sort
    };

    // Opsiyonel filtreleme parametreleri
    if (status) params.status = status;
    if (name) params.name = name;
    if (type) params.type = type;

    const response = await axiosInstance.get('/api/v1/platform-admin/companies', {
      params
    });

    console.log('Şirketler API yanıtı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Şirketler alınırken hata oluştu:', error);
    throw error;
  }
};

// Aktif şirketlerin sayısını getiren fonksiyon
export const getActiveCompaniesCount = async (): Promise<number> => {
  try {
    const response = await getCompanies(0, 1, 'name,asc', 'ACTIVE');
    return response.totalElements || 0;
  } catch (error) {
    console.error('Aktif şirket sayısı alınırken hata oluştu:', error);
    return 0;
  }
};

// Şirket istatistiklerini getiren fonksiyon
export const getCompanyStatistics = async (): Promise<{
  totalCompanies: number;
  activeCompanies: number;
  suspendedCompanies: number;
  pendingVerificationCompanies: number;
  growthRate: number;
}> => {
  try {
    // Tüm şirketleri getir
    const allCompaniesResponse = await getCompanies(0, 1);
    const totalCompanies = allCompaniesResponse.totalElements || 0;

    // Aktif şirketleri getir
    const activeCompaniesResponse = await getCompanies(0, 1, 'name,asc', 'ACTIVE');
    const activeCompanies = activeCompaniesResponse.totalElements || 0;

    // Askıya alınmış şirketleri getir
    const suspendedCompaniesResponse = await getCompanies(0, 1, 'name,asc', 'SUSPENDED');
    const suspendedCompanies = suspendedCompaniesResponse.totalElements || 0;

    // Doğrulama bekleyen şirketleri getir
    const pendingCompaniesResponse = await getCompanies(0, 1, 'name,asc', 'PENDING_VERIFICATION');
    const pendingVerificationCompanies = pendingCompaniesResponse.totalElements || 0;

    // Büyüme oranı (örnek olarak %5 ile %15 arasında rastgele bir değer)
    const growthRate = Math.floor(Math.random() * 10) + 5;

    return {
      totalCompanies,
      activeCompanies,
      suspendedCompanies,
      pendingVerificationCompanies,
      growthRate
    };
  } catch (error) {
    console.error('Şirket istatistikleri alınırken hata oluştu:', error);
    return {
      totalCompanies: 0,
      activeCompanies: 0,
      suspendedCompanies: 0,
      pendingVerificationCompanies: 0,
      growthRate: 0
    };
  }
};

// Tek bir şirketi ID'ye göre getiren fonksiyon
export const getCompanyById = async (id: string): Promise<Company> => {
  try {
    const response = await axiosInstance.get(`/api/v1/platform-admin/companies/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Şirket (ID: ${id}) alınırken hata oluştu:`, error);
    throw error;
  }
};

// Şirket durumunu güncelleyen fonksiyon
export const updateCompanyStatus = async (id: string, status: string, reason?: string): Promise<Company> => {
  try {
    const response = await axiosInstance.patch(`/api/v1/platform-admin/companies/${id}/status`, {
      status,
      reason
    });
    return response.data;
  } catch (error) {
    console.error(`Şirket durumu (ID: ${id}) güncellenirken hata oluştu:`, error);
    throw error;
  }
};
