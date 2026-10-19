import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import './index.css';
import { registerOfflineServiceWorker } from './services/offlineCache.ts';

// Register service worker for offline directory and asset caching
registerOfflineServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>,
);
