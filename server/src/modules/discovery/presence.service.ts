import { redisClient } from '../../config/redis.config';

export type PresenceStatus = 'online' | 'away' | 'offline';

export interface UserPresenceData {
  status: PresenceStatus;
  lastSeen: string;
  socketId?: string;
  mood?: string | null;
}

const PRESENCE_TTL_SECONDS = 300; // 5 minute TTL auto-expiry fallback

export class PresenceService {
  /**
   * Sets or updates a user's presence state in Redis hash presence:{userId}
   */
  static async setUserPresence(
    userId: string,
    status: PresenceStatus,
    socketId?: string,
    mood?: string | null
  ): Promise<void> {
    const key = `presence:${userId}`;
    const now = new Date().toISOString();

    const data: Record<string, string> = {
      status,
      lastSeen: now
    };

    if (socketId) data.socketId = socketId;
    if (mood !== undefined) data.mood = mood || '';

    await redisClient.hSet(key, data);
    await redisClient.expire(key, PRESENCE_TTL_SECONDS);
  }

  /**
   * Retrieves presence data for a user from Redis
   */
  static async getUserPresence(userId: string): Promise<UserPresenceData | null> {
    const key = `presence:${userId}`;
    const data = await redisClient.hGetAll(key);

    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return {
      status: (data.status as PresenceStatus) || 'offline',
      lastSeen: data.lastSeen || new Date().toISOString(),
      socketId: data.socketId || undefined,
      mood: data.mood || null
    };
  }

  /**
   * Batch fetches presence data for an array of user IDs
   */
  static async getBatchUserPresence(
    userIds: string[]
  ): Promise<Map<string, UserPresenceData>> {
    const presenceMap = new Map<string, UserPresenceData>();

    const pipeline = redisClient.multi();
    for (const id of userIds) {
      pipeline.hGetAll(`presence:${id}`);
    }

    const results = await pipeline.exec();

    userIds.forEach((id, index) => {
      const data = (results?.[index] as unknown as Record<string, string>) || {};
      if (data && Object.keys(data).length > 0) {

        presenceMap.set(id, {
          status: (data.status as PresenceStatus) || 'offline',
          lastSeen: data.lastSeen || new Date().toISOString(),
          socketId: data.socketId || undefined,
          mood: data.mood || null
        });
      }
    });

    return presenceMap;
  }

  /**
   * Updates user location in Redis GEO key 'locations'
   */
  static async updateUserGeo(
    userId: string,
    longitude: number,
    latitude: number
  ): Promise<void> {
    await redisClient.geoAdd('locations', {
      longitude,
      latitude,
      member: userId
    });
  }

  /**
   * Removes user presence from Redis upon explicit logout or cleanup
   */
  static async removeUserPresence(userId: string): Promise<void> {
    await redisClient.del(`presence:${userId}`);
    await redisClient.zRem('locations', userId);
  }
}
