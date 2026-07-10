export type {
  AuthResponse,
  AuthUserResponse,
} from '@/features/auth/auth.schema';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}
