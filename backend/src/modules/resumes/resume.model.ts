import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IResume extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    portfolio?: string;
  };
  summary?: string;
  experience: Array<{
    company: string;
    position: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    description?: string;
    achievements?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    location?: string;
    startDate: Date;
    endDate?: Date;
    current: boolean;
    gpa?: string;
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: Date;
    credentialId?: string;
  }>;
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    url?: string;
  }>;
  languages?: Array<{
    name: string;
    proficiency: string;
  }>;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ResumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    personalInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      location: String,
      linkedin: String,
      portfolio: String,
    },
    summary: String,
    experience: [
      {
        company: { type: String, required: true },
        position: { type: String, required: true },
        location: String,
        startDate: { type: Date, required: true },
        endDate: Date,
        current: { type: Boolean, default: false },
        description: String,
        achievements: [String],
      },
    ],
    education: [
      {
        institution: { type: String, required: true },
        degree: { type: String, required: true },
        field: String,
        location: String,
        startDate: { type: Date, required: true },
        endDate: Date,
        current: { type: Boolean, default: false },
        gpa: String,
      },
    ],
    skills: [{ type: String }],
    certifications: [
      {
        name: String,
        issuer: String,
        date: Date,
        credentialId: String,
      },
    ],
    projects: [
      {
        name: String,
        description: String,
        technologies: [String],
        url: String,
      },
    ],
    languages: [
      {
        name: String,
        proficiency: String,
      },
    ],
    isPublic: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

export const Resume = mongoose.model<IResume>('Resume', ResumeSchema);
