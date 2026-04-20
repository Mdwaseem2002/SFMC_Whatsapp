import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string;
  firstName: string;
  lastName: string;
  company: string;
  role: string;
  teamSize: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    company: { type: String, required: true },
    role: { type: String, required: true },
    teamSize: { type: String, required: true },
  },
  {
    timestamps: true,
    collection: 'user_profiles_v2'
  }
);

const UserProfile: Model<IUserProfile> = mongoose.models.UserAppProfile || mongoose.model<IUserProfile>('UserAppProfile', UserProfileSchema);
export default UserProfile;
