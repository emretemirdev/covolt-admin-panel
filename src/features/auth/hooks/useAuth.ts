// src/features/auth/hooks/useAuth.ts

import { useContext } from 'react';
import { AuthContext } from '../provider/AuthProvider'; // AuthProvider dosyasından Context'i import et
import type { AuthContextType } from '../types'; // Tip tanımını import et

// AuthContext'i tüketen özel hook'umuz
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext); // Context'i al

  // Context'in tanımlı olup olmadığını kontrol et (Provider'ın sarılı olduğundan emin olmak için)
  if (!context) {
    console.error('useAuth hook must be used within an AuthProvider');
    throw new Error('useAuth hook must be used within an AuthProvider');
  }

  console.log('useAuth - Context değerleri:', context);
  return context; // Context değerini döndür
}