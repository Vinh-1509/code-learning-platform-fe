import axios from 'axios';
import { queryClient } from '@/lib/queryClient';

export interface ApiError {
  message?: string;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      localStorage.removeItem('token');
      queryClient.clear();
    }
    return Promise.reject(
      error instanceof Error ? error : new Error('Unknown error')
    );
  }
);
