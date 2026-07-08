import { createContext, type Dispatch, type SetStateAction } from 'react';
import type { AuthUserResponse } from '@/types/auth';

/**
 * Authentication context value shared across the application.
 * Slimmed down to be read-only, matching TanStack Query architecture.
 */
export interface AuthContextValue {
  /** Current access token. Null if user is not authenticated. */
  token: string | null;

  /** Current authenticated user data. Null if not authenticated. */
  user: AuthUserResponse | null;
  setToken: Dispatch<SetStateAction<string | null>>;
}

/**
 * Global authentication context.
 * Default value is null and should be provided by AuthProvider.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
