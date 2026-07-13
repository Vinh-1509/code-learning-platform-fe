import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { SignupForm } from '@/features/auth/SignupForm';

import { renderWithRouter } from '../../../helpers/renderWithRouter';

describe('SignupForm', () => {
  it('does not call onSubmit when passwords do not match', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    await renderWithRouter(<SignupForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'new@hcmut.edu.vn');
    await user.type(
      screen.getByPlaceholderText(/min\. 8 characters/i),
      'Password123!'
    );
    await user.type(
      screen.getByPlaceholderText(/repeat your password/i),
      'DifferentPassword123!'
    );
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('calls onSubmit when passwords match', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    await renderWithRouter(<SignupForm onSubmit={onSubmit} />);

    await user.type(screen.getByLabelText(/email/i), 'new@hcmut.edu.vn');
    await user.type(
      screen.getByPlaceholderText(/min\. 8 characters/i),
      'Password123!'
    );
    await user.type(
      screen.getByPlaceholderText(/repeat your password/i),
      'Password123!'
    );
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'new@hcmut.edu.vn',
        password: 'Password123!',
      });
    });
  });

  it('shows an error message when the error prop is set', async () => {
    await renderWithRouter(
      <SignupForm onSubmit={vi.fn()} error="Email already exists" />
    );

    expect(screen.getByText('Email already exists')).toBeInTheDocument();
  });

  it('shows loading text on the submit button while loading', async () => {
    await renderWithRouter(<SignupForm onSubmit={vi.fn()} loading />);

    expect(
      screen.getByRole('button', { name: /creating account/i })
    ).toBeInTheDocument();
  });
});
