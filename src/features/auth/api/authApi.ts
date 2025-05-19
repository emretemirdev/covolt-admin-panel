import type { UserCredentials, RegisterCredentials, LogoutRequestPayload, AuthResponsePayload } from '../types/index.ts';
import axiosInstance from '../../../shared/api/axiosInstance';

export async function loginUser(credentials: UserCredentials): Promise<AuthResponsePayload> {
  try {
    const response = await axiosInstance.post('/api/auth/login', credentials);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Giriş başarısız oldu';
    throw new Error(errorMessage);
  }
}

export async function registerUser(credentials: RegisterCredentials): Promise<AuthResponsePayload> {
  try {
    const response = await axiosInstance.post('/api/auth/register', credentials);
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Kayıt başarısız oldu';
    throw new Error(errorMessage);
  }
}

export const logoutUser = async (payload: LogoutRequestPayload): Promise<void> => {
    try {
        await axiosInstance.post('/api/auth/logout', payload);
        // Başarılı logout durumunda backend genellikle 200 OK veya 204 No Content döner.
    } catch (error: any) {
        // Logout hatası genellikle kritik değil, ama loglanabilir.
        // Token'lar zaten client-side'da silineceği için, bu hatayı kullanıcıya göstermeyebiliriz.
        // Ancak, sunucu tarafında session/token geçersiz kılma işlemi başarısız olduysa bu bir sorundur.
        throw new Error('Çıkış işlemi sırasında bir sorun oluştu.');
    }
};

// Refresh token endpoint'i için fonksiyon
export const refreshToken = async (refreshTokenValue: string): Promise<AuthResponsePayload> => {
  try {
    const response = await axiosInstance.post('/api/auth/refresh', { refreshToken: refreshTokenValue });
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Token yenileme başarısız oldu';
    throw new Error(errorMessage);
  }
}