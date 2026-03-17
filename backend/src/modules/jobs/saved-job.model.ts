import mongoose, { Schema, Document } from 'mongoose';

export interface ISavedJob extends Document {
  user: mongoose.Types.ObjectId;
  job: mongoose.Types.ObjectId;
  savedAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SavedJobSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    job: {
      type: Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    savedAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create compound index to ensure user can't save the same job twice
SavedJobSchema.index({ user: 1, job: 1 }, { unique: true });

export default mongoose.model<ISavedJob>('SavedJob', SavedJobSchema);
