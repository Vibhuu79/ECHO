import { Schema, model, Document, Types } from 'mongoose';

export type ConversationStatusType = 'active' | 'sleeping' | 'archived' | 'saved' | 'deleted';

export interface ILastMessage {
  text: string;
  senderId: Types.ObjectId;
  timestamp: Date;
}

export interface IConversation extends Document {
  _id: Types.ObjectId;
  participants: Types.ObjectId[];
  status: ConversationStatusType;
  isSaved: boolean;
  saveRequests: Types.ObjectId[]; // users who requested to save
  lastMessage?: ILastMessage;
  lastActivityAt: Date;
  sleepingSince?: Date;
  archiveAt?: Date;
  deleteAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    ],
    status: {
      type: String,
      enum: ['active', 'sleeping', 'archived', 'saved', 'deleted'],
      default: 'active',
      index: true
    },
    isSaved: {
      type: Boolean,
      default: false
    },
    saveRequests: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    lastMessage: {
      text: { type: String, trim: true },
      senderId: { type: Schema.Types.ObjectId, ref: 'User' },
      timestamp: { type: Date }
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true
    },
    sleepingSince: {
      type: Date
    },
    archiveAt: {
      type: Date
    },
    deleteAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Ensure query performance for participants and lifecycle queries
conversationSchema.index({ participants: 1 });
conversationSchema.index({ isSaved: 1, status: 1, lastActivityAt: 1 });
conversationSchema.index({ isSaved: 1, deleteAt: 1 });

export const Conversation = model<IConversation>('Conversation', conversationSchema);
