export type MoodType =
  | 'chill'
  | 'studying'
  | 'coffee'
  | 'coding'
  | 'bored'
  | 'gaming'
  | 'free'
  | null;

export type PresenceStatusType = 'online' | 'away' | 'offline';

export interface NearbyUser {
  id: string;
  username: string;
  echoId: string;
  distance: string;
  contextLabel: string;
  mood: MoodType;
  auraTheme?: string;
  avatarIcon?: string;
  vibeStatusNote?: string;
  presenceStatus: PresenceStatusType;
  presenceLabel: string;
  conversationId?: string | null;
  hasExistingConnection?: boolean;
}

export interface GetNearbyResponse {
  users: NearbyUser[];
  hasMore: boolean;
}
