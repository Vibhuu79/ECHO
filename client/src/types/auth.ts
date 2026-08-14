export interface User {
  _id: string;
  id?: string;
  email: string;
  username: string;
  echoId: string;
  mood?: string | null;
  trustScore: number;
  presenceStatus?: 'online' | 'away' | 'offline';
  auraTheme?: string;
  avatarIcon?: string;
  recentUsernames?: string[];
  vibeStatus?: {
    note: string;
    expiresAt: string | null;
  };
  allowGlobalIdSearch?: boolean;
  isGhostMode?: boolean;
  createdAt?: string;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  expiresIn: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  registrationToken?: string;
  isNewUser: boolean;
  user?: User;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginPasswordResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface RefreshResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
}
