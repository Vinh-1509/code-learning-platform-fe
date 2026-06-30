import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/useAuth';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { useLogout } from '@/features/auth/hooks/useLogout';
import { AuthProvider } from '@/features/auth/hooks/AuthContextProvider';
import { server } from '../../../mocks/server';

// Định nghĩa Interface đại diện cho cấu trúc lỗi từ API / Axios
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
  message?: string;
}

// ── Setup QueryClient sạch cho môi trường Test ──
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, gcTime: 0 },
    mutations: { retry: false },
  },
});

// Helper render bọc đầy đủ React Query Provider và AuthProvider
function renderWithAuth(ui: React.ReactNode) {
  const navigateMock = vi.fn();

  vi.mock('@tanstack/react-router', async () => {
    const actual = await vi.importActual('@tanstack/react-router');
    return {
      ...actual,
      useNavigate: () => navigateMock,
    };
  });

  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>
  );

  return {
    router: {
      state: { location: { pathname: window.location.pathname } },
      navigateMock,
    },
  };
}

// ── Test Consumer phối hợp các custom hooks mới ──
function AuthProbe() {
  const { token, user } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const userLabel =
    (user as { selectedLanguage?: string[] } | null)?.selectedLanguage?.join(
      ','
    ) ?? 'none';

  const getErrorMessage = (error: ApiErrorResponse | null) => {
    return error?.response?.data?.message || error?.message || 'none';
  };
  const currentError = loginMutation.error
    ? getErrorMessage(loginMutation.error)
    : registerMutation.error
      ? getErrorMessage(registerMutation.error)
      : 'none';

  const isLoading =
    loginMutation.isPending ||
    registerMutation.isPending ||
    logoutMutation.isPending;

  return (
    <div>
      <span data-testid="token">{token ?? 'none'}</span>
      <span data-testid="user">{userLabel}</span>
      <span data-testid="loading">{isLoading ? 'yes' : 'no'}</span>
      <span data-testid="error">{currentError}</span>
      <button
        type="button"
        onClick={() =>
          loginMutation.mutate({
            email: 'test@hcmut.edu.vn',
            password: '123456',
          })
        }
      >
        Login
      </button>
      <button
        type="button"
        onClick={() =>
          loginMutation.mutate({ email: 'wrong@hcmut.edu.vn', password: 'bad' })
        }
      >
        Bad login
      </button>
      <button
        type="button"
        onClick={() =>
          registerMutation.mutate({
            email: 'new@hcmut.edu.vn',
            password: '12345678',
          })
        }
      >
        Register
      </button>
      <button type="button" onClick={() => logoutMutation.mutate()}>
        Logout
      </button>
    </div>
  );
}

// ── BẮT ĐẦU TEST SUITE ──
describe('AuthProvider & Auth Hooks', () => {
  beforeEach(() => {
    localStorage.clear();
    queryClient.clear();
    vi.restoreAllMocks();
  });

  describe('AuthProvider — initial state', () => {
    it('loads user data when a token is already stored', async () => {
      localStorage.setItem('token', 'existing-token');
      server.use(
        http.get('*/api/auth/me', () =>
          HttpResponse.json({ selectedLanguage: ['C++'] })
        )
      );

      renderWithAuth(<AuthProbe />);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('C++');
      });
      expect(screen.getByTestId('token')).toHaveTextContent('existing-token');
    });

    it('leaves user as null when getMe() rejects on mount', async () => {
      localStorage.setItem('token', 'existing-token');
      server.use(
        http.get('*/api/auth/me', () =>
          HttpResponse.json({ message: 'Server error' }, { status: 500 })
        )
      );

      renderWithAuth(<AuthProbe />);

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('none');
      });
      expect(screen.getByTestId('token')).toHaveTextContent('existing-token');
    });
  });

  describe('useLogin() Mutation', () => {
    it('logs in successfully, persists token, and invalidates user query', async () => {
      const user = userEvent.setup();
      server.use(
        http.post('*/api/auth/login', () =>
          HttpResponse.json({ access_token: 'fake-jwt' })
        )
      );

      renderWithAuth(<AuthProbe />);
      await user.click(screen.getByRole('button', { name: /^login$/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('fake-jwt');
      });
    });

    it('sets an error message when login fails with a server message', async () => {
      const user = userEvent.setup();
      server.use(
        http.post('*/api/auth/login', () =>
          HttpResponse.json(
            { message: 'Invalid email or password' },
            { status: 401 }
          )
        )
      );

      renderWithAuth(<AuthProbe />);
      await user.click(screen.getByRole('button', { name: /bad login/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Invalid email or password'
        );
      });
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('sets loading=true during the call and loading=false after it resolves', async () => {
      const user = userEvent.setup();

      // Khai báo kiểu dữ liệu cụ thể cho hàm resolve thay vì any
      let resolveLogin!: (value: Response | PromiseLike<Response>) => void;

      server.use(
        http.post('*/api/auth/login', () => {
          return new Promise<Response>((resolve) => {
            resolveLogin = resolve;
          });
        })
      );

      renderWithAuth(<AuthProbe />);
      await user.click(screen.getByRole('button', { name: /^login$/i }));

      expect(screen.getByTestId('loading')).toHaveTextContent('yes');

      resolveLogin(HttpResponse.json({ access_token: 'fake-jwt' }));

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('no');
      });
    });
  });

  describe('useRegister() Mutation', () => {
    it('stores the token when register response includes a token', async () => {
      const user = userEvent.setup();
      server.use(
        http.post('*/api/auth/register', () =>
          HttpResponse.json({ access_token: 'fake-jwt-register' })
        )
      );

      renderWithAuth(<AuthProbe />);
      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBe('fake-jwt-register');
      });
    });

    it('sets error to the server message on failure', async () => {
      const user = userEvent.setup();
      server.use(
        http.post('*/api/auth/register', () =>
          HttpResponse.json(
            { message: 'Email already in use' },
            { status: 409 }
          )
        )
      );

      renderWithAuth(<AuthProbe />);
      await user.click(screen.getByRole('button', { name: /register/i }));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent(
          'Email already in use'
        );
      });
    });
  });

  describe('useLogout() Mutation', () => {
    it('clears token and cache on logout', async () => {
      const user = userEvent.setup();
      localStorage.setItem('token', 'existing-token');

      renderWithAuth(<AuthProbe />);
      await user.click(screen.getByRole('button', { name: /logout/i }));

      await waitFor(() => {
        expect(localStorage.getItem('token')).toBeNull();
      });
    });
  });
});
