import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/jwt.utils';
import { ApiError } from '../utils/ApiError';

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
}

export const authenticateJWT = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication token missing or malformed'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = verifyToken(token);
    if (payload.type !== 'access') {
      return next(new ApiError(401, 'Invalid token type for authorization'));
    }
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};

export { AuthenticatedRequest as AuthRequest, authenticateJWT as authenticateToken };
