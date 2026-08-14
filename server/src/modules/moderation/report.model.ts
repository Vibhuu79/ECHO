import { Schema, model, Document, Types } from 'mongoose';

export type ReportCategory =
  | 'spam'
  | 'harassment'
  | 'inappropriate_content'
  | 'fake_identity'
  | 'other';

export type ReportStatus = 'pending' | 'reviewed' | 'dismissed' | 'actioned';

export interface IReport extends Document {
  _id: Types.ObjectId;
  reporterId: Types.ObjectId;
  targetUserId: Types.ObjectId;
  targetEchoId: string;
  category: ReportCategory;
  context?: string;
  status: ReportStatus;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema<IReport>(
  {
    reporterId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    targetEchoId: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    category: {
      type: String,
      enum: ['spam', 'harassment', 'inappropriate_content', 'fake_identity', 'other'],
      required: true
    },
    context: {
      type: String,
      trim: true,
      maxlength: 500
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'actioned'],
      default: 'pending',
      index: true
    }
  },
  {
    timestamps: true
  }
);

reportSchema.index({ reporterId: 1, targetUserId: 1 }, { unique: true });

export const Report = model<IReport>('Report', reportSchema);
