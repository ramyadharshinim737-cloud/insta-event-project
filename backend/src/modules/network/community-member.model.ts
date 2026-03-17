// CommunityMember schema
import { Schema, model, Document, Types } from "mongoose";

export type CommunityMemberRole = "member" | "moderator" | "admin";
export type CommunityMemberStatus = "active" | "pending" | "banned";

export interface ICommunityMember extends Document {
  communityId: Types.ObjectId;
  userId: Types.ObjectId;
  role: CommunityMemberRole;
  status: CommunityMemberStatus;
  requestedAt?: Date;
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  joinedAt: Date;
}

const communityMemberSchema = new Schema<ICommunityMember>({
  communityId: {
    type: Schema.Types.ObjectId,
    ref: "Community",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["member", "moderator", "admin"],
    default: "member",
  },
  status: {
    type: String,
    enum: ["active", "pending", "banned"],
    default: "active",
  },
  requestedAt: {
    type: Date,
  },
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

communityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });

export const CommunityMember = model<ICommunityMember>(
  "CommunityMember",
  communityMemberSchema
);
