import { Types } from 'mongoose';
import { Wave, IWave } from './wave.model';
import { Icebreaker } from './icebreaker.model';
import { User } from '../user/user.model';
import { Conversation } from '../chat/conversation.model';
import { redisClient } from '../../config/redis.config';
import { TrustService } from '../moderation/trust.service';
import { ContentFilterService } from '../moderation/contentFilter.service';

const DEFAULT_ICEBREAKERS = [
  { text: "What's the best book or movie you recently experienced?", category: 'General' },
  { text: "Coffee, tea, or energy drinks for productive work?", category: 'Casual' },
  { text: "What project or skill are you currently building?", category: 'Campus' },
  { text: "If you could instantly master any technology, what would it be?", category: 'Deep' },
  { text: "What's your go-to playlist while working?", category: 'Music' }
];

export class WaveService {
  /**
   * Seed default icebreakers if none exist
   */
  public static async seedIcebreakers(): Promise<void> {
    const count = await Icebreaker.countDocuments();
    if (count === 0) {
      await Icebreaker.insertMany(DEFAULT_ICEBREAKERS);
      console.log('🌱 Default Icebreakers seeded.');
    }
  }

  /**
   * Get all active icebreakers
   */
  public static async getIcebreakers() {
    await this.seedIcebreakers();
    return Icebreaker.find({ isActive: true }).select('id text category');
  }

  /**
   * Send a wave to a target user (by targetEchoId or targetUserId)
   */
  public static async sendWave(
    senderId: string,
    targetEchoId: string,
    iceBreakerText?: string
  ): Promise<{ wave: IWave; targetUserId: string }> {
    // 1. Trust Score Permission Check
    const permissions = await TrustService.getUserPermissions(senderId);
    if (!permissions.canSendWave) {
      throw new Error(
        'TRUST_SCORE_RESTRICTED: Your trust score restricts you from sending waves right now.'
      );
    }

    // 2. Content Moderation Check on Icebreaker / Custom Message
    if (iceBreakerText) {
      const filterResult = ContentFilterService.containsBadWords(iceBreakerText);
      if (filterResult.contains) {
        await TrustService.adjustTrustScore(senderId, -5, 'BAD_WORDS_VIOLATION');
        throw new Error('CONTENT_VIOLATION: Icebreaker contains inappropriate language.');
      }
    }

    // 3. Rate limiting via Redis based on Trust Tier quota
    const quota = permissions.waveQuotaPerHour || 10;
    const rateLimitKey = `ratelimit:wave:${senderId}`;
    const waveCount = await redisClient.incr(rateLimitKey);
    if (waveCount === 1) {
      await redisClient.expire(rateLimitKey, 3600); // 1 hour TTL
    }
    if (waveCount > quota) {
      throw new Error(`WAVE_RATE_LIMIT_EXCEEDED: Maximum ${quota} waves per hour allowed.`);
    }

    // 4. Find target user
    const targetUser = await User.findOne({ echoId: targetEchoId.toUpperCase() });
    if (!targetUser) {
      throw new Error('TARGET_USER_NOT_FOUND: User with specified EchoID not found.');
    }

    const targetUserId = targetUser._id.toString();
    if (senderId === targetUserId) {
      throw new Error('CANNOT_WAVE_SELF: You cannot send a wave to yourself.');
    }

    // 5. Check if sender is blocked by target user or target user is blocked by sender
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

    // 6. Check for existing pending wave or existing active conversation
    const existingWave = await Wave.findOne({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(targetUserId),
      status: 'pending'
    });

    if (existingWave) {
      throw new Error('WAVE_ALREADY_PENDING: You already sent a pending wave to this user.');
    }

    const existingConversation = await Conversation.findOne({
      participants: { $all: [new Types.ObjectId(senderId), new Types.ObjectId(targetUserId)] },
      status: { $in: ['active', 'sleeping', 'saved'] }
    });

    if (existingConversation) {
      throw new Error('CONVERSATION_EXISTS: Active conversation already exists.');
    }

    // 7. Create wave
    const wave = await Wave.create({
      senderId: new Types.ObjectId(senderId),
      receiverId: new Types.ObjectId(targetUserId),
      iceBreaker: iceBreakerText || undefined,
      status: 'pending'
    });

    return { wave, targetUserId };
  }

