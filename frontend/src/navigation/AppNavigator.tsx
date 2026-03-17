import React, { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from '../screens/home/HomeScreen';
import EventsDiscoveryScreen from '../screens/events/EventsDiscoveryScreen';
import EventDetailScreen from '../screens/events/EventDetailScreen';
import CreateEventScreen from '../screens/events/CreateEventScreen';
import CreatePostScreen from '../screens/posts/CreatePostScreen';
import CreateContentScreen from '../screens/CreateContentScreen';
import CreateStoryScreen from '../screens/CreateStoryScreen';
import CreateArticleScreen from '../screens/CreateArticleScreen';
import CreateReelScreen from '../screens/CreateReelScreen';
import { NetworkScreen } from '../screens/NetworkScreen';
import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import SignupScreen from '../screens/auth/SignupScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import OAuthSelectionScreen from '../screens/auth/OAuthSelectionScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import { Event } from '../utils/eventTypes';
import MyTicketsScreen from '../pages/tickets/MyTicketsScreen';
import TicketDetailScreen from '../pages/tickets/TicketDetailScreen';
import MyEventsScreen from '../pages/organizer/MyEventsScreen';
import EventDashboardScreen from '../pages/organizer/EventDashboardScreen';
import CreateOrganizerEventScreen from '../pages/organizer/CreateEventScreen';
import AttendeesScreen from '../pages/organizer/AttendeesScreen';
import RSVPConfirmationScreen from '../pages/rsvp/RSVPConfirmationScreen';
import RegistrationFormScreen from '../pages/rsvp/RegistrationFormScreen';
import RegistrationSuccessScreen from '../pages/rsvp/RegistrationSuccessScreen';
import EditEventScreen from '../pages/organizer/EditEventScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import UserProfileScreen from '../screens/common/UserProfileScreen';
import { UserProfileDetailScreen } from '../screens/network/UserProfileDetailScreen';

import ConnectionsScreen from '../pages/network/ConnectionsScreen';
import CommunitiesScreen from '../pages/network/CommunitiesScreen';
import CommunityDetailScreen from '../pages/community/CommunityDetailScreen';
import CreateCommunityScreen from '../pages/community/CreateCommunityScreen';
import CommunitySettingsScreen from '../pages/community/CommunitySettingsScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ChatScreen from '../screens/common/ChatScreen';
import NotificationsScreen from '../pages/notifications/NotificationsScreen';
import NotificationSettingsScreen from '../pages/notifications/NotificationSettingsScreen';
import ResumeBuilderHome from '../pages/resume/ResumeBuilderHome';
import AIAnalysisScreen from '../pages/resume/AIAnalysisScreen';
import CreateResumeScreen from '../pages/resume/CreateResumeScreen';
import EditResumeScreen from '../pages/resume/EditResumeScreen';
import CoverLetterScreen from '../pages/resume/CoverLetterScreen';
import SkillGapScreen from '../pages/resume/SkillGapScreen';
import JobsHomeScreen from '../pages/jobs/JobsHomeScreen';
import JobDetailScreen from '../pages/jobs/JobDetailScreen';
import InterviewPrepScreen from '../pages/jobs/InterviewPrepScreen';
import ApplicationsScreen from '../pages/jobs/ApplicationsScreen';
import CompanyDetailScreen from '../pages/jobs/CompanyDetailScreen';
import CreateJobScreen from '../pages/jobs/CreateJobScreen';
import SavedJobsScreen from '../pages/jobs/SavedJobsScreen';
import { UserProvider, useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { UserStatus } from '../types/userTypes';

type Screen =
  | 'Splash'
  | 'Onboarding'
  | 'Login'
  | 'Signup'
  | 'OTPVerification'
  | 'OAuthSelection'
  | 'Home'
  | 'Events'
  | 'EventDetail'
  | 'CreateEvent'
  | 'CreatePost'
  | 'CreateContent'
  | 'CreateStory'
  | 'CreateArticle'
  | 'CreateReel'
  | 'MyTickets'
  | 'TicketDetail'
  | 'OrganizerMyEvents'
  | 'EventDashboard'
  | 'CreateOrganizerEvent'
  | 'OrganizerAttendees'
  | 'RSVPConfirm'
  | 'RSVPForm'
  | 'RSVPSuccess'
  | 'EditEvent'
  | 'Profile'
  | 'EditProfile'
  | 'ProfileEdit'
  | 'UserProfile'
  | 'UserProfileDetail'
  | 'Network'
  | 'Connections'
  | 'Communities'
  | 'CommunityDetail'
  | 'CreateCommunity'
  | 'CommunitySettings'
  | 'Messages'
  | 'Chat'
  | 'Notifications'
  | 'NotificationSettings'
  | 'ResumeBuilder'
  | 'AIAnalysis'
  | 'CreateResume'
  | 'EditResume'
  | 'CoverLetter'
  | 'SkillGap'
  | 'Jobs'
  | 'JobDetail'
  | 'InterviewPrep'
  | 'Applications'
  | 'CompanyDetail'
  | 'CreateJob'
  | 'SavedJobs';

type NavEntry = {
  screen: Screen;
  params?: any;
};

interface NavigationState {
  currentScreen: Screen;
  eventDetail?: Event;
  userEmail?: string;
  currentParams?: any;
  history: NavEntry[];
}

const AppNavigatorInner = () => {
  const { userState, login, logout, completeProfile } = useUser();
  const { isAuthenticated } = useAuth();
  const [navState, setNavState] = useState<NavigationState>({
    currentScreen: 'Splash',
    currentParams: undefined,
    history: [],
  });

  console.log('🧭 AppNavigator: isAuthenticated =', isAuthenticated, ', currentScreen =', navState.currentScreen);

  // Watch for authentication changes and navigate to Home
  useEffect(() => {
    console.log('🔄 useEffect triggered: isAuthenticated =', isAuthenticated, ', currentScreen =', navState.currentScreen);
    if (isAuthenticated && (navState.currentScreen === 'Login' || navState.currentScreen === 'Signup' || navState.currentScreen === 'OTPVerification')) {
      console.log('✅ User authenticated, navigating to Home');
      setNavState(prev => ({ ...prev, currentScreen: 'Home', history: [] }));
    } else if (!isAuthenticated && navState.currentScreen !== 'Login' && navState.currentScreen !== 'Signup' && navState.currentScreen !== 'OTPVerification' && navState.currentScreen !== 'Splash' && navState.currentScreen !== 'OAuthSelection') {
      console.log('🔒 User logged out, navigating to Login');
      setNavState(prev => ({ ...prev, currentScreen: 'Login', history: [] }));
    }
  }, [isAuthenticated, navState.currentScreen]);

  const navigation = {
    navigate: (screen: Screen, params?: any) => {
      setNavState((s) => ({
        currentScreen: screen,
        eventDetail: params?.event,
        userEmail: params?.email,
        currentParams: params,
        history: [...s.history, { screen: s.currentScreen, params: s.currentParams }],
      }));
    },
    goBack: () => {
      setNavState((s) => {
        if (s.history.length === 0) {
          return { currentScreen: 'Home', eventDetail: undefined, currentParams: undefined, history: [] } as NavigationState;
        }
        const prev = s.history[s.history.length - 1];
        return {
          currentScreen: prev.screen,
          eventDetail: prev.params?.event,
          currentParams: prev.params,
          history: s.history.slice(0, -1),
        };
      });
    },
  };


  const initAfterSplash = async () => {
    if (isAuthenticated) {
      setNavState((s) => ({ ...s, currentScreen: 'Home' }));
      return;
    }

    try {
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      if (!hasSeenOnboarding) {
        setNavState((s) => ({ ...s, currentScreen: 'Onboarding' }));
      } else {
        setNavState((s) => ({ ...s, currentScreen: 'Login' }));
      }
    } catch (error) {
      setNavState((s) => ({ ...s, currentScreen: 'Login' }));
    }
  };


  const handleSplashFinish = () => {
    // Check auth state from AuthContext
    console.log('⏱️ Splash finished, isAuthenticated:', isAuthenticated);
    initAfterSplash();
  };

  const handleLoginSuccess = async (isNewUser: boolean) => {
    // Login is handled in LoginScreen, just navigate based on state
    handlePostAuthFlow();
  };

  const handlePostAuthFlow = () => {
    // Simply navigate to Home if authenticated
    if (userState.isAuthenticated) {
      setNavState((s) => ({ ...s, currentScreen: 'Home' }));
    } else {
      setNavState((s) => ({ ...s, currentScreen: 'Login' }));
    }
  };

  const handleSignupSuccess = (email: string) => {
    setNavState((s) => ({ ...s, currentScreen: 'OTPVerification', userEmail: email }));
  };

  const handleOTPVerificationSuccess = () => {
    setNavState((s) => ({ ...s, currentScreen: 'Home' }));
  };

  const handleOAuthSelect = (provider: string) => {
    console.log(`OAuth selected: ${provider}`);
    setNavState((s) => ({ ...s, currentScreen: 'Home' }));
  };

  const handleCompleteProfile = () => {
    completeProfile();
    setNavState((s) => ({ ...s, currentScreen: 'Home' }));
  };

  const handleLogout = () => {
    logout();
    setNavState((s) => ({ ...s, currentScreen: 'Login' }));
  };

  const renderScreen = () => {
    console.log('🖥️  Rendering screen:', navState.currentScreen);
    
    switch (navState.currentScreen) {
      case 'Splash':
        return <SplashScreen onFinish={handleSplashFinish} />;

      case 'Onboarding':
        return <OnboardingScreen navigation={navigation} />;

      case 'Login':
        return <LoginScreen navigation={navigation} onLoginSuccess={handleLoginSuccess} />;

      case 'Signup':
        return <SignupScreen navigation={navigation} onSignupSuccess={handleSignupSuccess} />;

      case 'OTPVerification':
        return (
          <OTPVerificationScreen
            navigation={navigation}
            route={{ params: { email: navState.userEmail || '' } }}
            onVerificationSuccess={handleOTPVerificationSuccess}
          />
        );

      case 'OAuthSelection':
        return <OAuthSelectionScreen navigation={navigation} onOAuthSelect={handleOAuthSelect} />;

      case 'Home':
        return <HomeScreen navigation={navigation} />;

      case 'Network':
        return <NetworkScreen navigation={navigation} />;

      case 'Events':
        return <EventsDiscoveryScreen navigation={navigation} />;

      case 'Messages':
        return <MessagesScreen navigation={navigation} />;

      case 'Profile':
        return <ProfileScreen navigation={navigation} />;

      case 'EventDetail':
        return (
          <EventDetailScreen
            navigation={navigation}
            route={{ params: { event: navState.currentParams?.event, eventId: navState.currentParams?.eventId } }}
          />
        );

      case 'CreateEvent':
        return <CreateEventScreen navigation={navigation} />;
      
      case 'CreatePost':
        return <CreatePostScreen navigation={navigation} route={{ params: navState.currentParams }} />;

      case 'CreateContent':
        return <CreateContentScreen navigation={navigation} />;

      case 'CreateStory':
        return <CreateStoryScreen navigation={navigation} />;

      case 'CreateArticle':
        return <CreateArticleScreen navigation={navigation} />;

      case 'CreateReel':
        return <CreateReelScreen navigation={navigation} />;

      case 'MyTickets':
        return <MyTicketsScreen navigation={navigation} />;
      case 'TicketDetail':
        return <TicketDetailScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'OrganizerMyEvents':
        return <MyEventsScreen navigation={navigation} />;
      case 'EventDashboard':
        return <EventDashboardScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'CreateOrganizerEvent':
        return <CreateOrganizerEventScreen navigation={navigation} />;
      case 'OrganizerAttendees':
        return <AttendeesScreen navigation={navigation} />;
      case 'RSVPConfirm':
        return <RSVPConfirmationScreen navigation={navigation} />;
      case 'RSVPForm':
        return <RegistrationFormScreen navigation={navigation} />;
      case 'RSVPSuccess':
        return <RegistrationSuccessScreen navigation={navigation} />;
      case 'EditEvent':
        return <EditEventScreen navigation={navigation} />;
      case 'Profile':
        return <ProfileScreen navigation={navigation} />;
      case 'EditProfile':
        return <EditProfileScreen navigation={navigation} route={navState.currentParams ? { params: navState.currentParams } : undefined} />;
      case 'ProfileEdit':
        return <EditProfileScreen navigation={navigation} />;
      case 'UserProfile':
        return <UserProfileScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'UserProfileDetail':
        return <UserProfileDetailScreen navigation={navigation} route={{ params: navState.currentParams }} />;

      case 'Connections':
        return <ConnectionsScreen navigation={navigation} />;
      case 'Communities':
        return <CommunitiesScreen navigation={navigation} />;
      case 'CommunityDetail':
        return <CommunityDetailScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'CreateCommunity':
        return <CreateCommunityScreen navigation={navigation} />;
      case 'CommunitySettings':
        return <CommunitySettingsScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'Messages':
        return <MessagesScreen navigation={navigation} />;
      case 'Chat':
        return <ChatScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'Notifications':
        return <NotificationsScreen navigation={navigation} />;
      case 'NotificationSettings':
        return <NotificationSettingsScreen navigation={navigation} />;
      case 'ResumeBuilder':
        return <ResumeBuilderHome navigation={navigation} />;
      case 'AIAnalysis':
        return <AIAnalysisScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'CreateResume':
        return <CreateResumeScreen navigation={navigation} />;
      case 'EditResume':
        return <EditResumeScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'CoverLetter':
        return <CoverLetterScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'SkillGap':
        return <SkillGapScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'Jobs':
        return <JobsHomeScreen navigation={navigation} />;
      case 'JobDetail':
        return <JobDetailScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'InterviewPrep':
        return <InterviewPrepScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'Applications':
        return <ApplicationsScreen navigation={navigation} />;
      case 'CompanyDetail':
        return <CompanyDetailScreen navigation={navigation} route={{ params: navState.currentParams }} />;
      case 'CreateJob':
        return <CreateJobScreen navigation={navigation} />;
      case 'SavedJobs':
        return <SavedJobsScreen navigation={navigation} />;
      default:
        return <HomeScreen navigation={navigation} />;
    }
  };

  return renderScreen();
};

const AppNavigator = () => {
  return (
    <UserProvider>
      <AppNavigatorInner />
    </UserProvider>
  );
};

export default AppNavigator;
