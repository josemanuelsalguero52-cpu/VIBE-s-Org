/**
 * Supabase Service Integration for VIBE Social Network
 * Supports live Supabase backend and intelligent fallback/demo engine.
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { UserProfile, Post, ChatMessage, ChatConversation, NotificationItem, PostComment } from '../types';
import { generateIDXion } from './xion';

// Environment variables or local storage overrides
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

let customUrl = localStorage.getItem('vibe_supabase_url') || '';
let customKey = localStorage.getItem('vibe_supabase_key') || '';

export const supabaseUrl = customUrl || envUrl;
export const supabaseKey = customKey || envKey;

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseKey && 
  supabaseUrl !== 'https://your-project.supabase.co'
);

export let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.warn('Failed to initialize Supabase client:', err);
  }
}

// ==========================================
// SEED DATA FOR DEMO / LOCAL STORAGE ENGINE
// ==========================================

const SEED_USERS: UserProfile[] = [];

const SEED_POSTS: Post[] = [];

const SEED_MESSAGES: ChatMessage[] = [];

const SEED_COMMENTS: PostComment[] = [];

// Local state helpers with persistence
const DEFAULT_USER: UserProfile = {
  id: 'usr_me',
  email: 'usuario@vibe.app',
  username: 'mi_usuario',
  display_name: 'Mi Usuario',
  avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=vibe_me',
  bio: '¡Hola! Estoy explorando VIBE.',
  created_at: new Date().toISOString(),
  id_xion: generateIDXion(),
  followers_count: 0,
  following_count: 0,
};

function getLocalUsers(): UserProfile[] {
  const stored = localStorage.getItem('vibe_demo_users');
  let users: UserProfile[] = [];
  if (stored) {
    try {
      const parsed: UserProfile[] = JSON.parse(stored);
      users = parsed.filter(u => !['usr_1', 'usr_2', 'usr_3', 'usr_4'].includes(u.id));
    } catch {
      users = [];
    }
  }

  if (users.length === 0) {
    users = [DEFAULT_USER];
    saveLocalUsers(users);
  }

  return users;
}

function saveLocalUsers(users: UserProfile[]) {
  localStorage.setItem('vibe_demo_users', JSON.stringify(users));
}

function getLocalComments(): PostComment[] {
  const stored = localStorage.getItem('vibe_demo_comments');
  if (!stored) {
    localStorage.setItem('vibe_demo_comments', JSON.stringify([]));
    return [];
  }
  const parsed: PostComment[] = JSON.parse(stored);
  const cleaned = parsed.filter(c => !['cmt_1', 'cmt_2', 'cmt_3'].includes(c.id));
  if (cleaned.length !== parsed.length) {
    saveLocalComments(cleaned);
  }
  return cleaned;
}

function saveLocalComments(comments: PostComment[]) {
  localStorage.setItem('vibe_demo_comments', JSON.stringify(comments));
}

function getLocalPosts(): Post[] {
  const stored = localStorage.getItem('vibe_demo_posts');
  if (!stored) {
    localStorage.setItem('vibe_demo_posts', JSON.stringify([]));
    return [];
  }
  const parsed: Post[] = JSON.parse(stored);
  const cleaned = parsed.filter(p => !['pst_1', 'pst_2', 'pst_3'].includes(p.id));
  if (cleaned.length !== parsed.length) {
    saveLocalPosts(cleaned);
  }
  return cleaned;
}

function saveLocalPosts(posts: Post[]) {
  localStorage.setItem('vibe_demo_posts', JSON.stringify(posts));
}

function getLocalMessages(): ChatMessage[] {
  const stored = localStorage.getItem('vibe_demo_messages');
  if (!stored) {
    localStorage.setItem('vibe_demo_messages', JSON.stringify([]));
    return [];
  }
  const parsed: ChatMessage[] = JSON.parse(stored);
  const cleaned = parsed.filter(m => !['msg_1', 'msg_2'].includes(m.id));
  if (cleaned.length !== parsed.length) {
    saveLocalMessages(cleaned);
  }
  return cleaned;
}

function saveLocalMessages(messages: ChatMessage[]) {
  localStorage.setItem('vibe_demo_messages', JSON.stringify(messages));
}

export function getActiveUser(): UserProfile {
  const users = getLocalUsers();
  const activeId = localStorage.getItem('vibe_active_user_id');
  const found = users.find(u => u.id === activeId);
  return found || users[0] || DEFAULT_USER;
}

export function setActiveUser(userId: string): UserProfile {
  localStorage.setItem('vibe_active_user_id', userId);
  const users = getLocalUsers();
  const found = users.find(u => u.id === userId) || users[0] || DEFAULT_USER;
  window.dispatchEvent(new CustomEvent('vibe_auth_changed', { detail: found }));
  return found;
}

// Event emitter for real-time local sync
type Listener = (data: any) => void;
const eventListeners: Record<string, Listener[]> = {};

export function subscribeToLocalChannel(channel: string, callback: Listener) {
  if (!eventListeners[channel]) {
    eventListeners[channel] = [];
  }
  eventListeners[channel].push(callback);
  return () => {
    eventListeners[channel] = eventListeners[channel].filter(cb => cb !== callback);
  };
}

export function broadcastLocalEvent(channel: string, data: any) {
  if (eventListeners[channel]) {
    eventListeners[channel].forEach(cb => cb(data));
  }
}

// ==========================================
// UNIFIED AUTH & DATA ENGINE
// ==========================================

export async function apiSignUp(email: string, password: string, username: string, displayName: string): Promise<{ user: UserProfile; error?: string }> {
  const cleanUsername = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!cleanUsername) return { user: null as any, error: 'El nombre de usuario no es válido' };

  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: cleanUsername,
            display_name: displayName,
          }
        }
      });
      if (error) return { user: null as any, error: error.message };

      if (data.user) {
        const id_xion = generateIDXion();
        const profileData: Partial<UserProfile> = {
          id: data.user.id,
          email: email,
          username: cleanUsername,
          display_name: displayName || cleanUsername,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
          bio: '¡Hola! Soy nuevo en VIBE.',
          id_xion,
        };

        // Insert into profiles table
        await supabase.from('profiles').upsert([profileData]);
        
        const fullProfile = profileData as UserProfile;
        setActiveUser(fullProfile.id);
        return { user: fullProfile };
      }
    } catch (err: any) {
      console.warn('Supabase auth failed, using local engine:', err);
    }
  }

  // Fallback to local demo engine
  const users = getLocalUsers();
  if (users.some(u => u.username === cleanUsername)) {
    return { user: null as any, error: 'Este nombre de usuario ya está en uso' };
  }

  const newUser: UserProfile = {
    id: `usr_${Date.now()}`,
    email,
    username: cleanUsername,
    display_name: displayName || cleanUsername,
    avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
    bio: '¡Hola! Soy nuevo en VIBE.',
    created_at: new Date().toISOString(),
    id_xion: generateIDXion(),
    followers_count: 0,
    following_count: 0,
  };

  users.push(newUser);
  saveLocalUsers(users);
  setActiveUser(newUser.id);
  return { user: newUser };
}

export async function apiSignIn(email: string, password: string): Promise<{ user: UserProfile; error?: string }> {
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { user: null as any, error: error.message };
      if (data.user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', data.user.id).single();
        if (prof) {
          setActiveUser(prof.id);
          return { user: prof as UserProfile };
        }
      }
    } catch (err: any) {
      console.warn('Supabase signin failed, using local engine:', err);
    }
  }

  // Local fallback search by email or username
  const users = getLocalUsers();
  const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === email.toLowerCase());
  if (found) {
    setActiveUser(found.id);
    return { user: found };
  }
  return { user: null as any, error: 'Usuario o contraseña incorrectos en el sistema demo.' };
}

export async function apiGetPosts(): Promise<Post[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          likes_count,
          id_xion,
          author_id,
          profiles:author_id (*)
        `)
        .order('created_at', { ascending: false });

      if (!error && data) {
        return data.map(item => ({
          id: item.id,
          author_id: item.author_id,
          author: (Array.isArray(item.profiles) ? item.profiles[0] : item.profiles) as unknown as UserProfile,
          content: item.content,
          created_at: item.created_at,
          likes_count: item.likes_count || 0,
          id_xion: item.id_xion || generateIDXion(),
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch posts failed, falling back to local:', err);
    }
  }

  return getLocalPosts().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function apiCreatePost(content: string): Promise<Post> {
  const activeUser = getActiveUser();
  const trimmed = content.trim().slice(0, 280);
  const id_xion = generateIDXion();

  // Parse @mentions
  const mentions = trimmed.match(/@([a-zA-Z0-9_]+)/g) || [];
  const allUsers = getLocalUsers();

  mentions.forEach(m => {
    const username = m.substring(1).toLowerCase();
    const mentionedUser = allUsers.find(u => u.username.toLowerCase() === username);
    if (mentionedUser && mentionedUser.id !== activeUser.id) {
      broadcastLocalEvent('global_mention', {
        text: trimmed,
        author: activeUser,
        targetUsername: username,
      });
    }
  });

  if (supabase) {
    try {
      const { data, error } = await supabase.from('posts').insert([
        {
          author_id: activeUser.id,
          content: trimmed,
          id_xion,
          likes_count: 0
        }
      ]).select().single();

      if (!error && data) {
        const newPost: Post = {
          id: data.id,
          author_id: activeUser.id,
          author: activeUser,
          content: data.content,
          created_at: data.created_at,
          likes_count: 0,
          id_xion: data.id_xion || id_xion,
        };
        broadcastLocalEvent('new_post', newPost);
        return newPost;
      }
    } catch (err) {
      console.warn('Supabase post failed, using local engine:', err);
    }
  }

  const newPost: Post = {
    id: `pst_${Date.now()}`,
    author_id: activeUser.id,
    author: activeUser,
    content: trimmed,
    created_at: new Date().toISOString(),
    likes_count: 0,
    is_liked: false,
    comments_count: 0,
    id_xion,
  };

  const posts = getLocalPosts();
  posts.unshift(newPost);
  saveLocalPosts(posts);

  broadcastLocalEvent('new_post', newPost);
  return newPost;
}

export async function apiToggleLikePost(postId: string): Promise<Post> {
  const posts = getLocalPosts();
  const post = posts.find(p => p.id === postId);
  if (!post) throw new Error('Post not found');

  post.is_liked = !post.is_liked;
  post.likes_count += post.is_liked ? 1 : -1;
  saveLocalPosts(posts);

  if (supabase) {
    try {
      await supabase.from('posts').update({ likes_count: post.likes_count }).eq('id', postId);
    } catch (e) {
      // ignore
    }
  }

  broadcastLocalEvent(`post_liked_${postId}`, post);
  return post;
}

// ==========================================
// COMMENTS & NESTED REPLIES ENGINE
// ==========================================

export async function apiGetComments(postId: string): Promise<PostComment[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          parent_id,
          content,
          created_at,
          likes_count,
          id_xion,
          author_id,
          profiles:author_id (*)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data.map(item => ({
          id: item.id,
          post_id: item.post_id,
          parent_id: item.parent_id || null,
          author_id: item.author_id,
          author: (Array.isArray(item.profiles) ? item.profiles[0] : item.profiles) as unknown as UserProfile,
          content: item.content,
          created_at: item.created_at,
          likes_count: item.likes_count || 0,
          id_xion: item.id_xion || generateIDXion(),
        }));
      }
    } catch (err) {
      console.warn('Supabase fetch comments failed, falling back to local:', err);
    }
  }

  const comments = getLocalComments();
  return comments.filter(c => c.post_id === postId);
}

export async function apiCreateComment(
  postId: string, 
  content: string, 
  parentId?: string | null
): Promise<PostComment> {
  const activeUser = getActiveUser();
  const trimmed = content.trim();
  const id_xion = generateIDXion();

  // Extract @mentions
  const mentions = trimmed.match(/@([a-zA-Z0-9_]+)/g) || [];
  const allUsers = getLocalUsers();

  mentions.forEach(m => {
    const username = m.substring(1).toLowerCase();
    const mentionedUser = allUsers.find(u => u.username.toLowerCase() === username);
    if (mentionedUser && mentionedUser.id !== activeUser.id) {
      broadcastLocalEvent('global_mention', {
        text: trimmed,
        author: activeUser,
        targetUsername: username,
        postId,
      });
    }
  });

  if (supabase) {
    try {
      const { data, error } = await supabase.from('comments').insert([
        {
          post_id: postId,
          parent_id: parentId || null,
          author_id: activeUser.id,
          content: trimmed,
          id_xion,
          likes_count: 0
        }
      ]).select().single();

      if (!error && data) {
        const newComment: PostComment = {
          id: data.id,
          post_id: data.post_id,
          parent_id: data.parent_id,
          author_id: activeUser.id,
          author: activeUser,
          content: data.content,
          created_at: data.created_at,
          likes_count: 0,
          id_xion: data.id_xion || id_xion,
        };
        broadcastLocalEvent(`post_comments_${postId}`, newComment);
        return newComment;
      }
    } catch (err) {
      console.warn('Supabase comment insert failed, using local engine:', err);
    }
  }

  const newComment: PostComment = {
    id: `cmt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    post_id: postId,
    parent_id: parentId || null,
    author_id: activeUser.id,
    author: activeUser,
    content: trimmed,
    created_at: new Date().toISOString(),
    likes_count: 0,
    is_liked: false,
    id_xion,
  };

  const comments = getLocalComments();
  comments.push(newComment);
  saveLocalComments(comments);

  // Update local post comment count
  const posts = getLocalPosts();
  const post = posts.find(p => p.id === postId);
  if (post) {
    post.comments_count = (post.comments_count || 0) + 1;
    saveLocalPosts(posts);
  }

  broadcastLocalEvent(`post_comments_${postId}`, newComment);
  return newComment;
}

export async function apiToggleLikeComment(commentId: string): Promise<PostComment> {
  const comments = getLocalComments();
  const comment = comments.find(c => c.id === commentId);
  if (!comment) throw new Error('Comment not found');

  comment.is_liked = !comment.is_liked;
  comment.likes_count = (comment.likes_count || 0) + (comment.is_liked ? 1 : -1);
  saveLocalComments(comments);

  if (supabase) {
    try {
      await supabase.from('comments').update({ likes_count: comment.likes_count }).eq('id', commentId);
    } catch (e) {
      // ignore
    }
  }

  broadcastLocalEvent(`comment_liked_${commentId}`, comment);
  return comment;
}

export async function apiGetUsers(): Promise<UserProfile[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data && data.length > 0) {
        return data as UserProfile[];
      }
    } catch (e) {
      // ignore
    }
  }
  return getLocalUsers();
}

export async function apiUpdateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const active = getActiveUser();
  const users = getLocalUsers();
  const index = users.findIndex(u => u.id === active.id);

  const updatedUser = {
    ...active,
    ...updates,
  };

  if (index !== -1) {
    users[index] = updatedUser;
    saveLocalUsers(users);
  }

  if (supabase) {
    try {
      await supabase.from('profiles').update(updates).eq('id', active.id);
    } catch (e) {
      // ignore
    }
  }

  setActiveUser(updatedUser.id);
  return updatedUser;
}

export async function apiGetMessages(otherUserId: string): Promise<ChatMessage[]> {
  const active = getActiveUser();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_id.eq.${active.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${active.id})`)
        .order('created_at', { ascending: true });

      if (!error && data) {
        return data as ChatMessage[];
      }
    } catch (e) {
      // ignore
    }
  }

  const allMessages = getLocalMessages();
  return allMessages.filter(
    m => (m.sender_id === active.id && m.recipient_id === otherUserId) ||
         (m.sender_id === otherUserId && m.recipient_id === active.id)
  ).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export async function apiSendMessage(recipientId: string, content: string): Promise<ChatMessage> {
  const active = getActiveUser();
  const trimmed = content.trim();
  const id_xion = generateIDXion();
  const convId = [active.id, recipientId].sort().join('_');

  if (supabase) {
    try {
      const { data, error } = await supabase.from('messages').insert([
        {
          conversation_id: convId,
          sender_id: active.id,
          recipient_id: recipientId,
          content: trimmed,
          id_xion,
          is_read: false,
        }
      ]).select().single();

      if (!error && data) {
        return data as ChatMessage;
      }
    } catch (e) {
      // ignore
    }
  }

  const newMsg: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    conversation_id: convId,
    sender_id: active.id,
    recipient_id: recipientId,
    content: trimmed,
    created_at: new Date().toISOString(),
    is_read: false,
    id_xion,
  };

  const messages = getLocalMessages();
  messages.push(newMsg);
  saveLocalMessages(messages);

  broadcastLocalEvent(`chat_${convId}`, newMsg);
  broadcastLocalEvent('global_chat_message', newMsg);
  return newMsg;
}

export function saveCustomSupabaseConfig(url: string, key: string) {
  localStorage.setItem('vibe_supabase_url', url.trim());
  localStorage.setItem('vibe_supabase_key', key.trim());
  window.location.reload();
}

export function clearCustomSupabaseConfig() {
  localStorage.removeItem('vibe_supabase_url');
  localStorage.removeItem('vibe_supabase_key');
  window.location.reload();
}

/**
 * Returns the SQL Schema creation script for Supabase Database Setup
 */
