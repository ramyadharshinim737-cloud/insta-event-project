import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface OTPVerificationScreenProps {
  navigation?: any;
  route?: {
    params: {
      email: string;
    };
  };
  onVerificationSuccess?: () => void;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  navigation,
  route,
  onVerificationSuccess,
}) => {
  const { reloadAuth } = useAuth();
  const email = route?.params?.email || 'user@example.com';
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0 && !canResend) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setCanResend(true);
    }
  }, [timer, canResend]);

  const handleOtpChange = (value: string, index: number) => {
    if (isLocked) return;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (newOtp.every((digit) => digit !== '') && index === 5) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (code?: string) => {
    if (isLocked) {
      Alert.alert('Account Locked', 'Too many failed attempts. Please try again in 30 minutes.');
      return;
    }

    const otpCode = code || otp.join('');
    
    if (otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter all 6 digits');
      return;
    }

    setIsVerifying(true);

    try {
      console.log('🔐 Verifying OTP for:', email);
      
      // Call the real API
      const result = await authApi.verifyOTP(email, otpCode);
      
      console.log('✅ OTP verified successfully!', result);
      
      // Save token and user to AsyncStorage and set authentication state
      await AsyncStorage.setItem('token', result.token);
      await AsyncStorage.setItem('user', JSON.stringify(result.user));
      
      console.log('✅ Token and user saved to AsyncStorage');
      console.log('✅ User authenticated:', result.user);
      
      // Reload auth state in AuthContext
      await reloadAuth();
      console.log('✅ Auth state reloaded in context');
      
      // Show success and navigate
      Alert.alert(
        'Success!',
        'Your email has been verified. Welcome to Linsta!',
        [
          {
            text: 'OK',
            onPress: () => {
              onVerificationSuccess?.();
            }
          }
        ]
      );
    } catch (error: any) {
      console.error('❌ OTP verification error:', error);
      
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);

      if (newAttempts >= 5) {
        setIsLocked(true);
        Alert.alert(
          'Account Locked',
          'Too many failed attempts. Your account has been locked for 30 minutes.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Invalid Code',
          error.message || `Incorrect verification code. ${5 - newAttempts} attempts remaining.`
        );
      }
      
      // Clear OTP
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;

    try {
      console.log('📧 Resending OTP to:', email);
      await authApi.resendOTP(email);
      
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      
      Alert.alert('Code Sent', 'A new verification code has been sent to your email.');
      console.log('✅ OTP resent successfully');
    } catch (error: any) {
      console.error('❌ Resend OTP error:', error);
      Alert.alert('Error', error.message || 'Failed to resend code. Please try again.');
    }
  };

  const handleChangeEmail = () => {
    navigation?.goBack();
  };

  const handleSendLink = () => {
    Alert.alert('Verification Link Sent', 'A verification link has been sent to your email.');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Email Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="mail-outline" size={64} color="#0a66c2" />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => (inputRefs.current[index] = ref)}
              style={[
                styles.otpInput,
                digit && styles.otpInputFilled,
                isLocked && styles.otpInputDisabled,
              ]}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              editable={!isLocked}
            />
          ))}
        </View>

        {/* Attempts Warning */}
        {attempts > 0 && !isLocked && (
          <Text style={styles.attemptsText}>
            {5 - attempts} attempts remaining
          </Text>
        )}

        {/* Locked Warning */}
        {isLocked && (
          <View style={styles.lockedContainer}>
            <Ionicons name="lock-closed" size={20} color="#ed4956" />
            <Text style={styles.lockedText}>
              Account locked for 30 minutes
            </Text>
          </View>
        )}

        {/* Resend Code */}
        <View style={styles.resendContainer}>
          {canResend ? (
            <TouchableOpacity onPress={handleResend}>
              <Text style={styles.resendLink}>Resend code</Text>
            </TouchableOpacity>
          ) : (
            <Text style={styles.resendText}>
              Resend code in <Text style={styles.timerText}>{timer}s</Text>
            </Text>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, (isVerifying || isLocked) && styles.verifyButtonDisabled]}
          onPress={() => handleVerify()}
          disabled={isVerifying || isLocked}
        >
          {isVerifying ? (
            <Text style={styles.verifyButtonText}>Verifying...</Text>
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        {/* Alternative Options */}
        <View style={styles.alternativeContainer}>
          <TouchableOpacity onPress={handleSendLink}>
            <Text style={styles.alternativeLink}>Send verification link via email</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={handleChangeEmail} style={styles.changeEmailButton}>
            <Text style={styles.changeEmailText}>Change email</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: '#8e8e8e',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  email: {
    fontWeight: '600',
    color: '#262626',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 16,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: '#dbdbdb',
    borderRadius: 8,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#262626',
  },
  otpInputFilled: {
    borderColor: '#0a66c2',
    backgroundColor: '#e3f2fd',
  },
  otpInputDisabled: {
    backgroundColor: '#f5f5f5',
    borderColor: '#dbdbdb',
  },
  attemptsText: {
    fontSize: 13,
    color: '#ed4956',
    marginBottom: 16,
  },
  lockedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  lockedText: {
    fontSize: 14,
    color: '#ed4956',
    fontWeight: '600',
  },
  resendContainer: {
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: '#8e8e8e',
  },
  timerText: {
    fontWeight: '600',
    color: '#0a66c2',
  },
  resendLink: {
    fontSize: 14,
    color: '#0a66c2',
    fontWeight: '600',
  },
  verifyButton: {
    backgroundColor: '#0a66c2',
    paddingVertical: 16,
    paddingHorizontal: 48,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    opacity: 0.6,
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  alternativeContainer: {
    alignItems: 'center',
    gap: 16,
  },
  alternativeLink: {
    fontSize: 14,
    color: '#0a66c2',
    fontWeight: '600',
  },
  changeEmailButton: {
    paddingVertical: 8,
  },
  changeEmailText: {
    fontSize: 14,
    color: '#8e8e8e',
  },
});

export default OTPVerificationScreen;
