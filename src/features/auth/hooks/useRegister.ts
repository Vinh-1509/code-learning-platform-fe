import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
//import axios from 'axios';
import { registerUser } from '../api/auth.api';
import { queryKeys } from '@/lib/queryKeys';
import type { AuthPayload } from '@/types/auth';
//import type { ApiError } from '@/lib/axios';
//import { toast } from 'sonner';

export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: AuthPayload) => registerUser(data),
    onSuccess: (res) => {
      const token = res.access_token;
      if (token) {
        localStorage.setItem('token', token);
        void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
        //toast.success('Đăng ký thành công!');
        void navigate({ to: '/language-selection' });
      } else {
        void navigate({ to: '/login' });
      }
    },
    // onError: (err) => {
    //   const msg = axios.isAxiosError<ApiError>(err) && err.response?.data?.message
    //     ? String(err.response.data.message)
    //     : 'Signup failed, please try again';
    //   toast.error(msg);
    // },
  });
}
