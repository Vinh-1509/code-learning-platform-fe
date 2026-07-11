import { api } from '@/lib/axios';
import type { AuthPayload, AuthUserResponse } from '@/types/auth';
import {
  AuthResponseSchema,
  AuthUserResponseSchema,
  type AuthResponse,
} from '../auth.schema';
/**
 * Authenticates a user and validates the token payload at runtime.
 */
export async function loginUser(payload: AuthPayload): Promise<AuthResponse> {
  // Pass 'unknown' to axios generic to prevent ESLint 'any' destructuring rule violations
  const { data } = await api.post<unknown>('/api/auth/login', payload);
  return AuthResponseSchema.parse(data);
}

/**
 * Registers a new user account and guarantees validation of the session token.
 */
export async function registerUser(
  payload: AuthPayload
): Promise<AuthResponse> {
  const { data } = await api.post<unknown>('/api/auth/register', payload);
  return AuthResponseSchema.parse(data);
}

/**
 * Retrieves and strictly verifies the currently logged-in user profile.
 */
export async function getMe(): Promise<AuthUserResponse> {
  const { data } = await api.get<unknown>('/api/auth/me');
  return AuthUserResponseSchema.parse(data);
}

/**
 * Partially update the authenticated user's profile.
 * Currently used for persisting onboarding-tour completion (`hasSeenTour`),
 * but supports `username` / `fullName` too per the API contract.
 */
export async function updateMe(
  payload: Partial<
    Pick<AuthUserResponse, 'username' | 'fullName' | 'hasSeenTour'>
  >
): Promise<AuthUserResponse> {
  const { data } = await api.patch<unknown>('/api/auth/me', payload);
  return AuthUserResponseSchema.parse(data);
}
