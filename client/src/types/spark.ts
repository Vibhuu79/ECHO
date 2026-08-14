export interface SparkCreator {
  id: string;
  username: string;
  echoId: string;
  mood: string | null;
}

export interface Spark {
  id: string;
  creator: SparkCreator;
  text: string;
  placeName?: string;
  distance: string;
  radius?: number;
  durationMinutes: number;
  expiresAt: string;
  remainingSeconds: number;
  memberCount: number;
  maxMembers: number;
  accessType?: 'public' | 'private';
  isPrivate?: boolean;
  isCreator: boolean;
  isJoined: boolean;
  createdAt: string;
}

export interface SparkMember {
  id: string;
  username: string;
  echoId: string;
  mood: string | null;
}

export interface SparkMessage {
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

export interface CreateSparkInput {
  text: string;
  durationMinutes: number;
  latitude: number;
  longitude: number;
  radius?: number;
  placeName?: string;
  accessType?: 'public' | 'private';
  passkey?: string;
}
