import type { UserCredentials, RegisterCredentials, LogoutRequestPayload } from '../types';
import axiosInstance from '../../../shared/api/axiosInstance';

// Vite'da çevre değişkenleri import.meta.env ile kullanılır
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function loginUser(credentials: UserCredentials) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Giriş başarısız oldu');
  }

  return response.json();
}

export async function registerUser(credentials: RegisterCredentials) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Kayıt başarısız oldu');
  }

  return response.json();
}

export const logoutUser = async (payload: LogoutRequestPayload): Promise<void> => {
    try {
        await axiosInstance.post('/api/auth/logout', payload);
        // Başarılı logout durumunda backend genellikle 200 OK veya 204 No Content döner.
    } catch (error: any) {
        // Logout hatası genellikle kritik değil, ama loglanabilir.
        console.error('Logout API call failed:', error);
        // Token'lar zaten client-side'da silineceği için, bu hatayı kullanıcıya göstermeyebiliriz.
        // Ancak, sunucu tarafında session/token geçersiz kılma işlemi başarısız olduysa bu bir sorundur.
        throw new Error('Çıkış işlemi sırasında bir sorun oluştu.');
    }
};

// TODO: Refresh token endpoint'i için fonksiyon (/api/auth/refresh)
// export const refreshToken = async (refreshTokenValue: string): Promise<AuthResponsePayload> => { ... }