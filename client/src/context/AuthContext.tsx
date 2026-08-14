import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, VerifyOtpResponse } from '../types/auth';
import { api, getAccessToken, setAccessToken, setRefreshToken, clearTokens } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isNewUser: boolean;
  registrationToken: string | null;
  loading: boolean;
  loginWithOtp: (email: string, otp: string) => Promise<VerifyOtpResponse>;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  registerUsername: (username: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isNewUser, setIsNewUser] = useState<boolean>(
    Boolean(sessionStorage.getItem('echo_registration_token'))
  );
  const [registrationToken, setRegistrationToken] = useState<string | null>(
    sessionStorage.getItem('echo_registration_token')
  );

  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      const regToken = sessionStorage.getItem('echo_registration_token');
      if (token) {
        try {
          const profile = await api.getMe();
          setUser(profile);
          setIsNewUser(false);
        } catch {
          clearTokens();
          setUser(null);
        }
      } else if (regToken) {
        setIsNewUser(true);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginWithOtp = async (email: string, otp: string): Promise<VerifyOtpResponse> => {
    const res = await api.verifyOtp(email, otp);
    if (res.isNewUser && res.registrationToken) {
      setIsNewUser(true);
      setRegistrationToken(res.registrationToken);
      sessionStorage.setItem('echo_registration_token', res.registrationToken);
    } else if (res.accessToken && res.refreshToken && res.user) {
      setAccessToken(res.accessToken);
      setRefreshToken(res.refreshToken);
      setUser(res.user);
      setIsNewUser(false);
    }
    return res;
  };

  const loginWithPassword = async (email: string, password: string): Promise<void> => {
    const res = await api.loginWithPassword(email, password);
    setAccessToken(res.accessToken);
    setRefreshToken(res.refreshToken);
    setUser(res.user);
    setIsNewUser(false);
  };

  const registerUsername = async (username: string, password?: string): Promise<void> => {
    const res = await api.register(username, password, registrationToken || undefined);
    setAccessToken(res.accessToken);
    setRefreshToken(res.refreshToken);
    setUser(res.user);
    setIsNewUser(false);
    setRegistrationToken(null);
    sessionStorage.removeItem('echo_registration_token');
  };

  const refreshProfile = async (): Promise<void> => {
    try {
      const profile = await api.getMe();
      setUser(profile);
    } catch (err) {
      console.error('Failed to refresh profile:', err);
    }
  };

  const logout = async (): Promise<void> => {
    await api.logout();
    setUser(null);
    setIsNewUser(false);
    setRegistrationToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isNewUser,
        registrationToken,
        loading,
        loginWithOtp,
        loginWithPassword,
        registerUsername,
        logout,
        refreshProfile,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
