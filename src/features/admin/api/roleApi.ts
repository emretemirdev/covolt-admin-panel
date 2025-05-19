import axiosInstance from '../../../shared/api/axiosInstance';
import { Role, RoleRequestDto, ApiResponse } from '../types';

// Backend API endpoint'i
const API_URL = '/api/v1/platform-admin/roles';

// Tüm rolleri getir
export const getAllRoles = async (): Promise<Role[]> => {
  try {
    // Backend'in yanıt formatına göre ayarlayın
    const response = await axiosInstance.get<Role[]>(API_URL);

    // Backend doğrudan veriyi döndürüyorsa:
    return response.data;

    // Eğer backend ApiResponse formatında döndürüyorsa:
    // return response.data.data || [];
  } catch (error: any) {
    console.error('Roller alınırken hata:', error);
    const errorMessage = error.response?.data?.message || 'Roller alınırken bir hata oluştu';
    throw new Error(errorMessage);
  }
};

// ID'ye göre rol getir
export const getRoleById = async (id: string): Promise<Role> => {
  try {
    const response = await axiosInstance.get<Role>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Rol alınırken hata:', error);
    const errorMessage = error.response?.data?.message || 'Rol alınırken bir hata oluştu';
    throw new Error(errorMessage);
  }
};

// Yeni rol oluştur
export const createRole = async (roleData: RoleRequestDto): Promise<Role> => {
  try {
    const response = await axiosInstance.post<Role>(API_URL, roleData);
    return response.data;
  } catch (error: any) {
    console.error('Rol oluşturulurken hata:', error);
    const errorMessage = error.response?.data?.message || 'Rol oluşturulurken bir hata oluştu';
    throw new Error(errorMessage);
  }
};

// Rol güncelle
export const updateRole = async (id: string, roleData: RoleRequestDto): Promise<Role> => {
  try {
    const response = await axiosInstance.put<Role>(`${API_URL}/${id}`, roleData);
    return response.data;
  } catch (error: any) {
    console.error('Rol güncellenirken hata:', error);
    const errorMessage = error.response?.data?.message || 'Rol güncellenirken bir hata oluştu';
    throw new Error(errorMessage);
  }
};

// Rol sil
export const deleteRole = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    console.error('Rol silinirken hata:', error);
    const errorMessage = error.response?.data?.message || 'Rol silinirken bir hata oluştu';
    throw new Error(errorMessage);
  }
};

// Role izin ata
export const assignPermissionsToRole = async (roleId: string, permissionIds: string[]): Promise<Role> => {
  try {
    const response = await axiosInstance.post<Role>(
      `${API_URL}/${roleId}/permissions`,
      { permissionIds }
    );
    return response.data;
  } catch (error: any) {
    console.error('İzinler role atanırken hata:', error);
    const errorMessage = error.response?.data?.message || 'İzinler role atanırken bir hata oluştu';
    throw new Error(errorMessage);
  }
};

// Rolden izin kaldır
export const removePermissionsFromRole = async (roleId: string, permissionIds: string[]): Promise<Role> => {
  try {
    const response = await axiosInstance.delete<Role>(
      `${API_URL}/${roleId}/permissions`,
      { data: { permissionIds } }
    );
    return response.data;
  } catch (error: any) {
    console.error('İzinler rolden kaldırılırken hata:', error);
    const errorMessage = error.response?.data?.message || 'İzinler rolden kaldırılırken bir hata oluştu';
    throw new Error(errorMessage);
  }
};
