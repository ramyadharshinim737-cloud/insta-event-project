import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const spinValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();

    // Loading spinner animation
    Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    // Auto-navigate after 2 seconds
    const timer = setTimeout(() => {
      console.log('⏱️  Splash timer finished, calling onFinish');
      // Check for auth token (simulated for now)
      const hasAuthToken = false; // Replace with actual auth check
      onFinish();
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Ionicons name="calendar" size={64} color="#fff" />
        </View>
        <Text style={styles.appName}>Linsta</Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={[styles.taglineContainer, { opacity: fadeAnim }]}>
        <Text style={styles.tagline}>Discover. Connect. Experience Events.</Text>
      </Animated.View>

      {/* Loading Indicator */}
      <Animated.View
        style={[
          styles.loadingContainer,
          {
            opacity: fadeAnim,
            transform: [{ rotate: spin }],
          },
        ]}
      >
        <Ionicons name="sync-outline" size={32} color="#0a66c2" />
      </Animated.View>

      {/* Version Number */}
      <Animated.View style={[styles.versionContainer, { opacity: fadeAnim }]}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#0a66c2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#0a66c2',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: '#262626',
    letterSpacing: -1,
  },
  taglineContainer: {
    paddingHorizontal: 40,
    marginBottom: 60,
  },
  tagline: {
    fontSize: 16,
    color: '#8e8e8e',
    textAlign: 'center',
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  loadingContainer: {
    marginBottom: 100,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 40,
  },
  versionText: {
    fontSize: 12,
    color: '#8e8e8e',
    letterSpacing: 0.5,
  },
});

export default SplashScreen;
