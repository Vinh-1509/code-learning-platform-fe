import { api } from '@/lib/axios';
import type { AuthPayload, AuthResponse, AuthUserResponse } from '@/types/auth';

export async function loginUser(payload: AuthPayload): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/login', payload);
  return data;
}

export async function registerUser(
  payload: AuthPayload
): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/register', payload);
  return data;
}

export async function getMe(): Promise<AuthUserResponse> {
  const { data } = await api.get<AuthUserResponse>('/api/auth/me');
  return data;
}
