import { Platform } from 'react-native';

const shadows = {
    // Small shadow for subtle elevation
    sm: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
        },
        android: {
            elevation: 2,
        },
    }),

    // Medium shadow for cards and buttons
    md: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
        },
        android: {
            elevation: 4,
        },
    }),

    // Large shadow for modals and floating elements
    lg: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
        },
        android: {
            elevation: 8,
        },
    }),

    // Extra large shadow for important elements
    xl: Platform.select({
        ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.25,
            shadowRadius: 16,
        },
        android: {
            elevation: 12,
        },
    }),

    // Glow effect for special elements
    glow: Platform.select({
        ios: {
            shadowColor: '#0A66C2',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
        },
        android: {
            elevation: 6,
        },
    }),
};

export default shadows;
