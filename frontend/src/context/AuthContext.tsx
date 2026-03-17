import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi, LoginData, RegisterData } from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  login: (data: LoginData) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  reloadAuth: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  token: null,
  login: async () => {},
  loginWithGoogle: async () => {},
  register: async () => {},
  logout: async () => {},
  reloadAuth: async () => {},
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load stored auth data on mount
  useEffect(() => {
    loadStoredAuth();
  }, []);

  // Monitor for invalid token errors
  useEffect(() => {
    const checkTokenValidity = async () => {
      if (isAuthenticated && token) {
        // You could add a token validation check here if needed
        // For now, we rely on API calls to detect invalid tokens
      }
    };
    checkTokenValidity();
  }, [isAuthenticated, token]);

  // Log authentication state changes
  useEffect(() => {
    console.log('🔐 AuthContext: isAuthenticated changed to:', isAuthenticated);
    console.log('🔐 AuthContext: user:', user);
    console.log('🔐 AuthContext: token:', token ? 'Present' : 'None');
  }, [isAuthenticated]);

  const loadStoredAuth = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      console.log('📡 AuthContext: Starting login...');
      const response = await authApi.login(data);
      
      console.log('📡 AuthContext: Login response received', { hasToken: !!response.token, hasUser: !!response.user });
      
      // Store token and user data
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('✅ AuthContext: Token and user stored in AsyncStorage');
      
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log('✅ AuthContext: State updated - isAuthenticated set to true');
      console.log('✅ AuthContext: User:', response.user);
    } catch (error) {
      console.error('❌ AuthContext: Login failed', error);
      throw error;
    }
  };

  const loginWithGoogle = async (idToken: string) => {
    try {
      console.log('📡 AuthContext: Starting Google login...');
      const response = await authApi.googleLogin(idToken);
      
      console.log('📡 AuthContext: Google login response received');
      
      // Store token and user data
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      console.log('✅ AuthContext: Token and user stored');
      
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
      
      console.log('✅ AuthContext: Google authentication complete');
    } catch (error) {
      console.error('❌ AuthContext: Google login failed', error);
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await authApi.register(data);
      
      // Store token and user data
      await AsyncStorage.setItem('token', response.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.user));
      
      setToken(response.token);
      setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user');
      
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout successful - redirecting to login');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const reloadAuth = async () => {
    console.log('🔄 Reloading auth state from AsyncStorage...');
    await loadStoredAuth();
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, token, login, loginWithGoogle, register, logout, reloadAuth, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
