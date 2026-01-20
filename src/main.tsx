import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Force light mode on mount
if (typeof document !== 'undefined') {
  // Remove dark class if present
  document.documentElement.classList.remove('dark');
  // Force light mode
  document.documentElement.style.colorScheme = 'light';
  document.documentElement.style.backgroundColor = 'white';
  // Prevent dark mode detection
  const observer = new MutationObserver(() => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
    }
  });
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class']
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
