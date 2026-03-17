/**
 * NotificationBadge Component
 * Displays unread notification count with animation
 * Instagram/LinkedIn style badge indicator
 */

import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface NotificationBadgeProps {
    count: number;
    size?: 'small' | 'medium' | 'large';
    showZero?: boolean;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({
    count,
    size = 'medium',
    showZero = false
}) => {
    const { colors } = useTheme();

    // Don't render if count is 0 and showZero is false
    if (count === 0 && !showZero) {
        return null;
    }

    // Size configurations
    const sizeConfig = {
        small: { width: 16, height: 16, fontSize: 10 },
        medium: { width: 20, height: 20, fontSize: 11 },
        large: { width: 24, height: 24, fontSize: 12 },
    };

    const config = sizeConfig[size];

    // Format count (show 99+ for counts over 99)
    const displayCount = count > 99 ? '99+' : count.toString();

    return (
        <View
            style={[
                styles.badge,
                {
                    backgroundColor: '#ED4956', // Instagram red
                    width: config.width,
                    height: config.height,
                    minWidth: config.width,
                },
            ]}
            accessible={true}
            accessibilityLabel={`${count} unread notifications`}
            accessibilityRole="text"
        >
            <Text
                style={[
                    styles.badgeText,
                    {
                        fontSize: config.fontSize,
                        color: '#FFFFFF',
                    },
                ]}
            >
                {displayCount}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        fontWeight: '700',
        textAlign: 'center',
    },
});

export default NotificationBadge;
