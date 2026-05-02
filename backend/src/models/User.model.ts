import mongoose from 'mongoose';

export interface IUser {
  email: string;
  password: string;
  plan: 'free' | 'pro' | 'enterprise';
  role: 'admin' | 'user';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    plan: { type: String, required: true, default: 'free', enum: ['free', 'pro', 'enterprise'] },
    role: { type: String, required: true, default: 'user', enum: ['user', 'admin'] }
  },
  { timestamps: true }
);

export const UserModel = mongoose.model<IUser>('User', UserSchema);
