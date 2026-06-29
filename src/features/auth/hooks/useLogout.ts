import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';

export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    // Explicitly return a resolved Promise to satisfy TypeScript without triggering ESLint's require-await
    mutationFn: () => {
      localStorage.removeItem('token');
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.clear(); // Clear all cached queries to avoid memory/credential leaks
      void navigate({ to: '/login' });
    },
  });
}
