/**
 * Format timestamp to relative time (e.g., "2h ago", "5m ago", "just now")
 */
export const formatRelativeTime = (timestamp: string): string => {
  const now = new Date().getTime();
  const time = new Date(timestamp).getTime();
  
  if (isNaN(time)) {
    return timestamp; // Return as-is if not a valid date
  }
  
  const diffMs = now - time;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSeconds < 60) {
    return 'just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else if (diffDays === 1) {
    return 'yesterday';
  } else if (diffDays < 7) {
    return `${diffDays}d ago`;
  } else {
    return `${Math.floor(diffDays / 7)}w ago`;
  }
};
