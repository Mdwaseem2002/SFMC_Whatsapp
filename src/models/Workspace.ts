import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IWorkspace extends Document {
  userId: string;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

const WorkspaceSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, required: true, default: '#3b82f6' },
    icon: { type: String, required: true, default: 'Building2' },
  },
  {
    timestamps: true,
    collection: 'user_workspaces'
  }
);

const Workspace: Model<IWorkspace> = mongoose.models.UserWorkspace || mongoose.model<IWorkspace>('UserWorkspace', WorkspaceSchema);
export default Workspace;
