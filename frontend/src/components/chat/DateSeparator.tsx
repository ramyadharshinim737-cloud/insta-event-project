/**
 * DateSeparator Component
 * Shows date dividers between messages
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

interface DateSeparatorProps {
    label: string;
}

const DateSeparator: React.FC<DateSeparatorProps> = ({ label }) => {
    const { colors } = useTheme();

    return (
        <View style={styles.container}>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
            <Text style={[styles.label, { color: colors.textSecondary }]}>
                {label}
            </Text>
            <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
        paddingHorizontal: 16,
    },
    line: {
        flex: 1,
        height: 1,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        marginHorizontal: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
});

export default DateSeparator;
