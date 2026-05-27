import { useState, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import type { ApiError } from '@/lib/axios';
import { loginUser, registerUser } from '@/lib/axios';
import type { AuthResponse, AuthPayload } from '@/types/auth';
import { AuthContext } from './authContext';

function getInitialToken() {
  return localStorage.getItem('token');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setAuth = (res: AuthResponse) => {
    const token = res.access_token;
    if (!token) return;
    localStorage.setItem('token', token);
    setToken(token);
  };

  const login = async (data: AuthPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(data);
      setAuth(res);
      void navigate({ to: '/languageselection' });
    } catch (err) {
      if (axios.isAxiosError<ApiError>(err) && err.response?.data?.message) {
        const errorMessage = err.response?.data?.message;
        setError(
          errorMessage ? String(errorMessage) : 'Login failed, please try again'
        );
      } else {
        setError('Login failed, please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: AuthPayload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(data);
      const token = res.access_token;
      if (token) {
        setAuth(res);
        void navigate({ to: '/languageselection' });
      } else {
        void navigate({ to: '/login' });
      }
    } catch (err) {
      if (axios.isAxiosError<ApiError>(err) && err.response?.data?.message) {
        setError(String(err.response.data.message));
      } else {
        setError('Signup failed, please try again');
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    void navigate({ to: '/login' });
  };

  return (
    <AuthContext.Provider
      value={{ token, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
