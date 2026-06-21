import { useState, type ReactNode, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import axios from 'axios';
import type { ApiError } from '@/lib/axios';
import { loginUser, registerUser, getMe } from '@/lib/axios';
import type { AuthResponse, AuthPayload, AuthUserResponse } from '@/types/auth';
import { AuthContext } from './authContext';
/**
 * Retrieves the persisted access token from localStorage.
 */
function getInitialToken() {
  return localStorage.getItem('token');
}

/**
 * Provides authentication state and actions to the application.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [token, setToken] = useState<string | null>(getInitialToken);
  const [user, setUser] = useState<AuthUserResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data when token changes
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setUser(null);
        return;
      }

      try {
        const userData = await getMe();
        setUser(userData);
      } catch (err) {
        console.error('Failed to fetch user data:', err);
        setUser(null);
      }
    };

    void fetchUser();
  }, [token]);

  /**
   * Persists the access token and updates authentication state.
   */
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
    setToken(null);
    setUser(null);
    void navigate({ to: '/login' });
  };

  return (
    <AuthContext.Provider
      value={{ token, user, loading, error, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
