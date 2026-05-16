import { StrictMode } from 'react';
import { AuthProvider } from '@/features/auth/useAuth';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
const rootElement = document.getElementById('root')!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);

  root.render(
    <StrictMode>
      <AuthProvider>
        <App />
      </AuthProvider>
    </StrictMode>
  );
}
