// User schema
import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  authProvider: "local" | "google";
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  authProvider: {
    type: String,
    enum: ["local", "google"],
    default: "local",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const User = model<IUser>("User", userSchema);
