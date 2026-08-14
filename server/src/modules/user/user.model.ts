import { Schema, model, Document, Types } from 'mongoose';

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

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  username: string;
  echoId: string;
  mood: MoodType;
  trustScore: number;
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  locationLabel?: string;
  lastActive: Date;
  presenceStatus: PresenceStatusType;
  blockedUsers: Types.ObjectId[];
  mutedUsers: Types.ObjectId[];
  reportCount: number;
  falseReportCount: number;
  isRestricted: boolean;
  refreshToken?: string;
  auraTheme?: string;
  avatarIcon?: string;
  recentUsernames?: string[];
  vibeStatus?: {
    note: string;
    expiresAt: Date | null;
  };
  allowGlobalIdSearch?: boolean;
  isGhostMode?: boolean;
  passwordHash?: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 20
    },
    echoId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    mood: {
      type: String,
      enum: ['chill', 'studying', 'coffee', 'coding', 'bored', 'gaming', 'free', null],
      default: null
    },
    trustScore: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: false
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: false
      }
    },
    locationLabel: {
      type: String,
      default: ''
    },
    lastActive: {
      type: Date,
      default: Date.now,
      index: true
    },
    presenceStatus: {
      type: String,
      enum: ['online', 'away', 'offline'],
      default: 'offline'
    },
    blockedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    mutedUsers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    reportCount: {
      type: Number,
      default: 0
    },
    falseReportCount: {
      type: Number,
      default: 0
    },
    isRestricted: {
      type: Boolean,
      default: false
    },
    auraTheme: {
      type: String,
      default: 'cyberpunk'
    },
    avatarIcon: {
      type: String,
      default: '⚡'
    },
    recentUsernames: {
      type: [String],
      default: []
    },
    vibeStatus: {
      note: { type: String, default: '' },
      expiresAt: { type: Date, default: null }
    },
    allowGlobalIdSearch: {
      type: Boolean,
      default: false
    },
    isGhostMode: {
      type: Boolean,
      default: false
    },
    passwordHash: {
      type: String
    },
    refreshToken: {
      type: String
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for geospatial queries (sparse so documents without coordinates are ignored by the index)
userSchema.index({ location: '2dsphere' }, { sparse: true });

export const User = model<IUser>('User', userSchema);
