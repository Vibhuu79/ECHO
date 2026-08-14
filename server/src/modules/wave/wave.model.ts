import { Schema, model, Document, Types } from 'mongoose';

export type WaveStatusType = 'pending' | 'accepted' | 'ignored' | 'blocked';

export interface IWave extends Document {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  iceBreaker?: string;
  status: WaveStatusType;
  createdAt: Date;
  respondedAt?: Date;
}

const waveSchema = new Schema<IWave>(
  {
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    receiverId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    iceBreaker: {
      type: String,
      trim: true,
      maxlength: 300
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'ignored', 'blocked'],
      default: 'pending',
      index: true
    },
    respondedAt: {
      type: Date
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Prevent duplicate pending waves between same sender and receiver
waveSchema.index({ senderId: 1, receiverId: 1, status: 1 });

export const Wave = model<IWave>('Wave', waveSchema);
