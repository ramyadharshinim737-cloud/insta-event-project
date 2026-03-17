/**
 * Reusable Layout Components
 * Standardized grid and layout system for consistent UI
 */

import React from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Responsive breakpoints
const BREAKPOINTS = {
    small: 320,
    medium: 768,
    large: 1024,
};

// Standard spacing scale
export const SPACING = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// Standard border radius
export const RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
};

// Grid system
interface GridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
    gap?: keyof typeof SPACING;
    style?: ViewStyle;
}

export const Grid: React.FC<GridProps> = ({ children, columns = 2, gap = 'md', style }) => {
    const gapValue = SPACING[gap];
    const columnWidth = `${(100 / columns) - (gapValue * (columns - 1)) / columns}%`;

    return (
        <View style={[styles.grid, { gap: gapValue }, style]}>
            {React.Children.map(children, (child) => (
                <View style={{ width: columnWidth }}>{child}</View>
            ))}
        </View>
    );
};

// Container with standard padding
interface ContainerProps {
    children: React.ReactNode;
    padding?: keyof typeof SPACING;
    style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({ children, padding = 'lg', style }) => {
    return (
        <View style={[styles.container, { padding: SPACING[padding] }, style]}>
            {children}
        </View>
    );
};

// Row layout
interface RowProps {
    children: React.ReactNode;
    gap?: keyof typeof SPACING;
    justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
    align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
    wrap?: boolean;
    style?: ViewStyle;
}

export const Row: React.FC<RowProps> = ({
    children,
    gap = 'md',
    justify = 'flex-start',
    align = 'center',
    wrap = false,
    style,
}) => {
    return (
        <View
            style={[
                styles.row,
                {
                    gap: SPACING[gap],
                    justifyContent: justify,
                    alignItems: align,
                    flexWrap: wrap ? 'wrap' : 'nowrap',
                },
                style,
            ]}
        >
            {children}
        </View>
    );
};

// Column layout
interface ColumnProps {
    children: React.ReactNode;
    gap?: keyof typeof SPACING;
    style?: ViewStyle;
}

export const Column: React.FC<ColumnProps> = ({ children, gap = 'md', style }) => {
    return (
        <View style={[styles.column, { gap: SPACING[gap] }, style]}>
            {children}
        </View>
    );
};

// Card component
interface CardProps {
    children: React.ReactNode;
    padding?: keyof typeof SPACING;
    radius?: keyof typeof RADIUS;
    elevated?: boolean;
    style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
    children,
    padding = 'lg',
    radius = 'lg',
    elevated = true,
    style,
}) => {
    return (
        <View
            style={[
                styles.card,
                {
                    padding: SPACING[padding],
                    borderRadius: RADIUS[radius],
                },
                elevated && styles.elevated,
                style,
            ]}
        >
            {children}
        </View>
    );
};

// Spacer component
interface SpacerProps {
    size?: keyof typeof SPACING;
    horizontal?: boolean;
}

export const Spacer: React.FC<SpacerProps> = ({ size = 'md', horizontal = false }) => {
    const spacerSize = SPACING[size];
    return (
        <View
            style={{
                width: horizontal ? spacerSize : undefined,
                height: !horizontal ? spacerSize : undefined,
            }}
        />
    );
};

// Divider component
interface DividerProps {
    color?: string;
    thickness?: number;
    spacing?: keyof typeof SPACING;
}

export const Divider: React.FC<DividerProps> = ({
    color = '#E5E7EB',
    thickness = 1,
    spacing = 'md',
}) => {
    return (
        <View
            style={{
                height: thickness,
                backgroundColor: color,
                marginVertical: SPACING[spacing],
            }}
        />
    );
};

// Responsive helper
export const isSmallScreen = () => SCREEN_WIDTH < BREAKPOINTS.medium;
export const isMediumScreen = () =>
    SCREEN_WIDTH >= BREAKPOINTS.medium && SCREEN_WIDTH < BREAKPOINTS.large;
export const isLargeScreen = () => SCREEN_WIDTH >= BREAKPOINTS.large;

export const getResponsiveValue = <T,>(small: T, medium: T, large: T): T => {
    if (isLargeScreen()) return large;
    if (isMediumScreen()) return medium;
    return small;
};

const styles = StyleSheet.create({
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    container: {
        width: '100%',
    },
    row: {
        flexDirection: 'row',
    },
    column: {
        flexDirection: 'column',
    },
    card: {
        backgroundColor: '#FFFFFF',
    },
    elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
});
