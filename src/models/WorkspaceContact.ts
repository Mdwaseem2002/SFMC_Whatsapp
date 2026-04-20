import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWorkspaceContact extends Document {
  userId: string;
  workspaceId: string;
  name: string;
  phoneNumber: string;
  company?: string;
  email?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceContactSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    workspaceId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    company: { type: String },
    email: { type: String },
    tags: { type: [String] },
  },
  {
    timestamps: true,
    collection: 'user_workspace_contacts'
  }
);

// Compound index to help quickly find all contacts for a specific workspace under a user
WorkspaceContactSchema.index({ userId: 1, workspaceId: 1 });

const WorkspaceContact: Model<IWorkspaceContact> = mongoose.models.UserWorkspaceContact || mongoose.model<IWorkspaceContact>('UserWorkspaceContact', WorkspaceContactSchema);
export default WorkspaceContact;
