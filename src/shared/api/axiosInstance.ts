import axios from 'axios';
import { API_BASE_URL } from '../config/index.ts'; // Ortam değişkeninden gelecek

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token'ı her istekle göndermek için interceptor (Auth sağlandıktan sonra eklenecek)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken'); // Veya state'ten alınacak
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Yanıt interceptor'u (Örn: 401 Unauthorized durumunda logout işlemi)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && error.response.status === 401) {
      // TODO: Yetkisiz erişim durumunda logout işlemini tetikle
      // Örneğin: authService.logout();
      // window.location.href = '/login'; // veya router ile yönlendir
      console.error('Unauthorized access - 401. Logging out.');
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;