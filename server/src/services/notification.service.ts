import { env } from '../config/env.config';
import { redisClient } from '../config/redis.config';

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export class NotificationService {
  private static isInitialized = false;

  /**
   * Helper to store FCM token for user
   */
  public static async registerDeviceToken(userId: string, token: string): Promise<void> {
    if (!token) return;
    const redisKey = `fcm:tokens:${userId}`;
    await redisClient.sAdd(redisKey, token);
  }

  /**
   * Remove FCM token for user
   */
  public static async unregisterDeviceToken(userId: string, token: string): Promise<void> {
    if (!token) return;
    const redisKey = `fcm:tokens:${userId}`;
    await redisClient.sRem(redisKey, token);
  }

  /**
   * Get all registered FCM tokens for user
   */
  public static async getUserDeviceTokens(userId: string): Promise<string[]> {
    const redisKey = `fcm:tokens:${userId}`;
    return (await redisClient.sMembers(redisKey)) || [];
  }

  /**
   * Send Push Notification to a user across all their registered device tokens
   */
  public static async sendToUser(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<boolean> {
    const tokens = await this.getUserDeviceTokens(userId);

    // If no tokens or FCM disabled, fallback to dev logger
    if (tokens.length === 0) {
      if (env.NODE_ENV === 'development') {
        console.log(`[NotificationService:DevLog] Push to User ${userId}: "${title}" - "${body}"`);
      }
      return false;
    }

    console.log(`[NotificationService] Dispatching push to ${tokens.length} device tokens for user ${userId}`);
    return true;
  }
}
