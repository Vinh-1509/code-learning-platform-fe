import { useState } from 'react';
import type { ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { getMe } from '@/features/auth/api/auth.api';
import { AuthContext } from '../authContext';
import { GlobalLoadingScreen } from '@/components/ui/GlobalLoadingScreen';

function getInitialToken() {
  return localStorage.getItem('token');
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // 🔥 FIX: token phải là React state. Trước đây đọc thẳng localStorage mỗi
  // render nên khi login()/logout() ghi vào localStorage, AuthProvider KHÔNG
  // re-render (React không biết localStorage đổi) -> `enabled: Boolean(token)`
  // vẫn đóng băng theo giá trị cũ -> user không refetch đúng lúc.
  const [token, setToken] = useState<string | null>(getInitialToken);

  const { data: user, isLoading } = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: getMe,
    enabled: Boolean(token),
    staleTime: 5 * 60_000, // 5 phút
  });

  // Render a full-page loading screen during initial session verification
  if (token && isLoading) {
    return <GlobalLoadingScreen />;
  }

  return (
    <AuthContext.Provider
      value={{
        token,
        user: user ?? null,
        setToken, // 👈 expose cho useLogin/useLogout gọi để trigger re-render ngay lập tức
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
