// Post Types and Interfaces
import { Types } from "mongoose";

export interface CreatePostRequest {
  caption: string;
  eventId?: string;
  communityId?: string;
  media?: {
    url: string;
    type: "image" | "video";
  }[];
}

export interface PostResponse {
  _id: string;
  authorId: string;
  eventId?: string;
  communityId?: string;
  caption?: string;
  media?: PostMediaResponse[];
  author?: {
    _id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
  event?: {
    _id: string;
    title: string;
  };
  likeCount: number;
  commentCount: number;
  userLiked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PostMediaResponse {
  _id: string;
  postId: string;
  mediaType: "image" | "video";
  mediaUrl: string;
}

export interface CommentRequest {
  text: string;
}

export interface CommentResponse {
  _id: string;
  postId: string;
  userId: string;
  text: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: Date;
}

export interface LikeResponse {
  _id: string;
  postId: string;
  userId: string;
  createdAt: Date;
}
