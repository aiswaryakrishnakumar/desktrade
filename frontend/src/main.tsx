// src/main.tsx
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';      // global styles (rename/move your CSS here)
import './App.css';        // app-specific styles (login/admin CSS we added)

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
