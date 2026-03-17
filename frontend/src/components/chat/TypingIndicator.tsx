/**
 * TypingIndicator Component
 * Animated typing indicator with bouncing dots
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface TypingIndicatorProps {
    userName?: string;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ userName }) => {
    const { colors } = useTheme();

    const dot1 = useRef(new Animated.Value(0)).current;
    const dot2 = useRef(new Animated.Value(0)).current;
    const dot3 = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const createAnimation = (dot: Animated.Value, delay: number) => {
            return Animated.loop(
                Animated.sequence([
                    Animated.delay(delay),
                    Animated.timing(dot, {
                        toValue: -8,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                    Animated.timing(dot, {
                        toValue: 0,
                        duration: 400,
                        useNativeDriver: true,
                    }),
                ])
            );
        };

        const animation = Animated.parallel([
            createAnimation(dot1, 0),
            createAnimation(dot2, 150),
            createAnimation(dot3, 300),
        ]);

        animation.start();

        return () => animation.stop();
    }, []);

    return (
        <View style={styles.container}>
            <View style={[styles.bubble, { backgroundColor: colors.surface }]}>
                <View style={styles.dotsContainer}>
                    <Animated.View
                        style={[
                            styles.dot,
                            { backgroundColor: colors.textTertiary, transform: [{ translateY: dot1 }] },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            { backgroundColor: colors.textTertiary, transform: [{ translateY: dot2 }] },
                        ]}
                    />
                    <Animated.View
                        style={[
                            styles.dot,
                            { backgroundColor: colors.textTertiary, transform: [{ translateY: dot3 }] },
                        ]}
                    />
                </View>
            </View>
            {userName && (
                <Text style={[styles.text, { color: colors.textSecondary }]}>
                    {userName} is typing...
                </Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        gap: 8,
    },
    bubble: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    text: {
        fontSize: 13,
        fontStyle: 'italic',
    },
});

export default TypingIndicator;
