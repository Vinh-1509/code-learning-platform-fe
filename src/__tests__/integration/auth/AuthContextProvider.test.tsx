import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '@/features/auth/AuthContextProvider';
import { useAuth } from '@/features/auth/useAuth';

// ── Mocks ─────────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn();

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@/lib/axios', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  getMe: vi.fn(),
}));

import { loginUser, registerUser, getMe } from '@/lib/axios';

const mockLoginUser = vi.mocked(loginUser);
const mockRegisterUser = vi.mocked(registerUser);
const mockGetMe = vi.mocked(getMe);

// ── Types ─────────────────────────────────────────────────────────────────────
type MockUser = Awaited<ReturnType<typeof getMe>>;
type MockAuthResponse = Awaited<ReturnType<typeof loginUser>>;

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeUser(overrides: Partial<MockUser> = {}): MockUser {
  return {
    _id: 'user-1',
    email: 'test@example.com',
    createdAt: '2024-01-01T00:00:00Z',
    selectedLanguage: ['C++'],
    ...overrides,
  };
}

function makeAuthResponse(token: string): MockAuthResponse {
  return { access_token: token };
}

// Builds an error object that satisfies axios.isAxiosError() without needing
// to mock the axios package. The real check is just `err.isAxiosError === true`.
function makeAxiosError(message: string, status = 401) {
  return Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: { status, data: { message } },
  });
}

const CREDENTIALS = { email: 'test@example.com', password: 'password123' };
const ACCESS_TOKEN = 'test.jwt.token';

// ── Test consumer ─────────────────────────────────────────────────────────────

// Renders every piece of context state as text so tests can assert without
// knowing implementation details of the rendered UI.
function TestConsumer() {
  const { token, user, loading, error, login, register, logout } = useAuth();
  return (
    <div>
      <span data-testid="token">{token ?? 'null'}</span>
      <span data-testid="user">{user?.email ?? 'null'}</span>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="error">{error ?? 'null'}</span>
      <button onClick={() => void login(CREDENTIALS)}>Login</button>
      <button onClick={() => void register(CREDENTIALS)}>Register</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

function renderProvider() {
  render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

// ── Initial state ─────────────────────────────────────────────────────────────

describe('AuthProvider — initial state', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetMe.mockReset();
    mockNavigate.mockReset();
  });

  it('starts with null token, null user, loading=false, and null error when localStorage is empty', async () => {
    renderProvider();

    // The mount effect sees no token and short-circuits — no getMe call.
    // waitFor lets React flush the effect before we assert.
    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('null');
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });
  });

  it('reads an existing token from localStorage on mount and fetches the user', async () => {
    localStorage.setItem('token', ACCESS_TOKEN);
    mockGetMe.mockResolvedValueOnce(makeUser());

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent(ACCESS_TOKEN);
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
    });
    expect(mockGetMe).toHaveBeenCalledOnce();
  });

  it('leaves user as null when getMe() rejects on mount', async () => {
    localStorage.setItem('token', ACCESS_TOKEN);
    mockGetMe.mockRejectedValueOnce(new Error('Server error'));

    renderProvider();

    await waitFor(() => {
      expect(screen.getByTestId('user')).toHaveTextContent('null');
    });
  });
});

// ── login() ───────────────────────────────────────────────────────────────────

