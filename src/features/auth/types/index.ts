// src/features/auth/types/index.ts

// API'den dönen User objesi (JWT'den decode edilecek veya /me endpoint'inden gelecek temel bilgiler)
export interface User {
    id: string;         // OpenAPI User şemasından (genellikle JWT sub alanı)
    email: string;      // OpenAPI User şemasından (genellikle JWT email alanı)
    username: string;   // OpenAPI User şemasından (genellikle JWT username alanı)
    fullName?: string;  // OpenAPI User şemasından (opsiyonel olabilir, JWT'niz içeriyorsa)
    // API'nizin User objesinde olan diğer önemli alanlar (roller vb.)
    // roles?: string[];
}

// Authentication state'imizin yapısı
export interface AuthState {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    tokenExpiresAt: string | null; // ISO date-time string
    isLoading: boolean;
    error: string | null;
}

// AuthContext'in sağlayacağı değerlerin tipi
export interface AuthContextType {
    isAuthenticated: boolean; // AuthState'ten eklendi
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    tokenExpiresAt: string | null;
    isLoading: boolean; // AuthState'ten eklendi
    error: string | null;
    // login fonksiyonu API'den dönen payload objesini alır
    login: (authResponse: AuthResponsePayload) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    // handleRefreshToken?: () => Promise<string | null>; // Eğer eklerseniz
}

// API İstek Tipleri
export interface UserCredentials { // Login için
    email: string;
    password: string;
}

// Kayıt (Register) için API isteği (OpenAPI RegisterRequest DTO'su ile eşleşmeli)
export interface RegisterCredentials {
    email: string;
    username: string;   // OpenAPI RegisterRequest DTO'suna göre eklendi
    password: string;
    companyName: string; // OpenAPI RegisterRequest DTO'suna göre eklendi
    terms?: boolean; // Backend RegisterRequest DTO'sunda yoksa kaldırın
}

// API Yanıt Tipleri
export interface AuthResponsePayload { // OpenAPI AuthResponse ile eşleşiyor
    accessToken: string;
    refreshToken: string;
    tokenType: string; // Genellikle "Bearer"
    expiresAt: string; // ISO date-time string
}

// Genel bir API hata tipi (isteğe bağlı, API yanıtına göre ayarlanır)
export interface ApiError {
    message: string;
    statusCode?: number;
    errors?: Record<string, string[]>; // Alan bazlı hatalar için (varsa)
}

// Logout için API isteği (OpenAPI LogoutRequest ile eşleşiyor)
export interface LogoutRequestPayload {
    refreshToken: string;
}
