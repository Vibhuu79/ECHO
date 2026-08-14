import { User, IUser } from './user.model';
import { ApiError } from '../../utils/ApiError';
import { generateRandomUsername } from '../../utils/usernameGenerator';
import { DiscoveryService } from '../discovery/discovery.service';

export interface ProfileUpdateDTO {
  username?: string;
  auraTheme?: string;
  avatarIcon?: string;
  vibeStatusNote?: string;
  vibeStatusDurationHours?: number; // e.g. 2, 4, 8 hours
  allowGlobalIdSearch?: boolean;
  isGhostMode?: boolean;
}

export class UserService {
  /**
   * Retrieves profile for the current authenticated user.
   */
  static async getMe(userId: string): Promise<Partial<IUser>> {
    const user = await User.findById(userId).select('-refreshToken');
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }
    return user;
  }

  /**
   * Generates a funny/cool random username suggestion.
   */
  static getRandomUsernameSuggestion(): string {
    return generateRandomUsername();
  }

  /**
   * Updates full profile customization for the authenticated user.
   */
  static async updateProfile(userId: string, data: ProfileUpdateDTO): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new ApiError(404, 'User profile not found');
    }

    if (data.username && data.username.trim() !== user.username) {
      const newName = data.username.trim();
      if (newName.length < 3 || newName.length > 20) {
        throw new ApiError(400, 'Username must be between 3 and 20 characters');
      }

      // Add previous username to recentUsernames list if not already present
      const recent = user.recentUsernames || [];
      if (!recent.includes(user.username)) {
        recent.unshift(user.username);
      }
      user.recentUsernames = recent.slice(0, 5); // Keep max 5
      user.username = newName;
    }

    if (data.auraTheme !== undefined) {
      user.auraTheme = data.auraTheme;
    }

    if (data.avatarIcon !== undefined) {
      user.avatarIcon = data.avatarIcon;
    }

    if (data.vibeStatusNote !== undefined) {
      const hours = data.vibeStatusDurationHours || 2;
      user.vibeStatus = {
        note: data.vibeStatusNote.trim(),
        expiresAt: data.vibeStatusNote.trim() ? new Date(Date.now() + hours * 3600 * 1000) : null
      };
    }

    if (data.allowGlobalIdSearch !== undefined) {
      user.allowGlobalIdSearch = data.allowGlobalIdSearch;
    }

    if (data.isGhostMode !== undefined) {
      user.isGhostMode = data.isGhostMode;
    }

    await user.save();
    return user;
  }

  /**
   * Legacy method for backward compatibility
   */
  static async updateUsername(userId: string, newUsername: string): Promise<{ username: string; echoId: string }> {
    const user = await this.updateProfile(userId, { username: newUsername });
    return {
      username: user.username,
      echoId: user.echoId
    };
  }

  /**
   * Searches for a user by their Echo ID with proximity precision & privacy checks.
   */
  static async searchByEchoId(
    searcherId: string,
    rawEchoId: string
  ): Promise<{
    found: boolean;
    inRange: boolean;
    user?: {
      id: string;
      username: string;
      echoId: string;
      mood: string | null;
      presenceStatus: string;
      auraTheme: string;
      avatarIcon: string;
      vibeStatusNote?: string;
      distance?: string;
      contextLabel?: string;
    };
    message?: string;
  }> {
    let cleanCode = rawEchoId.trim().toUpperCase();
    if (!cleanCode.startsWith('#')) {
      cleanCode = `#${cleanCode}`;
    }

    const targetUser = await User.findOne({ echoId: cleanCode });
    if (!targetUser) {
      return { found: false, inRange: false, message: 'No user found with this Echo ID code.' };
    }

    if (targetUser._id.toString() === searcherId) {
      return { found: true, inRange: true, message: 'This is your own Echo ID code!' };
    }

    if (targetUser.isGhostMode) {
      return { found: false, inRange: false, message: 'No user found with this Echo ID code.' };
    }

    const searcher = await User.findById(searcherId);
    if (!searcher) {
      throw new ApiError(404, 'Searcher profile not found');
    }

    // Calculate distance if coordinates exist
    let distanceMeters: number | null = null;
    let distanceString: string | undefined = undefined;

    if (
      searcher.location?.coordinates &&
      searcher.location.coordinates.length === 2 &&
      targetUser.location?.coordinates &&
      targetUser.location.coordinates.length === 2
    ) {
      const [lon1, lat1] = searcher.location.coordinates;
      const [lon2, lat2] = targetUser.location.coordinates;

      // Haversine distance
      const R = 6371e3; // meters
      const phi1 = (lat1 * Math.PI) / 180;
      const phi2 = (lat2 * Math.PI) / 180;
      const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
      const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
        Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      distanceMeters = R * c;
      distanceString = DiscoveryService.roundDistanceBucket(distanceMeters);
    }

    const isNearby = distanceMeters !== null ? distanceMeters <= 1000 : false;
    const isGlobalAllowed = targetUser.allowGlobalIdSearch === true;

    // Check if user is out of range AND global search is disabled
    if (!isNearby && !isGlobalAllowed) {
      return {
        found: true,
        inRange: false,
        message: `User ${cleanCode} found, but is currently out of nearby range (> 1km) and has disabled global search.`
      };
    }

    // Check if vibeStatus expired
    let vibeNote: string | undefined = undefined;
    if (targetUser.vibeStatus?.note) {
      if (!targetUser.vibeStatus.expiresAt || new Date(targetUser.vibeStatus.expiresAt) > new Date()) {
        vibeNote = targetUser.vibeStatus.note;
      }
    }

    return {
      found: true,
      inRange: isNearby,
      user: {
        id: targetUser._id.toString(),
        username: targetUser.username,
        echoId: targetUser.echoId,
        mood: targetUser.mood,
        presenceStatus: targetUser.presenceStatus,
        auraTheme: targetUser.auraTheme || 'cyberpunk',
        avatarIcon: targetUser.avatarIcon || '⚡',
        vibeStatusNote: vibeNote,
        distance: distanceString || (isNearby ? '~500m' : 'Out of range'),
        contextLabel: targetUser.locationLabel || 'Nearby'
      }
    };
  }

  /**
   * Gets public info for a user by EchoID (legacy)
   */
  static async getUserByEchoId(echoId: string): Promise<{ username: string; echoId: string; mood: string | null; presence: string }> {
    const user = await User.findOne({ echoId: echoId.toUpperCase() });
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return {
      username: user.username,
      echoId: user.echoId,
      mood: user.mood,
      presence: user.presenceStatus
    };
  }
}

