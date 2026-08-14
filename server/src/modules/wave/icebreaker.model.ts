import { Schema, model, Document, Types } from 'mongoose';

export interface IIcebreaker extends Document {
  _id: Types.ObjectId;
  text: string;
  category: string;
  isActive: boolean;
}

const icebreakerSchema = new Schema<IIcebreaker>(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    category: {
      type: String,
      default: 'General',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

export const Icebreaker = model<IIcebreaker>('Icebreaker', icebreakerSchema);
