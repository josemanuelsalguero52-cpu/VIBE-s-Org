/**
 * VIBE Social Network Types
 */

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  display_name: string;
  avatar_url: string;
  bio: string;
  created_at: string;
  /**
   * Internal XION ID (Format: LL99-LL99, e.g., XD78-GT99)
   * Strictly for internal database traceability/moderation.
   * NEVER displayed in the user interface.
   */
  id_xion: string;
  followers_count?: number;
  following_count?: number;
  is_following?: boolean;
}

export interface Post {
  id: string;
  author_id: string;
  author: UserProfile;
  content: string; // Max 280 chars
  created_at: string;
  likes_count: number;
  is_liked?: boolean;
  comments_count?: number;
  /**
   * Internal XION ID (Format: LL99-LL99)
   * NEVER displayed in the user interface.
   */
  id_xion: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  parent_id?: string | null;
  author_id: string;
  author: UserProfile;
  content: string;
  created_at: string;
  likes_count?: number;
  is_liked?: boolean;
  id_xion: string;
  replies?: PostComment[];
}

export interface ChatConversation {
  id: string;
  participant1: UserProfile;
  participant2: UserProfile;
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  /**
   * Internal XION ID (Format: LL99-LL99)
   * NEVER displayed in the user interface.
   */
  id_xion: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  /**
   * Internal XION ID (Format: LL99-LL99)
   * NEVER displayed in the user interface.
   */
  id_xion: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  type: 'like' | 'mention' | 'message' | 'comment' | 'reply' | 'follow' | 'system';
  actor: UserProfile;
  post_id?: string;
  comment_id?: string;
  message?: string;
  created_at: string;
  is_read: boolean;
  /**
   * Internal XION ID (Format: LL99-LL99)
   * NEVER displayed in the user interface.
   */
  id_xion: string;
}

export type IslandId = 
  | 'feed' 
  | 'create_post' 
  | 'chats' 
  | 'profile' 
  | 'discover' 
  | 'notifications' 
  | 'supabase_config';

export interface IslandMeta {
  id: IslandId;
  title: string;
  subtitle: string;
  icon: string;
  accentColor: string;
  badgeCount?: number;
  featuredSize?: 'sm' | 'md' | 'lg';
}