export function getSupabaseSQLScript(): string {
  return `-- ==========================================
-- SCRIPT DE INICIALIZACIÓN SUPABASE PARA VIBE
-- Copia y pega este código en el Editor SQL de tu proyecto Supabase
-- ==========================================

-- 1. Crear tabla de perfiles de usuario
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  bio TEXT,
  id_xion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Crear tabla de publicaciones (Posts)
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content VARCHAR(280) NOT NULL,
  likes_count INT DEFAULT 0,
  id_xion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Crear tabla de comentarios (Soporta comentarios anidados con parent_id)
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes_count INT DEFAULT 0,
  id_xion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Crear tabla de me gusta (Likes)
CREATE TABLE IF NOT EXISTS public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_post_like UNIQUE (user_id, post_id),
  CONSTRAINT unique_comment_like UNIQUE (user_id, comment_id)
);

-- 5. Crear tabla de mensajes de chat 1 a 1
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  id_xion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Crear tabla de notificaciones
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  actor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'like', 'mention', 'message', 'comment', 'reply'
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
  message TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  id_xion TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Habilitar Seguridad de Nivel de Fila (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para perfiles, posts y comentarios
CREATE POLICY "Permitir lectura de perfiles a todos" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Permitir lectura de posts a todos" ON public.posts FOR SELECT USING (true);
CREATE POLICY "Permitir crear posts a usuarios autenticados" ON public.posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Permitir actualizar posts" ON public.posts FOR UPDATE USING (true);

CREATE POLICY "Permitir lectura de comentarios a todos" ON public.comments FOR SELECT USING (true);
CREATE POLICY "Permitir crear comentarios a autenticados" ON public.comments FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Permitir actualizar comentarios" ON public.comments FOR UPDATE USING (true);

CREATE POLICY "Permitir lectura de me gusta a todos" ON public.likes FOR SELECT USING (true);
CREATE POLICY "Permitir gestionar me gusta propios" ON public.likes FOR ALL USING (auth.uid() = user_id);

-- Políticas para mensajes de chat
CREATE POLICY "Permitir ver mensajes propios" ON public.messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Permitir enviar mensajes" ON public.messages FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Políticas para notificaciones
CREATE POLICY "Permitir ver notificaciones propias" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Permitir crear notificaciones" ON public.notifications FOR INSERT WITH CHECK (true);

-- Habilitar Supabase Realtime para eventos en tiempo real
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
`;
}
