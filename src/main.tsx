import React from 'react';
import ReactDOM from 'react-dom/client';
import { ColorSchemeScript } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import App from './App.tsx';
import { ThemeProvider } from './shared/providers/ThemeProvider';

// Mantine temel stilleri
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import './index.css';
import './App.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ColorSchemeScript />
    <ThemeProvider>
      <Notifications position="top-right" zIndex={2000} />
      <App />
    </ThemeProvider>
  </React.StrictMode>,
);