import { useState, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { loginUser, registerUser } from '@/lib/axios';
import type { AuthResponse, AuthPayload } from '@/types/auth';
import { AuthContext } from './authContext';

function getInitialToken() {
  return localStorage.getItem('token');
}
function getInitialUser(): AuthResponse['user'] | null {
  const saved = localStorage.getItem('user');
  return saved ? (JSON.parse(saved) as AuthResponse['user']) : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [user, setUser] = useState<AuthResponse['user'] | null>(getInitialUser);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuth = (res: AuthResponse) => {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    setToken(res.token);
    setUser(res.user);
  };

  const login = async (data: AuthPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(data);
      setAuth(res);
      void navigate({ to: '/dashboard' });
    } catch {
      setError('Email hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: AuthPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(data);
      setAuth(res);
      void navigate({ to: '/languageselection' });
    } catch {
      setError('Đăng ký thất bại, thử lại nhé');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    void navigate({ to: '/login' });
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
