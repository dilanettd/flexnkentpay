export interface AuthStateModel {
  isAuthenticated: boolean;
  accessToken: string;
  refreshToken: string;
  role: string;
  me: IUser | null;
}

export interface IUser {
  id: string;
  facebookId?: string;
  googleId?: string;
  name: string;
  email: string;
  is_email_verified: boolean;
  phone?: string;
  is_phone_verified: boolean;
  profile_url?: string;
  phone_verified_at?: string;
  email_verified_at?: string;
  is_active: boolean;
  password: string;
  role: string;
  rememberToken?: string;
  created_at: string;
  updated_at: string;
}

export interface IUpdateMe {
  first_name?: string;
  last_name?: string;
}
