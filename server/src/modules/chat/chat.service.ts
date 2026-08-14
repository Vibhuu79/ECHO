import { Types } from 'mongoose';
import { Conversation, IConversation } from './conversation.model';
import { Message, IMessage } from './message.model';
import { PresenceService } from '../discovery/presence.service';
import { User } from '../user/user.model';

export class ChatService {
  /**
   * Get all conversations for a user categorized by active, saved, archived
   */
  public static async getUserConversations(userId: string) {
    const userObjectId = new Types.ObjectId(userId);

    const conversations = await Conversation.find({
      participants: userObjectId,
      status: { $ne: 'deleted' }
    })
      .populate('participants', 'username echoId mood presenceStatus locationLabel lastActive')
      .sort({ lastActivityAt: -1 });

    const peerIds = conversations
      .map((conv) => {
        const peer = (conv.participants as any[]).find((p) => p._id.toString() !== userId);
        return peer ? peer._id.toString() : null;
      })
      .filter(Boolean) as string[];

    const redisPresenceMap = await PresenceService.getBatchUserPresence(peerIds);

    // Calculate unread counts per conversation in batch
    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversationId: { $in: conversations.map((c) => c._id) },
          senderId: { $ne: userObjectId },
          readBy: { $ne: userObjectId }
        }
      },
      {
        $group: {
          _id: '$conversationId',
          count: { $sum: 1 }
        }
      }
    ]);

    const unreadMap = new Map<string, number>();
    unreadCounts.forEach((item) => {
      unreadMap.set(item._id.toString(), item.count);
    });

    const active: any[] = [];
    const saved: any[] = [];
    const archived: any[] = [];

    conversations.forEach((conv) => {
      const peer = (conv.participants as any[]).find(
        (p) => p._id.toString() !== userId
      );

      let presenceStatus: 'online' | 'away' | 'offline' = 'offline';
      if (peer) {
        const redisPresence = redisPresenceMap.get(peer._id.toString());
        if (redisPresence?.status) {
          presenceStatus = redisPresence.status;
        } else if (peer.lastActive) {
          const diffMs = Date.now() - new Date(peer.lastActive).getTime();
          if (diffMs < 2 * 60 * 1000) {
            presenceStatus = 'online';
          } else if (diffMs < 15 * 60 * 1000) {
            presenceStatus = 'away';
          } else {
            presenceStatus = 'offline';
          }
        }
      }

      const formatted = {
        id: conv._id.toString(),
        peer: peer
          ? {
              id: peer._id.toString(),
              username: peer.username,
              echoId: peer.echoId,
              mood: peer.mood,
              presence: presenceStatus,
              locationLabel: peer.locationLabel
            }
          : null,
        status: conv.status,
        isSaved: conv.isSaved,
        lastMessage: conv.lastMessage || null,
        lastActivityAt: conv.lastActivityAt,
        sleepingSince: conv.sleepingSince || null,
        unreadCount: unreadMap.get(conv._id.toString()) || 0,
        createdAt: conv.createdAt
      };

      if (conv.isSaved || conv.status === 'saved') {
        saved.push(formatted);
      } else if (conv.status === 'archived') {
        archived.push(formatted);
      } else {
        active.push(formatted);
      }
    });

    return { active, saved, archived };
  }

  /**
   * Get single conversation details
   */
  public static async getConversationDetails(conversationId: string, userId: string) {
    const conv = await Conversation.findOne({
      _id: new Types.ObjectId(conversationId),
      participants: new Types.ObjectId(userId),
      status: { $ne: 'deleted' }
    }).populate('participants', 'username echoId mood presenceStatus locationLabel lastActive');

    if (!conv) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }

    const peer = (conv.participants as any[]).find(
      (p) => p._id.toString() !== userId
    );

    let presenceStatus: 'online' | 'away' | 'offline' = 'offline';
    if (peer) {
      const redisPresence = await PresenceService.getUserPresence(peer._id.toString());
      if (redisPresence?.status) {
        presenceStatus = redisPresence.status;
      } else if (peer.lastActive) {
        const diffMs = Date.now() - new Date(peer.lastActive).getTime();
        if (diffMs < 2 * 60 * 1000) {
          presenceStatus = 'online';
        } else if (diffMs < 15 * 60 * 1000) {
          presenceStatus = 'away';
        } else {
          presenceStatus = 'offline';
        }
      }
    }

    return {
      id: conv._id.toString(),
      peer: peer
        ? {
            id: peer._id.toString(),
            username: peer.username,
            echoId: peer.echoId,
            mood: peer.mood,
            presence: presenceStatus,
            locationLabel: peer.locationLabel
          }
        : null,
      status: conv.status,
      isSaved: conv.isSaved,
      saveRequests: conv.saveRequests.map((id) => id.toString()),
      lastMessage: conv.lastMessage || null,
      lastActivityAt: conv.lastActivityAt,
      sleepingSince: conv.sleepingSince || null,
      createdAt: conv.createdAt
    };
  }

  /**
   * Get paginated messages with cursor (`before`)
   */
  public static async getMessages(
    conversationId: string,
    userId: string,
    limit: number = 50,
    before?: string
  ) {
    // Verify participant
    const conv = await Conversation.findOne({
      _id: new Types.ObjectId(conversationId),
      participants: new Types.ObjectId(userId)
    });

    if (!conv) {
      throw new Error('CONVERSATION_NOT_FOUND_OR_FORBIDDEN');
    }

    const query: any = { conversationId: new Types.ObjectId(conversationId) };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await Message.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('senderId', 'username echoId');

    const hasMore = messages.length > limit;
    const returnMessages = hasMore ? messages.slice(0, limit) : messages;

    // Mark messages as read by userId
    await Message.updateMany(
      {
        conversationId: new Types.ObjectId(conversationId),
        senderId: { $ne: new Types.ObjectId(userId) },
        readBy: { $ne: new Types.ObjectId(userId) }
      },
      {
        $addToSet: { readBy: new Types.ObjectId(userId) }
      }
    );

    const formattedMessages = returnMessages.map((msg) => {
      const sender = msg.senderId as any;
      return {
        id: msg._id.toString(),
        conversationId: msg.conversationId.toString(),
        sender: {
          id: sender._id ? sender._id.toString() : msg.senderId.toString(),
          username: sender.username || 'Anonymous',
          echoId: sender.echoId || ''
        },
        content: msg.content,
        type: msg.type,
        readBy: msg.readBy.map((id) => id.toString()),
        createdAt: msg.createdAt
      };
    });

    // Return chronological order (oldest to newest for rendering)
    return {
      messages: formattedMessages.reverse(),
      hasMore
    };
  }

  /**
   * Send a message to conversation
   */
  public static async createMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: 'text' | 'emoji' | 'icebreaker' | 'system' = 'text'
  ) {
    const conv = await Conversation.findOne({
      _id: new Types.ObjectId(conversationId),
      participants: new Types.ObjectId(senderId)
    });

    if (!conv) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }

    if (conv.status === 'deleted') {
      throw new Error('CONVERSATION_DELETED');
    }

    const message = await Message.create({
      conversationId: new Types.ObjectId(conversationId),
      senderId: new Types.ObjectId(senderId),
      content,
      type,
      readBy: [new Types.ObjectId(senderId)]
    });

    // Update sender's online presence state
    await PresenceService.setUserPresence(senderId, 'online');
    await User.findByIdAndUpdate(senderId, {
      presenceStatus: 'online',
      lastActive: new Date()
    });

    // Update conversation status and activity
    conv.lastMessage = {
      text: content,
      senderId: new Types.ObjectId(senderId),
      timestamp: message.createdAt
    };
    conv.lastActivityAt = message.createdAt;
    if (conv.status === 'sleeping' || conv.status === 'archived') {
      conv.status = 'active';
      conv.sleepingSince = undefined;
      conv.archiveAt = undefined;
    }
    await conv.save();

    const populatedMsg = await Message.findById(message._id).populate(
      'senderId',
      'username echoId'
    );
    const sender = populatedMsg?.senderId as any;

    return {
      message: {
        id: message._id.toString(),
        conversationId: message.conversationId.toString(),
        sender: {
          id: sender._id.toString(),
          username: sender.username,
          echoId: sender.echoId
        },
        content: message.content,
        type: message.type,
        readBy: [senderId],
        createdAt: message.createdAt
      },
      participants: conv.participants.map((id) => id.toString())
    };
  }

  /**
   * Wake up a sleeping conversation
   */
  public static async continueConversation(conversationId: string, userId: string) {
    const conv = await Conversation.findOne({
      _id: new Types.ObjectId(conversationId),
      participants: new Types.ObjectId(userId)
    });

    if (!conv) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }

    conv.status = 'active';
    conv.sleepingSince = undefined;
    conv.lastActivityAt = new Date();
    await conv.save();

    return {
      conversationId: conv._id.toString(),
      status: conv.status,
      message: 'Conversation awakened successfully'
    };
  }

  /**
   * Request to save conversation permanently
   */
  public static async saveConversation(conversationId: string, userId: string) {
    const conv = await Conversation.findOne({
      _id: new Types.ObjectId(conversationId),
      participants: new Types.ObjectId(userId)
    });

    if (!conv) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }

    const userObjId = new Types.ObjectId(userId);
    if (!conv.saveRequests.some((id) => id.equals(userObjId))) {
      conv.saveRequests.push(userObjId);
    }

    if (conv.saveRequests.length >= 2) {
      conv.isSaved = true;
      conv.status = 'saved';
      conv.archiveAt = undefined;
      conv.deleteAt = undefined;
    }

    await conv.save();

    return {
      conversationId: conv._id.toString(),
      isSaved: conv.isSaved,
      status: conv.status,
      saveRequests: conv.saveRequests.map((id) => id.toString()),
      saveRequestsCount: conv.saveRequests.length,
      participants: conv.participants.map((id) => id.toString()),
      message: conv.isSaved
        ? 'Connection permanently saved!'
        : 'Save requested. Waiting for partner agreement.'
    };
  }

  /**
   * Archive conversation (called by worker or user)
   */
  public static async archiveConversation(conversationId: string) {
    const conv = await Conversation.findById(conversationId);
    if (!conv || conv.isSaved) return null;

    conv.status = 'archived';
    conv.archiveAt = new Date();
    conv.deleteAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    await conv.save();

    return conv;
  }

  /**
   * Delete / leave conversation
   */
  public static async deleteConversation(conversationId: string, userId: string) {
    const conv = await Conversation.findOne({
      _id: new Types.ObjectId(conversationId),
      participants: new Types.ObjectId(userId)
    });

    if (!conv) {
      throw new Error('CONVERSATION_NOT_FOUND');
    }

    conv.status = 'deleted';
    conv.deleteAt = new Date();
    await conv.save();

    // Clean up messages associated with deleted conversation
    await Message.deleteMany({ conversationId: conv._id });

    return {
      conversationId: conv._id.toString(),
      message: 'Conversation deleted successfully'
    };
  }
}
