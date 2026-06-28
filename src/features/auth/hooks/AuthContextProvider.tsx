import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getMe } from '@/features/auth/api/auth.api';
import { AuthContext } from '../authContext';

function getInitialToken() {
  return localStorage.getItem('token');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const token = getInitialToken();

  const { data: user } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 5 * 60_000, // 5 phút
  });

  return (
    <AuthContext.Provider
      value={{
        token,
        user: user ?? null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
