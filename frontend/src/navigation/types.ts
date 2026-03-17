import { NavigatorScreenParams } from '@react-navigation/native';

export type TabParamList = {
  Home: undefined;
  Events: undefined;
  Network: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type AppStackParamList = {
  Tabs: NavigatorScreenParams<TabParamList>;
  EventDetail: { eventId?: string };
  CreateEvent: undefined;
  UserProfile: { userId?: string };
  ChatScreen: { chatId?: string };
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Onboarding: undefined;
};

export type RootStackParamList = {
  App: NavigatorScreenParams<AppStackParamList>;
  Auth: NavigatorScreenParams<AuthStackParamList>;
};

