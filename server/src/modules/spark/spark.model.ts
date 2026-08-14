import { Schema, model, Document, Types } from 'mongoose';

export type SparkStatusType = 'active' | 'expired' | 'deleted';
export type SparkAccessType = 'public' | 'private';

export interface ISpark extends Document {
  _id: Types.ObjectId;
  creatorId: Types.ObjectId;
  text: string;
  placeName?: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  radius: number;
  duration: number; // minutes: 10, 20, 30, 60
  expiresAt: Date;
  members: Types.ObjectId[];
  bannedMembers: Types.ObjectId[];
  accessType: SparkAccessType;
  passkey?: string;
  maxMembers: number;
  status: SparkStatusType;
  warningSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const sparkSchema = new Schema<ISpark>(
  {
    creatorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    text: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 140
    },
    placeName: {
      type: String,
      trim: true,
      maxlength: 100
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
        required: true
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    radius: {
      type: Number,
      default: 200
    },
    duration: {
      type: Number,
      enum: [10, 20, 30, 60],
      required: true
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    bannedMembers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    accessType: {
      type: String,
      enum: ['public', 'private'],
      default: 'public'
    },
    passkey: {
      type: String,
      trim: true
    },
    maxMembers: {
      type: Number,
      default: 20
    },
    status: {
      type: String,
      enum: ['active', 'expired', 'deleted'],
      default: 'active',
      index: true
    },
    warningSent: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// 2dsphere index for nearby spark geospatial queries
sparkSchema.index({ location: '2dsphere' });
sparkSchema.index({ status: 1, expiresAt: 1 });
sparkSchema.index({ members: 1 });

export const Spark = model<ISpark>('Spark', sparkSchema);
