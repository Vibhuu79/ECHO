import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.config';
import { ApiError } from './ApiError';

export interface TokenPayload {
  userId?: string;
  echoId?: string;
  email: string;
  type: 'access' | 'refresh' | 'register';
}

export const generateAccessToken = (userId: string, email: string, echoId?: string): string => {
  const payload: TokenPayload = { userId, email, echoId, type: 'access' };
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRY as jwt.SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET as Secret, options);
};

export const generateRefreshToken = (userId: string, email: string): string => {
  const payload: TokenPayload = { userId, email, type: 'refresh' };
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRY as jwt.SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET as Secret, options);
};

export const generateRegistrationToken = (email: string): string => {
  const payload: TokenPayload = { email, type: 'register' };
  const options: SignOptions = { expiresIn: '15m' };
  return jwt.sign(payload, env.JWT_SECRET as Secret, options);
};

export const verifyToken = (token: string): TokenPayload => {
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET as Secret) as TokenPayload;
    return decoded;
  } catch (err: any) {
    if (err.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token has expired');
    }
    throw new ApiError(401, 'Invalid authentication token');
  }
};
