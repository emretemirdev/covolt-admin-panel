import axiosInstance from '../../../shared/api/axiosInstance';
import { Permission, PermissionRequestDto, ApiResponse } from '../types';

// Backend API endpoint'i
const API_URL = '/api/v1/platform-admin/permissions';

// Tüm izinleri getir
export const getAllPermissions = async (): Promise<Permission[]> => {
  try {
    const response = await axiosInstance.get<Permission[]>(API_URL);
    return response.data;
  } catch (error: any) {
    console.error('İzinler alınırken hata:', error);
    const errorMessage = error.response?.data?.message || 'İzinler alınırken bir hata oluştu';
    throw new Error(errorMessage);
  }
};

// ID'ye göre izin getir
export const getPermissionById = async (id: string): Promise<Permission> => {
  try {
    const response = await axiosInstance.get<Permission>(`${API_URL}/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('İzin alınırken hata:', error);
    const errorMessage = error.response?.data?.message || 'İzin alınırken bir hata oluştu';
    throw new Error(errorMessage);
  }
};

// Yeni izin oluştur
export const createPermission = async (permissionData: PermissionRequestDto): Promise<Permission> => {
  try {
    const response = await axiosInstance.post<Permission>(API_URL, permissionData);
    return response.data;
  } catch (error: any) {
    console.error('İzin oluşturulurken hata:', error);
    const errorMessage = error.response?.data?.message || 'İzin oluşturulurken bir hata oluştu';
    throw new Error(errorMessage);
  }
};

// İzin güncelle
export const updatePermission = async (id: string, permissionData: PermissionRequestDto): Promise<Permission> => {
  try {
    const response = await axiosInstance.put<Permission>(`${API_URL}/${id}`, permissionData);
    return response.data;
  } catch (error: any) {
    console.error('İzin güncellenirken hata:', error);
    const errorMessage = error.response?.data?.message || 'İzin güncellenirken bir hata oluştu';
    throw new Error(errorMessage);
  }
};

// İzin sil
export const deletePermission = async (id: string): Promise<void> => {
  try {
    await axiosInstance.delete(`${API_URL}/${id}`);
  } catch (error: any) {
    console.error('İzin silinirken hata:', error);
    const errorMessage = error.response?.data?.message || 'İzin silinirken bir hata oluştu';
    throw new Error(errorMessage);
  }
};
