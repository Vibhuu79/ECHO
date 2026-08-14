import { Types } from 'mongoose';
import { User, IUser } from '../user/user.model';

export type TrustReason =
  | 'ACCEPTED_CHAT'
  | 'CLEAN_WEEK'
  | 'SPAM_REPORT'
  | 'ABUSE_REPORT'
  | 'INAPPROPRIATE_CONTENT'
  | 'USER_BLOCKED'
  | 'BAD_WORDS_VIOLATION'
  | 'FALSE_REPORT'
  | 'SENT_COMPLIMENT';


export interface UserPermissions {
  trustScore: number;
  tier: 'excellent' | 'good' | 'restricted' | 'banned';
  canSendWave: boolean;
  waveQuotaPerHour: number;
  canCreateSpark: boolean;
  isRestricted: boolean;
}

export class TrustService {
  /**
   * Adjusts a user's hidden trust score by delta and handles automated restriction thresholds
   */
  static async adjustTrustScore(
    userId: string | Types.ObjectId,
    delta: number,
    reason?: TrustReason
  ): Promise<IUser | null> {
    const user = await User.findById(userId);
    if (!user) return null;

    let newScore = (user.trustScore ?? 100) + delta;
    if (newScore > 100) newScore = 100;
    if (newScore < 0) newScore = 0;

    user.trustScore = newScore;

    // Automatically trigger account restriction if score drops below 40
    if (newScore < 40) {
      user.isRestricted = true;
    }

    await user.save();
    return user;
  }

  /**
   * Evaluates user permissions based on their hidden trust score
   */
  static async getUserPermissions(
    userId: string | Types.ObjectId
  ): Promise<UserPermissions> {
    const user = await User.findById(userId).select('trustScore isRestricted');
    const score = user?.trustScore ?? 100;
    const isRestricted = user?.isRestricted ?? false;

    if (isRestricted || score < 40) {
      return {
        trustScore: score,
        tier: 'banned',
        canSendWave: false,
        waveQuotaPerHour: 0,
        canCreateSpark: false,
        isRestricted: true
      };
    }

    if (score >= 80) {
      return {
        trustScore: score,
        tier: 'excellent',
        canSendWave: true,
        waveQuotaPerHour: 10,
        canCreateSpark: true,
        isRestricted: false
      };
    }

    if (score >= 60) {
      return {
        trustScore: score,
        tier: 'good',
        canSendWave: true,
        waveQuotaPerHour: 5,
        canCreateSpark: true,
        isRestricted: false
      };
    }

    // 40 - 59: Restricted (Can only respond to incoming waves/chats, cannot initiate)
    return {
      trustScore: score,
      tier: 'restricted',
      canSendWave: false,
      waveQuotaPerHour: 0,
      canCreateSpark: false,
      isRestricted: false
    };
  }
}
