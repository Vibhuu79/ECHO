import { Schema, model, Document, Types } from 'mongoose';

export type MessageType = 'text' | 'emoji' | 'icebreaker' | 'system';

export interface IMessage extends Document {
  _id: Types.ObjectId;
  conversationId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  type: MessageType;
  readBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },
    type: {
      type: String,
      enum: ['text', 'emoji', 'icebreaker', 'system'],
      default: 'text'
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

// Compound index for paginating messages chronologically per conversation
messageSchema.index({ conversationId: 1, createdAt: -1 });

export const Message = model<IMessage>('Message', messageSchema);
