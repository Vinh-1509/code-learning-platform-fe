import { z } from 'zod';

/**
 * Runtime validation schema for authentication responses (Login / Register).
 * Upgraded with .optional() to handle cases where register does not return a token.
 */
export const AuthResponseSchema = z.object({
  // Added .optional() for register responses that may not return a token
  access_token: z
    .string({
      message: 'Access token must be a string',
    })
    .optional(),
  message: z.string().optional(),
});

/**
 * Runtime validation schema for the authenticated user's profile details.
 */
export const AuthUserResponseSchema = z.object({
  _id: z.string(),
  email: z.string().email('Invalid email format'),
  username: z.string().optional(),
  fullName: z.string().optional(),
  selectedLanguage: z.array(z.string()).optional(),
  createdAt: z.string(),
  coins: z.number().optional().default(0),
  hasSeenTour: z.boolean().optional().default(false),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;
export type AuthUserResponse = z.infer<typeof AuthUserResponseSchema>;
