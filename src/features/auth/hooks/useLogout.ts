import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '../useAuth';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setToken } = useAuth(); // 👈 setter từ AuthContext

  return useMutation({
    // Explicitly return a resolved Promise to satisfy TypeScript without triggering ESLint's require-await
    mutationFn: () => {
      localStorage.removeItem('token');
      // 🔥 FIX: cập nhật state ngay để AuthProvider re-render, `enabled` của
      // useQuery(auth.me) chuyển về false ngay, không giữ user cũ trong context.
      setToken(null);
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all cached queries to avoid memory/credential leaks
      void navigate({ to: '/login' });
    },
  });
}
