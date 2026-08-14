import { Types } from 'mongoose';
import { Compliment, ICompliment } from './compliment.model';
import { COMPLIMENT_TEMPLATES, getTemplateById } from './compliment.templates';
import { User } from '../user/user.model';
import { redisClient } from '../../config/redis.config';
import { TrustService } from '../moderation/trust.service';
import { getIO } from '../../socket/presence.handler';
import { NotificationService } from '../../services/notification.service';

export class ComplimentService {
  /**
   * Helper to get current UTC Date string (YYYY-MM-DD)
   */
  private static getTodayDateKey(): { dateKey: string; secondsUntilMidnight: number } {
    const now = new Date();
    const dateKey = now.toISOString().split('T')[0]; // e.g. "2026-08-01"

    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0); // Next UTC Midnight

    const secondsUntilMidnight = Math.max(1, Math.floor((tomorrow.getTime() - now.getTime()) / 1000));
    return { dateKey, secondsUntilMidnight };
  }

  /**
   * Get template library grouped by categories
   */
  public static getTemplates() {
    return COMPLIMENT_TEMPLATES;
  }

  /**
   * Get daily compliment status for a user
   */
  public static async getDailyStatus(senderId: string): Promise<{
    available: boolean;
    resetInSeconds: number;
    dateKey: string;
  }> {
    const { dateKey, secondsUntilMidnight } = this.getTodayDateKey();
    const redisKey = `compliment:daily:${senderId}:${dateKey}`;

    const sent = await redisClient.get(redisKey);
    return {
      available: !sent,
      resetInSeconds: secondsUntilMidnight,
      dateKey
    };
  }

  /**
   * Send a secret anonymous compliment to a nearby user
   */
  public static async sendCompliment(
    senderId: string,
    targetEchoId: string,
    templateId: string
  ): Promise<{ complimentId: string; message: string }> {
    // 1. Trust Score check
    const permissions = await TrustService.getUserPermissions(senderId);
    if (!permissions.canSendWave || permissions.tier === 'banned') {
      throw new Error(
        'TRUST_SCORE_RESTRICTED: Your trust score restricts you from sending compliments right now.'
      );
    }


    // 2. Validate template
    const template = getTemplateById(templateId);
    if (!template) {
      throw new Error('INVALID_TEMPLATE: Selected compliment template does not exist.');
    }

    // 3. Find target user
    const targetUser = await User.findOne({ echoId: targetEchoId.toUpperCase() });
    if (!targetUser) {
      throw new Error('TARGET_USER_NOT_FOUND: User with specified EchoID not found.');
    }

    const targetUserId = targetUser._id.toString();
    if (senderId === targetUserId) {
      throw new Error('CANNOT_COMPLIMENT_SELF: You cannot send a compliment to yourself.');
    }

    // 4. Block check
    const sender = await User.findById(senderId);
    if (!sender) {
      throw new Error('SENDER_NOT_FOUND');
    }

    if (
      sender.blockedUsers.some((id) => id.toString() === targetUserId) ||
      targetUser.blockedUsers.some((id) => id.toString() === senderId)
    ) {
      throw new Error('USER_BLOCKED: Interaction blocked between users.');
    }

    // 5. Daily limit check via Redis atomic SET NX EX
    const { dateKey, secondsUntilMidnight } = this.getTodayDateKey();
    const redisKey = `compliment:daily:${senderId}:${dateKey}`;

    // Redis SET key 1 EX secondsUntilMidnight NX
    const lockAcquired = await redisClient.set(redisKey, '1', {
      EX: secondsUntilMidnight,
      NX: true
    });

    if (!lockAcquired) {
      throw new Error('DAILY_LIMIT_REACHED: You have already sent your 1 Secret Compliment for today.');
    }

    // 6. Create Compliment Record
    const compliment: ICompliment = await Compliment.create({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(targetUserId),
      templateId: template.id,
      templateCategory: template.category,
      templateText: template.text
    });

    // 7. Reward +1 Trust Score for positive action
    await TrustService.adjustTrustScore(senderId, 1, 'SENT_COMPLIMENT');

    // 8. Socket IO Real-time Notification (Strictly Anonymous — No senderId!)
    try {
      const io = getIO();
      if (io) {
        io.to(`user:${targetUserId}`).emit('compliment:received', {
          id: compliment._id.toString(),
          category: template.category,
          text: template.text,
          receivedAt: compliment.createdAt
        });
      }
    } catch (socketErr) {
      console.warn('Socket emission for compliment skipped/failed:', socketErr);
    }

    // 9. Trigger FCM Push Notification
    NotificationService.sendToUser(
      targetUserId,
      '✨ Secret Compliment',
      'Someone nearby appreciated you with a secret compliment!',
      { type: 'compliment', complimentId: compliment._id.toString() }
    ).catch(() => {});

    return {
      complimentId: compliment._id.toString(),
      message: 'Secret compliment sent anonymously!'
    };
  }

  /**
   * Get received compliments for a user (anonymous list)
   */
  public static async getReceivedCompliments(receiverId: string) {
    const compliments = await Compliment.find({
      receiverId: new Types.ObjectId(receiverId)
    })
      .sort({ createdAt: -1 })
      .limit(50);

    return compliments.map((c) => ({
      id: c._id.toString(),
      category: c.templateCategory,
      text: c.templateText,
      receivedAt: c.createdAt
    }));
  }
}
