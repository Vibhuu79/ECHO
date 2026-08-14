import { Types } from 'mongoose';
import { Spark, ISpark } from './spark.model';
import { SparkMessage, ISparkMessage } from './spark-message.model';
import { User } from '../user/user.model';
import { DiscoveryService } from '../discovery/discovery.service';
import { TrustService } from '../moderation/trust.service';
import { ContentFilterService } from '../moderation/contentFilter.service';

export interface SparkDTO {
  id: string;
  creator: {
    id: string;
    username: string;
    echoId: string;
    mood: string | null;
  };
  text: string;
  placeName?: string;
  distance: string;
  radius: number;
  durationMinutes: number;
  expiresAt: string;
  remainingSeconds: number;
  memberCount: number;
  maxMembers: number;
  accessType: 'public' | 'private';
  isPrivate: boolean;
  isCreator: boolean;
  isJoined: boolean;
  createdAt: string;
}

export interface SparkMemberDTO {
  id: string;
  username: string;
  echoId: string;
  mood: string | null;
}

export interface SparkMessageDTO {
  id: string;
  sparkId: string;
  sender: {
    id: string;
    username: string;
    echoId: string;
  };
  content: string;
  type: 'text' | 'emoji' | 'system';
  createdAt: string;
}

export class SparkService {
  /**
   * Creates a new Spark intent post with location, duration, custom radius, accessType (public/private), passkey, and optional placeName.
   * Limits users to 1 unexpired active Spark room at a time.
   */
  static async createSpark(
    creatorId: string,
    text: string,
    longitude: number,
    latitude: number,
    durationMinutes: number,
    radiusMeters: number = 200,
    placeName?: string,
    accessType: 'public' | 'private' = 'public',
    passkey?: string
  ): Promise<SparkDTO> {
    const permissions = await TrustService.getUserPermissions(creatorId);
    if (!permissions.canCreateSpark) {
      throw new Error(
        'TRUST_SCORE_RESTRICTED: Your trust score restricts you from creating sparks right now.'
      );
    }

    const creatorObjectId = new Types.ObjectId(creatorId);

    // Limit check: Prevent user from creating multiple active unexpired Spark rooms
    const existingActiveSpark = await Spark.findOne({
      creatorId: creatorObjectId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    });

    if (existingActiveSpark) {
      throw new Error(
        'ACTIVE_SPARK_LIMIT: You already have an active Spark room. Leave or delete your existing room before creating a new one.'
      );
    }

    if (![10, 20, 30, 60].includes(durationMinutes)) {
      throw new Error('Duration must be 10, 20, 30, or 60 minutes');
    }

    const validRadius = [50, 100, 200].includes(radiusMeters) ? radiusMeters : 200;

    const trimmedText = text.trim();
    if (trimmedText.length < 3 || trimmedText.length > 140) {
      throw new Error('Spark intent text must be between 3 and 140 characters');
    }

    const filterResult = ContentFilterService.containsBadWords(trimmedText);
    if (filterResult.contains) {
      await TrustService.adjustTrustScore(creatorId, -5, 'BAD_WORDS_VIOLATION');
      throw new Error('CONTENT_VIOLATION: Spark intent text contains inappropriate language.');
    }

    let trimmedPlaceName: string | undefined = undefined;
    if (placeName && placeName.trim().length > 0) {
      trimmedPlaceName = placeName.trim();
      if (trimmedPlaceName.length > 100) {
        throw new Error('Meetup place name must be 100 characters or less');
      }
      const placeFilter = ContentFilterService.containsBadWords(trimmedPlaceName);
      if (placeFilter.contains) {
        await TrustService.adjustTrustScore(creatorId, -5, 'BAD_WORDS_VIOLATION');
        throw new Error('CONTENT_VIOLATION: Meetup place name contains inappropriate language.');
      }
    }

    let validPasskey: string | undefined = undefined;
    if (accessType === 'private') {
      if (!passkey || !/^\d{4}$/.test(passkey.trim())) {
        throw new Error('INVALID_PASSKEY_FORMAT: Private rooms require a 4-digit numeric passkey (e.g. 1234)');
      }
      validPasskey = passkey.trim();
    }

    const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

    const spark = await Spark.create({
      creatorId: creatorObjectId,
      text: trimmedText,
      placeName: trimmedPlaceName,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude]
      },
      radius: validRadius,
      duration: durationMinutes,
      expiresAt,
      members: [creatorObjectId],
      bannedMembers: [],
      accessType,
      passkey: validPasskey,
      maxMembers: 20,
      status: 'active',
      warningSent: false
    });

    const creator = await User.findById(creatorId).select('username echoId mood');

    return {
      id: spark._id.toString(),
      creator: {
        id: creatorId,
        username: creator?.username || 'Anonymous',
        echoId: creator?.echoId || '#000000',
        mood: creator?.mood || null
      },
      text: spark.text,
      placeName: spark.placeName || undefined,
      distance: '~50m', // Creator is at origin
      radius: spark.radius,
      durationMinutes: spark.duration,
      expiresAt: spark.expiresAt.toISOString(),
      remainingSeconds: Math.max(0, Math.floor((spark.expiresAt.getTime() - Date.now()) / 1000)),
      memberCount: 1,
      maxMembers: spark.maxMembers,
      accessType: spark.accessType || 'public',
      isPrivate: spark.accessType === 'private',
      isCreator: true,
      isJoined: true,
      createdAt: spark.createdAt.toISOString()
    };
  }

  /**
   * Discovers active nearby sparks within creator-configured radius (50m, 100m, 200m)
   */
  static async getNearbySparks(
    currentUserId: string,
    longitude: number,
    latitude: number,
    radiusMeters: number = 200,
    limit: number = 20,
    offset: number = 0
  ): Promise<{ sparks: SparkDTO[]; hasMore: boolean }> {
    const userObjectId = new Types.ObjectId(currentUserId);
    const now = new Date();

    const pipeline: any[] = [
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude]
          },
          distanceField: 'calculatedDistance',
          maxDistance: Math.min(radiusMeters, 1000), // Safety cap 1km
          spherical: true,
          query: {
            status: 'active',
            expiresAt: { $gt: now }
          }
        }
      },
      {
        $match: {
          $expr: {
            $lte: ['$calculatedDistance', '$radius']
          }
        }
      },
      { $skip: offset },
      { $limit: limit + 1 }
    ];

    const rawSparks = await Spark.aggregate(pipeline);
    const hasMore = rawSparks.length > limit;
    const items = hasMore ? rawSparks.slice(0, limit) : rawSparks;

    if (items.length === 0) {
      return { sparks: [], hasMore: false };
    }

    // Populate creator info
    const creatorIds = items.map((s) => s.creatorId);
    const creators = await User.find({ _id: { $in: creatorIds } }).select('username echoId mood');
    const creatorMap = new Map(creators.map((c) => [c._id.toString(), c]));

    const sparks: SparkDTO[] = items.map((s) => {
      const creatorDoc = creatorMap.get(s.creatorId.toString());
      const memberStrIds = (s.members || []).map((m: Types.ObjectId) => m.toString());
      const isCreator = s.creatorId.toString() === currentUserId;
      const isJoined = memberStrIds.includes(currentUserId);
      const remainingSeconds = Math.max(0, Math.floor((new Date(s.expiresAt).getTime() - Date.now()) / 1000));

      return {
        id: s._id.toString(),
        creator: {
          id: s.creatorId.toString(),
          username: creatorDoc?.username || 'Anonymous',
          echoId: creatorDoc?.echoId || '#000000',
          mood: creatorDoc?.mood || null
        },
        text: s.text,
        placeName: s.placeName || undefined,
        distance: DiscoveryService.roundDistanceBucket(s.calculatedDistance),
        radius: s.radius || 200,
        durationMinutes: s.duration,
        expiresAt: new Date(s.expiresAt).toISOString(),
        remainingSeconds,
        memberCount: s.members?.length || 0,
        maxMembers: s.maxMembers || 20,
        accessType: s.accessType || 'public',
        isPrivate: s.accessType === 'private',
        isCreator,
        isJoined,
        createdAt: new Date(s.createdAt).toISOString()
      };
    });

    return { sparks, hasMore };
  }

  /**
   * Retrieves single Spark details with full member roster
   */
  static async getSparkById(
    sparkId: string,
    currentUserId: string
  ): Promise<{ spark: SparkDTO; members: SparkMemberDTO[] }> {
    const spark = await Spark.findOne({
      _id: sparkId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    })
      .populate('creatorId', 'username echoId mood')
      .populate('members', 'username echoId mood');

    if (!spark) {
      throw new Error('Spark not found or has expired');
    }

    const creator = spark.creatorId as any;
    const memberDocs = (spark.members as any[]) || [];

    const isCreator = creator._id.toString() === currentUserId;
    const isJoined = memberDocs.some((m) => m._id.toString() === currentUserId);
    const remainingSeconds = Math.max(0, Math.floor((spark.expiresAt.getTime() - Date.now()) / 1000));

    const sparkDto: SparkDTO = {
      id: spark._id.toString(),
      creator: {
        id: creator._id.toString(),
        username: creator.username || 'Anonymous',
        echoId: creator.echoId || '#000000',
        mood: creator.mood || null
      },
      text: spark.text,
      placeName: spark.placeName || undefined,
      distance: '~50m',
      radius: spark.radius || 200,
      durationMinutes: spark.duration,
      expiresAt: spark.expiresAt.toISOString(),
      remainingSeconds,
      memberCount: memberDocs.length,
      maxMembers: spark.maxMembers,
      accessType: spark.accessType || 'public',
      isPrivate: spark.accessType === 'private',
      isCreator,
      isJoined,
      createdAt: spark.createdAt.toISOString()
    };

    const membersDto: SparkMemberDTO[] = memberDocs.map((m) => ({
      id: m._id.toString(),
      username: m.username,
      echoId: m.echoId,
      mood: m.mood || null
    }));

    return { spark: sparkDto, members: membersDto };
  }

  /**
   * Atomically joins a spark room ensuring passkey verification, ban check, capacity (max 20), and non-expired status
   */
  static async joinSpark(
    sparkId: string,
    currentUserId: string,
    passkey?: string
  ): Promise<{ spark: SparkDTO; members: SparkMemberDTO[] }> {
    const userIdObj = new Types.ObjectId(currentUserId);

    const existingSpark = await Spark.findById(sparkId);
    if (!existingSpark || existingSpark.status !== 'active' || existingSpark.expiresAt <= new Date()) {
      throw new Error('Spark not found or has expired');
    }

    // 1. Check if user has been kicked/banned from this spark
    if (existingSpark.bannedMembers && existingSpark.bannedMembers.some((m) => m.toString() === currentUserId)) {
      throw new Error('BANNED_FROM_SPARK: You have been removed from this room by the host and cannot rejoin.');
    }

    // 2. Check if user is already a member
    if (existingSpark.members.some((m) => m.toString() === currentUserId)) {
      return this.getSparkById(sparkId, currentUserId);
    }

    // 3. Verify 4-digit passkey for private rooms
    if (existingSpark.accessType === 'private') {
      if (!passkey || passkey.trim() !== existingSpark.passkey) {
        throw new Error('INVALID_PASSKEY: Incorrect 4-digit room passkey.');
      }
    }

    // Atomic join with max 20 capacity check
    const updatedSpark = await Spark.findOneAndUpdate(
      {
        _id: sparkId,
        status: 'active',
        expiresAt: { $gt: new Date() },
        members: { $ne: userIdObj },
        'members.19': { $exists: false } // Ensures array size is < 20
      },
      { $push: { members: userIdObj } },
      { new: true }
    );

    if (!updatedSpark) {
      if (existingSpark.members.length >= existingSpark.maxMembers) {
        throw new Error('Spark room is full (max 20 members reached)');
      }
      throw new Error('Could not join spark room. Spark may have expired.');
    }

    return this.getSparkById(sparkId, currentUserId);
  }

  /**
   * Room host kicks a member and adds them to bannedMembers array
   */
  static async kickSparkMember(
    sparkId: string,
    creatorId: string,
    targetUserId: string
  ): Promise<{ success: boolean; targetUserId: string }> {
    const spark = await Spark.findById(sparkId);
    if (!spark || spark.status !== 'active') {
      throw new Error('Spark room not found or inactive');
    }

    if (spark.creatorId.toString() !== creatorId) {
      throw new Error('UNAUTHORIZED: Only the room host can kick members.');
    }

    if (creatorId === targetUserId) {
      throw new Error('CANNOT_KICK_SELF: Room host cannot kick themselves.');
    }

    const targetObjId = new Types.ObjectId(targetUserId);

    await Spark.findByIdAndUpdate(sparkId, {
      $pull: { members: targetObjId },
      $addToSet: { bannedMembers: targetObjId }
    });

    return { success: true, targetUserId };
  }

  /**
   * Leaves a spark room
   */
  static async leaveSpark(sparkId: string, currentUserId: string): Promise<boolean> {
    const userIdObj = new Types.ObjectId(currentUserId);

    const spark = await Spark.findById(sparkId);
    if (!spark) {
      throw new Error('Spark room not found');
    }

    await Spark.findByIdAndUpdate(sparkId, {
      $pull: { members: userIdObj }
    });

    return true;
  }

  /**
   * Deletes / cancels a Spark (creator only)
   */
  static async deleteSpark(sparkId: string, creatorId: string): Promise<boolean> {
    const spark = await Spark.findOne({ _id: sparkId, creatorId });
    if (!spark) {
      throw new Error('Spark not found or unauthorized');
    }

    spark.status = 'deleted';
    await spark.save();
    return true;
  }

  /**
   * Fetches paginated chat messages for a Spark room
   */
  static async getSparkMessages(
    sparkId: string,
    currentUserId: string,
    limit: number = 50,
    beforeMessageId?: string
  ): Promise<{ messages: SparkMessageDTO[]; hasMore: boolean }> {
    const spark = await Spark.findById(sparkId);
    if (!spark || spark.status === 'deleted') {
      throw new Error('Spark not found');
    }

    // Ensure requesting user is a member
    if (!spark.members.some((m) => m.toString() === currentUserId)) {
      throw new Error('Access denied. You must join the Spark room to view messages.');
    }

    const query: any = { sparkId };
    if (beforeMessageId) {
      query._id = { $lt: new Types.ObjectId(beforeMessageId) };
    }

    const rawMessages = await SparkMessage.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .populate('senderId', 'username echoId');

    const hasMore = rawMessages.length > limit;
    const items = hasMore ? rawMessages.slice(0, limit) : rawMessages;

    // Reverse to chronological order for client display
    items.reverse();

    const messages: SparkMessageDTO[] = items.map((msg: any) => ({
      id: msg._id.toString(),
      sparkId: msg.sparkId.toString(),
      sender: {
        id: msg.senderId?._id?.toString() || msg.senderId.toString(),
        username: msg.senderId?.username || 'Anonymous',
        echoId: msg.senderId?.echoId || '#000000'
      },
      content: msg.content,
      type: msg.type,
      createdAt: msg.createdAt.toISOString()
    }));

    return { messages, hasMore };
  }

  /**
   * Creates and stores a new message in a Spark room
   */
  static async createSparkMessage(
    sparkId: string,
    senderId: string,
    content: string,
    type: 'text' | 'emoji' | 'system' = 'text'
  ): Promise<SparkMessageDTO> {
    const spark = await Spark.findOne({
      _id: sparkId,
      status: 'active',
      expiresAt: { $gt: new Date() }
    });

    if (!spark) {
      throw new Error('Spark room not found or has expired');
    }

    if (!spark.members.some((m) => m.toString() === senderId)) {
      throw new Error('You must be a member of the Spark room to send messages');
    }

    const message = await SparkMessage.create({
      sparkId: new Types.ObjectId(sparkId),
      senderId: new Types.ObjectId(senderId),
      content: content.trim(),
      type
    });

    const sender = await User.findById(senderId).select('username echoId');

    return {
      id: message._id.toString(),
      sparkId: sparkId,
      sender: {
        id: senderId,
        username: sender?.username || 'Anonymous',
        echoId: sender?.echoId || '#000000'
      },
      content: message.content,
      type: message.type,
      createdAt: message.createdAt.toISOString()
    };
  }
}
