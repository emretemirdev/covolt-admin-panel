import axios from 'axios';
import { API_BASE_URL } from '../config/index.ts'; // Ortam değişkeninden gelecek

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token'ı her istekle göndermek için interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`API İsteği: ${config.method?.toUpperCase()} ${config.url}`, 'Token:', token.substring(0, 15) + '...');
    } else {
      console.warn(`API İsteği: ${config.method?.toUpperCase()} ${config.url}`, 'Token bulunamadı!');
    }
    return config;
  },
  (error) => {
    console.error('API İstek Hatası:', error);
    return Promise.reject(error);
  }
);

// İstek yeniden deneme mekanizması için değişkenler
let isRefreshing = false;
let failedQueue: { resolve: (value: unknown) => void; reject: (reason?: any) => void }[] = [];

// Bekleyen istekleri işle
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Yanıt interceptor'u (401 Unauthorized durumunda token yenileme)
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`API Yanıtı: ${response.config.method?.toUpperCase()} ${response.config.url}`, 'Status:', response.status);
    return response;
  },
  async (error) => {
    console.error('API Yanıt Hatası:', error.response?.status, error.response?.data, error.config?.url);
    const originalRequest = error.config;

    // Token yenileme isteği başarısız olursa veya yenileme isteği zaten yapılmışsa
    if (error.response?.status === 401 && originalRequest._retry) {
      // Tüm token'ları temizle ve login sayfasına yönlendir
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('tokenExpiresAt');
      window.location.href = '/login';
      return Promise.reject(error);
    }

    // 403 Forbidden hatası - Yetkilendirme sorunu
    if (error.response?.status === 403) {
      console.error('403 Forbidden: Bu API için yetkiniz yok!', originalRequest.url);
      // Kullanıcıya bildirim gösterilebilir
      // notifications.show({
      //   title: 'Erişim Reddedildi',
      //   message: 'Bu işlem için yetkiniz bulunmuyor.',
      //   color: 'red',
      // });
    }

    // 401 hatası ve henüz yeniden denenmemişse
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Eğer token yenileme işlemi zaten devam ediyorsa, bu isteği kuyruğa ekle
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Refresh token'ı al
        const refreshToken = sessionStorage.getItem('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Token yenileme isteği yap
        const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken: refreshToken
        });

        const { accessToken, refreshToken: newRefreshToken, expiresAt } = response.data;

        // Yeni token'ları sessionStorage'a kaydet
        sessionStorage.setItem('accessToken', accessToken);
        sessionStorage.setItem('refreshToken', newRefreshToken);
        sessionStorage.setItem('tokenExpiresAt', expiresAt);

        // Bekleyen istekleri işle
        processQueue(null, accessToken);

        // Orijinal isteği yeni token ile tekrar dene
        originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Token yenileme başarısız olursa
        processQueue(refreshError, null);

        // Tüm token'ları temizle ve login sayfasına yönlendir
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('tokenExpiresAt');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;