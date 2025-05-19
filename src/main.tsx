import React from 'react';
import ReactDOM from 'react-dom/client';
import { MantineProvider } from '@mantine/core';
import App from './App.tsx';

// Mantine temel stilleri
import '@mantine/core/styles.css';

// Debug için
console.log('main.tsx yükleniyor...');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MantineProvider>
      <App />
    </MantineProvider>
  </React.StrictMode>,
);