describe('AuthProvider — login()', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetMe.mockReset();
    mockLoginUser.mockReset();
    mockNavigate.mockReset();

    // A successful login calls setToken(), which triggers the token-change effect,
    // which calls getMe(). Set a default so that effect always settles cleanly.
    mockGetMe.mockResolvedValue(makeUser());
  });

  it('stores the access token in localStorage on success', async () => {
    mockLoginUser.mockResolvedValueOnce(makeAuthResponse(ACCESS_TOKEN));

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(ACCESS_TOKEN);
    });
  });

  it('updates the token in context state on success', async () => {
    mockLoginUser.mockResolvedValueOnce(makeAuthResponse(ACCESS_TOKEN));

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent(ACCESS_TOKEN);
    });
  });

  it('navigates to /languageselection on success', async () => {
    mockLoginUser.mockResolvedValueOnce(makeAuthResponse(ACCESS_TOKEN));

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/languageselection' });
    });
  });

  it('sets error to the server message when the API returns one', async () => {
    mockLoginUser.mockRejectedValueOnce(makeAxiosError('Invalid credentials'));

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Invalid credentials'
      );
    });
  });

  it('sets error to the fallback string for non-Axios errors', async () => {
    mockLoginUser.mockRejectedValueOnce(new Error('Network Error'));

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Login failed, please try again'
      );
    });
  });

  it('does not store a token when login fails', async () => {
    mockLoginUser.mockRejectedValueOnce(makeAxiosError('Bad credentials'));

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    // Wait for the error to confirm the call settled
    await waitFor(() => {
      expect(screen.getByTestId('error')).not.toHaveTextContent('null');
    });

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('clears a previous error at the start of a new login attempt', async () => {
    // First attempt — fail
    mockLoginUser.mockRejectedValueOnce(makeAxiosError('Bad credentials'));
    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('Bad credentials');
    });

    // Second attempt — succeed; error must be gone
    mockLoginUser.mockResolvedValueOnce(makeAuthResponse(ACCESS_TOKEN));
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));
    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('null');
    });
  });

  it('sets loading=true during the call and loading=false after', async () => {
    // Hold the login promise open so we can observe the in-flight state.
    let resolveLogin!: (value: MockAuthResponse) => void;
    mockLoginUser.mockReturnValueOnce(
      new Promise((res) => {
        resolveLogin = res;
      })
    );

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    // setLoading(true) fires synchronously before the first await in login(),
    // so it is committed by the time userEvent.click resolves.
    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    resolveLogin(makeAuthResponse(ACCESS_TOKEN));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });
});

// ── register() ────────────────────────────────────────────────────────────────

describe('AuthProvider — register()', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetMe.mockReset();
    mockRegisterUser.mockReset();
    mockNavigate.mockReset();

    mockGetMe.mockResolvedValue(makeUser());
  });

  it('stores the token and navigates to /languageselection when the response includes a token', async () => {
    mockRegisterUser.mockResolvedValueOnce(makeAuthResponse(ACCESS_TOKEN));

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe(ACCESS_TOKEN);
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/languageselection' });
    });
  });

  it('navigates to /login and does not store a token when the response has no token', async () => {
    // Empty access_token is falsy — triggers the else branch in register()
    mockRegisterUser.mockResolvedValueOnce({ access_token: '' });

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
    });
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('sets error to the server message on failure', async () => {
    mockRegisterUser.mockRejectedValueOnce(
      makeAxiosError('Email already in use', 409)
    );

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Email already in use'
      );
    });
  });

  it('sets error to the fallback string for non-Axios errors', async () => {
    mockRegisterUser.mockRejectedValueOnce(new Error('Network Error'));

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Signup failed, please try again'
      );
    });
  });

  it('sets loading=true during the call and loading=false after', async () => {
    let resolveRegister!: (value: MockAuthResponse) => void;
    mockRegisterUser.mockReturnValueOnce(
      new Promise((res) => {
        resolveRegister = res;
      })
    );

    renderProvider();
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(screen.getByTestId('loading')).toHaveTextContent('true');

    resolveRegister(makeAuthResponse(ACCESS_TOKEN));

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });
  });
});

// ── logout() ──────────────────────────────────────────────────────────────────

describe('AuthProvider — logout()', () => {
  beforeEach(() => {
    localStorage.clear();
    mockGetMe.mockReset();
    mockNavigate.mockReset();
  });

  // Helper: render with a user already logged in and wait for state to settle.
  async function renderLoggedIn() {
    localStorage.setItem('token', ACCESS_TOKEN);
    mockGetMe.mockResolvedValueOnce(makeUser());
    renderProvider();
    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent(ACCESS_TOKEN);
    });
  }

  it('removes the token from localStorage', async () => {
    await renderLoggedIn();

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

    expect(localStorage.getItem('token')).toBeNull();
  });

  it('clears the token from context state', async () => {
    await renderLoggedIn();

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

    await waitFor(() => {
      expect(screen.getByTestId('token')).toHaveTextContent('null');
    });
  });

  it('navigates to /login', async () => {
    await renderLoggedIn();

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));

    expect(mockNavigate).toHaveBeenCalledWith({ to: '/login' });
  });
});

// ── useAuth() outside provider ────────────────────────────────────────────────

describe('useAuth() outside AuthProvider', () => {
  it('throws with a descriptive error message', () => {
    // Suppress React's own console.error output for the uncaught render error
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow('useAuth must be used within AuthProvider');

    consoleSpy.mockRestore();
  });
});
