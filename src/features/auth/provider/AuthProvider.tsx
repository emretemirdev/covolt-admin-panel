// src/features/auth/provider/AuthProvider.tsx

import { createContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
// AuthContextType importunu güncelledik
import type { User, AuthState, AuthContextType, AuthResponsePayload } from '../types/index.ts';
import { jwtDecode } from 'jwt-decode';
import { logoutUser, refreshToken } from '../api/authApi.ts';

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

  // Otomatik giriş denemesi - sayfa yüklendiğinde sessionStorage'ı kontrol eder
  const attemptAutoLogin = useCallback(async () => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: true }));
    const token = sessionStorage.getItem('accessToken');
    const storedRefreshToken = sessionStorage.getItem('refreshToken');
    const storedExpiresAt = sessionStorage.getItem('tokenExpiresAt'); // Backendden gelen değeri alacak

    if (token && storedRefreshToken && storedExpiresAt) {
      try {
        const decodedToken: DecodedToken = jwtDecode(token);

        // Tokenın geçerlilik süresinin dolup dolmadığını burada kontrol edebiliriz
        // decodedToken.exp Unix timestamp'tir, Date.now() milisaniyedir.
        const currentTime = Date.now() / 1000; // Saniyeye çevir
        if (decodedToken.exp < currentTime) {
            console.warn("Access token expired. Attempting to use refresh token.");

            // Token süresi dolmuşsa, refresh token ile yeni token almayı dene
            try {
                // handleRefreshToken fonksiyonu henüz tanımlanmadığı için burada doğrudan refreshToken API'sini çağırıyoruz
                const newTokens: AuthResponsePayload = await refreshToken(storedRefreshToken);

                // Yeni tokenları sessionStorage'a kaydet
                sessionStorage.setItem('accessToken', newTokens.accessToken);
                sessionStorage.setItem('refreshToken', newTokens.refreshToken);
                sessionStorage.setItem('tokenExpiresAt', newTokens.expiresAt);

                // Yeni access token'ı decode et
                const newDecodedToken: DecodedToken = jwtDecode(newTokens.accessToken);

                const userFromToken: User = {
                  id: newDecodedToken.sub,
                  email: newDecodedToken.email,
                  username: newDecodedToken.username,
                };

                // Auth state'i güncelle
                setAuthState({
                  isAuthenticated: true,
                  user: userFromToken,
                  accessToken: newTokens.accessToken,
                  refreshToken: newTokens.refreshToken,
                  tokenExpiresAt: newTokens.expiresAt,
                  isLoading: false,
                  error: null,
                });

                return; // İşlemi başarıyla tamamla
            } catch (refreshError) {
                console.error("Failed to refresh token:", refreshError);
                // Refresh token ile yenileme başarısız olursa tokenları temizle
                sessionStorage.removeItem('accessToken');
                sessionStorage.removeItem('refreshToken');
                sessionStorage.removeItem('tokenExpiresAt');
                setAuthState((prev: AuthState) => ({ ...prev, ...initialState, isLoading: false, error: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın." }));
                return; // İşlemi durdur
            }
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
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
        sessionStorage.removeItem('tokenExpiresAt');
        setAuthState((prev: AuthState) => ({ ...prev, ...initialState, isLoading: false, error: "Geçersiz oturum bilgisi. Lütfen tekrar giriş yapın." }));
      }
    } else {
      // Tokenlar localStorage'da yok, kullanıcı giriş yapmamış
      setAuthState((prev: AuthState) => ({ ...prev, ...initialState, isLoading: false }));
    }
  }, [/* refreshToken fonksiyonu bağımlılık olarak eklenmedi çünkü değişmiyor */]); // Bağımlılıklar boş dizi, component ilk yüklendiğinde çalışır

  useEffect(() => {
    attemptAutoLogin();
  }, [attemptAutoLogin]);

  // Login fonksiyonunu API yanıtını alacak şekilde güncelliyoruz
  const login = (authResponse: AuthResponsePayload) => {
    try {
      const { accessToken, refreshToken, expiresAt } = authResponse;

      // Tokenları sessionStorage'a kaydet
      sessionStorage.setItem('accessToken', accessToken);
      sessionStorage.setItem('refreshToken', refreshToken);
      sessionStorage.setItem('tokenExpiresAt', expiresAt);

      // Access tokenı decode ederek kullanıcı bilgilerini al
      const decodedToken: DecodedToken = jwtDecode(accessToken);
      const userFromToken: User = {
        id: decodedToken.sub,
        email: decodedToken.email,
        username: decodedToken.username,
      };

      // Auth state'i güncelle
      setAuthState({
        isAuthenticated: true,
        user: userFromToken,
        accessToken: accessToken,
        refreshToken: refreshToken,
        tokenExpiresAt: expiresAt,
        isLoading: false,
        error: null,
      });

      // YENİ: Rol ve izinleri ayrı bir istekle al
      // Not: Bu işlem useAuthorization hook'u tarafından otomatik olarak yapılacak
      // Kullanıcı giriş yaptığında useAuthorization hook'u çalışacak ve rol/izinleri alacak

    } catch (error) {
      console.error("Error during login or token decoding:", error);
      setError("Giriş sırasında bir sorun oluştu veya oturum bilgisi işlenemedi.");
      // Hata durumunda sessionStorage'ı temizle ve state'i sıfırla
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('tokenExpiresAt');
      setAuthState((prev: AuthState) => ({...prev, ...initialState, isLoading: false, error: "Oturum bilgisi işlenemedi."}));
    }
  };

  // Logout fonksiyonu, refresh tokenı kullanarak backend'e istek atar
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

    // sessionStorage'dan tokenları sil
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    sessionStorage.removeItem('tokenExpiresAt');
    // User bilgisini state'ten kaldır (localStorage'da tutmuyorduk artık)

    // Auth state'i sıfırla
    setAuthState({...initialState, isLoading: false}); // Tamamen sıfırla, isLoading: false önemli
  };


  const setLoading = (loading: boolean) => {
    setAuthState((prev: AuthState) => ({ ...prev, isLoading: loading, error: loading ? null : prev.error }));
  };

  const setError = (error: string | null) => {
    setAuthState((prev: AuthState) => ({ ...prev, error, isLoading: false }));
  };

  // Refresh token mekanizması için fonksiyon
  // Bu fonksiyon, accessToken süresi dolduğunda veya 401 hatası alındığında çağrılır.
  const handleRefreshToken = async () => {
      setLoading(true);
      const currentRefreshToken = authState.refreshToken;
      if (!currentRefreshToken) {
          setError("Yenileme token'ı bulunamadı. Lütfen tekrar giriş yapın.");
          await logout(); // Refresh token yoksa kullanıcıyı tamamen çıkış yapmaya zorla
          return null; // İşlem başarısız
      }

      try {
          // Refresh token API çağrısı
          const newTokens: AuthResponsePayload = await refreshToken(currentRefreshToken);
          login(newTokens); // Yeni tokenlarla giriş yap
          return newTokens.accessToken; // Yeni access token'ı döndür
      } catch (error: any) {
          console.error("Token yenileme başarısız:", error);
          setError("Oturumu yenileme başarısız. Lütfen tekrar giriş yapın.");
          await logout(); // Yenileme başarısız olursa tamamen çıkış yap
          return null; // İşlem başarısız
      }
  };


  return (
    <AuthContext.Provider value={{ ...authState, login, logout, setLoading, setError, handleRefreshToken }}>
      {children}
    </AuthContext.Provider>
  );
};
