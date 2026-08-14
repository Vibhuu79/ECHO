import { Types } from 'mongoose';
import { User, IUser } from '../user/user.model';
import { Conversation } from '../chat/conversation.model';
import { PresenceService } from './presence.service';
import { getContextLabel } from '../../utils/geofence';

export interface NearbyUserDTO {
  id: string;
  username: string;
  echoId: string;
  distance: string;
  contextLabel: string;
  mood: string | null;
  auraTheme?: string;
  avatarIcon?: string;
  vibeStatusNote?: string;
  presenceStatus: 'online' | 'away' | 'offline';
  presenceLabel: string;
  conversationId?: string | null;
  hasExistingConnection?: boolean;
}

export class DiscoveryService {
  /**
   * Rounds raw meters distance into privacy-preserving buckets:
   * <=50m -> "~50m"
   * <=100m -> "~100m"
   * <=150m -> "~150m"
   * <=250m -> "~250m"
   * <=500m -> "~500m"
   */
  static roundDistanceBucket(distanceMeters: number): string {
    if (distanceMeters <= 50) return '~50m';
    if (distanceMeters <= 100) return '~100m';
    if (distanceMeters <= 150) return '~150m';
    if (distanceMeters <= 250) return '~250m';
    if (distanceMeters <= 500) return '~500m';
    return '~1km';
  }

  /**
   * Formats presence status & lastActive into human-readable label
   */
  static formatPresenceLabel(
    status: 'online' | 'away' | 'offline',
    lastActive: Date
  ): string {
    if (status === 'online') return 'Active Now';
    if (status === 'away') return 'Away';

    const diffMinutes = Math.floor(
      (Date.now() - new Date(lastActive).getTime()) / (1000 * 60)
    );
    if (diffMinutes < 1) return 'Active just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return 'Offline';
  }

  /**
   * Finds nearby users within radius (default 500m) using MongoDB $geoNear,
   * excludes requesting user & blocked users, hydrates Redis presence and geofence labels.
   */
  static async getNearbyUsers(
    currentUserId: string,
    longitude: number,
    latitude: number,
    radiusMeters: number = 500,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ users: NearbyUserDTO[]; hasMore: boolean }> {
    const currentUser = await User.findById(currentUserId).select('blockedUsers');
    const blockedUserIds = currentUser?.blockedUsers || [];

    const userObjectId = new Types.ObjectId(currentUserId);
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000);

    // MongoDB $geoNear aggregation - strictly query online users active within 2 minutes
    const pipeline: any[] = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          distanceField: 'calculatedDistance',
          maxDistance: Math.min(radiusMeters, 1000), // Max radius cap 1km for V1
          spherical: true,
          query: {
            _id: { $ne: userObjectId, $nin: blockedUserIds },
            blockedUsers: { $ne: userObjectId },
            isRestricted: false,
            isGhostMode: { $ne: true },
            trustScore: { $gte: 40 },
            presenceStatus: 'online',
            lastActive: { $gte: twoMinutesAgo }
          }
        }
      },
      { $skip: offset },
      { $limit: limit + 1 }, // Fetch 1 extra to check hasMore
      {
        $project: {
          _id: 1,
          username: 1,
          echoId: 1,
          mood: 1,
          auraTheme: 1,
          avatarIcon: 1,
          vibeStatus: 1,
          location: 1,
          locationLabel: 1,
          presenceStatus: 1,
          lastActive: 1,
          calculatedDistance: 1
        }
      }
    ];

    const results = await User.aggregate(pipeline);
    const hasMore = results.length > limit;
    const items = hasMore ? results.slice(0, limit) : results;

    if (items.length === 0) {
      return { users: [], hasMore: false };
    }

    const userIds = items.map((doc) => doc._id.toString());
    const redisPresenceMap = await PresenceService.getBatchUserPresence(userIds);

    // Query active or saved conversations for currentUserId to detect existing connections
    const existingConversations = await Conversation.find({
      participants: userObjectId,
      status: { $ne: 'deleted' }
    }).select('participants status');

    const conversationMap = new Map<string, string>();
    existingConversations.forEach((conv) => {
      const peerId = conv.participants.find((id) => !id.equals(userObjectId))?.toString();
      if (peerId) {
        conversationMap.set(peerId, conv._id.toString());
      }
    });

    const nearbyUsers: NearbyUserDTO[] = items
      .map((doc) => {
        const uId = doc._id.toString();
        const redisPresence = redisPresenceMap.get(uId);

        // Determine strict presence state
        let status: 'online' | 'away' | 'offline' = 'offline';
        if (redisPresence?.status === 'online') {
          status = 'online';
        } else if (redisPresence?.status === 'away') {
          status = 'away';
        } else if (doc.presenceStatus === 'online' && doc.lastActive && (Date.now() - new Date(doc.lastActive).getTime() <= 2 * 60 * 1000)) {
          status = 'online';
        }

        const mood = redisPresence?.mood !== undefined ? redisPresence.mood : doc.mood;
        const lastActiveDate = redisPresence?.lastSeen
          ? new Date(redisPresence.lastSeen)
          : doc.lastActive;

        // Extract coordinates from DB object strictly for geofencing lookup
        const coords = doc.location?.coordinates;
        const docLon = coords ? coords[0] : longitude;
        const docLat = coords ? coords[1] : latitude;

        // Compute context label (ITM University campus zone or fallback)
        const contextLabel =
          doc.locationLabel || getContextLabel(docLon, docLat);

        const vibeNote =
          doc.vibeStatus?.expiresAt && new Date(doc.vibeStatus.expiresAt) > new Date()
            ? doc.vibeStatus.note
            : undefined;

        const conversationId = conversationMap.get(uId) || null;

        return {
          id: uId,
          username: doc.username,
          echoId: doc.echoId,
          distance: this.roundDistanceBucket(doc.calculatedDistance),
          contextLabel,
          mood: mood || null,
          auraTheme: doc.auraTheme || 'cyberpunk',
          avatarIcon: doc.avatarIcon || undefined,
          vibeStatusNote: vibeNote,
          presenceStatus: status,
          presenceLabel: this.formatPresenceLabel(status, lastActiveDate),
          conversationId,
          hasExistingConnection: !!conversationId
        };
      })
      // Strictly filter to ONLY users currently online and operating the app
      .filter((u) => u.presenceStatus === 'online');

    return { users: nearbyUsers, hasMore };
  }
}
