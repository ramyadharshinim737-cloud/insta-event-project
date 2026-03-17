// User State Types
export enum UserStatus {
  RETURNING_USER = 'RETURNING_USER',
  LOGGED_OUT = 'LOGGED_OUT',
}

export interface UserProfile {
  id: string;
  email: string;
  fullName?: string;
  title?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  profileComplete: boolean;
}

export interface UserState {
  status: UserStatus;
  profile: UserProfile | null;
  isAuthenticated: boolean;
}
