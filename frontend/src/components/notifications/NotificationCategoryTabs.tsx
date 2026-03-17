/**
 * NotificationCategoryTabs Component
 * Horizontal scrollable category filter tabs
 */

import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import {
    NotificationCategory,
    notificationCategories,
} from '../../types/notificationSettings.types';
import { Notification } from '../../types/notification.types';

interface NotificationCategoryTabsProps {
    selectedCategory: NotificationCategory;
    onCategoryChange: (category: NotificationCategory) => void;
    notifications: Notification[];
}

const NotificationCategoryTabs: React.FC<NotificationCategoryTabsProps> = ({
    selectedCategory,
    onCategoryChange,
    notifications,
}) => {
    const { colors } = useTheme();

    // Count notifications per category
    const getCategoryCount = (category: NotificationCategory): number => {
        if (category === 'all') {
            return notifications.filter(n => !n.read).length;
        }

        const categoryDef = notificationCategories.find(c => c.id === category);
        if (!categoryDef) return 0;

        return notifications.filter(
            n => !n.read && categoryDef.types.includes(n.type)
        ).length;
    };

    return (
        <View style={[styles.container, { borderBottomColor: colors.border }]}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {notificationCategories.map((category) => {
                    const isSelected = selectedCategory === category.id;
                    const count = getCategoryCount(category.id);

                    return (
                        <TouchableOpacity
                            key={category.id}
                            style={[
                                styles.tab,
                                isSelected && [
                                    styles.tabActive,
                                    { backgroundColor: colors.primary },
                                ],
                            ]}
                            onPress={() => onCategoryChange(category.id)}
                            activeOpacity={0.7}
                            accessible={true}
                            accessibilityLabel={`${category.label} notifications`}
                            accessibilityRole="button"
                            accessibilityState={{ selected: isSelected }}
                        >
                            <Ionicons
                                name={category.icon as any}
                                size={18}
                                color={isSelected ? '#FFFFFF' : colors.textSecondary}
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    { color: colors.textSecondary },
                                    isSelected && styles.tabTextActive,
                                ]}
                            >
                                {category.label}
                            </Text>
                            {count > 0 && (
                                <View
                                    style={[
                                        styles.badge,
                                        isSelected
                                            ? { backgroundColor: 'rgba(255, 255, 255, 0.3)' }
                                            : { backgroundColor: colors.primary },
                                    ]}
                                >
                                    <Text style={styles.badgeText}>
                                        {count > 99 ? '99+' : count}
                                    </Text>
                                </View>
                            )}
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: 1,
        backgroundColor: '#FFFFFF',
    },
    scrollContent: {
        paddingHorizontal: 12,
        paddingVertical: 12,
        gap: 8,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F3F4F6',
        gap: 6,
    },
    tabActive: {
        backgroundColor: '#0A66C2',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    tabTextActive: {
        color: '#FFFFFF',
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        minWidth: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
        color: '#FFFFFF',
    },
});

export default NotificationCategoryTabs;
