import { redisClient } from '../../config/redis.config';
import { env } from '../../config/env.config';
import { User, IUser } from '../user/user.model';
import { generateOtp, hashOtp, verifyOtpHash, hashPassword, verifyPassword } from '../../utils/crypto.utils';
import { generateEchoId } from '../../utils/echoId.util';
import {
  generateAccessToken,
  generateRefreshToken,
  generateRegistrationToken,
  verifyToken
} from '../../utils/jwt.utils';
import { ApiError } from '../../utils/ApiError';
import { EmailService } from '../../services/email.service';

export class AuthService {
  /**
   * Sends an OTP to the specified email, using Redis for TTL & rate-limiting.
   */
  static async sendOtp(email: string): Promise<{ message: string; expiresIn: number }> {
    const rateLimitKey = `ratelimit:otp:${email}`;
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp_attempts:${email}`;

    // Check rate limit (max 3 requests in 5 mins)
    const currentCountStr = await redisClient.get(rateLimitKey);
    const currentCount = currentCountStr ? parseInt(currentCountStr, 10) : 0;

    if (currentCount >= 3) {
      throw new ApiError(429, 'Too many OTP requests. Please wait 5 minutes before trying again.');
    }

    const otp = env.MOCK_OTP ? env.DEFAULT_MOCK_OTP : generateOtp();
    const otpHash = hashOtp(otp);

    // Save hashed OTP in Redis with 5 min (300s) TTL
    await redisClient.set(otpKey, otpHash, { EX: 300 });
    // Reset attempt counter
    await redisClient.del(attemptsKey);

    // Update rate limit counter (TTL 300s)
    if (currentCount === 0) {
      await redisClient.set(rateLimitKey, '1', { EX: 300 });
    } else {
      await redisClient.incr(rateLimitKey);
    }

    console.log(`🔑 [AUTH] OTP generated for ${email}: ${otp} (Mock Mode: ${env.MOCK_OTP})`);

    // Send verification email via EmailService
    await EmailService.sendVerificationOtp(email, otp);

    return {
      message: env.MOCK_OTP ? 'OTP sent successfully (Mock Code: 123456)' : 'OTP sent successfully',
      expiresIn: 300
    };
  }

  /**
   * Verifies an OTP for an email. Returns tokens if returning user, or registrationToken if new user.
   */
  static async verifyOtp(
    email: string,
    otp: string
  ): Promise<{
    accessToken?: string;
    refreshToken?: string;
    registrationToken?: string;
    isNewUser: boolean;
    user?: Partial<IUser>;
  }> {
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp_attempts:${email}`;

    // Check attempts limit (max 5 failed attempts)
    const attemptsStr = await redisClient.get(attemptsKey);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

    if (attempts >= 5) {
      throw new ApiError(429, 'Maximum failed attempts reached. Please request a new OTP.');
    }

    const isMock = env.MOCK_OTP && otp === env.DEFAULT_MOCK_OTP;

    if (!isMock) {
      const storedHash = await redisClient.get(otpKey);
      if (!storedHash) {
        await redisClient.incr(attemptsKey);
        throw new ApiError(400, 'OTP expired or not found. Please request a new OTP.');
      }

      const isValid = verifyOtpHash(otp, storedHash);
      if (!isValid) {
        await redisClient.incr(attemptsKey);
        throw new ApiError(400, 'Invalid OTP code.');
      }
    }

    // Clean up Redis keys on success
    await redisClient.del(otpKey);
    await redisClient.del(attemptsKey);

    // Check if user exists in MongoDB
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const accessToken = generateAccessToken(
        existingUser._id.toString(),
        existingUser.email,
        existingUser.echoId
      );
      const refreshToken = generateRefreshToken(
        existingUser._id.toString(),
        existingUser.email
      );

      existingUser.refreshToken = refreshToken;
      existingUser.lastActive = new Date();
      existingUser.presenceStatus = 'online';
      await existingUser.save();

      return {
        accessToken,
        refreshToken,
        isNewUser: false,
        user: {
          _id: existingUser._id,
          email: existingUser.email,
          username: existingUser.username,
          echoId: existingUser.echoId,
          mood: existingUser.mood,
          trustScore: existingUser.trustScore
        }
      };
    }

