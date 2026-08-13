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

const SEED_USERS: UserProfile[] = [
  {
    id: 'usr_1',
    email: 'sofia@vibe.app',
    username: 'sofia_design',
    display_name: 'Sofía Valenzuela',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    bio: 'Diseñadora UI/UX en VIBE. Creando islas y experiencias minimalistas ✨',
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    id_xion: generateIDXion(),
    followers_count: 142,
    following_count: 89,
  },
  {
    id: 'usr_2',
    email: 'lucas@vibe.app',
    username: 'lucas_code',
    display_name: 'Lucas Martínez',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    bio: 'Desarrollador React & Supabase. Apasionado del tiempo real ⚡️',
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    id_xion: generateIDXion(),
    followers_count: 98,
    following_count: 45,
  },
  {
    id: 'usr_3',
    email: 'elena@vibe.app',
    username: 'elena_music',
    display_name: 'Elena Silva',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    bio: 'Productora musical & sound designer. Vibras de baja frecuencia 🎧',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    id_xion: generateIDXion(),
    followers_count: 230,
    following_count: 112,
  },
  {
    id: 'usr_4',
    email: 'mateo@vibe.app',
    username: 'mateo_vibe',
    display_name: 'Mateo Rojas',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    bio: 'Explorando la arquitectura de islas flotantes. ¡Hola VIBE!',
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    id_xion: generateIDXion(),
    followers_count: 56,
    following_count: 30,
  }
];

const SEED_POSTS: Post[] = [
  {
    id: 'pst_1',
    author_id: 'usr_1',
    author: SEED_USERS[0],
    content: '¡Bienvenidos a VIBE! 🎉 Un nuevo paradigma donde cada función es su propia isla flotante. Sin barras rígidas, sin distracciones.',
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likes_count: 24,
    is_liked: true,
    comments_count: 3,
    id_xion: generateIDXion(),
  },
  {
    id: 'pst_2',
    author_id: 'usr_2',
    author: SEED_USERS[1],
    content: 'Probando la transmisión en tiempo real con Supabase Realtime en los chats 1 a 1. La velocidad de respuesta es impresionante ⚡️ #VIBE #Dev',
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    likes_count: 18,
    is_liked: false,
    comments_count: 1,
    id_xion: generateIDXion(),
  },
  {
    id: 'pst_3',
    author_id: 'usr_3',
    author: SEED_USERS[2],
    content: 'Componiendo una nueva pista synthwave inspirada en interfaces limpias y tarjetas flotantes. ¿A alguien le gustaría escuchar un adelanto?',
    created_at: new Date(Date.now() - 1000 * 60 * 300).toISOString(),
    likes_count: 42,
    is_liked: true,
    comments_count: 7,
    id_xion: generateIDXion(),
  }
];

const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    conversation_id: 'conv_1_2',
    sender_id: 'usr_2',
    recipient_id: 'usr_1',
    content: '¡Hola Sofía! ¿Qué tal va el diseño de la isla de chats?',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    is_read: true,
    id_xion: generateIDXion(),
  },
  {
    id: 'msg_2',
    conversation_id: 'conv_1_2',
    sender_id: 'usr_1',
    recipient_id: 'usr_2',
    content: '¡Hola Lucas! Quedó increíble, con animaciones de expansión suaves y mensajería en tiempo real.',
    created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    is_read: true,
    id_xion: generateIDXion(),
  }
];

const SEED_COMMENTS: PostComment[] = [
  {
    id: 'cmt_1',
    post_id: 'pst_1',
    parent_id: null,
    author_id: 'usr_2',
    author: SEED_USERS[1],
    content: '¡Me encanta el diseño de las islas flotantes @sofia_design! Muy innovador.',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    likes_count: 5,
    is_liked: true,
    id_xion: generateIDXion(),
  },
  {
    id: 'cmt_2',
    post_id: 'pst_1',
    parent_id: 'cmt_1',
    author_id: 'usr_1',
    author: SEED_USERS[0],
    content: '¡Gracias @lucas_code! Diseñar sin barras estáticas fue el mayor reto.',
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    likes_count: 3,
    is_liked: false,
    id_xion: generateIDXion(),
  },
  {
    id: 'cmt_3',
    post_id: 'pst_3',
    parent_id: null,
    author_id: 'usr_4',
    author: SEED_USERS[3],
    content: '¡Me apunto a escuchar ese adelanto synthwave @elena_music! 🎧',
    created_at: new Date(Date.now() - 1000 * 60 * 200).toISOString(),
    likes_count: 8,
    is_liked: true,
    id_xion: generateIDXion(),
  }
];

// Local state helpers with persistence
function getLocalUsers(): UserProfile[] {
  const stored = localStorage.getItem('vibe_demo_users');
  if (!stored) {
    localStorage.setItem('vibe_demo_users', JSON.stringify(SEED_USERS));
    return SEED_USERS;
  }
  return JSON.parse(stored);
}

function saveLocalUsers(users: UserProfile[]) {
  localStorage.setItem('vibe_demo_users', JSON.stringify(users));
}

function getLocalComments(): PostComment[] {
  const stored = localStorage.getItem('vibe_demo_comments');
  if (!stored) {
    localStorage.setItem('vibe_demo_comments', JSON.stringify(SEED_COMMENTS));
    return SEED_COMMENTS;
  }
  return JSON.parse(stored);
}

function saveLocalComments(comments: PostComment[]) {
  localStorage.setItem('vibe_demo_comments', JSON.stringify(comments));
}

function getLocalPosts(): Post[] {
  const stored = localStorage.getItem('vibe_demo_posts');
  if (!stored) {
    localStorage.setItem('vibe_demo_posts', JSON.stringify(SEED_POSTS));
    return SEED_POSTS;
  }
  return JSON.parse(stored);
}

function saveLocalPosts(posts: Post[]) {
  localStorage.setItem('vibe_demo_posts', JSON.stringify(posts));
}

function getLocalMessages(): ChatMessage[] {
  const stored = localStorage.getItem('vibe_demo_messages');
  if (!stored) {
    localStorage.setItem('vibe_demo_messages', JSON.stringify(SEED_MESSAGES));
    return SEED_MESSAGES;
  }
  return JSON.parse(stored);
}

function saveLocalMessages(messages: ChatMessage[]) {
  localStorage.setItem('vibe_demo_messages', JSON.stringify(messages));
}

export function getActiveUser(): UserProfile {
  const users = getLocalUsers();
  const activeId = localStorage.getItem('vibe_active_user_id') || users[0].id;
  const found = users.find(u => u.id === activeId);
  return found || users[0];
}

export function setActiveUser(userId: string): UserProfile {
  localStorage.setItem('vibe_active_user_id', userId);
  const users = getLocalUsers();
  const found = users.find(u => u.id === userId) || users[0];
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
