// src/features/auth/provider/AuthProvider.tsx

import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
// AuthContextType importunu güncelledik
import type { User, AuthState, AuthContextType, AuthResponsePayload } from '../types/index.ts';
import { jwtDecode } from 'jwt-decode';
import { logoutUser } from '../api/authApi.ts';

// JWT'den decode edilecek payload için bir interface (API'nizin JWT içeriğine göre özelleştirin)
// API'nizin subject (sub) alanını id olarak kullanıp kullanmadığını doğrulayın
interface DecodedToken {
  sub: string; // Genellikle kullanıcı ID'si (subject)
  email: string;
  username: string; // OpenAPI User şemasındaki username
  // fullName?: string; // JWT'niz fullName içeriyorsa
  // roles?: string[]; // JWT'niz roller içeriyorsa
  iat: number;
  exp: number; // Tokenın son kullanma tarihi (Unix timestamp olarak)
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  tokenExpiresAt: null, // Başlangıçta null
  isLoading: true,
  error: null,
};

// Context tanımı aynı kalır
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  // Otomatik giriş denemesi - sayfa yüklendiğinde localStorage'ı kontrol eder
  const attemptAutoLogin = useCallback(() => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: true }));
    const token = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');
    const storedExpiresAt = localStorage.getItem('tokenExpiresAt'); // Backendden gelen değeri alacak

    if (token && storedRefreshToken && storedExpiresAt) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);

        // Tokenın geçerlilik süresinin dolup dolmadığını burada kontrol edebiliriz
        // decodedToken.exp Unix timestamp'tir, Date.now() milisaniyedir.
        const currentTime = Date.now() / 1000; // Saniyeye çevir
        if (decodedToken.exp < currentTime) {
            console.warn("Access token expired. Attempting to use refresh token (TODO).");
            // TODO: Burada refresh token ile yeni token alma mantığı devreye girmeli
            // Şimdilik süresi dolmuşsa tokenları temizleyip login sayfasına yönlendiriyoruz.
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('tokenExpiresAt');
            // localStorage.removeItem('user'); // user token'dan alınıyor
            setAuthState((prev: AuthState) => ({ ...prev, ...initialState, isLoading: false, error: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın." }));
            return; // İşlemi durdur
        }

        const userFromToken: User = {
          id: decodedToken.sub,
          email: decodedToken.email,
          username: decodedToken.username,
          // fullName: decodedToken.fullName, // Eğer token'da varsa
          // ... token'dan alabileceğiniz diğer kullanıcı bilgileri
        };

        setAuthState({
          isAuthenticated: true,
          user: userFromToken,
          accessToken: token,
          refreshToken: storedRefreshToken,
          tokenExpiresAt: storedExpiresAt, // Backendden gelen değeri kullan
          isLoading: false,
          error: null,
        });
      } catch (e) {
        console.error("Failed to decode token or token invalid", e);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('tokenExpiresAt');
        // localStorage.removeItem('user');
        setAuthState((prev: AuthState) => ({ ...prev, ...initialState, isLoading: false, error: "Geçersiz oturum bilgisi. Lütfen tekrar giriş yapın." }));
      }
    } else {
      // Tokenlar localStorage'da yok, kullanıcı giriş yapmamış
      setAuthState((prev: AuthState) => ({ ...prev, ...initialState, isLoading: false }));
    }
  }, []); // Bağımlılıklar boş dizi, component ilk yüklendiğinde çalışır

  useEffect(() => {
    attemptAutoLogin();
  }, [attemptAutoLogin]);

  // Login fonksiyonunu API yanıtını alacak şekilde güncelliyoruz
  const login = (authResponse: AuthResponsePayload) => { // <-- İmza değişti
    try {
      const { accessToken, refreshToken, expiresAt } = authResponse; // Yanıttan değerleri al

      // Tokenları localStorage'a kaydet
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('tokenExpiresAt', expiresAt); // <-- Backendden gelen expiresAt'i kaydet

      // Access tokenı decode ederek kullanıcı bilgilerini al
      const decodedToken: DecodedToken = jwtDecode(accessToken);
        const userFromToken: User = {
          id: decodedToken.sub,
          email: decodedToken.email,
          username: decodedToken.username,
          // fullName: decodedToken.fullName, // Eğer token'da varsa
          // ... token'dan alabileceğiniz diğer kullanıcı bilgileri
        };

      // Auth state'i güncelle
      setAuthState({
        isAuthenticated: true,
        user: userFromToken, // Token'dan alınan user bilgisini kullan
        accessToken: accessToken,
        refreshToken: refreshToken,
        tokenExpiresAt: expiresAt, // <-- Backendden gelen expiresAt'i kullan
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.error("Error during login or token decoding:", error);
      setError("Giriş sırasında bir sorun oluştu veya oturum bilgisi işlenemedi.");
      // Hata durumunda localStorage'ı temizle ve state'i sıfırla
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('tokenExpiresAt');
      setAuthState((prev: AuthState) => ({...prev, ...initialState, isLoading: false, error: "Oturum bilgisi işlenemedi."}));
    }
  };

  // Logout fonksiyonu aynı kalabilir, refresh tokenı kullanarak backend'e istek atar
  const logout = async () => {
    setLoading(true); // Logout işlemi sırasında yükleme göster
    const currentRefreshToken = authState.refreshToken;

    if (currentRefreshToken) {
        try {
            // Backend logout API'sini çağır
            await logoutUser({ refreshToken: currentRefreshToken });
        } catch (error) {
            console.error("Logout API call failed, proceeding with client-side logout:", error);
            // API hatası olsa bile client-side logout devam etmeli
            // Kullanıcı deneyimi açısından tokenları yine de temizlemeliyiz.
        }
    }

    // localStorage'dan tokenları sil
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenExpiresAt');
    // User bilgisini state'ten kaldır (localStorage'da tutmuyorduk artık)
    // localStorage.removeItem('user'); // <-- Bu satır artık gerekli değil

    // Auth state'i sıfırla
    setAuthState((prev: AuthState) => ({...initialState, isLoading: false})); // Tamamen sıfırla, isLoading: false önemli
  };


  const setLoading = (loading: boolean) => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: loading, error: loading ? null : prev.error }));
  };

  const setError = (error: string | null) => {
    setAuthState((prev: AuthState) => ({ ...prev, error, isLoading: false }));
  };

  // TODO: Refresh token mekanizması için bir fonksiyon eklenebilir
  // Bu fonksiyon, accessToken süresi dolduğunda veya 401 hatası alındığında çağrılır.
  // refreshToken'ı kullanarak /api/auth/refresh endpoint'ine istek atar
  // ve yeni access/refresh tokenları alır, ardından login() fonksiyonunu yeni tokenlarla çağırır.
   /*
  const handleRefreshToken = async () => {
      setLoading(true);
      const currentRefreshToken = authState.refreshToken;
      if (!currentRefreshToken) {
          setError("No refresh token available. Please log in.");
          await logout(); // Refresh token yoksa kullanıcıyı tamamen çıkış yapmaya zorla
          return null; // İşlem başarısız
      }

      try {
          // TODO: Implement refreshToken API call
          // const newTokens: AuthResponsePayload = await refreshToken(currentRefreshToken);
          // login(newTokens); // Yeni tokenlarla giriş yap
          // return newTokens.accessToken; // Yeni access token'ı döndür

          console.warn("Refresh token logic not implemented yet.");
          setLoading(false);
          return null; // Placeholder
      } catch (error: any) {
          console.error("Failed to refresh token:", error);
          setError("Oturumu yenileme başarısız. Lütfen tekrar giriş yapın.");
          await logout(); // Yenileme başarısız olursa tamamen çıkış yap
          return null; // İşlem başarısız
      }
  };
  */


  return (
    // Sağlanan değerlere handleRefreshToken fonksiyonunu da ekleyebilirsiniz
    <AuthContext.Provider value={{ ...authState, login, logout, setLoading, setError /*, handleRefreshToken*/ }}>
      {children}
    </AuthContext.Provider>
  );
};