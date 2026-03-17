// OAuth authentication service for Google, Microsoft, and LinkedIn
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

// Complete web browser session
WebBrowser.maybeCompleteAuthSession();

export interface OAuthResult {
  idToken?: string;
  email?: string;
  name?: string;
  provider: 'google' | 'microsoft' | 'linkedin';
}

export const OAuthService = {
  // Google Sign-In (using expo-auth-session)
  signInWithGoogle: async (): Promise<OAuthResult> => {
    try {
      // Use Expo's default redirect URI for development
      const redirectUri = makeRedirectUri({
        native: 'linsta://redirect',
        useProxy: true, // Uses Expo's proxy for development
      });

      console.log('🔗 Redirect URI:', redirectUri);

      // Google OAuth endpoint
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=660713181192-aadcea55sg7a2uhenictdep4vnp0hlft.apps.googleusercontent.com&` +
        `response_type=id_token&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=openid%20profile%20email&` +
        `nonce=${Date.now()}`;

      console.log('🌐 Opening auth URL...');
      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        // Parse the token from URL fragment
        const params = new URLSearchParams(result.url.split('#')[1]);
        const idToken = params.get('id_token');

        // Decode JWT to get user info (basic parsing)
        if (idToken) {
          const payload = JSON.parse(atob(idToken.split('.')[1]));
          
          return {
            idToken,
            email: payload.email,
            name: payload.name,
            provider: 'google',
          };
        }
      }

      throw new Error('Google Sign-In failed');
    } catch (error: any) {
      console.error('Google Sign-In Error:', error);
      throw new Error(error.message || 'Google Sign-In failed');
    }
  },

  // Microsoft Sign-In (using expo-auth-session)
  signInWithMicrosoft: async (): Promise<OAuthResult> => {
    try {
      // Microsoft requires a registered app with client ID
      // For now, we'll show a message that Microsoft auth needs configuration
      console.log('⚠️ Microsoft OAuth requires app setup');
      
      // Throw a user-friendly error
      throw new Error(
        'Microsoft authentication requires app configuration. ' +
        'Please use Google or email signup for now.'
      );
      
      /* To enable Microsoft OAuth:
       * 1. Go to https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps
       * 2. Register a new application
       * 3. Add redirect URI: https://auth.expo.io/@anonymous/linsta
       * 4. Get Application (client) ID
       * 5. Update this code with your client ID
       */
      
      // Uncomment and configure when ready:
      /*
      const redirectUri = makeRedirectUri({
        native: 'linsta://redirect',
        useProxy: true,
      });

      const authUrl = `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?` +
        `client_id=YOUR_MICROSOFT_CLIENT_ID&` +
        `response_type=id_token&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=openid%20profile%20email&` +
        `response_mode=fragment&` +
        `nonce=${Date.now()}`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const params = new URLSearchParams(result.url.split('#')[1]);
        const idToken = params.get('id_token');

        if (idToken) {
          const payload = JSON.parse(atob(idToken.split('.')[1]));
          
          return {
            idToken,
            email: payload.email,
            name: payload.name,
            provider: 'microsoft',
          };
        }
      }

      throw new Error('Microsoft Sign-In failed');
      */
    } catch (error: any) {
      console.error('Microsoft Sign-In Error:', error);
      throw error;
    }
  },

  // LinkedIn Sign-In (using expo-auth-session)
  signInWithLinkedIn: async (): Promise<OAuthResult> => {
    try {
      // LinkedIn requires a registered app with client ID and secret
      // For now, we'll show a message that LinkedIn auth needs configuration
      console.log('⚠️ LinkedIn OAuth requires app setup');
      
      // Throw a user-friendly error
      throw new Error(
        'LinkedIn authentication requires app configuration. ' +
        'Please use Google or email signup for now.'
      );
      
      /* To enable LinkedIn OAuth:
       * 1. Create app at https://www.linkedin.com/developers/apps
       * 2. Add redirect URI: https://auth.expo.io/@anonymous/linsta
       * 3. Get Client ID and Client Secret
       * 4. Add backend endpoint /api/auth/linkedin to exchange code for token
       * 5. Update this code with your client ID
       */
      
      // Uncomment and configure when ready:
      /*
      const redirectUri = makeRedirectUri({
        native: 'linsta://redirect',
        useProxy: true,
      });

      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=code&` +
        `client_id=YOUR_LINKEDIN_CLIENT_ID&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `scope=openid%20profile%20email`;

      const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

      if (result.type === 'success' && result.url) {
        const params = new URLSearchParams(result.url.split('?')[1]);
        const code = params.get('code');

        if (code) {
          // Exchange code for token on backend
          const response = await fetch('YOUR_BACKEND_URL/api/auth/linkedin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirectUri }),
          });
          
          const data = await response.json();
          
          return {
            idToken: data.idToken,
            email: data.email,
            name: data.name,
            provider: 'linkedin',
          };
        }
      }

      throw new Error('LinkedIn Sign-In failed');
      */
    } catch (error: any) {
      console.error('LinkedIn Sign-In Error:', error);
      throw error;
    }
  },

  // Sign out
  signOut: async () => {
    try {
      // Clear any cached auth data if needed
      console.log('User signed out');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },
};
