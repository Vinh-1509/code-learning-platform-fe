import type { AuthResponse, AuthPayload } from '@/types/auth';
import { createContext } from 'react';

interface AuthContextValue {
  user: AuthResponse['user'] | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (data: AuthPayload) => Promise<void>;
  register: (data: AuthPayload) => Promise<void>;
  logout: () => void;
}
export const AuthContext = createContext<AuthContextValue | null>(null);
