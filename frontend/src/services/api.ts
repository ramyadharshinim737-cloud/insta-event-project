// API service for backend communication with auto-detection
// Automatically finds the working backend URL for any network configuration

// 🔧 MANUAL OVERRIDE: Set this to force a specific URL (for debugging)
// Example: const MANUAL_URL = 'http://192.168.28.61:5000';
const MANUAL_URL: string | null = null; // Set to null for auto-detection

// Dynamic API URL - will be set by auto-detection
let API_BASE_URL = 'http://localhost:5000'; // Fallback default

// Common backend endpoints to try (without specific IPs)
const getCommonUrls = (): string[] => {
  // If manual URL is set, use it exclusively
  if (MANUAL_URL) {
    console.log('🔧 Using MANUAL_URL:', MANUAL_URL);
    return [MANUAL_URL];
  }

  const urls = [
    'http://localhost:5000',        // Localhost/iOS simulator (PRIORITY)
    'http://127.0.0.1:5000',        // Localhost IP
    'http://10.123.111.61:5000',    // Your PC's Current Wi-Fi IP (PRIMARY) ⭐
    'http://192.168.29.219:5000',   // Your PC's Previous Wi-Fi IP
    'http://10.1.34.225:5000',      // Your PC's Previous Wi-Fi IP
    'http://10.90.116.188:5000',    // Your PC's Previous Wi-Fi IP
    'http://192.168.43.114:5000',   // Alternative Wi-Fi IP
    'http://192.168.28.61:5000',    // Alternative Wi-Fi IP
    'http://192.168.56.1:5000',     // Your PC's Ethernet IP
    'http://10.0.2.2:5000',         // Android emulator
  ];

  // In development, the app will auto-detect the correct URL on first API call
  return urls;
};

// Auto-detect working backend URL
export const testConnection = async (): Promise<string | null> => {
  console.log('🔍 Auto-detecting backend server...');
  const urls = getCommonUrls();

  for (const url of urls) {
    try {
      console.log(`Testing: ${url}`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${url}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test', password: 'test' }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      // Any response (even errors) means server is reachable
      console.log(`✅ Server found at: ${url}`);
      API_BASE_URL = url;
      return url;
    } catch (error: any) {
      console.log(`❌ Not reachable: ${url}`, error.message);
    }
  }

  console.log('❌ No backend server found. Using fallback:', API_BASE_URL);
  return null;
};

// Get current API URL (with auto-detection on first call)
let connectionTested = false;
let connectionPromise: Promise<string> | null = null;

export const getApiUrl = async (): Promise<string> => {
  // If detection is already in progress, wait for it
  if (connectionPromise) {
    await connectionPromise;
    return API_BASE_URL;
  }

  // If not tested yet, start detection
  if (!connectionTested) {
    connectionTested = true;
    connectionPromise = (async () => {
      const detectedUrl = await testConnection();
      if (detectedUrl) {
        API_BASE_URL = detectedUrl;
        console.log('🎯 Using detected backend URL:', API_BASE_URL);
      } else {
        console.log('⚠️ No backend detected, using fallback:', API_BASE_URL);
      }
      return API_BASE_URL;
    })();
    await connectionPromise;
    connectionPromise = null;
  }
  return API_BASE_URL;
};

/**
 * Generic API request helper
 * Handles authentication, headers, and error handling
 */
export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
  endpoint: string,
  data?: any
): Promise<T> {
  const apiUrl = await getApiUrl();
  const url = `${apiUrl}/api${endpoint}`;

  // Get auth token from AsyncStorage
  const AsyncStorage = require('@react-native-async-storage/async-storage').default;
  const token = await AsyncStorage.getItem('token'); // Using 'token' key to match login storage

  // Debug: Log token status
  if (!token) {
    console.warn('⚠️ No auth token found in AsyncStorage - user may not be logged in');
  } else {
    console.log('🔑 Auth token found:', token.substring(0, 20) + '...');
  }

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.error('❌ Cannot make authenticated request - no token available');
  }

  const config: RequestInit = {
    method,
    headers,
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  try {
    console.log(`📡 ${method} ${url}`);
    const response = await fetch(url, config);

    console.log(`📨 Response status: ${response.status} ${response.statusText}`);
    console.log(`📨 Response ok: ${response.ok}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
      
      console.error(`❌ API Error [${method} ${endpoint}]: HTTP ${response.status}: ${errorMessage}`);
      console.error(`❌ Error data:`, errorData);
      
      // For 401 errors, throw a more specific error
      if (response.status === 401) {
        throw new Error(errorMessage || 'Invalid or expired token');
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    console.log(`✅ API Success [${method} ${endpoint}]:`, result);
    console.log(`✅ Result type:`, typeof result, Array.isArray(result) ? `Array[${result.length}]` : '');
    return result;
  } catch (error: any) {
    console.error(`❌ API Error [${method} ${endpoint}]:`, error.message);
    console.error(`❌ Full error:`, error);
    throw error;
  }
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    status: string;
  };
  token: string;
}

export const authApi = {
  register: async (data: RegisterData): Promise<AuthResponse> => {
    try {
      const apiUrl = await getApiUrl();
      console.log('Registering user with:', { email: data.email, name: data.name });
      console.log('API URL:', `${apiUrl}/api/auth/register`);

      // Add timeout for network request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${apiUrl}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();
      console.log('Registration response:', result);

      if (!response.ok) {
        console.error('Registration failed:', result.error);
        throw new Error(result.error || 'Registration failed');
      }

      return result;
    } catch (error: any) {
      console.error('Registration error:', error);

      // Check if network error OR timeout error
      if (error.name === 'AbortError' || error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check: your internet connection and try again.');
      }

      throw error;
    }
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const apiUrl = await getApiUrl();
      console.log('🔐 Logging in user:', data.email);
      console.log('API URL:', `${apiUrl}/api/auth/login`);

      // Add timeout for network request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const result = await response.json();
      console.log('✅ Login API response:', JSON.stringify(result, null, 2));
      console.log('✅ Has token?', !!result.token);
      console.log('✅ Has user?', !!result.user);

      if (!response.ok) {
        console.error('Login failed:', result.error);
        throw new Error(result.error || 'Login failed');
      }

      return result;
    } catch (error: any) {
      console.error('❌ Login error:', error);

      // Check if network error OR timeout error
      if (error.name === 'AbortError' || error.message === 'Network request failed') {
        throw new Error('Cannot connect to server. Please check: your internet connection and try again.');
      }

      throw error;
    }
  },

  googleLogin: async (idToken: string): Promise<AuthResponse> => {
    const apiUrl = await getApiUrl();
    const response = await fetch(`${apiUrl}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Google login failed');
    }

    return result;
  },

  verifyOTP: async (email: string, code: string): Promise<AuthResponse> => {
    const apiUrl = await getApiUrl();
    const response = await fetch(`${apiUrl}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, code }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'OTP verification failed');
    }

    return result;
  },

  resendOTP: async (email: string): Promise<void> => {
    const apiUrl = await getApiUrl();
    const response = await fetch(`${apiUrl}/api/auth/resend-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to resend OTP');
    }
  },
};

// Helper function to get authorization header
export const getAuthHeader = async (): Promise<{ Authorization: string }> => {
  const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
  const token = await AsyncStorage.getItem('token');

  if (!token) {
    console.warn('⚠️ No token found in AsyncStorage');
    throw new Error('No authentication token found');
  }

  return { Authorization: `Bearer ${token}` };
};

// Export API_BASE_URL for backward compatibility
export { API_BASE_URL };