    // New User: issue temporary registration token
    const registrationToken = generateRegistrationToken(email);
    return {
      registrationToken,
      isNewUser: true
    };
  }

  /**
   * Logs in a user using email and password.
   */
  static async loginWithPassword(
    email: string,
    password: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<IUser>;
  }> {
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new ApiError(400, 'Invalid email or password.');
    }

    if (!existingUser.passwordHash) {
      throw new ApiError(
        400,
        'No password set for this account yet. Please log in using OTP or set a password via OTP reset.'
      );
    }

    const isValid = verifyPassword(password, existingUser.passwordHash);
    if (!isValid) {
      throw new ApiError(400, 'Invalid email or password.');
    }

    const accessToken = generateAccessToken(
      existingUser._id.toString(),
      existingUser.email,
      existingUser.echoId
    );
    const refreshToken = generateRefreshToken(
      existingUser._id.toString(),
      existingUser.email
    );

    existingUser.refreshToken = refreshToken;
    existingUser.lastActive = new Date();
    existingUser.presenceStatus = 'online';
    await existingUser.save();

    return {
      accessToken,
      refreshToken,
      user: {
        _id: existingUser._id,
        email: existingUser.email,
        username: existingUser.username,
        echoId: existingUser.echoId,
        mood: existingUser.mood,
        trustScore: existingUser.trustScore
      }
    };
  }

  /**
   * Registers a new user with chosen username, password, and generated EchoID.
   */
  static async registerUser(
    email: string,
    username: string,
    password?: string
  ): Promise<{
    accessToken: string;
    refreshToken: string;
    user: Partial<IUser>;
  }> {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new ApiError(400, 'User already registered. Please log in.');
    }

    // Generate unique EchoID with collision check loop
    let echoId = '';
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      echoId = generateEchoId();
      const existingEcho = await User.findOne({ echoId });
      if (!existingEcho) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      throw new ApiError(500, 'Failed to generate unique EchoID. Please try again.');
    }

    const passwordHash = password ? hashPassword(password) : undefined;

    const newUser = new User({
      email,
      username,
      echoId,
      passwordHash,
      trustScore: 100,
      presenceStatus: 'online',
      lastActive: new Date()
    });

    const accessToken = generateAccessToken(newUser._id.toString(), newUser.email, newUser.echoId);
    const refreshToken = generateRefreshToken(newUser._id.toString(), newUser.email);

    newUser.refreshToken = refreshToken;
    await newUser.save();

    return {
      accessToken,
      refreshToken,
      user: {
        _id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        echoId: newUser.echoId,
        trustScore: newUser.trustScore,
        mood: newUser.mood
      }
    };
  }

  /**
   * Refresh token rotation logic.
   */
  static async refreshTokens(
    refreshTokenStr: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const payload = verifyToken(refreshTokenStr);
    if (payload.type !== 'refresh' || !payload.userId) {
      throw new ApiError(401, 'Invalid refresh token payload');
    }

    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== refreshTokenStr) {
      throw new ApiError(401, 'Refresh token revoked or invalid');
    }

    const newAccessToken = generateAccessToken(user._id.toString(), user.email, user.echoId);
    const newRefreshToken = generateRefreshToken(user._id.toString(), user.email);

    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    };
  }

  /**
   * Resets password after verifying an OTP sent to email.
   */
  static async resetPasswordWithOtp(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const otpKey = `otp:${email}`;
    const attemptsKey = `otp_attempts:${email}`;

    const attemptsStr = await redisClient.get(attemptsKey);
    const attempts = attemptsStr ? parseInt(attemptsStr, 10) : 0;

    if (attempts >= 5) {
      throw new ApiError(429, 'Maximum failed attempts reached. Please request a new OTP.');
    }

    const isMock = env.MOCK_OTP && otp === env.DEFAULT_MOCK_OTP;

    if (!isMock) {
      const storedHash = await redisClient.get(otpKey);
      if (!storedHash) {
        await redisClient.incr(attemptsKey);
        throw new ApiError(400, 'OTP expired or not found. Please request a new OTP.');
      }

      const isValid = verifyOtpHash(otp, storedHash);
      if (!isValid) {
        await redisClient.incr(attemptsKey);
        throw new ApiError(400, 'Invalid OTP code.');
      }
    }

    await redisClient.del(otpKey);
    await redisClient.del(attemptsKey);

    const user = await User.findOne({ email });
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    user.passwordHash = hashPassword(newPassword);
    await user.save();

    return { message: 'Password has been updated successfully.' };
  }

  /**
   * Changes current password for an authenticated user.
   */
  static async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User not found.');
    }

    if (!user.passwordHash) {
      throw new ApiError(400, 'No existing password found. Please use OTP reset to create a password.');
    }

    const isValid = verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new ApiError(400, 'Current password is incorrect.');
    }

    user.passwordHash = hashPassword(newPassword);
    await user.save();

    return { message: 'Password updated successfully.' };
  }

  /**
   * Logout user by clearing refresh token and setting presence offline.
   */
  static async logout(userId: string): Promise<{ message: string }> {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = undefined;
      user.presenceStatus = 'offline';
      await user.save();
    }
    return { message: 'Logged out successfully' };
  }
}

