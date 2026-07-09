import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
//import axios from 'axios';
import { loginUser } from '../api/auth.api';
import { queryKeys } from '@/lib/queryKeys';
import { useAuth } from '../useAuth';
import type { AuthPayload } from '@/types/auth';
//import type { ApiError } from '@/lib/axios';
//import { toast } from 'sonner'; // Hoặc thư viện toast bạn chọn

export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { setToken } = useAuth(); // setter from AuthContext

  return useMutation({
    mutationFn: (data: AuthPayload) => loginUser(data),
    onSuccess: (res) => {
      if (res.access_token) {
        localStorage.setItem('token', res.access_token);
        // Update state immediately so AuthProvider re-renders and
        // useQuery(auth.me) enables correctly without a page reload.
        setToken(res.access_token);
        // refresh cache
        void queryClient.invalidateQueries({ queryKey: queryKeys.auth.me() });
        // toast.success('Đăng nhập thành công!');
        void navigate({ to: '/language-selection' });
      }
    },
    // onError: (err) => {
    //   const msg = axios.isAxiosError<ApiError>(err) && err.response?.data?.message
    //     ? String(err.response.data.message)
    //     : 'Login failed, please try again';
    //      toast.error(msg);
    // },
  });
}
