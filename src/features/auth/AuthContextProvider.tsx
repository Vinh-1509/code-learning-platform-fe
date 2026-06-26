import { useState, type ReactNode } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import type { ApiError } from '@/lib/axios';
import { queryKeys } from '@/lib/queryKeys';
import { loginUser, registerUser, getMe } from '@/features/auth/api/auth.api';
import type { AuthResponse, AuthPayload } from '@/types/auth';
import { AuthContext } from './authContext';

function getInitialToken() {
  return localStorage.getItem('token');
}

/**
 * Provides authentication state and actions to the application.
 * Upgraded to TanStack Query to eliminate duplicate getMe requests.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: user } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 5 * 60_000,
  });

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
      void navigate({ to: '/language-selection' });
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
        void navigate({ to: '/language-selection' });
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
    setToken(null);
    void navigate({ to: '/login' });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user: user ?? null,
        loading,
        error,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
