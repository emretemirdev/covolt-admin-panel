// Rol tipi
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  // Backend'in döndürdüğü diğer alanları ekleyin
  createdAt?: string;
  updatedAt?: string;
}

// İzin tipi
export interface Permission {
  id: string;
  name: string;
  description: string;
  // Backend'in döndürdüğü diğer alanları ekleyin
  createdAt?: string;
  updatedAt?: string;
}

// Rol oluşturma/güncelleme isteği
export interface RoleRequestDto {
  name: string;
  description: string;
  permissionIds?: string[];
}

// İzin oluşturma/güncelleme isteği
export interface PermissionRequestDto {
  name: string;
  description: string;
}

// API yanıt tipi
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
