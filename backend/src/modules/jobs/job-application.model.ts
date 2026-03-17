import mongoose, { Schema, Document } from 'mongoose';

export interface IJobApplication extends Document {
  job: mongoose.Types.ObjectId;
  applicant: mongoose.Types.ObjectId;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'rejected' | 'accepted';
  coverLetter?: string;
  resume?: string;
  appliedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const JobApplicationSchema: Schema = new Schema(
  {
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
      default: 'pending',
    },
    coverLetter: {
      type: String,
    },
    resume: {
      type: String,
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one application per user per job
JobApplicationSchema.index({ job: 1, applicant: 1 }, { unique: true });
JobApplicationSchema.index({ applicant: 1, appliedDate: -1 });
JobApplicationSchema.index({ job: 1, status: 1 });

export default mongoose.model<IJobApplication>('JobApplication', JobApplicationSchema);
