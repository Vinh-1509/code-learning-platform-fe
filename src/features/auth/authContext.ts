import { createContext } from 'react';
import type { AuthPayload } from '@/types/auth';

/**
 * Authentication context value shared across the application.
 */
export interface AuthContextValue {
  /** Current access token. Null if user is not authenticated. */
  token: string | null;

  /** Indicates whether an auth request is in progress. */
  loading: boolean;

  /** Authentication error message. */
  error: string | null;

  /** Sign in an existing user. */
  login: (data: AuthPayload) => Promise<void>;

  /** Register a new user account. */
  register: (data: AuthPayload) => Promise<void>;

  /** Clear authentication state and sign out. */
  logout: () => void;
}

/**
 * Global authentication context.
 * Default value is null and should be provided by AuthProvider.
 */
export const AuthContext = createContext<AuthContextValue | null>(null);
