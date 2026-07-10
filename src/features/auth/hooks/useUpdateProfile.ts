import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { updateMe } from '../api/auth.api';
import type { AuthUserResponse } from '@/types/auth';

interface UpdateProfilePayload {
  username?: string;
  fullName?: string;
  hasSeenTour?: boolean;
}

/**
 * Generic profile-patch mutation. On success, writes the server's response
 * directly into the auth.me cache — no refetch needed since PATCH /api/users/me
 * returns the full updated user object.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateProfilePayload) => updateMe(payload),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData<AuthUserResponse>(
        queryKeys.auth.me(),
        updatedUser
      );
    },
  });
}
