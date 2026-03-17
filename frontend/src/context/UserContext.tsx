  import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
  import { UserState, UserStatus, UserProfile } from '../types/userTypes';

interface UserContextType {
  userState: UserState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  completeProfile: () => void;
}

  const UserContext = createContext<UserContextType | undefined>(undefined);

  export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userState, setUserState] = useState<UserState>({
      status: UserStatus.RETURNING_USER,
      profile: {
        id: '1',
        email: 'dev@linsta.com',
        fullName: 'Development User',
        title: 'Software Developer',
        profileComplete: true,
      },
      isAuthenticated: true,
    });

    // Check for existing auth token on mount
    useEffect(() => {
      checkAuthToken();
    }, []);

    const checkAuthToken = async () => {
      // TODO: Check AsyncStorage for auth token
      // For now, assume logged out
    };

  const login = async (email: string, password: string) => {
    // Simplified login logic - all users are RETURNING_USER
    const profile: UserProfile = {
      id: '1',
      email,
      fullName: 'Test User',
      profileComplete: true,
    };

    setUserState({
      status: UserStatus.RETURNING_USER,
      profile,
      isAuthenticated: true,
    });
  };

    const logout = () => {
      setUserState({
        status: UserStatus.LOGGED_OUT,
        profile: null,
        isAuthenticated: false,
      });
    };

    const updateProfile = (updates: Partial<UserProfile>) => {
      if (userState.profile) {
        setUserState({
          ...userState,
          profile: {
            ...userState.profile,
            ...updates,
          },
        });
      }
    };

    const completeProfile = () => {
      if (userState.profile) {
        setUserState({
          ...userState,
          status: UserStatus.RETURNING_USER,
          profile: {
            ...userState.profile,
            profileComplete: true,
          },
        });
      }
    };



    return (
      <UserContext.Provider
      value={{
        userState,
        login,
        logout,
        updateProfile,
        completeProfile,
      }}
      >
        {children}
      </UserContext.Provider>
    );
  };

  export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
      throw new Error('useUser must be used within a UserProvider');
    }
    return context;
  };
