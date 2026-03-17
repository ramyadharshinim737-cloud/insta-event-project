/**
 * CountdownTimer Component
 * Live countdown to event start
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { getTimeRemaining } from '../../utils/ticketUtils';

interface CountdownTimerProps {
    startDate: string;
    compact?: boolean;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({ startDate, compact = false }) => {
    const { colors } = useTheme();
    const [timeLeft, setTimeLeft] = useState(getTimeRemaining(startDate));

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(getTimeRemaining(startDate));
        }, 1000);

        return () => clearInterval(timer);
    }, [startDate]);

    if (timeLeft.total <= 0) {
        return (
            <View style={[styles.container, compact && styles.containerCompact]}>
                <Text style={[styles.label, { color: colors.primary }]}>Event Started</Text>
            </View>
        );
    }

    if (compact) {
        return (
            <View style={[styles.compactBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.compactText}>
                    {timeLeft.days > 0
                        ? `${timeLeft.days}d ${timeLeft.hours}h`
                        : `${timeLeft.hours}h ${timeLeft.minutes}m`}
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>Starts in</Text>
            <View style={styles.timerRow}>
                {timeLeft.days > 0 && (
                    <View style={[styles.timeBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={[styles.timeValue, { color: colors.text }]}>{timeLeft.days}</Text>
                        <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Days</Text>
                    </View>
                )}
                <View style={[styles.timeBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{timeLeft.hours}</Text>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Hours</Text>
                </View>
                <View style={[styles.timeBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{timeLeft.minutes}</Text>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Mins</Text>
                </View>
                <View style={[styles.timeBlock, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.timeValue, { color: colors.text }]}>{timeLeft.seconds}</Text>
                    <Text style={[styles.timeLabel, { color: colors.textSecondary }]}>Secs</Text>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    containerCompact: {
        paddingVertical: 0,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    timerRow: {
        flexDirection: 'row',
        gap: 12,
    },
    timeBlock: {
        minWidth: 70,
        paddingVertical: 12,
        paddingHorizontal: 8,
        borderRadius: 12,
        borderWidth: 1,
        alignItems: 'center',
    },
    timeValue: {
        fontSize: 28,
        fontWeight: '700',
        marginBottom: 4,
    },
    timeLabel: {
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    compactBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    compactText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '700',
    },
});

export default CountdownTimer;
