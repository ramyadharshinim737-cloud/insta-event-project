import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import ConnectButton from './ConnectButton';

interface Props {
  name: string;
  headline: string;
  avatar?: string;
  userId?: string;
  navigation?: any;
  mutualConnections?: number;
  isOnline?: boolean;
}

const UserCard: React.FC<Props> = ({ 
  name, 
  headline, 
  avatar, 
  userId, 
  navigation, 
  mutualConnections,
  isOnline = false 
}) => {
  const { colors } = useTheme();
  const [scaleValue] = useState(new Animated.Value(1));
  
  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.98,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };
  
  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      useNativeDriver: true,
      speed: 50,
      bounciness: 4,
    }).start();
  };
  
  const handlePress = () => {
    if (navigation) {
      try {
        navigation.navigate('UserProfile', { userId: userId || name });
      } catch (error) {
        console.error('Navigation error:', error);
      }
    }
  };
  
  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: scaleValue }] }]}>
      <View style={styles.card}>
        <TouchableOpacity 
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={1}
          style={styles.cardTouchable}
        >
          <View style={styles.cardContent}>
            {/* Avatar with online status and gradient border */}
            <View style={styles.avatarWrapper}>
              <LinearGradient
                colors={['#0A66C2', '#378FE9', '#5B93D6']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.avatarGradientBorder}
              >
                <View style={styles.avatarInnerBorder}>
                  <Image 
                    source={{ uri: avatar || 'https://i.pravatar.cc/150' }} 
                    style={styles.avatar} 
                  />
                </View>
              </LinearGradient>
              
              {/* Online Status Indicator */}
              {isOnline && (
                <View style={styles.onlineIndicatorWrapper}>
                  <View style={styles.onlineIndicator} />
                </View>
              )}
            </View>
            
            {/* User Info */}
            <View style={styles.userInfo}>
              <View style={styles.nameRow}>
                <Text style={styles.name} numberOfLines={1}>{name}</Text>
                <Ionicons name="checkmark-circle" size={18} color="#0A66C2" />
              </View>
              
              <Text style={styles.headline} numberOfLines={2}>{headline}</Text>
              
              {/* Mutual Connections Badge */}
              {mutualConnections && mutualConnections > 0 && (
                <View style={styles.mutualBadge}>
                  <LinearGradient
                    colors={['#F0F9FF', '#E0F2FE']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.mutualBadgeGradient}
                  >
                    <Ionicons name="people" size={13} color="#0A66C2" />
                    <Text style={styles.mutualText}>
                      {mutualConnections} mutual
                    </Text>
                  </LinearGradient>
                </View>
              )}
            </View>
          </View>
          
          {/* Divider */}
          <View style={styles.divider} />
          
          {/* Connect Button */}
          <View style={styles.buttonContainer}>
            <ConnectButton />
          </View>
        </TouchableOpacity>
        
        {/* Decorative corner accent */}
        <View style={styles.cornerAccent} />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 16,
    marginBottom: 14,
  },
  card: { 
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    ...Platform.select({
      ios: {
        shadowColor: '#0A66C2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  cardTouchable: {
    padding: 20,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarWrapper: {
    marginRight: 16,
    position: 'relative',
  },
  avatarGradientBorder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
  },
  avatarInnerBorder: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
    padding: 2,
  },
  avatar: { 
    width: '100%',
    height: '100%',
    borderRadius: 30,
    backgroundColor: '#E8F4FF',
  },
  onlineIndicatorWrapper: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 2,
  },
  onlineIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
  },
  userInfo: {
    flex: 1,
    paddingTop: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  name: { 
    fontSize: 18, 
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
    flex: 1,
  },
  headline: {
    fontSize: 14,
    lineHeight: 20,
    color: '#64748B',
    marginBottom: 10,
    fontWeight: '400',
  },
  mutualBadge: {
    alignSelf: 'flex-start',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mutualBadgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 5,
  },
  mutualText: {
    fontSize: 12,
    color: '#0A66C2',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginBottom: 16,
  },
  buttonContainer: {
    width: '100%',
  },
  cornerAccent: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 60,
    height: 60,
    backgroundColor: '#F8FBFF',
    borderBottomLeftRadius: 60,
  },
});

export default UserCard;
