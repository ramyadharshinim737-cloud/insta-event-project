// User Profile schema
import { Schema, model, Document, Types } from "mongoose";

export interface IUserProfile extends Document {
  userId: Types.ObjectId;
  headline?: string; // Professional headline (e.g., "Full Stack Developer at Microsoft")
  bio?: string; // About/bio section
  location?: string; // City, State/Country
  website?: string; // Personal website or portfolio
  university?: string;
  course?: string;
  year?: string;
  skills: string[];
  interests: string[];
  profileImageUrl?: string;
  coverImageUrl?: string; // Banner/cover photo
  openToWork?: boolean; // Open to work badge
  openToWorkRoles?: string[]; // Types of roles open to
  experience?: Array<{
    title: string;
    company: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
  }>;
  education?: Array<{
    school: string;
    degree: string;
    field?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
  }>;
}

const profileSchema = new Schema<IUserProfile>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  headline: {
    type: String,
  },
  bio: {
    type: String,
  },
  location: {
    type: String,
  },
  website: {
    type: String,
  },
  university: {
    type: String,
  },
  course: {
    type: String,
  },
  year: {
    type: String,
  },
  skills: {
    type: [String],
    default: [],
  },
  interests: {
    type: [String],
    default: [],
  },
  profileImageUrl: {
    type: String,
  },
  coverImageUrl: {
    type: String,
  },
  openToWork: {
    type: Boolean,
    default: false,
  },
  openToWorkRoles: {
    type: [String],
    default: [],
  },
  experience: [{
    title: String,
    company: String,
    location: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
    description: String,
  }],
  education: [{
    school: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    current: { type: Boolean, default: false },
  }],
});

export const UserProfile = model<IUserProfile>("UserProfile", profileSchema);
