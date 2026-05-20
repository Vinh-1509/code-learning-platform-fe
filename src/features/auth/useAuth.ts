// src/features/auth/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from './authContext';

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
}
