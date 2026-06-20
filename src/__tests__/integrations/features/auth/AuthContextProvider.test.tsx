import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import { useAuth } from '@/features/auth/useAuth';

import { renderWithAuth } from '../../../helpers/renderWithAuth';
import { server } from '../../../mocks/server';

// ── Test consumer: fixed credentials so MSW handlers can be overridden per test ──

function AuthProbe() {
  const { token, user, loading, error, login, register, logout } = useAuth();

  const userLabel = user?.selectedLanguage?.join(',') ?? 'none';

  return (
    <div>
      <span data-testid="token">{token ?? 'none'}</span>
      <span data-testid="user">{userLabel}</span>
      <span data-testid="loading">{loading ? 'yes' : 'no'}</span>
      <span data-testid="error">{error ?? 'none'}</span>
      <button
        type="button"
        onClick={() =>
          void login({ email: 'test@hcmut.edu.vn', password: '123456' })
        }
      >
        Login
      </button>
      <button
        type="button"
        onClick={() =>
          void register({ email: 'new@hcmut.edu.vn', password: '12345678' })
        }
      >
        Register
      </button>
      <button type="button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

// Separate probe for the "wrong credentials" path, which relies on the
// default handler's built-in email/password check rather than an override.
function BadLoginProbe() {
  const { error, login } = useAuth();

  return (
    <div>
      <span data-testid="error">{error ?? 'none'}</span>
      <button
        type="button"
        onClick={() =>
          void login({ email: 'wrong@hcmut.edu.vn', password: 'bad' })
        }
      >
        Bad login
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
      expect(router.state.location.pathname).toBe('/languageselection');
    });
  });

  it('sets an error message when login fails with a server message', async () => {
    const user = userEvent.setup();

    await renderWithAuth(<BadLoginProbe />);

    await user.click(screen.getByRole('button', { name: /bad login/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Invalid email or password'
      );
    });
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('sets error to the fallback string when the request fails with no server message', async () => {
    const user = userEvent.setup();

    server.use(http.post('*/api/auth/login', () => HttpResponse.error()));

    await renderWithAuth(<AuthProbe />);

    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Login failed, please try again'
      );
    });
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('clears a previous error at the start of a new login attempt', async () => {
    const user = userEvent.setup();

    // First attempt fails — error should be visible.
    server.use(http.post('*/api/auth/login', () => HttpResponse.error()));
    await renderWithAuth(<AuthProbe />);

    await user.click(screen.getByRole('button', { name: /login/i }));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Login failed, please try again'
      );
    });

    // Second attempt: Freeze the request so we don't navigate away yet
    let resolveLogin!: (value: Response) => void;
    server.use(
      http.post('*/api/auth/login', () => {
        return new Promise<Response>((resolve) => {
          resolveLogin = resolve;
        });
      })
    );

    await user.click(screen.getByRole('button', { name: /login/i }));

    // The error should be cleared immediately while the request is pending
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('none');
    });

    // Resolve the promise to clean up the test and prevent open handle warnings
    resolveLogin(HttpResponse.error());
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

    // setLoading(true) fires synchronously before the first await in login(),
    // so it is committed by the time userEvent.click resolves.
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

  it('stores the token and navigates to /languageselection when the response includes a token', async () => {
    const user = userEvent.setup();
    const { router } = await renderWithAuth(<AuthProbe />);

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('fake-jwt-register');
    });
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/languageselection');
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

  it('sets error to the server message on failure', async () => {
    const user = userEvent.setup();

    server.use(
      http.post('*/api/auth/register', () =>
        HttpResponse.json({ message: 'Email already in use' }, { status: 409 })
      )
    );

    await renderWithAuth(<AuthProbe />);

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Email already in use'
      );
    });
  });

  it('sets error to the fallback string when the request fails with no server message', async () => {
    const user = userEvent.setup();

    server.use(http.post('*/api/auth/register', () => HttpResponse.error()));

    await renderWithAuth(<AuthProbe />);

    await user.click(screen.getByRole('button', { name: /register/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Signup failed, please try again'
      );
    });
  });

  it('sets loading=true during the call and loading=false after it resolves', async () => {
    const user = userEvent.setup();
    let resolveRegister!: (value: Response) => void;

    server.use(
      http.post('*/api/auth/register', () => {
        return new Promise<Response>((resolve) => {
          resolveRegister = resolve;
        });
      })
    );

    await renderWithAuth(<AuthProbe />);

    await user.click(screen.getByRole('button', { name: /register/i }));

    expect(screen.getByTestId('loading')).toHaveTextContent('yes');

    resolveRegister(HttpResponse.json({ access_token: 'fake-jwt-register' }));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('no');
    });
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
    // Suppress React's own console.error output for the uncaught render error.
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<AuthProbe />);
    }).toThrow('useAuth must be used within AuthProvider');

    consoleSpy.mockRestore();
  });
});
