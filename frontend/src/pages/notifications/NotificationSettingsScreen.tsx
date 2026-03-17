/**
 * NotificationSettingsScreen Component
 * Comprehensive notification preferences and settings
 * Instagram/LinkedIn style settings page
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Switch,
    Platform,
    StatusBar,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import {
    NotificationPreferences,
    defaultNotificationPreferences,
} from '../../types/notificationSettings.types';

interface Props {
    navigation?: any;
}

const NotificationSettingsScreen: React.FC<Props> = ({ navigation }) => {
    const { colors } = useTheme();
    const [preferences, setPreferences] = useState<NotificationPreferences>(
        defaultNotificationPreferences
    );

    const updatePreference = <K extends keyof NotificationPreferences>(
        key: K,
        value: NotificationPreferences[K]
    ) => {
        setPreferences((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        // TODO: Save to AsyncStorage or backend
        Alert.alert('Settings Saved', 'Your notification preferences have been updated');
    };

    const handleReset = () => {
        Alert.alert(
            'Reset Settings',
            'Are you sure you want to reset all notification settings to default?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset',
                    style: 'destructive',
                    onPress: () => setPreferences(defaultNotificationPreferences),
                },
            ]
        );
    };

    return (
        <SafeAreaView
            style={[styles.container, { backgroundColor: colors.background }]}
            edges={['left', 'right', 'bottom']}
        >
            <StatusBar
                barStyle="light-content"
                backgroundColor="#0A66C2"
                translucent={false}
            />

            {/* Header */}
            <LinearGradient
                colors={['#0A66C2', '#378FE9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.headerGradient}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={() => navigation?.goBack?.()}
                        style={styles.backButton}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Notification Settings</Text>
                    <TouchableOpacity
                        onPress={handleSave}
                        style={styles.saveButton}
                        activeOpacity={0.7}
                    >
                        <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Push Notifications */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Push Notifications
                    </Text>
                    <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="notifications" size={24} color={colors.primary} />
                                <View style={styles.settingText}>
                                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                                        Enable Push Notifications
                                    </Text>
                                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                        Receive notifications on this device
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={preferences.pushEnabled}
                                onValueChange={(value) => updatePreference('pushEnabled', value)}
                                trackColor={{ false: '#D1D5DB', true: '#0A66C2' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>

                {/* Notification Categories */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Notification Types
                    </Text>
                    <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                        {/* Likes */}
                        <SettingToggle
                            icon="heart"
                            iconColor="#ED4956"
                            label="Likes"
                            description="When someone likes your post"
                            value={preferences.likes}
                            onValueChange={(value) => updatePreference('likes', value)}
                            colors={colors}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Comments */}
                        <SettingToggle
                            icon="chatbubble"
                            iconColor="#0095f6"
                            label="Comments"
                            description="When someone comments on your post"
                            value={preferences.comments}
                            onValueChange={(value) => updatePreference('comments', value)}
                            colors={colors}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Follows */}
                        <SettingToggle
                            icon="person-add"
                            iconColor="#0A66C2"
                            label="Follows"
                            description="When someone follows you"
                            value={preferences.follows}
                            onValueChange={(value) => updatePreference('follows', value)}
                            colors={colors}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Mentions */}
                        <SettingToggle
                            icon="at"
                            iconColor="#8E44AD"
                            label="Mentions"
                            description="When someone mentions you"
                            value={preferences.mentions}
                            onValueChange={(value) => updatePreference('mentions', value)}
                            colors={colors}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Events */}
                        <SettingToggle
                            icon="calendar"
                            iconColor="#27AE60"
                            label="Events"
                            description="Event invitations and reminders"
                            value={preferences.events}
                            onValueChange={(value) => updatePreference('events', value)}
                            colors={colors}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Connections */}
                        <SettingToggle
                            icon="people"
                            iconColor="#0A66C2"
                            label="Connections"
                            description="Connection requests and updates"
                            value={preferences.connections}
                            onValueChange={(value) => updatePreference('connections', value)}
                            colors={colors}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Messages */}
                        <SettingToggle
                            icon="mail"
                            iconColor="#3498DB"
                            label="Messages"
                            description="Direct messages and chats"
                            value={preferences.messages}
                            onValueChange={(value) => updatePreference('messages', value)}
                            colors={colors}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* RSVP */}
                        <SettingToggle
                            icon="checkmark-circle"
                            iconColor="#27AE60"
                            label="RSVP"
                            description="Event RSVP confirmations"
                            value={preferences.rsvp}
                            onValueChange={(value) => updatePreference('rsvp', value)}
                            colors={colors}
                        />
                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        {/* Community */}
                        <SettingToggle
                            icon="people-circle"
                            iconColor="#E67E22"
                            label="Community"
                            description="Community posts and updates"
                            value={preferences.community}
                            onValueChange={(value) => updatePreference('community', value)}
                            colors={colors}
                            isLast
                        />
                    </View>
                </View>

                {/* Email Notifications */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Email Notifications
                    </Text>
                    <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="mail-outline" size={24} color={colors.primary} />
                                <View style={styles.settingText}>
                                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                                        Email Notifications
                                    </Text>
                                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                        Receive notifications via email
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={preferences.emailEnabled}
                                onValueChange={(value) => updatePreference('emailEnabled', value)}
                                trackColor={{ false: '#D1D5DB', true: '#0A66C2' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        {preferences.emailEnabled && (
                            <>
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Ionicons name="time-outline" size={24} color={colors.textSecondary} />
                                        <View style={styles.settingText}>
                                            <Text style={[styles.settingLabel, { color: colors.text }]}>
                                                Email Digest
                                            </Text>
                                            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                                {preferences.emailDigest === 'instant' && 'Instant notifications'}
                                                {preferences.emailDigest === 'daily' && 'Daily summary'}
                                                {preferences.emailDigest === 'weekly' && 'Weekly summary'}
                                                {preferences.emailDigest === 'never' && 'Never send emails'}
                                            </Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Quiet Hours */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Quiet Hours
                    </Text>
                    <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="moon" size={24} color={colors.primary} />
                                <View style={styles.settingText}>
                                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                                        Do Not Disturb
                                    </Text>
                                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                        Mute notifications during specific hours
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={preferences.quietHoursEnabled}
                                onValueChange={(value) => updatePreference('quietHoursEnabled', value)}
                                trackColor={{ false: '#D1D5DB', true: '#0A66C2' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        {preferences.quietHoursEnabled && (
                            <>
                                <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                <View style={styles.settingRow}>
                                    <View style={styles.settingInfo}>
                                        <Ionicons name="time" size={24} color={colors.textSecondary} />
                                        <View style={styles.settingText}>
                                            <Text style={[styles.settingLabel, { color: colors.text }]}>
                                                Quiet Hours
                                            </Text>
                                            <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                                {preferences.quietHoursStart} - {preferences.quietHoursEnd}
                                            </Text>
                                        </View>
                                    </View>
                                    <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* Sound & Vibration */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Sound & Vibration
                    </Text>
                    <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="volume-high" size={24} color={colors.primary} />
                                <View style={styles.settingText}>
                                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                                        Notification Sound
                                    </Text>
                                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                        Play sound for notifications
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={preferences.soundEnabled}
                                onValueChange={(value) => updatePreference('soundEnabled', value)}
                                trackColor={{ false: '#D1D5DB', true: '#0A66C2' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>

                        <View style={[styles.divider, { backgroundColor: colors.border }]} />

                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="phone-portrait" size={24} color={colors.primary} />
                                <View style={styles.settingText}>
                                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                                        Vibration
                                    </Text>
                                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                        Vibrate for notifications
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={preferences.vibrationEnabled}
                                onValueChange={(value) => updatePreference('vibrationEnabled', value)}
                                trackColor={{ false: '#D1D5DB', true: '#0A66C2' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>

                {/* Privacy */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>
                        Privacy
                    </Text>
                    <View style={[styles.settingCard, { backgroundColor: colors.surface }]}>
                        <View style={styles.settingRow}>
                            <View style={styles.settingInfo}>
                                <Ionicons name="eye-off" size={24} color={colors.primary} />
                                <View style={styles.settingText}>
                                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                                        Show Previews
                                    </Text>
                                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                                        Show notification content in previews
                                    </Text>
                                </View>
                            </View>
                            <Switch
                                value={preferences.showPreviews}
                                onValueChange={(value) => updatePreference('showPreviews', value)}
                                trackColor={{ false: '#D1D5DB', true: '#0A66C2' }}
                                thumbColor="#FFFFFF"
                            />
                        </View>
                    </View>
                </View>

                {/* Reset Button */}
                <TouchableOpacity
                    style={[styles.resetButton, { borderColor: colors.border }]}
                    onPress={handleReset}
                    activeOpacity={0.7}
                >
                    <Ionicons name="refresh" size={20} color="#DC2626" />
                    <Text style={styles.resetButtonText}>Reset to Default</Text>
                </TouchableOpacity>

                <View style={styles.bottomSpacing} />
            </ScrollView>
        </SafeAreaView>
    );
};

// Helper component for setting toggles
interface SettingToggleProps {
    icon: string;
    iconColor: string;
    label: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    colors: any;
    isLast?: boolean;
}

const SettingToggle: React.FC<SettingToggleProps> = ({
    icon,
    iconColor,
    label,
    description,
    value,
    onValueChange,
    colors,
    isLast = false,
}) => {
    return (
        <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
                <Ionicons name={icon as any} size={24} color={iconColor} />
                <View style={styles.settingText}>
                    <Text style={[styles.settingLabel, { color: colors.text }]}>
                        {label}
                    </Text>
                    <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>
                        {description}
                    </Text>
                </View>
            </View>
            <Switch
                value={value}
                onValueChange={onValueChange}
                trackColor={{ false: '#D1D5DB', true: '#0A66C2' }}
                thumbColor="#FFFFFF"
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerGradient: {
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
        ...Platform.select({
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
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginHorizontal: 16,
    },
    saveButton: {
        paddingHorizontal: 12,
        paddingVertical: 6,
    },
    saveButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingTop: 16,
    },
    section: {
        marginBottom: 24,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 12,
        letterSpacing: 0.3,
    },
    settingCard: {
        borderRadius: 12,
        overflow: 'hidden',
    },
    settingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    settingInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    settingText: {
        flex: 1,
    },
    settingLabel: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 2,
    },
    settingDescription: {
        fontSize: 13,
        lineHeight: 18,
    },
    divider: {
        height: 1,
        marginLeft: 52,
    },
    resetButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginHorizontal: 16,
        marginTop: 8,
        paddingVertical: 14,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#DC2626',
    },
    resetButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#DC2626',
    },
    bottomSpacing: {
        height: 32,
    },
});

export default NotificationSettingsScreen;
