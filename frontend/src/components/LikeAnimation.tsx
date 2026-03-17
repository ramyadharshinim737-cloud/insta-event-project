import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LikeAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

const LikeAnimation: React.FC<LikeAnimationProps> = ({ show, onComplete }) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (show) {
      // Reset animations
      scaleAnim.setValue(0);
      opacityAnim.setValue(1);

      // Start animation sequence
      Animated.sequence([
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.spring(scaleAnim, {
            toValue: 1.2,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 400,
            delay: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        onComplete?.();
      });
    }
  }, [show]);

  if (!show) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
        },
      ]}
      pointerEvents="none"
    >
      <Ionicons name="heart" size={100} color="#ed4956" />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -50,
    marginTop: -50,
    zIndex: 1000,
  },
});

export default LikeAnimation;
