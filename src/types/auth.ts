export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token?: string;
  message?: string;
}

export interface AuthUserResponse {
  _id: string;
  email: string;
  username?: string;
  fullName?: string;
  selectedLanguage?: string[];
  createdAt: string;
  coins: number;
}
