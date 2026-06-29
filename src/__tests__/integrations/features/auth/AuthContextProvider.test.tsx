import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

// Import the thin context hook alongside the new React Query mutations
import { useAuth } from '@/features/auth/useAuth';
import { useLogin } from '@/features/auth/hooks/useLogin';
import { useRegister } from '@/features/auth/hooks/useRegister';
import { useLogout } from '@/features/auth/hooks/useLogout';

import { renderWithAuth } from '../../../helpers/renderWithAuth';
import { server } from '../../../mocks/server';

// ── Updated Test consumer: Aggregates decoupled hooks for testing ──
function AuthProbe() {
  const { token, user } = useAuth();
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  const userLabel = user?.selectedLanguage?.join(',') ?? 'none';

  // Extract statuses from individual mutations to satisfy old test assertions
  const loading =
    loginMutation.isPending ||
    registerMutation.isPending ||
    logoutMutation.isPending;

  // Fallback string matching your old tests
  const error =
    loginMutation.error?.message || registerMutation.error?.message || 'none';

  return (
    <div>
      <span data-testid="token">{token ?? 'none'}</span>
      <span data-testid="user">{userLabel}</span>
      <span data-testid="loading">{loading ? 'yes' : 'no'}</span>
      <span data-testid="error">{error}</span>
      <button
        type="button"
        onClick={() =>
          void loginMutation.mutate({
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
          void registerMutation.mutate({
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

describe('AuthProvider — initial state', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads user data when a token is already stored', async () => {
    localStorage.setItem('token', 'existing-token');

    await renderWithAuth(<AuthProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('C++');
    });
    expect(screen.getByTestId('token')).toHaveTextContent('existing-token');
  });

  it('leaves user as null when getMe() rejects on mount', async () => {
    localStorage.setItem('token', 'existing-token');

    server.use(
      http.get('*/api/auth/me', () => {
        return HttpResponse.json({ message: 'Server error' }, { status: 500 });
      })
    );

    await renderWithAuth(<AuthProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('none');
    });

    expect(screen.getByTestId('token')).toHaveTextContent('existing-token');
    expect(localStorage.getItem('token')).toBe('existing-token');
  });
});

describe('AuthProvider — login()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('logs in successfully, persists token, and navigates to language selection', async () => {
    const user = userEvent.setup();
    const { router } = await renderWithAuth(<AuthProbe />);

    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-jwt');
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/language-selection');
    });
  });

  it('sets loading=true during the call and loading=false after it resolves', async () => {
    const user = userEvent.setup();
    let resolveLogin!: (value: Response) => void;

    server.use(
      http.post('*/api/auth/login', () => {
        return new Promise<Response>((resolve) => {
          resolveLogin = resolve;
        });
      })
    );

    await renderWithAuth(<AuthProbe />);

    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(screen.getByTestId('loading')).toHaveTextContent('yes');

    resolveLogin(HttpResponse.json({ access_token: 'fake-jwt' }));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('no');
    });
  });
});

describe('AuthProvider — register()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('stores the token and navigates to /language-selection when the response includes a token', async () => {
    const user = userEvent.setup();
    const { router } = await renderWithAuth(<AuthProbe />);

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-jwt-register');
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/language-selection');
    });
  });

  it('navigates to /login and does not store a token when the response has no token', async () => {
    const user = userEvent.setup();

    server.use(
      http.post('*/api/auth/register', () =>
        HttpResponse.json({ access_token: '' })
      )
    );

    const { router } = await renderWithAuth(<AuthProbe />);

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });
    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('AuthProvider — logout()', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('clears auth state and navigates to /login on logout', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', 'existing-token');

    const { router } = await renderWithAuth(<AuthProbe />);

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('C++');
    });

    await user.click(screen.getByRole('button', { name: /logout/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull();
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });
  });
});

describe('useAuth() outside AuthProvider', () => {
  it('throws with a descriptive error message', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<AuthProbe />);
    }).toThrow('useAuth must be used within AuthProvider');

    consoleSpy.mockRestore();
  });
});
