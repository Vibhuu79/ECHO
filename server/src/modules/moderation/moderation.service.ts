import { Types } from 'mongoose';
import { User, IUser } from '../user/user.model';
import { Report, IReport, ReportCategory } from './report.model';
import { TrustService } from './trust.service';
import { Wave } from '../wave/wave.model';
import { Conversation } from '../chat/conversation.model';
import { ApiError } from '../../utils/ApiError';

export class ModerationService {
  /**
   * Submits a report against a user by EchoID, applies trust penalties, and monitors false reporting.
   */
  static async submitReport(
    reporterId: string | Types.ObjectId,
    targetEchoId: string,
    category: ReportCategory,
    context?: string
  ): Promise<{ message: string }> {
    const reporter = await User.findById(reporterId);
    if (!reporter) throw new ApiError(404, 'Reporter user not found');

    const targetUser = await User.findOne({ echoId: targetEchoId });
    if (!targetUser) throw new ApiError(404, 'Target user not found');

    if (reporter._id.equals(targetUser._id)) {
      throw new ApiError(400, 'You cannot report yourself');
    }

    // Check for duplicate report
    const existingReport = await Report.findOne({
      reporterId: reporter._id,
      targetUserId: targetUser._id
    });
    if (existingReport) {
      throw new ApiError(400, 'You have already reported this user');
    }

    // Monitor for false reporting / report spamming (more than 5 reports in past 1 hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentReportsCount = await Report.countDocuments({
      reporterId: reporter._id,
      createdAt: { $gte: oneHourAgo }
    });

    if (recentReportsCount >= 5) {
      // Penalize reporter for report abuse
      await TrustService.adjustTrustScore(reporter._id, -5, 'FALSE_REPORT');
      reporter.falseReportCount = (reporter.falseReportCount || 0) + 1;
      await reporter.save();
      throw new ApiError(429, 'Report limit exceeded. Please refrain from rapid reporting.');
    }

    // Create Report
    await Report.create({
      reporterId: reporter._id,
      targetUserId: targetUser._id,
      targetEchoId: targetUser.echoId,
      category,
      context,
      status: 'pending'
    });

    // Calculate penalty based on category
    let penalty = -10;
    if (category === 'harassment') penalty = -15;
    if (category === 'other') penalty = -5;

    // Apply penalty to target
    await TrustService.adjustTrustScore(targetUser._id, penalty, 'ABUSE_REPORT');

    // Increment target reportCount & auto-restrict if >= 3
    targetUser.reportCount = (targetUser.reportCount || 0) + 1;
    if (targetUser.reportCount >= 3) {
      targetUser.isRestricted = true;
    }
    await targetUser.save();

    return { message: 'Report submitted successfully. Thank you for helping keep Echo safe.' };
  }

  /**
   * Blocks a user by EchoID (bi-directional isolation, trust score penalty, wave/chat cancellation)
   */
  static async blockUser(
    currentUserId: string | Types.ObjectId,
    targetEchoId: string
  ): Promise<{ message: string }> {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) throw new ApiError(404, 'User not found');

    const targetUser = await User.findOne({ echoId: targetEchoId });
    if (!targetUser) throw new ApiError(404, 'Target user not found');

    if (currentUser._id.equals(targetUser._id)) {
      throw new ApiError(400, 'You cannot block yourself');
    }

    // Add target to blockedUsers array if not already present
    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { blockedUsers: targetUser._id }
    });

    // Deduct -5 from target user trust score
    await TrustService.adjustTrustScore(targetUser._id, -5, 'USER_BLOCKED');

    // Cancel any pending waves between these two users
    await Wave.updateMany(
      {
        $or: [
          { senderId: currentUser._id, receiverId: targetUser._id },
          { senderId: targetUser._id, receiverId: currentUser._id }
        ],
        status: 'pending'
      },
      { $set: { status: 'ignored' } }
    );

    // Cancel active unsaved conversations between these two users
    await Conversation.updateMany(
      {
        participants: { $all: [currentUser._id, targetUser._id] },
        status: { $in: ['active', 'sleeping'] },
        isSaved: false
      },
      { $set: { status: 'archived' } }
    );

    return { message: 'User blocked' };
  }

  /**
   * Unblocks a user by EchoID
   */
  static async unblockUser(
    currentUserId: string | Types.ObjectId,
    targetEchoId: string
  ): Promise<{ message: string }> {
    const targetUser = await User.findOne({ echoId: targetEchoId });
    if (!targetUser) throw new ApiError(404, 'Target user not found');

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { blockedUsers: targetUser._id }
    });

    return { message: 'User unblocked' };
  }

  /**
   * Gets list of blocked users for current user
   */
  static async getBlockedUsers(
    currentUserId: string | Types.ObjectId
  ): Promise<Array<{ id: string; username: string; echoId: string }>> {
    const user = await User.findById(currentUserId).populate<{
      blockedUsers: IUser[];
    }>('blockedUsers', 'username echoId');

    if (!user) return [];

    return (user.blockedUsers || []).map((u) => ({
      id: u._id.toString(),
      username: u.username,
      echoId: u.echoId
    }));
  }

  /**
   * Mutes a user by EchoID
   */
  static async muteUser(
    currentUserId: string | Types.ObjectId,
    targetEchoId: string
  ): Promise<{ message: string }> {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) throw new ApiError(404, 'User not found');

    const targetUser = await User.findOne({ echoId: targetEchoId });
    if (!targetUser) throw new ApiError(404, 'Target user not found');

    if (currentUser._id.equals(targetUser._id)) {
      throw new ApiError(400, 'You cannot mute yourself');
    }

    await User.findByIdAndUpdate(currentUserId, {
      $addToSet: { mutedUsers: targetUser._id }
    });

    return { message: 'User muted' };
  }

  /**
   * Unmutes a user by EchoID
   */
  static async unmuteUser(
    currentUserId: string | Types.ObjectId,
    targetEchoId: string
  ): Promise<{ message: string }> {
    const targetUser = await User.findOne({ echoId: targetEchoId });
    if (!targetUser) throw new ApiError(404, 'Target user not found');

    await User.findByIdAndUpdate(currentUserId, {
      $pull: { mutedUsers: targetUser._id }
    });

    return { message: 'User unmuted' };
  }

  /**
   * Gets list of muted users for current user
   */
  static async getMutedUsers(
    currentUserId: string | Types.ObjectId
  ): Promise<Array<{ id: string; username: string; echoId: string }>> {
    const user = await User.findById(currentUserId).populate<{
      mutedUsers: IUser[];
    }>('mutedUsers', 'username echoId');

    if (!user) return [];

    return (user.mutedUsers || []).map((u) => ({
      id: u._id.toString(),
      username: u.username,
      echoId: u.echoId
    }));
  }

  /**
   * Checks if recipient has muted sender
   */
  static async isUserMuted(
    recipientUserId: string | Types.ObjectId,
    senderUserId: string | Types.ObjectId
  ): Promise<boolean> {
    const recipient = await User.findById(recipientUserId).select('mutedUsers');
    if (!recipient || !recipient.mutedUsers) return false;
    return recipient.mutedUsers.some((id) => id.toString() === senderUserId.toString());
  }

  /**
   * Checks bi-directional block status between two users
   */
  static async isUserBlocked(
    userAId: string | Types.ObjectId,
    userBId: string | Types.ObjectId
  ): Promise<boolean> {
    const count = await User.countDocuments({
      $or: [
        { _id: userAId, blockedUsers: userBId },
        { _id: userBId, blockedUsers: userAId }
      ]
    });
    return count > 0;
  }
}
