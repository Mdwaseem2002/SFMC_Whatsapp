import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUserProfile extends Document {
  userId: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  role: string;
  teamSize: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserProfileSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, unique: true, index: true },
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    name: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    company: { type: String, default: '' },
    role: { type: String, default: '' },
    teamSize: { type: String, default: '' },
  },
  {
    timestamps: true,
    collection: 'user_profiles_v2'
  }
);

const UserProfile: Model<IUserProfile> = mongoose.models.UserAppProfile || mongoose.model<IUserProfile>('UserAppProfile', UserProfileSchema);
export default UserProfile;
