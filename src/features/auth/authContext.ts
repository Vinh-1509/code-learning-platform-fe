import type { AuthPayload } from '@/types/auth';
import { createContext } from 'react';

interface AuthContextValue {
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (data: AuthPayload) => Promise<void>;
  register: (data: AuthPayload) => Promise<void>;
  logout: () => void;
}
export const AuthContext = createContext<AuthContextValue | null>(null);