  /**
   * Get pending waves received by user
   */
  public static async getPendingWaves(receiverId: string) {
    const waves = await Wave.find({
      receiverId: new Types.ObjectId(receiverId),
      status: 'pending'
    })
      .populate('senderId', 'username echoId mood presenceStatus locationLabel')
      .sort({ createdAt: -1 });

    return waves.map((wave) => {
      const sender = wave.senderId as unknown as {
        _id: Types.ObjectId;
        username: string;
        echoId: string;
        mood: string;
        presenceStatus: string;
        locationLabel: string;
      };
      return {
        id: wave._id.toString(),
        fromUser: {
          id: sender._id.toString(),
          username: sender.username,
          echoId: sender.echoId,
          mood: sender.mood,
          presence: sender.presenceStatus,
          locationLabel: sender.locationLabel
        },
        icebreaker: wave.iceBreaker || null,
        createdAt: wave.createdAt
      };
    });
  }

  /**
   * Accept wave -> Creates new Conversation & rewards trust scores
   */
  public static async acceptWave(waveId: string, receiverId: string) {
    const wave = await Wave.findById(waveId);
    if (!wave) {
      throw new Error('WAVE_NOT_FOUND');
    }

    if (wave.receiverId.toString() !== receiverId) {
      throw new Error('UNAUTHORIZED_WAVE_ACTION');
    }

    if (wave.status !== 'pending') {
      throw new Error(`WAVE_INVALID_STATUS: Wave is already ${wave.status}`);
    }

    // Update wave status
    wave.status = 'accepted';
    wave.respondedAt = new Date();
    await wave.save();

    // Reward both users with +2 Trust Score for positive interaction
    await TrustService.adjustTrustScore(wave.senderId, 2, 'ACCEPTED_CHAT');
    await TrustService.adjustTrustScore(wave.receiverId, 2, 'ACCEPTED_CHAT');

    // Check if conversation already exists or create new one
    let conversation = await Conversation.findOne({
      participants: { $all: [wave.senderId, wave.receiverId] },
      status: { $in: ['active', 'sleeping', 'saved'] }
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [wave.senderId, wave.receiverId],
        status: 'active',
        lastActivityAt: new Date()
      });
    }

    return {
      conversationId: conversation._id.toString(),
      senderId: wave.senderId.toString(),
      receiverId: wave.receiverId.toString()
    };
  }

  /**
   * Ignore wave (silent on sender's end)
   */
  public static async ignoreWave(waveId: string, receiverId: string) {
    const wave = await Wave.findById(waveId);
    if (!wave) {
      throw new Error('WAVE_NOT_FOUND');
    }

    if (wave.receiverId.toString() !== receiverId) {
      throw new Error('UNAUTHORIZED_WAVE_ACTION');
    }

    wave.status = 'ignored';
    wave.respondedAt = new Date();
    await wave.save();

    return { message: 'Wave ignored successfully' };
  }

  /**
   * Block user via wave
   */
  public static async blockUserViaWave(waveId: string, receiverId: string) {
    const wave = await Wave.findById(waveId);
    if (!wave) {
      throw new Error('WAVE_NOT_FOUND');
    }

    if (wave.receiverId.toString() !== receiverId) {
      throw new Error('UNAUTHORIZED_WAVE_ACTION');
    }

    wave.status = 'blocked';
    wave.respondedAt = new Date();
    await wave.save();

    // Add sender to receiver's blocked users
    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { blockedUsers: wave.senderId }
    });

    return { message: 'User blocked successfully' };
  }
}
