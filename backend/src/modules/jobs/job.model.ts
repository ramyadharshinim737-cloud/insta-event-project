import mongoose, { Schema, Document } from 'mongoose';

export interface IJob extends Document {
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  level: 'Entry' | 'Mid' | 'Senior' | 'Lead';
  salary?: string;
  description: string;
  requirements: string[];
  postedBy: mongoose.Types.ObjectId;
  postedDate: Date;
  expiryDate?: Date;
  applicants: mongoose.Types.ObjectId[];
  status: 'active' | 'closed' | 'draft';
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const JobSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
      required: true,
    },
    level: {
      type: String,
      enum: ['Entry', 'Mid', 'Senior', 'Lead'],
      required: true,
    },
    salary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String],
      default: [],
    },
    postedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    postedDate: {
      type: Date,
      default: Date.now,
    },
    expiryDate: {
      type: Date,
    },
    applicants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    status: {
      type: String,
      enum: ['active', 'closed', 'draft'],
      default: 'active',
    },
    logo: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
JobSchema.index({ status: 1, postedDate: -1 });
JobSchema.index({ company: 1 });
JobSchema.index({ location: 1 });
JobSchema.index({ type: 1 });
JobSchema.index({ level: 1 });

export default mongoose.model<IJob>('Job', JobSchema);
