import { Schema, model, Document, Types } from 'mongoose';

export interface ICompliment extends Document {
  _id: Types.ObjectId;
  senderId: Types.ObjectId;
  receiverId: Types.ObjectId;
  templateId: string;
  templateCategory: string;
  templateText: string;
  createdAt: Date;
}

const ComplimentSchema = new Schema<ICompliment>(
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
    templateId: {
      type: String,
      required: true
    },
    templateCategory: {
      type: String,
      required: true
    },
    templateText: {
      type: String,
      required: true
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

// Compound index for querying compliments sent by a user recently
ComplimentSchema.index({ senderId: 1, createdAt: -1 });

// Retention index: purge compliments after 30 days
ComplimentSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

export const Compliment = model<ICompliment>('Compliment', ComplimentSchema);
