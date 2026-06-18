import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { LoginForm } from '@/features/auth/LoginForm';

import { renderWithRouter } from '../../../helpers/renderWithRouter';

describe('LoginForm', () => {
  it('calls onSubmit with email and password when user signs in', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    await renderWithRouter(<LoginForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'test@hcmut.edu.vn');
    await user.type(screen.getByLabelText(/password/i), '12345678');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@hcmut.edu.vn',
        password: '12345678',
      });
    });
  });

  it('shows loading text on the submit button while loading', async () => {
    await renderWithRouter(<LoginForm onSubmit={vi.fn()} loading />);

    expect(
      screen.getByRole('button', { name: /signing in/i })
    ).toBeInTheDocument();
  });

  it('renders a link to the sign up page', async () => {
    await renderWithRouter(<LoginForm onSubmit={vi.fn()} />);

    expect(screen.getByRole('link', { name: /sign up/i })).toHaveAttribute(
      'href',
      '/signup'
    );
  });
});
