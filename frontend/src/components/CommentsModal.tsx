import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { postsApi, Comment as BackendComment } from '../services/posts.api';

interface CommentsModalProps {
  visible: boolean;
  onClose: () => void;
  postId: string;
  commentCount: number;
  onCommentAdded?: () => void;
}

const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  postId,
  commentCount,
  onCommentAdded,
}) => {
  const [comments, setComments] = useState<BackendComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchComments();
    }
  }, [visible, postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const result = await postsApi.getComments(postId);
      setComments(result);
      console.log('✅ Comments loaded:', result.length);
    } catch (error) {
      console.error('❌ Fetch comments error:', error);
      Alert.alert('Error', 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || posting) return;

    try {
      setPosting(true);
      const comment = await postsApi.addComment(postId, newComment.trim());
      setComments([comment, ...comments]);
      setNewComment('');
      onCommentAdded?.();
      console.log('✅ Comment added');
    } catch (error) {
      console.error('❌ Add comment error:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setPosting(false);
    }
  };

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const renderComment = ({ item }: { item: BackendComment }) => (
    <View style={styles.commentItem}>
      <View style={styles.commentAvatar}>
        <Ionicons name="person-circle" size={32} color="#666" />
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUser}>{item.user?.name || 'User'}</Text>
          <Text style={styles.commentTimestamp}>{formatTimestamp(item.createdAt)}</Text>
        </View>
        <Text style={styles.commentText}>{item.text}</Text>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            Comments ({comments.length})
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color="#262626" />
          </TouchableOpacity>
        </View>

        {/* Loading State */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0A66C2" />
            <Text style={styles.loadingText}>Loading comments...</Text>
          </View>
        ) : (
          <>
            {/* Comments List */}
            <FlatList
              data={comments}
              renderItem={renderComment}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.commentsList}
              showsVerticalScrollIndicator={false}
              ListEmptyComponent={
                <View style={styles.emptyState}>
                  <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                  <Text style={styles.emptyText}>No comments yet</Text>
                  <Text style={styles.emptySubtext}>Be the first to comment</Text>
                </View>
              }
            />
          </>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputAvatar}>
            <Ionicons name="person-circle" size={32} color="#666" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            maxLength={500}
            editable={!posting}
          />
          <TouchableOpacity
            onPress={handleAddComment}
            disabled={!newComment.trim() || posting}
            style={styles.sendButton}
          >
            {posting ? (
              <ActivityIndicator size="small" color="#0A66C2" />
            ) : (
              <Ionicons
                name="send"
                size={24}
                color={newComment.trim() ? '#0A66C2' : '#ccc'}
              />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#efefef',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#262626',
  },
  closeButton: {
    padding: 4,
  },
  commentsList: {
    paddingVertical: 8,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginRight: 8,
  },
  commentTimestamp: {
    fontSize: 12,
    color: '#8e8e8e',
  },
  commentText: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 20,
    marginBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#8e8e8e',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#8e8e8e',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#efefef',
    backgroundColor: '#fff',
  },
  inputAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#262626',
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    padding: 8,
    marginLeft: 8,
  },
});

export default CommentsModal;
