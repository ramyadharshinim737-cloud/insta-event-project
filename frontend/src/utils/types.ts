export interface User {
  id: string;
  name: string;
  title: string;
  avatar: string;
  verified?: boolean;
}

export interface Story {
  id: string;
  user: User;
  isOwn?: boolean;
  timestamp: string;
  content?: string;
  backgroundColor?: string;
  imageUri?: any;
  mediaType?: 'image' | 'video';
  mediaUri?: string;
}

export interface Post {
  id: string;
  user: User;
  timestamp: string;
  content: string;
  title?: string;
  image?: string;
  coverImage?: string;
  likes: number;
  comments: number;
  shares: number;
  isReel?: boolean;
  isArticle?: boolean;
  videoIcon?: string;
  videoUri?: any;
  views?: number;
}
