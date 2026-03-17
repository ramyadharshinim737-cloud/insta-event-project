/**
 * MessageReactions Component
 * Display and interact with message reactions
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MessageReaction, QUICK_REACTIONS } from '../../types/chat.types';
import { getReactionCount, hasUserReacted } from '../../utils/chatUtils';

interface MessageReactionsProps {
    reactions: MessageReaction[];
    currentUserId: string;
    onReactionPress: (emoji: string) => void;
    showAddButton?: boolean;
}

const MessageReactions: React.FC<MessageReactionsProps> = ({
    reactions,
    currentUserId,
    onReactionPress,
    showAddButton = false,
}) => {
    const { colors } = useTheme();

    if (reactions.length === 0 && !showAddButton) return null;

    // Group reactions by emoji
    const groupedReactions = QUICK_REACTIONS.map(emoji => ({
        emoji,
        count: getReactionCount(reactions, emoji),
        hasReacted: hasUserReacted(reactions, emoji, currentUserId),
    })).filter(r => r.count > 0);

    return (
        <View style={styles.container}>
            {groupedReactions.map(({ emoji, count, hasReacted }) => (
                <TouchableOpacity
                    key={emoji}
                    style={[
                        styles.reactionBubble,
                        {
                            backgroundColor: hasReacted
                                ? colors.primary + '20'
                                : colors.surface,
                            borderColor: hasReacted ? colors.primary : colors.border,
                        },
                    ]}
                    onPress={() => onReactionPress(emoji)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.emoji}>{emoji}</Text>
                    {count > 1 && (
                        <Text
                            style={[
                                styles.count,
                                { color: hasReacted ? colors.primary : colors.textSecondary },
                            ]}
                        >
                            {count}
                        </Text>
                    )}
                </TouchableOpacity>
            ))}

            {showAddButton && (
                <TouchableOpacity
                    style={[
                        styles.addButton,
                        { backgroundColor: colors.surface, borderColor: colors.border },
                    ]}
                    activeOpacity={0.7}
                >
                    <Text style={styles.addIcon}>+</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },
    reactionBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        gap: 4,
    },
    emoji: {
        fontSize: 14,
    },
    count: {
        fontSize: 12,
        fontWeight: '600',
    },
    addButton: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addIcon: {
        fontSize: 16,
        fontWeight: '600',
        color: '#8E8E8E',
    },
});

export default MessageReactions;
