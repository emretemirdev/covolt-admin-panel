import React, { createContext, useContext } from 'react';
import { MantineProvider, createTheme } from '@mantine/core';
import { useLocalStorage } from '@mantine/hooks';

// Tema context tipi
interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
}

// Tema context'i oluştur
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Özel tema yapılandırması
const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'Roboto, sans-serif',
  headings: {
    fontFamily: 'Roboto, sans-serif',
  },
  colors: {
    // Özel renk paletleri ekleyebilirsiniz
  },
});

// Tema provider props tipi
interface ThemeProviderProps {
  children: React.ReactNode;
}

// Tema provider bileşeni
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [colorScheme, setColorScheme] = useLocalStorage<'light' | 'dark'>({
    key: 'mantine-color-scheme',
    defaultValue: 'light',
  });

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  };

  const contextValue: ThemeContextType = {
    colorScheme,
    toggleColorScheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MantineProvider
        theme={{ ...theme, colorScheme }}
        forceColorScheme={colorScheme}
      >
        {children}
      </MantineProvider>
    </ThemeContext.Provider>
  );
}

// Tema hook'u
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
