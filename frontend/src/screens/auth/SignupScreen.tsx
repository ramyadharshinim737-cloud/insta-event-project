import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../services/api';
import { OAuthService } from '../../services/oauth.service';

interface SignupScreenProps {
  navigation?: any;
  onSignupSuccess?: (email: string) => void;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation, onSignupSuccess }) => {
  const { loginWithGoogle } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    privacy: '',
  });

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return { strength: 0, label: '', color: '#dbdbdb' };
    if (pwd.length < 6) return { strength: 1, label: 'Weak', color: '#ed4956' };
    if (pwd.length < 10) return { strength: 2, label: 'Medium', color: '#ffa500' };
    if (pwd.length >= 10 && /[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) {
      return { strength: 3, label: 'Strong', color: '#4caf50' };
    }
    return { strength: 2, label: 'Medium', color: '#ffa500' };
  };

  const passwordStrength = getPasswordStrength(password);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignup = async () => {
    Alert.alert('Debug', 'Button pressed!'); // Simple test
    console.log('🔵 Signup button pressed');
    setErrors({ fullName: '', email: '', password: '', confirmPassword: '', privacy: '' });

    let hasError = false;
    const newErrors = { fullName: '', email: '', password: '', confirmPassword: '', privacy: '' };

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
      hasError = true;
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
      hasError = true;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      hasError = true;
    }

    if (!password) {
      newErrors.password = 'Password is required';
      hasError = true;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      hasError = true;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      hasError = true;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      hasError = true;
    }

    if (!acceptedPrivacy) {
      newErrors.privacy = 'You must accept the privacy policy';
      hasError = true;
    }

    if (hasError) {
      console.log('❌ Validation errors:', newErrors);
      setErrors(newErrors);
      return;
    }

    console.log('✅ Validation passed, calling register API...');
    setIsLoading(true);

    try {
      console.log('📤 Registering user:', { name: fullName, email });
      
      // Call the actual backend register API
      const result = await authApi.register({ 
        name: fullName, 
        email, 
        password 
      });
      
      console.log('✅ Registration successful!', result);
      
      // Navigate to OTP verification screen
      console.log('📧 Navigating to OTP verification for email:', email);
      Alert.alert(
        'Check Your Email', 
        'We\'ve sent a verification code to your email. Please enter it to complete your registration.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate to OTP screen
              onSignupSuccess?.(email);
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ Signup error:', error);
      Alert.alert(
        'Signup Failed', 
        error.message || 'Failed to create account. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignup = async (provider: 'google' | 'microsoft' | 'linkedin') => {
    setIsLoading(true);
    
    try {
      console.log(`🔐 Starting ${provider} OAuth...`);
      
      let result;
      
      switch (provider) {
        case 'google':
          result = await OAuthService.signInWithGoogle();
          break;
        case 'microsoft':
          result = await OAuthService.signInWithMicrosoft();
          break;
        case 'linkedin':
          result = await OAuthService.signInWithLinkedIn();
          break;
      }
      
      console.log('✅ OAuth successful:', result);
      
      // Send to backend for authentication
      if (result.idToken) {
        // Use AuthContext's loginWithGoogle method
        await loginWithGoogle(result.idToken);
        console.log('✅ Google authentication complete');
        
        Alert.alert(
          'Success!',
          `Welcome! You've signed up with ${provider}.`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigation will happen automatically via AuthContext
                // The RootNavigator watches isAuthenticated state
              }
            }
          ]
        );
      }
    } catch (error: any) {
      console.error(`❌ ${provider} OAuth error:`, error);
      
      if (error.message !== 'Sign-in cancelled') {
        Alert.alert(
          `${provider.charAt(0).toUpperCase() + provider.slice(1)} Sign-In Failed`,
          error.message || `Failed to sign in with ${provider}. Please try again.`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    navigation?.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.headerContainer}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join Linsta to discover amazing events</Text>
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={[styles.inputContainer, errors.fullName && styles.inputError]}>
              <Ionicons name="person-outline" size={20} color="#8e8e8e" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor="#8e8e8e"
                value={fullName}
                onChangeText={setFullName}
                autoCapitalize="words"
              />
            </View>
            {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, errors.email && styles.inputError]}>
              <Ionicons name="mail-outline" size={20} color="#8e8e8e" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor="#8e8e8e"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={[styles.inputContainer, errors.password && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#8e8e8e" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor="#8e8e8e"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#8e8e8e"
                />
              </TouchableOpacity>
            </View>
            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBars}>
                  {[1, 2, 3].map((bar) => (
                    <View
                      key={bar}
                      style={[
                        styles.strengthBar,
                        bar <= passwordStrength.strength && { backgroundColor: passwordStrength.color },
                      ]}
                    />
                  ))}
                </View>
                <Text style={[styles.strengthLabel, { color: passwordStrength.color }]}>
                  {passwordStrength.label}
                </Text>
              </View>
            )}
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <View style={[styles.inputContainer, errors.confirmPassword && styles.inputError]}>
              <Ionicons name="lock-closed-outline" size={20} color="#8e8e8e" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor="#8e8e8e"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color="#8e8e8e"
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          {/* Privacy Policy Checkbox */}
          <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setAcceptedPrivacy(!acceptedPrivacy)}
          >
            <View style={[styles.checkbox, acceptedPrivacy && styles.checkboxChecked]}>
              {acceptedPrivacy && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.checkboxText}>
              I agree to the{' '}
              <Text style={styles.link}>Privacy Policy</Text> and{' '}
              <Text style={styles.link}>Terms of Service</Text>
            </Text>
          </TouchableOpacity>
          {errors.privacy ? <Text style={styles.errorText}>{errors.privacy}</Text> : null}

          {/* Signup Button */}
          <TouchableOpacity
            style={[styles.signupButton, isLoading && styles.signupButtonDisabled]}
            onPress={() => {
              console.log('🔴 BUTTON TAPPED!');
              handleSignup();
            }}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <Text style={styles.signupButtonText}>Creating account...</Text>
            ) : (
              <Text style={styles.signupButtonText}>Sign Up</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or sign up with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* OAuth Buttons */}
          <View style={styles.oauthContainer}>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthSignup('google')}
              disabled={isLoading}
            >
              <Ionicons name="logo-google" size={24} color="#DB4437" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthSignup('microsoft')}
              disabled={isLoading}
            >
              <Ionicons name="logo-microsoft" size={24} color="#00A4EF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.oauthButton}
              onPress={() => handleOAuthSignup('linkedin')}
              disabled={isLoading}
            >
              <Ionicons name="logo-linkedin" size={24} color="#0A66C2" />
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={handleLogin}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
  },
  headerContainer: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#8e8e8e',
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputError: {
    borderColor: '#ed4956',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    color: '#262626',
  },
  eyeIcon: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#ed4956',
    marginTop: 4,
  },
  strengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
    flex: 1,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#dbdbdb',
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 12,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#dbdbdb',
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0a66c2',
    borderColor: '#0a66c2',
  },
  checkboxText: {
    flex: 1,
    fontSize: 13,
    color: '#8e8e8e',
    lineHeight: 20,
  },
  link: {
    color: '#0a66c2',
    fontWeight: '600',
  },
  signupButton: {
    backgroundColor: '#0a66c2',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  signupButtonDisabled: {
    opacity: 0.6,
  },
  signupButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dbdbdb',
  },
  dividerText: {
    fontSize: 13,
    color: '#8e8e8e',
    marginHorizontal: 12,
  },
  oauthContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  oauthButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#8e8e8e',
  },
  loginLink: {
    fontSize: 14,
    color: '#0a66c2',
    fontWeight: '600',
  },
});

export default SignupScreen;
