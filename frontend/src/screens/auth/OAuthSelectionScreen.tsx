import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface OAuthSelectionScreenProps {
  navigation?: any;
  onOAuthSelect?: (provider: string) => void;
}

const OAuthSelectionScreen: React.FC<OAuthSelectionScreenProps> = ({
  navigation,
  onOAuthSelect,
}) => {
  const handleProviderSelect = (provider: string) => {
    onOAuthSelect?.(provider);
  };

  const handleBackToEmail = () => {
    navigation?.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Continue with</Text>
        <Text style={styles.subtitle}>Choose your preferred sign-in method</Text>

        {/* OAuth Provider Buttons */}
        <View style={styles.providersContainer}>
          {/* Google */}
          <TouchableOpacity
            style={styles.providerButton}
            onPress={() => handleProviderSelect('Google')}
            activeOpacity={0.8}
          >
            <View style={styles.providerIconContainer}>
              <Ionicons name="logo-google" size={32} color="#DB4437" />
            </View>
            <View style={styles.providerTextContainer}>
              <Text style={styles.providerName}>Google</Text>
              <Text style={styles.providerDescription}>Sign in with your Google account</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#8e8e8e" />
          </TouchableOpacity>

          {/* Microsoft */}
          <TouchableOpacity
            style={styles.providerButton}
            onPress={() => handleProviderSelect('Microsoft')}
            activeOpacity={0.8}
          >
            <View style={styles.providerIconContainer}>
              <Ionicons name="logo-microsoft" size={32} color="#00A4EF" />
            </View>
            <View style={styles.providerTextContainer}>
              <Text style={styles.providerName}>Microsoft</Text>
              <Text style={styles.providerDescription}>Sign in with your Microsoft account</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#8e8e8e" />
          </TouchableOpacity>

          {/* LinkedIn */}
          <TouchableOpacity
            style={styles.providerButton}
            onPress={() => handleProviderSelect('LinkedIn')}
            activeOpacity={0.8}
          >
            <View style={styles.providerIconContainer}>
              <Ionicons name="logo-linkedin" size={32} color="#0A66C2" />
            </View>
            <View style={styles.providerTextContainer}>
              <Text style={styles.providerName}>LinkedIn</Text>
              <Text style={styles.providerDescription}>Sign in with your LinkedIn account</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#8e8e8e" />
          </TouchableOpacity>
        </View>

        {/* Back to Email Login */}
        <TouchableOpacity onPress={handleBackToEmail} style={styles.backButton}>
          <Ionicons name="arrow-back" size={20} color="#0a66c2" />
          <Text style={styles.backText}>Back to email login</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#262626',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#8e8e8e',
    textAlign: 'center',
    marginBottom: 48,
  },
  providersContainer: {
    gap: 16,
    marginBottom: 40,
  },
  providerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 12,
    padding: 20,
    minHeight: 88,
  },
  providerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  providerTextContainer: {
    flex: 1,
  },
  providerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 4,
  },
  providerDescription: {
    fontSize: 13,
    color: '#8e8e8e',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },
  backText: {
    fontSize: 15,
    color: '#0a66c2',
    fontWeight: '600',
  },
});

export default OAuthSelectionScreen;
