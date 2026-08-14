import { Schema, model, Document, Types } from 'mongoose';

export type SparkMessageType = 'text' | 'emoji' | 'system';

export interface ISparkMessage extends Document {
  _id: Types.ObjectId;
  sparkId: Types.ObjectId;
  senderId: Types.ObjectId;
  content: string;
  type: SparkMessageType;
  createdAt: Date;
}

const sparkMessageSchema = new Schema<ISparkMessage>(
  {
    sparkId: {
      type: Schema.Types.ObjectId,
      ref: 'Spark',
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
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'emoji', 'system'],
      default: 'text'
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

sparkMessageSchema.index({ sparkId: 1, createdAt: 1 });

export const SparkMessage = model<ISparkMessage>('SparkMessage', sparkMessageSchema);
