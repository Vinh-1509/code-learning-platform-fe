import { describe, it, expect, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAuth } from '@/features/auth/useAuth';

import { renderWithAuth } from '../../../helpers/renderWithAuth';

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

describe('AuthProvider', () => {
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

  it('sets an error message when login fails', async () => {
    const user = userEvent.setup();

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

    await renderWithAuth(<BadLoginProbe />);

    await user.click(screen.getByRole('button', { name: /bad login/i }));

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(
        'Invalid email or password'
      );
    });
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('registers successfully, persists token, and navigates to language selection', async () => {
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

  it('clears auth state and navigates to login on logout', async () => {
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
