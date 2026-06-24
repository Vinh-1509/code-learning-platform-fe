import axios from 'axios';

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
      const hasToken = Boolean(localStorage.getItem('token'));
      if (hasToken) {
        localStorage.removeItem('token');
      }
      // Trigger global cache clear when queryClient is fully integrated
      import('./queryClient')
        .then(({ queryClient }) => {
          queryClient.clear();
        })
        .catch((err) => console.error('Failed to import queryClient', err));
    }
    return Promise.reject(
      error instanceof Error ? error : new Error('Unknown error')
    );
  }
);
