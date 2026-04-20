import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IFastReply extends Document {
  userId: string;
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

const FastReplySchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'user_fast_replies'
  }
);

// Enforce unique title per user
FastReplySchema.index({ userId: 1, title: 1 }, { unique: true });

const FastReply: Model<IFastReply> = mongoose.models.UserFastReply || mongoose.model<IFastReply>('UserFastReply', FastReplySchema);
export default FastReply;
