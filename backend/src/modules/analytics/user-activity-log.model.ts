import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUserActivityLog extends Document {
  userId: Types.ObjectId;
  action: string;
  referenceId?: Types.ObjectId;
  createdAt: Date;
}

const UserActivityLogSchema = new Schema<IUserActivityLog>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "VIEW_EVENT",
        "RSVP_EVENT",
        "CREATE_POST",
        "LIKE_POST",
        "COMMENT_POST",
        "FOLLOW_USER",
        "LOGIN",
        "LOGOUT",
      ],
    },
    referenceId: {
      type: Schema.Types.ObjectId,
    },
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false,
    },
  }
);

// Indexes for efficient queries
UserActivityLogSchema.index({ userId: 1, createdAt: -1 });
UserActivityLogSchema.index({ action: 1 });
UserActivityLogSchema.index({ createdAt: -1 });

const UserActivityLog = mongoose.model<IUserActivityLog>(
  "UserActivityLog",
  UserActivityLogSchema
);

export default UserActivityLog;
